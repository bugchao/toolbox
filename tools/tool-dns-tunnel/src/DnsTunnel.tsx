import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

const RISK_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  high: { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-700 dark:text-red-400', label: '高风险' },
  medium: { bg: 'bg-yellow-50 dark:bg-yellow-900/20', text: 'text-yellow-700 dark:text-yellow-400', label: '中风险' },
  low: { bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-700 dark:text-green-400', label: '低风险' },
}

export default function DnsTunnel() {
  const { t } = useTranslation('toolDnsTunnel')
  const [domain, setDomain] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  const detect = async () => {
    if (!domain.trim()) return
    setLoading(true); setError(''); setResult(null)
    try {
      const res = await fetch('/api/dns/tunnel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: domain.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResult(data)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <div>
        <h1 className="text-2xl font-bold mb-1">{t('title')}</h1>
        <p className="text-gray-500 text-sm">{t('desc')}</p>
      </div>

      <div className="flex gap-2">
        <input
          className="flex-1 border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-600"
          placeholder={t('placeholder')}
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && detect()}
        />
        <button
          onClick={detect}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? t('detecting') : t('detect')}
        </button>
      </div>

      {error && <div className="text-red-500 text-sm p-3 bg-red-50 dark:bg-red-900/20 rounded">{error}</div>}

      {result && (
        <div className="space-y-4">
          {/* 风险等级 */}
          {(() => {
            const cfg = RISK_CONFIG[result.riskLevel]
            return (
              <div className={`p-4 rounded ${cfg.bg}`}>
                <div className="flex items-center gap-2">
                  <span className={`font-bold text-lg ${cfg.text}`}>{cfg.label}</span>
                  <span className={`text-sm ${cfg.text}`}>{result.summary}</span>
                </div>
              </div>
            )
          })()}

          {/* 检测项目 */}
          {result.checks.map((check: any) => (
            <div key={check.name} className="border dark:border-gray-700 rounded overflow-hidden">
              <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 flex justify-between items-center">
                <span className="text-sm font-medium">{check.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded ${
                  check.issues.length > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                }`}>
                  {check.issues.length > 0 ? `${check.issues.length} 个问题` : '正常'}
                </span>
              </div>
              <div className="p-3 space-y-2">
                {check.issues.length > 0 ? (
                  check.issues.map((issue: any, i: number) => (
                    <div key={i} className={`text-xs p-2 rounded ${
                      issue.risk === 'high'
                        ? 'bg-red-50 dark:bg-red-900/20 text-red-700'
                        : 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700'
                    }`}>
                      {issue.desc}
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-gray-500">{t('noIssues')}</div>
                )}
                {/* 记录展示 */}
                {check.result?.records?.length > 0 && (
                  <div className="text-xs font-mono text-gray-500 bg-gray-50 dark:bg-gray-800 p-2 rounded">
                    {check.result.records.map((r: string, i: number) => <div key={i}>{r}</div>)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
