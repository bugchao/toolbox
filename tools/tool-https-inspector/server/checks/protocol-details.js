import tls from 'tls';
import https from 'https';
import dns from 'dns/promises';

/** 纯函数：协商到的加密套件名是否属于（临时）密钥交换，即是否提供前向保密。 */
export function hasForwardSecrecy(cipherName = '') {
  return /^(ECDHE|DHE|EDH)[_-]/i.test(cipherName) || /^TLS_(AES|CHACHA20)/.test(cipherName);
}

function connectWithAlpnAndOcsp(host, port, timeout) {
  return new Promise((resolve, reject) => {
    let ocspResponse;
    let settled = false;
    const socket = tls.connect(
      { host, port, servername: host, rejectUnauthorized: false, requestOCSP: true, ALPNProtocols: ['h2', 'http/1.1'] },
      () => {
        // OCSPResponse 事件通常先于/紧随 secureConnect 触发；握手完成后再等一拍收尾
        setTimeout(() => {
          if (settled) return;
          settled = true;
          const alpnProtocol = socket.alpnProtocol;
          socket.destroy();
          resolve({ alpnProtocol, ocspStapled: Boolean(ocspResponse && ocspResponse.length > 0) });
        }, 50);
      },
    );
    socket.on('OCSPResponse', (resp) => {
      ocspResponse = resp;
    });
    const timer = setTimeout(() => {
      socket.destroy();
      reject(new Error('连接超时'));
    }, timeout);
    socket.once('secureConnect', () => clearTimeout(timer));
    socket.once('error', (err) => {
      clearTimeout(timer);
      if (!settled) reject(err);
    });
  });
}

function fetchHstsHeader(host, timeout) {
  return new Promise((resolve) => {
    const req = https.request(
      { host, port: 443, path: '/', method: 'HEAD', rejectUnauthorized: false, timeout },
      (res) => {
        resolve(res.headers['strict-transport-security'] || null);
        res.resume();
      },
    );
    req.on('error', () => resolve(null));
    req.on('timeout', () => {
      req.destroy();
      resolve(null);
    });
    req.end();
  });
}

/**
 * 协议详情：HTTP/2(ALPN)、HSTS、OCSP 装订、CAA。
 * 正向保密不在本模块单独握手判定——复用 `checks/https.js` 已拿到的协商套件，
 * 由聚合层调用 {@link hasForwardSecrecy} 计算，避免重复连接。
 */
export async function checkProtocolDetails(host, port = 443, timeout = 8000) {
  try {
    const [alpnResult, hsts, caaRecords] = await Promise.all([
      connectWithAlpnAndOcsp(host, port, timeout),
      fetchHstsHeader(host, timeout),
      dns.resolveCaa(host).catch(() => []),
    ]);

    return {
      ok: true,
      http2: alpnResult.alpnProtocol === 'h2',
      hsts: Boolean(hsts),
      hstsHeader: hsts,
      ocspStapled: alpnResult.ocspStapled,
      caa: caaRecords.length > 0,
      caaRecords: caaRecords.map((r) => ({ critical: r.critical, issue: r.issue, issuewild: r.issuewild })),
    };
  } catch (err) {
    return { ok: false, error: err.message || '检测失败' };
  }
}
