import React, { useMemo, useState } from 'react'
import { AlarmClockCheck, BrainCircuit, Gauge, RotateCcw, TriangleAlert } from 'lucide-react'
import { Button, Card, NoticeCard, PageHero, PropertyGrid } from '@toolbox/ui-kit'
import { useTranslation } from 'react-i18next'

const ProcrastinationTest: React.FC = () => {
  const { t } = useTranslation('toolProcrastinationTest')
  const questions = t('questions', { returnObjects: true }) as Array<{
    id: string
    label: string
    hint: string
  }>
  const [answers, setAnswers] = useState<Record<string, number>>(
    Object.fromEntries(questions.map((item) => [item.id, 3]))
  )

  const result = useMemo(() => {
    const values = Object.values(answers)
    const total = values.reduce((sum, current) => sum + current, 0)
    const percent = Math.round((total / (questions.length * 5)) * 100)
    const starting = Math.round(((answers.taskStart + answers.distraction) / 10) * 100)
    const planning = Math.round(((answers.planning + answers.deadline) / 10) * 100)
    const energy = Math.round(((answers.fatigue + answers.overwhelm) / 10) * 100)

    const band =
      percent < 40 ? 'low' : percent < 58 ? 'medium' : percent < 76 ? 'high' : 'critical'

    return { percent, starting, planning, energy, band }
  }, [answers, questions.length])

  const reset = () => {
    setAnswers(Object.fromEntries(questions.map((item) => [item.id, 3])))
  }

  return (
    <div className="space-y-6">
      <Card className="border-sky-200/70 bg-gradient-to-br from-white via-sky-50 to-indigo-50/70 dark:border-sky-900/60 dark:from-slate-950 dark:via-sky-950/30 dark:to-indigo-950/20">
        <PageHero icon={BrainCircuit} title={t('title')} description={t('description')} />
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_420px]">
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{t('introTitle')}</div>
              <div className="text-sm text-slate-600 dark:text-slate-300">{t('intro')}</div>
            </div>
            <Button variant="secondary" onClick={reset}>
              <RotateCcw className="h-4 w-4" />
              {t('reset')}
            </Button>
          </div>

          <div className="space-y-4">
            {questions.map((question) => (
              <div key={question.id} className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900/70">
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{question.label}</div>
                <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">{question.hint}</div>
                <div className="mt-4 grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setAnswers((current) => ({ ...current, [question.id]: value }))}
                      className={[
                        'rounded-xl border px-3 py-2 text-sm font-semibold transition',
                        answers[question.id] === value
                          ? 'border-indigo-500 bg-indigo-600 text-white shadow-sm'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-indigo-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300',
                      ].join(' ')}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-6">
          <NoticeCard
            tone={result.band === 'low' ? 'success' : result.band === 'medium' ? 'info' : result.band === 'high' ? 'warning' : 'danger'}
            icon={result.band === 'critical' ? TriangleAlert : AlarmClockCheck}
            title={t(`resultBands.${result.band}.title`)}
            description={t(`resultBands.${result.band}.description`)}
          />

          <Card className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
              <Gauge className="h-4 w-4" />
              {t('scoreTitle')}
            </div>
            <div className="text-4xl font-black text-slate-900 dark:text-slate-100">{result.percent}%</div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500" style={{ width: `${result.percent}%` }} />
            </div>
            <PropertyGrid
              items={[
                { label: t('stats.starting'), value: `${result.starting}%`, tone: result.starting > 70 ? 'danger' : result.starting > 45 ? 'warning' : 'success' },
                { label: t('stats.planning'), value: `${result.planning}%`, tone: result.planning > 70 ? 'danger' : result.planning > 45 ? 'warning' : 'success' },
                { label: t('stats.energy'), value: `${result.energy}%`, tone: result.energy > 70 ? 'danger' : result.energy > 45 ? 'warning' : 'success' },
              ]}
              className="xl:grid-cols-1"
            />
          </Card>

          <Card className="space-y-3">
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{t('suggestionsTitle')}</div>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
              {(t(`suggestions.${result.band}`, { returnObjects: true }) as string[]).map((tip) => (
                <li key={tip}>• {tip}</li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default ProcrastinationTest
