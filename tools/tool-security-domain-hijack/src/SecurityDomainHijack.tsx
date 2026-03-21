import React, { useState, useCallback } from 'react'
import { Shield, AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react'

interface HijackCheck {
  name: string
  passed: boolean
  risk: 'critical' | 'high' | 'medium' | 'low' | 'none'
  detail: string
  recommendation?: string
}

interface HijackResult {
  domain: string
  hijacked: boolean
  riskLevel: 'critical' | 'high' | 'medium' | 'low' | 'safe'
  checks: HijackCheck[]
  resolvedIps: string[]
  summary: string
}

export function SecurityDomainHijack() {
  const [domain, setDomain] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<HijackResult | null>(null)
  const [error, setError] = useState('')

  const check = useCallback(async () => {
    const d = domain.trim().replace(/^https?:\/\//, '').split('/')[0]
    if (!d) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await fetch('/api/security/domain-hijack', {
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

  const getRiskConfig = (risk: string) => {
    switch (risk) {
      case 'critical': return { label: '严重劫持', color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/10 border-red-300 dark:border-red-700' }
      case 'high': return { label: '高风险', color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/10 border-orange-300 dark:border-orange-700' }
      case 'medium': return { label: '中风险', color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-300 dark:border-yellow-700' }
      case 'low': return { label: '低风险', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/10 border-blue-300 dark:border-blue-700' }
      default: return { label: '安全', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/10 border-green-300 dark:border-green-700' }
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">域名劫持检测</h1>
      <p className="text-gray-500 dark:text-gray-400">检测域名是否遭受 DNS 劫持，对比权威解析与公共 DNS 结果</p>

      <div className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4 flex gap-3">
        <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
        <p className="text-sm text-indigo-700 dark:text-indigo-300">
          DNS 劫持会将用户引导至恶意 IP，此工具通过对比多个 DNS 服务器的解析结果来检测异常。
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
        <div className="flex gap-3">
          <input type="text" value={domain} onChange={e => setDomain(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && check()}
            placeholder="example.com"
            className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <button onClick={check} disabled={loading || !domain.trim()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors flex items-center gap-2">
            <Shield className="w-4 h-4" />{loading ? '检测中...' : '检测'}
          </button>
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>

      {loading && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
          <div className="inline-flex items-center gap-3 text-gray-500">
            <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            正在检测域名劫持...
          </div>
        </div>
      )}

      {result && (() => {
        const cfg = getRiskConfig(result.riskLevel)
        return (
          <div className="space-y-4">
            <div className={`rounded-xl border-2 p-5 ${cfg.bg}`}>
              <div className="flex items-center gap-3">
                {result.hijacked
                  ? <XCircle className="w-6 h-6 text-red-500 shrink-0" />
                  : <CheckCircle className="w-6 h-6 text-green-500 shrink-0" />}
                <div className="flex-1">
                  <div className={`text-lg font-bold ${cfg.color}`}>{cfg.label}</div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">{result.summary}</p>
                </div>
              </div>
              {result.resolvedIps.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {result.resolvedIps.map((ip, i) => (
                    <span key={i} className="px-2 py-0.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded font-mono text-xs text-gray-700 dark:text-gray-300">{ip}</span>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300">详细检测项</div>
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {result.checks.map((c, i) => (
                  <div key={i} className="px-4 py-3 flex items-start gap-3">
                    {c.passed
                      ? <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      : c.risk === 'critical' || c.risk === 'high'
                        ? <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                        : <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{c.name}</span>
                        {!c.passed && (
                          <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                            getRiskConfig(c.risk).bg
                          } ${getRiskConfig(c.risk).color}`}>
                            {getRiskConfig(c.risk).label}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{c.detail}</p>
                      {c.recommendation && <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">💡 {c.recommendation}</p>}
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
