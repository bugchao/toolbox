import dns from 'dns/promises';
import net from 'net';
import tls from 'tls';

/** 纯函数：从 EHLO 多行响应中解析服务端能力列表。 */
export function parseEhloCapabilities(response) {
  return response
    .split(/\r?\n/)
    .map((line) => line.replace(/^\d{3}[ -]/, '').trim().toUpperCase())
    .filter(Boolean);
}

/** 纯函数：能力列表里是否支持 STARTTLS。 */
export function supportsStartTls(capabilities) {
  return capabilities.some((c) => c === 'STARTTLS' || c.startsWith('STARTTLS'));
}

function smtpStartTls(mxHost, timeout) {
  return new Promise((resolve, reject) => {
    const socket = net.connect({ host: mxHost, port: 25 });
    let stage = 'banner';
    let buffer = '';
    let capabilities = [];

    const timer = setTimeout(() => {
      socket.destroy();
      reject(new Error('SMTP 连接超时'));
    }, timeout);

    const fail = (err) => {
      clearTimeout(timer);
      socket.destroy();
      reject(err instanceof Error ? err : new Error(String(err)));
    };

    socket.on('data', (chunk) => {
      buffer += chunk.toString('utf8');
      // 一条 SMTP 响应以「三位数字 + 空格」结尾行收尾
      if (!/^\d{3} /m.test(buffer.split(/\r?\n/).slice(-2).join('\n'))) return;

      if (stage === 'banner') {
        buffer = '';
        stage = 'ehlo';
        socket.write('EHLO https-inspector.local\r\n');
      } else if (stage === 'ehlo') {
        capabilities = parseEhloCapabilities(buffer);
        if (!supportsStartTls(capabilities)) {
          clearTimeout(timer);
          socket.destroy();
          resolve({ startTls: false, capabilities, cert: null });
          return;
        }
        buffer = '';
        stage = 'starttls';
        socket.write('STARTTLS\r\n');
      } else if (stage === 'starttls') {
        clearTimeout(timer);
        const secure = tls.connect(
          { socket, servername: mxHost, rejectUnauthorized: false },
          () => {
            const cert = secure.getPeerCertificate();
            secure.destroy();
            resolve({
              startTls: true,
              capabilities,
              cert: cert && cert.subject
                ? {
                    subject: cert.subject?.CN || cert.subject?.O || 'Unknown',
                    issuer: cert.issuer?.CN || cert.issuer?.O || 'Unknown',
                    validTo: cert.valid_to ? new Date(cert.valid_to).toISOString() : null,
                  }
                : null,
            });
          },
        );
        secure.once('error', fail);
      }
    });

    socket.on('error', fail);
    socket.on('end', () => fail(new Error('SMTP 连接被关闭')));
  });
}

/** 邮件服务器检测：查 MX，对首选 MX 走 SMTP + STARTTLS 读证书。 */
export async function checkMail(domain, timeout = 8000) {
  try {
    let records = [];
    try {
      records = await dns.resolveMx(domain);
    } catch {
      records = [];
    }

    if (records.length === 0) {
      return { ok: true, hasMx: false, mxHost: null };
    }

    records.sort((a, b) => a.priority - b.priority);
    const primary = records[0];
    const result = await smtpStartTls(primary.exchange, timeout);

    return {
      ok: true,
      hasMx: true,
      mxHost: primary.exchange,
      priority: primary.priority,
      mxRecords: records.map((r) => ({ exchange: r.exchange, priority: r.priority })),
      startTls: result.startTls,
      cert: result.cert,
    };
  } catch (err) {
    return { ok: false, error: err.message || '检测失败' };
  }
}
