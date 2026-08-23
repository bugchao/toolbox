import { describe, expect, it } from 'vitest'
import { COUNTRY_PROFILES, findCountryProfile, getDefaultCountryCode } from './countries'

describe('country profiles', () => {
  it('contains at least 50 unique country or region profiles', () => {
    expect(COUNTRY_PROFILES.length).toBeGreaterThanOrEqual(50)
    expect(new Set(COUNTRY_PROFILES.map((profile) => profile.code)).size).toBe(COUNTRY_PROFILES.length)
  })

  it('has complete searchable metadata and a localized faker for every profile', async () => {
    for (const profile of COUNTRY_PROFILES) {
      expect(profile.code).toMatch(/^[A-Z]{2}$/)
      expect(profile.nameZh).not.toBe('')
      expect(profile.nameEn).not.toBe('')
      expect(profile.nativeName).not.toBe('')
      expect(profile.locale).not.toBe('')
      const faker = await profile.loadFaker()
      expect(typeof faker.location.streetAddress).toBe('function')
    }
  })

  it('uses China for Chinese UI and the US for English UI', () => {
    expect(getDefaultCountryCode('zh-CN')).toBe('CN')
    expect(getDefaultCountryCode('en-US')).toBe('US')
    expect(findCountryProfile('JP')?.nameZh).toBe('日本')
  })
})
