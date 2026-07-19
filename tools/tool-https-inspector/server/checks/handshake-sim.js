import tls from 'tls';

const MODERN_CIPHERS = 'ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-CHACHA20-POLY1305:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384';
const LEGACY_CIPHERS = 'ECDHE-RSA-AES128-SHA:ECDHE-RSA-AES256-SHA:AES128-SHA:AES256-SHA:DES-CBC3-SHA';
const JAVA8_CIPHERS = 'ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-SHA:AES128-GCM-SHA256:AES128-SHA:AES256-SHA';
const ANDROID44_CIPHERS = 'ECDHE-RSA-AES128-SHA:AES128-SHA:AES256-SHA:DES-CBC3-SHA';

// 近似客户端画像：基于各平台公开的 TLS 能力矩阵，非真实客户端库回放
export const CLIENT_PROFILES = [
  { id: 'chrome-win10', label: 'Chrome 100+ / Windows 10', minVersion: 'TLSv1.2', maxVersion: 'TLSv1.3', ciphers: MODERN_CIPHERS },
  { id: 'firefox-latest', label: 'Firefox 100+', minVersion: 'TLSv1.2', maxVersion: 'TLSv1.3', ciphers: MODERN_CIPHERS },
  { id: 'safari-macos', label: 'Safari 15 / macOS', minVersion: 'TLSv1.2', maxVersion: 'TLSv1.3', ciphers: MODERN_CIPHERS },
  { id: 'edge-chromium', label: 'Edge 100 (Chromium)', minVersion: 'TLSv1.2', maxVersion: 'TLSv1.3', ciphers: MODERN_CIPHERS },
  { id: 'ie11-win7', label: 'IE 11 / Windows 7', minVersion: 'TLSv1', maxVersion: 'TLSv1.2', ciphers: LEGACY_CIPHERS },
  { id: 'java7', label: 'Java 7', minVersion: 'TLSv1', maxVersion: 'TLSv1', ciphers: LEGACY_CIPHERS },
  { id: 'java8', label: 'Java 8', minVersion: 'TLSv1', maxVersion: 'TLSv1.2', ciphers: JAVA8_CIPHERS },
  { id: 'java11', label: 'Java 11', minVersion: 'TLSv1.2', maxVersion: 'TLSv1.3', ciphers: MODERN_CIPHERS },
  { id: 'android44', label: 'Android 4.4', minVersion: 'TLSv1', maxVersion: 'TLSv1.2', ciphers: ANDROID44_CIPHERS },
  { id: 'android7', label: 'Android 7', minVersion: 'TLSv1.2', maxVersion: 'TLSv1.2', ciphers: MODERN_CIPHERS },
  { id: 'android14', label: 'Android 14', minVersion: 'TLSv1.2', maxVersion: 'TLSv1.3', ciphers: MODERN_CIPHERS },
  { id: 'openssl101', label: 'OpenSSL 1.0.1 (legacy)', minVersion: 'TLSv1', maxVersion: 'TLSv1.2', ciphers: LEGACY_CIPHERS },
  { id: 'openssl111', label: 'OpenSSL 1.1.1', minVersion: 'TLSv1.2', maxVersion: 'TLSv1.3', ciphers: MODERN_CIPHERS },
  { id: 'googlebot', label: 'Googlebot', minVersion: 'TLSv1.2', maxVersion: 'TLSv1.3', ciphers: MODERN_CIPHERS },
];

function simulateOne(host, port, profile, timeout) {
  return new Promise((resolve) => {
    let socket;
    try {
      socket = tls.connect(
        {
          host,
          port,
          servername: host,
          rejectUnauthorized: false,
          minVersion: profile.minVersion,
          maxVersion: profile.maxVersion,
          ciphers: profile.ciphers,
        },
        () => {
          const negotiated = socket.getProtocol();
          socket.destroy();
          resolve({ id: profile.id, label: profile.label, success: true, negotiatedProtocol: negotiated });
        },
      );
    } catch {
      resolve({ id: profile.id, label: profile.label, success: false });
      return;
    }
    const timer = setTimeout(() => {
      socket.destroy();
      resolve({ id: profile.id, label: profile.label, success: false });
    }, timeout);
    socket.once('secureConnect', () => clearTimeout(timer));
    socket.once('error', () => {
      clearTimeout(timer);
      resolve({ id: profile.id, label: profile.label, success: false });
    });
  });
}

/** 客户端握手模拟：按内置画像的协议/套件优先级发起握手，判定各画像下是否成功（近似模拟）。 */
export async function checkHandshakeSim(host, port = 443, timeout = 5000) {
  try {
    const results = await Promise.all(CLIENT_PROFILES.map((profile) => simulateOne(host, port, profile, timeout)));
    return { ok: true, clients: results };
  } catch (err) {
    return { ok: false, error: err.message || '检测失败' };
  }
}
