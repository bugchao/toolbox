import net from 'net';
import dns from 'dns';
import { promisify } from 'util';

const resolve4 = promisify(dns.resolve4);

/**
 * 通过 TCP 连接模拟 Ping（尝试 80 和 443 端口）
 */
function tcpPing(host, timeout = 3000) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const socket = new net.Socket();
    let done = false;

    const tryPorts = [80, 443, 22];
    let portIndex = 0;

    function tryNext() {
      if (portIndex >= tryPorts.length) {
        return resolve({ timeout: true });
      }
      const port = tryPorts[portIndex++];
      socket.setTimeout(timeout);

      socket.connect(port, host, () => {
        if (done) return;
        done = true;
        const responseTime = Date.now() - startTime;
        socket.destroy();
        resolve({ timeout: false, responseTime });
      });

      socket.once('error', () => {
        if (done) return;
        socket.removeAllListeners();
        // 连接被拒绝也算可达（主机存在但端口关闭）
        const responseTime = Date.now() - startTime;
        if (responseTime < timeout) {
          done = true;
          resolve({ timeout: false, responseTime });
        } else {
          tryNext();
        }
      });

      socket.once('timeout', () => {
        if (done) return;
        socket.removeAllListeners();
        tryNext();
      });
    }

    tryNext();
  });
}

/**
 * 执行多次 Ping
 */
export async function pingHost(host, count = 4) {
  if (!host) throw new Error('Host is required');
  if (count < 1 || count > 10) throw new Error('Count must be between 1 and 10');

  const cleanHost = host.trim().replace(/^https?:\/\//, '').split('/')[0];

  // 解析 IP
  let resolvedIp;
  try {
    const ips = await resolve4(cleanHost);
    resolvedIp = ips[0];
  } catch {
    // 可能是 IP 直接访问
  }

  const target = resolvedIp || cleanHost;
  const records = [];

  // 串行 Ping，每次间隔 200ms
  for (let i = 1; i <= count; i++) {
    const result = await tcpPing(target);
    records.push({
      seq: i,
      responseTime: result.timeout ? undefined : result.responseTime,
      timeout: result.timeout,
    });
    if (i < count) await new Promise(r => setTimeout(r, 200));
  }

  const received = records.filter(r => !r.timeout);
  const times = received.map(r => r.responseTime).filter(Boolean);

  return {
    host: cleanHost,
    resolvedIp,
    records,
    sent: count,
    received: received.length,
    lost: count - received.length,
    lossRate: Math.round(((count - received.length) / count) * 100),
    minTime: times.length ? Math.min(...times) : undefined,
    maxTime: times.length ? Math.max(...times) : undefined,
    avgTime: times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : undefined,
    reachable: received.length > 0,
    timestamp: new Date().toISOString(),
  };
}
