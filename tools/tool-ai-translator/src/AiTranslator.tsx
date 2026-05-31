import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Button, Card, NoticeCard, PageHero, ParticlesBackground, TextArea } from '@toolbox/ui-kit'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeftRight,
  ClipboardCopy,
  Loader2,
  Send,
  Settings,
  Sparkles,
  Square,
  Trash2,
} from 'lucide-react'
import { LANGUAGES, type LangCode } from './lib/languages'
import { PROVIDERS, getProvider } from './lib/providers'
import { readProviderConfig, readSession, writeSession } from './lib/storage'
import { translate } from './lib/translate'
import SettingsDrawer from './components/SettingsDrawer'

type ProgressState = { loaded: number; total: number; text: string } | null

const AiTranslator: React.FC = () => {
  const { t } = useTranslation('toolAiTranslator')
  const [providerId, setProviderId] = useState<string>('openai')
  const [source, setSource] = useState<LangCode>('auto')
  const [target, setTarget] = useState<LangCode>('en')
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [progress, setProgress] = useState<ProgressState>(null)
  const [cfgVersion, setCfgVersion] = useState(0)
  const abortRef = useRef<AbortController | null>(null)

  // 初始：从 localStorage 恢复
  useEffect(() => {
    const s = readSession()
    if (s.providerId) setProviderId(s.providerId)
    if (s.source) setSource(s.source as LangCode)
    if (s.target) setTarget(s.target as LangCode)
  }, [])

  // 持久化当前选择
  useEffect(() => {
    writeSession({ providerId, source, target })
  }, [providerId, source, target])

  const provider = useMemo(() => getProvider(providerId), [providerId])
  const providerCfg = useMemo(
    () => readProviderConfig(providerId),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [providerId, cfgVersion],
  )

  const handleSwap = () => {
    if (source === 'auto') return
    const a = source
    setSource(target)
    setTarget(a)
  }

  const handleStop = () => {
    abortRef.current?.abort()
    abortRef.current = null
    setBusy(false)
  }

  const handleTranslate = useCallback(async () => {
    if (!provider) return
    if (!input.trim()) return
    setError(null)
    setOutput('')
    setProgress(null)
    setBusy(true)
    const ctrl = new AbortController()
    abortRef.current = ctrl

    try {
      let webllmStream: Parameters<typeof translate>[0]['webllmStream'] | undefined
      if (provider.kind === 'webllm') {
        const { ensureEngine, webllmStream: stream } = await import('./lib/webllm')
        const targetModel = providerCfg.model || provider.defaultModel
        await ensureEngine(targetModel, (r) => {
          setProgress({ loaded: r.progress, total: 1, text: r.text })
        })
        setProgress(null)
        webllmStream = stream
      }
      await translate({
        providerId,
        model: providerCfg.model || provider.defaultModel,
        baseUrl: providerCfg.baseUrl || provider.defaultBaseUrl,
        apiKey: providerCfg.apiKey,
        source,
        target,
        text: input,
        signal: ctrl.signal,
        onChunk: (chunk) => setOutput((cur) => cur + chunk),
        webllmStream,
      })
    } catch (e) {
      const msg = (e as Error).message ?? String(e)
      if (!ctrl.signal.aborted) setError(msg)
    } finally {
      if (abortRef.current === ctrl) abortRef.current = null
      setBusy(false)
    }
  }, [provider, providerId, providerCfg, input, source, target])

  const onInputKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      handleTranslate()
    }
  }

  const copyOutput = async () => {
    if (!output) return
    try { await navigator.clipboard.writeText(output) } catch { /* ignore */ }
  }

  const providerBadge = (() => {
    if (!provider) return null
    if (provider.kind === 'cloud' || provider.kind === 'custom') return t('badge.cloud')
    if (provider.kind === 'local') return t('badge.local')
    return t('badge.webllm')
  })()

  return (
    <div className="relative min-h-[70vh]">
      <ParticlesBackground preset="minimal" className="absolute inset-0" />
      <div className="relative z-10 space-y-6">
        <PageHero title={t('title')} description={t('description')} />

        <NoticeCard
          tone="info"
          title={t('notice.title')}
          description={t('notice.body')}
          icon={Sparkles}
        />

        <Card>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <select
              value={providerId}
              onChange={(e) => setProviderId(e.target.value)}
              className="rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
            >
              {PROVIDERS.map((p) => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
            {providerBadge && (
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] uppercase tracking-wide text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                {providerBadge}
              </span>
            )}
            <div className="ml-2 inline-flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <span>{t('header.model')}:</span>
              <code className="rounded bg-gray-100 px-1.5 py-0.5 text-gray-800 dark:bg-gray-800 dark:text-gray-100">
                {providerCfg.model || provider?.defaultModel || '—'}
              </code>
            </div>
            <span className="flex-1" />
            <Button type="button" variant="ghost" onClick={() => setSettingsOpen(true)}>
              <span className="inline-flex items-center gap-1.5">
                <Settings className="h-4 w-4" />
                {t('header.settings')}
              </span>
            </Button>
          </div>

          <div className="mb-4 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
            <select
              value={source}
              onChange={(e) => setSource(e.target.value as LangCode)}
              className="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>{t(l.i18nKey)}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleSwap}
              disabled={source === 'auto'}
              title={t('header.swap')}
              className="rounded-md border border-gray-300 p-1.5 text-gray-600 transition hover:border-gray-400 hover:bg-gray-50 disabled:opacity-30 dark:border-gray-700 dark:text-gray-300 dark:hover:border-gray-500 dark:hover:bg-gray-800"
            >
              <ArrowLeftRight className="h-4 w-4" />
            </button>
            <select
              value={target}
              onChange={(e) => setTarget(e.target.value as LangCode)}
              className="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
            >
              {LANGUAGES.filter((l) => l.code !== 'auto').map((l) => (
                <option key={l.code} value={l.code}>{t(l.i18nKey)}</option>
              ))}
            </select>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="flex flex-col">
              <div className="mb-1 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>{t('panel.input')} · {input.length}</span>
                <button
                  type="button"
                  onClick={() => setInput('')}
                  disabled={!input}
                  className="inline-flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-30"
                >
                  <Trash2 className="h-3 w-3" /> {t('panel.clear')}
                </button>
              </div>
              <TextArea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onInputKeyDown}
                placeholder={t('panel.inputPlaceholder')}
                rows={12}
              />
            </div>

            <div className="flex flex-col">
              <div className="mb-1 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>{t('panel.output')} · {output.length}</span>
                <button
                  type="button"
                  onClick={copyOutput}
                  disabled={!output}
                  className="inline-flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-30"
                >
                  <ClipboardCopy className="h-3 w-3" /> {t('panel.copy')}
                </button>
              </div>
              <TextArea value={output} readOnly placeholder={t('panel.outputPlaceholder')} rows={12} />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            {!busy ? (
              <Button onClick={handleTranslate} disabled={!input.trim()}>
                <span className="inline-flex items-center gap-1.5">
                  <Send className="h-4 w-4" />
                  {t('action.translate')}
                </span>
              </Button>
            ) : (
              <Button onClick={handleStop} variant="secondary">
                <span className="inline-flex items-center gap-1.5">
                  <Square className="h-4 w-4" />
                  {t('action.stop')}
                </span>
              </Button>
            )}
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {t('action.shortcut')}
            </span>
            {busy && (
              <span className="inline-flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                {progress ? t('action.loadingWebllm', { pct: Math.round(progress.loaded * 100) }) : t('action.streaming')}
              </span>
            )}
          </div>

          {progress && (
            <div className="mt-2">
              <div className="h-1.5 w-full overflow-hidden rounded bg-gray-200 dark:bg-gray-700">
                <div
                  className="h-full bg-indigo-500 transition-[width] duration-200"
                  style={{ width: `${Math.min(100, Math.max(0, progress.loaded * 100))}%` }}
                />
              </div>
              <p className="mt-1 truncate text-[11px] text-gray-500 dark:text-gray-400">{progress.text}</p>
            </div>
          )}

          {error && (
            <div className="mt-3 rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-700 dark:bg-rose-900/30 dark:text-rose-200">
              {error === 'missing_api_key' ? t('error.missingApiKey') :
                error === 'missing_model' ? t('error.missingModel') :
                  error === 'missing_base_url' ? t('error.missingBaseUrl') :
                    error === 'webllm_not_initialized' ? t('error.webllmNotInit') :
                      t('error.generic', { msg: error })}
            </div>
          )}
        </Card>
      </div>

      <SettingsDrawer
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onChanged={() => setCfgVersion((v) => v + 1)}
      />
    </div>
  )
}

export default AiTranslator
