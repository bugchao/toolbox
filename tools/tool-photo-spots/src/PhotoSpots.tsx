import React, { useMemo, useState } from 'react'
import { Camera, Map } from 'lucide-react'
import { Card, DataTable, NoticeCard, PageHero } from '@toolbox/ui-kit'
import { useTranslation } from 'react-i18next'

const PhotoSpots: React.FC = () => {
  const { t } = useTranslation('toolPhotoSpots')
  const [city, setCity] = useState('historic')
  const [style, setStyle] = useState('street')
  const [light, setLight] = useState('sunset')

  const spots = useMemo(() => {
    const library: Record<string, Array<{ name: string; best: string; note: string }>> = {
      historic: [
        { name: t('spots.alley'), best: t('notes.alley'), note: t('angles.leadingLines') },
        { name: t('spots.square'), best: t('notes.square'), note: t('angles.framePeople') },
        { name: t('spots.rooftop'), best: t('notes.rooftop'), note: t('angles.useLayering') },
      ],
      coastal: [
        { name: t('spots.pier'), best: t('notes.pier'), note: t('angles.reflectiveWater') },
        { name: t('spots.breakwater'), best: t('notes.breakwater'), note: t('angles.longLens') },
        { name: t('spots.cliff'), best: t('notes.cliff'), note: t('angles.negativeSpace') },
      ],
      mountain: [
        { name: t('spots.lookout'), best: t('notes.lookout'), note: t('angles.depthFog') },
        { name: t('spots.trail'), best: t('notes.trail'), note: t('angles.pathStory') },
        { name: t('spots.cabin'), best: t('notes.cabin'), note: t('angles.warmContrast') },
      ],
    }

    return library[city].map((item, index) => ({
      ...item,
      style: t(`styles.${style}`),
      light: t(`lights.${light}`),
      priority: index + 1,
    }))
  }, [city, style, light, t])

  return (
    <div className="space-y-6">
      <Card className="border-fuchsia-200/70 bg-gradient-to-br from-white via-fuchsia-50 to-pink-50/70 dark:border-fuchsia-900/60 dark:from-slate-950 dark:via-fuchsia-950/20 dark:to-pink-950/10">
        <PageHero icon={Camera} title={t('title')} description={t('description')} />
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_420px]">
        <Card className="space-y-4">
          {[
            ['city', city, setCity, ['historic', 'coastal', 'mountain']],
            ['style', style, setStyle, ['street', 'portrait', 'editorial']],
            ['light', light, setLight, ['sunrise', 'sunset', 'bluehour']],
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
                        ? 'border-fuchsia-500 bg-fuchsia-600 text-white'
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
          <NoticeCard tone="success" icon={Map} title={t('recommendTitle')} description={t('recommendDescription', { city: t(`options.${city}`) })} />
          <Card>
            <DataTable
              rows={spots}
              rowKey={(row) => row.name}
              columns={[
                { key: 'priority', header: '#', cell: (row) => row.priority },
                { key: 'name', header: t('headers.spot'), cell: (row) => <span className="font-semibold">{row.name}</span> },
                { key: 'best', header: t('headers.best'), cell: (row) => row.best },
                { key: 'note', header: t('headers.note'), cell: (row) => row.note },
              ]}
            />
          </Card>
        </div>
      </div>
    </div>
  )
}

export default PhotoSpots
