import { describe, it, expect } from 'vitest'
import { getHolidayPlan, HOLIDAY_YEAR_MAX, HOLIDAY_YEAR_MIN } from '../lib/statutoryHolidays'
import { buildMonthGrid, buildRange, startOfWeek, toDateKey } from '../lib/days'

describe('getHolidayPlan', () => {
  it('marks a statutory day off', () => {
    expect(getHolidayPlan('2026-10-01')).toEqual({ name: '国庆节', isOffDay: true })
  })

  it('marks a make-up workday', () => {
    expect(getHolidayPlan('2026-10-10')).toEqual({ name: '国庆节', isOffDay: false })
  })

  it('returns null for an ordinary day and for years outside the snapshot', () => {
    expect(getHolidayPlan('2026-06-03')).toBeNull()
    expect(getHolidayPlan(`${HOLIDAY_YEAR_MAX + 1}-10-01`)).toBeNull()
    expect(getHolidayPlan(`${HOLIDAY_YEAR_MIN - 1}-10-01`)).toBeNull()
  })
})

describe('view ranges', () => {
  it('starts a week on Sunday', () => {
    // 2026-09-07 是星期一 → 该周从 09-06 开始
    expect(toDateKey(startOfWeek(new Date(2026, 8, 7)))).toBe('2026-09-06')
    expect(toDateKey(startOfWeek(new Date(2026, 8, 6)))).toBe('2026-09-06')
  })

  it('builds a 7-day week starting at the given date', () => {
    const cells = buildRange(startOfWeek(new Date(2026, 8, 7)), 7, '')
    expect(cells).toHaveLength(7)
    expect(cells.map((c) => c.day)).toEqual([6, 7, 8, 9, 10, 11, 12])
  })

  it('pads the month grid with adjacent months to whole weeks', () => {
    // 2026-02 从星期日开始、28 天 → 正好 4 周，不需要补齐
    const feb = buildMonthGrid(2026, 1, '')
    expect(feb).toHaveLength(28)
    expect(feb[0].key).toBe('2026-02-01')

    // 2026-09 从星期二开始、30 天 → 5 周，首格是 8 月 30 日
    const sep = buildMonthGrid(2026, 8, '')
    expect(sep).toHaveLength(35)
    expect(sep[0].key).toBe('2026-08-30')
    expect(sep[sep.length - 1].key).toBe('2026-10-03')
    expect(sep.length % 7).toBe(0)
  })

  it('flags today', () => {
    const cells = buildRange(new Date(2026, 8, 7), 2, '2026-09-07')
    expect(cells[0].isToday).toBe(true)
    expect(cells[1].isToday).toBe(false)
  })
})
