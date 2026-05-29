import { describe, it, expect } from 'vitest'
import { pageDimensions, MARGIN_MM } from './pageSize'

describe('pageDimensions', () => {
  it('returns A4 portrait by default', () => {
    expect(pageDimensions('a4', 'portrait')).toEqual({ width: 210, height: 297 })
  })

  it('swaps dimensions for landscape', () => {
    expect(pageDimensions('a4', 'landscape')).toEqual({ width: 297, height: 210 })
  })

  it('returns Letter mm', () => {
    expect(pageDimensions('letter', 'portrait').width).toBeCloseTo(215.9, 3)
    expect(pageDimensions('letter', 'portrait').height).toBeCloseTo(279.4, 3)
  })

  it('fit mode respects landscape image', () => {
    const d = pageDimensions('fit', 'portrait', { width: 1600, height: 900 })
    expect(d.width).toBeCloseTo(297, 3)
    expect(d.height).toBeCloseTo((297 * 900) / 1600, 3)
  })

  it('fit mode respects portrait image', () => {
    const d = pageDimensions('fit', 'portrait', { width: 600, height: 900 })
    expect(d.height).toBeCloseTo(297, 3)
    expect(d.width).toBeCloseTo((297 * 600) / 900, 3)
  })

  it('fit without dimensions falls back to A4', () => {
    expect(pageDimensions('fit', 'portrait')).toEqual({ width: 210, height: 297 })
  })
})

describe('MARGIN_MM', () => {
  it('exposes ordered margins', () => {
    expect(MARGIN_MM.none).toBe(0)
    expect(MARGIN_MM.small).toBeLessThan(MARGIN_MM.medium)
    expect(MARGIN_MM.medium).toBeLessThan(MARGIN_MM.large)
  })
})
