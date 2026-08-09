import { describe, it, expect } from 'vitest'
import { solarToLunar } from '../lib/lunar'

describe('solarToLunar', () => {
  it('identifies the 2024 Spring Festival (甲辰年正月初一)', () => {
    const lunar = solarToLunar(new Date(2024, 1, 10))
    expect(lunar).toMatchObject({ year: 2024, month: 1, day: 1, isLeap: false })
    expect(lunar.dayName).toBe('初一')
    expect(lunar.monthName).toBe('正月')
  })

  it('marks a date inside the 2023 leap 2nd month as leap', () => {
    const lunar = solarToLunar(new Date(2023, 3, 5))
    expect(lunar.month).toBe(2)
    expect(lunar.isLeap).toBe(true)
    expect(lunar.monthName).toBe('闰二月')
  })

  it('reports the lunar year of the previous Gregorian year before Chinese New Year', () => {
    const lunar = solarToLunar(new Date(2024, 0, 1))
    expect(lunar.year).toBe(2023)
  })

  it('formats day names across the month', () => {
    expect(solarToLunar(new Date(2024, 1, 10)).dayName).toBe('初一')
    expect(solarToLunar(new Date(2024, 1, 24)).dayName).toBe('十五')
  })
})
