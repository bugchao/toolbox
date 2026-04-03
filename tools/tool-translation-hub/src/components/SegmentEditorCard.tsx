import React from 'react'
import { Bot, RefreshCcw, Sparkles, Wand2 } from 'lucide-react'
import { Button, Card, StatusBadge } from '@toolbox/ui-kit'
import { useTranslation } from 'react-i18next'
import type { SegmentTranslation, TranslationVariant } from '../types'

type SegmentEditorCardProps = {
  segment: SegmentTranslation
  showExplanations: boolean
  onRetranslate: () => void | Promise<void>
  onOptimize: (mode: 'natural' | 'professional') => void
  onSetVariant: (variant: TranslationVariant) => void
  onChangeTranslation: (variant: TranslationVariant, value: string) => void
  onApplySuggestion: (suggestion: string) => void
}

function statusLevel(status: SegmentTranslation['status']) {
  if (status === 'ready') return 'success'
  if (status === 'error') return 'danger'
  if (status === 'loading') return 'warning'
  return 'neutral'
}

export default function SegmentEditorCard({
  segment,
  showExplanations,
  onRetranslate,
  onOptimize,
  onSetVariant,
  onChangeTranslation,
  onApplySuggestion,
}: SegmentEditorCardProps) {
  const { t } = useTranslation('toolTranslationHub')
  const variants: TranslationVariant[] = ['literal', 'adaptive', 'localized']

  return (
    <Card className="space-y-4 rounded-[28px] border-slate-200/80 bg-white/85 backdrop-blur dark:border-slate-800 dark:bg-slate-950/55">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge level={statusLevel(segment.status)} label={t(`segment.status.${segment.status}`)} />
            {segment.memoryHit ? <StatusBadge level="info" label={t('segment.memoryHit')} /> : null}
          </div>
          <div className="max-w-4xl text-base font-medium leading-7 text-slate-900 dark:text-slate-100">{segment.source}</div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={() => void onRetranslate()} className="whitespace-nowrap">
            <RefreshCcw className="mr-2 inline h-4 w-4" />
            {t('actions.retranslate')}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onOptimize('natural')} className="whitespace-nowrap">
            <Sparkles className="mr-2 inline h-4 w-4" />
            {t('actions.optimizeNatural')}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onOptimize('professional')} className="whitespace-nowrap">
            <Bot className="mr-2 inline h-4 w-4" />
            {t('actions.optimizeProfessional')}
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {variants.map((variant) => (
          <button
            key={variant}
            type="button"
            onClick={() => onSetVariant(variant)}
            className={[
              'rounded-full px-3 py-1.5 text-sm font-medium transition',
              segment.selectedVariant === variant
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800',
            ].join(' ')}
          >
            {t(`variants.${variant}`)}
          </button>
        ))}
      </div>

      <textarea
        value={segment.translations[segment.selectedVariant]}
        onChange={(event) => onChangeTranslation(segment.selectedVariant, event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Tab') {
            event.preventDefault()
            const currentIndex = variants.indexOf(segment.selectedVariant)
            const nextVariant = variants[(currentIndex + 1) % variants.length]
            onSetVariant(nextVariant)
          }
        }}
        rows={4}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-7 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100"
      />

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-2">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
            {t('segment.suggestionTitle')}
          </div>
          <div className="flex flex-wrap gap-2">
            {segment.suggestions.length ? (
              segment.suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => onApplySuggestion(suggestion)}
                  className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-left text-sm leading-6 text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-indigo-700 dark:hover:bg-indigo-950/30"
                >
                  {suggestion}
                </button>
              ))
            ) : (
              <div className="text-sm text-slate-500 dark:text-slate-400">{t('segment.noSuggestions')}</div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
            <Wand2 className="h-4 w-4" />
            {t('segment.providerTitle')}
          </div>
          <div className="mt-3 space-y-3">
            {Object.entries(segment.providerOutputs).length ? (
              Object.entries(segment.providerOutputs).map(([providerId, translation]) => (
                <div key={providerId} className="rounded-2xl bg-white px-3 py-3 shadow-sm dark:bg-slate-950/60">
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                    {t(`apiProviders.${providerId}`)}
                  </div>
                  <div className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-200">{translation}</div>
                </div>
              ))
            ) : (
              <div className="text-sm text-slate-500 dark:text-slate-400">{t('segment.noProviderOutput')}</div>
            )}
          </div>
        </div>
      </div>

      {showExplanations ? (
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50/80 p-4 dark:border-indigo-900 dark:bg-indigo-950/30">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-300">
            {t('segment.explanationTitle')}
          </div>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-indigo-900 dark:text-indigo-100">
            {segment.explanation.map((line) => (
              <li key={line} className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-indigo-500" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </Card>
  )
}
