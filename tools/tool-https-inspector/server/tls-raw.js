import net from 'net';
import crypto from 'crypto';

// 手写 TLS/TLCP 报文：Node 标准库不支持国密(SM2)套件与后量子(ML-KEM)混合组，
// 只能自行构造 ClientHello 并解析 ServerHello，得出「支持/不支持」级别结论。

const u16 = (n) => Buffer.from([(n >> 8) & 0xff, n & 0xff]);
const u24 = (n) => Buffer.from([(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff]);

// TLS 1.3 HelloRetryRequest 的固定 random 值（RFC 8446 §4.1.3）
const HRR_RANDOM = Buffer.from(
  'cf21ad74e59a6111be1d8c021e65b891c2a2116717abb8c5e079e09e2c8a8339',
  'hex',
);

/** server_name(SNI) 扩展 */
function sniExtension(host) {
  const name = Buffer.from(host, 'ascii');
  const entry = Buffer.concat([Buffer.from([0x00]), u16(name.length), name]);
  const list = Buffer.concat([u16(entry.length), entry]);
  return Buffer.concat([u16(0x0000), u16(list.length), list]);
}

/** 通用扩展封装 */
function extension(type, data) {
  return Buffer.concat([u16(type), u16(data.length), data]);
}

/**
 * 构造完整的 ClientHello 记录。
 * @param {{recordVersion:number, clientVersion:number, cipherSuites:number[], extensions:Buffer[]}} opts
 */
export function buildClientHello({ recordVersion, clientVersion, cipherSuites, extensions = [] }) {
  const random = crypto.randomBytes(32);
  const sessionId = Buffer.from([0x00]); // 空 session id
  const suites = Buffer.concat(cipherSuites.map(u16));
  const suitesBlock = Buffer.concat([u16(suites.length), suites]);
  const compression = Buffer.from([0x01, 0x00]); // null 压缩
  const extData = Buffer.concat(extensions);
  const extBlock = extensions.length ? Buffer.concat([u16(extData.length), extData]) : Buffer.alloc(0);

  const body = Buffer.concat([u16(clientVersion), random, sessionId, suitesBlock, compression, extBlock]);
  const handshake = Buffer.concat([Buffer.from([0x01]), u24(body.length), body]);
  return Buffer.concat([Buffer.from([0x16]), u16(recordVersion), u16(handshake.length), handshake]);
}

/** 国密 TLCP ClientHello（version 0x0101，携带 SM2 系列套件） */
export function buildGmClientHello(host) {
  return buildClientHello({
    recordVersion: 0x0101,
    clientVersion: 0x0101,
    // ECDHE_SM4_CBC_SM3, ECC_SM4_CBC_SM3, ECDHE_SM4_GCM_SM3, ECC_SM4_GCM_SM3
    cipherSuites: [0xe011, 0xe013, 0xe019, 0xe015],
    extensions: [sniExtension(host)],
  });
}

/** 后量子 TLS 1.3 ClientHello（supported_groups/key_share 携带 X25519MLKEM768=0x11ec） */
export function buildPqcClientHello(host) {
  // supported_versions: 仅 TLS 1.3
  const supportedVersions = extension(0x002b, Buffer.concat([Buffer.from([0x02]), u16(0x0304)]));
  // supported_groups: X25519MLKEM768, x25519, secp256r1
  const groups = Buffer.concat([0x11ec, 0x001d, 0x0017].map(u16));
  const supportedGroups = extension(0x000a, Buffer.concat([u16(groups.length), groups]));
  // signature_algorithms（TLS 1.3 必需）
  const sigAlgs = Buffer.concat([0x0403, 0x0804, 0x0401, 0x0503, 0x0805, 0x0201].map(u16));
  const signatureAlgorithms = extension(0x000d, Buffer.concat([u16(sigAlgs.length), sigAlgs]));
  // key_share: 只带 x25519 的 32 字节公钥；若服务端偏好 MLKEM 会回 HelloRetryRequest 索要 0x11ec
  const x25519Key = crypto.randomBytes(32);
  const share = Buffer.concat([u16(0x001d), u16(x25519Key.length), x25519Key]);
  const keyShare = extension(0x0033, Buffer.concat([u16(share.length), share]));

  return buildClientHello({
    recordVersion: 0x0301,
    clientVersion: 0x0303,
    cipherSuites: [0x1301, 0x1302, 0x1303], // TLS_AES_128_GCM_SHA256 等
    extensions: [sniExtension(host), supportedVersions, supportedGroups, signatureAlgorithms, keyShare],
  });
}

/**
 * 解析服务端返回的字节流，取第一条 ServerHello 或 Alert。
 * @param {Buffer} buf
 * @returns {{type:'server_hello'|'alert'|'incomplete', ...}}
 */
export function parseServerHello(buf) {
  let offset = 0;
  while (offset + 5 <= buf.length) {
    const recordType = buf[offset];
    const len = buf.readUInt16BE(offset + 3);
    const payload = buf.subarray(offset + 5, offset + 5 + len);

    if (recordType === 0x15) {
      return { type: 'alert', level: payload[0], description: payload[1] };
    }
    if (recordType === 0x16 && payload[0] === 0x02) {
      return parseServerHelloBody(payload);
    }
    offset += 5 + len;
  }
  return { type: 'incomplete' };
}

function parseServerHelloBody(payload) {
  const bodyLen = (payload[1] << 16) | (payload[2] << 8) | payload[3];
  const body = payload.subarray(4, 4 + bodyLen);
  let p = 0;
  const version = body.readUInt16BE(p); p += 2;
  const random = body.subarray(p, p + 32); p += 32;
  const isHRR = random.equals(HRR_RANDOM);
  const sidLen = body[p]; p += 1; p += sidLen;
  const cipherSuite = body.readUInt16BE(p); p += 2;
  p += 1; // compression method

  let selectedGroup = null;
  let supportedVersion = null;
  if (p + 2 <= body.length) {
    const extLen = body.readUInt16BE(p); p += 2;
    const extEnd = Math.min(p + extLen, body.length);
    while (p + 4 <= extEnd) {
      const etype = body.readUInt16BE(p); p += 2;
      const elen = body.readUInt16BE(p); p += 2;
      const edata = body.subarray(p, p + elen); p += elen;
      if (etype === 0x0033 && edata.length >= 2) selectedGroup = edata.readUInt16BE(0);
      else if (etype === 0x002b && edata.length >= 2) supportedVersion = edata.readUInt16BE(0);
    }
  }
  return { type: 'server_hello', isHRR, version, cipherSuite, selectedGroup, supportedVersion };
}

/**
 * 建立原始 TCP 连接，发送 ClientHello，收集响应直到拿到 ServerHello/Alert 或超时。
 * @returns {Promise<Buffer>} 服务端返回的原始字节
 */
export function probeRaw(host, port, clientHello, timeout = 8000) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    const socket = net.connect({ host, port });
    const timer = setTimeout(() => {
      socket.destroy();
      chunks.length ? resolve(Buffer.concat(chunks)) : reject(new Error('连接超时'));
    }, timeout);

    socket.on('connect', () => socket.write(clientHello));
    socket.on('data', (d) => {
      chunks.push(d);
      const buf = Buffer.concat(chunks);
      // 拿到一条完整的 ServerHello/Alert 记录即可停止
      const parsed = parseServerHello(buf);
      if (parsed.type !== 'incomplete') {
        clearTimeout(timer);
        socket.destroy();
        resolve(buf);
      }
    });
    socket.on('error', (err) => {
      clearTimeout(timer);
      chunks.length ? resolve(Buffer.concat(chunks)) : reject(err);
    });
    socket.on('end', () => {
      clearTimeout(timer);
      chunks.length ? resolve(Buffer.concat(chunks)) : reject(new Error('连接被关闭'));
    });
  });
}

export const GM_CIPHER_NAMES = {
  0xe011: 'ECDHE_SM4_CBC_SM3',
  0xe013: 'ECC_SM4_CBC_SM3',
  0xe019: 'ECDHE_SM4_GCM_SM3',
  0xe015: 'ECC_SM4_GCM_SM3',
};

/** 判断某个 cipher suite 是否属于国密范围（0xe0xx） */
export function isGmCipher(suite) {
  return suite != null && (suite & 0xff00) === 0xe000;
}

export const PQC_GROUP_NAMES = {
  0x11ec: 'X25519MLKEM768',
  0x6399: 'X25519Kyber768Draft00',
};

/** 判断某个 named group 是否属于后量子混合组 */
export function isPqcGroup(group) {
  return group === 0x11ec || group === 0x6399;
}

/**
 * 探测错误分类：服务端收到我们的 ClientHello 后主动重置连接（RST/EPIPE/关闭），
 * 属于「不支持该协议」的正常信号；而超时、DNS 失败、拒绝连接则是无法判定的真实错误。
 * @returns {'not-supported'|'error'}
 */
export function classifyProbeError(err) {
  const code = err?.code || '';
  const msg = err?.message || '';
  if (code === 'ECONNRESET' || code === 'EPIPE' || /reset|被关闭|closed/i.test(msg)) {
    return 'not-supported';
  }
  return 'error';
}

// ---- SSL 漏洞主动探测：只读、非破坏性，构造/解析与业务逻辑分离 ----

/** SSLv2 ClientHello（DROWN 检测用）。SSLv2 报文格式与 TLS 完全不同，独立实现。 */
export function buildSslv2ClientHello() {
  const cipherSpecs = Buffer.concat(
    [0x010080, 0x020080, 0x030080, 0x040080, 0x050080, 0x060040, 0x0700c0].map(
      (spec) => Buffer.from([(spec >> 16) & 0xff, (spec >> 8) & 0xff, spec & 0xff]),
    ),
  );
  const challenge = crypto.randomBytes(16);
  const body = Buffer.concat([
    Buffer.from([0x01]), // MSG-CLIENT-HELLO
    u16(0x0002), // SSLv2 version
    u16(cipherSpecs.length),
    u16(0), // session-id-length
    u16(challenge.length),
    cipherSpecs,
    challenge,
  ]);
  const lengthField = 0x8000 | body.length; // 高位置 1 表示无 padding 的 2 字节长度
  return Buffer.concat([u16(lengthField), body]);
}

/** 纯函数：解析 SSLv2 格式响应的首个记录，判断服务端是否用 SSLv2 应答（DROWN 风险信号）。 */
export function parseSslv2Response(buf) {
  if (buf.length < 3) return { type: 'incomplete' };
  if ((buf[0] & 0x80) === 0) return { type: 'not_sslv2' }; // 高位为 0：不是 SSLv2 无填充记录格式（如普通 TLS alert）
  const msgType = buf[2];
  return msgType === 0x04 ? { type: 'sslv2_server_hello' } : { type: 'sslv2_other', msgType };
}

/** POODLE 检测：record version 0x0300（SSLv3）+ 仅提供 CBC 套件。SSLv3 不支持扩展，不带 SNI。 */
export function buildPoodleClientHello() {
  return buildClientHello({
    recordVersion: 0x0300,
    clientVersion: 0x0300,
    // TLS_RSA_WITH_AES_128_CBC_SHA, TLS_RSA_WITH_AES_256_CBC_SHA, TLS_RSA_WITH_3DES_EDE_CBC_SHA
    cipherSuites: [0x002f, 0x0035, 0x000a],
    extensions: [],
  });
}

/** FREAK 检测：仅提供 EXPORT 级弱 RSA 套件，服务端选中即存在降级风险。 */
export function buildFreakClientHello(host) {
  return buildClientHello({
    recordVersion: 0x0301,
    clientVersion: 0x0301,
    // TLS_RSA_EXPORT_WITH_RC4_40_MD5, _WITH_RC2_CBC_40_MD5, _WITH_DES40_CBC_SHA, EXPORT1024_WITH_RC4_56_SHA
    cipherSuites: [0x0003, 0x0006, 0x0008, 0x0064],
    extensions: [sniExtension(host)],
  });
}

/** 携带 heartbeat 扩展(0x000f)的普通 ClientHello，用于 Heartbleed 探测的第一步握手。 */
export function buildHeartbeatClientHello(host) {
  const heartbeatExt = extension(0x000f, Buffer.from([0x01])); // mode = peer_allowed_to_send
  return buildClientHello({
    recordVersion: 0x0301,
    clientVersion: 0x0303,
    cipherSuites: [0xc02f, 0xc030, 0x009c, 0x009d, 0x002f, 0x0035],
    extensions: [sniExtension(host), heartbeatExt],
  });
}

/**
 * 构造畸形 Heartbeat 请求：真实负载只有 `realPayloadLen` 字节，但在 payload_length
 * 字段里声明 `declaredPayloadLen`（更大的谎报值）。存在 Heartbleed 的服务端会按声明值
 * 从堆内存里多读数据回传。
 */
export function buildHeartbeatRequest(realPayloadLen, declaredPayloadLen) {
  const payload = Buffer.alloc(realPayloadLen, 0x41);
  const padding = Buffer.alloc(16, 0x00); // RFC 6520 要求至少 16 字节 padding
  const message = Buffer.concat([Buffer.from([0x01]), u16(declaredPayloadLen), payload, padding]);
  return Buffer.concat([Buffer.from([0x18]), u16(0x0301), u16(message.length), message]);
}

/**
 * 纯函数：解析响应记录里 Heartbeat 消息自身声明的 payload_length，与我们真实发送的长度比较。
 * 服务端若诚实实现，只会回声我们真实发送的字节数；声明值更大 = 从内存里多读了 = 存在漏洞。
 */
export function evaluateHeartbeatResponse(sentPayloadLen, responseDeclaredLen) {
  const vulnerable = responseDeclaredLen > sentPayloadLen;
  return { vulnerable, leakedBytes: vulnerable ? responseDeclaredLen - sentPayloadLen : 0 };
}

/** 从一条 Heartbeat 响应记录（content-type 0x18）中提取其内部声明的 payload_length，非法/非心跳记录返回 null。 */
export function parseHeartbeatRecord(buf) {
  if (buf.length < 8 || buf[0] !== 0x18) return null;
  const recordLen = buf.readUInt16BE(3);
  if (buf.length < 5 + recordLen || recordLen < 3) return null;
  const msgType = buf[5];
  if (msgType !== 0x02) return null; // 非 heartbeat_response
  const declaredLen = buf.readUInt16BE(6);
  return { declaredLen };
}
