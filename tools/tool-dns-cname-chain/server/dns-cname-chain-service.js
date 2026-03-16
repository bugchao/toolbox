import dns from 'dns';
import { promisify } from 'util';

const resolveCname = promisify(dns.resolveCname);

/**
 * 查询域名的 CNAME 链
 * @param {string} domain - 域名
 * @param {number} maxDepth - 最大递归深度
 * @returns {Promise<Object>} 查询结果
 */
export async function queryCnameChain(domain, maxDepth = 10) {
  if (!domain || typeof domain !== 'string') {
    throw new Error('Invalid domain');
  }

  const cleanDomain = domain.trim().toLowerCase();
  
  if (!cleanDomain) {
    throw new Error('Domain is required');
  }

  const chain = [];
  const visited = new Set();
  let currentDomain = cleanDomain;
  let hasLoop = false;
  let finalTarget = null;

  try {
    const startTime = Date.now();

    for (let depth = 0; depth < maxDepth; depth++) {
      // 检测循环
      if (visited.has(currentDomain)) {
        hasLoop = true;
        break;
      }

      visited.add(currentDomain);

      try {
        const cnameStartTime = Date.now();
        const cnameRecords = await resolveCname(currentDomain);
        
        if (cnameRecords && cnameRecords.length > 0) {
          const cname = cnameRecords[0];
          
          chain.push({
            domain: currentDomain,
            cname: cname,
            responseTime: Date.now() - cnameStartTime
          });

          currentDomain = cname;
        } else {
          // 没有更多 CNAME 记录
          finalTarget = currentDomain;
          break;
        }
      } catch (error) {
        if (error.code === 'ENODATA' || error.code === 'ENOTFOUND') {
          // 没有 CNAME 记录，这是正常的终止条件
          finalTarget = currentDomain;
          break;
        }
        throw error;
      }
    }

    // 如果达到最大深度但还有 CNAME，可能存在问题
    if (chain.length >= maxDepth) {
      hasLoop = true;
    }

    return {
      domain: cleanDomain,
      chain: chain,
      finalTarget: finalTarget,
      hasLoop: hasLoop,
      timestamp: new Date().toISOString(),
      totalTime: Date.now() - startTime
    };
  } catch (error) {
    if (error.code === 'ENOTFOUND') {
      throw new Error(`Domain not found: ${cleanDomain}`);
    } else if (error.code === 'ENODATA') {
      // 没有 CNAME 记录
      return {
        domain: cleanDomain,
        chain: [],
        finalTarget: cleanDomain,
        hasLoop: false,
        timestamp: new Date().toISOString(),
        totalTime: Date.now() - startTime
      };
    } else {
      throw new Error(error.message || 'DNS query failed');
    }
  }
}
