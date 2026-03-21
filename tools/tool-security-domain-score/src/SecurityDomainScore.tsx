import React, { useState, useCallback } from 'react'
import { Shield, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

interface CheckItem {
  name: string
  passed: boolean
  score: number
  maxScore: number
  detail: string
  severity: 'high' | 'medium' | 'low' | 'info'
}

interface ScoreResult {
  domain: string
  totalScore: number
  maxScore: number
  grade: string
  checks: CheckItem[]
  summary: string
}

export function SecurityDomainScore() {
  const [domain, setDomain] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ScoreResult | null>(null)
  const [error, setError] = useState('')

  const check = useCallback(async () => {
    const d = domain.trim().replace(/^https?:\/\//, '').split('/')[0]
    if (!d) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await fetch('/api/security/domain-score', {
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

  const getGradeColor = (grade: string) => {
    if (grade === 'A+' || grade === 'A') return 'text-green-500'
    if (grade === 'B') return 'text-blue-500'
    if (grade === 'C') return 'text-yellow-500'
    if (grade === 'D') return 'text-orange-500'
    return 'text-red-500'
  }

  const getSeverityIcon = (item: CheckItem) => {
    if (item.passed) return <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
    if (item.severity === 'high') return <XCircle className="w-4 h-4 text-red-500 shrink-0" />
    if (item.severity === 'medium') return <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0" />
    return <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0" />
  }

  const getSeverityBadge = (severity: string) => {
    if (severity === 'high') return 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
    if (severity === 'medium') return 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
    if (severity === 'low') return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
    return 'bg-gray-100 dark:bg-gray-700 text-gray-500'
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">域名安全评分</h1>
      <p className="text-gray-500 dark:text-gray-400">综合检测 DNSSEC、SPF、DKIM、DMARC、SSL 等安全配置，给出安全评分</p>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
        <div className="flex gap-3">
          <input
            type="text"
            value={domain}
            onChange={e => setDomain(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && check()}
            placeholder="example.com"
            className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button onClick={check} disabled={loading || !domain.trim()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors flex items-center gap-2">
            <Shield className="w-4 h-4" />
            {loading ? '检测中...' : '评分'}
          </button>
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>

      {loading && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
          <div className="inline-flex items-center gap-3 text-gray-500">
            <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            正在检测安全配置...
          </div>
        </div>
      )}

      {result && (
        <div className="space-y-4">
          {/* 总评分 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className={`text-5xl font-black ${getGradeColor(result.grade)}`}>{result.grade}</div>
                <div className="text-xs text-gray-500 mt-1">安全等级</div>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{result.domain}</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{result.totalScore}/{result.maxScore}</span>
                </div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      result.totalScore / result.maxScore >= 0.8 ? 'bg-green-500'
                      : result.totalScore / result.maxScore >= 0.6 ? 'bg-blue-500'
                      : result.totalScore / result.maxScore >= 0.4 ? 'bg-yellow-500'
                      : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.round(result.totalScore / result.maxScore * 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1.5">{result.summary}</p>
              </div>
            </div>
          </div>

          {/* 检测项 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-semibold text-gray-900 dark:text-gray-100">检测详情</h2>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {result.checks.map((item, i) => (
                <div key={i} className="flex items-start gap-3 px-4 py-3">
                  {getSeverityIcon(item)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.name}</span>
                      {!item.passed && (
                        <span className={`px-1.5 py-0.5 rounded text-xs ${getSeverityBadge(item.severity)}`}>
                          {item.severity === 'high' ? '高危' : item.severity === 'medium' ? '中危' : '低危'}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.detail}</p>
                  </div>
                  <span className="text-xs font-medium text-gray-500 shrink-0">{item.score}/{item.maxScore}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
