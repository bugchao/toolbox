import React, { useMemo, useState } from 'react'
import { ScanSearch, SearchCheck } from 'lucide-react'
import { Card, DataTable, NoticeCard, PageHero, PropertyGrid } from '@toolbox/ui-kit'
import { useTranslation } from 'react-i18next'

const DeepDiveQa: React.FC = () => {
  const { t } = useTranslation('toolDeepDiveQa')
  const [topic, setTopic] = useState('React Server Components')
  const [audience, setAudience] = useState('team')
  const [depth, setDepth] = useState('deep')

  const ladders = useMemo(
    () =>
      [0, 1, 2, 3].map((index) => ({
        id: `${audience}-${depth}-${index}`,
        layer: t(`layers.${index}`),
        question: t(`questions.${depth}.${index}`, { topic }),
        answer: t(`answers.${audience}.${index}`, { topic }),
      })),
    [audience, depth, t, topic]
  )

  return (
    <div className="space-y-6">
      <Card className="border-emerald-200/70 bg-gradient-to-br from-white via-emerald-50 to-lime-50/70 dark:border-emerald-900/60 dark:from-slate-950 dark:via-emerald-950/20 dark:to-lime-950/10">
        <PageHero icon={ScanSearch} title={t('title')} description={t('description')} />
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_420px]">
        <Card className="space-y-5">
          <label className="block space-y-2">
            <div className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('fields.topic')}</div>
            <input
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              placeholder={t('placeholders.topic')}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </label>

          <div className="space-y-2">
            <div className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('fields.audience')}</div>
            <div className="grid gap-2 sm:grid-cols-3">
              {['team', 'stakeholder', 'learner'].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setAudience(value)}
                  className={[
                    'rounded-xl border px-3 py-2 text-sm font-semibold transition',
                    audience === value
                      ? 'border-emerald-500 bg-emerald-600 text-white'
                      : 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300',
                  ].join(' ')}
                >
                  {t(`options.${value}`)}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('fields.depth')}</div>
            <div className="grid gap-2 sm:grid-cols-3">
              {['quick', 'deep', 'expert'].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setDepth(value)}
                  className={[
                    'rounded-xl border px-3 py-2 text-sm font-semibold transition',
                    depth === value
                      ? 'border-emerald-500 bg-emerald-600 text-white'
                      : 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300',
                  ].join(' ')}
                >
                  {t(`options.${value}`)}
                </button>
              ))}
            </div>
          </div>

          <Card className="border-dashed border-emerald-200 bg-emerald-50/70 dark:border-emerald-900 dark:bg-emerald-950/20">
            <div className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">{t('hintTitle')}</div>
            <div className="mt-2 text-sm leading-6 text-emerald-800 dark:text-emerald-200">
              {t('hintDescription', { topic, audience: t(`options.${audience}`) })}
            </div>
          </Card>
        </Card>

        <div className="space-y-6">
          <NoticeCard
            tone="success"
            icon={SearchCheck}
            title={t('noticeTitle')}
            description={t('noticeDescription', { topic, depth: t(`options.${depth}`) })}
          />
          <Card>
            <PropertyGrid
              items={[
                { label: t('stats.topic'), value: topic, tone: 'primary' },
                { label: t('stats.audience'), value: t(`options.${audience}`), tone: 'warning' },
                { label: t('stats.depth'), value: t(`options.${depth}`), tone: 'success' },
              ]}
              className="xl:grid-cols-1"
            />
          </Card>
          <Card>
            <DataTable
              rows={ladders}
              rowKey={(row) => row.id}
              columns={[
                { key: 'layer', header: t('headers.layer'), cell: (row) => <span className="font-semibold">{row.layer}</span> },
                { key: 'question', header: t('headers.question'), cell: (row) => row.question },
                { key: 'answer', header: t('headers.answer'), cell: (row) => row.answer },
              ]}
            />
          </Card>
        </div>
      </div>
    </div>
  )
}

export default DeepDiveQa
