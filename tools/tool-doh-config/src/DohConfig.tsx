import React, { useMemo, useState } from 'react'
import { PageHero, ParticlesBackground, CopyButton, Spinner, StatusBadge } from '@toolbox/ui-kit'
import { useToolStorage } from '@toolbox/storage'
import { useTranslation } from 'react-i18next'
import { ShieldCheck, Download, Plus, Trash2 } from 'lucide-react'
import { DOH_PROVIDERS } from './lib/providers'
import { measureProvider } from './lib/latency'
import { genFirefoxConfig, genChromeEdgeConfig, genMacConfig, genWindowsConfig, genLinuxConfig } from './lib/scriptGen'
import { downloadText } from './lib/download'
import type { DohProvider, LatencyResult, ConfigTarget } from './lib/types'

const TARGETS: ConfigTarget[] = ['firefox', 'chrome-edge', 'macos', 'windows', 'linux']
const RECORD_TYPES = ['A', 'AAAA', 'CNAME', 'MX', 'NS', 'TXT'] as const

const DohConfig: React.FC = () => {
  const { t } = useTranslation('toolDohConfig')
  const { data: customProviders, save: saveCustomProviders } = useToolStorage<DohProvider[]>('doh-config', 'customProviders', [])
  const allProviders = useMemo(() => [...DOH_PROVIDERS, ...customProviders], [customProviders])

  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [customUrl, setCustomUrl] = useState('')
  const [domain, setDomain] = useState('google.com')
  const [recordType, setRecordType] = useState<string>('A')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<LatencyResult[]>([])
  const [configFor, setConfigFor] = useState<string | null>(null)
  const [target, setTarget] = useState<ConfigTarget>('firefox')

  const [showAddForm, setShowAddForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newUrl, setNewUrl] = useState('')
  const [newProtocol, setNewProtocol] = useState<'json' | 'wire'>('json')
  const [newNeedsJsonAccept, setNewNeedsJsonAccept] = useState(true)

  const toggleSelected = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const allSelected = selected.size === allProviders.length
  const toggleAll = () => {
    setSelected(allSelected ? new Set() : new Set(allProviders.map((p) => p.id)))
  }

  const addCustomProvider = () => {
    const name = newName.trim()
    const url = newUrl.trim()
    if (!name || !url) return
    const provider: DohProvider = {
      id: crypto.randomUUID(),
      name,
      url,
      description: t('custom_provider_tag'),
      protocol: newProtocol,
      needsJsonAccept: newProtocol === 'json' ? newNeedsJsonAccept : false,
    }
    saveCustomProviders([...customProviders, provider])
    setNewName('')
    setNewUrl('')
    setNewProtocol('json')
    setNewNeedsJsonAccept(true)
    setShowAddForm(false)
  }

  const removeCustomProvider = (id: string) => {
    saveCustomProviders(customProviders.filter((p) => p.id !== id))
    setSelected((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }

  const handleTestLatency = async () => {
    const targets = allProviders.filter((p) => selected.has(p.id))
    const d = domain.trim()
    if (targets.length === 0 || !d) return
    setLoading(true)
    try {
      const all = await Promise.all(targets.map((p) => measureProvider(p, d, recordType)))
      all.sort((a, b) => (a.ok === b.ok ? a.avg - b.avg : a.ok ? -1 : 1))
      setResults(all)
    } finally {
      setLoading(false)
    }
  }

  const activeUrl = useMemo(() => {
    if (configFor) {
      const p = allProviders.find((x) => x.id === configFor)
      return p ? p.url : ''
    }
    return customUrl.trim()
  }, [configFor, customUrl, allProviders])

  const snippet = useMemo(() => {
    if (!activeUrl) return ''
    if (target === 'firefox') return genFirefoxConfig(activeUrl)
    if (target === 'chrome-edge') return genChromeEdgeConfig(activeUrl)
    if (target === 'macos') return genMacConfig(activeUrl)
    if (target === 'windows') return genWindowsConfig(activeUrl)
    return genLinuxConfig(activeUrl)
  }, [activeUrl, target])

  return (
    <div className="relative min-h-[60vh]">
      <ParticlesBackground preset="minimal" className="absolute inset-0" />
      <div className="relative z-10 max-w-4xl mx-auto space-y-6">
        <PageHero title={t('title')} description={t('description')} icon={ShieldCheck} />

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('providers_title')}</h2>
            <button
              type="button"
              onClick={toggleAll}
              className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              {allSelected ? t('deselect_all') : t('select_all')}
            </button>
          </div>
          <div className="space-y-2">
            {allProviders.map((p) => {
              const isCustom = customProviders.some((c) => c.id === p.id)
              return (
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
                  {isCustom && (
                    <button
                      type="button"
                      onClick={() => removeCustomProvider(p.id)}
                      aria-label={t('remove_provider')}
                      className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )
            })}
          </div>

          {showAddForm ? (
            <div className="mt-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 space-y-2">
              <div className="flex flex-wrap gap-2">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder={t('custom_provider_name_placeholder')}
                  className="flex-1 min-w-[8rem] px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <select
                  value={newProtocol}
                  onChange={(e) => setNewProtocol(e.target.value as 'json' | 'wire')}
                  className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="json">{t('protocol_json')}</option>
                  <option value="wire">{t('protocol_wire')}</option>
                </select>
              </div>
              <input
                type="text"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder={t('custom_provider_url_placeholder')}
                className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm font-mono focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              {newProtocol === 'json' && (
                <label className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <input
                    type="checkbox"
                    checked={newNeedsJsonAccept}
                    onChange={(e) => setNewNeedsJsonAccept(e.target.checked)}
                    className="rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500"
                  />
                  {t('needs_json_accept_label')}
                </label>
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={addCustomProvider}
                  disabled={!newName.trim() || !newUrl.trim()}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed text-white rounded-lg text-xs font-medium"
                >
                  {t('save_provider')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg text-xs font-medium"
                >
                  {t('cancel')}
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              <Plus className="w-3.5 h-3.5" />
              {t('add_custom_provider')}
            </button>
          )}

          <div className="flex flex-wrap gap-3 mt-4 mb-1">
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder={t('domain_placeholder')}
              className="flex-1 min-w-[10rem] px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <select
              value={recordType}
              onChange={(e) => setRecordType(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              {RECORD_TYPES.map((rt) => (
                <option key={rt} value={rt}>{rt}</option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleTestLatency}
            disabled={loading || selected.size === 0 || !domain.trim()}
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
                  <th className="text-left py-2 pl-4 font-semibold text-gray-700 dark:text-gray-300">{t('query_answer')}</th>
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
                        <td className="py-2 pl-4 font-mono text-xs text-gray-600 dark:text-gray-400">{r.answers.join(', ')}</td>
                      </>
                    ) : (
                      <td colSpan={4} className="py-2 text-right">
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
              <div className="absolute top-2 right-2 flex gap-2">
                {target === 'macos' && (
                  <button
                    type="button"
                    onClick={() => downloadText(snippet, 'doh.mobileconfig', 'application/x-apple-aspen-config')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-700 hover:bg-gray-600 text-gray-100"
                  >
                    <Download className="w-3.5 h-3.5" />
                    {t('download')}
                  </button>
                )}
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
