import React, { useMemo, useState } from 'react'
import { Braces, MessageSquareQuote } from 'lucide-react'
import { Card, DataTable, NoticeCard, PageHero, PropertyGrid } from '@toolbox/ui-kit'
import { useTranslation } from 'react-i18next'

const FrontendInterview: React.FC = () => {
  const { t } = useTranslation('toolFrontendInterview')
  const [focus, setFocus] = useState('react')
  const [level, setLevel] = useState('mid')
  const [rounds, setRounds] = useState(4)

  const questions = useMemo(
    () =>
      Array.from({ length: rounds }, (_, index) => ({
        id: `${focus}-${level}-${index}`,
        category: t(`categories.${focus}`),
        question: t(`questions.${focus}.${index}`),
        followUp: t(`followUps.${level}.${index}`),
      })),
    [focus, level, rounds, t]
  )

  return (
    <div className="space-y-6">
      <Card className="border-cyan-200/70 bg-gradient-to-br from-white via-cyan-50 to-sky-50/70 dark:border-cyan-900/60 dark:from-slate-950 dark:via-cyan-950/20 dark:to-sky-950/10">
        <PageHero icon={Braces} title={t('title')} description={t('description')} />
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_420px]">
        <Card className="space-y-5">
          <div className="space-y-2">
            <div className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('fields.focus')}</div>
            <div className="grid gap-2 sm:grid-cols-4">
              {['react', 'css', 'performance', 'architecture'].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFocus(value)}
                  className={[
                    'rounded-xl border px-3 py-2 text-sm font-semibold transition',
                    focus === value
                      ? 'border-cyan-500 bg-cyan-600 text-white'
                      : 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300',
                  ].join(' ')}
                >
                  {t(`options.${value}`)}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('fields.level')}</div>
            <div className="grid gap-2 sm:grid-cols-3">
              {['junior', 'mid', 'senior'].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setLevel(value)}
                  className={[
                    'rounded-xl border px-3 py-2 text-sm font-semibold transition',
                    level === value
                      ? 'border-cyan-500 bg-cyan-600 text-white'
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
              <span>{t('fields.rounds')}</span>
              <span>{t('roundCount', { count: rounds })}</span>
            </div>
            <input
              type="range"
              min={3}
              max={6}
              value={rounds}
              onChange={(event) => setRounds(Number(event.target.value))}
              className="w-full accent-cyan-600"
            />
          </label>

          <Card className="border-dashed border-cyan-200 bg-cyan-50/70 dark:border-cyan-900 dark:bg-cyan-950/20">
            <div className="text-sm font-semibold text-cyan-900 dark:text-cyan-100">{t('coachTitle')}</div>
            <div className="mt-2 text-sm leading-6 text-cyan-800 dark:text-cyan-200">
              {t('coachDescription', { focus: t(`options.${focus}`), level: t(`options.${level}`) })}
            </div>
          </Card>
        </Card>

        <div className="space-y-6">
          <NoticeCard
            tone="info"
            icon={MessageSquareQuote}
            title={t('noticeTitle')}
            description={t('noticeDescription', { count: questions.length, focus: t(`options.${focus}`) })}
          />
          <Card>
            <PropertyGrid
              items={[
                { label: t('stats.focus'), value: t(`options.${focus}`), tone: 'primary' },
                { label: t('stats.level'), value: t(`options.${level}`), tone: 'warning' },
                { label: t('stats.rounds'), value: t('roundCount', { count: rounds }), tone: 'success' },
              ]}
              className="xl:grid-cols-1"
            />
          </Card>
          <Card>
            <DataTable
              rows={questions}
              rowKey={(row) => row.id}
              columns={[
                { key: 'category', header: t('headers.category'), cell: (row) => <span className="font-semibold">{row.category}</span> },
                { key: 'question', header: t('headers.question'), cell: (row) => row.question },
                { key: 'followUp', header: t('headers.followUp'), cell: (row) => row.followUp },
              ]}
            />
          </Card>
        </div>
      </div>
    </div>
  )
}

export default FrontendInterview
