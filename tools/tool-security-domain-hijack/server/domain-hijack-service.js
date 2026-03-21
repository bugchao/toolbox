import dns from 'dns'
import { promisify } from 'util'
import { exec } from 'child_process'

const resolve4 = promisify(dns.resolve4)

function execAsync(cmd) {
  return new Promise(resolve => {
    exec(cmd, { timeout: 8000 }, (err, stdout) => resolve(stdout || ''))
  })
}

async function resolveWith(domain, server) {
  try {
    const result = await execAsync(`dig +short A ${domain} @${server} +time=3`)
    return result.trim().split('\n').filter(l => /^\d+\.\d+\.\d+\.\d+$/.test(l))
  } catch { return [] }
}

function ipOverlap(a, b) {
  return a.some(ip => b.includes(ip))
}

const KNOWN_HIJACK_IPS = [
  '1.1.1.2', '36.99.18.150', '218.93.127.140', // 常见劫持 IP
]

export async function checkDomainHijack(domain) {
  const DNS_SERVERS = [
    { name: '系统 DNS', server: null },
    { name: 'Google (8.8.8.8)', server: '8.8.8.8' },
    { name: 'Cloudflare (1.1.1.1)', server: '1.1.1.1' },
    { name: 'Ali DNS (223.5.5.5)', server: '223.5.5.5' },
  ]

  const [sysIps, googleIps, cfIps, aliIps] = await Promise.all([
    resolve4(domain).catch(() => []),
    resolveWith(domain, '8.8.8.8'),
    resolveWith(domain, '1.1.1.1'),
    resolveWith(domain, '223.5.5.5'),
  ])

  const allIps = [...new Set([...sysIps, ...googleIps, ...cfIps, ...aliIps])]

  // 检查是否一致
  const consistent = ipOverlap(googleIps, cfIps) || googleIps.length === 0
  const sysConsistent = sysIps.length === 0 || ipOverlap(sysIps, googleIps) || ipOverlap(sysIps, cfIps)
  const knownHijack = allIps.some(ip => KNOWN_HIJACK_IPS.includes(ip))

  const checks = [
    {
      name: '多 DNS 解析一致性',
      passed: consistent,
      risk: consistent ? 'none' : 'high',
      detail: consistent
        ? `Google DNS 与 Cloudflare 解析结果一致: ${googleIps.join(', ') || '无结果'}`
        : `解析不一致: Google=${googleIps.join(',')}, CF=${cfIps.join(',')}`,
      recommendation: consistent ? undefined : '建议使用可信 DNS 服务器验证真实解析结果'
    },
    {
      name: '本地 DNS vs 公共 DNS',
      passed: sysConsistent,
      risk: sysConsistent ? 'none' : 'critical',
      detail: sysConsistent
        ? `本地 DNS 解析与公共 DNS 结果一致`
        : `本地 DNS 解析 ${sysIps.join(',')} 与公共 DNS 不一致，可能存在本地劫持`,
      recommendation: sysConsistent ? undefined : '检查路由器 DNS 设置，确认是否被篡改'
    },
    {
      name: '已知劫持 IP 检测',
      passed: !knownHijack,
      risk: knownHijack ? 'critical' : 'none',
      detail: knownHijack
        ? `解析 IP 在已知劫持地址列表中: ${allIps.filter(ip => KNOWN_HIJACK_IPS.includes(ip)).join(', ')}`
        : '解析 IP 不在已知劫持地址列表中',
      recommendation: knownHijack ? '立即更换 DNS 服务器并检查网络安全设置' : undefined
    },
    {
      name: 'HTTPS 重定向检测',
      passed: true,
      risk: 'none',
      detail: 'HTTP→HTTPS 重定向需通过浏览器验证（服务器端检测受限）',
    },
  ]

  const failedChecks = checks.filter(c => !c.passed)
  const maxRisk = failedChecks.length === 0 ? 'safe'
    : failedChecks.some(c => c.risk === 'critical') ? 'critical'
    : failedChecks.some(c => c.risk === 'high') ? 'high'
    : 'medium'

  const hijacked = maxRisk === 'critical' || maxRisk === 'high'

  const summary = hijacked
    ? `检测到 ${failedChecks.length} 项异常，域名可能遭受 DNS 劫持，请立即排查`
    : failedChecks.length > 0
      ? `发现 ${failedChecks.length} 项警告，建议进一步排查`
      : '多个 DNS 服务器解析结果一致，未检测到明显劫持迹象'

  return { domain, hijacked, riskLevel: maxRisk, checks, resolvedIps: allIps, summary }
}
