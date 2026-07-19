import net from 'net';
import {
  probeRaw,
  parseServerHello,
  classifyProbeError,
  buildSslv2ClientHello,
  parseSslv2Response,
  buildPoodleClientHello,
  buildFreakClientHello,
  buildHeartbeatClientHello,
  buildHeartbeatRequest,
  parseHeartbeatRecord,
  evaluateHeartbeatResponse,
} from '../tls-raw.js';

const POODLE_CIPHERS = new Set([0x002f, 0x0035, 0x000a]);
const FREAK_CIPHERS = new Set([0x0003, 0x0006, 0x0008, 0x0064]);

/** DROWN：探测服务端是否仍接受 SSLv2 握手。 */
async function checkDrown(host, port, timeout) {
  try {
    const raw = await probeRawOnce(host, port, buildSslv2ClientHello(), timeout);
    const result = parseSslv2Response(raw);
    return { ok: true, vulnerable: result.type === 'sslv2_server_hello' };
  } catch (err) {
    if (classifyProbeError(err) === 'not-supported') return { ok: true, vulnerable: false };
    return { ok: false, error: err.message || '检测失败' };
  }
}

/** POODLE：SSLv3 + CBC 套件握手成功即存在风险。 */
async function checkPoodle(host, port, timeout) {
  try {
    const raw = await probeRaw(host, port, buildPoodleClientHello(), timeout);
    const hello = parseServerHello(raw);
    const vulnerable = hello.type === 'server_hello' && hello.version === 0x0300 && POODLE_CIPHERS.has(hello.cipherSuite);
    return { ok: true, vulnerable };
  } catch (err) {
    if (classifyProbeError(err) === 'not-supported') return { ok: true, vulnerable: false };
    return { ok: false, error: err.message || '检测失败' };
  }
}

/** FREAK：服务端选中 EXPORT 级弱套件即存在降级风险。 */
async function checkFreak(host, port, timeout) {
  try {
    const raw = await probeRaw(host, port, buildFreakClientHello(host), timeout);
    const hello = parseServerHello(raw);
    const vulnerable = hello.type === 'server_hello' && FREAK_CIPHERS.has(hello.cipherSuite);
    return { ok: true, vulnerable };
  } catch (err) {
    if (classifyProbeError(err) === 'not-supported') return { ok: true, vulnerable: false };
    return { ok: false, error: err.message || '检测失败' };
  }
}

/** 建立原始 TCP 连接，写入一段数据，返回第一次收到的响应字节（不做任何协议层面的完整性判断）。 */
function probeRawOnce(host, port, payload, timeout) {
  return new Promise((resolve, reject) => {
    const socket = net.connect({ host, port });
    const timer = setTimeout(() => {
      socket.destroy();
      reject(new Error('连接超时'));
    }, timeout);
    socket.on('connect', () => socket.write(payload));
    socket.once('data', (d) => {
      clearTimeout(timer);
      socket.destroy();
      resolve(d);
    });
    socket.on('error', (err) => {
      clearTimeout(timer);
      reject(err);
    });
    socket.on('end', () => {
      clearTimeout(timer);
      reject(new Error('连接被关闭'));
    });
  });
}

/**
 * Heartbleed：两步交互 —— 先完成一次基本的 ClientHello/ServerHello 交换（心跳扩展需要在
 * 已建立的连接上下文中才有意义），再发送声明长度大于真实负载的畸形心跳请求。
 * 安全边界：无论服务端是否真的泄露了内存数据，本函数都只统计声明长度差值，
 * 绝不读取/保留/返回心跳响应中的实际负载字节——调用方拿到的只有布尔值与字节数。
 */
function checkHeartbleed(host, port, timeout) {
  return new Promise((resolve) => {
    const socket = net.connect({ host, port });
    let stage = 'hello';
    let buffered = Buffer.alloc(0);
    let settled = false;

    const finish = (result) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      socket.destroy();
      resolve(result);
    };

    const timer = setTimeout(() => finish({ ok: true, vulnerable: false }), timeout);

    socket.on('connect', () => socket.write(buildHeartbeatClientHello(host)));
    socket.on('data', (chunk) => {
      buffered = Buffer.concat([buffered, chunk]);
      if (stage === 'hello') {
        const hello = parseServerHello(buffered);
        if (hello.type === 'incomplete') return; // 还没收全，继续等
        if (hello.type !== 'server_hello') return finish({ ok: true, vulnerable: false });
        stage = 'heartbeat';
        buffered = Buffer.alloc(0);
        socket.write(buildHeartbeatRequest(1, 16384));
        return;
      }
      // stage === 'heartbeat'
      const record = parseHeartbeatRecord(buffered);
      if (!record) return; // 可能还没收全，或者不是心跳响应（如 alert）——继续等直到超时
      const { vulnerable, leakedBytes } = evaluateHeartbeatResponse(1, record.declaredLen);
      buffered = Buffer.alloc(0); // 立即丢弃，绝不保留任何真实响应字节
      finish({ ok: true, vulnerable, leakedBytes });
    });
    socket.on('error', (err) => {
      if (classifyProbeError(err) === 'not-supported') return finish({ ok: true, vulnerable: false });
      finish({ ok: false, error: err.message || '检测失败' });
    });
    socket.on('end', () => finish({ ok: true, vulnerable: false }));
  });
}

/**
 * SSL 漏洞检测：主动探测 DROWN/POODLE/FREAK/Heartbleed，均为只读、非破坏性、
 * 不发送超出判定所需的最小请求量。CCS 注入与 ROBOT 因可靠探测成本过高、易生成
 * 误报，明确标注为未实现，不返回猜测性结论。
 */
export async function checkVulnerabilities(host, port = 443, timeout = 8000) {
  const [drown, poodle, freak, heartbleed] = await Promise.all([
    checkDrown(host, port, timeout),
    checkPoodle(host, port, timeout),
    checkFreak(host, port, timeout),
    checkHeartbleed(host, port, timeout),
  ]);

  return {
    ok: true,
    drown,
    poodle,
    freak,
    heartbleed,
    ccsInjection: { ok: true, notSupported: true, reason: '精确探测需要复杂的协议状态注入时机，本工具暂不支持，避免误报' },
    robot: { ok: true, notSupported: true, reason: '精确探测需要多次畸形 RSA 密钥交换与计时/报错侧信道分析，本工具暂不支持，避免误报' },
  };
}
