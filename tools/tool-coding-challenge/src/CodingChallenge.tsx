import React, { useMemo, useState } from 'react'
import { Code2, Flag, Timer } from 'lucide-react'
import { Card, NoticeCard, PageHero, PropertyGrid, Timeline } from '@toolbox/ui-kit'
import { useTranslation } from 'react-i18next'

const CodingChallenge: React.FC = () => {
  const { t } = useTranslation('toolCodingChallenge')
  const [topic, setTopic] = useState('frontend')
  const [difficulty, setDifficulty] = useState('intermediate')
  const [minutes, setMinutes] = useState(75)
  const [constraints, setConstraints] = useState('需要考虑错误状态、边界输入和可维护性。')

  const challenge = useMemo(() => {
    const title = t(`titles.${topic}.${difficulty}`)
    const summary = t(`summaries.${topic}`, { minutes })
    const tasks = [0, 1, 2].map((index) => t(`tasks.${topic}.${index}`))
    const criteria = [0, 1, 2].map((index) => t(`criteria.${difficulty}.${index}`))
    const stages = [0, 1, 2, 3].map((index) => ({
      time: t('timeline.time', { minutes: Math.max(10, Math.round((minutes / 4) * (index + 1))) }),
      title: t(`timeline.${index}.title`),
      description: t(`timeline.${index}.description`, { difficulty: t(`options.${difficulty}`) }),
    }))

    return {
      title,
      summary,
      tasks,
      criteria,
      stages,
    }
  }, [difficulty, minutes, t, topic])

  return (
    <div className="space-y-6">
      <Card className="border-violet-200/70 bg-gradient-to-br from-white via-violet-50 to-fuchsia-50/70 dark:border-violet-900/60 dark:from-slate-950 dark:via-violet-950/20 dark:to-fuchsia-950/10">
        <PageHero icon={Code2} title={t('title')} description={t('description')} />
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_440px]">
        <Card className="space-y-5">
          <div className="space-y-2">
            <div className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('fields.topic')}</div>
            <div className="grid gap-2 sm:grid-cols-3">
              {['frontend', 'backend', 'algorithm'].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTopic(value)}
                  className={[
                    'rounded-xl border px-3 py-2 text-sm font-semibold transition',
                    topic === value
                      ? 'border-violet-500 bg-violet-600 text-white'
                      : 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300',
                  ].join(' ')}
                >
                  {t(`options.${value}`)}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('fields.difficulty')}</div>
            <div className="grid gap-2 sm:grid-cols-3">
              {['beginner', 'intermediate', 'advanced'].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setDifficulty(value)}
                  className={[
                    'rounded-xl border px-3 py-2 text-sm font-semibold transition',
                    difficulty === value
                      ? 'border-violet-500 bg-violet-600 text-white'
                      : 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300',
                  ].join(' ')}
                >
                  {t(`options.${value}`)}
                </button>
              ))}
            </div>
          </div>

          <label className="block space-y-2">
            <div className="flex items-center justify-between text-sm font-medium text-slate-700 dark:text-slate-300">
              <span>{t('fields.minutes')}</span>
              <span>{t('minuteCount', { count: minutes })}</span>
            </div>
            <input
              type="range"
              min={30}
              max={120}
              step={15}
              value={minutes}
              onChange={(event) => setMinutes(Number(event.target.value))}
              className="w-full accent-violet-600"
            />
          </label>

          <label className="block space-y-2">
            <div className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('fields.constraints')}</div>
            <textarea
              value={constraints}
              onChange={(event) => setConstraints(event.target.value)}
              rows={5}
              placeholder={t('placeholders.constraints')}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm leading-6 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </label>
        </Card>

        <div className="space-y-6">
          <NoticeCard
            tone="success"
            icon={Flag}
            title={challenge.title}
            description={
              <div className="space-y-2">
                <div>{challenge.summary}</div>
                <div>{t('constraintSummary', { constraints })}</div>
              </div>
            }
          />

          <Card>
            <PropertyGrid
              items={[
                { label: t('stats.topic'), value: t(`options.${topic}`), tone: 'primary' },
                { label: t('stats.difficulty'), value: t(`options.${difficulty}`), tone: 'warning' },
                { label: t('stats.duration'), value: t('minuteCount', { count: minutes }), tone: 'success' },
              ]}
              className="xl:grid-cols-1"
            />
          </Card>

          <Card className="space-y-4">
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{t('tasksTitle')}</div>
            <div className="grid gap-3">
              {challenge.tasks.map((item, index) => (
                <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300">
                  <span className="mr-2 font-semibold text-violet-600 dark:text-violet-300">0{index + 1}</span>
                  {item}
                </div>
              ))}
            </div>
          </Card>

          <Card className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
              <Timer className="h-4 w-4 text-violet-500" />
              {t('timelineTitle')}
            </div>
            <Timeline items={challenge.stages} />
          </Card>

          <Card className="space-y-4">
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{t('criteriaTitle')}</div>
            <div className="grid gap-3">
              {challenge.criteria.map((item) => (
                <div key={item} className="rounded-2xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm text-violet-900 dark:border-violet-900 dark:bg-violet-950/30 dark:text-violet-100">
                  {item}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default CodingChallenge
