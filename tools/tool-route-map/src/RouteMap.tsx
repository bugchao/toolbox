import React, { useMemo, useState } from 'react'
import { Route, Timer } from 'lucide-react'
import { Card, NoticeCard, PageHero, PropertyGrid, Timeline } from '@toolbox/ui-kit'
import { useTranslation } from 'react-i18next'

const RouteMap: React.FC = () => {
  const { t } = useTranslation('toolRouteMap')
  const [stops, setStops] = useState('Hotel\nMuseum\nCafe\nRiverfront')
  const [start, setStart] = useState('09:00')
  const [pace, setPace] = useState('balanced')

  const timeline = useMemo(() => {
    const stopList = stops.split('\n').map((item) => item.trim()).filter(Boolean)
    const [hour, minute] = start.split(':').map(Number)
    let current = hour * 60 + minute
    const moveGap = pace === 'relaxed' ? 45 : pace === 'fast' ? 25 : 35
    const stayGap = pace === 'relaxed' ? 80 : pace === 'fast' ? 50 : 65

    return stopList.map((title, index) => {
      const label = `${String(Math.floor(current / 60)).padStart(2, '0')}:${String(current % 60).padStart(2, '0')}`
      current += stayGap
      if (index < stopList.length - 1) current += moveGap
      return {
        time: label,
        title,
        description: index < stopList.length - 1 ? t('segmentDescription', { moveGap, stayGap }) : t('lastStop'),
      }
    })
  }, [stops, start, pace, t])

  return (
    <div className="space-y-6">
      <Card className="border-teal-200/70 bg-gradient-to-br from-white via-teal-50 to-cyan-50/70 dark:border-teal-900/60 dark:from-slate-950 dark:via-teal-950/20 dark:to-cyan-950/10">
        <PageHero icon={Route} title={t('title')} description={t('description')} />
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_420px]">
        <Card className="space-y-4">
          <label className="block space-y-2">
            <div className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('fields.stops')}</div>
            <textarea
              value={stops}
              onChange={(event) => setStops(event.target.value)}
              rows={8}
              placeholder={t('placeholders.stops')}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm leading-6 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block space-y-2">
              <div className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('fields.start')}</div>
              <input type="time" value={start} onChange={(event) => setStart(event.target.value)} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
            </label>
            <div className="space-y-2">
              <div className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('fields.pace')}</div>
              <div className="grid grid-cols-3 gap-2">
                {['fast', 'balanced', 'relaxed'].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setPace(value)}
                    className={[
                      'rounded-xl border px-3 py-2 text-sm font-semibold transition',
                      pace === value
                        ? 'border-teal-500 bg-teal-600 text-white'
                        : 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300',
                    ].join(' ')}
                  >
                    {t(`options.${value}`)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          <NoticeCard
            tone="info"
            icon={Timer}
            title={t('summaryTitle')}
            description={t('summaryDescription', { count: timeline.length, start, end: timeline[timeline.length - 1]?.time ?? start })}
          />
          <Card>
            <PropertyGrid
              items={[
                { label: t('stats.stopCount'), value: timeline.length, tone: 'primary' },
                { label: t('stats.firstDeparture'), value: start, tone: 'success' },
                { label: t('stats.lastArrival'), value: timeline[timeline.length - 1]?.time ?? start, tone: 'warning' },
              ]}
              className="xl:grid-cols-1"
            />
          </Card>
          <Card className="space-y-4">
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{t('timelineTitle')}</div>
            <Timeline items={timeline} />
          </Card>
        </div>
      </div>
    </div>
  )
}

export default RouteMap
