import React, { useMemo, useState } from 'react'
import { PageHero, ParticlesBackground, CopyButton, Spinner, StatusBadge } from '@toolbox/ui-kit'
import { useTranslation } from 'react-i18next'
import { ShieldCheck } from 'lucide-react'
import { DOH_PROVIDERS } from './lib/providers'
import { measureProvider } from './lib/latency'
import { genFirefoxConfig, genChromeEdgeConfig, genWindowsConfig, genLinuxConfig } from './lib/scriptGen'
import type { LatencyResult, ConfigTarget } from './lib/types'

const TARGETS: ConfigTarget[] = ['firefox', 'chrome-edge', 'windows', 'linux']

const DohConfig: React.FC = () => {
  const { t } = useTranslation('toolDohConfig')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [customUrl, setCustomUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<LatencyResult[]>([])
  const [configFor, setConfigFor] = useState<string | null>(null)
  const [target, setTarget] = useState<ConfigTarget>('firefox')

  const toggleSelected = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleTestLatency = async () => {
    const targets = DOH_PROVIDERS.filter((p) => selected.has(p.id))
    if (targets.length === 0) return
    setLoading(true)
    try {
      const all = await Promise.all(targets.map(measureProvider))
      all.sort((a, b) => (a.ok === b.ok ? a.avg - b.avg : a.ok ? -1 : 1))
      setResults(all)
    } finally {
      setLoading(false)
    }
  }

  const activeUrl = useMemo(() => {
    if (configFor) {
      const p = DOH_PROVIDERS.find((x) => x.id === configFor)
      return p ? p.url : ''
    }
    return customUrl.trim()
  }, [configFor, customUrl])

  const snippet = useMemo(() => {
    if (!activeUrl) return ''
    if (target === 'firefox') return genFirefoxConfig(activeUrl)
    if (target === 'chrome-edge') return genChromeEdgeConfig(activeUrl)
    if (target === 'windows') return genWindowsConfig(activeUrl)
    return genLinuxConfig(activeUrl)
  }, [activeUrl, target])

  return (
    <div className="relative min-h-[60vh]">
      <ParticlesBackground preset="minimal" className="absolute inset-0" />
      <div className="relative z-10 max-w-4xl mx-auto space-y-6">
        <PageHero title={t('title')} description={t('description')} icon={ShieldCheck} />

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">{t('providers_title')}</h2>
          <div className="space-y-2">
            {DOH_PROVIDERS.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/30"
              >
                <input
                  type="checkbox"
                  checked={selected.has(p.id)}
                  onChange={() => toggleSelected(p.id)}
                  className="rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setConfigFor(p.id)}
                  className={`flex-1 text-left text-sm ${configFor === p.id ? 'text-indigo-600 dark:text-indigo-400 font-medium' : 'text-gray-800 dark:text-gray-200'}`}
                >
                  {p.name}
                  <span className="text-gray-400 dark:text-gray-500 font-mono ml-2 text-xs">{p.url}</span>
                </button>
                <span className="text-xs text-gray-400 dark:text-gray-500">{p.description}</span>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleTestLatency}
            disabled={loading || selected.size === 0}
            className="mt-4 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium flex items-center gap-2"
          >
            {loading && <Spinner size="sm" />}
            {loading ? t('testing') : t('test_latency')}
          </button>

          {results.length > 0 && (
            <table className="w-full text-sm mt-4">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-600">
                  <th className="text-left py-2 font-semibold text-gray-700 dark:text-gray-300">{t('providers_title')}</th>
                  <th className="text-right py-2 font-semibold text-gray-700 dark:text-gray-300">{t('latency_avg')}</th>
                  <th className="text-right py-2 font-semibold text-gray-700 dark:text-gray-300">{t('latency_min')}</th>
                  <th className="text-right py-2 font-semibold text-gray-700 dark:text-gray-300">{t('latency_max')}</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr key={r.id} className="border-b border-gray-100 dark:border-gray-700/50">
                    <td className="py-2 text-gray-800 dark:text-gray-200">{r.name}</td>
                    {r.ok ? (
                      <>
                        <td className="py-2 text-right font-mono text-indigo-600 dark:text-indigo-400">{r.avg} ms</td>
                        <td className="py-2 text-right font-mono text-gray-600 dark:text-gray-400">{r.min} ms</td>
                        <td className="py-2 text-right font-mono text-gray-600 dark:text-gray-400">{r.max} ms</td>
                      </>
                    ) : (
                      <td colSpan={3} className="py-2 text-right">
                        <StatusBadge level="danger" label={t('latency_failed')} />
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">{t('config_title')}</h2>

          <input
            type="text"
            value={customUrl}
            onChange={(e) => {
              setCustomUrl(e.target.value)
              setConfigFor(null)
            }}
            placeholder={t('custom_url_placeholder')}
            className="w-full px-4 py-2 mb-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />

          <div className="flex gap-2 mb-3 flex-wrap">
            {TARGETS.map((tg) => (
              <button
                key={tg}
                type="button"
                onClick={() => setTarget(tg)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium ${
                  target === tg
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}
              >
                {t(`target_${tg.replace('-', '_')}`)}
              </button>
            ))}
          </div>

          {snippet ? (
            <div className="relative">
              <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 text-xs overflow-x-auto whitespace-pre-wrap">
                {snippet}
              </pre>
              <div className="absolute top-2 right-2">
                <CopyButton value={snippet} label={t('copy')} copiedLabel={t('copied')} variant="button" size="sm" />
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-400 dark:text-gray-500">{t('select_provider_hint')}</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default DohConfig
