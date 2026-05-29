import { describe, it, expect } from 'vitest'
import {
  adjustForegroundToRatio,
  contrastRatio,
  gradeContrast,
  parseHex,
  relativeLuminance,
  toHex,
} from './contrast'

describe('parseHex', () => {
  it('parses 6-digit hex with #', () => {
    expect(parseHex('#ff8800')).toEqual({ r: 255, g: 136, b: 0 })
  })

  it('parses 6-digit hex without #', () => {
    expect(parseHex('ff8800')).toEqual({ r: 255, g: 136, b: 0 })
  })

  it('expands 3-digit hex', () => {
    expect(parseHex('#f80')).toEqual({ r: 255, g: 136, b: 0 })
  })

  it('is case insensitive', () => {
    expect(parseHex('#FfA800')).toEqual({ r: 255, g: 168, b: 0 })
  })

  it('returns null for invalid input', () => {
    expect(parseHex('not-a-color')).toBeNull()
    expect(parseHex('#12')).toBeNull()
    expect(parseHex('#1234567')).toBeNull()
  })
})

describe('toHex', () => {
  it('formats with leading zeros', () => {
    expect(toHex({ r: 0, g: 8, b: 255 })).toBe('#0008ff')
  })

  it('clamps out-of-range values', () => {
    expect(toHex({ r: -10, g: 300, b: 128 })).toBe('#00ff80')
  })
})

describe('relativeLuminance', () => {
  it('returns 0 for black', () => {
    expect(relativeLuminance({ r: 0, g: 0, b: 0 })).toBe(0)
  })

  it('returns 1 for white', () => {
    expect(relativeLuminance({ r: 255, g: 255, b: 255 })).toBeCloseTo(1, 5)
  })
})

describe('contrastRatio', () => {
  it('is 21 for black on white', () => {
    const ratio = contrastRatio({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 })
    expect(ratio).toBeCloseTo(21, 0)
  })

  it('is 1 for identical colors', () => {
    const ratio = contrastRatio({ r: 123, g: 45, b: 67 }, { r: 123, g: 45, b: 67 })
    expect(ratio).toBeCloseTo(1, 5)
  })

  it('is symmetric (foreground/background order does not matter)', () => {
    const a = { r: 30, g: 30, b: 30 }
    const b = { r: 200, g: 200, b: 200 }
    expect(contrastRatio(a, b)).toBeCloseTo(contrastRatio(b, a), 5)
  })
})

describe('gradeContrast', () => {
  it('passes all at 21:1', () => {
    const g = gradeContrast(21)
    expect(g).toEqual({
      aaLarge: true,
      aaNormal: true,
      aaaLarge: true,
      aaaNormal: true,
      aaUi: true,
    })
  })

  it('fails AAA normal at 4.5', () => {
    const g = gradeContrast(4.5)
    expect(g.aaNormal).toBe(true)
    expect(g.aaaNormal).toBe(false)
    expect(g.aaaLarge).toBe(true)
  })

  it('fails everything at 1.5', () => {
    const g = gradeContrast(1.5)
    expect(g.aaNormal).toBe(false)
    expect(g.aaLarge).toBe(false)
    expect(g.aaUi).toBe(false)
  })
})

describe('adjustForegroundToRatio', () => {
  it('reaches AA (≥4.5) for a low-contrast pair', () => {
    const fg = parseHex('#888888')!
    const bg = parseHex('#999999')!
    const fixed = adjustForegroundToRatio(fg, bg, 4.5)
    expect(contrastRatio(fixed, bg)).toBeGreaterThanOrEqual(4.5)
  })

  it('reaches AAA (≥7) for a low-contrast pair', () => {
    const fg = parseHex('#5577aa')!
    const bg = parseHex('#ffffff')!
    const fixed = adjustForegroundToRatio(fg, bg, 7)
    expect(contrastRatio(fixed, bg)).toBeGreaterThanOrEqual(7)
  })
})
