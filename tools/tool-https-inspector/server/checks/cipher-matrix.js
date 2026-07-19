import tls from 'tls';

// 每个协议版本的候选套件（OpenSSL 命名），覆盖主流现代/传统组合，不追求穷举
const CANDIDATES = {
  tls12: [
    'ECDHE-RSA-AES128-GCM-SHA256',
    'ECDHE-RSA-AES256-GCM-SHA384',
    'ECDHE-RSA-CHACHA20-POLY1305',
    'ECDHE-ECDSA-AES128-GCM-SHA256',
    'ECDHE-ECDSA-AES256-GCM-SHA384',
    'AES128-GCM-SHA256',
    'AES256-GCM-SHA384',
    'ECDHE-RSA-AES128-SHA',
    'AES128-SHA',
    'AES256-SHA',
  ],
  tls11: ['ECDHE-RSA-AES128-SHA', 'AES128-SHA', 'AES256-SHA', 'DES-CBC3-SHA'],
  tls10: ['ECDHE-RSA-AES128-SHA', 'AES128-SHA', 'AES256-SHA', 'DES-CBC3-SHA'],
};

/** 纯函数：给定版本 key 返回候选套件名单。 */
export function buildCandidateList(versionKey) {
  return CANDIDATES[versionKey] ?? [];
}

function probeAccepts(host, port, version, cipherName, timeout) {
  return new Promise((resolve) => {
    // tls.connect 在版本+套件组合无可用密码时（如legacy协议遇上被 OpenSSL 3.x 安全等级
    // 禁用的套件）会同步抛出 "no cipher match"，必须显式 try/catch，不能只靠 'error' 事件
    let socket;
    try {
      socket = tls.connect(
        { host, port, servername: host, rejectUnauthorized: false, minVersion: version, maxVersion: version, ciphers: cipherName },
        () => {
          socket.destroy();
          resolve(true);
        },
      );
    } catch {
      resolve(false);
      return;
    }
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

async function probeVersionSuites(host, port, version, versionKey, timeout) {
  const candidates = buildCandidateList(versionKey);
  const results = await Promise.all(candidates.map((name) => probeAccepts(host, port, version, name, timeout)));
  return candidates.filter((_, i) => results[i]);
}

async function probeTls13(host, port, timeout) {
  return new Promise((resolve) => {
    let socket;
    try {
      socket = tls.connect(
        { host, port, servername: host, rejectUnauthorized: false, minVersion: 'TLSv1.3', maxVersion: 'TLSv1.3' },
        () => {
          const cipher = socket.getCipher()?.name;
          socket.destroy();
          resolve(cipher ? [cipher] : []);
        },
      );
    } catch {
      resolve(null);
      return;
    }
    const timer = setTimeout(() => {
      socket.destroy();
      resolve(null); // null = 不支持 TLS1.3 或无法判定
    }, timeout);
    socket.once('secureConnect', () => clearTimeout(timer));
    socket.once('error', () => {
      clearTimeout(timer);
      resolve(null);
    });
  });
}

/** 逐 TLS 版本枚举服务端实际接受的加密套件。 */
export async function checkCipherMatrix(host, port = 443, timeout = 5000) {
  try {
    const [tls13, tls12, tls11, tls10] = await Promise.all([
      probeTls13(host, port, timeout),
      probeVersionSuites(host, port, 'TLSv1.2', 'tls12', timeout),
      probeVersionSuites(host, port, 'TLSv1.1', 'tls11', timeout),
      probeVersionSuites(host, port, 'TLSv1', 'tls10', timeout),
    ]);

    return {
      ok: true,
      matrix: { tls13, tls12, tls11, tls10 },
      tls13Note: 'TLS 1.3 套件由运行时固定管理，无法逐个禁用探测，此处为协商到的实际套件',
    };
  } catch (err) {
    return { ok: false, error: err.message || '检测失败' };
  }
}
