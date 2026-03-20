import dns from 'dns'
import { promisify } from 'util'

const resolveTxt = promisify(dns.resolveTxt)
const resolve4 = promisify(dns.resolve4)
const resolveNs = promisify(dns.resolveNs)

// 检测指标
const THRESHOLDS = {
  maxSubdomainLength: 40,   // 子域名过长
  maxTxtLength: 100,        // TXT 记录过长
  highEntropyThreshold: 3.8, // 高熵值（随机字符串）
  suspiciousKeywords: ['vpn', 'tunnel', 'proxy', 'bypass', 'iodine', 'dns2tcp', 'dnscat'],
}

function calcEntropy(str) {
  const freq = {}
  for (const c of str) freq[c] = (freq[c] || 0) + 1
  return -Object.values(freq).reduce((s, f) => {
    const p = f / str.length
    return s + p * Math.log2(p)
  }, 0)
}

function analyzeSubdomain(domain) {
  const parts = domain.split('.')
  const subdomain = parts.slice(0, -2).join('.')
  const issues = []
  if (subdomain.length > THRESHOLDS.maxSubdomainLength) {
    issues.push({ type: 'long_subdomain', desc: `子域名过长 (${subdomain.length} 字符)`, risk: 'high' })
  }
  const entropy = calcEntropy(subdomain || domain)
  if (entropy > THRESHOLDS.highEntropyThreshold) {
    issues.push({ type: 'high_entropy', desc: `高熵值 ${entropy.toFixed(2)}（疑似随机/编码数据）`, risk: 'high' })
  }
  for (const kw of THRESHOLDS.suspiciousKeywords) {
    if (domain.toLowerCase().includes(kw)) {
      issues.push({ type: 'suspicious_keyword', desc: `包含可疑关键词: ${kw}`, risk: 'medium' })
    }
  }
  return { subdomain, entropy: entropy.toFixed(2), issues }
}

export async function detectDnsTunnel(domain) {
  const checks = []
  const allIssues = []

  // 1. 域名结构分析
  const subdomainAnalysis = analyzeSubdomain(domain)
  checks.push({
    name: '域名结构分析',
    result: subdomainAnalysis,
    issues: subdomainAnalysis.issues,
  })
  allIssues.push(...subdomainAnalysis.issues)

  // 2. TXT 记录检测
  let txtIssues = []
  let txtRecords = []
  try {
    txtRecords = await resolveTxt(domain)
    const flat = txtRecords.flat()
    for (const txt of flat) {
      if (txt.length > THRESHOLDS.maxTxtLength) {
        txtIssues.push({ type: 'long_txt', desc: `TXT 记录过长 (${txt.length} 字符)，可能用于数据外传`, risk: 'high' })
      }
      const e = calcEntropy(txt)
      if (e > THRESHOLDS.highEntropyThreshold) {
        txtIssues.push({ type: 'high_entropy_txt', desc: `TXT 记录高熵值 ${e.toFixed(2)}`, risk: 'high' })
      }
    }
  } catch {}
  checks.push({ name: 'TXT 记录检测', result: { records: txtRecords.flat() }, issues: txtIssues })
  allIssues.push(...txtIssues)

  // 3. NS 记录异常检测
  let nsIssues = []
  let nsRecords = []
  try {
    nsRecords = await resolveNs(domain)
    if (nsRecords.length > 6) {
      nsIssues.push({ type: 'too_many_ns', desc: `NS 记录过多 (${nsRecords.length} 个)`, risk: 'medium' })
    }
  } catch {}
  checks.push({ name: 'NS 记录检测', result: { records: nsRecords }, issues: nsIssues })
  allIssues.push(...nsIssues)

  // 4. 综合风险评估
  const highRisk = allIssues.filter((i) => i.risk === 'high').length
  const mediumRisk = allIssues.filter((i) => i.risk === 'medium').length
  let riskLevel = 'low'
  if (highRisk >= 2) riskLevel = 'high'
  else if (highRisk >= 1 || mediumRisk >= 2) riskLevel = 'medium'

  return {
    domain,
    checks,
    allIssues,
    riskLevel,
    summary: riskLevel === 'high'
      ? '⚠️ 高风险：检测到多个 DNS 隧道特征'
      : riskLevel === 'medium'
      ? '🔶 中风险：存在部分可疑特征，建议进一步排查'
      : '✅ 低风险：未发现明显 DNS 隧道特征',
  }
}
