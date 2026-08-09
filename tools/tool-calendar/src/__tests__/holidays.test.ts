import { describe, it, expect } from 'vitest'
import { getFestival } from '../lib/holidays'
import { solarToLunar } from '../lib/lunar'

function festivalFor(date: Date): string | null {
  return getFestival(date, solarToLunar(date))
}

describe('getFestival', () => {
  it('identifies a fixed Gregorian holiday (New Year)', () => {
    expect(festivalFor(new Date(2024, 0, 1))).toBe('元旦')
  })

  it('identifies Spring Festival by lunar date', () => {
    expect(festivalFor(new Date(2024, 1, 10))).toBe('春节')
  })

  it('identifies Lantern Festival by lunar date', () => {
    expect(festivalFor(new Date(2024, 1, 24))).toBe('元宵节')
  })

  it('identifies Chuxi (lunar New Year\'s Eve) as the day before Spring Festival', () => {
    expect(festivalFor(new Date(2024, 1, 9))).toBe('除夕')
  })

  it('returns null for an ordinary day', () => {
    expect(festivalFor(new Date(2024, 5, 15))).toBeNull()
  })

  it('does not match a lunar festival that falls in a leap month', () => {
    // 2023 leap 2nd month day 5 should not accidentally read as some other festival
    const d = new Date(2023, 3, 9)
    const lunar = solarToLunar(d)
    expect(lunar.isLeap).toBe(true)
    expect(getFestival(d, lunar)).toBeNull()
  })
})
