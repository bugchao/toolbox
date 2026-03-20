import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

const DNS_TYPES = ['A', 'AAAA', 'MX', 'TXT', 'NS', 'CNAME']

const ICONS: Record<string, string> = {
  root: '🌐',
  tld: '🏛️',
  authoritative: '🔑',
  result: '✅',
}

function StepCard({ step, isLast }: { step: any; isLast: boolean }) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-lg">
          {ICONS[step.icon] || '🔵'}
        </div>
        {!isLast && <div className="w-0.5 flex-1 bg-blue-200 dark:bg-blue-800 mt-1" />}
      </div>
      <div className="flex-1 pb-4">
        <div className="font-medium text-sm">{step.name}</div>
        <div className="text-xs text-gray-500 mb-2">{step.description}</div>
        {step.servers.length > 0 && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded p-2 text-xs font-mono mb-2">
            {step.servers.map((s: string) => <div key={s} className="text-gray-600 dark:text-gray-400">{s}</div>)}
          </div>
        )}
        {step.response && (
          <div className="text-xs text-blue-600 dark:text-blue-400">↩ {step.response}</div>
        )}
        {step.records && step.records.length > 0 && (
          <div className="mt-2 space-y-1">
            {step.records.map((r: string, i: number) => (
              <div key={i} className="text-xs font-mono bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-2 py-1 rounded">{r}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function DnsPathViz() {
  const { t } = useTranslation('toolDnsPathViz')
  const [domain, setDomain] = useState('')
  const [type, setType] = useState('A')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  const trace = async () => {
    if (!domain.trim()) return
    setLoading(true); setError(''); setResult(null)
    try {
      const res = await fetch('/api/dns/path-viz', {
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
          onKeyDown={(e) => e.key === 'Enter' && trace()}
        />
        <select
          className="border rounded px-2 py-2 dark:bg-gray-800 dark:border-gray-600"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          {DNS_TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>
        <button
          onClick={trace}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? t('tracing') : t('trace')}
        </button>
      </div>

      {error && <div className="text-red-500 text-sm p-3 bg-red-50 dark:bg-red-900/20 rounded">{error}</div>}

      {result && (
        <div className="border dark:border-gray-700 rounded p-4">
          <div className="text-sm font-medium mb-4 text-gray-600 dark:text-gray-400">
            {t('pathFor')} <span className="font-mono font-bold text-gray-900 dark:text-white">{result.domain}</span> ({result.type})
          </div>
          <div>
            {result.steps.map((step: any, i: number) => (
              <StepCard key={i} step={step} isLast={i === result.steps.length - 1} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
