import dns from 'dns'
import { promisify } from 'util'
import { exec } from 'child_process'

const resolve4 = promisify(dns.resolve4)
const resolveTxt = promisify(dns.resolveTxt)

function execAsync(cmd) {
  return new Promise((resolve) => {
    exec(cmd, { timeout: 8000 }, (err, stdout) => resolve({ stdout: stdout || '', err }))
  })
}

async function checkOpenRecursion(domain) {
  try {
    // 尝试使用目标域名NS作为递归服务器查询外部域名
    const nsResult = await execAsync(`dig +short NS ${domain}`)
    const ns = nsResult.stdout.trim().split('\n')[0]?.trim()
    if (!ns) return { passed: true, detail: '无法获取 NS 服务器', amplification: 1 }
    const test = await execAsync(`dig +short @${ns} google.com A +time=3`)
    const hasResult = test.stdout.trim().length > 0 && !test.stdout.includes('connection timed out')
    return {
      passed: !hasResult,
      detail: hasResult
        ? `NS 服务器 ${ns} 可能开启了开放递归，能够解析外部域名`
        : `NS 服务器 ${ns} 未开启开放递归（正常）`,
      amplification: hasResult ? 8 : 1
    }
  } catch { return { passed: true, detail: '无法检测递归状态', amplification: 1 } }
}

async function checkAnyAmplification(domain) {
  try {
    const result = await execAsync(`dig +short ANY ${domain} @8.8.8.8`)
    const lines = result.stdout.trim().split('\n').filter(Boolean)
    const factor = Math.min(lines.length * 3, 100)
    return {
      passed: factor < 20,
      detail: `ANY 查询返回 ${lines.length} 条记录，放大因子约 ${factor}x`,
      amplification: factor
    }
  } catch { return { passed: true, detail: '无法检测 ANY 查询', amplification: 1 } }
}

async function checkTxtAmplification(domain) {
  try {
    const records = await resolveTxt(domain)
    const totalLen = records.flat().join('').length
    const factor = Math.round(totalLen / 30)
    return {
      passed: factor < 10,
      detail: `TXT 记录总长 ${totalLen} 字节，放大因子约 ${factor}x`,
      amplification: factor
    }
  } catch { return { passed: true, detail: 'TXT 记录为空或无法获取', amplification: 1 } }
}

async function checkRateLimit(domain) {
  try {
    const nsResult = await execAsync(`dig +short NS ${domain} @8.8.8.8`)
    const ns = nsResult.stdout.trim().split('\n')[0]?.trim()
    return {
      passed: true,
      detail: ns ? `NS: ${ns}（响应限速需在服务器端验证）` : '无法获取 NS',
    }
  } catch { return { passed: true, detail: '无法检测限速配置' } }
}

function calcRisk(checks) {
  const maxAmp = Math.max(...checks.map(c => c.amplification || 1))
  const failCount = checks.filter(c => !c.passed).length
  const score = Math.min(100, failCount * 25 + (maxAmp > 50 ? 30 : maxAmp > 20 ? 15 : 0))
  const risk = score >= 75 ? 'critical' : score >= 50 ? 'high' : score >= 25 ? 'medium' : 'low'
  return { score, risk, maxAmp }
}

export async function checkDnsDdos(domain) {
  const [recursion, anyAmp, txtAmp, rateLimit] = await Promise.all([
    checkOpenRecursion(domain),
    checkAnyAmplification(domain),
    checkTxtAmplification(domain),
    checkRateLimit(domain),
  ])

  const rawChecks = [
    { name: '开放递归检测', ...recursion, risk: recursion.passed ? 'none' : 'critical', recommendation: '在 DNS 服务器配置中禁止开放递归，限制仅授权用户可用' },
    { name: 'ANY 查询放大因子', ...anyAmp, risk: anyAmp.passed ? 'none' : anyAmp.amplification > 50 ? 'high' : 'medium', recommendation: '禁止或限制 ANY 查询响应，返回 HINFO 或空响应' },
    { name: 'TXT 记录放大因子', ...txtAmp, risk: txtAmp.passed ? 'none' : 'medium', recommendation: '精简 TXT 记录长度，移除不必要的长字符串' },
    { name: '响应限速 (RRL)', ...rateLimit, risk: 'low', recommendation: '在 DNS 服务器启用 Response Rate Limiting (RRL)' },
  ]

  const checks = rawChecks.map(c => ({ ...c, score: c.passed ? 0 : 25, maxScore: 25 }))
  const { score, risk, maxAmp } = calcRisk(rawChecks)

  const failed = checks.filter(c => !c.passed)
  const summary = failed.length === 0
    ? '未发现明显 DDoS 风险，DNS 配置较为安全'
    : `发现 ${failed.length} 项风险：${failed.map(f => f.name).join('、')}`

  return {
    domain, overallRisk: risk, riskScore: score,
    checks, summary, amplificationFactor: maxAmp > 1 ? maxAmp : undefined
  }
}
