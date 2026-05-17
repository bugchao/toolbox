import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Dices, Trash2, Minus, Plus, History, Eye, EyeOff, ChevronDown } from 'lucide-react'
import { PageHero } from '@toolbox/ui-kit'
import { useToolStorage } from '@toolbox/storage'
import { useTranslation } from 'react-i18next'

const NAMESPACE = 'toolDiceRoller'

const MIN_DICE = 1
const MAX_DICE = 12
const DEFAULT_DICE = 5
const ROLL_DURATION_MS = 900
const DIE_SIZE_PX = 88
const MAX_HISTORY = 50

const PIP_POSITIONS: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
}

// 中式骰子传统：1 点和 4 点为红色，其余为黑色
const isRedFace = (face: number) => face === 1 || face === 4

// 把某一面旋转到正前方需要的立方体姿态（accumulated; 与所有 spin 累加在一起）
const FACE_ANCHOR_DEG: Record<number, { x: number; y: number }> = {
  1: { x: 0, y: 0 },
  2: { x: 0, y: -90 },
  3: { x: -90, y: 0 },
  4: { x: 90, y: 0 },
  5: { x: 0, y: 90 },
  6: { x: 0, y: 180 },
}

function rollOnce(): number {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const max = Math.floor(0xffffffff / 6) * 6
    const buf = new Uint32Array(1)
    let n: number
    do {
      crypto.getRandomValues(buf)
      n = buf[0]
    } while (n >= max)
    return (n % 6) + 1
  }
  return 1 + Math.floor(Math.random() * 6)
}

interface RollRecord {
  values: number[]
  sum: number
  timestamp: number
}

interface PersistedState {
  count: number
  history: RollRecord[]
}

const DEFAULT_STATE: PersistedState = {
  count: DEFAULT_DICE,
  history: [],
}

interface Rotation {
  x: number
  y: number
}

interface DieProps {
  value: number
  rotation: Rotation
  hidden: boolean
  rolling: boolean
}

const PipFace: React.FC<{ value: number }> = ({ value }) => {
  const pips = PIP_POSITIONS[value] ?? []
  const dotColor = isRedFace(value) ? 'bg-red-500' : 'bg-gray-900'
  return (
    <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-1 p-2">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="flex items-center justify-center">
          {pips.includes(i) && (
            <span className={`w-2.5 h-2.5 rounded-full ${dotColor} shadow-inner`} />
          )}
        </div>
      ))}
    </div>
  )
}

const Die: React.FC<DieProps> = ({ value, rotation, hidden, rolling }) => {
  const { t } = useTranslation(NAMESPACE)
  const cubeStyle: React.CSSProperties = {
    transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
    transition: rolling
      ? `transform ${ROLL_DURATION_MS}ms cubic-bezier(0.22, 0.65, 0.3, 1)`
      : 'transform 0.35s ease-out',
  }
  return (
    <div
      className="dice-stage"
      style={{ width: DIE_SIZE_PX, height: DIE_SIZE_PX }}
      role="img"
      aria-label={hidden ? t('hiddenAria') : t('faceLabel', { value })}
      title={hidden ? t('hiddenAria') : t('faceLabel', { value })}
    >
      <div className="dice-cube" style={cubeStyle}>
        <div className="dice-face dice-f1"><PipFace value={1} /></div>
        <div className="dice-face dice-f2"><PipFace value={2} /></div>
        <div className="dice-face dice-f3"><PipFace value={3} /></div>
        <div className="dice-face dice-f4"><PipFace value={4} /></div>
        <div className="dice-face dice-f5"><PipFace value={5} /></div>
        <div className="dice-face dice-f6"><PipFace value={6} /></div>
      </div>
      {/* hide overlay (sits in front of the cube, in 2D space) */}
      <div
        className={`dice-cover ${hidden && !rolling ? 'is-on' : ''}`}
        aria-hidden="true"
      >
        <EyeOff className="w-6 h-6 text-white/85" />
      </div>
    </div>
  )
}

function formatTimestamp(ts: number, now: number): string {
  const diff = now - ts
  if (diff < 60_000) return new Date(ts).toLocaleTimeString()
  const d = new Date(ts)
  const today = new Date(now)
  const sameDay =
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  return sameDay ? d.toLocaleTimeString() : d.toLocaleString()
}

const DiceRoller: React.FC = () => {
  const { t } = useTranslation(NAMESPACE)
  const { data, save, loading } = useToolStorage<PersistedState>(
    'dice-roller',
    'state',
    DEFAULT_STATE,
  )

  const [values, setValues] = useState<number[]>(() => Array(DEFAULT_DICE).fill(1))
  const [rotations, setRotations] = useState<Rotation[]>(() =>
    Array.from({ length: DEFAULT_DICE }, () => ({ x: 0, y: 0 })),
  )
  const [rolling, setRolling] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [nowTick, setNowTick] = useState(Date.now())
  const finishTimeoutRef = useRef<number | null>(null)

  // Sync values/rotations length to persisted count (initial load + user edits)
  useEffect(() => {
    const syncLen = <T,>(arr: T[], fill: () => T): T[] => {
      if (arr.length === data.count) return arr
      if (arr.length > data.count) return arr.slice(0, data.count)
      return [...arr, ...Array.from({ length: data.count - arr.length }, fill)]
    }
    setValues((prev) => syncLen(prev, () => 1))
    setRotations((prev) =>
      syncLen(prev, () => ({ x: 0, y: 0 })),
    )
  }, [data.count])

  // Refresh "Xm ago" labels every 30s
  useEffect(() => {
    const id = window.setInterval(() => setNowTick(Date.now()), 30_000)
    return () => window.clearInterval(id)
  }, [])

  useEffect(
    () => () => {
      if (finishTimeoutRef.current) window.clearTimeout(finishTimeoutRef.current)
    },
    [],
  )

  const setCount = useCallback(
    (next: number) => {
      const clamped = Math.min(Math.max(next, MIN_DICE), MAX_DICE)
      if (clamped === data.count) return
      void save({ ...data, count: clamped })
    },
    [data, save],
  )

  const doRoll = useCallback(() => {
    if (rolling || loading) return
    setHidden(false)
    setRolling(true)
    setNowTick(Date.now())

    const final = Array.from({ length: data.count }, () => rollOnce())

    // For each die, accumulate big random spin + final face anchor so the
    // CSS transition always rotates forward and settles on the right face.
    setRotations((prev) => {
      const next: Rotation[] = []
      for (let i = 0; i < data.count; i++) {
        const cur = prev[i] ?? { x: 0, y: 0 }
        const anchor = FACE_ANCHOR_DEG[final[i]]
        // Round current to nearest 360° to get a clean base, then add
        // 2-4 full turns plus the anchor delta (with random extra direction).
        const baseX = Math.round(cur.x / 360) * 360
        const baseY = Math.round(cur.y / 360) * 360
        const turnsX = 2 + Math.floor(Math.random() * 3) // 2..4
        const turnsY = 2 + Math.floor(Math.random() * 3)
        next.push({
          x: baseX + 360 * turnsX + anchor.x,
          y: baseY + 360 * turnsY + anchor.y,
        })
      }
      return next
    })
    setValues(final)

    finishTimeoutRef.current = window.setTimeout(() => {
      setRolling(false)
      const record: RollRecord = {
        values: final,
        sum: final.reduce((a, b) => a + b, 0),
        timestamp: Date.now(),
      }
      const nextHistory = [record, ...data.history].slice(0, MAX_HISTORY)
      void save({ ...data, history: nextHistory })
    }, ROLL_DURATION_MS)
  }, [rolling, loading, data, save])

  const clearHistory = useCallback(() => {
    void save({ ...data, history: [] })
  }, [data, save])

  const sum = useMemo(() => values.reduce((a, b) => a + b, 0), [values])

  const stats = useMemo(() => {
    if (data.history.length === 0) return null
    let min = Infinity
    let max = -Infinity
    let total = 0
    for (const r of data.history) {
      if (r.sum < min) min = r.sum
      if (r.sum > max) max = r.sum
      total += r.sum
    }
    return { rolls: data.history.length, min, max, avg: total / data.history.length }
  }, [data.history])

  const hasResult = !rolling && values.length > 0

  return (
    <div className="w-full space-y-6">
      <PageHero title={t('title')} description={t('description')} />

      <style>{`
        .dice-stage {
          position: relative;
          perspective: 600px;
        }
        .dice-cube {
          position: absolute;
          inset: 0;
          transform-style: preserve-3d;
          will-change: transform;
        }
        .dice-face {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #ffffff 0%, #f3f4f6 100%);
          border: 1px solid rgba(0,0,0,0.08);
          border-radius: 14px;
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.7),
            inset 0 -2px 4px rgba(0,0,0,0.08);
          backface-visibility: hidden;
        }
        .dice-f1 { transform: translateZ(${DIE_SIZE_PX / 2}px); }
        .dice-f6 { transform: rotateY(180deg) translateZ(${DIE_SIZE_PX / 2}px); }
        .dice-f2 { transform: rotateY(90deg)  translateZ(${DIE_SIZE_PX / 2}px); }
        .dice-f5 { transform: rotateY(-90deg) translateZ(${DIE_SIZE_PX / 2}px); }
        .dice-f3 { transform: rotateX(90deg)  translateZ(${DIE_SIZE_PX / 2}px); }
        .dice-f4 { transform: rotateX(-90deg) translateZ(${DIE_SIZE_PX / 2}px); }
        .dice-cover {
          position: absolute;
          inset: 0;
          border-radius: 14px;
          background: linear-gradient(135deg, #4338ca 0%, #1e1b4b 100%);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.15),
            0 4px 12px rgba(67,56,202,0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transform: scale(0.85);
          pointer-events: none;
          transition: opacity 0.25s ease-out, transform 0.25s ease-out;
        }
        .dice-cover.is-on {
          opacity: 1;
          transform: scale(1);
        }
      `}</style>

      {/* Controls */}
      <section className="rounded-lg border border-gray-200 bg-white p-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">{t('diceCount')}</label>
          <div className="inline-flex items-center border border-gray-300 rounded-md overflow-hidden">
            <button
              type="button"
              onClick={() => setCount(data.count - 1)}
              disabled={data.count <= MIN_DICE || rolling || loading}
              className="px-2 py-1.5 text-gray-600 hover:bg-gray-50 disabled:text-gray-300 disabled:cursor-not-allowed"
              aria-label={t('decrement')}
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 text-sm font-mono text-gray-800 min-w-[2rem] text-center tabular-nums">
              {data.count}
            </span>
            <button
              type="button"
              onClick={() => setCount(data.count + 1)}
              disabled={data.count >= MAX_DICE || rolling || loading}
              className="px-2 py-1.5 text-gray-600 hover:bg-gray-50 disabled:text-gray-300 disabled:cursor-not-allowed"
              aria-label={t('increment')}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <span className="text-xs text-gray-400">
            {t('rangeHint', { min: MIN_DICE, max: MAX_DICE })}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setHidden((h) => !h)}
          disabled={rolling || loading || !hasResult}
          className="ml-auto px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          title={hidden ? t('reveal') : t('hide')}
        >
          {hidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          {hidden ? t('reveal') : t('hide')}
        </button>
      </section>

      {/* Dice display */}
      <section className="rounded-lg border border-gray-200 bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6 min-h-[220px]">
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-5 mb-4">
          {values.map((v, i) => (
            <Die
              key={i}
              value={v}
              rotation={rotations[i] ?? { x: 0, y: 0 }}
              rolling={rolling}
              hidden={hidden}
            />
          ))}
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-500 uppercase tracking-wide">{t('sumLabel')}</div>
          <div className="text-4xl md:text-5xl font-bold text-indigo-600 tabular-nums">
            {rolling || hidden ? '…' : sum}
          </div>
          {!rolling && !hidden && values.length > 1 && (
            <div className="text-xs text-gray-400 mt-1 font-mono">
              {values.join(' + ')} = {sum}
            </div>
          )}
        </div>
      </section>

      {/* History + stats — collapsed by default, click header to expand */}
      {data.history.length > 0 && (
        <section className="rounded-lg border border-gray-200 bg-white">
          <div className="flex items-stretch">
            <button
              type="button"
              onClick={() => setHistoryOpen((v) => !v)}
              aria-expanded={historyOpen}
              className="flex-1 flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-l-lg transition-colors text-left"
            >
              <History className="w-4 h-4" />
              {t('historyLabel')} ({data.history.length})
              <ChevronDown
                className={`w-4 h-4 ml-auto text-gray-400 transition-transform ${
                  historyOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
            {historyOpen && (
              <button
                type="button"
                onClick={clearHistory}
                className="px-3 my-2 mr-3 text-xs text-gray-500 hover:text-red-600 border border-gray-200 hover:border-red-300 rounded transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                {t('clearHistory')}
              </button>
            )}
          </div>

          {historyOpen && (
            <div className="px-4 pb-4 border-t border-gray-100">
              {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 my-4 text-center">
                  <div className="px-3 py-2 bg-gray-50 rounded">
                    <div className="text-xs text-gray-500">{t('statRolls')}</div>
                    <div className="text-lg font-semibold text-gray-800 tabular-nums">{stats.rolls}</div>
                  </div>
                  <div className="px-3 py-2 bg-gray-50 rounded">
                    <div className="text-xs text-gray-500">{t('statMin')}</div>
                    <div className="text-lg font-semibold text-gray-800 tabular-nums">{stats.min}</div>
                  </div>
                  <div className="px-3 py-2 bg-gray-50 rounded">
                    <div className="text-xs text-gray-500">{t('statMax')}</div>
                    <div className="text-lg font-semibold text-gray-800 tabular-nums">{stats.max}</div>
                  </div>
                  <div className="px-3 py-2 bg-gray-50 rounded">
                    <div className="text-xs text-gray-500">{t('statAvg')}</div>
                    <div className="text-lg font-semibold text-gray-800 tabular-nums">
                      {stats.avg.toFixed(2)}
                    </div>
                  </div>
                </div>
              )}

              <ul className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
                {data.history.map((r, i) => (
                  <li
                    key={`${r.timestamp}-${i}`}
                    className="py-2 grid grid-cols-[1fr_auto_auto] items-baseline gap-3 text-sm"
                  >
                    <span className="font-mono text-xs text-gray-500 truncate">
                      [{r.values.join(', ')}]
                    </span>
                    <time
                      className="text-xs text-gray-400 tabular-nums shrink-0"
                      dateTime={new Date(r.timestamp).toISOString()}
                      title={new Date(r.timestamp).toLocaleString()}
                    >
                      {formatTimestamp(r.timestamp, nowTick)}
                    </time>
                    <span className="font-mono font-semibold text-indigo-600 tabular-nums shrink-0 min-w-[2.5rem] text-right">
                      {r.sum}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {/* Primary action — at the bottom of the page */}
      <div className="sticky bottom-4 z-10 flex justify-center pt-2">
        <button
          type="button"
          onClick={doRoll}
          disabled={rolling || loading}
          className="w-full max-w-md px-6 py-3 text-base font-medium bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          <Dices className={`w-5 h-5 ${rolling ? 'animate-spin' : ''}`} />
          {rolling ? t('rolling') : t('roll')}
        </button>
      </div>
    </div>
  )
}

export default DiceRoller
