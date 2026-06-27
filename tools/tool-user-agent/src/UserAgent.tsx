import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Button,
  Card,
  DataTable,
  NoticeCard,
  PageHero,
  ParticlesBackground,
  PropertyGrid,
  TextArea,
} from '@toolbox/ui-kit'
import type { DataTableColumn, PropertyGridItem } from '@toolbox/ui-kit'
import { MonitorSmartphone, ScanSearch, Globe } from 'lucide-react'
import { parseUserAgent } from './lib/parseUserAgent'
import type { DeviceType, ProductToken } from './lib/parseUserAgent'

const SAMPLE_UAS = [
  // Chrome on Windows
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  // Edge (Chromium) on Windows
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.2210.91',
  // Safari on iPhone
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
  // Firefox on Linux
  'Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0',
  // Googlebot
  'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
]

const UserAgent: React.FC = () => {
  const { t } = useTranslation('toolUserAgent')
  const [input, setInput] = useState('')

  const result = useMemo(() => parseUserAgent(input), [input])
  const hasInput = input.trim().length > 0

  const deviceLabel = (type: DeviceType): string => t(`device.${type}`)

  const display = (value: string): React.ReactNode =>
    value ? value : <span className="opacity-50">{t('notDetected')}</span>

  const summaryItems: PropertyGridItem[] = useMemo(() => {
    const items: PropertyGridItem[] = [
      {
        label: t('fields.browser'),
        value: display(result.browser.name),
        tone: result.browser.name ? 'primary' : 'default',
      },
      { label: t('fields.browserVersion'), value: display(result.browser.version) },
      { label: t('fields.engine'), value: display(result.engine.name) },
      { label: t('fields.engineVersion'), value: display(result.engine.version) },
      {
        label: t('fields.os'),
        value: display(result.os.name),
        tone: result.os.name ? 'primary' : 'default',
      },
      { label: t('fields.osVersion'), value: display(result.os.version) },
      {
        label: t('fields.device'),
        value: deviceLabel(result.device.type),
        tone: result.device.type === 'bot' ? 'warning' : 'default',
      },
      { label: t('fields.cpu'), value: display(result.cpu.architecture) },
      {
        label: t('fields.bot'),
        value: result.isBot ? t('bot.yes') : t('bot.no'),
        tone: result.isBot ? 'danger' : 'success',
      },
      { label: t('fields.botName'), value: display(result.botName) },
    ]
    return items
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result, t])

  const productColumns: DataTableColumn<ProductToken & { _i: number }>[] = [
    {
      key: 'name',
      header: t('table.name'),
      className: 'font-mono text-gray-900 dark:text-gray-100',
      cell: (row) => row.name,
    },
    {
      key: 'version',
      header: t('table.version'),
      className: 'font-mono text-gray-500 dark:text-gray-400',
      cell: (row) => row.version,
    },
  ]

  const fillCurrentUA = () => {
    if (typeof navigator !== 'undefined' && navigator.userAgent) {
      setInput(navigator.userAgent)
    }
  }

  return (
    <div className="relative min-h-[60vh]">
      <ParticlesBackground preset="minimal" className="absolute inset-0" />
      <div className="relative z-10 mx-auto max-w-5xl space-y-6 px-4 py-6">
        <PageHero icon={MonitorSmartphone} title={t('title')} description={t('description')} />

        <NoticeCard tone="info" title={t('localOnly.title')} description={t('localOnly.description')} />

        {/* Input */}
        <Card>
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('input.label')}
              </label>
              <span className="text-xs text-gray-500 dark:text-gray-400 tabular-nums">
                {t('input.charCount', { n: input.length })}
              </span>
            </div>
            <TextArea
              rows={4}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('input.placeholder')}
              className="font-mono text-sm"
            />
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="primary" onClick={fillCurrentUA}>
                <span className="inline-flex items-center gap-1">
                  <Globe className="h-4 w-4" /> {t('input.useCurrent')}
                </span>
              </Button>
              {SAMPLE_UAS.map((sample, idx) => (
                <Button
                  key={idx}
                  size="sm"
                  variant="secondary"
                  onClick={() => setInput(sample)}
                >
                  {t('input.sample', { n: idx + 1 })}
                </Button>
              ))}
              <Button size="sm" variant="ghost" onClick={() => setInput('')} disabled={!hasInput}>
                {t('input.clear')}
              </Button>
            </div>
          </div>
        </Card>

        {/* Results */}
        {!hasInput ? (
          <NoticeCard tone="info" icon={ScanSearch} title={t('empty.title')} description={t('empty.description')} />
        ) : !result.recognized ? (
          <NoticeCard tone="warning" title={t('unrecognized.title')} description={t('unrecognized.description')} />
        ) : (
          <div className="space-y-6">
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                {t('results.summaryTitle')}
              </h2>
              <PropertyGrid items={summaryItems} />
            </div>

            {result.products.length > 0 ? (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                  {t('results.productsTitle')}
                </h2>
                <DataTable
                  columns={productColumns}
                  rows={result.products.map((p, i) => ({ ...p, _i: i }))}
                  rowKey={(row) => `prod-${row._i}`}
                />
              </div>
            ) : null}

            {result.comments.length > 0 ? (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                  {t('results.commentsTitle')}
                </h2>
                <Card>
                  <div className="flex flex-wrap gap-2">
                    {result.comments.map((c, i) => (
                      <span
                        key={`cmt-${i}`}
                        className="rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1 font-mono text-xs text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </Card>
              </div>
            ) : null}

            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                {t('results.rawTitle')}
              </h2>
              <Card>
                <pre className="whitespace-pre-wrap break-all font-mono text-xs text-gray-700 dark:text-gray-300">
                  {result.raw}
                </pre>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default UserAgent
