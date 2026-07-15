import { checkHttps } from './checks/https.js';
import { checkIpv6 } from './checks/ipv6.js';
import { checkCdn } from './checks/cdn.js';
import { checkMail } from './checks/mail.js';
import { checkGm } from './checks/gm.js';
import { checkPqc } from './checks/pqc.js';

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

/** 聚合六大模块，任一失败局部降级，返回统一报告。 */
export async function inspectHttps(domainInput, port = 443) {
  const domain = normalizeDomain(domainInput);
  if (!domain) throw new Error('Domain is required');

  const [https, ipv6, cdn, mail, gm, pqc] = await Promise.all([
    settle(checkHttps(domain, port)),
    settle(checkIpv6(domain, port)),
    settle(checkCdn(domain)),
    settle(checkMail(domain)),
    settle(checkGm(domain, port)),
    settle(checkPqc(domain, port)),
  ]);

  return {
    domain,
    port,
    grade: https.ok ? https.grade : null,
    modules: { https, ipv6, cdn, mail, gm, pqc },
    timestamp: new Date().toISOString(),
  };
}
