import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

const PRESET_IPS = ['8.8.8.8', '1.1.1.1', '223.5.5.5', '119.29.29.29', '114.114.114.114']

export default function DnsRecursive() {
  const { t } = useTranslation('toolDnsRecursive')
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  const check = async () => {
    const targets = input.split(/[\n,\s]+/).map((s) => s.trim()).filter(Boolean)
    if (!targets.length) return
    setLoading(true); setError(''); setResult(null)
    try {
      const res = await fetch('/api/dns/recursive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targets }),
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

      <div className="space-y-2">
        <textarea
          className="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-600 font-mono text-sm h-24"
          placeholder={t('placeholder')}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <div className="flex gap-2 flex-wrap">
          <span className="text-xs text-gray-500 self-center">{t('presets')}:</span>
          {PRESET_IPS.map((ip) => (
            <button
              key={ip}
              onClick={() => setInput((v) => v ? v + '\n' + ip : ip)}
              className="text-xs px-2 py-1 border rounded hover:bg-gray-50 dark:hover:bg-gray-700 font-mono"
            >{ip}</button>
          ))}
        </div>
        <button
          onClick={check}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? t('checking') : t('check')}
        </button>
      </div>

      {error && <div className="text-red-500 text-sm p-3 bg-red-50 dark:bg-red-900/20 rounded">{error}</div>}

      {result && (
        <div className="space-y-4">
          {/* 摘要 */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: t('total'), value: result.summary.total },
              { label: t('open'), value: result.summary.open, danger: result.summary.open > 0 },
              { label: t('closed'), value: result.summary.closed },
            ].map((s) => (
              <div key={s.label} className={`rounded p-3 text-center ${
                s.danger ? 'bg-red-50 dark:bg-red-900/20' : 'bg-gray-50 dark:bg-gray-800'
              }`}>
                <div className="text-xs text-gray-500">{s.label}</div>
                <div className={`text-2xl font-bold ${s.danger ? 'text-red-600' : ''}`}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* 风险提示 */}
          {result.summary.open > 0 && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-700 text-sm rounded">
              ⚠️ {t('openWarning')}
            </div>
          )}

          {/* 详细结果 */}
          <div className="border dark:border-gray-700 rounded overflow-hidden">
            <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 text-sm font-medium">{t('details')}</div>
            <div className="divide-y dark:divide-gray-700">
              {result.results.map((r: any) => (
                <div key={r.ip} className="px-4 py-3">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-sm">{r.ip}</span>
                    <div className="flex gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        r.isOpen ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {r.isOpen ? t('openRecursive') : t('closedRecursive')}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        r.tcpPort53Open ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        TCP:53 {r.tcpPort53Open ? t('open') : t('closed')}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{r.riskDesc} · {r.latency}ms</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
