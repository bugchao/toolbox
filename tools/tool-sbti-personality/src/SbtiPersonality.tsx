import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useToolStorage } from '@toolbox/storage'
import {
  Brain,
  Compass,
  Fingerprint,
  RotateCcw,
  Sparkles,
  Users,
  Zap,
} from 'lucide-react'
import {
  Button,
  Card,
  NoticeCard,
  PageHero,
  ProgressRing,
  PropertyGrid,
} from '@toolbox/ui-kit'

type DimensionId = 's' | 'b' | 't' | 'i'

interface DimensionMeta {
  short: string
  name: string
  description: string
  highLabel: string
  lowLabel: string
}

interface Question {
  id: string
  axis: DimensionId
  prompt: string
  hint: string
  reverse?: boolean
}

interface Archetype {
  title: string
  description: string
  strengths: string[]
  caution: string
  environment: string
}

interface HistoryRecord {
  id: string
  createdAt: string
  code: string
  dominant: DimensionId
  supporting: DimensionId
  scores: Record<DimensionId, number>
}

interface SbtiState {
  history: HistoryRecord[]
  latest: HistoryRecord | null
}

interface RankedSignal {
  id: DimensionId
  score: number
  meta: DimensionMeta
}

interface ResultView {
  scores: Record<DimensionId, number>
  ranked: RankedSignal[]
  dominant: RankedSignal
  supporting: RankedSignal
  lowest: RankedSignal
  code: string
  blendLabel: string
  profile: Archetype
}

const DEFAULT_STATE: SbtiState = {
  history: [],
  latest: null,
}

const DIMENSION_ORDER: DimensionId[] = ['s', 'b', 't', 'i']

const iconMap = {
  s: Users,
  b: Zap,
  t: Brain,
  i: Compass,
} satisfies Record<DimensionId, React.ComponentType<{ className?: string }>>

function toneForScore(score: number): 'danger' | 'warning' | 'success' {
  if (score >= 70) return 'success'
  if (score >= 45) return 'warning'
  return 'danger'
}

function calculateScores(
  questions: Question[],
  answers: Record<string, number>,
): Record<DimensionId, number> {
  return DIMENSION_ORDER.reduce<Record<DimensionId, number>>((acc, dimensionId) => {
    const dimensionQuestions = questions.filter((question) => question.axis === dimensionId)
    const total = dimensionQuestions.reduce((sum, question) => {
      const raw = answers[question.id] ?? 3
      const normalized = question.reverse ? 6 - raw : raw
      return sum + normalized
    }, 0)

    const min = dimensionQuestions.length
    const max = dimensionQuestions.length * 5
    const percent = Math.round(((total - min) / (max - min)) * 100)
    acc[dimensionId] = percent
    return acc
  }, { s: 50, b: 50, t: 50, i: 50 })
}

function buildResultView(
  scores: Record<DimensionId, number>,
  dimensions: Record<DimensionId, DimensionMeta>,
  archetypes: Record<DimensionId, Archetype>,
  t: (key: string) => string,
): ResultView {
  const ranked = DIMENSION_ORDER
    .map((id) => ({ id, score: scores[id], meta: dimensions[id] }))
    .sort((left, right) => right.score - left.score)

  const dominant = ranked[0]
  const supporting = ranked[1]
  const lowest = ranked[ranked.length - 1]
  const code = `${dominant.meta.short}${supporting.meta.short}`
  const blendKey = `${dominant.id}${supporting.id}`

  return {
    scores,
    ranked,
    dominant,
    supporting,
    lowest,
    code,
    blendLabel: t(`blends.${blendKey}`),
    profile: archetypes[dominant.id],
  }
}

export default function SbtiPersonality() {
  const { t, i18n } = useTranslation('toolSbtiPersonality')
  const { data: state, save, loading } = useToolStorage<SbtiState>(
    'sbti-personality',
    'data',
    DEFAULT_STATE,
  )
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [phase, setPhase] = useState<'assessment' | 'result'>('assessment')
  const [submittedRecord, setSubmittedRecord] = useState<HistoryRecord | null>(null)
  const hydratedRef = useRef(false)

  const dimensions = t('dimensions', { returnObjects: true }) as Record<DimensionId, DimensionMeta>
  const questions = t('questions', { returnObjects: true }) as Question[]
  const archetypes = t('archetypes', { returnObjects: true }) as Record<DimensionId, Archetype>
  const scaleLabels = t('scaleLabels', { returnObjects: true }) as string[]

  useEffect(() => {
    if (loading || hydratedRef.current) return
    hydratedRef.current = true
    if (state.latest) {
      setSubmittedRecord(state.latest)
      setPhase('result')
    }
  }, [loading, state.latest])

  const answeredCount = Object.keys(answers).length
  const completion = Math.round((answeredCount / questions.length) * 100)
  const isComplete = answeredCount === questions.length

  const formatter = useMemo(
    () =>
      new Intl.DateTimeFormat(i18n.language.startsWith('en') ? 'en-US' : 'zh-CN', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    [i18n.language],
  )

  const questionIndexMap = useMemo(
    () => Object.fromEntries(questions.map((question, index) => [question.id, index + 1])),
    [questions],
  )

  const groupedQuestions = useMemo(
    () =>
      DIMENSION_ORDER.map((dimensionId) => ({
        id: dimensionId,
        meta: dimensions[dimensionId],
        questions: questions.filter((question) => question.axis === dimensionId),
      })),
    [dimensions, questions],
  )

  const currentResult = useMemo(() => {
    if (!submittedRecord) return null
    return buildResultView(submittedRecord.scores, dimensions, archetypes, t)
  }, [submittedRecord, dimensions, archetypes, t])

  const submitAssessment = async () => {
    if (!isComplete) return

    const scores = calculateScores(questions, answers)
    const view = buildResultView(scores, dimensions, archetypes, t)
    const nextRecord: HistoryRecord = {
      id: `${Date.now()}-${view.code}`,
      createdAt: new Date().toISOString(),
      code: view.code,
      dominant: view.dominant.id,
      supporting: view.supporting.id,
      scores,
    }

    setSubmittedRecord(nextRecord)
    setPhase('result')

    await save({
      latest: nextRecord,
      history: [nextRecord, ...state.history].slice(0, 12),
    })
  }

  const startNewAssessment = () => {
    setAnswers({})
    setPhase('assessment')
    setSubmittedRecord(null)
  }

  const loadHistoryRecord = (record: HistoryRecord) => {
    setSubmittedRecord(record)
    setPhase('result')
  }

  const clearHistory = async () => {
    await save({ history: [], latest: null })
    if (phase === 'result' && submittedRecord && state.latest?.id === submittedRecord.id) {
      setSubmittedRecord(null)
      setPhase('assessment')
    }
  }

  if (loading) {
    return (
      <Card className="border-cyan-200/70 bg-cyan-50/70 dark:border-cyan-900/60 dark:bg-cyan-950/20">
        <div className="text-sm text-slate-600 dark:text-slate-300">{t('loading')}</div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-cyan-200/70 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.18),_transparent_45%),linear-gradient(135deg,rgba(255,255,255,0.98),rgba(240,249,255,0.92),rgba(250,245,255,0.9))] dark:border-cyan-900/60 dark:bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.18),_transparent_35%),linear-gradient(135deg,rgba(2,6,23,0.98),rgba(8,47,73,0.88),rgba(30,41,59,0.96))]">
        <PageHero icon={Fingerprint} title={t('title')} description={t('description')} />
      </Card>

      <NoticeCard
        tone="info"
        icon={Sparkles}
        title={t('disclaimerTitle')}
        description={t('disclaimer')}
      />

      {phase === 'assessment' ? (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_420px]">
          <Card className="space-y-6">
            <div className="flex flex-col gap-4 rounded-3xl border border-slate-200/80 bg-slate-50/80 p-5 dark:border-slate-700 dark:bg-slate-900/60 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{t('introTitle')}</div>
                <div className="text-sm leading-6 text-slate-600 dark:text-slate-300">{t('intro')}</div>
              </div>
              <div className="flex items-center gap-3">
                <ProgressRing
                  value={completion}
                  size={78}
                  color="#06b6d4"
                  label={`${completion}%`}
                />
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                    {t('completion')}
                  </div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {t('answered', { count: answeredCount, total: questions.length })}
                  </div>
                  <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {t('durationHint')}
                  </div>
                </div>
              </div>
            </div>

            {groupedQuestions.map((section) => {
              const Icon = iconMap[section.id]
              return (
                <section key={section.id} className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-3 text-cyan-700 dark:border-cyan-900 dark:bg-cyan-950/30 dark:text-cyan-200">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                        {section.meta.short}
                      </div>
                      <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                        {section.meta.name}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-300">
                        {section.meta.description}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {section.questions.map((question) => (
                      <div
                        key={question.id}
                        className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900/70"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="text-xs uppercase tracking-[0.18em] text-slate-400">
                              {t('questionLabel', { index: questionIndexMap[question.id] })}
                            </div>
                            <div className="mt-1 text-base font-semibold text-slate-900 dark:text-slate-100">
                              {question.prompt}
                            </div>
                            <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                              {question.hint}
                            </div>
                          </div>
                          {question.reverse ? (
                            <div className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
                              {t('reverseHint')}
                            </div>
                          ) : null}
                        </div>

                        <div className="mt-4 grid gap-2 sm:grid-cols-5">
                          {scaleLabels.map((label, idx) => {
                            const value = idx + 1
                            const active = answers[question.id] === value
                            return (
                              <button
                                key={`${question.id}-${value}`}
                                type="button"
                                onClick={() => setAnswers((current) => ({ ...current, [question.id]: value }))}
                                className={[
                                  'rounded-2xl border px-3 py-3 text-left transition',
                                  active
                                    ? 'border-cyan-500 bg-cyan-600 text-white shadow-lg shadow-cyan-500/20'
                                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-cyan-300 hover:bg-cyan-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-cyan-700 dark:hover:bg-cyan-950/30',
                                ].join(' ')}
                              >
                                <div className="text-lg font-black">{value}</div>
                                <div className="mt-1 text-xs leading-5 opacity-90">{label}</div>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )
            })}
          </Card>

          <div className="space-y-6 xl:sticky xl:top-6 xl:self-start">
            <Card className="overflow-hidden border-slate-200/80 bg-[linear-gradient(160deg,rgba(8,145,178,0.95),rgba(14,165,233,0.88),rgba(30,41,59,0.94))] text-white dark:border-slate-700 dark:bg-[linear-gradient(160deg,rgba(8,47,73,0.95),rgba(14,116,144,0.9),rgba(15,23,42,0.98))]">
              <div className="space-y-5">
                <div>
                  <div className="text-xs uppercase tracking-[0.22em] text-cyan-100/90">
                    {t('assessmentTitle')}
                  </div>
                  <div className="mt-2 text-3xl font-black tracking-tight">
                    {t('assessmentHeadline')}
                  </div>
                  <div className="mt-2 text-sm leading-6 text-cyan-50/90">
                    {t('assessmentDescription')}
                  </div>
                </div>

                <PropertyGrid
                  items={[
                    {
                      label: t('summary.questionCount'),
                      value: t('summary.questionCountValue', { count: questions.length }),
                      tone: 'primary',
                    },
                    {
                      label: t('summary.status'),
                      value: isComplete ? t('summary.ready') : t('summary.pending'),
                      tone: isComplete ? 'success' : 'warning',
                    },
                  ]}
                  className="xl:grid-cols-1"
                />

                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" onClick={() => setAnswers({})} className="bg-white/15 text-white hover:bg-white/20 dark:bg-white/15 dark:text-white">
                    <RotateCcw className="h-4 w-4" />
                    {t('reset')}
                  </Button>
                  <Button
                    variant="success"
                    disabled={!isComplete}
                    onClick={() => void submitAssessment()}
                    className="bg-emerald-500/90 text-white hover:bg-emerald-500"
                  >
                    {t('submit')}
                  </Button>
                </div>
              </div>
            </Card>

            <NoticeCard
              tone={isComplete ? 'success' : 'warning'}
              title={isComplete ? t('readyTitle') : t('incompleteTitle')}
              description={isComplete ? t('readyDescription') : t('incompleteDescription')}
            />

            <Card className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{t('historyTitle')}</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">{t('historyDescription')}</div>
                </div>
                {state.history.length ? (
                  <Button variant="ghost" size="sm" onClick={() => void clearHistory()}>
                    {t('clearHistory')}
                  </Button>
                ) : null}
              </div>

              {state.history.length ? (
                <div className="space-y-3">
                  {state.history.map((entry) => {
                    const DominantIcon = iconMap[entry.dominant]
                    return (
                      <button
                        key={entry.id}
                        type="button"
                        onClick={() => loadHistoryRecord(entry)}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-cyan-300 hover:bg-cyan-50 dark:border-slate-700 dark:bg-slate-900/60 dark:hover:border-cyan-700 dark:hover:bg-cyan-950/20"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-2 text-cyan-700 dark:border-cyan-900 dark:bg-cyan-950/20 dark:text-cyan-200">
                              <DominantIcon className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                {entry.code} · {archetypes[entry.dominant].title}
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400">
                                {formatter.format(new Date(entry.createdAt))}
                              </div>
                            </div>
                          </div>
                          <div className="text-xs font-medium text-cyan-700 dark:text-cyan-200">
                            {t('viewResult')}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-5 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  {t('emptyHistory')}
                </div>
              )}
            </Card>
          </div>
        </div>
      ) : currentResult ? (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_420px]">
          <div className="space-y-6">
            <Card className="overflow-hidden border-slate-200/80 bg-[linear-gradient(160deg,rgba(8,145,178,0.95),rgba(14,165,233,0.88),rgba(30,41,59,0.94))] text-white dark:border-slate-700 dark:bg-[linear-gradient(160deg,rgba(8,47,73,0.95),rgba(14,116,144,0.9),rgba(15,23,42,0.98))]">
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-[0.22em] text-cyan-100/90">
                      {t('resultTitle')}
                    </div>
                    <div className="mt-2 text-4xl font-black tracking-tight">{currentResult.code}</div>
                  </div>
                  <ProgressRing
                    value={currentResult.dominant.score}
                    size={78}
                    color="#f8fafc"
                    label={<span className="text-white">{currentResult.dominant.score}%</span>}
                  />
                </div>

                <div>
                  <div className="text-2xl font-bold">{currentResult.profile.title}</div>
                  <div className="mt-2 text-sm leading-6 text-cyan-50/90">{currentResult.profile.description}</div>
                </div>

                <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm leading-6 text-cyan-50">
                  <div className="font-semibold text-white">{t('blendTitle')}</div>
                  <div className="mt-1">{currentResult.blendLabel}</div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" onClick={startNewAssessment} className="bg-white/15 text-white hover:bg-white/20 dark:bg-white/15 dark:text-white">
                    <RotateCcw className="h-4 w-4" />
                    {t('retake')}
                  </Button>
                </div>
              </div>
            </Card>

            <NoticeCard
              tone="success"
              title={t('savedTitle')}
              description={t('savedDescription')}
            />

            <PropertyGrid
              items={DIMENSION_ORDER.map((dimensionId) => ({
                label: `${dimensions[dimensionId].short} · ${dimensions[dimensionId].name}`,
                value: (
                  <div className="space-y-2">
                    <div className="text-lg font-black">{currentResult.scores[dimensionId]}%</div>
                    <div className="flex items-center justify-between gap-3 text-xs opacity-80">
                      <span>{dimensions[dimensionId].lowLabel}</span>
                      <span>{dimensions[dimensionId].highLabel}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-200/70 dark:bg-slate-700/80">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-500"
                        style={{ width: `${currentResult.scores[dimensionId]}%` }}
                      />
                    </div>
                  </div>
                ),
                tone: toneForScore(currentResult.scores[dimensionId]),
              }))}
              className="xl:grid-cols-2"
            />

            <Card className="space-y-4">
              <div>
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{t('strengthsTitle')}</div>
                <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">{currentResult.profile.environment}</div>
              </div>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                {currentResult.profile.strengths.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/20 dark:text-amber-100">
                <span className="font-semibold">{t('growthTitle')}</span> {currentResult.profile.caution}
              </div>
            </Card>
          </div>

          <div className="space-y-6 xl:sticky xl:top-6 xl:self-start">
            <Card className="space-y-4">
              <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{t('resultSummaryTitle')}</div>
              <PropertyGrid
                items={[
                  {
                    label: t('summary.dominant'),
                    value: `${dimensions[currentResult.dominant.id].name} · ${currentResult.dominant.score}%`,
                    tone: toneForScore(currentResult.dominant.score),
                  },
                  {
                    label: t('summary.supporting'),
                    value: `${dimensions[currentResult.supporting.id].name} · ${currentResult.supporting.score}%`,
                    tone: toneForScore(currentResult.supporting.score),
                  },
                  {
                    label: t('summary.watch'),
                    value: `${dimensions[currentResult.lowest.id].name} · ${currentResult.lowest.score}%`,
                    tone: toneForScore(currentResult.lowest.score),
                  },
                ]}
                className="xl:grid-cols-1"
              />
            </Card>

            <Card className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{t('historyTitle')}</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">{t('historyDescription')}</div>
                </div>
                {state.history.length ? (
                  <Button variant="ghost" size="sm" onClick={() => void clearHistory()}>
                    {t('clearHistory')}
                  </Button>
                ) : null}
              </div>

              {state.history.length ? (
                <div className="space-y-3">
                  {state.history.map((entry) => {
                    const DominantIcon = iconMap[entry.dominant]
                    return (
                      <button
                        key={entry.id}
                        type="button"
                        onClick={() => loadHistoryRecord(entry)}
                        className={[
                          'w-full rounded-2xl border p-4 text-left transition',
                          submittedRecord?.id === entry.id
                            ? 'border-cyan-300 bg-cyan-50 dark:border-cyan-700 dark:bg-cyan-950/20'
                            : 'border-slate-200 bg-slate-50 hover:border-cyan-300 hover:bg-cyan-50 dark:border-slate-700 dark:bg-slate-900/60 dark:hover:border-cyan-700 dark:hover:bg-cyan-950/20',
                        ].join(' ')}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-2 text-cyan-700 dark:border-cyan-900 dark:bg-cyan-950/20 dark:text-cyan-200">
                              <DominantIcon className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                {entry.code} · {archetypes[entry.dominant].title}
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400">
                                {formatter.format(new Date(entry.createdAt))}
                              </div>
                            </div>
                          </div>
                          <div className="text-xs font-medium text-cyan-700 dark:text-cyan-200">
                            {t('viewResult')}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-5 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  {t('emptyHistory')}
                </div>
              )}
            </Card>
          </div>
        </div>
      ) : null}
    </div>
  )
}
