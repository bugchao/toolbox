import dns from 'dns'
import https from 'https'
import http from 'http'
import { promisify } from 'util'

const resolve4 = promisify(dns.resolve4)
const resolveCname = promisify(dns.resolveCname)

const CDN_CNAME_PATTERNS = [
  { pattern: /cloudflare/i, provider: 'cloudflare' },
  { pattern: /fastly/i, provider: 'fastly' },
  { pattern: /akamai|akadns|akamaiedge/i, provider: 'akamai' },
  { pattern: /cloudfront\.net/i, provider: 'cloudfront' },
  { pattern: /cdn77/i, provider: 'cdn77' },
  { pattern: /b-cdn\.net|bunnycdn/i, provider: 'bunny' },
  { pattern: /vercel/i, provider: 'vercel' },
  { pattern: /netlify/i, provider: 'netlify' },
  { pattern: /aliyuncs\.com|alicdn/i, provider: 'aliyun' },
  { pattern: /qcloud\.com|tencentcos/i, provider: 'tencent' },
  { pattern: /qiniudns\.com|qbox\.me/i, provider: 'qiniu' },
  { pattern: /wsglb\.com|wsgslb/i, provider: 'wangsu' },
]

const CDN_HEADER_PATTERNS = [
  { header: 'cf-ray', provider: 'cloudflare' },
  { header: 'x-served-by', provider: 'fastly' },
  { header: 'x-cache', provider: null },
  { header: 'x-amz-cf-id', provider: 'cloudfront' },
  { header: 'x-cdn', provider: null },
  { header: 'x-edge-ip', provider: null },
  { header: 'ali-swift-global-savetime', provider: 'aliyun' },
  { header: 'x-nws-log-uuid', provider: 'tencent' },
]

const CDN_IP_RANGES = [
  { range: '104.16.0.0/12', provider: 'cloudflare' },
  { range: '173.245.48.0/20', provider: 'cloudflare' },
]

async function getAllCnames(domain) {
  const chain = [domain]
  let current = domain
  for (let i = 0; i < 10; i++) {
    try {
      const cnames = await resolveCname(current)
      if (!cnames.length) break
      current = cnames[0]
      chain.push(current)
    } catch { break }
  }
  return chain
}

function fetchHeaders(domain) {
  return new Promise((resolve) => {
    const url = `https://${domain}`
    const req = https.request(url, { method: 'HEAD', timeout: 8000,
      headers: { 'User-Agent': 'Toolbox-CDN-Checker/1.0' }
    }, (res) => {
      resolve(res.headers)
      res.resume()
    })
    req.on('error', () => resolve({}))
    req.on('timeout', () => { req.destroy(); resolve({}) })
    req.end()
  })
}

export async function checkCdn(domain) {
  const [cnameChain, ips, headers] = await Promise.all([
    getAllCnames(domain),
    resolve4(domain).catch(() => []),
    fetchHeaders(domain),
  ])

  const cnameStr = cnameChain.join(' → ')
  let provider = null
  let confidence: 'high' | 'medium' | 'low' = 'low'
  const evidenceHeaders: string[] = []

  // 检测 CNAME
  for (const cname of cnameChain) {
    for (const p of CDN_CNAME_PATTERNS) {
      if (p.pattern.test(cname)) {
        provider = p.provider
        confidence = 'high'
        break
      }
    }
    if (provider) break
  }

  // 检测响应头
  for (const p of CDN_HEADER_PATTERNS) {
    if (headers[p.header] !== undefined) {
      evidenceHeaders.push(`${p.header}: ${String(headers[p.header]).substring(0, 30)}`)
      if (!provider && p.provider) {
        provider = p.provider
        confidence = 'medium'
      } else if (!provider) {
        confidence = 'medium'
      }
    }
  }

  const hasCdn = !!provider || evidenceHeaders.length > 0
  const ttl = null // TTL 需要额外 dig 查询

  let dnsLookupTtl = null
  try {
    const { exec } = await import('child_process')
    const { promisify } = await import('util')
    const execAsync = promisify(exec)
    const result = await execAsync(`dig +short ${domain} A | head -1`)
    // TTL via dig
    const ttlResult = await execAsync(`dig ${domain} A +noall +answer | awk '{print $2}' | head -1`)
    dnsLookupTtl = parseInt(ttlResult.stdout.trim()) || null
  } catch {}

  const providerNames: Record<string, string> = {
    cloudflare: 'Cloudflare', fastly: 'Fastly', akamai: 'Akamai',
    cloudfront: 'AWS CloudFront', cdn77: 'CDN77', bunny: 'Bunny CDN',
    vercel: 'Vercel Edge', netlify: 'Netlify Edge', aliyun: '阿里云 CDN',
    tencent: '腾讯云 CDN', qiniu: '七牛云 CDN', wangsu: '网宿 CDN',
  }

  const summary = hasCdn
    ? `检测到 ${providerNames[provider!] || '未知'} CDN，置信度${confidence === 'high' ? '高' : confidence === 'medium' ? '中' : '低'}`
    : '未检测到明显 CDN 特征，可能直接托管或使用未知 CDN'

  return {
    domain, hasCdn, provider, confidence,
    evidence: {
      cname: cnameChain.length > 1 ? cnameChain : [],
      headers: evidenceHeaders,
      ips,
      asn: null,
    },
    ips, ttl: dnsLookupTtl, summary,
  }
}
