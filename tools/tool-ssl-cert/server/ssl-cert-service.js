import tls from 'tls';

/**
 * 解析证书 subject/issuer 字段
 */
function parseDN(dn) {
  const result = {};
  if (!dn) return result;
  const parts = dn.split('/');
  for (const part of parts) {
    const [key, ...rest] = part.split('=');
    if (key && rest.length) result[key.trim()] = rest.join('=').trim();
  }
  return result;
}

/**
 * 获取 SSL 证书信息
 */
export async function getSslCertInfo(domain, port = 443) {
  if (!domain) throw new Error('Domain is required');

  const cleanDomain = domain.trim().toLowerCase().replace(/^https?:\/\//, '').split('/')[0];

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      socket.destroy();
      reject(new Error('连接超时'));
    }, 8000);

    const socket = tls.connect(
      { host: cleanDomain, port, servername: cleanDomain, rejectUnauthorized: false },
      () => {
        clearTimeout(timeout);
        try {
          const cert = socket.getPeerCertificate(true);
          const protocol = socket.getProtocol();
          const cipher = socket.getCipher();

          if (!cert || !cert.subject) {
            socket.destroy();
            return reject(new Error('无法获取证书信息'));
          }

          const validFrom = new Date(cert.valid_from);
          const validTo = new Date(cert.valid_to);
          const now = new Date();
          const daysRemaining = Math.floor((validTo - now) / (1000 * 60 * 60 * 24));
          const expired = daysRemaining < 0;

          // 解析 SAN
          const san = cert.subjectaltname
            ? cert.subjectaltname.split(', ').map(s => s.replace(/^DNS:/, '').replace(/^IP Address:/, 'IP:'))
            : [];

          // 判断自签名
          const selfSigned = cert.issuer?.CN === cert.subject?.CN &&
            cert.issuer?.O === cert.subject?.O;

          // 证书链
          const chain = [];
          let current = cert;
          while (current && current.issuerCertificate && current !== current.issuerCertificate) {
            chain.push({
              subject: current.subject?.CN || current.subject?.O || 'Unknown',
              issuer: current.issuer?.CN || current.issuer?.O || 'Unknown',
              validTo: new Date(current.valid_to).toISOString(),
            });
            current = current.issuerCertificate;
          }
          // 加入根证书
          if (current) {
            chain.push({
              subject: current.subject?.CN || current.subject?.O || 'Unknown',
              issuer: current.issuer?.CN || current.issuer?.O || 'Unknown',
              validTo: new Date(current.valid_to).toISOString(),
            });
          }

          // 生成警告
          const warnings = [];
          if (expired) warnings.push('证书已过期，请立即更换');
          else if (daysRemaining <= 7) warnings.push(`证书将在 ${daysRemaining} 天后过期，请紧急续期`);
          else if (daysRemaining <= 30) warnings.push(`证书将在 ${daysRemaining} 天后过期，建议尽快续期`);
          if (selfSigned) warnings.push('使用自签名证书，浏览器将显示安全警告');
          if (protocol && ['TLSv1', 'TLSv1.1', 'SSLv3'].includes(protocol)) {
            warnings.push(`TLS 协议版本过低（${protocol}），存在安全风险`);
          }

          socket.destroy();
          resolve({
            domain: cleanDomain,
            port,
            valid: !expired,
            certInfo: {
              subject: cert.subject || {},
              issuer: cert.issuer || {},
              validFrom: validFrom.toISOString(),
              validTo: validTo.toISOString(),
              daysRemaining,
              expired,
              selfSigned,
              san,
              fingerprint: cert.fingerprint256 || cert.fingerprint || '',
              protocol: protocol || 'Unknown',
              cipher: cipher?.name || 'Unknown',
              chain,
            },
            timestamp: new Date().toISOString(),
            warnings,
          });
        } catch (err) {
          socket.destroy();
          reject(new Error(`解析证书失败: ${err.message}`));
        }
      }
    );

    socket.on('error', (err) => {
      clearTimeout(timeout);
      reject(new Error(`连接失败: ${err.message}`));
    });
  });
}
