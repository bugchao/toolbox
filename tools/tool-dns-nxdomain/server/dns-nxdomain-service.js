import dns from 'dns';
import { promisify } from 'util';

const resolve4 = promisify(dns.resolve4);
const resolve6 = promisify(dns.resolve6);
const resolveCname = promisify(dns.resolveCname);

/**
 * 检测域名是否存在（NXDOMAIN 检测）
 * @param {string} domain - 域名
 * @returns {Promise<Object>} 检测结果
 */
export async function checkNxdomain(domain) {
  if (!domain || typeof domain !== 'string') {
    throw new Error('Invalid domain');
  }

  const cleanDomain = domain.trim().toLowerCase();
  
  if (!cleanDomain) {
    throw new Error('Domain is required');
  }

  const startTime = Date.now();
  let exists = false;
  let nxdomain = false;
  let errorCode = null;
  let errorMessage = null;
  const suggestions = [];

  try {
    // 尝试多种 DNS 查询来确定域名是否存在
    const queries = [
      resolve4(cleanDomain).then(() => true).catch(e => e),
      resolve6(cleanDomain).then(() => true).catch(e => e),
      resolveCname(cleanDomain).then(() => true).catch(e => e)
    ];

    const results = await Promise.all(queries);
    
    // 如果任何一个查询成功，域名存在
    exists = results.some(r => r === true);

    if (!exists) {
      // 检查错误类型
      const errors = results.filter(r => r !== true);
      const firstError = errors[0];

      if (firstError && firstError.code) {
        errorCode = firstError.code;

        if (firstError.code === 'ENOTFOUND') {
          nxdomain = true;
          errorMessage = 'Domain not found (NXDOMAIN)';
          
          // 提供可能的原因
          suggestions.push('域名可能未注册');
          suggestions.push('域名拼写可能有误');
          suggestions.push('DNS 记录可能未配置');
          
          // 检查是否是子域名
          if (cleanDomain.split('.').length > 2) {
            suggestions.push('子域名可能不存在，请检查主域名');
          }
        } else if (firstError.code === 'ENODATA') {
          // 域名存在但没有 A/AAAA/CNAME 记录
          exists = true;
          errorMessage = 'Domain exists but has no A/AAAA/CNAME records';
          suggestions.push('域名存在但可能只有 MX、TXT 或其他类型的记录');
        } else if (firstError.code === 'ETIMEOUT') {
          errorMessage = 'DNS query timeout';
          suggestions.push('DNS 服务器响应超时');
          suggestions.push('网络连接可能存在问题');
        } else if (firstError.code === 'ESERVFAIL') {
          errorMessage = 'DNS server failure';
          suggestions.push('DNS 服务器返回错误');
          suggestions.push('可能是 DNS 服务器配置问题');
        } else {
          errorMessage = firstError.message || 'DNS query failed';
        }
      }
    }

    return {
      domain: cleanDomain,
      exists: exists,
      nxdomain: nxdomain,
      errorCode: errorCode,
      errorMessage: errorMessage,
      responseTime: Date.now() - startTime,
      timestamp: new Date().toISOString(),
      dnsServers: dns.getServers(),
      suggestions: suggestions.length > 0 ? suggestions : undefined
    };
  } catch (error) {
    return {
      domain: cleanDomain,
      exists: false,
      nxdomain: false,
      errorCode: error.code || 'UNKNOWN',
      errorMessage: error.message || 'Query failed',
      responseTime: Date.now() - startTime,
      timestamp: new Date().toISOString(),
      dnsServers: dns.getServers(),
      suggestions: ['查询过程中发生未知错误']
    };
  }
}
