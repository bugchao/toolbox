import React, { useState, useCallback } from 'react'
import { Shield, AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react'

interface DdosRisk {
  name: string
  passed: boolean
  risk: 'critical' | 'high' | 'medium' | 'low' | 'none'
  score: number
  detail: string
  recommendation: string
}

interface DdosResult {
  domain: string
  overallRisk: 'critical' | 'high' | 'medium' | 'low'
  riskScore: number
  checks: DdosRisk[]
  summary: string
  amplificationFactor?: number
}

export function SecurityDnsDdos() {
  const [domain, setDomain] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<DdosResult | null>(null)
  const [error, setError] = useState('')

  const check = useCallback(async () => {
    const d = domain.trim().replace(/^https?:\/\//, '').split('/')[0]
    if (!d) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await fetch('/api/security/dns-ddos', {
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
      case 'critical': return { label: '严重', color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/10 border-red-300 dark:border-red-700', barColor: 'bg-red-500' }
      case 'high': return { label: '高危', color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/10 border-orange-300 dark:border-orange-700', barColor: 'bg-orange-500' }
      case 'medium': return { label: '中危', color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-300 dark:border-yellow-700', barColor: 'bg-yellow-500' }
      case 'low': return { label: '低危', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/10 border-blue-300 dark:border-blue-700', barColor: 'bg-blue-400' }
      default: return { label: '无风险', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/10 border-green-300 dark:border-green-700', barColor: 'bg-green-500' }
    }
  }

  const getCheckIcon = (c: DdosRisk) => {
    if (c.passed) return <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
    if (c.risk === 'critical' || c.risk === 'high') return <XCircle className="w-4 h-4 text-red-500 shrink-0" />
    return <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0" />
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">DNS DDoS 风险检测</h1>
      <p className="text-gray-500 dark:text-gray-400">检测开放递归、放大因子、响应限速等 DNS DDoS 攻击风险</p>

      <div className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4 flex gap-3">
        <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
        <p className="text-sm text-indigo-700 dark:text-indigo-300">
          DNS 放大攻击利用开放递归服务器将小请求放大为大响应，危害严重。此工具检测 ANY/TXT 放大因子、开放递归配置等风险。
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
        <div className="flex gap-3">
          <input type="text" value={domain} onChange={e => setDomain(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && check()}
            placeholder="example.com 或 DNS服务器IP"
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
            正在检测 DDoS 风险...
          </div>
        </div>
      )}

      {result && (() => {
        const cfg = getRiskConfig(result.overallRisk)
        return (
          <div className="space-y-4">
            {/* 风险总览 */}
            <div className={`rounded-xl border-2 p-5 ${cfg.bg}`}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className={`text-xl font-bold ${cfg.color}`}>风险等级：{cfg.label}</span>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{result.summary}</p>
                </div>
                {result.amplificationFactor && (
                  <div className="text-center ml-4">
                    <div className={`text-3xl font-black ${cfg.color}`}>{result.amplificationFactor}x</div>
                    <div className="text-xs text-gray-500">放大因子</div>
                  </div>
                )}
              </div>
              <div className="h-2.5 bg-white/50 dark:bg-black/20 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${cfg.barColor}`}
                  style={{ width: `${result.riskScore}%` }} />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>风险评分</span><span>{result.riskScore}/100</span>
              </div>
            </div>

            {/* 检测项 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">详细检测结果</h2>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {result.checks.map((c, i) => {
                  const rCfg = getRiskConfig(c.risk)
                  return (
                    <div key={i} className="px-4 py-3">
                      <div className="flex items-start gap-3">
                        {getCheckIcon(c)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{c.name}</span>
                            {!c.passed && (
                              <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${rCfg.bg} ${rCfg.color}`}>
                                {rCfg.label}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">{c.detail}</p>
                          {!c.passed && c.recommendation && (
                            <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">💡 {c.recommendation}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
