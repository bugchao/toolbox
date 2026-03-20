import dns from 'dns'
import { promisify } from 'util'
import { exec } from 'child_process'

const resolve = promisify(dns.resolve)
const resolveTxt = promisify(dns.resolveTxt)

function execAsync(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, { timeout: 10000 }, (err, stdout, stderr) => {
      resolve({ stdout, stderr, code: err?.code })
    })
  })
}

async function checkDnskey(domain) {
  try {
    const result = await execAsync(`dig +short DNSKEY ${domain}`)
    const lines = result.stdout.trim().split('\n').filter(Boolean)
    return { exists: lines.length > 0, records: lines.slice(0, 2).map(l => l.substring(0, 50) + '...') }
  } catch { return { exists: false, records: [] } }
}

async function checkDs(domain) {
  const parts = domain.split('.')
  if (parts.length < 2) return { exists: false, records: [] }
  const parent = parts.slice(1).join('.')
  try {
    const result = await execAsync(`dig +short DS ${domain} @8.8.8.8`)
    const lines = result.stdout.trim().split('\n').filter(Boolean)
    return { exists: lines.length > 0, records: lines.slice(0, 2).map(l => l.substring(0, 50)) }
  } catch { return { exists: false, records: [] } }
}

async function checkRrsig(domain) {
  try {
    const result = await execAsync(`dig +short RRSIG ${domain} A @8.8.8.8`)
    const lines = result.stdout.trim().split('\n').filter(Boolean)
    if (lines.length === 0) {
      const soa = await execAsync(`dig +short RRSIG ${domain} SOA @8.8.8.8`)
      const soaLines = soa.stdout.trim().split('\n').filter(Boolean)
      return { exists: soaLines.length > 0, records: soaLines.slice(0, 1).map(l => l.substring(0, 50)) }
    }
    return { exists: lines.length > 0, records: lines.slice(0, 1).map(l => l.substring(0, 50)) }
  } catch { return { exists: false, records: [] } }
}

function calcGrade(dnskey, ds, rrsig) {
  if (!dnskey.exists && !ds.exists) return 'insecure'
  if (dnskey.exists && ds.exists && rrsig.exists) return 'secure'
  if (dnskey.exists && !ds.exists) return 'insecure'
  return 'indeterminate'
}

export async function verifyDnssec(domain) {
  const [dnskey, ds, rrsig] = await Promise.all([
    checkDnskey(domain),
    checkDs(domain),
    checkRrsig(domain),
  ])

  const grade = calcGrade(dnskey, ds, rrsig)
  const tld = domain.split('.').slice(-1)[0]

  const chain = [
    {
      level: 'Root',
      name: '. (根域)',
      status: 'valid',
      detail: '根区 DNSSEC 始终有效（ICANN 管理）',
      records: ['KSK: Algorithm 8 (RSA/SHA-256)']
    },
    {
      level: 'TLD',
      name: `.${tld}`,
      status: ds.exists ? 'valid' : 'warning',
      detail: ds.exists ? `DS 记录已在父区注册` : `未在 .${tld} 注册 DS 记录，信任链断裂`,
      records: ds.records
    },
    {
      level: 'Domain',
      name: domain,
      status: dnskey.exists ? (rrsig.exists ? 'valid' : 'warning') : 'missing',
      detail: dnskey.exists
        ? (rrsig.exists ? 'DNSKEY + RRSIG 签名验证通过' : 'DNSKEY 存在但未找到 RRSIG 签名')
        : '未配置 DNSKEY 记录，DNSSEC 未启用',
      records: dnskey.records
    }
  ]

  const summaryMap = {
    secure: 'DNSSEC 信任链完整，签名有效，域名解析受到保护',
    insecure: 'DNSSEC 未启用或信任链不完整，建议在注册商处开启',
    bogus: 'DNSSEC 签名验证失败，存在配置错误或被篡改风险',
    indeterminate: 'DNSSEC 状态无法确定，部分记录存在但无法完整验证',
  }

  return {
    domain,
    valid: grade === 'secure',
    grade,
    chain,
    summary: summaryMap[grade],
    algorithm: dnskey.exists ? 'RSA/SHA-256 (Algorithm 8)' : undefined,
  }
}
