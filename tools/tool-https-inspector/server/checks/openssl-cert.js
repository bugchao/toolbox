import tls from 'tls';
import { execFile } from 'node:child_process';

const OPENSSL_BIN = process.env.OPENSSL_BIN || 'openssl';

/** 运行 openssl 并把 `input` 写入其 stdin（`execFile` 的异步版本不支持 input 选项，只有同步版才支持）。 */
function runOpenssl(args, input, timeout) {
  return new Promise((resolve, reject) => {
    const child = execFile(OPENSSL_BIN, args, { timeout, maxBuffer: 4 * 1024 * 1024 }, (err, stdout, stderr) => {
      if (err) return reject(Object.assign(err, { stderr }));
      resolve(stdout);
    });
    child.stdin.on('error', () => {}); // openssl 提前退出时忽略 EPIPE
    child.stdin.end(input);
  });
}

/** 纯函数：从 `openssl x509 -text` 输出中提取签名算法/公钥信息/CT SCT 存在性。 */
export function parseOpensslCertText(text) {
  const signatureAlgorithm = text.match(/Signature Algorithm:\s*([^\n]+)/)?.[1]?.trim() ?? '';
  const publicKeyAlgorithm = text.match(/Public Key Algorithm:\s*([^\n]+)/)?.[1]?.trim() ?? '';
  const publicKeyBits = text.match(/Public-Key:\s*\((\d+)\s*bit\)/)?.[1] ?? '';
  const hasSct = /CT Precertificate SCTs|Signed Certificate Timestamp/i.test(text);
  return { signatureAlgorithm, publicKeyAlgorithm, publicKeyBits, ctCompliant: hasSct };
}

function toPem(der) {
  const b64 = der.toString('base64').match(/.{1,64}/g)?.join('\n') ?? '';
  return `-----BEGIN CERTIFICATE-----\n${b64}\n-----END CERTIFICATE-----\n`;
}

/** 沿证书链走到根证书（自签名，`issuerCertificate` 指向自身或缺失），取其 Subject O 作为“证书品牌”。 */
function findRootSubjectOrg(leafCert) {
  let current = leafCert;
  const seen = new Set();
  while (current?.issuerCertificate && !seen.has(current.fingerprint256) && current.issuerCertificate.fingerprint256 !== current.fingerprint256) {
    seen.add(current.fingerprint256);
    current = current.issuerCertificate;
  }
  return current?.subject?.O || current?.subject?.CN || '';
}

function connectAndGetChain(host, port, timeout) {
  return new Promise((resolve, reject) => {
    const socket = tls.connect({ host, port, servername: host, rejectUnauthorized: false }, () => {
      const cert = socket.getPeerCertificate(true);
      socket.destroy();
      if (!cert?.raw) return reject(new Error('无法获取证书'));
      resolve(cert);
    });
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

/** 证书扩展信息：签名算法/公钥算法位数/证书品牌（根CA）/CT 合规。依赖系统 openssl 二进制，缺失时局部降级。 */
export async function checkOpensslCert(host, port = 443, timeout = 8000) {
  try {
    const leaf = await connectAndGetChain(host, port, timeout);
    const brand = findRootSubjectOrg(leaf);
    const stdout = await runOpenssl(['x509', '-text', '-noout'], toPem(leaf.raw), timeout);
    return { ok: true, ...parseOpensslCertText(stdout), brand, revocationStatus: 'unknown' };
  } catch (err) {
    const opensslMissing = /ENOENT/.test(err.code || '') || /not found|不是内部或外部命令/i.test(err.message || '');
    return {
      ok: false,
      error: opensslMissing ? 'openssl 二进制不可用' : err.message || '检测失败',
    };
  }
}
