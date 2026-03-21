import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

const DNS_TYPES = ['A', 'AAAA', 'MX', 'TXT', 'NS', 'CNAME']

function LatencyBar({ latency, max }: { latency: number; max: number }) {
  const pct = max > 0 ? Math.round((latency / max) * 100) : 0
  const color = latency < 50 ? 'bg-green-500' : latency < 150 ? 'bg-yellow-500' : 'bg-red-500'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded h-2">
        <div className={`${color} h-2 rounded transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs w-14 text-right font-mono">{latency}ms</span>
    </div>
  )
}

export default function DnsLatency() {
  const { t } = useTranslation('toolDnsLatency')
  const [domain, setDomain] = useState('')
  const [type, setType] = useState('A')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  const analyze = async () => {
    if (!domain.trim()) return
    setLoading(true); setError(''); setResult(null)
    try {
      const res = await fetch('/api/dns/latency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: domain.trim(), type }),
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

  const maxLatency = result ? Math.max(...result.results.map((r: any) => r.latency)) : 0

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
          onKeyDown={(e) => e.key === 'Enter' && analyze()}
        />
        <select
          className="border rounded px-2 py-2 dark:bg-gray-800 dark:border-gray-600"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          {DNS_TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>
        <button
          onClick={analyze}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? t('analyzing') : t('analyze')}
        </button>
      </div>

      {error && <div className="text-red-500 text-sm p-3 bg-red-50 dark:bg-red-900/20 rounded">{error}</div>}

      {result && (
        <div className="space-y-4">
          {/* 统计 */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: t('avg'), value: result.stats.avg != null ? `${result.stats.avg}ms` : '-' },
              { label: t('min'), value: result.stats.min != null ? `${result.stats.min}ms` : '-' },
              { label: t('max'), value: result.stats.max != null ? `${result.stats.max}ms` : '-' },
            ].map((s) => (
              <div key={s.label} className="bg-gray-50 dark:bg-gray-800 rounded p-3 text-center">
                <div className="text-xs text-gray-500">{s.label}</div>
                <div className="text-xl font-bold font-mono">{s.value}</div>
              </div>
            ))}
          </div>

          {/* 各服务器结果 */}
          <div className="border dark:border-gray-700 rounded overflow-hidden">
            <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 text-sm font-medium">{t('servers')}</div>
            <div className="divide-y dark:divide-gray-700">
              {result.results.map((r: any) => (
                <div key={r.ip} className="px-4 py-3 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{r.server} <span className="text-gray-400 font-mono text-xs">{r.ip}</span></span>
                    <span className={`text-xs px-2 py-0.5 rounded ${r.status === 'ok' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {r.status === 'ok' ? t('ok') : r.error}
                    </span>
                  </div>
                  {r.status === 'ok' && <LatencyBar latency={r.latency} max={maxLatency} />}
                  {r.records?.length > 0 && (
                    <div className="text-xs text-gray-500 font-mono">{r.records.join(', ')}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
