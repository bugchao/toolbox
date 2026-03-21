import React, { useState, useCallback } from 'react'
import { Shield, CheckCircle, XCircle, AlertTriangle, ChevronRight } from 'lucide-react'

interface ChainNode {
  level: string
  name: string
  status: 'valid' | 'invalid' | 'missing' | 'warning'
  detail: string
  records: string[]
}

interface DnssecResult {
  domain: string
  valid: boolean
  grade: 'secure' | 'insecure' | 'bogus' | 'indeterminate'
  chain: ChainNode[]
  summary: string
  algorithm?: string
  keyTag?: number
}

export function SecurityDnssecVerify() {
  const [domain, setDomain] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<DnssecResult | null>(null)
  const [error, setError] = useState('')

  const verify = useCallback(async () => {
    const d = domain.trim().replace(/^https?:\/\//, '').split('/')[0]
    if (!d) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await fetch('/api/security/dnssec-verify', {
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

  const getGradeConfig = (grade: string) => {
    switch (grade) {
      case 'secure': return { label: '安全', color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800', icon: <CheckCircle className="w-6 h-6 text-green-500" /> }
      case 'bogus': return { label: '伪造/错误', color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800', icon: <XCircle className="w-6 h-6 text-red-500" /> }
      case 'insecure': return { label: '不安全', color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-800', icon: <AlertTriangle className="w-6 h-6 text-orange-500" /> }
      default: return { label: '无法确定', color: 'text-gray-500', bg: 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700', icon: <Shield className="w-6 h-6 text-gray-400" /> }
    }
  }

  const getChainStatusIcon = (status: string) => {
    if (status === 'valid') return <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
    if (status === 'invalid') return <XCircle className="w-4 h-4 text-red-500 shrink-0" />
    if (status === 'warning') return <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0" />
    return <XCircle className="w-4 h-4 text-gray-400 shrink-0" />
  }

  const getChainStatusBg = (status: string) => {
    if (status === 'valid') return 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10'
    if (status === 'invalid') return 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10'
    if (status === 'warning') return 'border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/10'
    return 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">DNSSEC 签名验证</h1>
      <p className="text-gray-500 dark:text-gray-400">验证域名 DNSSEC 信任链完整性，检测签名有效性和密钥配置</p>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
        <div className="flex gap-3">
          <input type="text" value={domain} onChange={e => setDomain(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && verify()}
            placeholder="example.com"
            className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <button onClick={verify} disabled={loading || !domain.trim()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors flex items-center gap-2">
            <Shield className="w-4 h-4" />{loading ? '验证中...' : '验证'}
          </button>
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>

      {loading && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
          <div className="inline-flex items-center gap-3 text-gray-500">
            <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            正在验证 DNSSEC 信任链...
          </div>
        </div>
      )}

      {result && (() => {
        const cfg = getGradeConfig(result.grade)
        return (
          <div className="space-y-4">
            {/* 总体结果 */}
            <div className={`rounded-xl border-2 p-5 flex items-center gap-4 ${cfg.bg}`}>
              {cfg.icon}
              <div className="flex-1">
                <div className={`text-lg font-bold ${cfg.color}`}>{cfg.label}</div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">{result.summary}</p>
              </div>
              {result.algorithm && (
                <div className="text-right">
                  <div className="text-xs text-gray-500">算法</div>
                  <div className="text-sm font-mono font-medium text-gray-700 dark:text-gray-300">{result.algorithm}</div>
                  {result.keyTag && <div className="text-xs text-gray-400">KeyTag: {result.keyTag}</div>}
                </div>
              )}
            </div>

            {/* 信任链 - 仿 DNSViz 分层展示 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">信任链验证（Root → TLD → Domain）</h2>
              <div className="space-y-2">
                {result.chain.map((node, i) => (
                  <div key={i}>
                    {i > 0 && (
                      <div className="flex justify-center my-1">
                        <ChevronRight className="w-4 h-4 text-gray-300 rotate-90" />
                      </div>
                    )}
                    <div className={`rounded-lg border px-4 py-3 ${getChainStatusBg(node.status)}`}>
                      <div className="flex items-center gap-2 mb-1">
                        {getChainStatusIcon(node.status)}
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{node.level}</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100 ml-1">{node.name}</span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 ml-6">{node.detail}</p>
                      {node.records.length > 0 && (
                        <div className="ml-6 mt-1 flex flex-wrap gap-1">
                          {node.records.map((r, j) => (
                            <span key={j} className="px-1.5 py-0.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-xs font-mono text-gray-600 dark:text-gray-400">{r}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
