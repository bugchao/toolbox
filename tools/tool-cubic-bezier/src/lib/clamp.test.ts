import { describe, it, expect } from 'vitest'
import { clamp, clamp01, roundTo } from './clamp'

describe('clamp', () => {
  it('returns n when inside range', () => {
    expect(clamp(0.5, 0, 1)).toBe(0.5)
    expect(clamp(-3, -5, 5)).toBe(-3)
  })

  it('clamps to min / max at the boundary', () => {
    expect(clamp(2, 0, 1)).toBe(1)
    expect(clamp(-2, 0, 1)).toBe(0)
    expect(clamp(0, 0, 1)).toBe(0)
    expect(clamp(1, 0, 1)).toBe(1)
  })

  it('handles reversed range (min > max) by auto-swapping', () => {
    expect(clamp(0.5, 1, 0)).toBe(0.5)
    expect(clamp(2, 1, 0)).toBe(1)
    expect(clamp(-1, 1, 0)).toBe(0)
  })

  it('NaN degrades to min', () => {
    expect(clamp(NaN, 0, 1)).toBe(0)
    expect(clamp(NaN, -10, 10)).toBe(-10)
  })

  it('Infinity clamps to the relevant boundary', () => {
    expect(clamp(Infinity, 0, 1)).toBe(1)
    expect(clamp(-Infinity, 0, 1)).toBe(0)
  })

  it('rejects non-number types (TS belt-and-suspenders)', () => {
    expect(clamp('1.5' as unknown as number, 0, 1)).toBe(0)
  })
})

describe('clamp01', () => {
  it('keeps numbers inside [0, 1]', () => {
    expect(clamp01(0.5)).toBe(0.5)
    expect(clamp01(0)).toBe(0)
    expect(clamp01(1)).toBe(1)
  })
  it('clamps out-of-range', () => {
    expect(clamp01(1.5)).toBe(1)
    expect(clamp01(-0.3)).toBe(0)
  })
})

describe('roundTo', () => {
  it('rounds to given decimal places', () => {
    expect(roundTo(0.123456, 2)).toBe(0.12)
    expect(roundTo(0.125, 2)).toBe(0.13)
    expect(roundTo(0.4242, 0)).toBe(0)
  })
  it('returns 0 for non-finite values', () => {
    expect(roundTo(NaN, 2)).toBe(0)
    expect(roundTo(Infinity, 2)).toBe(0)
  })
})
