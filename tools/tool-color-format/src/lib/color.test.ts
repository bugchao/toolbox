import { describe, it, expect } from 'vitest'
import {
  contrast,
  contrastHints,
  formatAll,
  fromHsl,
  isInP3Gamut,
  isInSrgbGamut,
  parseColor,
  toHex,
  toHsl,
  toLch,
  toOklch,
  toRgb,
  tryNamedColor,
  verdict,
} from './color'

const must = (input: string) => {
  const r = parseColor(input)
  if (!r.ok) throw new Error(`parse failed: ${input} — ${r.message}`)
  return r.color
}

describe('parseColor', () => {
  it('parses hex / rgb / hsl / named / oklch / lab', () => {
    expect(parseColor('#ff0000').ok).toBe(true)
    expect(parseColor('rgb(255 0 0)').ok).toBe(true)
    expect(parseColor('hsl(0 100% 50%)').ok).toBe(true)
    expect(parseColor('red').ok).toBe(true)
    expect(parseColor('oklch(0.628 0.258 29)').ok).toBe(true)
    expect(parseColor('lab(54 81 70)').ok).toBe(true)
  })

  it('rejects garbage / empty', () => {
    expect(parseColor('').ok).toBe(false)
    expect(parseColor('not-a-color').ok).toBe(false)
  })

  it('records alpha when input has it', () => {
    const r = parseColor('rgba(255,0,0,0.5)')
    expect(r.ok && r.alpha).toBeCloseTo(0.5, 3)
  })
})

describe('toHex', () => {
  it('formats RGB to hex', () => {
    expect(toHex(must('rgb(255 0 0)'))).toBe('#ff0000')
    expect(toHex(must('rgb(0 128 0)'))).toBe('#008000')
  })

  it('uses 8-char hex when alpha < 1', () => {
    const h = toHex(must('rgba(255 0 0 / 0.5)'))
    expect(h).toMatch(/^#ff000080$/)
  })
})

describe('toRgb / toHsl', () => {
  it('round-trips a fully saturated red', () => {
    const c = must('#ff0000')
    expect(toRgb(c)).toBe('rgb(255 0 0)')
    expect(toHsl(c)).toMatch(/^hsl\(0 100% 50%\)$/)
  })

  it('keeps alpha visible in slash form', () => {
    const c = must('rgba(255, 0, 0, 0.25)')
    expect(toRgb(c)).toContain('/')
    expect(toRgb(c)).toContain('0.25')
  })
})

describe('toLch / toOklch', () => {
  it('produces L C H triples within reasonable bounds for red', () => {
    const c = must('#ff0000')
    const lch = toLch(c)
    expect(lch.startsWith('lch(')).toBe(true)
    // red 的 LCH 大致：L≈54, C≈106, H≈40
    expect(lch).toMatch(/lch\(5[0-9](\.\d+)? \d+/)

    const oklch = toOklch(c)
    expect(oklch.startsWith('oklch(')).toBe(true)
    // 0 < L < 1，OKLCH L 在 0..1
    expect(oklch).toMatch(/oklch\(0\.\d+ /)
  })
})

describe('formatAll', () => {
  it('returns 8 formats for a basic color', () => {
    const all = formatAll(must('#3366cc'))
    expect(Object.keys(all).sort()).toEqual(
      ['hex', 'hsl', 'hwb', 'lab', 'lch', 'oklab', 'oklch', 'rgb'].sort(),
    )
    for (const v of Object.values(all)) {
      expect(typeof v).toBe('string')
      expect(v.length).toBeGreaterThan(0)
    }
  })
})

describe('contrast / verdict', () => {
  it('white vs black is the max contrast (21)', () => {
    expect(contrast(must('#ffffff'), must('#000000'))).toBeCloseTo(21, 1)
  })

  it('verdict bins are correct', () => {
    expect(verdict(21)).toBe('AAA')
    expect(verdict(7)).toBe('AAA')
    expect(verdict(4.5)).toBe('AA')
    expect(verdict(3)).toBe('AA-large')
    expect(verdict(2.9)).toBe('fail')
  })

  it('contrastHints surfaces both white and black ratios', () => {
    const h = contrastHints(must('#808080'))
    expect(h.vsWhite.ratio).toBeGreaterThan(1)
    expect(h.vsBlack.ratio).toBeGreaterThan(1)
    expect(['fail', 'AA-large', 'AA', 'AAA']).toContain(h.vsWhite.verdict)
  })
})

describe('gamut checks', () => {
  it('classic sRGB red is in sRGB and P3', () => {
    const c = must('#ff0000')
    expect(isInSrgbGamut(c)).toBe(true)
    expect(isInP3Gamut(c)).toBe(true)
  })

  it('vivid oklch outside sRGB gets caught', () => {
    // OKLCH with extreme chroma — typically out of sRGB
    const c = must('oklch(0.7 0.4 30)')
    expect(isInSrgbGamut(c)).toBe(false)
  })
})

describe('tryNamedColor', () => {
  it('maps common colors back to their name', () => {
    expect(tryNamedColor(must('#ff0000'))).toBe('red')
    expect(tryNamedColor(must('#000000'))).toBe('black')
    expect(tryNamedColor(must('#0000ff'))).toBe('blue')
  })

  it('returns null when no exact named match', () => {
    expect(tryNamedColor(must('#abcdef'))).toBeNull()
  })
})

describe('fromHsl', () => {
  it('builds a color whose HSL output round-trips', () => {
    const c = fromHsl(120, 0.5, 0.5)
    expect(toHsl(c)).toMatch(/^hsl\(120 50% 50%\)$/)
  })
})
