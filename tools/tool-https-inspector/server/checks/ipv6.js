import dns from 'dns/promises';
import tls from 'tls';

function tlsHandshakeV6(address, host, port, timeout) {
  return new Promise((resolve) => {
    const socket = tls.connect(
      { host: address, port, servername: host, rejectUnauthorized: false },
      () => {
        socket.destroy();
        resolve(true);
      },
    );
    const timer = setTimeout(() => {
      socket.destroy();
      resolve(false);
    }, timeout);
    socket.once('secureConnect', () => clearTimeout(timer));
    socket.once('error', () => {
      clearTimeout(timer);
      resolve(false);
    });
  });
}

/** IPv6 检测：查 AAAA，有则尝试 IPv6 下 HTTPS 握手判断可用性。 */
export async function checkIpv6(host, port = 443, timeout = 8000) {
  try {
    let addresses = [];
    try {
      addresses = await dns.resolve6(host);
    } catch {
      addresses = [];
    }

    if (addresses.length === 0) {
      return { ok: true, deployed: false, addresses: [], httpsReachable: false };
    }

    const httpsReachable = await tlsHandshakeV6(addresses[0], host, port, timeout);
    return { ok: true, deployed: true, addresses, httpsReachable };
  } catch (err) {
    return { ok: false, error: err.message || '检测失败' };
  }
}
