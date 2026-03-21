import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

export default function DnsAuthoritative() {
  const { t } = useTranslation('toolDnsAuthoritative')
  const [domain, setDomain] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  const check = async () => {
    if (!domain.trim()) return
    setLoading(true); setError(''); setResult(null)
    try {
      const res = await fetch('/api/dns/authoritative', {
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
          onKeyDown={(e) => e.key === 'Enter' && check()}
        />
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
          <div className={`p-3 rounded text-sm font-medium ${
            result.isConsistent ? 'bg-green-50 text-green-700 dark:bg-green-900/20' : 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20'
          }`}>{result.summary}</div>

          {/* NS 服务器列表 */}
          <div className="border dark:border-gray-700 rounded overflow-hidden">
            <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 text-sm font-medium">{t('nsServers')}</div>
            <div className="divide-y dark:divide-gray-700">
              {result.nsDetails.map((ns: any) => (
                <div key={ns.ns} className="px-4 py-3">
                  <div className="font-mono text-sm font-medium">{ns.ns}</div>
                  {ns.ips.length > 0 && (
                    <div className="text-xs text-gray-500 mt-1">{ns.ips.join(', ')}</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 解析器一致性 */}
          <div className="border dark:border-gray-700 rounded overflow-hidden">
            <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 text-sm font-medium">{t('consistency')}</div>
            <div className="divide-y dark:divide-gray-700">
              {result.resolverResults.map((r: any) => (
                <div key={r.ip} className="px-4 py-3 flex justify-between items-center">
                  <div>
                    <span className="font-medium text-sm">{r.resolver}</span>
                    <span className="text-xs text-gray-400 ml-2 font-mono">{r.ip}</span>
                  </div>
                  <div className={`text-xs px-2 py-1 rounded ${
                    r.ok ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {r.ok ? (r.ns || []).join(', ') : r.error}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SOA */}
          {result.soa && (
            <div className="border dark:border-gray-700 rounded p-4">
              <div className="text-sm font-medium mb-2">{t('soa')}</div>
              <div className="text-xs font-mono text-gray-600 dark:text-gray-400 space-y-1">
                <div>Primary NS: {result.soa.nsname}</div>
                <div>Admin: {result.soa.hostmaster}</div>
                <div>Serial: {result.soa.serial} | TTL: {result.soa.minttl}s</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
