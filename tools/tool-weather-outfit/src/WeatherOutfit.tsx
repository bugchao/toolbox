import React, { useMemo, useState } from 'react'
import { CloudSun, Shirt, Wind } from 'lucide-react'
import { Card, NoticeCard, PageHero, PropertyGrid } from '@toolbox/ui-kit'
import { useTranslation } from 'react-i18next'

const WeatherOutfit: React.FC = () => {
  const { t } = useTranslation('toolWeatherOutfit')
  const [temperature, setTemperature] = useState(18)
  const [weather, setWeather] = useState('cloudy')
  const [wind, setWind] = useState('light')
  const [activity, setActivity] = useState('city')

  const result = useMemo(() => {
    const layers =
      temperature >= 28 ? ['base_tee'] : temperature >= 20 ? ['light_top'] : temperature >= 12 ? ['layer_knit', 'light_jacket'] : ['thermal_base', 'coat']
    const accessories = [
      weather === 'rain' ? 'umbrella' : weather === 'sunny' ? 'sunglasses' : 'compact_bag',
      wind === 'strong' ? 'wind_shell' : 'light_scarf',
      activity === 'walk' ? 'sneakers' : activity === 'outdoor' ? 'sport_shoes' : 'city_shoes',
    ]

    const comfort =
      temperature >= 26 ? t('comfort.hot') : temperature >= 18 ? t('comfort.pleasant') : temperature >= 10 ? t('comfort.cool') : t('comfort.cold')

    return { layers, accessories, comfort }
  }, [temperature, weather, wind, activity, t])

  return (
    <div className="space-y-6">
      <Card className="border-cyan-200/70 bg-gradient-to-br from-white via-cyan-50 to-sky-50/80 dark:border-cyan-900/60 dark:from-slate-950 dark:via-cyan-950/20 dark:to-sky-950/10">
        <PageHero icon={CloudSun} title={t('title')} description={t('description')} />
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_420px]">
        <Card className="space-y-4">
          <label className="block space-y-2">
            <div className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('fields.temperature')}</div>
            <input type="range" min={-5} max={38} value={temperature} onChange={(event) => setTemperature(Number(event.target.value))} className="w-full accent-cyan-600" />
            <div className="text-sm text-slate-500 dark:text-slate-400">{temperature}°C</div>
          </label>

          {[
            ['weather', weather, setWeather, ['sunny', 'cloudy', 'rain']],
            ['wind', wind, setWind, ['light', 'breezy', 'strong']],
            ['activity', activity, setActivity, ['city', 'walk', 'outdoor']],
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
                        ? 'border-cyan-500 bg-cyan-600 text-white'
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
          <NoticeCard tone="info" icon={Shirt} title={t('resultTitle')} description={result.comfort} />

          <Card className="space-y-4">
            <PropertyGrid
              items={[
                { label: t('sections.layering'), value: result.layers.map((item) => t(`items.${item}`)).join(' / '), tone: 'primary' },
                { label: t('sections.accessories'), value: result.accessories.map((item) => t(`items.${item}`)).join(' / '), tone: 'success' },
              ]}
              className="xl:grid-cols-1"
            />
          </Card>

          <Card className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
              <Wind className="h-4 w-4" />
              {t('packingTitle')}
            </div>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
              {(t('packingTips', { returnObjects: true }) as string[]).map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default WeatherOutfit
