import { describe, it, expect } from 'vitest'
import { generate, makeRng } from './generator'

describe('makeRng', () => {
  it('is deterministic when given a seed', () => {
    const a = makeRng(42)
    const b = makeRng(42)
    for (let i = 0; i < 10; i++) {
      expect(a()).toBe(b())
    }
  })

  it('differs across seeds', () => {
    const a = makeRng(1)
    const b = makeRng(2)
    expect(a()).not.toBe(b())
  })

  it('values are in [0, 1)', () => {
    const rng = makeRng(7)
    for (let i = 0; i < 100; i++) {
      const v = rng()
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(1)
    }
  })
})

describe('generate - paragraphs', () => {
  it('returns the requested number of paragraphs', () => {
    const out = generate({ flavor: 'latin', unit: 'paragraphs', count: 5, seed: 1 })
    expect(out).toHaveLength(5)
  })

  it('first paragraph starts with classic when enabled', () => {
    const out = generate({ flavor: 'latin', unit: 'paragraphs', count: 1, startWithClassic: true, seed: 1 })
    expect(out[0]).toMatch(/^Lorem ipsum dolor sit amet/)
  })

  it('skips classic when disabled', () => {
    const out = generate({ flavor: 'latin', unit: 'paragraphs', count: 1, startWithClassic: false, seed: 1 })
    expect(out[0].startsWith('Lorem ipsum dolor sit amet')).toBe(false)
  })

  it('latin sentences end with period', () => {
    const out = generate({ flavor: 'latin', unit: 'paragraphs', count: 2, startWithClassic: false, seed: 9 })
    for (const p of out) {
      expect(p.trim().endsWith('.')).toBe(true)
    }
  })

  it('chinese uses Chinese punctuation', () => {
    const out = generate({ flavor: 'chinese', unit: 'paragraphs', count: 2, startWithClassic: false, seed: 3 })
    const joined = out.join('')
    expect(/[。？！]/.test(joined)).toBe(true)
    expect(/[a-z]/i.test(joined)).toBe(false)
  })
})

describe('generate - sentences', () => {
  it('returns a single string containing N sentences', () => {
    const out = generate({ flavor: 'latin', unit: 'sentences', count: 4, startWithClassic: false, seed: 11 })
    expect(out).toHaveLength(1)
    const periods = out[0].match(/\./g) || []
    expect(periods.length).toBeGreaterThanOrEqual(4)
  })
})

describe('generate - words', () => {
  it('returns exactly N space-separated words for latin', () => {
    const out = generate({ flavor: 'latin', unit: 'words', count: 10, seed: 22 })
    expect(out).toHaveLength(1)
    expect(out[0].split(/\s+/).length).toBe(10)
  })

  it('returns exactly N characters for chinese', () => {
    const out = generate({ flavor: 'chinese', unit: 'words', count: 12, seed: 33 })
    expect(out[0]).toHaveLength(12)
  })
})

describe('determinism', () => {
  it('same seed = same output', () => {
    const a = generate({ flavor: 'latin', unit: 'paragraphs', count: 3, seed: 100 })
    const b = generate({ flavor: 'latin', unit: 'paragraphs', count: 3, seed: 100 })
    expect(a).toEqual(b)
  })

  it('different seed = different output', () => {
    const a = generate({ flavor: 'latin', unit: 'paragraphs', count: 3, seed: 100, startWithClassic: false })
    const b = generate({ flavor: 'latin', unit: 'paragraphs', count: 3, seed: 200, startWithClassic: false })
    expect(a).not.toEqual(b)
  })
})
