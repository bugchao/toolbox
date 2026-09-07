import { describe, it, expect } from 'vitest'
import {
  diffDaysInclusive,
  getPresetRange,
  planSegments,
  shiftDateKey,
  toDateInputValue,
} from './range'

const TODAY = new Date(2026, 8, 7) // 2026-09-07

describe('toDateInputValue', () => {
  it('uses local time, not UTC (东八区凌晨不能退回前一天)', () => {
    expect(toDateInputValue(new Date(2026, 8, 8, 1, 30))).toBe('2026-09-08')
    expect(toDateInputValue(new Date(2026, 8, 8, 23, 30))).toBe('2026-09-08')
  })
})

describe('getPresetRange', () => {
  it('counts future presets from today, inclusive', () => {
    expect(getPresetRange('next7d', TODAY)).toEqual({ start: '2026-09-07', end: '2026-09-13' })
    expect(getPresetRange('next14d', TODAY)).toEqual({ start: '2026-09-07', end: '2026-09-20' })
    expect(getPresetRange('next30d', TODAY)).toEqual({ start: '2026-09-07', end: '2026-10-06' })
  })

  it('keeps historical presets ending today', () => {
    expect(getPresetRange('last7d', TODAY)).toEqual({ start: '2026-09-01', end: '2026-09-07' })
    expect(getPresetRange('last30d', TODAY)).toEqual({ start: '2026-08-09', end: '2026-09-07' })
  })

  it('spans exactly the advertised number of days', () => {
    for (const [mode, days] of [['next7d', 7], ['next14d', 14], ['next30d', 30], ['last7d', 7], ['last30d', 30]] as const) {
      const { start, end } = getPresetRange(mode, TODAY)
      expect(diffDaysInclusive(start, end)).toBe(days)
    }
  })

  it('crosses month boundaries correctly', () => {
    expect(getPresetRange('next7d', new Date(2026, 11, 29))).toEqual({ start: '2026-12-29', end: '2027-01-04' })
  })
})

describe('planSegments', () => {
  it('serves 未来 7 天 entirely from the forecast endpoint', () => {
    const { start, end } = getPresetRange('next7d', TODAY)
    expect(planSegments(start, end, TODAY)).toEqual([{ source: 'forecast', start, end }])
  })

  it('serves 未来 14 天 entirely from the forecast endpoint', () => {
    const { start, end } = getPresetRange('next14d', TODAY)
    expect(planSegments(start, end, TODAY)).toEqual([{ source: 'forecast', start, end }])
  })

  it('splits 未来一个月 at the 16-day forecast horizon', () => {
    const { start, end } = getPresetRange('next30d', TODAY)
    expect(planSegments(start, end, TODAY)).toEqual([
      { source: 'forecast', start: '2026-09-07', end: '2026-09-22' },
      { source: 'ensemble', start: '2026-09-23', end: '2026-10-06' },
    ])
  })

  it('covers every day of the range exactly once', () => {
    const { start, end } = getPresetRange('next30d', TODAY)
    const covered = planSegments(start, end, TODAY).reduce((n, s) => n + diffDaysInclusive(s.start, s.end), 0)
    expect(covered).toBe(30)
  })

  it('uses the archive for purely historical ranges', () => {
    expect(planSegments('2026-08-01', '2026-08-31', TODAY)).toEqual([
      { source: 'archive', start: '2026-08-01', end: '2026-08-31' },
    ])
  })

  it('merges archive and forecast for a range straddling today', () => {
    expect(planSegments('2026-09-01', '2026-09-13', TODAY)).toEqual([
      { source: 'archive', start: '2026-09-01', end: '2026-09-06' },
      { source: 'forecast', start: '2026-09-07', end: '2026-09-13' },
    ])
  })

  it('skips the forecast segment when the range starts past its horizon', () => {
    expect(planSegments('2026-09-25', '2026-10-06', TODAY)).toEqual([
      { source: 'ensemble', start: '2026-09-25', end: '2026-10-06' },
    ])
  })

  it('handles a single day', () => {
    expect(planSegments('2026-09-07', '2026-09-07', TODAY)).toEqual([
      { source: 'forecast', start: '2026-09-07', end: '2026-09-07' },
    ])
    expect(planSegments('2026-09-06', '2026-09-06', TODAY)).toEqual([
      { source: 'archive', start: '2026-09-06', end: '2026-09-06' },
    ])
  })

  it('shiftDateKey crosses years', () => {
    expect(shiftDateKey('2026-12-31', 1)).toBe('2027-01-01')
    expect(shiftDateKey('2027-01-01', -1)).toBe('2026-12-31')
  })
})
