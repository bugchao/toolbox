import { checkHttps } from './checks/https.js';
import { checkIpv6 } from './checks/ipv6.js';
import { checkCdn } from './checks/cdn.js';
import { checkMail } from './checks/mail.js';
import { checkGm } from './checks/gm.js';
import { checkPqc } from './checks/pqc.js';
import { checkOverview } from './checks/overview.js';
import { checkOpensslCert } from './checks/openssl-cert.js';
import { checkProtocolDetails, hasForwardSecrecy } from './checks/protocol-details.js';
import { checkCipherMatrix } from './checks/cipher-matrix.js';
import { checkVulnerabilities } from './checks/vulnerabilities.js';
import { checkHandshakeSim } from './checks/handshake-sim.js';
import { checkCertCompat } from './checks/cert-compat.js';

function normalizeDomain(input) {
  return String(input || '')
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .split('/')[0]
    .split(':')[0];
}

async function settle(promise) {
  try {
    return await promise;
  } catch (err) {
    return { ok: false, error: err.message || '检测失败' };
  }
}

/** 聚合全部检测模块，任一失败局部降级，返回统一报告。 */
export async function inspectHttps(domainInput, port = 443) {
  const domain = normalizeDomain(domainInput);
  if (!domain) throw new Error('Domain is required');

  const [https, ipv6, cdn, mail, gm, pqc, overview, opensslCert, protocolDetails, cipherMatrix, vulnerabilities, handshakeSim] =
    await Promise.all([
      settle(checkHttps(domain, port)),
      settle(checkIpv6(domain, port)),
      settle(checkCdn(domain)),
      settle(checkMail(domain)),
      settle(checkGm(domain, port)),
      settle(checkPqc(domain, port)),
      settle(checkOverview(domain, port)),
      settle(checkOpensslCert(domain, port)),
      settle(checkProtocolDetails(domain, port)),
      settle(checkCipherMatrix(domain, port)),
      settle(checkVulnerabilities(domain, port)),
      settle(checkHandshakeSim(domain, port)),
    ]);

  // 正向保密：复用 https 模块已协商的套件，避免再开一次连接
  if (protocolDetails.ok) {
    protocolDetails.forwardSecrecy = https.ok ? hasForwardSecrecy(https.cipher) : null;
  }

  // 证书兼容性推断：依赖 https（证书链）+ opensslCert（签名算法/公钥强度/根CA品牌）的输出
  const rootCA = opensslCert.ok ? opensslCert.brand : https.ok ? https.cert.chain.at(-1)?.subject : '';
  const certCompat = await settle(
    checkCertCompat({
      rootCA: rootCA || '',
      sigAlg: opensslCert.ok ? opensslCert.signatureAlgorithm : '',
      keyBits: opensslCert.ok ? opensslCert.publicKeyBits : 0,
    }),
  );

  return {
    domain,
    port,
    grade: https.ok ? https.grade : null,
    overview,
    modules: { https, ipv6, cdn, mail, gm, pqc },
    certificate: opensslCert,
    protocolDetails,
    cipherMatrix,
    vulnerabilities,
    handshakeSim,
    certCompat,
    timestamp: new Date().toISOString(),
  };
}
