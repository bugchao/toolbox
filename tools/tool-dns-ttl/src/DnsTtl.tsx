import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PageHero } from '@toolbox/ui-kit'
import { Search, Loader2, Clock, Info } from 'lucide-react'

const RECORD_TYPES = ['A', 'AAAA', 'CNAME', 'MX', 'NS', 'TXT', 'SOA'] as const
const DOH_URL = 'https://dns.google/resolve'

function getTtlSuggestion(ttl: number, t: (key: string) => string): string {
  if (ttl <= 300) return t('tip_low')
  if (ttl <= 3600) return t('tip_medium')
  return t('tip_high')
}

async function queryDoh(domain: string, type: string): Promise<{ Answer?: { name: string; type: number; TTL: number; data: string }[]; Status: number }> {
  const res = await fetch(`${DOH_URL}?name=${encodeURIComponent(domain)}&type=${type}`)
  if (!res.ok) throw new Error('Network error')
  return res.json()
}

const DnsTtl: React.FC = () => {
  const { t } = useTranslation('toolDnsTtl')
  const [domain, setDomain] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [results, setResults] = useState<{ type: string; ttl: number; value: string; suggestion: string }[]>([])

  const handleQuery = async () => {
    const d = domain.trim().toLowerCase()
    if (!d) {
      setError(t('error_empty'))
      return
    }
    setError('')
    setResults([])
    setLoading(true)
    try {
      const rows: { type: string; ttl: number; value: string; suggestion: string }[] = []
      for (const type of RECORD_TYPES) {
        try {
          const data = await queryDoh(d, type)
          if (data.Status !== 0 || !data.Answer?.length) continue
          for (const a of data.Answer) {
            rows.push({
              type,
              ttl: a.TTL,
              value: a.data,
              suggestion: getTtlSuggestion(a.TTL, t),
            })
          }
        } catch {
          // skip type on failure
        }
      }
      setResults(rows)
      if (rows.length === 0) setError(t('error_query'))
    } catch (e) {
      setError((e as Error).message || t('error_query'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <PageHero title={t('title')} description={t('description')} className="mb-8" />

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('domain_label')}
            </label>
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder={t('domain_placeholder')}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              onKeyDown={(e) => e.key === 'Enter' && handleQuery()}
            />
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={handleQuery}
              disabled={loading}
              className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
              {loading ? t('loading') : t('query_btn')}
            </button>
          </div>
        </div>
        {error && (
          <p className="mt-3 text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
            <Info className="w-4 h-4 shrink-0" />{error}
          </p>
        )}
      </div>

      {results.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">{t('record_type')}</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                    <Clock className="w-4 h-4" /> {t('ttl')}
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">{t('value')}</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">{t('suggestion')}</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={i} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/20">
                    <td className="py-3 px-4 font-mono text-indigo-600 dark:text-indigo-400">{r.type}</td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{r.ttl}</td>
                    <td className="py-3 px-4 font-mono text-gray-800 dark:text-gray-200 break-all max-w-xs truncate" title={r.value}>{r.value}</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400 text-xs max-w-sm">{r.suggestion}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default DnsTtl
