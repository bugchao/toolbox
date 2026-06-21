import { describe, it, expect } from 'vitest'
import {
  addToDate,
  clockFormat,
  humanize,
  MS,
  parseDuration,
  toAllUnits,
  toUnit,
} from './duration'

const ms = (s: string) => {
  const r = parseDuration(s)
  if (!r.ok) throw new Error(r.message)
  return r.ms
}

describe('parseDuration', () => {
  it('single units', () => {
    expect(ms('500ms')).toBe(500)
    expect(ms('30s')).toBe(30_000)
    expect(ms('5m')).toBe(5 * MS.m)
    expect(ms('2h')).toBe(2 * MS.h)
    expect(ms('3d')).toBe(3 * MS.d)
    expect(ms('1w')).toBe(MS.w)
  })
  it('compound 1d2h30m', () => {
    expect(ms('1d2h30m')).toBe(MS.d + 2 * MS.h + 30 * MS.m)
  })
  it('allows spaces and decimals', () => {
    expect(ms('1.5h')).toBe(1.5 * MS.h)
    expect(ms('90 min'.replace('min', 'm'))).toBe(90 * MS.m)
    expect(ms('1d 2h')).toBe(MS.d + 2 * MS.h)
  })
  it('case-insensitive units', () => {
    expect(ms('2H30M')).toBe(2 * MS.h + 30 * MS.m)
  })
  it('bare number is seconds', () => {
    expect(ms('45')).toBe(45_000)
    expect(ms('1.5')).toBe(1500)
  })
  it('negative', () => {
    expect(ms('-2h')).toBe(-2 * MS.h)
  })
  it('rejects empty / garbage / partial junk', () => {
    expect(parseDuration('').ok).toBe(false)
    expect(parseDuration('abc').ok).toBe(false)
    expect(parseDuration('2x').ok).toBe(false)
    expect(parseDuration('2h garbage').ok).toBe(false)
  })
})

describe('toUnit / toAllUnits', () => {
  it('converts ms to unit', () => {
    expect(toUnit(MS.h, 'm')).toBe(60)
    expect(toUnit(MS.d, 'h')).toBe(24)
  })
  it('toAllUnits table', () => {
    const all = toAllUnits(MS.h)
    expect(all.m).toBe(60)
    expect(all.s).toBe(3600)
    expect(all.h).toBe(1)
  })
})

describe('humanize', () => {
  it('compact multi-unit', () => {
    expect(humanize(2 * MS.h + 2 * MS.m)).toBe('2h 2m')
    expect(humanize(MS.d + MS.h)).toBe('1d 1h')
  })
  it('zero', () => {
    expect(humanize(0)).toBe('0s')
  })
  it('maxUnits truncates', () => {
    expect(humanize(MS.d + 2 * MS.h + 30 * MS.m, { maxUnits: 1 })).toBe('1d')
    expect(humanize(MS.d + 2 * MS.h + 30 * MS.m, { maxUnits: 2 })).toBe('1d 2h')
  })
  it('includeMs', () => {
    expect(humanize(1500, { includeMs: true })).toBe('1s 500ms')
  })
  it('negative keeps sign', () => {
    expect(humanize(-MS.h)).toBe('-1h')
  })
})

describe('clockFormat', () => {
  it('HH:MM:SS', () => {
    expect(clockFormat(MS.h + 2 * MS.m + 3 * MS.s)).toBe('01:02:03')
  })
  it('hours can exceed 24', () => {
    expect(clockFormat(30 * MS.h)).toBe('30:00:00')
  })
  it('negative sign', () => {
    expect(clockFormat(-MS.m)).toBe('-00:01:00')
  })
})

describe('addToDate', () => {
  it('adds ms to a base date', () => {
    const base = new Date('2026-01-01T00:00:00Z')
    expect(addToDate(base, MS.d).toISOString()).toBe('2026-01-02T00:00:00.000Z')
  })
  it('subtracts with negative', () => {
    const base = new Date('2026-01-02T00:00:00Z')
    expect(addToDate(base, -MS.d).toISOString()).toBe('2026-01-01T00:00:00.000Z')
  })
})

describe('round-trip parse → humanize', () => {
  it('1d2h30m', () => {
    expect(humanize(ms('1d2h30m'))).toBe('1d 2h 30m')
  })
})
