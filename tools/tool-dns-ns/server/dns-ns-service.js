import dns from 'dns';
import { promisify } from 'util';

const resolveDns = promisify(dns.resolve);
const resolve4 = promisify(dns.resolve4);
const resolve6 = promisify(dns.resolve6);

/**
 * 查询域名的 NS 记录及其 IP 地址
 * @param {string} domain - 域名
 * @returns {Promise<Object>} 查询结果
 */
export async function queryNsRecords(domain) {
  if (!domain || typeof domain !== 'string') {
    throw new Error('Invalid domain');
  }

  const cleanDomain = domain.trim().toLowerCase();
  
  if (!cleanDomain) {
    throw new Error('Domain is required');
  }

  try {
    const startTime = Date.now();
    
    // 查询 NS 记录
    const nsRecords = await resolveDns(cleanDomain, 'NS');
    
    // 并行查询每个 NS 的 IP 地址
    const nsWithIps = await Promise.all(
      nsRecords.map(async (nameserver) => {
        const nsStartTime = Date.now();
        const ips = [];
        let status = 'success';
        
        try {
          // 尝试查询 IPv4
          try {
            const ipv4 = await resolve4(nameserver);
            ips.push(...ipv4);
          } catch (e) {
            // IPv4 查询失败，继续尝试 IPv6
          }
          
          // 尝试查询 IPv6
          try {
            const ipv6 = await resolve6(nameserver);
            ips.push(...ipv6);
          } catch (e) {
            // IPv6 查询失败
          }
          
          if (ips.length === 0) {
            status = 'error';
          }
        } catch (error) {
          status = 'error';
        }
        
        return {
          nameserver,
          ip: ips.length > 0 ? ips : undefined,
          status,
          responseTime: Date.now() - nsStartTime
        };
      })
    );
    
    return {
      domain: cleanDomain,
      nsRecords: nsWithIps,
      timestamp: new Date().toISOString(),
      totalTime: Date.now() - startTime
    };
  } catch (error) {
    if (error.code === 'ENOTFOUND') {
      throw new Error(`Domain not found: ${cleanDomain}`);
    } else if (error.code === 'ENODATA') {
      throw new Error(`No NS records found for: ${cleanDomain}`);
    } else {
      throw new Error(error.message || 'DNS query failed');
    }
  }
}
