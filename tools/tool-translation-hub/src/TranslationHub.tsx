import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  ChevronDown,
  ExternalLink,
  FileText,
  Languages,
  Mic,
  MicOff,
  Save,
  Settings2,
  Shuffle,
  Sparkles,
  Upload,
} from 'lucide-react'
import { Button, Card, Input, NoticeCard, PageHero, StatusBadge } from '@toolbox/ui-kit'
import { useTranslation } from 'react-i18next'
import { API_PROVIDER_IDS, DEFAULT_STATE, LANGUAGES, STYLES, TONES } from './constants'
import { useTranslationStudio } from './hooks/useTranslationStudio'
import { extractDocument, type ExtractedDocument } from './services/fileExtractors'
import { createSpeechRecognition, isSpeechRecognitionSupported } from './services/voice'
import type {
  LanguageCode,
  StudioSection,
  TranslationVariant,
  WebProviderId,
} from './types'
import SegmentEditorCard from './components/SegmentEditorCard'
import HistoryRecordCard from './components/HistoryRecordCard'

type WebProviderDefinition = {
  id: WebProviderId
  supportsAuto: boolean
  codeMap: Partial<Record<LanguageCode, string>>
  buildUrl: (source: string, target: string, text: string) => string
}

const WEB_PROVIDERS: WebProviderDefinition[] = [
  {
    id: 'google',
    supportsAuto: true,
    codeMap: {
      auto: 'auto',
      zh: 'zh-CN',
      en: 'en',
      ja: 'ja',
      ko: 'ko',
      fr: 'fr',
      de: 'de',
      es: 'es',
      ru: 'ru',
      pt: 'pt',
      ar: 'ar',
      th: 'th',
      vi: 'vi',
    },
    buildUrl: (source, target, text) =>
      `https://translate.google.com/?sl=${source}&tl=${target}&text=${encodeURIComponent(text)}&op=translate`,
  },
  {
    id: 'bing',
    supportsAuto: true,
    codeMap: {
      auto: 'auto-detect',
      zh: 'zh-Hans',
      en: 'en',
      ja: 'ja',
      ko: 'ko',
      fr: 'fr',
      de: 'de',
      es: 'es',
      ru: 'ru',
      pt: 'pt',
      ar: 'ar',
      th: 'th',
      vi: 'vi',
    },
    buildUrl: (source, target, text) =>
      `https://www.bing.com/translator?from=${source}&to=${target}&text=${encodeURIComponent(text)}`,
  },
  {
    id: 'baidu',
    supportsAuto: true,
    codeMap: {
      auto: 'auto',
      zh: 'zh',
      en: 'en',
      ja: 'jp',
      ko: 'kor',
      fr: 'fra',
      de: 'de',
      es: 'spa',
      ru: 'ru',
      pt: 'pt',
      ar: 'ara',
      th: 'th',
      vi: 'vie',
    },
    buildUrl: (source, target, text) =>
      `https://fanyi.baidu.com/#${source}/${target}/${encodeURIComponent(text)}`,
  },
  {
    id: 'deepl',
    supportsAuto: false,
    codeMap: {
      zh: 'zh',
      en: 'en',
      ja: 'ja',
      ko: 'ko',
      fr: 'fr',
      de: 'de',
      es: 'es',
      ru: 'ru',
      pt: 'pt-PT',
      ar: 'ar',
      th: 'th',
      vi: 'vi',
    },
    buildUrl: (source, target, text) =>
      `https://www.deepl.com/translator#${source}/${target}/${encodeURIComponent(text)}`,
  },
]

const SPEECH_LOCALES: Record<Exclude<LanguageCode, 'auto'>, string> = {
  zh: 'zh-CN',
  en: 'en-US',
  ja: 'ja-JP',
  ko: 'ko-KR',
  fr: 'fr-FR',
  de: 'de-DE',
  es: 'es-ES',
  ru: 'ru-RU',
  pt: 'pt-PT',
  ar: 'ar-SA',
  th: 'th-TH',
  vi: 'vi-VN',
}

function SelectField({
  label,
  value,
  onChange,
  children,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  children: React.ReactNode
}) {
  return (
    <label className="space-y-2">
      <div className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</div>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
      >
        {children}
      </select>
    </label>
  )
}

function joinVariantText(variant: TranslationVariant, segments: { translations: Record<TranslationVariant, string> }[]) {
  return segments
    .map((segment) => segment.translations[variant])
    .filter(Boolean)
    .join(' ')
    .trim()
}

function normalizeWebLanguage(provider: WebProviderDefinition, code: LanguageCode) {
  return provider.codeMap[code] ?? provider.codeMap.en ?? 'en'
}

export default function TranslationHub() {
  const { t, i18n } = useTranslation('toolTranslationHub')
  const { state, actions, loading } = useTranslationStudio()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const recognitionRef = useRef<ReturnType<typeof createSpeechRecognition> | null>(null)
  const lastAutoTranslateRef = useRef('')
  const [isExtracting, setIsExtracting] = useState(false)
  const [extractError, setExtractError] = useState('')
  const [documentAsset, setDocumentAsset] = useState<ExtractedDocument | null>(null)
  const [isListening, setIsListening] = useState(false)
  const [activeWebProvider, setActiveWebProvider] = useState<WebProviderId>('google')
  const [showAdvancedMain, setShowAdvancedMain] = useState(false)
  const [glossaryDraft, setGlossaryDraft] = useState({
    sourceTerm: '',
    targetTerm: '',
    note: '',
    sourceLanguage: 'en' as Exclude<LanguageCode, 'auto'>,
    targetLanguage: 'zh' as Exclude<LanguageCode, 'auto'>,
  })

  const aggregateVersions = useMemo(
    () => ({
      literal: joinVariantText('literal', state.segments),
      adaptive: joinVariantText('adaptive', state.segments),
      localized: joinVariantText('localized', state.segments),
    }),
    [state.segments]
  )

  const providerSummaries = useMemo(
    () =>
      state.config.selectedApiProviders.map((providerId) => ({
        providerId,
        translation: state.segments
          .map((segment) => segment.providerOutputs[providerId])
          .filter(Boolean)
          .join(' ')
          .trim(),
      })),
    [state.config.selectedApiProviders, state.segments]
  )

  const webViews = useMemo(() => {
    return WEB_PROVIDERS.filter((provider) => state.config.selectedWebProviders.includes(provider.id)).map((provider) => {
      const source =
        state.sourceLanguage === 'auto' && !provider.supportsAuto
          ? normalizeWebLanguage(provider, DEFAULT_STATE.sourceLanguage)
          : normalizeWebLanguage(provider, state.sourceLanguage)
      const target = normalizeWebLanguage(provider, state.targetLanguage)
      return {
        ...provider,
        url: provider.buildUrl(source, target, state.sourceText || DEFAULT_STATE.sourceText),
      }
    })
  }, [state.config.selectedWebProviders, state.sourceLanguage, state.sourceText, state.targetLanguage])

  const currentWebViews = state.config.enableMultiView
    ? webViews
    : webViews.filter((provider) => provider.id === activeWebProvider)

  const autoTranslateSignature = useMemo(
    () =>
      JSON.stringify({
        text: state.sourceText.trim(),
        sourceLanguage: state.sourceLanguage,
        targetLanguage: state.targetLanguage,
        style: state.style,
        tone: state.tone,
        context: state.context,
        providers: state.config.selectedApiProviders,
        libreEndpoint: state.config.libreEndpoint.trim(),
      }),
    [
      state.config.libreEndpoint,
      state.config.selectedApiProviders,
      state.context,
      state.sourceLanguage,
      state.sourceText,
      state.style,
      state.targetLanguage,
      state.tone,
    ]
  )

  const historyItems = useMemo(
    () =>
      [...state.history].sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()),
    [state.history]
  )

  useEffect(() => {
    if (!webViews.length) return
    if (!webViews.some((provider) => provider.id === activeWebProvider)) {
      setActiveWebProvider(webViews[0].id)
    }
  }, [activeWebProvider, webViews])

  useEffect(() => {
    if (!state.sourceText.trim()) {
      lastAutoTranslateRef.current = ''
      return
    }
    if (!state.config.enableRealtime || loading) return
    if (lastAutoTranslateRef.current === autoTranslateSignature) return
    const timer = window.setTimeout(() => {
      lastAutoTranslateRef.current = autoTranslateSignature
      void actions.translateAll()
    }, 700)
    return () => window.clearTimeout(timer)
  }, [
    autoTranslateSignature,
    loading,
    state.config.enableRealtime,
    state.sourceText,
  ])

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop()
      recognitionRef.current = null
    }
  }, [])

  const handleTranslateNow = async () => {
    await actions.translateAll()
  }

  const handleFileUpload = async (file?: File | null, shouldTranslate = true) => {
    if (!file) return
    setIsExtracting(true)
    setExtractError('')
    try {
      const extracted = await extractDocument(file)
      setDocumentAsset(extracted)
      actions.importSourceText(extracted.text)
      if (shouldTranslate) {
        await actions.translateAll({ text: extracted.text })
      }
    } catch (error) {
      setExtractError(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setIsExtracting(false)
    }
  }

  const handleVoiceToggle = () => {
    if (isListening) {
      recognitionRef.current?.stop()
      recognitionRef.current = null
      setIsListening(false)
      return
    }

    if (!isSpeechRecognitionSupported()) return
    const sourceLanguage = state.sourceLanguage === 'auto' ? 'en' : state.sourceLanguage
    const recognition = createSpeechRecognition(
      SPEECH_LOCALES[sourceLanguage],
      (text) => {
        actions.updateSourceText(text)
      },
      () => {
        setIsListening(false)
        recognitionRef.current = null
      }
    )
    recognitionRef.current = recognition
    recognition.start()
    setIsListening(true)
  }

  const autoDetectionLimited =
    state.sourceLanguage === 'auto' &&
    state.config.selectedApiProviders.includes('mymemory') &&
    !state.config.selectedApiProviders.includes('libretranslate')

  const architectureTree = `apps/
  web/
  api-gateway/
services/
  translation-service/
    src/routes
    src/providers
    src/ocr
    src/tm
    src/glossary
    src/document
packages/
  contracts/
  service-core/
tools/
  tool-translation-hub/
    src/components
    src/hooks
    src/services
    src/locales`

  const preferredTranslation = aggregateVersions.localized || aggregateVersions.adaptive || aggregateVersions.literal

  const handleSwapLanguages = () => {
    if (state.sourceLanguage === 'auto') return
    const currentSource = state.sourceLanguage
    actions.updateRequest('sourceLanguage', state.targetLanguage)
    actions.updateRequest('targetLanguage', currentSource)
  }

  const sectionButtons: StudioSection[] = ['main', 'documents', 'history', 'glossary', 'settings']

  const renderMainSection = () => (
    <div className="space-y-6">
      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="space-y-5 rounded-[28px] border-slate-200/80 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/65">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{t('cards.sourceWorkspace')}</div>
              <div className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{t('helper.simpleIntro')}</div>
            </div>
            <StatusBadge level={state.config.enableRealtime ? 'success' : 'neutral'} label={state.config.enableRealtime ? t('helper.realtimeOn') : t('helper.realtimeOff')} />
          </div>

          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-end">
            <SelectField label={t('labels.sourceLanguage')} value={state.sourceLanguage} onChange={(value) => actions.updateRequest('sourceLanguage', value as LanguageCode)}>
              {LANGUAGES.map((language) => (
                <option key={language} value={language}>
                  {t(`languages.${language}`)}
                </option>
              ))}
            </SelectField>
            <Button
              variant="ghost"
              onClick={handleSwapLanguages}
              disabled={state.sourceLanguage === 'auto'}
              className="h-11 whitespace-nowrap rounded-2xl border border-slate-200 px-3 dark:border-slate-700"
            >
              <Shuffle className="h-4 w-4" />
            </Button>
            <SelectField label={t('labels.targetLanguage')} value={state.targetLanguage} onChange={(value) => actions.updateRequest('targetLanguage', value as Exclude<LanguageCode, 'auto'>)}>
              {LANGUAGES.filter((language) => language !== 'auto').map((language) => (
                <option key={language} value={language}>
                  {t(`languages.${language}`)}
                </option>
              ))}
            </SelectField>
          </div>

          <label className="space-y-2">
            <textarea
              rows={14}
              value={state.sourceText}
              onChange={(event) => actions.updateSourceText(event.target.value)}
              onKeyDown={(event) => {
                if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
                  event.preventDefault()
                  void handleTranslateNow()
                }
              }}
              placeholder={t('helper.sourcePlaceholderSimple')}
              className="w-full rounded-[28px] border border-slate-200 bg-slate-50 px-5 py-4 text-base leading-8 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-100"
            />
          </label>

          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={() => void handleTranslateNow()} className="whitespace-nowrap rounded-2xl">
              <Sparkles className="mr-2 inline h-4 w-4" />
              {t('actions.translateNow')}
            </Button>
            <Button variant="secondary" onClick={() => actions.updateSourceText('')} className="whitespace-nowrap rounded-2xl">
              {t('actions.clear')}
            </Button>
            <Button variant="ghost" onClick={() => fileInputRef.current?.click()} className="whitespace-nowrap rounded-2xl border border-slate-200 dark:border-slate-700">
              <Upload className="mr-2 inline h-4 w-4" />
              {t('actions.upload')}
            </Button>
            <Button variant="ghost" onClick={handleVoiceToggle} className="whitespace-nowrap rounded-2xl border border-slate-200 dark:border-slate-700">
              {isListening ? <MicOff className="mr-2 inline h-4 w-4" /> : <Mic className="mr-2 inline h-4 w-4" />}
              {isListening ? t('actions.stopVoice') : t('actions.startVoice')}
            </Button>
            <button
              type="button"
              onClick={() => setShowAdvancedMain((value) => !value)}
              className="inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"
            >
              <Settings2 className="h-4 w-4" />
              {t('actions.advancedOptions')}
              <ChevronDown className={['h-4 w-4 transition', showAdvancedMain ? 'rotate-180' : 'rotate-0'].join(' ')} />
            </button>
          </div>

          {showAdvancedMain ? (
            <div className="space-y-4 rounded-[28px] border border-dashed border-slate-300 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-900/60">
              <div className="grid gap-4 md:grid-cols-2">
                <SelectField label={t('labels.style')} value={state.style} onChange={(value) => actions.updateRequest('style', value as typeof state.style)}>
                  {STYLES.map((style) => (
                    <option key={style} value={style}>
                      {t(`styles.${style}`)}
                    </option>
                  ))}
                </SelectField>
                <SelectField label={t('labels.tone')} value={state.tone} onChange={(value) => actions.updateRequest('tone', value as typeof state.tone)}>
                  {TONES.map((tone) => (
                    <option key={tone} value={tone}>
                      {t(`tones.${tone}`)}
                    </option>
                  ))}
                </SelectField>
              </div>

              <label className="space-y-2">
                <div className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('labels.context')}</div>
                <textarea
                  rows={3}
                  value={state.context}
                  onChange={(event) => actions.updateRequest('context', event.target.value)}
                  placeholder={t('helper.contextPlaceholder')}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm leading-7 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                />
              </label>

              <div className="grid gap-3 lg:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 dark:border-slate-800 dark:bg-slate-950/70">
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{t('labels.apiProvider')}</div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {API_PROVIDER_IDS.map((providerId) => {
                      const selected = state.config.selectedApiProviders.includes(providerId)
                      return (
                        <button
                          key={providerId}
                          type="button"
                          onClick={() =>
                            actions.updateConfig({
                              selectedApiProviders: selected
                                ? state.config.selectedApiProviders.filter((item) => item !== providerId)
                                : [...state.config.selectedApiProviders, providerId],
                            })
                          }
                          className={[
                            'rounded-full px-3 py-1.5 text-sm font-medium transition',
                            selected
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800',
                          ].join(' ')}
                        >
                          {t(`apiProviders.${providerId}`)}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 dark:border-slate-800 dark:bg-slate-950/70">
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{t('labels.inputModes')}</div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {['text', 'file', 'ocr', 'voice'].map((mode) => (
                      <span
                        key={mode}
                        className="rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-600 dark:bg-slate-900 dark:text-slate-300"
                      >
                        {t(`inputModes.${mode}`)}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-600 dark:text-slate-300">
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={state.config.enableRealtime}
                        onChange={(event) => actions.updateConfig({ enableRealtime: event.target.checked })}
                      />
                      {t('settings.enableRealtime')}
                    </label>
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={state.config.enableExplanations}
                        onChange={(event) => actions.updateConfig({ enableExplanations: event.target.checked })}
                      />
                      {t('settings.enableExplanations')}
                    </label>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </Card>

        <Card className="space-y-5 rounded-[28px] border-slate-200/80 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/65">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{t('cards.simpleResult')}</div>
              <div className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{t('helper.resultIntro')}</div>
            </div>
            <StatusBadge level="info" label={`${state.sourceLanguage.toUpperCase()} → ${state.targetLanguage.toUpperCase()}`} />
          </div>

          <div className="flex flex-wrap gap-2">
            {(['localized', 'adaptive', 'literal'] as TranslationVariant[]).map((variant) => (
              <button
                key={variant}
                type="button"
                onClick={() => {
                  if (!state.segments.length) return
                  state.segments.forEach((segment) => actions.setSegmentVariant(segment.id, variant))
                }}
                className={[
                  'rounded-full px-3 py-1.5 text-sm font-medium transition',
                  variant === 'localized'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800',
                ].join(' ')}
              >
                {t(`variants.${variant}`)}
              </button>
            ))}
          </div>

          <div className="min-h-[360px] rounded-[28px] border border-slate-200 bg-slate-50 px-5 py-4 text-base leading-8 text-slate-900 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-100">
            {preferredTranslation || t('states.emptyTranslationSimple')}
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/70">
              <div className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{t('variants.localized')}</div>
              <div className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-200">{aggregateVersions.localized || '—'}</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/70">
              <div className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{t('metrics.apiProviders')}</div>
              <div className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-200">{state.config.selectedApiProviders.join(', ')}</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/70">
              <div className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{t('labels.style')}</div>
              <div className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-200">
                {t(`styles.${state.style}`)} / {t(`tones.${state.tone}`)}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {autoDetectionLimited ? (
        <NoticeCard
          tone="warning"
          title={t('errors.autoDetectLimitedTitle')}
          description={t('errors.autoDetectLimitedDescription')}
        />
      ) : null}

      {extractError ? <NoticeCard tone="danger" title={t('states.importFailed')} description={extractError} /> : null}
      {documentAsset ? (
        <NoticeCard
          tone="success"
          title={t('states.importReady')}
          description={t('helper.importReady', {
            fileName: documentAsset.fileName,
            sourceType: documentAsset.sourceType,
          })}
        />
      ) : null}

      {state.segments.length ? (
        <div className="space-y-4">
          {state.segments.map((segment) => (
            <SegmentEditorCard
              key={segment.id}
              segment={segment}
              showExplanations={state.config.enableExplanations}
              onRetranslate={() => actions.retranslateSegment(segment.id)}
              onOptimize={(mode) => actions.optimizeSegment(segment.id, mode)}
              onSetVariant={(variant) => actions.setSegmentVariant(segment.id, variant)}
              onChangeTranslation={(variant, value) => actions.updateSegmentTranslation(segment.id, variant, value)}
              onApplySuggestion={(suggestion) => actions.applySuggestion(segment.id, suggestion)}
            />
          ))}
        </div>
      ) : (
        <NoticeCard tone="info" title={t('states.noSegmentsTitle')} description={t('states.noSegmentsDescription')} />
      )}

      {showAdvancedMain ? (
        <Card className="rounded-[28px] border-dashed border-slate-300 bg-slate-50/85 dark:border-slate-700 dark:bg-slate-950/40">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{t('cards.providerWorkbench')}</div>
              <div className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{t('helper.providerWorkbench')}</div>
            </div>
            <StatusBadge level="success" label={`${providerSummaries.filter((item) => item.translation).length}/${providerSummaries.length}`} />
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {providerSummaries.map((item) => (
              <div key={item.providerId} className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/70">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                  {t(`apiProviders.${item.providerId}`)}
                </div>
                <div className="mt-3 text-sm leading-7 text-slate-700 dark:text-slate-200">
                  {item.translation || t('states.providerPending')}
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      {showAdvancedMain && state.config.enableWebWorkbench ? (
        <Card className="rounded-[32px] border-slate-200/80 bg-white/85 backdrop-blur dark:border-slate-800 dark:bg-slate-950/55">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{t('cards.webWorkbench')}</div>
              <div className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{t('helper.webWorkbench')}</div>
            </div>
            <div className="flex flex-wrap gap-2">
              {webViews.map((provider) => (
                <button
                  key={provider.id}
                  type="button"
                  onClick={() => setActiveWebProvider(provider.id)}
                  className={[
                    'rounded-full px-3 py-1.5 text-sm font-medium transition',
                    provider.id === activeWebProvider
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800',
                  ].join(' ')}
                >
                  {t(`providers.${provider.id}`)}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 grid gap-4 xl:grid-cols-2">
            {currentWebViews.map((provider) => (
              <div key={provider.id} className="overflow-hidden rounded-[28px] border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/70">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-4 py-3 dark:border-slate-800">
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{t(`providers.${provider.id}`)}</div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => window.open(provider.url, '_blank', 'noopener,noreferrer')}
                    className="whitespace-nowrap"
                  >
                    <ExternalLink className="mr-2 inline h-4 w-4" />
                    {t('actions.openInNewTab')}
                  </Button>
                </div>
                <iframe
                  src={provider.url}
                  title={t(`providers.${provider.id}`)}
                  className="h-[520px] w-full bg-white dark:bg-slate-950"
                />
              </div>
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  )

  const renderDocumentSection = () => (
    <div className="space-y-6">
      <Card className="rounded-[32px] border-0 bg-[linear-gradient(145deg,rgba(30,41,59,0.96),rgba(14,165,233,0.78))] text-white shadow-[0_28px_90px_-44px_rgba(15,23,42,0.9)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-white/60">{t('cards.documentImport')}</div>
            <div className="mt-2 text-sm leading-6 text-white/80">{t('helper.documentIntro')}</div>
          </div>
          <Button variant="secondary" onClick={() => fileInputRef.current?.click()} className="whitespace-nowrap rounded-2xl">
            <Upload className="mr-2 inline h-4 w-4" />
            {isExtracting ? t('actions.importing') : t('actions.uploadDocument')}
          </Button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {['pdf', 'docx', 'txt'].map((format) => (
            <div key={format} className="rounded-2xl bg-white/10 px-4 py-4">
              <div className="text-xs uppercase tracking-[0.18em] text-white/55">{format.toUpperCase()}</div>
              <div className="mt-2 text-sm leading-6 text-white/80">{t(`documents.support.${format}`)}</div>
            </div>
          ))}
        </div>
      </Card>

      {documentAsset ? (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_360px]">
          <Card className="rounded-[32px] border-slate-200/80 bg-white/85 backdrop-blur dark:border-slate-800 dark:bg-slate-950/55">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{t('documents.previewTitle')}</div>
                <div className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">{documentAsset.fileName}</div>
              </div>
              <StatusBadge level="success" label={documentAsset.sourceType.toUpperCase()} />
            </div>
            <textarea
              readOnly
              value={documentAsset.text}
              rows={18}
              className="mt-5 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-7 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
            />
          </Card>

          <Card className="space-y-4 rounded-[32px] border-slate-200/80 bg-white/85 backdrop-blur dark:border-slate-800 dark:bg-slate-950/55">
            <div className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{t('documents.actionsTitle')}</div>
            <Button onClick={() => actions.importSourceText(documentAsset.text)} className="w-full whitespace-nowrap rounded-2xl">
              <FileText className="mr-2 inline h-4 w-4" />
              {t('actions.importToMain')}
            </Button>
            <Button onClick={() => void actions.translateAll({ text: documentAsset.text })} variant="secondary" className="w-full whitespace-nowrap rounded-2xl">
              <Sparkles className="mr-2 inline h-4 w-4" />
              {t('actions.importAndTranslate')}
            </Button>
            <NoticeCard
              tone="info"
              title={t('documents.consistencyTitle')}
              description={t('documents.consistencyDescription')}
            />
          </Card>
        </div>
      ) : (
        <NoticeCard tone="info" title={t('documents.emptyTitle')} description={t('documents.emptyDescription')} />
      )}
    </div>
  )

  const renderHistorySection = () => (
    <div className="space-y-4">
      {historyItems.length ? (
        historyItems.map((record) => (
          <HistoryRecordCard
            key={record.id}
            record={record}
            active={record.id === state.activeHistoryId}
            onRestore={() => actions.restoreHistory(record.id)}
            onToggleFavorite={() => actions.toggleFavorite(record.id)}
          />
        ))
      ) : (
        <NoticeCard tone="info" title={t('history.emptyTitle')} description={t('history.emptyDescription')} />
      )}
    </div>
  )

  const renderGlossarySection = () => (
    <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
      <Card className="space-y-4 rounded-[32px] border-slate-200/80 bg-white/85 backdrop-blur dark:border-slate-800 dark:bg-slate-950/55">
        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{t('cards.glossaryManager')}</div>
          <div className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{t('glossary.description')}</div>
        </div>

        <Input
          value={glossaryDraft.sourceTerm}
          onChange={(event) => setGlossaryDraft((current) => ({ ...current, sourceTerm: event.target.value }))}
          placeholder={t('helper.glossarySourcePlaceholder')}
        />
        <Input
          value={glossaryDraft.targetTerm}
          onChange={(event) => setGlossaryDraft((current) => ({ ...current, targetTerm: event.target.value }))}
          placeholder={t('helper.glossaryTargetPlaceholder')}
        />
        <Input
          value={glossaryDraft.note}
          onChange={(event) => setGlossaryDraft((current) => ({ ...current, note: event.target.value }))}
          placeholder={t('helper.glossaryNotePlaceholder')}
        />
        <div className="grid gap-3 md:grid-cols-2">
          <SelectField label={t('labels.sourceLanguage')} value={glossaryDraft.sourceLanguage} onChange={(value) => setGlossaryDraft((current) => ({ ...current, sourceLanguage: value as Exclude<LanguageCode, 'auto'> }))}>
            {LANGUAGES.filter((language) => language !== 'auto').map((language) => (
              <option key={language} value={language}>
                {t(`languages.${language}`)}
              </option>
            ))}
          </SelectField>
          <SelectField label={t('labels.targetLanguage')} value={glossaryDraft.targetLanguage} onChange={(value) => setGlossaryDraft((current) => ({ ...current, targetLanguage: value as Exclude<LanguageCode, 'auto'> }))}>
            {LANGUAGES.filter((language) => language !== 'auto').map((language) => (
              <option key={language} value={language}>
                {t(`languages.${language}`)}
              </option>
            ))}
          </SelectField>
        </div>
        <Button
          onClick={() => {
            if (!glossaryDraft.sourceTerm.trim() || !glossaryDraft.targetTerm.trim()) return
            actions.addGlossaryEntry({
              sourceTerm: glossaryDraft.sourceTerm.trim(),
              targetTerm: glossaryDraft.targetTerm.trim(),
              note: glossaryDraft.note.trim(),
              sourceLanguage: glossaryDraft.sourceLanguage,
              targetLanguage: glossaryDraft.targetLanguage,
            })
            setGlossaryDraft((current) => ({ ...current, sourceTerm: '', targetTerm: '', note: '' }))
          }}
          className="whitespace-nowrap rounded-2xl"
        >
          <Save className="mr-2 inline h-4 w-4" />
          {t('actions.addGlossary')}
        </Button>
      </Card>

      <div className="space-y-4">
        {state.glossary.length ? (
          state.glossary.map((entry) => (
            <Card key={entry.id} className="rounded-[28px] border-slate-200/80 bg-white/85 backdrop-blur dark:border-slate-800 dark:bg-slate-950/55">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge level="info" label={`${entry.sourceLanguage.toUpperCase()} → ${entry.targetLanguage.toUpperCase()}`} />
                    {entry.note ? <StatusBadge level="neutral" label={entry.note} /> : null}
                  </div>
                  <div className="text-base font-semibold text-slate-900 dark:text-slate-100">
                    {entry.sourceTerm} <span className="text-slate-400">→</span> {entry.targetTerm}
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => actions.removeGlossaryEntry(entry.id)}>
                  {t('actions.remove')}
                </Button>
              </div>
            </Card>
          ))
        ) : (
          <NoticeCard tone="info" title={t('glossary.emptyTitle')} description={t('glossary.emptyDescription')} />
        )}
      </div>
    </div>
  )

  const renderSettingsSection = () => (
    <div className="space-y-6">
      <Card className="rounded-[32px] border-slate-200/80 bg-white/85 backdrop-blur dark:border-slate-800 dark:bg-slate-950/55">
        <div className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{t('cards.settings')}</div>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {[
            { key: 'enableRealtime', label: t('settings.enableRealtime'), value: state.config.enableRealtime },
            { key: 'enableExplanations', label: t('settings.enableExplanations'), value: state.config.enableExplanations },
            { key: 'enableWebWorkbench', label: t('settings.enableWebWorkbench'), value: state.config.enableWebWorkbench },
            { key: 'enableMultiView', label: t('settings.enableMultiView'), value: state.config.enableMultiView },
          ].map((item) => (
            <label key={item.key} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 dark:border-slate-800 dark:bg-slate-900/70">
              <input
                type="checkbox"
                checked={item.value}
                onChange={(event) => actions.updateConfig({ [item.key]: event.target.checked } as Partial<typeof state.config>)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <div className="text-sm leading-6 text-slate-700 dark:text-slate-200">{item.label}</div>
            </label>
          ))}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Input
            value={state.config.libreEndpoint}
            onChange={(event) => actions.updateConfig({ libreEndpoint: event.target.value })}
            placeholder={t('settings.libreEndpointPlaceholder')}
          />
          <Input
            value={state.config.libreApiKey}
            onChange={(event) => actions.updateConfig({ libreApiKey: event.target.value })}
            placeholder={t('settings.libreApiKeyPlaceholder')}
          />
        </div>
      </Card>

      <Card className="rounded-[32px] border-slate-200/80 bg-white/85 backdrop-blur dark:border-slate-800 dark:bg-slate-950/55">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{t('settings.architectureTitle')}</div>
            <div className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{t('settings.architectureDescription')}</div>
          </div>
          <StatusBadge level="info" label={t('settings.architectureBadge')} />
        </div>
        <pre className="mt-5 overflow-x-auto rounded-3xl bg-slate-950 px-5 py-5 text-sm leading-7 text-slate-100">
          <code>{architectureTree}</code>
        </pre>
      </Card>
    </div>
  )

  const sectionRenderers: Record<StudioSection, () => React.ReactNode> = {
    main: renderMainSection,
    documents: renderDocumentSection,
    history: renderHistorySection,
    glossary: renderGlossarySection,
    settings: renderSettingsSection,
  }

  return (
    <div className="mx-auto max-w-[1480px] space-y-6 px-4 py-6 sm:px-6 xl:px-8">
      <PageHero
        icon={Languages}
        title={t('title')}
        description={t('description')}
      />

      <Card className="rounded-[24px] border-slate-200/80 bg-white/88 backdrop-blur dark:border-slate-800 dark:bg-slate-950/60">
        <div className="flex flex-wrap items-center gap-2">
          {sectionButtons.map((section) => (
            <button
              key={section}
              type="button"
              onClick={() => actions.setSection(section)}
              className={[
                'rounded-full px-4 py-2 text-sm font-medium transition',
                state.activeSection === section
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800',
              ].join(' ')}
            >
              {t(`sections.${section}`)}
            </button>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2 text-sm text-slate-500 dark:text-slate-400">
          <span>{state.history.length} {t('nav.badges.histories')}</span>
          <span>·</span>
          <span>{state.glossary.length} {t('nav.badges.glossary')}</span>
          <span>·</span>
          <span>{state.memory.length} {t('nav.badges.memory')}</span>
        </div>
      </Card>

      {state.activeSection === 'main' ? (
        sectionRenderers[state.activeSection]()
      ) : (
        <div className="space-y-6">
          <NoticeCard
            tone="info"
            title={t('hero.valueTitle')}
            description={t('hero.valueDescription')}
          />
          {sectionRenderers[state.activeSection]()}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.txt,image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0]
          void handleFileUpload(file, true)
          event.currentTarget.value = ''
        }}
      />

      {!isSpeechRecognitionSupported() ? (
        <NoticeCard
          tone="warning"
          title={t('voice.unsupportedTitle')}
          description={t('voice.unsupportedDescription')}
        />
      ) : null}
    </div>
  )
}
