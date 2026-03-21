import React, { useState, useCallback } from 'react'
import { Globe, CheckCircle, XCircle, Info } from 'lucide-react'

interface CdnResult {
  domain: string
  hasCdn: boolean
  provider: string | null
  confidence: 'high' | 'medium' | 'low'
  evidence: {
    cname: string[]
    headers: string[]
    ips: string[]
    asn: string | null
  }
  ips: string[]
  ttl: number | null
  summary: string
}

const CDN_PROVIDERS: Record<string, { name: string; color: string; logo: string }> = {
  cloudflare: { name: 'Cloudflare', color: '#f6821f', logo: '🟠' },
  fastly: { name: 'Fastly', color: '#ff282d', logo: '🔴' },
  akamai: { name: 'Akamai', color: '#009bde', logo: '🔵' },
  cloudfront: { name: 'AWS CloudFront', color: '#ff9900', logo: '🟡' },
  cdn77: { name: 'CDN77', color: '#1a73e8', logo: '🔵' },
  bunny: { name: 'Bunny CDN', color: '#f59e0b', logo: '🐰' },
  vercel: { name: 'Vercel Edge', color: '#000000', logo: '▲' },
  netlify: { name: 'Netlify Edge', color: '#00c7b7', logo: '🟢' },
  aliyun: { name: '阿里云 CDN', color: '#ff6a00', logo: '🟠' },
  tencent: { name: '腾讯云 CDN', color: '#0052d9', logo: '🔵' },
  qiniu: { name: '七牛云 CDN', color: '#0099ff', logo: '🔵' },
  wangsu: { name: '网宿 CDN', color: '#e60012', logo: '🔴' },
}

export function CdnCheck() {
  const [domain, setDomain] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<CdnResult | null>(null)
  const [error, setError] = useState('')

  const check = useCallback(async () => {
    const d = domain.trim().replace(/^https?:\/\//, '').split('/')[0]
    if (!d) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await fetch('/api/cdn/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: d }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || '请求失败')
      setResult(data)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [domain])

  const getConfidenceBadge = (c: string) => {
    if (c === 'high') return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
    if (c === 'medium') return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
    return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
  }

  const getConfidenceLabel = (c: string) =>
    c === 'high' ? '高置信度' : c === 'medium' ? '中置信度' : '低置信度'

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">CDN 检测</h1>
      <p className="text-gray-500 dark:text-gray-400">识别域名使用的 CDN 服务商，支持 Cloudflare、Akamai、阿里云等主流 CDN</p>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
        <div className="flex gap-3">
          <input type="text" value={domain} onChange={e => setDomain(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && check()}
            placeholder="example.com"
            className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <button onClick={check} disabled={loading || !domain.trim()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors flex items-center gap-2">
            <Globe className="w-4 h-4" />{loading ? '检测中...' : '检测'}
          </button>
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>

      {loading && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
          <div className="inline-flex items-center gap-3 text-gray-500">
            <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            正在检测 CDN 配置...
          </div>
        </div>
      )}

      {result && (
        <div className="space-y-4">
          {/* 主结果卡片 */}
          <div className={`rounded-xl border-2 p-5 ${
            result.hasCdn
              ? 'border-indigo-200 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-900/10'
              : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
          }`}>
            <div className="flex items-start gap-4">
              <div className="text-4xl">
                {result.provider && CDN_PROVIDERS[result.provider]
                  ? CDN_PROVIDERS[result.provider].logo
                  : result.hasCdn ? '☁️' : '🌐'}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {result.hasCdn
                      ? (result.provider && CDN_PROVIDERS[result.provider]
                          ? CDN_PROVIDERS[result.provider].name
                          : '未知 CDN')
                      : '未检测到 CDN'}
                  </span>
                  {result.hasCdn && (
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getConfidenceBadge(result.confidence)}`}>
                      {getConfidenceLabel(result.confidence)}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{result.summary}</p>
              </div>
              {result.hasCdn
                ? <CheckCircle className="w-6 h-6 text-green-500 shrink-0" />
                : <XCircle className="w-6 h-6 text-gray-400 shrink-0" />}
            </div>
          </div>

          {/* 检测证据 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">检测依据</h2>
            <div className="grid grid-cols-1 gap-3 text-sm">
              {result.ips.length > 0 && (
                <div>
                  <div className="text-xs font-medium text-gray-500 mb-1">解析 IP</div>
                  <div className="flex flex-wrap gap-1">
                    {result.ips.map((ip, i) => (
                      <span key={i} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded font-mono text-xs text-gray-700 dark:text-gray-300">{ip}</span>
                    ))}
                  </div>
                </div>
              )}
              {result.evidence.cname.length > 0 && (
                <div>
                  <div className="text-xs font-medium text-gray-500 mb-1">CNAME 链</div>
                  <div className="flex flex-col gap-1">
                    {result.evidence.cname.map((c, i) => (
                      <span key={i} className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 rounded font-mono text-xs text-blue-700 dark:text-blue-300">{c}</span>
                    ))}
                  </div>
                </div>
              )}
              {result.evidence.headers.length > 0 && (
                <div>
                  <div className="text-xs font-medium text-gray-500 mb-1">CDN 特征响应头</div>
                  <div className="flex flex-wrap gap-1">
                    {result.evidence.headers.map((h, i) => (
                      <span key={i} className="px-2 py-0.5 bg-green-50 dark:bg-green-900/20 rounded font-mono text-xs text-green-700 dark:text-green-300">{h}</span>
                    ))}
                  </div>
                </div>
              )}
              {result.evidence.asn && (
                <div>
                  <div className="text-xs font-medium text-gray-500 mb-1">ASN</div>
                  <span className="px-2 py-0.5 bg-purple-50 dark:bg-purple-900/20 rounded font-mono text-xs text-purple-700 dark:text-purple-300">{result.evidence.asn}</span>
                </div>
              )}
              {result.ttl !== null && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-500">DNS TTL：</span>
                  <span className="font-mono text-xs text-gray-700 dark:text-gray-300">{result.ttl}s</span>
                  {result.ttl < 120 && <span className="text-xs text-orange-500">（低 TTL 是 CDN 常见特征）</span>}
                </div>
              )}
            </div>
          </div>

          {/* 支持的 CDN 列表 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-4 h-4 text-gray-400" />
              <span className="text-xs font-medium text-gray-500">支持识别的 CDN 服务商</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.values(CDN_PROVIDERS).map(p => (
                <span key={p.name} className={`px-2 py-1 rounded-lg text-xs font-medium ${
                  result.provider && CDN_PROVIDERS[result.provider]?.name === p.name
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}>
                  {p.logo} {p.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
