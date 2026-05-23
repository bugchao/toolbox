import React, { useCallback, useMemo, useState } from 'react'
import {
  ShieldOff,
  Copy,
  Check,
  Download,
  Eraser,
  Plus,
  Trash2,
  ChevronDown,
  Info,
  ArrowLeftRight,
} from 'lucide-react'
import { PageHero } from '@toolbox/ui-kit'
import { useToolStorage } from '@toolbox/storage'
import { useTranslation } from 'react-i18next'

import { RULES, applyMasking, type RuleId, type CustomRule } from './rules'

const NAMESPACE = 'toolDataMasking'

const SAMPLE_INPUT = `John Doe — john.doe@example.com / 13812345678
身份证 110101199001011234，银行卡 6212340123456789
登录 IP 192.168.1.100，MAC AA:BB:CC:DD:EE:FF
车牌 京A12345 / 沪BD12345
JWT: eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NSJ9.abc123def456`

interface PersistedState {
  enabledBuiltIn: RuleId[]
  customRules: CustomRule[]
}

const DEFAULT_ENABLED: RuleId[] = [
  'mobile',
  'idCard',
  'email',
  'bankCard',
  'ipv4',
  'ipv6',
  'mac',
  'plate',
  'jwt',
]

const DEFAULT_STATE: PersistedState = {
  enabledBuiltIn: DEFAULT_ENABLED,
  customRules: [],
}

const DataMasking: React.FC = () => {
  const { t } = useTranslation(NAMESPACE)
  const { data, save, loading } = useToolStorage<PersistedState>(
    'data-masking',
    'state',
    DEFAULT_STATE,
  )

  const [input, setInput] = useState(SAMPLE_INPUT)
  const [copied, setCopied] = useState(false)
  const [customOpen, setCustomOpen] = useState(false)
  const [draft, setDraft] = useState<{ name: string; pattern: string; flags: string; replacement: string }>({
    name: '',
    pattern: '',
    flags: 'g',
    replacement: '***',
  })
  const [draftError, setDraftError] = useState('')

  const enabledSet = useMemo(() => new Set(data.enabledBuiltIn), [data.enabledBuiltIn])

  const result = useMemo(
    () => applyMasking(input, enabledSet, data.customRules),
    [input, enabledSet, data.customRules],
  )

  const totalHits = useMemo(() => {
    let n = 0
    for (const v of Object.values(result.counts)) n += v ?? 0
    for (const v of Object.values(result.customCounts)) n += v
    return n
  }, [result])

  const toggleBuiltIn = (id: RuleId) => {
    const next = enabledSet.has(id)
      ? data.enabledBuiltIn.filter((x) => x !== id)
      : [...data.enabledBuiltIn, id]
    void save({ ...data, enabledBuiltIn: next })
  }

  const toggleCustom = (id: string) => {
    void save({
      ...data,
      customRules: data.customRules.map((c) =>
        c.id === id ? { ...c, enabled: !c.enabled } : c,
      ),
    })
  }

  const addCustom = () => {
    const pattern = draft.pattern.trim()
    if (!pattern) return
    // Validate regex syntax
    try {
      const flags = draft.flags.includes('g') ? draft.flags : draft.flags + 'g'
      new RegExp(pattern, flags)
    } catch (e) {
      setDraftError((e as Error).message)
      return
    }
    const item: CustomRule = {
      id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: draft.name.trim() || pattern.slice(0, 24),
      pattern,
      flags: draft.flags,
      replacement: draft.replacement,
      enabled: true,
    }
    void save({ ...data, customRules: [...data.customRules, item] })
    setDraft({ name: '', pattern: '', flags: 'g', replacement: '***' })
    setDraftError('')
  }

  const removeCustom = (id: string) => {
    void save({ ...data, customRules: data.customRules.filter((c) => c.id !== id) })
  }

  const copyOutput = useCallback(async () => {
    if (!result.output) return
    try {
      await navigator.clipboard.writeText(result.output)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* ignore */
    }
  }, [result.output])

  const downloadOutput = () => {
    const blob = new Blob([result.output], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'masked.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="w-full space-y-6">
        <PageHero title={t('title')} description={t('description')} />
        <div className="text-center text-sm text-gray-400 py-12">{t('loading')}</div>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6 pb-24">
      <PageHero title={t('title')} description={t('description')} />

      <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2 flex items-start gap-2">
        <Info className="w-4 h-4 mt-0.5 shrink-0" />
        <span>{t('disclaimer')}</span>
      </div>

      {/* Rule toggles */}
      <section className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
        <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
          <ShieldOff className="w-4 h-4" /> {t('rulesLabel')}
          <span className="text-xs text-gray-400 font-normal">
            ({data.enabledBuiltIn.length}/{RULES.length})
          </span>
        </h2>
        <div className="flex flex-wrap gap-2">
          {RULES.map((r) => {
            const on = enabledSet.has(r.id)
            const hits = result.counts[r.id] ?? 0
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => toggleBuiltIn(r.id)}
                className={`px-3 py-1.5 text-sm rounded-full border transition-colors flex items-center gap-1.5 ${
                  on
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-500 border-gray-300 hover:border-gray-400'
                }`}
                title={t(`rule.${r.id}.example`)}
              >
                {t(`rule.${r.id}.name`)}
                {on && hits > 0 && (
                  <span className="inline-flex items-center justify-center px-1.5 py-0 min-w-[1.25rem] h-5 text-xs bg-white/20 rounded-full">
                    {hits}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </section>

      {/* Custom rules */}
      <section className="rounded-lg border border-gray-200 bg-white">
        <button
          type="button"
          onClick={() => setCustomOpen((v) => !v)}
          aria-expanded={customOpen}
          className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t('customLabel')} ({data.customRules.length})
          <ChevronDown
            className={`w-4 h-4 ml-auto text-gray-400 transition-transform ${
              customOpen ? 'rotate-180' : ''
            }`}
          />
        </button>
        {customOpen && (
          <div className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr_auto_1fr_auto] gap-2">
              <input
                type="text"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder={t('custom.namePlaceholder')}
                className="px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="text"
                value={draft.pattern}
                onChange={(e) => {
                  setDraft({ ...draft, pattern: e.target.value })
                  setDraftError('')
                }}
                placeholder={t('custom.patternPlaceholder')}
                className="px-2 py-1.5 text-sm border border-gray-300 rounded-md font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="text"
                value={draft.flags}
                onChange={(e) => setDraft({ ...draft, flags: e.target.value })}
                placeholder="g"
                className="w-16 px-2 py-1.5 text-sm border border-gray-300 rounded-md font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="text"
                value={draft.replacement}
                onChange={(e) => setDraft({ ...draft, replacement: e.target.value })}
                placeholder={t('custom.replacementPlaceholder')}
                className="px-2 py-1.5 text-sm border border-gray-300 rounded-md font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={addCustom}
                disabled={!draft.pattern.trim()}
                className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-300 transition-colors flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> {t('custom.add')}
              </button>
            </div>
            {draftError && (
              <p className="text-xs text-red-600 font-mono">{draftError}</p>
            )}
            <p className="text-xs text-gray-400">{t('custom.hint')}</p>
            {data.customRules.length > 0 ? (
              <ul className="divide-y divide-gray-100">
                {data.customRules.map((c) => {
                  const hits = result.customCounts[c.id] ?? 0
                  return (
                    <li key={c.id} className="py-2 flex items-start gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={c.enabled}
                        onChange={() => toggleCustom(c.id)}
                        className="mt-1 rounded border-gray-300"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-800">{c.name}</div>
                        <div className="text-xs text-gray-500 font-mono break-all">
                          /{c.pattern}/{c.flags} → {c.replacement || '∅'}
                        </div>
                      </div>
                      {hits > 0 && c.enabled && (
                        <span className="text-xs text-indigo-600 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                          ×{hits}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeCustom(c.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <p className="text-xs text-gray-400">{t('custom.empty')}</p>
            )}
          </div>
        )}
      </section>

      {/* Input + output side-by-side */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">{t('inputLabel')}</label>
            <button
              type="button"
              onClick={() => setInput('')}
              className="text-xs text-gray-500 hover:text-red-500 inline-flex items-center gap-1"
            >
              <Eraser className="w-3 h-3" /> {t('clear')}
            </button>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('inputPlaceholder')}
            className="w-full h-[460px] px-3 py-2 text-sm border border-gray-300 rounded-md font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            spellCheck={false}
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              {t('outputLabel')}{' '}
              <span className="text-xs text-gray-400">
                ({t('hitCount', { count: totalHits })})
              </span>
            </label>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={copyOutput}
                disabled={!result.output}
                className="px-2 py-1 text-xs text-gray-700 hover:text-indigo-600 border border-gray-200 rounded hover:border-indigo-300 disabled:opacity-40 transition-colors flex items-center gap-1"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? t('copied') : t('copy')}
              </button>
              <button
                type="button"
                onClick={downloadOutput}
                disabled={!result.output}
                className="px-2 py-1 text-xs text-gray-700 hover:text-indigo-600 border border-gray-200 rounded hover:border-indigo-300 disabled:opacity-40 transition-colors flex items-center gap-1"
              >
                <Download className="w-3 h-3" /> {t('download')}
              </button>
              <button
                type="button"
                onClick={() => setInput(result.output)}
                disabled={!result.output || result.output === input}
                className="px-2 py-1 text-xs text-gray-700 hover:text-indigo-600 border border-gray-200 rounded hover:border-indigo-300 disabled:opacity-40 transition-colors flex items-center gap-1"
                title={t('replaceInputTitle')}
              >
                <ArrowLeftRight className="w-3 h-3" /> {t('replaceInput')}
              </button>
            </div>
          </div>
          <textarea
            value={result.output}
            readOnly
            placeholder={t('outputPlaceholder')}
            className="w-full h-[460px] px-3 py-2 text-sm border border-gray-300 rounded-md font-mono bg-gray-50 resize-none"
            spellCheck={false}
          />
        </div>
      </section>
    </div>
  )
}

export default DataMasking
