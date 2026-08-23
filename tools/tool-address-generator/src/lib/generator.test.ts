import { describe, expect, it } from 'vitest'
import { generateAddresses, normalizeSeed } from './generator'

describe('normalizeSeed', () => {
  it('normalizes the same text seed deterministically', () => {
    expect(normalizeSeed('checkout-regression-001')).toBe(normalizeSeed('checkout-regression-001'))
    expect(normalizeSeed('checkout-regression-001')).not.toBe(normalizeSeed('checkout-regression-002'))
  })
})

describe('generateAddresses', () => {
  it('reproduces the same structured records with the same inputs', async () => {
    const options = { countryCode: 'US', count: 8, seed: 'release-42', language: 'en' as const }
    expect(await generateAddresses(options)).toEqual(await generateAddresses(options))
  })

  it('changes records when the seed changes', async () => {
    const common = { countryCode: 'DE', count: 4, language: 'en' as const }
    expect(await generateAddresses({ ...common, seed: 'alpha' })).not.toEqual(
      await generateAddresses({ ...common, seed: 'beta' }),
    )
  })

  it('reproduces random-country selection without Math.random', async () => {
    const options = {
      countryCode: 'CN',
      count: 16,
      seed: 'global-smoke',
      randomCountry: true,
      language: 'zh' as const,
    }
    const first = await generateAddresses(options)
    const second = await generateAddresses(options)

    expect(second).toEqual(first)
    expect(new Set(first.map((address) => address.countryCode)).size).toBeGreaterThan(1)
  })

  it('uses representative local ordering without leaking empty placeholders', async () => {
    const china = (await generateAddresses({ countryCode: 'CN', count: 1, seed: 'cn', language: 'zh' }))[0]
    const japan = (await generateAddresses({ countryCode: 'JP', count: 1, seed: 'jp', language: 'zh' }))[0]
    const us = (await generateAddresses({ countryCode: 'US', count: 1, seed: 'us', language: 'en' }))[0]
    const uk = (await generateAddresses({ countryCode: 'GB', count: 1, seed: 'uk', language: 'en' }))[0]
    const germany = (await generateAddresses({ countryCode: 'DE', count: 1, seed: 'de', language: 'en' }))[0]
    const brazil = (await generateAddresses({ countryCode: 'BR', count: 1, seed: 'br', language: 'en' }))[0]
    const india = (await generateAddresses({ countryCode: 'IN', count: 1, seed: 'in', language: 'en' }))[0]

    expect(china.formatted.split('\n').at(-1)).toBe('中国')
    expect(japan.formatted.startsWith('〒')).toBe(true)
    expect(us.formatted).toContain('United States')
    expect(uk.formatted.split('\n').at(-1)).toBe('United Kingdom')
    expect(germany.formatted).toContain('Germany')
    expect(brazil.formatted).toContain('Brazil')
    expect(india.formatted).toContain('India')

    for (const record of [china, japan, us, uk, germany, brazil, india]) {
      expect(record.formatted).not.toMatch(/undefined|null/)
      expect(record.formatted).not.toMatch(/^\s*$|\n\s*\n/)
    }
  })

  it('clamps the requested quantity to the supported range', async () => {
    expect(await generateAddresses({ countryCode: 'US', count: 0, seed: 'min' })).toHaveLength(1)
    expect(await generateAddresses({ countryCode: 'US', count: 999, seed: 'max' })).toHaveLength(50)
  })
})
