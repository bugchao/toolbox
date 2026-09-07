import { solarToLunar } from './lunar'
import { getSolarTerm } from './solarTerm'
import { getFestival } from './holidays'
import { getHolidayPlan } from './statutoryHolidays'
import type { DayCell } from './types'

export function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export function buildDay(date: Date, todayKey: string): DayCell {
  const lunar = solarToLunar(date)
  const key = toDateKey(date)
  const weekday = date.getDay()
  return {
    date,
    key,
    day: date.getDate(),
    lunar,
    solarTerm: getSolarTerm(date),
    festival: getFestival(date, lunar),
    holiday: getHolidayPlan(key),
    isToday: key === todayKey,
    isWeekend: weekday === 0 || weekday === 6,
  }
}

/** 从 start 起连续 count 天 */
export function buildRange(start: Date, count: number, todayKey: string): DayCell[] {
  const out: DayCell[] = []
  for (let i = 0; i < count; i++) {
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i)
    out.push(buildDay(d, todayKey))
  }
  return out
}

/** 该日所在周的周日 */
export function startOfWeek(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay())
}

/** 月视图网格：补齐前后相邻月份，凑满整周（macOS 日历样式） */
export function buildMonthGrid(year: number, month: number, todayKey: string): DayCell[] {
  const first = new Date(year, month, 1)
  const start = startOfWeek(first)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const total = Math.ceil((first.getDay() + daysInMonth) / 7) * 7
  return buildRange(start, total, todayKey)
}
