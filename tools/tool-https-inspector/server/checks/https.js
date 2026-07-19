import tls from 'tls';

const VERSION_PROBES = [
  ['TLSv1.3', 'tls13'],
  ['TLSv1.2', 'tls12'],
  ['TLSv1.1', 'tls11'],
  ['TLSv1', 'tls10'],
];

function isAead(cipherName = '') {
  return /GCM|CHACHA20|CCM/i.test(cipherName);
}

/**
 * 纯函数：根据握手事实计算综合评级（A+~T）+ 扣分原因 + 修复建议。
 * @param {{protocols:Record<string,boolean|null>, cert:{expired:boolean,selfSigned:boolean,daysRemaining:number}, cipher:string}} facts
 */
export function computeGrade(facts) {
  const { protocols, cert, cipher } = facts;
  const reasons = [];
  const suggestions = [];

  // 信任类问题直接判 T
  if (cert.expired) {
    reasons.push('证书已过期');
    suggestions.push('立即更换有效证书');
    return { grade: 'T', reasons, suggestions };
  }
  if (cert.selfSigned) {
    reasons.push('使用自签名证书，浏览器不信任');
    suggestions.push('改用受信任 CA 颁发的证书');
    return { grade: 'T', reasons, suggestions };
  }

  // 完全没有安全协议
  if (!protocols.tls12 && !protocols.tls13) {
    reasons.push('不支持 TLS 1.2/1.3');
    suggestions.push('启用 TLS 1.2 与 TLS 1.3');
    return { grade: 'F', reasons, suggestions };
  }

  let grade = 'A';

  if (protocols.tls13 && protocols.tls12 && !protocols.tls11 && !protocols.tls10 && isAead(cipher)) {
    grade = 'A+';
  }

  if (protocols.tls10 || protocols.tls11) {
    grade = 'B';
    reasons.push('仍支持已废弃的 TLS 1.0/1.1');
    suggestions.push('关闭 TLS 1.0 与 TLS 1.1');
  }

  if (!isAead(cipher)) {
    if (grade === 'A+' || grade === 'A') grade = 'B';
    reasons.push('未使用 AEAD 加密套件');
    suggestions.push('配置 AES-GCM 或 CHACHA20-POLY1305 等 AEAD 套件');
  }

  if (!protocols.tls13) {
    if (grade === 'A+') grade = 'A';
    reasons.push('不支持 TLS 1.3');
    suggestions.push('启用 TLS 1.3 以获得更好的安全性与性能');
  }

  if (cert.daysRemaining >= 0 && cert.daysRemaining <= 30) {
    reasons.push(`证书将在 ${cert.daysRemaining} 天后过期`);
    suggestions.push('尽快续期证书');
  }

  return { grade, reasons, suggestions };
}

function connectTls(host, port, opts, timeout) {
  return new Promise((resolve, reject) => {
    const socket = tls.connect(
      { host, port, servername: host, rejectUnauthorized: false, ...opts },
      () => resolve(socket),
    );
    const timer = setTimeout(() => {
      socket.destroy();
      reject(new Error('连接超时'));
    }, timeout);
    socket.once('secureConnect', () => clearTimeout(timer));
    socket.once('error', (err) => {
      clearTimeout(timer);
      reject(err);
    });
  });
}

async function probeVersion(host, port, version, timeout) {
  try {
    const socket = await connectTls(host, port, { minVersion: version, maxVersion: version }, timeout);
    socket.destroy();
    return true;
  } catch (err) {
    // 客户端本身禁用了该协议（TLS1.0/1.1 默认禁用）→ 无法判定
    if (/unsupported protocol|no protocols available|version too low/i.test(err.message || '')) return null;
    return false;
  }
}

/** HTTPS 评级检测：证书 + 协议版本支持矩阵 + 协商套件 → 综合评级。 */
export async function checkHttps(host, port = 443, timeout = 8000) {
  try {
    const socket = await connectTls(host, port, {}, timeout);
    const cert = socket.getPeerCertificate(true);
    const negotiatedProtocol = socket.getProtocol();
    const negotiatedCipher = socket.getCipher();
    socket.destroy();

    if (!cert || !cert.subject) return { ok: false, error: '无法获取证书信息' };

    const validTo = new Date(cert.valid_to);
    const daysRemaining = Math.floor((validTo - Date.now()) / 86400000);
    const selfSigned = cert.issuer?.CN === cert.subject?.CN && cert.issuer?.O === cert.subject?.O;

    const chain = [];
    let current = cert;
    const seen = new Set();
    while (current && current.fingerprint256 && !seen.has(current.fingerprint256)) {
      seen.add(current.fingerprint256);
      chain.push({
        subject: current.subject?.CN || current.subject?.O || 'Unknown',
        issuer: current.issuer?.CN || current.issuer?.O || 'Unknown',
        validTo: new Date(current.valid_to).toISOString(),
      });
      if (!current.issuerCertificate || current.issuerCertificate === current) break;
      current = current.issuerCertificate;
    }

    const protocols = {};
    for (const [version, key] of VERSION_PROBES) {
      protocols[key] = await probeVersion(host, port, version, timeout);
    }

    const certFacts = { expired: daysRemaining < 0, selfSigned, daysRemaining };
    const { grade, reasons, suggestions } = computeGrade({
      protocols,
      cert: certFacts,
      cipher: negotiatedCipher?.name || '',
    });

    return {
      ok: true,
      grade,
      reasons,
      suggestions,
      protocols,
      negotiatedProtocol: negotiatedProtocol || 'Unknown',
      cipher: negotiatedCipher?.name || 'Unknown',
      cert: {
        subject: cert.subject || {},
        issuer: cert.issuer || {},
        validFrom: new Date(cert.valid_from).toISOString(),
        validTo: validTo.toISOString(),
        daysRemaining,
        expired: certFacts.expired,
        selfSigned,
        san: cert.subjectaltname ? cert.subjectaltname.split(', ').map((s) => s.replace(/^DNS:/, '')) : [],
        fingerprint: cert.fingerprint256 || cert.fingerprint || '',
        chain,
      },
    };
  } catch (err) {
    return { ok: false, error: err.message || '检测失败' };
  }
}
