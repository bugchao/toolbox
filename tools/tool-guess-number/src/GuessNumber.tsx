import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Binary,
  Cpu,
  Users,
  RotateCcw,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Trophy,
  Lightbulb,
  Trash2,
} from 'lucide-react'
import { PageHero } from '@toolbox/ui-kit'
import { useToolStorage } from '@toolbox/storage'
import { useTranslation } from 'react-i18next'

const NAMESPACE = 'toolGuessNumber'

type Mode = 'cpu' | 'duel'

interface Attempt {
  guess: number
  feedback: 'higher' | 'lower' | 'hit'
}

interface Range {
  min: number
  max: number
}

interface BestScore {
  attempts: number
  durationMs: number
  range: Range
  timestamp: number
}

interface PersistedState {
  mode: Mode
  range: Range
  bestScoresByRange: Record<string, BestScore>
}

const DEFAULT_RANGE: Range = { min: 1, max: 100 }
const RANGE_LIMIT = { min: -100000, max: 100000 }

const DEFAULT_STATE: PersistedState = {
  mode: 'cpu',
  range: DEFAULT_RANGE,
  bestScoresByRange: {},
}

const rangeKey = (r: Range) => `${r.min}~${r.max}`

function cryptoIntInRange(min: number, max: number): number {
  const span = max - min + 1
  if (span <= 0) return min
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const bound = Math.floor(0xffffffff / span) * span
    const buf = new Uint32Array(1)
    let n: number
    do {
      crypto.getRandomValues(buf)
      n = buf[0]
    } while (n >= bound)
    return (n % span) + min
  }
  return Math.floor(Math.random() * span) + min
}

const GuessNumber: React.FC = () => {
  const { t } = useTranslation(NAMESPACE)

  const { data, save, loading } = useToolStorage<PersistedState>(
    'guess-number',
    'state',
    DEFAULT_STATE,
  )

  // Per-game transient state — not persisted across refresh on purpose
  const [secret, setSecret] = useState<number | null>(null)
  const [attempts, setAttempts] = useState<Attempt[]>([])
  const [input, setInput] = useState('')
  const [error, setError] = useState('')
  const [startedAt, setStartedAt] = useState<number | null>(null)
  const [finishedAt, setFinishedAt] = useState<number | null>(null)
  const [revealed, setRevealed] = useState(false)
  // Duel: hostSecret stored in state, hidden under cover until tap
  const [duelStage, setDuelStage] = useState<'set' | 'play'>('set')
  const [duelInput, setDuelInput] = useState('')
  const [duelShowSet, setDuelShowSet] = useState(false)

  // Live "now" tick for stopwatch
  const [nowTick, setNowTick] = useState(Date.now())
  useEffect(() => {
    if (!startedAt || finishedAt) return
    const id = window.setInterval(() => setNowTick(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [startedAt, finishedAt])

  const setMode = (m: Mode) => {
    void save({ ...data, mode: m })
    resetGame()
  }

  const setRange = (next: Partial<Range>) => {
    const merged = { ...data.range, ...next }
    const min = Math.max(RANGE_LIMIT.min, Math.min(merged.min, merged.max))
    const max = Math.min(RANGE_LIMIT.max, Math.max(merged.min, merged.max))
    if (max - min < 1) return
    void save({ ...data, range: { min, max } })
    resetGame()
  }

  function resetGame() {
    setSecret(null)
    setAttempts([])
    setInput('')
    setError('')
    setStartedAt(null)
    setFinishedAt(null)
    setRevealed(false)
    setDuelStage('set')
    setDuelInput('')
    setDuelShowSet(false)
  }

  const startCpu = useCallback(() => {
    const n = cryptoIntInRange(data.range.min, data.range.max)
    setSecret(n)
    setAttempts([])
    setInput('')
    setError('')
    setStartedAt(Date.now())
    setFinishedAt(null)
    setRevealed(false)
  }, [data.range])

  const submitDuelSecret = () => {
    const n = Number(duelInput)
    if (!Number.isFinite(n) || !Number.isInteger(n)) {
      setError(t('errors.notInteger'))
      return
    }
    if (n < data.range.min || n > data.range.max) {
      setError(t('errors.outOfRange', { min: data.range.min, max: data.range.max }))
      return
    }
    setSecret(n)
    setError('')
    setDuelInput('')
    setDuelStage('play')
    setStartedAt(Date.now())
    setAttempts([])
  }

  const guess = useCallback(() => {
    if (secret == null || finishedAt) return
    const n = Number(input)
    if (!Number.isFinite(n) || !Number.isInteger(n)) {
      setError(t('errors.notInteger'))
      return
    }
    if (n < data.range.min || n > data.range.max) {
      setError(t('errors.outOfRange', { min: data.range.min, max: data.range.max }))
      return
    }
    setError('')
    const feedback: Attempt['feedback'] =
      n === secret ? 'hit' : n < secret ? 'higher' : 'lower'
    const nextAttempts = [...attempts, { guess: n, feedback }]
    setAttempts(nextAttempts)
    setInput('')

    if (feedback === 'hit') {
      const now = Date.now()
      setFinishedAt(now)
      // Update best-score only in CPU mode (duel is between humans, both know the secret)
      if (data.mode === 'cpu' && startedAt) {
        const dur = now - startedAt
        const key = rangeKey(data.range)
        const prev = data.bestScoresByRange[key]
        const isBetter =
          !prev ||
          nextAttempts.length < prev.attempts ||
          (nextAttempts.length === prev.attempts && dur < prev.durationMs)
        if (isBetter) {
          void save({
            ...data,
            bestScoresByRange: {
              ...data.bestScoresByRange,
              [key]: {
                attempts: nextAttempts.length,
                durationMs: dur,
                range: { ...data.range },
                timestamp: now,
              },
            },
          })
        }
      }
    }
  }, [secret, finishedAt, input, data, attempts, startedAt, t, save])

  const clearBest = () => {
    void save({ ...data, bestScoresByRange: {} })
  }

  // ─ Derived ────────────────────────────────────────────────
  const bounds = useMemo(() => {
    // Active hint bounds based on attempts so far
    let lo = data.range.min
    let hi = data.range.max
    for (const a of attempts) {
      if (a.feedback === 'higher') lo = Math.max(lo, a.guess + 1)
      else if (a.feedback === 'lower') hi = Math.min(hi, a.guess - 1)
    }
    return { lo, hi }
  }, [attempts, data.range])

  const binaryHint = useMemo(() => {
    if (bounds.lo > bounds.hi) return null
    return Math.floor((bounds.lo + bounds.hi) / 2)
  }, [bounds])

  const elapsedMs =
    startedAt == null ? 0 : (finishedAt ?? nowTick) - startedAt
  const minimumPossibleAttempts = useMemo(() => {
    const span = data.range.max - data.range.min + 1
    return Math.ceil(Math.log2(span))
  }, [data.range])

  const bestScore = data.bestScoresByRange[rangeKey(data.range)] ?? null

  if (loading) {
    return (
      <div className="w-full space-y-6">
        <PageHero title={t('title')} description={t('description')} />
        <div className="text-center text-sm text-ink-subtle py-12">{t('loading')}</div>
      </div>
    )
  }

  const won = secret != null && finishedAt != null

  return (
    <div className="w-full space-y-6 pb-24">
      <PageHero title={t('title')} description={t('description')} />

      {/* Mode + range */}
      <section className="rounded-lg border border-edge bg-surface p-4 space-y-4">
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm font-medium text-ink mr-1">{t('modeLabel')}:</span>
          <button
            type="button"
            onClick={() => setMode('cpu')}
            className={`px-3 py-1.5 text-sm rounded-md border transition-colors flex items-center gap-1.5 ${
              data.mode === 'cpu'
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-surface text-ink border-edge-strong hover:bg-surface-muted'
            }`}
          >
            <Cpu className="w-4 h-4" /> {t('mode.cpu')}
          </button>
          <button
            type="button"
            onClick={() => setMode('duel')}
            className={`px-3 py-1.5 text-sm rounded-md border transition-colors flex items-center gap-1.5 ${
              data.mode === 'duel'
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-surface text-ink border-edge-strong hover:bg-surface-muted'
            }`}
          >
            <Users className="w-4 h-4" /> {t('mode.duel')}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-ink">{t('rangeLabel')}:</span>
          <input
            type="number"
            value={data.range.min}
            onChange={(e) => setRange({ min: Number(e.target.value) })}
            className="w-24 px-2 py-1.5 text-sm border border-edge-strong rounded-md font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <span className="text-ink-subtle">~</span>
          <input
            type="number"
            value={data.range.max}
            onChange={(e) => setRange({ max: Number(e.target.value) })}
            className="w-24 px-2 py-1.5 text-sm border border-edge-strong rounded-md font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <span className="text-xs text-ink-subtle">
            {t('minAttemptsHint', { count: minimumPossibleAttempts })}
          </span>
        </div>

        {bestScore && (
          <div className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md px-3 py-2">
            <Trophy className="w-4 h-4" />
            <span>
              {t('best.label', {
                attempts: bestScore.attempts,
                time: (bestScore.durationMs / 1000).toFixed(1),
              })}
            </span>
            <button
              type="button"
              onClick={clearBest}
              className="ml-auto text-amber-600 dark:text-amber-400 hover:text-red-500 dark:hover:text-red-400"
              title={t('best.clear')}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </section>

      {/* Duel: setter screen */}
      {data.mode === 'duel' && duelStage === 'set' && (
        <section className="rounded-2xl border border-edge bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-indigo-950/40 dark:via-gray-800 dark:to-purple-950/40 p-6 md:p-8 space-y-4 text-center">
          <h3 className="text-base font-semibold text-ink">{t('duel.setterTitle')}</h3>
          <p className="text-sm text-ink-muted">
            {t('duel.setterHint', { min: data.range.min, max: data.range.max })}
          </p>
          <div className="flex justify-center items-center gap-2">
            <input
              type={duelShowSet ? 'number' : 'password'}
              value={duelInput}
              onChange={(e) => {
                setDuelInput(e.target.value)
                setError('')
              }}
              onKeyDown={(e) => e.key === 'Enter' && submitDuelSecret()}
              placeholder={`${data.range.min} ~ ${data.range.max}`}
              className="w-40 px-3 py-2 text-base text-center border border-edge-strong rounded-md font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setDuelShowSet((v) => !v)}
              className="p-2 text-ink-muted hover:text-ink"
              aria-label={duelShowSet ? t('duel.hide') : t('duel.show')}
            >
              {duelShowSet ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          <button
            type="button"
            onClick={submitDuelSecret}
            disabled={!duelInput.trim()}
            className="px-5 py-2 text-sm font-medium bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 transition-colors"
          >
            {t('duel.confirm')}
          </button>
        </section>
      )}

      {/* CPU: start screen */}
      {data.mode === 'cpu' && secret == null && (
        <section className="rounded-2xl border border-edge bg-gradient-to-br from-sky-50 via-white to-indigo-50 dark:from-sky-950/40 dark:via-gray-800 dark:to-indigo-950/40 p-6 md:p-8 text-center space-y-3">
          <Cpu className="w-10 h-10 text-indigo-500 dark:text-indigo-400 mx-auto" />
          <p className="text-sm text-ink-muted">
            {t('cpu.hint', { min: data.range.min, max: data.range.max })}
          </p>
          <button
            type="button"
            onClick={startCpu}
            className="px-5 py-2 text-sm font-medium bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            {t('cpu.start')}
          </button>
        </section>
      )}

      {/* Active game */}
      {secret != null && (
        <section className="rounded-2xl border border-edge bg-surface p-5 space-y-4">
          {/* Stats row */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-ink-muted">
            <span>
              {t('game.attempts')}: <span className="font-mono font-semibold">{attempts.length}</span>
            </span>
            <span>
              {t('game.elapsed')}:{' '}
              <span className="font-mono font-semibold">{(elapsedMs / 1000).toFixed(1)}s</span>
            </span>
            <span className="text-xs text-ink-subtle">
              {t('game.bounds', { lo: bounds.lo, hi: bounds.hi })}
            </span>
          </div>

          {/* Input + hint */}
          {!won ? (
            <>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value)
                    setError('')
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && guess()}
                  placeholder={t('game.placeholder', { lo: bounds.lo, hi: bounds.hi })}
                  className="flex-1 px-3 py-2 text-base border border-edge-strong rounded-md font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={guess}
                  disabled={!input.trim()}
                  className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 transition-colors"
                >
                  {t('game.submit')}
                </button>
              </div>
              {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
              {binaryHint != null && bounds.lo < bounds.hi && (
                <div className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md px-3 py-1.5">
                  <Lightbulb className="w-3.5 h-3.5" />
                  {t('game.binaryHint', { mid: binaryHint })}
                </div>
              )}
            </>
          ) : (
            <div className="rounded-lg bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/40 dark:to-gray-800 border border-emerald-200 dark:border-emerald-800 p-4 text-center space-y-2">
              <Trophy className="w-8 h-8 text-emerald-500 dark:text-emerald-400 mx-auto" />
              <p className="text-base font-semibold text-ink">
                {t('game.win', {
                  secret,
                  attempts: attempts.length,
                  time: (elapsedMs / 1000).toFixed(1),
                })}
              </p>
              {minimumPossibleAttempts >= attempts.length && (
                <p className="text-xs text-emerald-700 dark:text-emerald-400">
                  {t('game.optimal', { min: minimumPossibleAttempts })}
                </p>
              )}
              <div className="flex gap-2 justify-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (data.mode === 'cpu') startCpu()
                    else resetGame()
                  }}
                  className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center gap-1"
                >
                  <RotateCcw className="w-4 h-4" />
                  {t('game.again')}
                </button>
              </div>
            </div>
          )}

          {/* Attempt history */}
          {attempts.length > 0 && (
            <ul className="divide-y divide-edge max-h-72 overflow-y-auto">
              {attempts
                .slice()
                .reverse()
                .map((a, i) => {
                  const realIdx = attempts.length - i
                  const Icon =
                    a.feedback === 'hit' ? Trophy : a.feedback === 'higher' ? ArrowUp : ArrowDown
                  const color =
                    a.feedback === 'hit'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : a.feedback === 'higher'
                        ? 'text-rose-500 dark:text-rose-400'
                        : 'text-sky-500 dark:text-sky-400'
                  return (
                    <li key={i} className="py-2 flex items-center gap-3 text-sm">
                      <span className="text-xs text-ink-subtle w-6 tabular-nums">#{realIdx}</span>
                      <span className="font-mono text-base font-semibold text-ink w-16">
                        {a.guess}
                      </span>
                      <Icon className={`w-4 h-4 ${color}`} />
                      <span className={`text-sm ${color}`}>{t(`feedback.${a.feedback}`)}</span>
                    </li>
                  )
                })}
            </ul>
          )}
        </section>
      )}

      {/* Bottom controls */}
      {secret != null && !won && (
        <div className="sticky bottom-4 z-10 flex flex-wrap gap-2 justify-center pt-2">
          <button
            type="button"
            onClick={() => {
              setRevealed(true)
              setFinishedAt(Date.now())
            }}
            className="px-4 py-2 text-sm font-medium bg-surface text-ink rounded-full shadow border border-edge-strong hover:bg-surface-muted transition-colors flex items-center gap-1"
          >
            {revealed ? `${t('game.giveUpReveal')}: ${secret}` : t('game.giveUp')}
          </button>
          <button
            type="button"
            onClick={resetGame}
            className="px-4 py-2 text-sm font-medium bg-gray-900 text-white rounded-full shadow hover:bg-gray-800 transition-colors flex items-center gap-1"
          >
            <RotateCcw className="w-4 h-4" />
            {t('game.reset')}
          </button>
        </div>
      )}
    </div>
  )
}

export default GuessNumber
