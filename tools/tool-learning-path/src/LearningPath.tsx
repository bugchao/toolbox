import React, { useMemo, useState } from 'react'
import { Milestone, Route } from 'lucide-react'
import { Card, NoticeCard, PageHero, PropertyGrid, Timeline } from '@toolbox/ui-kit'
import { useTranslation } from 'react-i18next'

const LearningPath: React.FC = () => {
  const { t } = useTranslation('toolLearningPath')
  const [goal, setGoal] = useState('React 性能优化')
  const [level, setLevel] = useState('intermediate')
  const [weeks, setWeeks] = useState(8)

  const path = useMemo(() => {
    const stageLength = Math.max(1, Math.round(weeks / 4))
    const phases = [
      t('phases.foundation', { weeks: `${1}-${stageLength}` }),
      t('phases.practice', { weeks: `${stageLength + 1}-${stageLength * 2}` }),
      t('phases.integration', { weeks: `${stageLength * 2 + 1}-${stageLength * 3}` }),
      t('phases.showcase', { weeks: `${stageLength * 3 + 1}-${weeks}` }),
    ]
    return phases.map((title, index) => ({
      time: t('weekRange', { start: index * stageLength + 1, end: Math.min(weeks, (index + 1) * stageLength) }),
      title,
      description: t(`descriptions.${index}`),
    }))
  }, [goal, level, weeks, t])

  return (
    <div className="space-y-6">
      <Card className="border-emerald-200/70 bg-gradient-to-br from-white via-emerald-50 to-teal-50/70 dark:border-emerald-900/60 dark:from-slate-950 dark:via-emerald-950/20 dark:to-teal-950/10">
        <PageHero icon={Route} title={t('title')} description={t('description')} />
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_420px]">
        <Card className="space-y-4">
          <label className="block space-y-2">
            <div className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('fields.goal')}</div>
            <input value={goal} onChange={(event) => setGoal(event.target.value)} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
          </label>
          {[
            ['level', level, setLevel, ['beginner', 'intermediate', 'advanced']],
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
                        ? 'border-emerald-500 bg-emerald-600 text-white'
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
            <div className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('fields.weeks')}</div>
            <input type="range" min={4} max={24} value={weeks} onChange={(event) => setWeeks(Number(event.target.value))} className="w-full accent-emerald-600" />
            <div className="text-sm text-slate-500 dark:text-slate-400">{t('weekCount', { count: weeks })}</div>
          </label>
        </Card>

        <div className="space-y-6">
          <NoticeCard tone="success" icon={Milestone} title={goal} description={t('noticeDescription', { level: t(`options.${level}`), weeks })} />
          <Card>
            <PropertyGrid
              items={[
                { label: t('stats.level'), value: t(`options.${level}`), tone: 'primary' },
                { label: t('stats.duration'), value: t('weekCount', { count: weeks }), tone: 'success' },
                { label: t('stats.phases'), value: path.length, tone: 'warning' },
              ]}
              className="xl:grid-cols-1"
            />
          </Card>
          <Card className="space-y-4">
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{t('timelineTitle')}</div>
            <Timeline items={path} />
          </Card>
        </div>
      </div>
    </div>
  )
}

export default LearningPath
