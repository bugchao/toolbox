import React, { useMemo, useState } from 'react'
import { Card, Input, NoticeCard, PageHero, ParticlesBackground } from '@toolbox/ui-kit'
import { useTranslation } from 'react-i18next'
import { CalendarClock } from 'lucide-react'
import { describeEnglish, nextRuns, parseCron, PRESETS } from './lib/cron'

const FIELD_LABELS = ['minute', 'hour', 'dom', 'month', 'dow'] as const

const CronExplain: React.FC = () => {
  const { t, i18n } = useTranslation('toolCronExplain')
  const [expr, setExpr] = useState('0 9 * * 1-5')

  const parsed = useMemo(() => parseCron(expr), [expr])
  const runs = useMemo(() => (parsed.ok ? nextRuns(parsed.cron, new Date(), 6) : []), [parsed])
  const englishDesc = useMemo(() => (parsed.ok ? describeEnglish(parsed.cron) : ''), [parsed])

  const fmt = (d: Date) => {
    try {
      return new Intl.DateTimeFormat(i18n.language === 'zh' ? 'zh-CN' : 'en-US', {
        weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
      }).format(d)
    } catch {
      return d.toISOString()
    }
  }

  const relative = (d: Date) => {
    const diffMin = Math.round((d.getTime() - Date.now()) / 60000)
    if (diffMin < 60) return t('runs.inMinutes', { n: diffMin })
    if (diffMin < 60 * 24) return t('runs.inHours', { n: Math.round(diffMin / 60) })
    return t('runs.inDays', { n: Math.round(diffMin / 60 / 24) })
  }

  const fields = expr.trim().replace(/\s+/g, ' ').split(' ')

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
            value={expr}
            onChange={(e) => setExpr(e.target.value)}
            placeholder="0 9 * * 1-5"
            spellCheck={false}
            autoComplete="off"
            className="!font-mono"
          />

          {/* 5 字段图示 */}
          {fields.length === 5 && (
            <div className="mt-2 grid grid-cols-5 gap-1 text-center text-[10px]">
              {fields.map((f, i) => (
                <div key={i} className="rounded border border-gray-200 py-1 dark:border-gray-700">
                  <div className="font-mono text-sm text-gray-800 dark:text-gray-100">{f}</div>
                  <div className="text-gray-400">{t(`fields.${FIELD_LABELS[i]}`)}</div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-gray-500 dark:text-gray-400">{t('input.presets')}:</span>
            {PRESETS.map((p) => (
              <button
                key={p.expr}
                type="button"
                onClick={() => setExpr(p.expr)}
                title={p.expr}
                className="rounded-full border border-gray-300 px-2.5 py-0.5 text-gray-700 transition hover:border-gray-400 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                {t(`presets.${p.key}`)}
              </button>
            ))}
          </div>

          {!parsed.ok && expr.trim() && (
            <div className="mt-3 rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:border-rose-700 dark:bg-rose-900/30 dark:text-rose-200">
              {parsed.field ? t('error.field', { field: t(`fields.${parsed.field}`), msg: parsed.message }) : t('error.generic', { msg: parsed.message })}
            </div>
          )}
        </Card>

        {parsed.ok && (
          <>
            <Card>
              <h2 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200">{t('desc.heading')}</h2>
              <p className="font-mono text-sm text-indigo-700 dark:text-indigo-300">{englishDesc}</p>
            </Card>

            <Card>
              <h2 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-200">{t('runs.heading')}</h2>
              {runs.length === 0 ? (
                <p className="text-sm text-gray-400">{t('runs.none')}</p>
              ) : (
                <ul className="space-y-1.5">
                  {runs.map((d, i) => (
                    <li key={i} className="flex items-center justify-between rounded-md border border-gray-100 px-3 py-2 text-sm dark:border-gray-800">
                      <span className="font-mono text-gray-800 dark:text-gray-100">{fmt(d)}</span>
                      <span className="text-xs text-gray-400">{relative(d)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </>
        )}
      </div>
    </div>
  )
}

export default CronExplain
