import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PageHero } from '@toolbox/ui-kit'
import { Activity, Loader2, Info } from 'lucide-react'

const RUNS = 5
const RECORD_TYPES = ['A', 'AAAA', 'CNAME', 'MX', 'NS', 'TXT'] as const

interface DoHProvider {
  id: string
  name: string
  buildUrl: (domain: string, type: string) => string
  needsJsonAccept: boolean
}

const PRESET_PROVIDERS: DoHProvider[] = [
  {
    id: 'google',
    name: 'Google DNS (8.8.8.8 DoH)',
    buildUrl: (d, type) => `https://dns.google/resolve?name=${encodeURIComponent(d)}&type=${type}`,
    needsJsonAccept: false,
  },
  {
    id: 'cloudflare',
    name: 'Cloudflare (1.1.1.1 DoH)',
    buildUrl: (d, type) => `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(d)}&type=${type}`,
    needsJsonAccept: true,
  },
  {
    id: 'quad9',
    name: 'Quad9 (9.9.9.9 DoH)',
    buildUrl: (d, type) => `https://dns.quad9.org:5053/dns-query?name=${encodeURIComponent(d)}&type=${type}`,
    needsJsonAccept: true,
  },
]

async function measureOne(url: string, needsJsonAccept: boolean): Promise<number> {
  const start = performance.now()
  await fetch(url, { headers: needsJsonAccept ? { Accept: 'application/dns-json' } : {} })
  return Math.round(performance.now() - start)
}

function buildCustomUrl(base: string, domain: string, type: string): string {
  const u = base.trim().replace(/\?$/, '')
  const sep = u.includes('?') ? '&' : '?'
  return `${u}${sep}name=${encodeURIComponent(domain)}&type=${type}`
}

const DnsPerformance: React.FC = () => {
  const { t } = useTranslation('toolDnsPerformance')
  const [domain, setDomain] = useState('google.com')
  const [recordType, setRecordType] = useState<string>('A')
  const [selectedPresets, setSelectedPresets] = useState<Set<string>>(new Set(['google', 'cloudflare', 'quad9']))
  const [customDoH, setCustomDoH] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<{ name: string; times: number[]; avg: number; min: number; max: number }[]>([])

  const togglePreset = (id: string) => {
    setSelectedPresets((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleTest = async () => {
    const d = domain.trim().toLowerCase()
    if (!d) return
    setLoading(true)
    setResults([])
    try {
      const list: { name: string; buildUrl: (domain: string, type: string) => string; needsJsonAccept: boolean }[] = []
      PRESET_PROVIDERS.forEach((p) => {
        if (selectedPresets.has(p.id)) list.push({ name: p.name, buildUrl: p.buildUrl, needsJsonAccept: p.needsJsonAccept })
      })
      if (customDoH.trim()) {
        list.push({
          name: t('custom_server_name'),
          buildUrl: (dom, typ) => buildCustomUrl(customDoH, dom, typ),
          needsJsonAccept: true,
        })
      }
      if (list.length === 0) {
        setLoading(false)
        return
      }
      const all: { name: string; times: number[]; avg: number; min: number; max: number }[] = []
      for (const p of list) {
        const url = p.buildUrl(d, recordType)
        const times: number[] = []
        for (let i = 0; i < RUNS; i++) {
          try {
            const ms = await measureOne(url, p.needsJsonAccept)
            times.push(ms)
          } catch {
            times.push(-1)
          }
        }
        const valid = times.filter((x) => x >= 0)
        const avg = valid.length ? Math.round(valid.reduce((a, b) => a + b, 0) / valid.length) : 0
        const min = valid.length ? Math.min(...valid) : 0
        const max = valid.length ? Math.max(...valid) : 0
        all.push({ name: p.name, times, avg, min, max })
      }
      setResults(all)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <PageHero title={t('title')} description={t('description')} className="mb-8" />

      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6 flex gap-3">
        <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-amber-800 dark:text-amber-200 text-sm">{t('browser_note_title')}</p>
          <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">{t('browser_note')}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('domain_label')}</label>
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder={t('domain_placeholder')}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('type_label')}</label>
            <select
              value={recordType}
              onChange={(e) => setRecordType(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              {RECORD_TYPES.map((typ) => (
                <option key={typ} value={typ}>{typ}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('servers_label')}</label>
          <div className="flex flex-wrap gap-4">
            {PRESET_PROVIDERS.map((p) => (
              <label key={p.id} className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedPresets.has(p.id)}
                  onChange={() => togglePreset(p.id)}
                  className="rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{p.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('custom_doh_label')}</label>
          <input
            type="url"
            value={customDoH}
            onChange={(e) => setCustomDoH(e.target.value)}
            placeholder={t('custom_doh_placeholder')}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
          />
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {t('runs')}: {RUNS}
        </p>
        <button
          type="button"
          onClick={handleTest}
          disabled={loading || (selectedPresets.size === 0 && !customDoH.trim())}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed text-white rounded-lg font-medium flex items-center gap-2"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Activity className="w-5 h-5" />}
          {loading ? t('loading') : t('test_btn')}
        </button>
      </div>

      {results.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50">
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">{t('provider')}</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">{t('avg_ms')}</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">{t('min_ms')}</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">{t('max_ms')}</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">{t('success')}</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={i} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/20">
                  <td className="py-3 px-4 font-medium text-gray-800 dark:text-gray-200">{r.name}</td>
                  <td className="py-3 px-4 text-right text-indigo-600 dark:text-indigo-400 font-mono">{r.avg}</td>
                  <td className="py-3 px-4 text-right text-gray-600 dark:text-gray-400 font-mono">{r.min}</td>
                  <td className="py-3 px-4 text-right text-gray-600 dark:text-gray-400 font-mono">{r.max}</td>
                  <td className="py-3 px-4 text-right text-gray-600 dark:text-gray-400">
                    {r.times.filter((x) => x >= 0).length}/{RUNS}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default DnsPerformance
