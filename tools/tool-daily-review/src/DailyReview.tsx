import React, { useMemo, useState } from 'react'
import { CheckCheck, NotebookPen, Sparkles } from 'lucide-react'
import { Card, NoticeCard, PageHero, PropertyGrid } from '@toolbox/ui-kit'
import { useTranslation } from 'react-i18next'

const DailyReview: React.FC = () => {
  const { t } = useTranslation('toolDailyReview')
  const [wins, setWins] = useState('')
  const [blockers, setBlockers] = useState('')
  const [lesson, setLesson] = useState('')
  const [gratitude, setGratitude] = useState('')
  const [energy, setEnergy] = useState(3)

  const summary = useMemo(() => {
    const winList = wins.split('\n').map((item) => item.trim()).filter(Boolean)
    const blockerList = blockers.split('\n').map((item) => item.trim()).filter(Boolean)
    const tomorrow = [
      winList[0] ? t('generated.keepDoing', { item: winList[0] }) : t('generated.keepRhythm'),
      blockerList[0] ? t('generated.clearBlocker', { item: blockerList[0] }) : t('generated.protectFocus'),
      lesson.trim() ? t('generated.applyLesson', { item: lesson.trim() }) : t('generated.endWithPlan'),
    ]

    return {
      winCount: winList.length,
      blockerCount: blockerList.length,
      energyLabel: t(`energyScale.${energy}`),
      reflection:
        winList.length || blockerList.length || lesson.trim()
          ? t('generated.summary', {
              wins: winList.length || 0,
              blockers: blockerList.length || 0,
              energy: t(`energyScale.${energy}`),
            })
          : t('generated.empty'),
      tomorrow,
    }
  }, [wins, blockers, lesson, energy, gratitude, t])

  return (
    <div className="space-y-6">
      <Card className="border-amber-200/70 bg-gradient-to-br from-white via-amber-50 to-rose-50/70 dark:border-amber-900/60 dark:from-slate-950 dark:via-amber-950/20 dark:to-rose-950/10">
        <PageHero icon={NotebookPen} title={t('title')} description={t('description')} />
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_420px]">
        <Card className="space-y-4">
          {[
            ['wins', t('fields.wins'), wins, setWins, t('placeholders.wins')],
            ['blockers', t('fields.blockers'), blockers, setBlockers, t('placeholders.blockers')],
            ['lesson', t('fields.lesson'), lesson, setLesson, t('placeholders.lesson')],
            ['gratitude', t('fields.gratitude'), gratitude, setGratitude, t('placeholders.gratitude')],
          ].map(([key, label, value, setter, placeholder]) => (
            <label key={key as string} className="block space-y-2">
              <div className="text-sm font-medium text-slate-700 dark:text-slate-300">{label as string}</div>
              <textarea
                value={value as string}
                onChange={(event) => (setter as React.Dispatch<React.SetStateAction<string>>)(event.target.value)}
                rows={key === 'lesson' || key === 'gratitude' ? 3 : 4}
                placeholder={placeholder as string}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm leading-6 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </label>
          ))}

          <div className="space-y-2">
            <div className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('fields.energy')}</div>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setEnergy(value)}
                  className={[
                    'rounded-xl border px-3 py-2 text-sm font-semibold transition',
                    value === energy
                      ? 'border-indigo-500 bg-indigo-600 text-white'
                      : 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300',
                  ].join(' ')}
                >
                  {t(`energyScale.${value}`)}
                </button>
              ))}
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          <NoticeCard tone="info" icon={Sparkles} title={t('output.summaryTitle')} description={summary.reflection} />

          <Card className="space-y-4">
            <PropertyGrid
              items={[
                { label: t('output.winCount'), value: summary.winCount, tone: 'success' },
                { label: t('output.blockerCount'), value: summary.blockerCount, tone: 'warning' },
                { label: t('output.energy'), value: summary.energyLabel, tone: 'primary' },
              ]}
              className="xl:grid-cols-1"
            />
          </Card>

          <Card className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
              <CheckCheck className="h-4 w-4" />
              {t('output.tomorrowTitle')}
            </div>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
              {summary.tomorrow.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default DailyReview
