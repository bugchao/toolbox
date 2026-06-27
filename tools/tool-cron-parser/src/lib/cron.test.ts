import { describe, it, expect } from 'vitest'
import {
  parseCron,
  normalizeExpression,
  getNextRun,
  getNextRuns,
  summarizeField,
  CronParseError,
} from './cron'

describe('normalizeExpression / aliases', () => {
  it('expands @daily and friends', () => {
    expect(normalizeExpression('@daily')).toBe('0 0 * * *')
    expect(normalizeExpression('@midnight')).toBe('0 0 * * *')
    expect(normalizeExpression('@hourly')).toBe('0 * * * *')
    expect(normalizeExpression('@weekly')).toBe('0 0 * * 0')
    expect(normalizeExpression('@monthly')).toBe('0 0 1 * *')
    expect(normalizeExpression('@yearly')).toBe('0 0 1 1 *')
    expect(normalizeExpression('@annually')).toBe('0 0 1 1 *')
  })

  it('is case-insensitive for aliases', () => {
    expect(normalizeExpression('@DAILY')).toBe('0 0 * * *')
  })

  it('collapses extra whitespace', () => {
    expect(normalizeExpression('  */5   *  *  *   * ')).toBe('*/5 * * * *')
  })

  it('throws on empty / unknown alias', () => {
    expect(() => normalizeExpression('   ')).toThrow(CronParseError)
    expect(() => normalizeExpression('@reboot')).toThrow(CronParseError)
  })
})

describe('parseCron field expansion', () => {
  it('parses star fields to full range', () => {
    const p = parseCron('* * * * *')
    expect(p.values.minute).toHaveLength(60)
    expect(p.values.hour).toHaveLength(24)
    expect(p.values.dom[0]).toBe(1)
    expect(p.values.month).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
    expect(p.values.dow).toEqual([0, 1, 2, 3, 4, 5, 6])
  })

  it('parses step', () => {
    expect(parseCron('*/15 * * * *').values.minute).toEqual([0, 15, 30, 45])
  })

  it('parses range', () => {
    expect(parseCron('0 9-17 * * *').values.hour).toEqual([9, 10, 11, 12, 13, 14, 15, 16, 17])
  })

  it('parses range with step', () => {
    expect(parseCron('0 0-23/6 * * *').values.hour).toEqual([0, 6, 12, 18])
  })

  it('parses lists', () => {
    expect(parseCron('0,30 * * * *').values.minute).toEqual([0, 30])
    expect(parseCron('0 0 1,15 * *').values.dom).toEqual([1, 15])
  })

  it('parses single value with step (5/10 => from 5)', () => {
    expect(parseCron('5/10 * * * *').values.minute).toEqual([5, 15, 25, 35, 45, 55])
  })

  it('parses month and weekday names', () => {
    expect(parseCron('0 0 * JAN-MAR *').values.month).toEqual([1, 2, 3])
    expect(parseCron('0 0 * * MON-FRI').values.dow).toEqual([1, 2, 3, 4, 5])
  })

  it('normalizes 7 to 0 for Sunday', () => {
    expect(parseCron('0 0 * * 7').values.dow).toEqual([0])
    expect(parseCron('0 0 * * 0,7').values.dow).toEqual([0])
  })

  it('tracks restricted flags (star vs not)', () => {
    const p = parseCron('*/5 * 1 * 1-5')
    expect(p.restricted.minute).toBe(false) // starts with *
    expect(p.restricted.dom).toBe(true)
    expect(p.restricted.dow).toBe(true)
    expect(p.restricted.hour).toBe(false)
  })
})

describe('parseCron errors', () => {
  it('wrong field count', () => {
    expect(() => parseCron('* * * *')).toThrow(CronParseError)
    expect(() => parseCron('* * * * * *')).toThrow(CronParseError)
  })

  it('out of range', () => {
    const err = (() => {
      try { parseCron('99 * * * *') } catch (e) { return e as CronParseError }
    })()
    expect(err).toBeInstanceOf(CronParseError)
    expect(err?.code).toBe('outOfRange')
    expect(err?.field).toBe('minute')
  })

  it('bad range order', () => {
    const err = (() => {
      try { parseCron('0 17-9 * * *') } catch (e) { return e as CronParseError }
    })()
    expect(err?.code).toBe('rangeOrder')
    expect(err?.field).toBe('hour')
  })

  it('invalid value / step', () => {
    expect(() => parseCron('0 0 * * XYZ')).toThrow(CronParseError)
    expect(() => parseCron('*/0 * * * *')).toThrow(CronParseError)
  })
})

describe('getNextRun', () => {
  // 固定基准：2026-06-27 (周六) 12:00 本地时间
  const base = new Date(2026, 5, 27, 12, 0, 0)

  it('every minute -> next minute', () => {
    const next = getNextRun(parseCron('* * * * *'), base)!
    expect(next.getMinutes()).toBe(1)
    expect(next.getHours()).toBe(12)
  })

  it('step minutes */15', () => {
    const next = getNextRun(parseCron('*/15 * * * *'), base)!
    expect(next.getMinutes()).toBe(15)
  })

  it('daily at 09:00 rolls to next day', () => {
    const next = getNextRun(parseCron('0 9 * * *'), base)!
    expect(next.getDate()).toBe(28)
    expect(next.getHours()).toBe(9)
    expect(next.getMinutes()).toBe(0)
  })

  it('weekday business hours range', () => {
    // 周六 12:00 -> 下一个工作日 周一(29号) 09:00
    const next = getNextRun(parseCron('0 9-17 * * 1-5'), base)!
    expect(next.getDay()).toBe(1)
    expect(next.getDate()).toBe(29)
    expect(next.getHours()).toBe(9)
  })

  it('day-of-month OR day-of-week union (POSIX)', () => {
    // "0 0 13 * 5" = 每月13号 或 每周五。基准后第一个匹配应是 7/3(周五) 而非 7/13
    const next = getNextRun(parseCron('0 0 13 * 5'), base)!
    expect(next.getMonth()).toBe(6) // July (0-based)
    expect(next.getDate()).toBe(3)
    expect(next.getDay()).toBe(5)
  })

  it('only dom restricted -> must match dom', () => {
    const next = getNextRun(parseCron('0 0 15 * *'), base)!
    expect(next.getDate()).toBe(15)
    expect(next.getMonth()).toBe(6) // July
  })

  it('cross-month rollover (1st of month)', () => {
    const next = getNextRun(parseCron('0 0 1 * *'), base)!
    expect(next.getDate()).toBe(1)
    expect(next.getMonth()).toBe(6) // July 1
  })

  it('cross-year: Feb 29 only on leap years', () => {
    // 2026/2027 非闰年，2028 是闰年
    const from = new Date(2026, 0, 1, 0, 0, 0)
    const next = getNextRun(parseCron('0 0 29 2 *'), from)!
    expect(next.getFullYear()).toBe(2028)
    expect(next.getMonth()).toBe(1)
    expect(next.getDate()).toBe(29)
  })
})

describe('getNextRuns', () => {
  const base = new Date(2026, 5, 27, 12, 0, 0)
  it('returns N strictly increasing times', () => {
    const runs = getNextRuns(parseCron('*/30 * * * *'), base, 5)
    expect(runs).toHaveLength(5)
    for (let i = 1; i < runs.length; i++) {
      expect(runs[i].getTime()).toBeGreaterThan(runs[i - 1].getTime())
    }
    expect(runs[0].getMinutes()).toBe(30)
    expect(runs[1].getMinutes()).toBe(0)
  })
})

describe('summarizeField', () => {
  it('detects every', () => {
    expect(summarizeField('*', 'minute', [])).toEqual({ type: 'every' })
  })
  it('detects step', () => {
    expect(summarizeField('*/15', 'minute', [])).toEqual({ type: 'step', step: 15 })
  })
  it('detects range', () => {
    expect(summarizeField('9-17', 'hour', [])).toEqual({ type: 'range', from: 9, to: 17 })
  })
  it('detects step range', () => {
    expect(summarizeField('0-23/6', 'hour', [])).toEqual({ type: 'stepRange', step: 6, from: 0, to: 23 })
  })
  it('resolves names in range', () => {
    expect(summarizeField('MON-FRI', 'dow', [])).toEqual({ type: 'range', from: 1, to: 5 })
  })
  it('falls back to values for lists', () => {
    expect(summarizeField('1,15', 'dom', [1, 15])).toEqual({ type: 'values', values: [1, 15] })
  })
})
