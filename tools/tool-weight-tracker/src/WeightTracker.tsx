import React, { useCallback, useMemo, useState } from 'react'
import {
  Scale,
  ChevronDown,
  History,
  Trash2,
  Target,
  TrendingUp,
  TrendingDown,
  Minus,
  User,
} from 'lucide-react'
import { PageHero } from '@toolbox/ui-kit'
import { useToolStorage } from '@toolbox/storage'
import { useTranslation } from 'react-i18next'

const NAMESPACE = 'toolWeightTracker'

const LB_PER_KG = 2.20462
const KG_PER_LB = 0.45359237
const CM_PER_IN = 2.54
const TREND_DAYS = 30
const MAX_HISTORY_DISPLAY = 200

type Unit = 'kg' | 'lb'

interface Entry {
  date: string // YYYY-MM-DD
  weight: number // stored as kg
  note?: string
}

interface Profile {
  height: number // stored as cm
  targetWeight: number // stored as kg
  unit: Unit
}

interface PersistedState {
  entries: Entry[]
  profile: Profile
}

const DEFAULT_STATE: PersistedState = {
  entries: [],
  profile: { height: 170, targetWeight: 65, unit: 'kg' },
}

// ---------- helpers ----------

function todayISO(): string {
  const d = new Date()
  const tz = d.getTimezoneOffset() * 60_000
  return new Date(d.getTime() - tz).toISOString().slice(0, 10)
}

function kgToDisplay(kg: number, unit: Unit): number {
  return unit === 'lb' ? kg * LB_PER_KG : kg
}

function displayToKg(v: number, unit: Unit): number {
  return unit === 'lb' ? v * KG_PER_LB : v
}

function fmt1(n: number): string {
  if (!Number.isFinite(n)) return '—'
  return n.toFixed(1)
}

function fmtSigned1(n: number): string {
  if (!Number.isFinite(n)) return '—'
  const s = n.toFixed(1)
  return n > 0 ? `+${s}` : s
}

function classifyBMI(bmi: number): {
  key: 'underweight' | 'normal' | 'overweight' | 'obese'
  badge: string
} {
  if (bmi < 18.5)
    return {
      key: 'underweight',
      badge: 'bg-cyan-100 text-cyan-700 border-cyan-200',
    }
  if (bmi < 24)
    return {
      key: 'normal',
      badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    }
  if (bmi < 28)
    return {
      key: 'overweight',
      badge: 'bg-amber-100 text-amber-700 border-amber-200',
    }
  return {
    key: 'obese',
    badge: 'bg-red-100 text-red-700 border-red-200',
  }
}

// ---------- component ----------

const WeightTracker: React.FC = () => {
  const { t } = useTranslation(NAMESPACE)
  const { data, save, loading } = useToolStorage<PersistedState>(
    'weight-tracker',
    'state',
    DEFAULT_STATE,
  )

  const unit: Unit = data.profile?.unit ?? 'kg'

  // form state
  const [date, setDate] = useState<string>(todayISO())
  const [weightInput, setWeightInput] = useState<string>('')
  const [noteInput, setNoteInput] = useState<string>('')

  // section toggles
  const [profileOpen, setProfileOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)

  // sorted entries (ascending by date)
  const sortedEntries = useMemo(() => {
    return [...(data.entries ?? [])].sort((a, b) => (a.date < b.date ? -1 : 1))
  }, [data.entries])

  const handleRecord = useCallback(() => {
    if (loading) return
    const num = parseFloat(weightInput)
    if (!Number.isFinite(num) || num <= 0) return
    const kg = displayToKg(num, unit)
    const existing = sortedEntries.find((e) => e.date === date)
    if (existing) {
      const dStr = date
      if (!window.confirm(t('action.confirmOverwrite', { date: dStr }))) return
    }
    const filtered = sortedEntries.filter((e) => e.date !== date)
    const next: Entry = {
      date,
      weight: kg,
      note: noteInput.trim() || undefined,
    }
    const nextEntries = [...filtered, next].sort((a, b) =>
      a.date < b.date ? -1 : 1,
    )
    void save({ ...data, entries: nextEntries })
    setWeightInput('')
    setNoteInput('')
  }, [loading, weightInput, unit, sortedEntries, date, noteInput, data, save, t])

  const handleDeleteEntry = useCallback(
    (d: string) => {
      if (!window.confirm(t('action.confirmDelete', { date: d }))) return
      const nextEntries = sortedEntries.filter((e) => e.date !== d)
      void save({ ...data, entries: nextEntries })
    },
    [sortedEntries, data, save, t],
  )

  const handleClearAll = useCallback(() => {
    if (!window.confirm(t('action.confirmClearAll'))) return
    void save({ ...data, entries: [] })
  }, [data, save, t])

  const setProfile = useCallback(
    (patch: Partial<Profile>) => {
      void save({ ...data, profile: { ...data.profile, ...patch } })
    },
    [data, save],
  )

  // ---------- derived ----------

  const latestKg = sortedEntries[sortedEntries.length - 1]?.weight
  const firstKg = sortedEntries[0]?.weight
  const targetKg = data.profile.targetWeight

  const avg7Kg = useMemo(() => {
    if (sortedEntries.length === 0) return NaN
    const last = sortedEntries[sortedEntries.length - 1]
    const cutoff = new Date(last.date + 'T00:00:00Z').getTime() - 6 * 86_400_000
    const recent = sortedEntries.filter(
      (e) => new Date(e.date + 'T00:00:00Z').getTime() >= cutoff,
    )
    if (recent.length === 0) return NaN
    return recent.reduce((s, e) => s + e.weight, 0) / recent.length
  }, [sortedEntries])

  const totalChangeKg =
    latestKg != null && firstKg != null ? latestKg - firstKg : NaN
  const toTargetKg = latestKg != null ? latestKg - targetKg : NaN

  // BMI
  const bmi =
    latestKg != null && data.profile.height > 0
      ? latestKg / Math.pow(data.profile.height / 100, 2)
      : NaN
  const bmiClass = Number.isFinite(bmi) ? classifyBMI(bmi) : null

  // progress
  const progressPct = useMemo(() => {
    if (firstKg == null || latestKg == null) return 0
    const denom = firstKg - targetKg
    if (Math.abs(denom) < 1e-9) return latestKg === targetKg ? 100 : 0
    const p = ((firstKg - latestKg) / denom) * 100
    return Math.max(0, Math.min(100, p))
  }, [firstKg, latestKg, targetKg])

  // history list (descending) with diff to previous day
  const historyDesc = useMemo(() => {
    const out: Array<Entry & { diff: number | null }> = []
    for (let i = sortedEntries.length - 1; i >= 0; i--) {
      const cur = sortedEntries[i]
      const prev = sortedEntries[i - 1]
      const diff = prev ? cur.weight - prev.weight : null
      out.push({ ...cur, diff })
    }
    return out.slice(0, MAX_HISTORY_DISPLAY)
  }, [sortedEntries])

  // ---------- trend chart ----------

  const chart = useMemo(() => {
    if (sortedEntries.length < 2) return null
    const last = sortedEntries[sortedEntries.length - 1]
    const lastT = new Date(last.date + 'T00:00:00Z').getTime()
    const cutoffT = lastT - (TREND_DAYS - 1) * 86_400_000
    const recent = sortedEntries.filter(
      (e) => new Date(e.date + 'T00:00:00Z').getTime() >= cutoffT,
    )
    if (recent.length < 2) return null

    const firstT = new Date(recent[0].date + 'T00:00:00Z').getTime()
    const lastT2 = new Date(recent[recent.length - 1].date + 'T00:00:00Z').getTime()
    const spanMs = Math.max(1, lastT2 - firstT)

    const weights = recent.map((e) => e.weight)
    let minW = Math.min(...weights, targetKg)
    let maxW = Math.max(...weights, targetKg)
    if (maxW - minW < 1) {
      // ensure some visible y range
      const mid = (maxW + minW) / 2
      minW = mid - 1
      maxW = mid + 1
    }
    const padLow = minW * 0.98
    const padHigh = maxW * 1.02
    const rangeW = Math.max(0.0001, padHigh - padLow)

    const W = 600
    const H = 220
    const pad = { l: 44, r: 16, t: 16, b: 28 }
    const innerW = W - pad.l - pad.r
    const innerH = H - pad.t - pad.b

    const xOf = (iso: string) => {
      const t0 = new Date(iso + 'T00:00:00Z').getTime()
      const ratio = spanMs === 0 ? 0 : (t0 - firstT) / spanMs
      return pad.l + ratio * innerW
    }
    const yOf = (w: number) => {
      const ratio = (w - padLow) / rangeW
      return pad.t + (1 - ratio) * innerH
    }

    const points = recent.map((e) => ({
      x: xOf(e.date),
      y: yOf(e.weight),
      date: e.date,
      weight: e.weight,
    }))
    const polyline = points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')

    // y-axis ticks: 4 lines
    const yTicks = Array.from({ length: 4 }).map((_, i) => {
      const v = padLow + (rangeW * (3 - i)) / 3
      return { y: yOf(v), value: v }
    })

    // x-axis ticks: first, middle, last
    const xTickIdx = [0, Math.floor((recent.length - 1) / 2), recent.length - 1]
    const xTicks = Array.from(new Set(xTickIdx)).map((i) => ({
      x: xOf(recent[i].date),
      label: recent[i].date.slice(5), // MM-DD
    }))

    const targetY = targetKg >= padLow && targetKg <= padHigh ? yOf(targetKg) : null

    return {
      W,
      H,
      pad,
      polyline,
      points,
      yTicks,
      xTicks,
      targetY,
    }
  }, [sortedEntries, targetKg])

  // ---------- unit conversion helpers for UI ----------

  const w = (kg: number | undefined | null): string => {
    if (kg == null || !Number.isFinite(kg)) return '—'
    return `${fmt1(kgToDisplay(kg, unit))} ${unit}`
  }
  const wSigned = (kg: number): string => {
    if (!Number.isFinite(kg)) return '—'
    return `${fmtSigned1(kgToDisplay(kg, unit))} ${unit}`
  }

  // height displayed in profile
  const heightDisplay =
    data.profile.unit === 'lb'
      ? (data.profile.height / CM_PER_IN).toFixed(1)
      : data.profile.height.toString()
  const heightUnitLabel = data.profile.unit === 'lb' ? 'in' : 'cm'

  // ---------- render ----------

  if (loading) {
    return (
      <div className="w-full space-y-6">
        <PageHero title={t('title')} description={t('description')} />
        <div className="text-center text-gray-500 py-10">{t('loading')}</div>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6">
      <PageHero title={t('title')} description={t('description')} />

      {/* Quick log */}
      <section className="rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Scale className="w-4 h-4 text-indigo-500" />
          {t('section.quickLog')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_2fr_auto] gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              {t('field.date')}
            </label>
            <input
              type="date"
              value={date}
              max={todayISO()}
              onChange={(e) => setDate(e.target.value)}
              className="w-full md:w-40 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              {t('field.weight')} ({unit})
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              inputMode="decimal"
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRecord()
              }}
              placeholder={unit === 'kg' ? '65.0' : '143.3'}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              {t('field.note')}
            </label>
            <input
              type="text"
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRecord()
              }}
              placeholder={t('field.notePlaceholder')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex md:items-end">
            <button
              type="button"
              onClick={handleRecord}
              disabled={!weightInput.trim()}
              className="w-full md:w-auto px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {t('action.record')}
            </button>
          </div>
        </div>
      </section>

      {/* Metrics + BMI + Progress */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Key metric cards (4 in a 2x2 / 4x1 grid) */}
        <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricCard label={t('metrics.current')} value={w(latestKg)} />
          <MetricCard
            label={t('metrics.avg7')}
            value={Number.isFinite(avg7Kg) ? w(avg7Kg) : t('metrics.noData')}
          />
          <MetricCard
            label={t('metrics.totalChange')}
            value={
              Number.isFinite(totalChangeKg)
                ? wSigned(totalChangeKg)
                : t('metrics.noData')
            }
            tone={
              !Number.isFinite(totalChangeKg)
                ? 'neutral'
                : totalChangeKg < 0
                  ? 'down'
                  : totalChangeKg > 0
                    ? 'up'
                    : 'neutral'
            }
          />
          <MetricCard
            label={t('metrics.toTarget')}
            value={
              Number.isFinite(toTargetKg)
                ? wSigned(toTargetKg)
                : t('metrics.noData')
            }
          />
        </div>

        {/* BMI */}
        <div className="rounded-lg border border-gray-200 bg-white p-4 flex flex-col justify-between">
          <div className="text-xs text-gray-500">{t('bmi.label')}</div>
          {bmiClass ? (
            <div className="mt-2 flex items-baseline gap-3">
              <span className="text-3xl font-bold text-gray-800 tabular-nums">
                {bmi.toFixed(1)}
              </span>
              <span
                className={`px-2 py-0.5 text-xs font-medium border rounded ${bmiClass.badge}`}
              >
                {t(`bmi.${bmiClass.key}`)}
              </span>
            </div>
          ) : (
            <div className="mt-2 text-sm text-gray-400">{t('metrics.noData')}</div>
          )}
          {/* BMI segments bar */}
          <div className="mt-3">
            <div className="flex h-2 rounded overflow-hidden">
              <div className="flex-1 bg-cyan-200" />
              <div className="flex-[1.2] bg-emerald-200" />
              <div className="flex-1 bg-amber-200" />
              <div className="flex-1 bg-red-200" />
            </div>
            <div className="flex justify-between text-[10px] text-gray-400 mt-1 tabular-nums">
              <span>18.5</span>
              <span>24</span>
              <span>28</span>
            </div>
          </div>
        </div>
      </section>

      {/* Goal progress */}
      <section className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-500" />
            {t('progress.label')}
          </h2>
          <span className="text-sm font-bold text-emerald-600 tabular-nums">
            {progressPct.toFixed(0)}%
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1.5 tabular-nums">
          <span>{t('progress.fromStart', { w: w(firstKg) })}</span>
          <span>{t('progress.toTarget', { w: w(targetKg) })}</span>
        </div>
      </section>

      {/* Trend chart */}
      <section className="rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">
          {t('section.trend')}
        </h2>
        {chart ? (
          <div className="w-full">
            <svg
              viewBox={`0 0 ${chart.W} ${chart.H}`}
              className="w-full"
              style={{ height: 220 }}
              role="img"
              aria-label={t('section.trend')}
            >
              {/* horizontal grid lines */}
              {chart.yTicks.map((tk, i) => (
                <g key={`y-${i}`}>
                  <line
                    x1={chart.pad.l}
                    x2={chart.W - chart.pad.r}
                    y1={tk.y}
                    y2={tk.y}
                    stroke="#e5e7eb"
                    strokeWidth={1}
                  />
                  <text
                    x={chart.pad.l - 6}
                    y={tk.y + 3}
                    textAnchor="end"
                    fontSize={10}
                    fill="#9ca3af"
                  >
                    {fmt1(kgToDisplay(tk.value, unit))}
                  </text>
                </g>
              ))}

              {/* x-axis labels */}
              {chart.xTicks.map((tk, i) => (
                <text
                  key={`x-${i}`}
                  x={tk.x}
                  y={chart.H - 8}
                  textAnchor="middle"
                  fontSize={10}
                  fill="#9ca3af"
                >
                  {tk.label}
                </text>
              ))}

              {/* target line */}
              {chart.targetY != null && (
                <g>
                  <line
                    x1={chart.pad.l}
                    x2={chart.W - chart.pad.r}
                    y1={chart.targetY}
                    y2={chart.targetY}
                    stroke="#10b981"
                    strokeWidth={1.2}
                    strokeDasharray="4 4"
                  />
                  <text
                    x={chart.W - chart.pad.r}
                    y={chart.targetY - 4}
                    textAnchor="end"
                    fontSize={10}
                    fill="#10b981"
                  >
                    {`${fmt1(kgToDisplay(targetKg, unit))} ${unit}`}
                  </text>
                </g>
              )}

              {/* polyline */}
              <polyline
                fill="none"
                stroke="#4f46e5"
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
                points={chart.polyline}
              />

              {/* data points */}
              {chart.points.map((p, i) => {
                const isLast = i === chart.points.length - 1
                return (
                  <circle
                    key={`p-${i}`}
                    cx={p.x}
                    cy={p.y}
                    r={isLast ? 4.5 : 3}
                    fill={isLast ? '#4f46e5' : '#ffffff'}
                    stroke="#4f46e5"
                    strokeWidth={1.5}
                  >
                    <title>
                      {t('tooltip.weightOn', {
                        date: p.date,
                        w: `${fmt1(kgToDisplay(p.weight, unit))} ${unit}`,
                      })}
                    </title>
                  </circle>
                )
              })}
            </svg>
          </div>
        ) : (
          <div className="py-10 text-center text-sm text-gray-400">
            {t('empty.trend')}
          </div>
        )}
      </section>

      {/* Profile (collapsible) */}
      <section className="rounded-lg border border-gray-200 bg-white">
        <button
          type="button"
          onClick={() => setProfileOpen((v) => !v)}
          aria-expanded={profileOpen}
          className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-left"
        >
          <User className="w-4 h-4" />
          {t('section.profile')}
          <ChevronDown
            className={`w-4 h-4 ml-auto text-gray-400 transition-transform ${
              profileOpen ? 'rotate-180' : ''
            }`}
          />
        </button>
        {profileOpen && (
          <div className="px-4 pb-4 border-t border-gray-100 pt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                {t('field.height')} ({heightUnitLabel})
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={heightDisplay}
                onChange={(e) => {
                  const v = parseFloat(e.target.value)
                  if (!Number.isFinite(v) || v <= 0) return
                  const cm = data.profile.unit === 'lb' ? v * CM_PER_IN : v
                  setProfile({ height: cm })
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                {t('field.target')} ({unit})
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={fmt1(kgToDisplay(data.profile.targetWeight, unit))}
                onChange={(e) => {
                  const v = parseFloat(e.target.value)
                  if (!Number.isFinite(v) || v <= 0) return
                  setProfile({ targetWeight: displayToKg(v, unit) })
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                {t('field.unit')}
              </label>
              <select
                value={unit}
                onChange={(e) => setProfile({ unit: e.target.value as Unit })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="kg">{t('unitLabel.kg')}</option>
                <option value="lb">{t('unitLabel.lb')}</option>
              </select>
            </div>
          </div>
        )}
      </section>

      {/* History (collapsible) */}
      <section className="rounded-lg border border-gray-200 bg-white">
        <div className="flex items-stretch">
          <button
            type="button"
            onClick={() => setHistoryOpen((v) => !v)}
            aria-expanded={historyOpen}
            className="flex-1 flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-l-lg transition-colors text-left"
          >
            <History className="w-4 h-4" />
            {t('section.history')} ({sortedEntries.length})
            <ChevronDown
              className={`w-4 h-4 ml-auto text-gray-400 transition-transform ${
                historyOpen ? 'rotate-180' : ''
              }`}
            />
          </button>
          {historyOpen && sortedEntries.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="px-3 my-2 mr-3 text-xs text-gray-500 hover:text-red-600 border border-gray-200 hover:border-red-300 rounded transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              {t('action.clearAll')}
            </button>
          )}
        </div>
        {historyOpen && (
          <div className="px-4 pb-4 border-t border-gray-100">
            {sortedEntries.length === 0 ? (
              <div className="py-6 text-center text-sm text-gray-400">
                {t('empty.history')}
              </div>
            ) : (
              <ul className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                {historyDesc.map((row) => {
                  const diffKg = row.diff
                  let diffEl: React.ReactNode = null
                  if (diffKg != null) {
                    const dispDiff = kgToDisplay(diffKg, unit)
                    if (Math.abs(dispDiff) < 0.05) {
                      diffEl = (
                        <span className="text-xs text-gray-400 inline-flex items-center gap-0.5">
                          <Minus className="w-3 h-3" />
                          {t('diff.same')}
                        </span>
                      )
                    } else if (dispDiff > 0) {
                      diffEl = (
                        <span className="text-xs text-red-500 inline-flex items-center gap-0.5">
                          <TrendingUp className="w-3 h-3" />
                          {t('diff.up', { v: `${fmt1(dispDiff)} ${unit}` })}
                        </span>
                      )
                    } else {
                      diffEl = (
                        <span className="text-xs text-emerald-600 inline-flex items-center gap-0.5">
                          <TrendingDown className="w-3 h-3" />
                          {t('diff.down', { v: `${fmt1(Math.abs(dispDiff))} ${unit}` })}
                        </span>
                      )
                    }
                  }
                  return (
                    <li
                      key={row.date}
                      className="py-2 grid grid-cols-[auto_auto_1fr_auto] items-center gap-3 text-sm"
                    >
                      <span className="font-mono text-xs text-gray-500 tabular-nums shrink-0">
                        {row.date}
                      </span>
                      <span className="font-semibold text-gray-800 tabular-nums shrink-0">
                        {fmt1(kgToDisplay(row.weight, unit))} {unit}
                      </span>
                      <span className="flex items-center gap-3 min-w-0">
                        {diffEl}
                        {row.note && (
                          <span className="text-xs text-gray-500 truncate">
                            {row.note}
                          </span>
                        )}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteEntry(row.date)}
                        className="text-xs text-gray-400 hover:text-red-600 inline-flex items-center gap-1 shrink-0"
                        aria-label={t('action.delete')}
                      >
                        <Trash2 className="w-3 h-3" />
                        {t('action.delete')}
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        )}
      </section>

    </div>
  )
}

interface MetricCardProps {
  label: string
  value: string
  tone?: 'neutral' | 'up' | 'down'
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, tone = 'neutral' }) => {
  const toneCls =
    tone === 'down'
      ? 'text-emerald-600'
      : tone === 'up'
        ? 'text-red-500'
        : 'text-gray-800'
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3">
      <div className="text-xs text-gray-500">{label}</div>
      <div className={`mt-1 text-lg font-semibold tabular-nums ${toneCls}`}>
        {value}
      </div>
    </div>
  )
}

export default WeightTracker
