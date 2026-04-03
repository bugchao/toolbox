import React, { useMemo, useState } from 'react'
import { ShieldAlert, Stethoscope } from 'lucide-react'
import { Card, NoticeCard, PageHero, PropertyGrid } from '@toolbox/ui-kit'
import { useTranslation } from 'react-i18next'

const TravelRisk: React.FC = () => {
  const { t } = useTranslation('toolTravelRisk')
  const [destination, setDestination] = useState('urban')
  const [season, setSeason] = useState('shoulder')
  const [healthNeed, setHealthNeed] = useState('standard')
  const [tripStyle, setTripStyle] = useState('balanced')

  const result = useMemo(() => {
    const safety = destination === 'remote' ? 72 : destination === 'coastal' ? 48 : 36
    const health = healthNeed === 'sensitive' ? 68 : healthNeed === 'family' ? 54 : 34
    const logistics = tripStyle === 'aggressive' ? 74 : tripStyle === 'budget' ? 58 : 38
    const weather = season === 'peak' ? 52 : season === 'extreme' ? 74 : 34
    const total = Math.round((safety + health + logistics + weather) / 4)
    const band = total > 70 ? 'danger' : total > 50 ? 'warning' : 'success'
    return { safety, health, logistics, weather, total, band }
  }, [destination, season, healthNeed, tripStyle])

  return (
    <div className="space-y-6">
      <Card className="border-rose-200/70 bg-gradient-to-br from-white via-rose-50 to-orange-50/70 dark:border-rose-900/60 dark:from-slate-950 dark:via-rose-950/20 dark:to-orange-950/10">
        <PageHero icon={ShieldAlert} title={t('title')} description={t('description')} />
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_420px]">
        <Card className="space-y-4">
          {[
            ['destination', destination, setDestination, ['urban', 'coastal', 'remote']],
            ['season', season, setSeason, ['shoulder', 'peak', 'extreme']],
            ['healthNeed', healthNeed, setHealthNeed, ['standard', 'family', 'sensitive']],
            ['tripStyle', tripStyle, setTripStyle, ['balanced', 'budget', 'aggressive']],
          ].map(([key, current, setter, values]) => (
            <div key={key as string} className="space-y-2">
              <div className="text-sm font-medium text-slate-700 dark:text-slate-300">{t(`fields.${key}`)}</div>
              <div className={`grid gap-2 ${key === 'tripStyle' ? 'grid-cols-3' : 'grid-cols-3'}`}>
                {(values as string[]).map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => (setter as React.Dispatch<React.SetStateAction<string>>)(value)}
                    className={[
                      'rounded-xl border px-3 py-2 text-sm font-semibold transition',
                      current === value
                        ? 'border-rose-500 bg-rose-600 text-white'
                        : 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300',
                    ].join(' ')}
                  >
                    {t(`options.${value}`)}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </Card>

        <div className="space-y-6">
          <NoticeCard
            tone={result.band}
            icon={Stethoscope}
            title={t('assessmentTitle')}
            description={t('assessmentDescription', { score: result.total })}
          />
          <Card>
            <PropertyGrid
              items={[
                { label: t('stats.safety'), value: `${result.safety}/100`, tone: result.safety > 65 ? 'danger' : result.safety > 50 ? 'warning' : 'success' },
                { label: t('stats.health'), value: `${result.health}/100`, tone: result.health > 65 ? 'danger' : result.health > 50 ? 'warning' : 'success' },
                { label: t('stats.logistics'), value: `${result.logistics}/100`, tone: result.logistics > 65 ? 'danger' : result.logistics > 50 ? 'warning' : 'success' },
                { label: t('stats.weather'), value: `${result.weather}/100`, tone: result.weather > 65 ? 'danger' : result.weather > 50 ? 'warning' : 'success' }
              ]}
              className="xl:grid-cols-1"
            />
          </Card>

          <Card className="space-y-3">
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{t('checklistTitle')}</div>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
              {(t(`checklists.${result.band}`, { returnObjects: true }) as string[]).map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default TravelRisk
