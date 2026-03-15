import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PageHero } from '@toolbox/ui-kit'
import { Globe, Loader2, CheckCircle, XCircle } from 'lucide-react'

interface DoHProvider {
  name: string
  regionKey: string
  buildUrl: (d: string, type: string) => string
  needsJsonAccept: boolean
}

const PROVIDERS: DoHProvider[] = [
  { name: 'Google DNS', regionKey: 'Google (全球)', buildUrl: (d, type) => `https://dns.google/resolve?name=${encodeURIComponent(d)}&type=${type}`, needsJsonAccept: false },
  { name: 'Cloudflare', regionKey: 'Cloudflare 1.1.1.1', buildUrl: (d, type) => `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(d)}&type=${type}`, needsJsonAccept: true },
  { name: 'Quad9', regionKey: 'Quad9 (安全)', buildUrl: (d, type) => `https://dns.quad9.org:5053/dns-query?name=${encodeURIComponent(d)}&type=${type}`, needsJsonAccept: true },
  { name: 'AdGuard', regionKey: 'AdGuard (广告过滤)', buildUrl: (d, type) => `https://dns.adguard-dns.com/dns-query?name=${encodeURIComponent(d)}&type=${type}`, needsJsonAccept: true },
  { name: 'OpenDNS', regionKey: 'Cisco OpenDNS', buildUrl: (d, type) => `https://doh.opendns.com/dns-query?name=${encodeURIComponent(d)}&type=${type}`, needsJsonAccept: true },
  { name: 'AliDNS', regionKey: '阿里公共 DNS', buildUrl: (d, type) => `https://dns.alidns.com/dns-query?name=${encodeURIComponent(d)}&type=${type}`, needsJsonAccept: true },
  { name: 'DNSPod', regionKey: '腾讯 DNSPod', buildUrl: (d, type) => `https://dns.pub/dns-query?name=${encodeURIComponent(d)}&type=${type}`, needsJsonAccept: true },
]

async function fetchDoh(
  url: string,
  provider: DoHProvider
): Promise<{ provider: string; regionKey: string; ok: boolean; time: number; answers: string[]; ttl?: number }> {
  const start = performance.now()
  try {
    const res = await fetch(url, {
      headers: provider.needsJsonAccept ? { Accept: 'application/dns-json' } : {},
    })
    const data = await res.json()
    const time = Math.round(performance.now() - start)
    if (data.Status !== 0) return { provider: provider.name, regionKey: provider.regionKey, ok: false, time, answers: [] }
    const answers = (data.Answer || []).map((a: { data: string }) => a.data)
    const ttl = data.Answer?.[0]?.TTL
    return { provider: provider.name, regionKey: provider.regionKey, ok: true, time, answers, ttl }
  } catch {
    return { provider: provider.name, regionKey: provider.regionKey, ok: false, time: Math.round(performance.now() - start), answers: [] }
  }
}

const DnsGlobalCheck: React.FC = () => {
  const { t } = useTranslation('toolDnsGlobalCheck')
  const [domain, setDomain] = useState('')
  const [recordType, setRecordType] = useState('A')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [rows, setRows] = useState<{ provider: string; regionKey: string; ok: boolean; time: number; answers: string[]; ttl?: number }[]>([])

  const handleQuery = async () => {
    const d = domain.trim().toLowerCase()
    if (!d) {
      setError(t('error_empty'))
      return
    }
    setError('')
    setRows([])
    setLoading(true)
    try {
      const results = await Promise.all(
        PROVIDERS.map((p) => fetchDoh(p.buildUrl(d, recordType), p))
      )
      setRows(results)
    } catch (e) {
      setError((e as Error).message)
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('domain_label')}</label>
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder={t('domain_placeholder')}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 outline-none"
              onKeyDown={(e) => e.key === 'Enter' && handleQuery()}
            />
          </div>
          <div className="w-full sm:w-32">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('type_label')}</label>
            <select
              value={recordType}
              onChange={(e) => setRecordType(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="A">A</option>
              <option value="AAAA">AAAA</option>
              <option value="CNAME">CNAME</option>
              <option value="MX">MX</option>
              <option value="NS">NS</option>
              <option value="TXT">TXT</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={handleQuery}
              disabled={loading}
              className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg font-medium flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Globe className="w-5 h-5" />}
              {loading ? t('loading') : t('query_btn')}
            </button>
          </div>
        </div>
        {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
      </div>

      {rows.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">{t('provider')}</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">{t('region')}</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300 w-20">{t('time_ms')}</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">{t('results')}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/20">
                    <td className="py-3 px-4 font-medium text-gray-800 dark:text-gray-200">{r.provider}</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{r.regionKey}</td>
                    <td className="py-3 px-4">
                      {r.ok ? (
                        <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" /> {r.time} ms
                        </span>
                      ) : (
                        <span className="text-red-600 dark:text-red-400 flex items-center gap-1">
                          <XCircle className="w-4 h-4" /> {t('status_fail')}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-gray-700 dark:text-gray-300 text-xs break-all">
                      {r.ok ? (r.answers.length ? r.answers.join(', ') : '—') : '—'}
                    </td>
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

export default DnsGlobalCheck
