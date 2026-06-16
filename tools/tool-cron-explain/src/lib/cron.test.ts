import { describe, it, expect } from 'vitest'
import { describeEnglish, matches, nextRuns, parseCron, PRESETS } from './cron'

const ok = (expr: string) => {
  const r = parseCron(expr)
  if (!r.ok) throw new Error(`parse failed: ${expr} — ${r.message}`)
  return r.cron
}

describe('parseCron — field expansion', () => {
  it('all wildcards', () => {
    const c = ok('* * * * *')
    expect(c.minute.isWildcard).toBe(true)
    expect(c.minute.values.size).toBe(60)
    expect(c.dow.values.size).toBe(7)
  })

  it('step */5 expands to 0,5,...,55', () => {
    const c = ok('*/5 * * * *')
    expect([...c.minute.values].sort((a, b) => a - b)).toEqual([0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55])
  })

  it('range 1-5', () => {
    expect([...ok('0 0 * * 1-5').dow.values].sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5])
  })

  it('list 1,15,30', () => {
    expect([...ok('1,15,30 * * * *').minute.values].sort((a, b) => a - b)).toEqual([1, 15, 30])
  })

  it('range with step 0-20/10', () => {
    expect([...ok('0-20/10 * * * *').minute.values].sort((a, b) => a - b)).toEqual([0, 10, 20])
  })

  it('month/dow aliases (JAN, MON)', () => {
    expect([...ok('0 0 * JAN *').month.values]).toEqual([1])
    expect([...ok('0 0 * * MON').dow.values]).toEqual([1])
  })

  it('dow 7 normalizes to 0 (Sunday)', () => {
    expect(ok('0 0 * * 7').dow.values.has(0)).toBe(true)
  })
})

describe('parseCron — errors', () => {
  it('empty', () => expect(parseCron('').ok).toBe(false))
  it('wrong field count', () => {
    expect(parseCron('* * *').ok).toBe(false)
    expect(parseCron('* * * * * *').ok).toBe(false)
  })
  it('out of range', () => {
    expect(parseCron('60 * * * *').ok).toBe(false)
    expect(parseCron('* 24 * * *').ok).toBe(false)
    expect(parseCron('* * 32 * *').ok).toBe(false)
  })
  it('bad step', () => expect(parseCron('*/0 * * * *').ok).toBe(false))
  it('reversed range', () => expect(parseCron('5-1 * * * *').ok).toBe(false))
  it('reports offending field', () => {
    const r = parseCron('* 99 * * *')
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.field).toBe('hour')
  })
})

describe('matches', () => {
  it('every minute matches anything', () => {
    expect(matches(ok('* * * * *'), new Date(2026, 0, 1, 3, 7))).toBe(true)
  })

  it('0 9 * * 1-5 matches a weekday 09:00 but not weekend', () => {
    const c = ok('0 9 * * 1-5')
    expect(matches(c, new Date(2026, 5, 15, 9, 0))).toBe(true) // 2026-06-15 is Monday
    expect(matches(c, new Date(2026, 5, 15, 9, 1))).toBe(false) // wrong minute
    expect(matches(c, new Date(2026, 5, 14, 9, 0))).toBe(false) // Sunday
  })

  it('DOM and DOW both restricted → OR semantics', () => {
    // run on the 1st OR on Monday
    const c = ok('0 0 1 * 1')
    expect(matches(c, new Date(2026, 2, 1, 0, 0))).toBe(true) // the 1st (any weekday)
    expect(matches(c, new Date(2026, 5, 15, 0, 0))).toBe(true) // a Monday (not the 1st)
    expect(matches(c, new Date(2026, 5, 16, 0, 0))).toBe(false) // Tuesday, not 1st
  })

  it('DOM restricted, DOW wildcard → only DOM', () => {
    const c = ok('0 0 15 * *')
    expect(matches(c, new Date(2026, 5, 15, 0, 0))).toBe(true)
    expect(matches(c, new Date(2026, 5, 16, 0, 0))).toBe(false)
  })
})

describe('nextRuns', () => {
  it('hourly gives top-of-hour times', () => {
    const runs = nextRuns(ok('0 * * * *'), new Date(2026, 0, 1, 10, 30), 3)
    expect(runs).toHaveLength(3)
    expect(runs[0].getHours()).toBe(11)
    expect(runs[0].getMinutes()).toBe(0)
    expect(runs[1].getHours()).toBe(12)
  })

  it('daily at midnight', () => {
    const runs = nextRuns(ok('0 0 * * *'), new Date(2026, 0, 1, 12, 0), 2)
    expect(runs[0].getDate()).toBe(2)
    expect(runs[0].getHours()).toBe(0)
  })

  it('excludes the from-instant itself', () => {
    const from = new Date(2026, 0, 1, 0, 0)
    const runs = nextRuns(ok('0 0 * * *'), from, 1)
    expect(runs[0].getTime()).toBeGreaterThan(from.getTime())
    expect(runs[0].getDate()).toBe(2)
  })

  it('weekday 9am skips weekend', () => {
    // 2026-06-12 is Friday; next weekday 9am runs: Fri 12, Mon 15, Tue 16
    const runs = nextRuns(ok('0 9 * * 1-5'), new Date(2026, 5, 12, 10, 0), 2)
    expect(runs[0].getDate()).toBe(15) // Monday (skip Sat 13 / Sun 14)
    expect(runs[1].getDate()).toBe(16)
  })
})

describe('describeEnglish', () => {
  it('every minute', () => {
    expect(describeEnglish(ok('* * * * *'))).toContain('every minute')
  })
  it('*/15 → every 15 minutes', () => {
    expect(describeEnglish(ok('*/15 * * * *'))).toContain('every 15 minutes')
  })
  it('mentions weekdays + hour', () => {
    const d = describeEnglish(ok('0 9 * * 1-5'))
    expect(d).toMatch(/Mon/)
    expect(d).toMatch(/Fri/)
  })
  it('mentions month name', () => {
    expect(describeEnglish(ok('0 0 1 1 *'))).toContain('Jan')
  })
})

describe('PRESETS', () => {
  it('all parse cleanly', () => {
    for (const p of PRESETS) expect(parseCron(p.expr).ok).toBe(true)
  })
  it('keys are unique', () => {
    expect(new Set(PRESETS.map((p) => p.key)).size).toBe(PRESETS.length)
  })
})
