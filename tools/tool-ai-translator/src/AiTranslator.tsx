import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Button, Card, NoticeCard, PageHero, ParticlesBackground, TextArea } from '@toolbox/ui-kit'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeftRight,
  BookMarked,
  ClipboardCopy,
  Eye,
  FileText,
  History,
  Loader2,
  Send,
  Settings,
  Sparkles,
  Square,
  Trash2,
  Type,
  Volume2,
  VolumeX,
} from 'lucide-react'
import { LANGUAGES, type LangCode } from './lib/languages'
import { PROVIDERS, getProvider } from './lib/providers'
import { readProviderConfig } from './lib/storage'
import { isSpeechSupported, speak, stopSpeaking } from './lib/speech'
import { translate } from './lib/translate'
import {
  addEntry as addHistoryEntry,
  readHistory,
  readSettings as readHistorySettings,
  writeHistory,
  type HistoryEntry,
} from './lib/history'
import {
  applicable as glossaryApplicable,
  formatPromptInjection as glossaryFormat,
  readGlossary,
} from './lib/glossary'
import { usePersistedSession } from './hooks/usePersistedSession'
import SettingsDrawer from './components/SettingsDrawer'
import HistoryDrawer from './components/HistoryDrawer'
import GlossaryDrawer from './components/GlossaryDrawer'
import FilesPanel from './components/FilesPanel'
import MarkdownView from './components/MarkdownView'

type ProgressState = { loaded: number; total: number; text: string } | null

const AiTranslator: React.FC = () => {
  const { t } = useTranslation('toolAiTranslator')
  // providerId / source / target 通过专用 hook 完成「先恢复后持久化」的安全顺序，
  // 避免首屏挂载时用默认值覆盖存档（issue: 切到 WebLLM 刷新后回到 OpenAI）。
  const {
    providerId, source, target,
    setProviderId, setSource, setTarget,
  } = usePersistedSession({ providerId: 'openai', source: 'auto', target: 'en' })
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [historyTick, setHistoryTick] = useState(0)
  const [glossaryOpen, setGlossaryOpen] = useState(false)
  const [glossaryTick, setGlossaryTick] = useState(0)
  const [progress, setProgress] = useState<ProgressState>(null)
  const [cfgVersion, setCfgVersion] = useState(0)
  const [speakingPanel, setSpeakingPanel] = useState<'input' | 'output' | null>(null)
  const [mode, setMode] = useState<'text' | 'files'>('text')
  const [outputView, setOutputView] = useState<'raw' | 'rendered'>('raw')
  const speechOk = useMemo(() => isSpeechSupported(), [])
  const abortRef = useRef<AbortController | null>(null)

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
      let finalOutput = ''
      // 注入当前文本对应的术语表条目
      const glossarySnippet = glossaryFormat(
        glossaryApplicable(readGlossary(), source, target, input),
      )
      await translate({
        providerId,
        model: providerCfg.model || provider.defaultModel,
        baseUrl: providerCfg.baseUrl || provider.defaultBaseUrl,
        apiKey: providerCfg.apiKey,
        source,
        target,
        text: input,
        glossary: glossarySnippet || undefined,
        signal: ctrl.signal,
        onChunk: (chunk) => {
          finalOutput += chunk
          setOutput((cur) => cur + chunk)
        },
        webllmStream,
      })
      // 翻译完整成功（未被中断 / 未抛错），写入历史
      if (!ctrl.signal.aborted && finalOutput.trim()) {
        const cur = readHistory()
        const next = addHistoryEntry(cur, {
          providerId, source, target, input, output: finalOutput,
        }, readHistorySettings())
        writeHistory(next)
        setHistoryTick((t) => t + 1)
      }
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

  /**
   * 给 FilesPanel 用的单段翻译入口：闭包了当前 provider / 模型 / 语种，
   * 复用 translate() 管线，把流式 chunk 聚合成完整字符串返回。
   */
  const translateChunkForFiles = useCallback(async (text: string, signal?: AbortSignal): Promise<string> => {
    if (!provider) throw new Error('no provider')
    let webllmStream: Parameters<typeof translate>[0]['webllmStream'] | undefined
    if (provider.kind === 'webllm') {
      const mod = await import('./lib/webllm')
      await mod.ensureEngine(providerCfg.model || provider.defaultModel)
      webllmStream = mod.webllmStream
    }
    let acc = ''
    // 每段独立计算 glossary 命中，避免在长文里漏掉只在尾部出现的术语
    const glossarySnippet = glossaryFormat(
      glossaryApplicable(readGlossary(), source, target, text),
    )
    await translate({
      providerId,
      model: providerCfg.model || provider.defaultModel,
      baseUrl: providerCfg.baseUrl || provider.defaultBaseUrl,
      apiKey: providerCfg.apiKey,
      source,
      target,
      text,
      glossary: glossarySnippet || undefined,
      signal,
      onChunk: (c) => { acc += c },
      webllmStream,
    })
    return acc
  }, [provider, providerId, providerCfg, source, target, glossaryTick])

  const copyOutput = async () => {
    if (!output) return
    try { await navigator.clipboard.writeText(output) } catch { /* ignore */ }
  }

  // 卸载时停止朗读，避免残音
  useEffect(() => () => { stopSpeaking() }, [])

  const handleSpeak = (panel: 'input' | 'output') => {
    if (speakingPanel === panel) {
      stopSpeaking()
      setSpeakingPanel(null)
      return
    }
    const text = panel === 'input' ? input : output
    // 输入侧若选了「自动检测」就让浏览器自选 voice
    const lang = panel === 'input' ? (source === 'auto' ? undefined : source) : target
    const ok = speak(text, lang, {
      onStart: () => setSpeakingPanel(panel),
      onEnd: () => setSpeakingPanel((cur) => (cur === panel ? null : cur)),
      onError: () => setSpeakingPanel((cur) => (cur === panel ? null : cur)),
    })
    if (!ok) setSpeakingPanel(null)
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
            <Button type="button" variant="ghost" onClick={() => setGlossaryOpen(true)}>
              <span className="inline-flex items-center gap-1.5">
                <BookMarked className="h-4 w-4" />
                {t('header.glossary')}
              </span>
            </Button>
            <Button type="button" variant="ghost" onClick={() => setHistoryOpen(true)}>
              <span className="inline-flex items-center gap-1.5">
                <History className="h-4 w-4" />
                {t('header.history')}
              </span>
            </Button>
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

          {/* 模式 Tab：文本翻译 / 文件批量 */}
          <div className="mb-4 inline-flex rounded-md border border-gray-200 p-0.5 dark:border-gray-700">
            <button
              type="button"
              onClick={() => setMode('text')}
              className={[
                'inline-flex items-center gap-1.5 rounded px-3 py-1 text-xs font-medium transition',
                mode === 'text'
                  ? 'bg-indigo-500 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800',
              ].join(' ')}
            >
              <Type className="h-3.5 w-3.5" />
              {t('mode.text')}
            </button>
            <button
              type="button"
              onClick={() => setMode('files')}
              className={[
                'inline-flex items-center gap-1.5 rounded px-3 py-1 text-xs font-medium transition',
                mode === 'files'
                  ? 'bg-indigo-500 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800',
              ].join(' ')}
            >
              <FileText className="h-3.5 w-3.5" />
              {t('mode.files')}
            </button>
          </div>

          {mode === 'files' ? (
            <FilesPanel translateChunk={translateChunkForFiles} />
          ) : (
          <>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="flex flex-col">
              <div className="mb-1 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>{t('panel.input')} · {input.length}</span>
                <div className="flex items-center gap-3">
                  {speechOk && (
                    <button
                      type="button"
                      onClick={() => handleSpeak('input')}
                      disabled={!input}
                      title={speakingPanel === 'input' ? t('panel.stopSpeak') : t('panel.speak')}
                      className="inline-flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-30"
                    >
                      {speakingPanel === 'input' ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                      {speakingPanel === 'input' ? t('panel.stopSpeak') : t('panel.speak')}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setInput('')}
                    disabled={!input}
                    className="inline-flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-30"
                  >
                    <Trash2 className="h-3 w-3" /> {t('panel.clear')}
                  </button>
                </div>
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
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setOutputView((v) => (v === 'raw' ? 'rendered' : 'raw'))}
                    disabled={!output}
                    title={outputView === 'raw' ? t('panel.renderMd') : t('panel.showRaw')}
                    className="inline-flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-30"
                  >
                    <Eye className="h-3 w-3" />
                    {outputView === 'raw' ? t('panel.renderMd') : t('panel.showRaw')}
                  </button>
                  {speechOk && (
                    <button
                      type="button"
                      onClick={() => handleSpeak('output')}
                      disabled={!output}
                      title={speakingPanel === 'output' ? t('panel.stopSpeak') : t('panel.speak')}
                      className="inline-flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-30"
                    >
                      {speakingPanel === 'output' ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                      {speakingPanel === 'output' ? t('panel.stopSpeak') : t('panel.speak')}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={copyOutput}
                    disabled={!output}
                    className="inline-flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-30"
                  >
                    <ClipboardCopy className="h-3 w-3" /> {t('panel.copy')}
                  </button>
                </div>
              </div>
              {outputView === 'rendered' && output ? (
                <MarkdownView content={output} className="min-h-[280px]" />
              ) : (
                <TextArea value={output} readOnly placeholder={t('panel.outputPlaceholder')} rows={12} />
              )}
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
              {(() => {
                if (error === 'missing_api_key') return t('error.missingApiKey')
                if (error === 'missing_model') return t('error.missingModel')
                if (error === 'missing_base_url') return t('error.missingBaseUrl')
                if (error === 'webllm_not_initialized') return t('error.webllmNotInit')
                const ollamaMiss = error.match(/^ollama_model_not_found:(.+)$/)
                if (ollamaMiss) return t('error.ollamaModelNotFound', { model: ollamaMiss[1] })
                return t('error.generic', { msg: error })
              })()}
            </div>
          )}
          </>
          )}
        </Card>
      </div>

      <SettingsDrawer
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onChanged={() => setCfgVersion((v) => v + 1)}
      />

      <HistoryDrawer
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        refreshKey={historyTick}
        onRestore={(e: HistoryEntry) => {
          setProviderId(e.providerId)
          setSource(e.source)
          setTarget(e.target)
          setInput(e.input)
          setOutput(e.output)
          setError(null)
        }}
      />

      <GlossaryDrawer
        open={glossaryOpen}
        onClose={() => setGlossaryOpen(false)}
        contextText={input}
        contextSource={source}
        contextTarget={target}
        onChanged={() => setGlossaryTick((v) => v + 1)}
      />
    </div>
  )
}

export default AiTranslator
