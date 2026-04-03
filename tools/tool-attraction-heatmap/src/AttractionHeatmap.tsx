import React, { useMemo, useState } from 'react'
import { Flame, MapPinned } from 'lucide-react'
import { Card, NoticeCard, PageHero, PropertyGrid } from '@toolbox/ui-kit'
import { useTranslation } from 'react-i18next'

const AttractionHeatmap: React.FC = () => {
  const { t } = useTranslation('toolAttractionHeatmap')
  const [scene, setScene] = useState('museum')
  const [dayType, setDayType] = useState('weekday')
  const [arrival, setArrival] = useState(10)

  const rows = useMemo(() => {
    const base = scene === 'market' ? 52 : scene === 'waterfront' ? 46 : 38
    const dayBoost = dayType === 'holiday' ? 22 : dayType === 'weekend' ? 12 : 0

    return Array.from({ length: 11 }, (_, index) => {
      const hour = index + 8
      const peak = scene === 'museum' ? 14 : scene === 'waterfront' ? 18 : 12
      const swing = Math.max(0, 26 - Math.abs(hour - peak) * 6)
      const value = Math.min(100, base + dayBoost + swing)
      return { hour, value }
    })
  }, [scene, dayType])

  const best = [...rows].sort((a, b) => a.value - b.value)[0]
  const arrivalRow = rows.find((item) => item.hour === arrival) ?? rows[0]

  return (
    <div className="space-y-6">
      <Card className="border-orange-200/70 bg-gradient-to-br from-white via-orange-50 to-amber-50/80 dark:border-orange-900/60 dark:from-slate-950 dark:via-orange-950/20 dark:to-amber-950/10">
        <PageHero icon={MapPinned} title={t('title')} description={t('description')} />
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_420px]">
        <Card className="space-y-4">
          {[
            ['scene', scene, setScene, ['museum', 'waterfront', 'market']],
            ['dayType', dayType, setDayType, ['weekday', 'weekend', 'holiday']],
          ].map(([key, current, setter, values]) => (
            <div key={key as string} className="space-y-2">
              <div className="text-sm font-medium text-slate-700 dark:text-slate-300">{t(`fields.${key}`)}</div>
              <div className="grid grid-cols-3 gap-2">
                {(values as string[]).map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => (setter as React.Dispatch<React.SetStateAction<string>>)(value)}
                    className={[
                      'rounded-xl border px-3 py-2 text-sm font-semibold transition',
                      current === value
                        ? 'border-orange-500 bg-orange-500 text-white'
                        : 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300',
                    ].join(' ')}
                  >
                    {t(`options.${value}`)}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <label className="block space-y-2">
            <div className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('fields.arrival')}</div>
            <input type="range" min={8} max={18} value={arrival} onChange={(event) => setArrival(Number(event.target.value))} className="w-full accent-orange-500" />
            <div className="text-sm text-slate-500 dark:text-slate-400">{arrival}:00</div>
          </label>

          <div className="space-y-3">
            {rows.map((row) => (
              <div key={row.hour} className="grid grid-cols-[56px_minmax(0,1fr)_48px] items-center gap-3">
                <div className="text-sm text-slate-500 dark:text-slate-400">{row.hour}:00</div>
                <div className="h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-500" style={{ width: `${row.value}%` }} />
                </div>
                <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">{row.value}</div>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-6">
          <NoticeCard
            tone={arrivalRow.value > 75 ? 'warning' : arrivalRow.value > 55 ? 'info' : 'success'}
            icon={Flame}
            title={t('recommendationTitle', { hour: `${best.hour}:00` })}
            description={t('recommendationDescription', { current: arrivalRow.value, best: best.value })}
          />

          <Card>
            <PropertyGrid
              items={[
                { label: t('stats.bestSlot'), value: `${best.hour}:00`, tone: 'success' },
                { label: t('stats.arrivalHeat'), value: `${arrivalRow.value}/100`, tone: arrivalRow.value > 75 ? 'danger' : arrivalRow.value > 55 ? 'warning' : 'primary' },
                { label: t('stats.peakSlot'), value: `${rows.reduce((max, row) => (row.value > max.value ? row : max), rows[0]).hour}:00`, tone: 'warning' },
              ]}
              className="xl:grid-cols-1"
            />
          </Card>
        </div>
      </div>
    </div>
  )
}

export default AttractionHeatmap
