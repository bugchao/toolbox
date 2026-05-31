import { describe, it, expect } from 'vitest'
import { hexToRgb, toRgba, layerToCss, layersToCss, layersToTailwind, type ShadowLayer } from './shadow'

const baseLayer = (overrides: Partial<ShadowLayer> = {}): ShadowLayer => ({
  id: 'a',
  x: 0,
  y: 4,
  blur: 8,
  spread: 0,
  color: '#000000',
  alpha: 0.25,
  inset: false,
  ...overrides,
})

describe('hexToRgb', () => {
  it('parses 6-digit hex', () => {
    expect(hexToRgb('#ffcc00')).toEqual([255, 204, 0])
  })
  it('parses 3-digit hex', () => {
    expect(hexToRgb('#fc0')).toEqual([255, 204, 0])
  })
  it('falls back to black on invalid input', () => {
    expect(hexToRgb('xyz')).toEqual([0, 0, 0])
    expect(hexToRgb('')).toEqual([0, 0, 0])
  })
})

describe('toRgba', () => {
  it('formats with alpha=1', () => {
    expect(toRgba('#ffffff', 1)).toBe('rgba(255, 255, 255, 1)')
  })
  it('formats with alpha=0', () => {
    expect(toRgba('#000000', 0)).toBe('rgba(0, 0, 0, 0)')
  })
  it('strips trailing zeros from fractional alpha', () => {
    expect(toRgba('#000000', 0.5)).toBe('rgba(0, 0, 0, 0.5)')
    expect(toRgba('#000000', 0.25)).toBe('rgba(0, 0, 0, 0.25)')
  })
  it('clamps alpha outside 0..1', () => {
    expect(toRgba('#000000', 1.4)).toBe('rgba(0, 0, 0, 1)')
    expect(toRgba('#000000', -0.2)).toBe('rgba(0, 0, 0, 0)')
  })
})

describe('layerToCss', () => {
  it('non-inset layer', () => {
    expect(layerToCss(baseLayer({ x: 2, y: 4, blur: 8, spread: 0 }))).toBe(
      '2px 4px 8px 0px rgba(0, 0, 0, 0.25)',
    )
  })
  it('inset layer is prefixed', () => {
    expect(layerToCss(baseLayer({ inset: true }))).toMatch(/^inset /)
  })
})

describe('layersToCss', () => {
  it('joins multiple layers with ", "', () => {
    const css = layersToCss([
      baseLayer({ id: 'a', y: 2 }),
      baseLayer({ id: 'b', y: 6, alpha: 0.5 }),
    ])
    // 每层各含一个 rgba(...)；层之间用 ", " 分隔。
    expect(css.match(/rgba\(/g)).toHaveLength(2)
    expect(css.split(/\), /)).toHaveLength(2)
    expect(css).toContain('rgba(0, 0, 0, 0.25)')
    expect(css).toContain('rgba(0, 0, 0, 0.5)')
  })
  it('returns "none" when empty', () => {
    expect(layersToCss([])).toBe('none')
  })
  it('preserves layer order', () => {
    const css = layersToCss([
      baseLayer({ id: 'a', y: 1 }),
      baseLayer({ id: 'b', y: 99 }),
    ])
    expect(css.indexOf('1px')).toBeLessThan(css.indexOf('99px'))
  })
})

describe('layersToTailwind', () => {
  it('wraps value in [box-shadow:...] with underscores for spaces', () => {
    const tw = layersToTailwind([baseLayer({ y: 4 })])
    expect(tw.startsWith('[box-shadow:')).toBe(true)
    expect(tw.endsWith(']')).toBe(true)
    expect(tw).not.toMatch(/ /)
  })
})
