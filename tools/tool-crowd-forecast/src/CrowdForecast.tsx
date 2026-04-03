import React, { useMemo, useState } from 'react'
import { Activity, Users } from 'lucide-react'
import { Card, NoticeCard, PageHero, PropertyGrid } from '@toolbox/ui-kit'
import { useTranslation } from 'react-i18next'

const CrowdForecast: React.FC = () => {
  const { t } = useTranslation('toolCrowdForecast')
  const [place, setPlace] = useState('themepark')
  const [weather, setWeather] = useState('clear')
  const [holiday, setHoliday] = useState('no')
  const [groupSize, setGroupSize] = useState(2)

  const result = useMemo(() => {
    const placeBase = place === 'themepark' ? 72 : place === 'station' ? 64 : 48
    const weatherShift = weather === 'rain' ? -12 : weather === 'hot' ? 8 : 0
    const holidayShift = holiday === 'yes' ? 14 : 0
    const groupShift = Math.min(10, groupSize * 2)
    const score = Math.max(12, Math.min(96, placeBase + weatherShift + holidayShift + groupShift))
    const bestHour = score > 72 ? '09:00' : score > 55 ? '10:00' : '11:00'
    return { score, bestHour }
  }, [place, weather, holiday, groupSize])

  return (
    <div className="space-y-6">
      <Card className="border-indigo-200/70 bg-gradient-to-br from-white via-indigo-50 to-sky-50/70 dark:border-indigo-900/60 dark:from-slate-950 dark:via-indigo-950/20 dark:to-sky-950/10">
        <PageHero icon={Users} title={t('title')} description={t('description')} />
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_420px]">
        <Card className="space-y-4">
          {[
            ['place', place, setPlace, ['themepark', 'station', 'shopping']],
            ['weather', weather, setWeather, ['clear', 'hot', 'rain']],
            ['holiday', holiday, setHoliday, ['no', 'yes']],
          ].map(([key, current, setter, values]) => (
            <div key={key as string} className="space-y-2">
              <div className="text-sm font-medium text-slate-700 dark:text-slate-300">{t(`fields.${key}`)}</div>
              <div className={`grid gap-2 ${key === 'holiday' ? 'grid-cols-2' : 'grid-cols-3'}`}>
                {(values as string[]).map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => (setter as React.Dispatch<React.SetStateAction<string>>)(value)}
                    className={[
                      'rounded-xl border px-3 py-2 text-sm font-semibold transition',
                      current === value
                        ? 'border-indigo-500 bg-indigo-600 text-white'
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
            <div className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('fields.groupSize')}</div>
            <input type="range" min={1} max={5} value={groupSize} onChange={(event) => setGroupSize(Number(event.target.value))} className="w-full accent-indigo-500" />
            <div className="text-sm text-slate-500 dark:text-slate-400">{t('groupSizeValue', { count: groupSize })}</div>
          </label>
        </Card>

        <div className="space-y-6">
          <NoticeCard
            tone={result.score > 75 ? 'warning' : result.score > 55 ? 'info' : 'success'}
            icon={Activity}
            title={t('forecastTitle')}
            description={t('forecastDescription', { score: result.score, hour: result.bestHour })}
          />
          <Card>
            <PropertyGrid
              items={[
                { label: t('stats.crowdIndex'), value: `${result.score}/100`, tone: result.score > 75 ? 'danger' : result.score > 55 ? 'warning' : 'success' },
                { label: t('stats.bestHour'), value: result.bestHour, tone: 'primary' },
                { label: t('stats.queueEstimate'), value: `${Math.round(result.score * 0.7)} ${t('minutes')}`, tone: 'warning' },
              ]}
              className="xl:grid-cols-1"
            />
          </Card>
        </div>
      </div>
    </div>
  )
}

export default CrowdForecast
