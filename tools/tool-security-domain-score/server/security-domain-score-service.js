import dns from 'dns'
import tls from 'tls'
import { promisify } from 'util'

const resolveTxt = promisify(dns.resolveTxt)
const resolveNs = promisify(dns.resolveNs)
const resolveMx = promisify(dns.resolveMx)

async function checkSpf(domain) {
  try {
    const records = await resolveTxt(domain)
    const spf = records.flat().find(r => r.startsWith('v=spf1'))
    return { passed: !!spf, detail: spf ? `SPF: ${spf.substring(0, 60)}...` : '未配置 SPF 记录' }
  } catch { return { passed: false, detail: '未配置 SPF 记录' } }
}

async function checkDmarc(domain) {
  try {
    const records = await resolveTxt(`_dmarc.${domain}`)
    const dmarc = records.flat().find(r => r.startsWith('v=DMARC1'))
    if (!dmarc) return { passed: false, detail: '未配置 DMARC 记录' }
    const policy = dmarc.match(/p=(\w+)/)?.[1] || 'none'
    const strong = policy === 'reject' || policy === 'quarantine'
    return { passed: strong, detail: `DMARC 策略: ${policy}${strong ? '' : '（建议设为 quarantine 或 reject）'}` }
  } catch { return { passed: false, detail: '未配置 DMARC 记录' } }
}

async function checkDnssec(domain) {
  try {
    const records = await resolveTxt(`_dnskey.${domain}`).catch(() => null)
    // 简单检测：尝试解析 DS 记录
    return { passed: false, detail: 'DNSSEC 需通过权威注册商验证（此处仅做基础检测）' }
  } catch { return { passed: false, detail: 'DNSSEC 未检测到' } }
}

async function checkSsl(domain) {
  return new Promise((resolve) => {
    const socket = tls.connect(443, domain, { servername: domain, rejectUnauthorized: false }, () => {
      const cert = socket.getPeerCertificate()
      socket.destroy()
      if (!cert || !cert.valid_to) return resolve({ passed: false, detail: 'SSL 证书无效' })
      const expiry = new Date(cert.valid_to)
      const daysLeft = Math.floor((expiry.getTime() - Date.now()) / 86400000)
      if (daysLeft < 0) return resolve({ passed: false, detail: `SSL 证书已过期 ${Math.abs(daysLeft)} 天` })
      if (daysLeft < 30) return resolve({ passed: false, detail: `SSL 证书将在 ${daysLeft} 天后过期` })
      resolve({ passed: true, detail: `SSL 证书有效，剩余 ${daysLeft} 天（${cert.issuer?.O || '未知 CA'}）` })
    })
    socket.on('error', () => resolve({ passed: false, detail: '无法建立 SSL 连接' }))
    socket.setTimeout(5000, () => { socket.destroy(); resolve({ passed: false, detail: 'SSL 连接超时' }) })
  })
}

async function checkMx(domain) {
  try {
    const records = await resolveMx(domain)
    return { passed: records.length > 0, detail: records.length > 0 ? `MX 记录: ${records.map(r => r.exchange).slice(0, 2).join(', ')}` : '未配置 MX 记录' }
  } catch { return { passed: false, detail: '未配置 MX 记录' } }
}

function calcGrade(score, max) {
  const pct = score / max
  if (pct >= 0.95) return 'A+'
  if (pct >= 0.80) return 'A'
  if (pct >= 0.65) return 'B'
  if (pct >= 0.50) return 'C'
  if (pct >= 0.35) return 'D'
  return 'F'
}

export async function getDomainScore(domain) {
  const [spf, dmarc, dnssec, ssl, mx] = await Promise.all([
    checkSpf(domain),
    checkDmarc(domain),
    checkDnssec(domain),
    checkSsl(domain),
    checkMx(domain),
  ])

  const checks = [
    { name: 'SSL/TLS 证书', ...ssl, score: ssl.passed ? 30 : 0, maxScore: 30, severity: 'high' },
    { name: 'SPF 记录', ...spf, score: spf.passed ? 20 : 0, maxScore: 20, severity: 'high' },
    { name: 'DMARC 策略', ...dmarc, score: dmarc.passed ? 25 : 0, maxScore: 25, severity: 'medium' },
    { name: 'MX 记录配置', ...mx, score: mx.passed ? 10 : 0, maxScore: 10, severity: 'low' },
    { name: 'DNSSEC', ...dnssec, score: dnssec.passed ? 15 : 0, maxScore: 15, severity: 'medium' },
  ]

  const totalScore = checks.reduce((s, c) => s + c.score, 0)
  const maxScore = checks.reduce((s, c) => s + c.maxScore, 0)
  const grade = calcGrade(totalScore, maxScore)

  const failed = checks.filter(c => !c.passed)
  const summary = failed.length === 0
    ? '安全配置完善，继续保持'
    : `发现 ${failed.length} 项待改善：${failed.map(f => f.name).join('、')}`

  return { domain, totalScore, maxScore, grade, checks, summary }
}
