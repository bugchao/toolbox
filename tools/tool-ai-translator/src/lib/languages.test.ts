import { describe, it, expect } from 'vitest'
import { LANGUAGES, getLang } from './languages'

describe('LANGUAGES', () => {
  it('codes are unique', () => {
    const codes = LANGUAGES.map((l) => l.code)
    expect(new Set(codes).size).toBe(codes.length)
  })

  it('includes the must-have set', () => {
    const codes = LANGUAGES.map((l) => l.code)
    for (const must of ['auto', 'zh', 'en', 'ja', 'ko']) {
      expect(codes).toContain(must)
    }
  })

  it('every entry has englishName for the prompt and i18nKey for UI', () => {
    for (const l of LANGUAGES) {
      expect(l.englishName.length).toBeGreaterThan(0)
      expect(l.i18nKey.startsWith('lang.')).toBe(true)
    }
  })

  it('getLang falls back to auto on unknown', () => {
    expect(getLang('zh').code).toBe('zh')
    // @ts-expect-error – intentional bad input
    expect(getLang('xyz').code).toBe('auto')
  })
})
