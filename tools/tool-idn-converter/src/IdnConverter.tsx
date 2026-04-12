import React, { useMemo, useState } from 'react'
import punycode from 'punycode/'
import { Globe2, Languages } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card, Input, NoticeCard, PageHero, PropertyGrid } from '@toolbox/ui-kit'

function normalizeDomain(raw: string) {
  return raw.trim().replace(/^https?:\/\//i, '').replace(/\/.*$/, '')
}

function safeToAscii(domain: string) {
  try {
    return punycode.toASCII(domain)
  } catch {
    return ''
  }
}

function safeToUnicode(domain: string) {
  try {
    return punycode.toUnicode(domain)
  } catch {
    return ''
  }
}

export default function IdnConverter() {
  const { t } = useTranslation('toolIdnConverter')
  const [input, setInput] = useState('例子.中国')

  const analysis = useMemo(() => {
    const normalized = normalizeDomain(input)
    const ascii = safeToAscii(normalized)
    const unicode = safeToUnicode(normalized)
    const labels = normalized
      ? normalized.split('.').map((label) => ({
          source: label,
          ascii: safeToAscii(label),
          unicode: safeToUnicode(label),
        }))
      : []

    return {
      normalized,
      ascii,
      unicode,
      labels,
      httpsUrl: ascii ? `https://${ascii}` : '',
    }
  }, [input])

  const summary = [
    { label: t('summary.unicode'), value: analysis.unicode || '—', tone: 'primary' as const },
    { label: t('summary.ascii'), value: analysis.ascii || '—' },
    { label: t('summary.labels'), value: analysis.labels.length || 0, tone: 'success' as const },
    { label: t('summary.url'), value: analysis.httpsUrl || '—' },
  ]

  return (
    <div className="space-y-6">
      <Card className="border-sky-200/70 bg-gradient-to-br from-white via-sky-50 to-blue-50 dark:border-sky-900/40 dark:from-slate-950 dark:via-slate-900 dark:to-sky-950/20">
        <PageHero icon={Globe2} titleKey="title" descriptionKey="description" i18nNamespace="toolIdnConverter" />
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="space-y-4">
          <div className="space-y-2">
            <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">{t('fields.domain')}</div>
            <Input value={input} onChange={(event) => setInput(event.target.value)} placeholder={t('placeholders.domain')} />
          </div>

          <PropertyGrid items={summary} className="xl:grid-cols-2" />

          <div className="grid gap-4 md:grid-cols-2">
            <ValueCard label={t('fields.unicode')} value={analysis.unicode || '—'} />
            <ValueCard label={t('fields.ascii')} value={analysis.ascii || '—'} />
          </div>

          <Card className="space-y-4 border border-sky-200/70 bg-sky-50/70 dark:border-sky-900/60 dark:bg-sky-950/20">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-100">
              <Languages className="h-4 w-4" />
              {t('sections.labels')}
            </div>
            <div className="space-y-3">
              {analysis.labels.length ? analysis.labels.map((label) => (
                <div key={`${label.source}-${label.ascii}`} className="rounded-2xl border border-white/80 bg-white/80 p-4 dark:border-slate-700 dark:bg-slate-950/60">
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{t('fields.label')}</div>
                  <div className="mt-2 break-words text-sm font-semibold text-slate-900 dark:text-slate-100">{label.source}</div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <MiniValue label={t('fields.unicode')} value={label.unicode || '—'} />
                    <MiniValue label={t('fields.ascii')} value={label.ascii || '—'} />
                  </div>
                </div>
              )) : <div className="text-sm text-gray-500 dark:text-gray-400">{t('states.empty')}</div>}
            </div>
          </Card>
        </Card>

        <div className="space-y-6">
          <NoticeCard title={t('notes.title')} description={t('notes.description')} tone="info" icon={Globe2} />
          <Card className="space-y-3">
            <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">{t('examples.title')}</div>
            <div className="flex flex-wrap gap-2">
              {['例子.中国', 'münchen.de', 'xn--fiqs8s.xn--fiqs8s', '台灣.tw'].map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => setInput(example)}
                  className="rounded-full border border-sky-300 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-900 transition hover:bg-sky-100 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-100 dark:hover:bg-sky-900/50"
                >
                  {example}
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

function ValueCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 dark:border-slate-700 dark:bg-slate-900/70">
      <div className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{label}</div>
      <div className="mt-3 break-words text-sm font-semibold text-slate-900 dark:text-slate-100">{value}</div>
    </div>
  )
}

function MiniValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-900/70">
      <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">{label}</div>
      <div className="mt-1 break-words text-xs font-semibold text-slate-900 dark:text-slate-100">{value}</div>
    </div>
  )
}
