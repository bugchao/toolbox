import dns from 'dns';
import { promisify } from 'util';
import net from 'net';

const resolveMx = promisify(dns.resolveMx);
const resolve4 = promisify(dns.resolve4);
const resolve6 = promisify(dns.resolve6);

/**
 * 检测端口连通性
 * @param {string} host - 主机名或 IP
 * @param {number} port - 端口号
 * @param {number} timeout - 超时时间（毫秒）
 * @returns {Promise<boolean>} 是否可达
 */
function checkPort(host, port, timeout = 3000) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    
    socket.setTimeout(timeout);
    
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    
    socket.on('error', () => {
      resolve(false);
    });
    
    socket.connect(port, host);
  });
}

/**
 * 查询 MX 记录
 * @param {string} domain - 域名
 * @returns {Promise<Object>} MX 记录结果
 */
export async function queryMxRecords(domain) {
  if (!domain || typeof domain !== 'string') {
    throw new Error('Invalid domain');
  }

  const cleanDomain = domain.trim().toLowerCase();
  
  if (!cleanDomain) {
    throw new Error('Domain is required');
  }

  const startTime = Date.now();
  const suggestions = [];

  try {
    // 查询 MX 记录
    const mxRecords = await resolveMx(cleanDomain);
    
    if (!mxRecords || mxRecords.length === 0) {
      return {
        domain: cleanDomain,
        mxRecords: [],
        hasMx: false,
        timestamp: new Date().toISOString(),
        suggestions: [
          '该域名未配置 MX 记录',
          '如需接收邮件，请添加 MX 记录',
          '可以使用第三方邮件服务（如 Gmail、Outlook）'
        ]
      };
    }

    // 按优先级排序
    mxRecords.sort((a, b) => a.priority - b.priority);

    // 查询每个 MX 记录的 IP 地址
    const enrichedRecords = await Promise.all(
      mxRecords.map(async (mx) => {
        const recordStartTime = Date.now();
        const ips = [];
        let reachable = undefined;

        try {
          // 查询 A 记录
          const ipv4 = await resolve4(mx.exchange).catch(() => []);
          ips.push(...ipv4);

          // 查询 AAAA 记录
          const ipv6 = await resolve6(mx.exchange).catch(() => []);
          ips.push(...ipv6);

          // 检测 SMTP 端口连通性（仅检测第一个 IP）
          if (ips.length > 0) {
            reachable = await checkPort(ips[0], 25, 2000);
          }
        } catch (error) {
          // IP 查询失败，继续处理
        }

        return {
          exchange: mx.exchange,
          priority: mx.priority,
          ips: ips.length > 0 ? ips : undefined,
          responseTime: Date.now() - recordStartTime,
          reachable: reachable
        };
      })
    );

    // 生成配置建议
    if (enrichedRecords.length === 1) {
      suggestions.push('建议配置至少 2 个 MX 记录以提高可用性');
    }

    const priorities = enrichedRecords.map(r => r.priority);
    const uniquePriorities = new Set(priorities);
    if (priorities.length !== uniquePriorities.size) {
      suggestions.push('存在相同优先级的 MX 记录，邮件服务器将随机选择');
    }

    const unreachable = enrichedRecords.filter(r => r.reachable === false);
    if (unreachable.length > 0) {
      suggestions.push(`${unreachable.length} 个邮件服务器的 SMTP 端口（25）不可达`);
    }

    return {
      domain: cleanDomain,
      mxRecords: enrichedRecords,
      hasMx: true,
      timestamp: new Date().toISOString(),
      suggestions: suggestions.length > 0 ? suggestions : undefined
    };
  } catch (error) {
    if (error.code === 'ENODATA' || error.code === 'ENOTFOUND') {
      return {
        domain: cleanDomain,
        mxRecords: [],
        hasMx: false,
        timestamp: new Date().toISOString(),
        suggestions: [
          '该域名未配置 MX 记录',
          '如需接收邮件，请添加 MX 记录'
        ]
      };
    }

    throw new Error(error.message || 'MX query failed');
  }
}
