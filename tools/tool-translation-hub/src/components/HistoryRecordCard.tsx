import React from 'react'
import { Clock3, RotateCcw, Star, StarOff } from 'lucide-react'
import { Button, Card, StatusBadge } from '@toolbox/ui-kit'
import { useTranslation } from 'react-i18next'
import type { TranslationHistoryRecord } from '../types'

type HistoryRecordCardProps = {
  record: TranslationHistoryRecord
  active: boolean
  onRestore: () => void
  onToggleFavorite: () => void
}

export default function HistoryRecordCard({
  record,
  active,
  onRestore,
  onToggleFavorite,
}: HistoryRecordCardProps) {
  const { t, i18n } = useTranslation('toolTranslationHub')
  const preview = record.segments.map((segment) => segment.translations.localized).join(' ').slice(0, 180)
  const createdAt = new Intl.DateTimeFormat(i18n.language.startsWith('en') ? 'en-US' : 'zh-CN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(record.createdAt))

  return (
    <Card className={active ? 'border-indigo-300 ring-2 ring-indigo-500/20 dark:border-indigo-700' : ''}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge level={record.favorite ? 'warning' : 'neutral'} label={record.favorite ? t('history.favorite') : t('history.standard')} />
            <StatusBadge level="info" label={`${record.sourceLanguage.toUpperCase()} → ${record.targetLanguage.toUpperCase()}`} />
          </div>
          <div className="text-base font-semibold text-slate-900 dark:text-slate-100">{record.sourceText.slice(0, 80)}</div>
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <Clock3 className="h-4 w-4" />
            {createdAt}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="ghost" onClick={onToggleFavorite} className="whitespace-nowrap">
            {record.favorite ? <StarOff className="mr-2 inline h-4 w-4" /> : <Star className="mr-2 inline h-4 w-4" />}
            {record.favorite ? t('actions.unfavorite') : t('actions.favorite')}
          </Button>
          <Button size="sm" variant="secondary" onClick={onRestore} className="whitespace-nowrap">
            <RotateCcw className="mr-2 inline h-4 w-4" />
            {t('actions.restore')}
          </Button>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
        <div className="rounded-2xl bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-700 dark:bg-slate-900/70 dark:text-slate-200">
          {preview || t('history.noPreview')}
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 dark:border-slate-700 dark:bg-slate-950/60">
          <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <div><span className="font-semibold">{t('labels.style')}:</span> {t(`styles.${record.style}`)}</div>
            <div><span className="font-semibold">{t('labels.tone')}:</span> {t(`tones.${record.tone}`)}</div>
            <div><span className="font-semibold">{t('history.segmentCount')}:</span> {record.segments.length}</div>
          </div>
        </div>
      </div>
    </Card>
  )
}
