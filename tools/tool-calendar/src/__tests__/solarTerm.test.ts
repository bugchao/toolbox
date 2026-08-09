import { describe, it, expect } from 'vitest'
import { getSolarTerm } from '../lib/solarTerm'

describe('getSolarTerm', () => {
  it('matches known 2024 solstices and equinoxes within ±1 day', () => {
    const near = (d: Date, expectedName: string) => {
      for (let offset = -1; offset <= 1; offset++) {
        const probe = new Date(d)
        probe.setDate(probe.getDate() + offset)
        if (getSolarTerm(probe) === expectedName) return true
      }
      return false
    }
    expect(near(new Date(2024, 1, 4), '立春')).toBe(true)
    expect(near(new Date(2024, 2, 20), '春分')).toBe(true)
    expect(near(new Date(2024, 5, 21), '夏至')).toBe(true)
    expect(near(new Date(2024, 8, 22), '秋分')).toBe(true)
    expect(near(new Date(2024, 11, 21), '冬至')).toBe(true)
  })

  it('returns null for a date that is not a solar term', () => {
    expect(getSolarTerm(new Date(2024, 5, 15))).toBeNull()
  })

  it('produces 24 chronologically increasing terms within a year', () => {
    const found: Date[] = []
    const start = new Date(2024, 0, 1)
    for (let i = 0; i < 366; i++) {
      const d = new Date(start)
      d.setDate(d.getDate() + i)
      if (getSolarTerm(d)) found.push(new Date(d))
    }
    expect(found.length).toBe(24)
    for (let i = 1; i < found.length; i++) {
      expect(found[i].getTime()).toBeGreaterThan(found[i - 1].getTime())
    }
  })
})
