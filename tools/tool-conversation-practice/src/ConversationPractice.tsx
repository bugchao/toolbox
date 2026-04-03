import React, { useMemo, useState } from 'react'
import { Languages, Mic2 } from 'lucide-react'
import { Card, DataTable, NoticeCard, PageHero, PropertyGrid } from '@toolbox/ui-kit'
import { useTranslation } from 'react-i18next'

const ConversationPractice: React.FC = () => {
  const { t } = useTranslation('toolConversationPractice')
  const [scene, setScene] = useState('travel')
  const [tone, setTone] = useState('friendly')
  const [level, setLevel] = useState('intermediate')

  const phrases = useMemo(
    () =>
      [0, 1, 2].map((index) => ({
        id: `${scene}-${tone}-${level}-${index}`,
        situation: t(`situations.${scene}.${index}`),
        expression: t(`expressions.${tone}.${index}`),
        reply: t(`replies.${level}.${index}`),
      })),
    [level, scene, t, tone]
  )

  return (
    <div className="space-y-6">
      <Card className="border-rose-200/70 bg-gradient-to-br from-white via-rose-50 to-pink-50/70 dark:border-rose-900/60 dark:from-slate-950 dark:via-rose-950/20 dark:to-pink-950/10">
        <PageHero icon={Languages} title={t('title')} description={t('description')} />
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_420px]">
        <Card className="space-y-5">
          <div className="space-y-2">
            <div className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('fields.scene')}</div>
            <div className="grid gap-2 sm:grid-cols-3">
              {['travel', 'meeting', 'daily'].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setScene(value)}
                  className={[
                    'rounded-xl border px-3 py-2 text-sm font-semibold transition',
                    scene === value
                      ? 'border-rose-500 bg-rose-600 text-white'
                      : 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300',
                  ].join(' ')}
                >
                  {t(`options.${value}`)}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('fields.tone')}</div>
            <div className="grid gap-2 sm:grid-cols-3">
              {['friendly', 'professional', 'calm'].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTone(value)}
                  className={[
                    'rounded-xl border px-3 py-2 text-sm font-semibold transition',
                    tone === value
                      ? 'border-rose-500 bg-rose-600 text-white'
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
              {['beginner', 'intermediate', 'advanced'].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setLevel(value)}
                  className={[
                    'rounded-xl border px-3 py-2 text-sm font-semibold transition',
                    level === value
                      ? 'border-rose-500 bg-rose-600 text-white'
                      : 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300',
                  ].join(' ')}
                >
                  {t(`options.${value}`)}
                </button>
              ))}
            </div>
          </div>

          <Card className="border-dashed border-rose-200 bg-rose-50/70 dark:border-rose-900 dark:bg-rose-950/20">
            <div className="text-sm font-semibold text-rose-900 dark:text-rose-100">{t('openingTitle')}</div>
            <div className="mt-2 text-sm leading-6 text-rose-800 dark:text-rose-200">
              {t(`openings.${scene}.${tone}`)}
            </div>
          </Card>
        </Card>

        <div className="space-y-6">
          <NoticeCard
            tone="success"
            icon={Mic2}
            title={t('noticeTitle')}
            description={t('noticeDescription', {
              scene: t(`options.${scene}`),
              tone: t(`options.${tone}`),
              level: t(`options.${level}`),
            })}
          />
          <Card>
            <PropertyGrid
              items={[
                { label: t('stats.scene'), value: t(`options.${scene}`), tone: 'primary' },
                { label: t('stats.tone'), value: t(`options.${tone}`), tone: 'warning' },
                { label: t('stats.level'), value: t(`options.${level}`), tone: 'success' },
              ]}
              className="xl:grid-cols-1"
            />
          </Card>
          <Card>
            <DataTable
              rows={phrases}
              rowKey={(row) => row.id}
              columns={[
                { key: 'situation', header: t('headers.situation'), cell: (row) => <span className="font-semibold">{row.situation}</span> },
                { key: 'expression', header: t('headers.expression'), cell: (row) => row.expression },
                { key: 'reply', header: t('headers.reply'), cell: (row) => row.reply },
              ]}
            />
          </Card>
        </div>
      </div>
    </div>
  )
}

export default ConversationPractice
