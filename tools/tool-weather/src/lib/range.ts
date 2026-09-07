export type RangeMode = 'last7d' | 'last30d' | 'next7d' | 'next14d' | 'next30d' | 'custom'

export const PRESET_MODES: Exclude<RangeMode, 'custom'>[] = [
  'next7d',
  'next14d',
  'next30d',
  'last7d',
  'last30d',
]

/** 普通预报接口的窗口：今天起 16 天（今天 + 15） */
export const FORECAST_HORIZON_DAYS = 15
/** 集合预报（GFS 0.5° 控制成员）的窗口：今天起 35 天（今天 + 34） */
export const ENSEMBLE_HORIZON_DAYS = 34
/** 单次查询最长跨度，与集合预报窗口对齐 */
export const MAX_RANGE_DAYS = 35

/** 本地时区的 YYYY-MM-DD；不能用 toISOString()，那是 UTC，东八区凌晨会退回前一天 */
export function toDateInputValue(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

export function parseDate(value: string): Date {
  return new Date(`${value}T00:00:00`)
}

export function shiftDays(date: Date, days: number): Date {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

/** 以 YYYY-MM-DD 为单位平移，避免反复 Date ↔ string 转换 */
export function shiftDateKey(key: string, days: number): string {
  return toDateInputValue(shiftDays(parseDate(key), days))
}

export function diffDaysInclusive(start: string, end: string): number {
  return Math.floor((parseDate(end).getTime() - parseDate(start).getTime()) / 86400000) + 1
}

export interface DateRange {
  start: string
  end: string
}

/** 快捷方式对应的日期区间；未来区间含今天，历史区间以今天收尾 */
export function getPresetRange(mode: Exclude<RangeMode, 'custom'>, today = new Date()): DateRange {
  const todayKey = toDateInputValue(today)
  switch (mode) {
    case 'next7d':
      return { start: todayKey, end: shiftDateKey(todayKey, 6) }
    case 'next14d':
      return { start: todayKey, end: shiftDateKey(todayKey, 13) }
    case 'next30d':
      return { start: todayKey, end: shiftDateKey(todayKey, 29) }
    case 'last30d':
      return { start: shiftDateKey(todayKey, -29), end: todayKey }
    case 'last7d':
    default:
      return { start: shiftDateKey(todayKey, -6), end: todayKey }
  }
}

export type SegmentSource = 'archive' | 'forecast' | 'ensemble'

export interface RangeSegment extends DateRange {
  source: SegmentSource
}

/**
 * 把一个区间拆成各数据源负责的片段：
 * 昨天及以前走历史归档，今天起 16 天走普通预报，再往后走集合预报。
 * 返回顺序即请求顺序，后面的片段精度更低，所以不会覆盖前面的日期。
 */
export function planSegments(start: string, end: string, today = new Date()): RangeSegment[] {
  const todayKey = toDateInputValue(today)
  const yesterdayKey = shiftDateKey(todayKey, -1)
  const forecastMaxKey = shiftDateKey(todayKey, FORECAST_HORIZON_DAYS)
  const segments: RangeSegment[] = []

  if (start <= yesterdayKey) {
    segments.push({ source: 'archive', start, end: end < yesterdayKey ? end : yesterdayKey })
  }

  if (end >= todayKey) {
    const forecastStart = start > todayKey ? start : todayKey
    const forecastEnd = end < forecastMaxKey ? end : forecastMaxKey
    if (forecastStart <= forecastEnd) {
      segments.push({ source: 'forecast', start: forecastStart, end: forecastEnd })
    }
    if (end > forecastMaxKey) {
      const ensembleStart = start > forecastMaxKey ? start : shiftDateKey(forecastMaxKey, 1)
      segments.push({ source: 'ensemble', start: ensembleStart, end })
    }
  }

  return segments
}
