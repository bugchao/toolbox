import dns from 'dns'
import { promisify } from 'util'

const resolveNs = promisify(dns.resolveNs)
const resolve4 = promisify(dns.resolve4)

// 模拟 DNS 递归解析路径
export async function traceDnsPath(domain, type = 'A') {
  const steps = []
  const parts = domain.split('.')

  // Step 1: 根服务器
  steps.push({
    level: 0,
    name: 'Root DNS',
    description: '查询根域名服务器',
    servers: ['a.root-servers.net', 'b.root-servers.net', 'c.root-servers.net'],
    query: domain,
    response: `返回 .${parts[parts.length - 1]} TLD 服务器`,
    icon: 'root',
  })

  // Step 2: TLD 服务器
  const tld = parts[parts.length - 1]
  const tldServers = {
    com: ['a.gtld-servers.net', 'b.gtld-servers.net'],
    net: ['a.gtld-servers.net', 'b.gtld-servers.net'],
    org: ['a0.org.afilias-nst.info'],
    cn: ['a.dns.cn', 'b.dns.cn'],
    io: ['a0.nic.io'],
  }
  steps.push({
    level: 1,
    name: `TLD DNS (.${tld})`,
    description: `查询顶级域 .${tld} 服务器`,
    servers: tldServers[tld] || [`ns1.nic.${tld}`],
    query: domain,
    response: '返回权威 NS 服务器',
    icon: 'tld',
  })

  // Step 3: 权威 NS
  let nsServers = []
  try {
    nsServers = await resolveNs(domain)
  } catch {
    // 尝试父域
    if (parts.length > 2) {
      try { nsServers = await resolveNs(parts.slice(1).join('.')) } catch {}
    }
  }

  steps.push({
    level: 2,
    name: '权威 DNS',
    description: `${domain} 的权威名称服务器`,
    servers: nsServers.length ? nsServers : ['unknown'],
    query: `${type} 记录查询`,
    response: '返回最终 DNS 记录',
    icon: 'authoritative',
  })

  // Step 4: 最终记录
  let finalRecords = []
  let recordType = type
  try {
    if (type === 'A') finalRecords = await resolve4(domain)
    else if (type === 'AAAA') finalRecords = await promisify(dns.resolve6)(domain)
    else if (type === 'MX') finalRecords = (await promisify(dns.resolveMx)(domain)).map(r => `${r.priority} ${r.exchange}`)
    else if (type === 'TXT') finalRecords = (await promisify(dns.resolveTxt)(domain)).flat()
    else if (type === 'NS') finalRecords = await resolveNs(domain)
    else if (type === 'CNAME') finalRecords = await promisify(dns.resolveCname)(domain)
  } catch (e) {
    finalRecords = [`查询失败: ${e.code || e.message}`]
  }

  steps.push({
    level: 3,
    name: '最终结果',
    description: `${type} 记录`,
    servers: [],
    query: '',
    response: finalRecords.join(', ') || '无记录',
    records: finalRecords,
    icon: 'result',
  })

  return {
    domain,
    type,
    steps,
    nsServers,
    finalRecords,
  }
}
