import React, { useMemo, useState } from 'react'
import { Card, Input, NoticeCard, PageHero, ParticlesBackground } from '@toolbox/ui-kit'
import { useTranslation } from 'react-i18next'
import { Timer } from 'lucide-react'
import { addToDate, clockFormat, humanize, parseDuration, toAllUnits } from './lib/duration'

const UNIT_KEYS = ['ms', 's', 'm', 'h', 'd', 'w'] as const

function toLocalInput(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const DurationCalc: React.FC = () => {
  const { t } = useTranslation('toolDurationCalc')
  const [input, setInput] = useState('1d2h30m')
  const [baseStr, setBaseStr] = useState(() => toLocalInput(new Date()))

  const parsed = useMemo(() => parseDuration(input), [input])
  const ms = parsed.ok ? parsed.ms : null

  const units = useMemo(() => (ms != null ? toAllUnits(ms) : null), [ms])

  const result = useMemo(() => {
    if (ms == null) return null
    const base = new Date(baseStr)
    if (Number.isNaN(base.getTime())) return null
    return addToDate(base, ms)
  }, [ms, baseStr])

  const copy = (s: string) => { void navigator.clipboard?.writeText(s).catch(() => undefined) }

  const fmtNum = (n: number) => {
    const r = Math.round(n * 1e6) / 1e6
    return r.toLocaleString('en-US', { maximumFractionDigits: 6 })
  }

  return (
    <div className="relative min-h-[60vh]">
      <ParticlesBackground preset="minimal" className="absolute inset-0" />
      <div className="relative z-10 space-y-6">
        <PageHero title={t('title')} description={t('description')} />

        <NoticeCard tone="info" title={t('notice.title')} description={t('notice.body')} icon={Timer} />

        <Card>
          <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-200">{t('input.label')}</label>
          <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="1d2h30m / 90m / 1.5h / 500ms / 45" spellCheck={false} className="!font-mono" />
          {!parsed.ok && input.trim() && (
            <p className="mt-1 text-xs text-rose-600 dark:text-rose-300">{t('input.error')}</p>
          )}
          {ms != null && (
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
              <button type="button" onClick={() => copy(humanize(ms))} className="rounded bg-indigo-50 px-2 py-1 font-mono text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-300">
                {humanize(ms)}
              </button>
              <button type="button" onClick={() => copy(clockFormat(ms))} className="rounded bg-gray-100 px-2 py-1 font-mono text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200">
                {clockFormat(ms)}
              </button>
            </div>
          )}
        </Card>

        {units && (
          <Card>
            <h2 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-200">{t('units.heading')}</h2>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {UNIT_KEYS.map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => copy(String(units[u]))}
                  className="flex items-center gap-3 rounded-md border border-gray-200 px-3 py-2 text-left transition hover:border-indigo-300 dark:border-gray-700 dark:hover:border-indigo-700"
                >
                  <span className="w-10 shrink-0 text-[10px] font-bold uppercase text-gray-500 dark:text-gray-400">{t(`units.${u}`)}</span>
                  <code className="flex-1 truncate font-mono text-sm text-gray-800 dark:text-gray-100">{fmtNum(units[u])}</code>
                </button>
              ))}
            </div>
          </Card>
        )}

        {ms != null && (
          <Card>
            <h2 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-200">{t('addto.heading')}</h2>
            <div className="flex flex-wrap items-end gap-3">
              <div>
                <label className="mb-1 block text-[11px] text-gray-500 dark:text-gray-400">{t('addto.base')}</label>
                <input
                  type="datetime-local"
                  value={baseStr}
                  onChange={(e) => setBaseStr(e.target.value)}
                  className="rounded border border-gray-300 bg-white px-2 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-900"
                />
              </div>
              <div className="text-sm">
                <span className="text-gray-400">+{humanize(ms)} = </span>
                {result ? (
                  <button type="button" onClick={() => copy(result.toISOString())} className="font-mono font-semibold text-indigo-700 dark:text-indigo-300">
                    {result.toLocaleString()}
                  </button>
                ) : (
                  <span className="text-rose-500">{t('addto.badBase')}</span>
                )}
              </div>
            </div>
            {result && (
              <p className="mt-2 text-[11px] text-gray-400">ISO: <code className="font-mono">{result.toISOString()}</code></p>
            )}
          </Card>
        )}
      </div>
    </div>
  )
}

export default DurationCalc
