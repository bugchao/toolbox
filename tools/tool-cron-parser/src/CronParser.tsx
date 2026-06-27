import React, { useMemo, useState } from 'react'
import {
  Button,
  Card,
  DataTable,
  Input,
  NoticeCard,
  PageHero,
  ParticlesBackground,
  type DataTableColumn,
} from '@toolbox/ui-kit'
import { useTranslation } from 'react-i18next'
import { CalendarClock, Clock, RefreshCw } from 'lucide-react'
import {
  CronParseError,
  FIELD_KINDS,
  getNextRuns,
  parseCron,
  summarizeField,
  type FieldKind,
  type FieldSummary,
  type ParsedCron,
} from './lib/cron'

const EXAMPLES: { key: string; expr: string }[] = [
  { key: 'everyQuarterBusiness', expr: '*/15 9-17 * * 1-5' },
  { key: 'midnight', expr: '0 0 * * *' },
  { key: 'weekdayMorning', expr: '0 9 * * 1-5' },
  { key: 'monthlyFirst', expr: '0 0 1 * *' },
  { key: 'everyHalfHour', expr: '*/30 * * * *' },
  { key: 'monthMid', expr: '0 0 1,15 * *' },
  { key: 'hourlyAlias', expr: '@hourly' },
]

interface ParseResult {
  parsed: ParsedCron | null
  error: CronParseError | null
}

interface RunRow {
  index: number
  date: Date
}

const CronParser: React.FC = () => {
  const { t, i18n } = useTranslation('toolCronParser')
  const [input, setInput] = useState('*/15 9-17 * * 1-5')
  const [count, setCount] = useState(5)
  const [nowTick, setNowTick] = useState(0)

  const weekdays = t('weekdays', { returnObjects: true }) as string[]
  const months = t('months', { returnObjects: true }) as string[]
  const locale = i18n.language?.startsWith('zh') ? 'zh-CN' : 'en-US'

  const { parsed, error } = useMemo<ParseResult>(() => {
    try {
      return { parsed: parseCron(input), error: null }
    } catch (e) {
      if (e instanceof CronParseError) return { parsed: null, error: e }
      throw e
    }
  }, [input])

  // 把字段中的数值格式化为可读文本（星期/月份用名称）。
  const formatValue = (value: number, kind: FieldKind): string => {
    if (kind === 'dow') return weekdays[value] ?? String(value)
    if (kind === 'month') return months[value - 1] ?? String(value)
    return String(value)
  }

  const formatValues = (values: number[], kind: FieldKind): string =>
    values.map((v) => formatValue(v, kind)).join(t('summary.separator'))

  // 把一个字段的结构描述渲染成本地化短语。
  const phraseFor = (kind: FieldKind, summary: FieldSummary): string => {
    switch (summary.type) {
      case 'every':
        return t(`desc.${kind}.every`)
      case 'step':
        return t(`desc.${kind}.step`, { step: summary.step })
      case 'stepRange':
        return t(`desc.${kind}.stepRange`, {
          step: summary.step,
          from: formatValue(summary.from, kind),
          to: formatValue(summary.to, kind),
        })
      case 'range':
        return t(`desc.${kind}.range`, {
          from: formatValue(summary.from, kind),
          to: formatValue(summary.to, kind),
        })
      case 'values':
        return t(`desc.${kind}.values`, { values: formatValues(summary.values, kind) })
    }
  }

  const summaries = useMemo(() => {
    if (!parsed) return null
    return FIELD_KINDS.map((kind) => ({
      kind,
      summary: summarizeField(parsed.raw[kind], kind, parsed.values[kind]),
    }))
  }, [parsed])

  // 整句解释：分钟始终展示，其余字段仅在非「每…」时展示。
  const sentence = useMemo(() => {
    if (!summaries) return ''
    const parts: string[] = []
    for (const { kind, summary } of summaries) {
      if (kind !== 'minute' && summary.type === 'every') continue
      parts.push(phraseFor(kind, summary))
    }
    return parts.join(t('summary.separator'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [summaries, i18n.language])

  const showUnion = !!parsed && parsed.restricted.dom && parsed.restricted.dow

  const runRows = useMemo<RunRow[]>(() => {
    if (!parsed) return []
    const safeCount = Math.min(Math.max(count, 1), 20)
    void nowTick
    return getNextRuns(parsed, new Date(), safeCount).map((date, i) => ({ index: i + 1, date }))
  }, [parsed, count, nowTick])

  const dateFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }),
    [locale],
  )

  const relativeText = (date: Date): string => {
    const diffMs = date.getTime() - Date.now()
    const min = Math.round(diffMs / 60000)
    if (min <= 0) return t('relative.now')
    if (min < 60) return t('relative.minutes', { value: min })
    const hours = Math.round(min / 60)
    if (hours < 24) return t('relative.hours', { value: hours })
    return t('relative.days', { value: Math.round(hours / 24) })
  }

  const errorMessage = (err: CronParseError): string => {
    const body = t(`errors.${err.code}`, { ...err.params } as Record<string, unknown>)
    if (err.field) {
      return t('errors.inField', { field: t(`fields.${err.field}`) }) + body
    }
    return body
  }

  const breakdownColumns: DataTableColumn<{ kind: FieldKind; summary: FieldSummary }>[] = [
    {
      key: 'field',
      header: t('breakdown.colField'),
      className: 'whitespace-nowrap font-medium text-gray-900 dark:text-gray-100',
      cell: (row) => t(`fields.${row.kind}`),
    },
    {
      key: 'expr',
      header: t('breakdown.colExpr'),
      cell: (row) =>
        parsed ? (
          <code className="rounded bg-indigo-50 px-1.5 py-0.5 font-mono text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
            {parsed.raw[row.kind]}
          </code>
        ) : null,
    },
    {
      key: 'meaning',
      header: t('breakdown.colMeaning'),
      className: 'text-gray-700 dark:text-gray-300',
      cell: (row) => phraseFor(row.kind, row.summary),
    },
  ]

  const runColumns: DataTableColumn<RunRow>[] = [
    {
      key: 'index',
      header: t('nextRuns.colIndex'),
      className: 'w-12 text-gray-400',
      cell: (row) => row.index,
    },
    {
      key: 'time',
      header: t('nextRuns.colTime'),
      className: 'whitespace-nowrap font-medium text-gray-900 dark:text-gray-100',
      cell: (row) => dateFormatter.format(row.date),
    },
    {
      key: 'weekday',
      header: t('nextRuns.colWeekday'),
      className: 'whitespace-nowrap',
      cell: (row) => weekdays[row.date.getDay()],
    },
    {
      key: 'relative',
      header: t('nextRuns.colRelative'),
      className: 'whitespace-nowrap text-gray-500 dark:text-gray-400',
      cell: (row) => relativeText(row.date),
    },
  ]

  return (
    <div className="relative min-h-[60vh]">
      <ParticlesBackground preset="minimal" className="absolute inset-0" />
      <div className="relative z-10 space-y-6">
        <PageHero title={t('title')} description={t('description')} />

        <NoticeCard
          tone="info"
          title={t('notice.title')}
          description={t('notice.body')}
          icon={CalendarClock}
        />

        <Card>
          <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-200">
            {t('input.label')}
          </label>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('input.placeholder')}
            spellCheck={false}
            error={!!error}
            className="!font-mono"
          />
          <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">{t('input.format')}</p>

          <div className="mt-3">
            <span className="mr-2 text-xs text-gray-500 dark:text-gray-400">
              {t('examples.heading')}:
            </span>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex.expr}
                  type="button"
                  onClick={() => setInput(ex.expr)}
                  title={ex.expr}
                  className="rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-700 transition hover:border-indigo-300 hover:text-indigo-600 dark:border-gray-700 dark:text-gray-300 dark:hover:border-indigo-700"
                >
                  {t(`examples.items.${ex.key}`)}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {error && (
          <NoticeCard tone="danger" title={t('errors.title')} description={errorMessage(error)} />
        )}

        {parsed && (
          <>
            <Card>
              <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                {t('summary.heading')}
              </h2>
              <p className="text-base text-gray-800 dark:text-gray-100">{sentence}</p>
              {showUnion && (
                <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">{t('summary.union')}</p>
              )}
            </Card>

            <Card>
              <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
                {t('breakdown.heading')}
              </h2>
              <DataTable
                columns={breakdownColumns}
                rows={summaries ?? []}
                rowKey={(row) => row.kind}
              />
            </Card>

            <Card>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                  <Clock className="h-4 w-4 text-indigo-500" />
                  {t('nextRuns.heading')}
                </h2>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-500 dark:text-gray-400">
                    {t('nextRuns.countLabel')}
                  </label>
                  <Input
                    type="number"
                    min={1}
                    max={20}
                    size="sm"
                    value={count}
                    onChange={(e) => setCount(Number(e.target.value) || 1)}
                    className="!w-20"
                  />
                  <Button variant="ghost" size="sm" onClick={() => setNowTick((n) => n + 1)}>
                    <span className="flex items-center gap-1">
                      <RefreshCw className="h-3.5 w-3.5" />
                    </span>
                  </Button>
                </div>
              </div>
              <DataTable
                columns={runColumns}
                rows={runRows}
                rowKey={(row) => String(row.index)}
                emptyText={t('nextRuns.empty')}
              />
              <p className="mt-3 text-[11px] text-gray-500 dark:text-gray-400">
                {t('nextRuns.timezoneNote')}
              </p>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}

export default CronParser
