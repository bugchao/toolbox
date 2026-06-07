import { describe, it, expect } from 'vitest'
import {
  bezierAt,
  formatCss,
  sampleCurve,
  sanitizePoint,
  toControlPoints,
  toTuple,
  X_MAX,
  X_MIN,
  Y_MAX,
  Y_MIN,
} from './bezier'

const linearP1 = { x: 0, y: 0 }
const linearP2 = { x: 1, y: 1 }
const easeP1 = { x: 0.42, y: 0 }
const easeP2 = { x: 0.58, y: 1 }

describe('bezierAt', () => {
  it('returns (0, 0) at t=0 for any control points', () => {
    expect(bezierAt(0, easeP1, easeP2)).toEqual({ x: 0, y: 0 })
    expect(bezierAt(0, { x: 0.9, y: -0.3 }, { x: 0.1, y: 1.4 })).toEqual({ x: 0, y: 0 })
  })

  it('returns (1, 1) at t=1 for any control points', () => {
    const r = bezierAt(1, easeP1, easeP2)
    expect(r.x).toBeCloseTo(1, 10)
    expect(r.y).toBeCloseTo(1, 10)
  })

  it('linear control points keep x === y on the curve (i.e. CSS linear easing)', () => {
    // 注意：cubic-bezier(0,0,1,1) 在 (x,y) 空间是直线 y=x，但参数 t 与 x 不是同一个量。
    // 我们要保证 y(x) 是线性的，所以 x === y 在曲线上始终成立。
    for (const t of [0.1, 0.25, 0.5, 0.75, 0.9]) {
      const r = bezierAt(t, linearP1, linearP2)
      expect(r.y).toBeCloseTo(r.x, 10)
    }
  })

  it('symmetric ease-in-out curve hits (0.5, 0.5) at t=0.5', () => {
    const r = bezierAt(0.5, easeP1, easeP2)
    expect(r.x).toBeCloseTo(0.5, 6)
    expect(r.y).toBeCloseTo(0.5, 6)
  })

  it('t=0.5 with overshoot preset still returns reasonable middle position', () => {
    // easeOutBack-ish: 控制点带 overshoot
    const r = bezierAt(0.5, { x: 0.175, y: 0.885 }, { x: 0.32, y: 1.275 })
    expect(r.x).toBeGreaterThan(0)
    expect(r.x).toBeLessThan(1)
    expect(r.y).toBeGreaterThan(0.5) // overshoot 曲线在 t=0.5 时已经过半
  })

  it('clamps t outside [0, 1]', () => {
    expect(bezierAt(-1, easeP1, easeP2)).toEqual({ x: 0, y: 0 })
    const r = bezierAt(2, easeP1, easeP2)
    expect(r.x).toBeCloseTo(1, 10)
    expect(r.y).toBeCloseTo(1, 10)
  })

  it('does not crash on NaN / Infinity inputs', () => {
    const r1 = bezierAt(NaN, easeP1, easeP2)
    expect(Number.isFinite(r1.x)).toBe(true)
    expect(Number.isFinite(r1.y)).toBe(true)

    const r2 = bezierAt(0.5, { x: NaN, y: Infinity }, { x: -Infinity, y: NaN })
    expect(Number.isFinite(r2.x)).toBe(true)
    expect(Number.isFinite(r2.y)).toBe(true)
  })
})

describe('formatCss', () => {
  it('returns CSS cubic-bezier(...) string with 2-decimal precision', () => {
    expect(formatCss(easeP1, easeP2)).toBe('cubic-bezier(0.42, 0.00, 0.58, 1.00)')
  })

  it('rounds to 2 decimals', () => {
    expect(formatCss({ x: 0.123456, y: 0.789 }, { x: 0.5, y: 0.25 })).toBe(
      'cubic-bezier(0.12, 0.79, 0.50, 0.25)'
    )
  })

  it('clamps NaN / Infinity into the safe range', () => {
    const css = formatCss({ x: NaN, y: Infinity }, { x: -Infinity, y: 0.5 })
    expect(css).toMatch(/^cubic-bezier\(-?\d+\.\d{2}, -?\d+\.\d{2}, -?\d+\.\d{2}, -?\d+\.\d{2}\)$/)
    expect(css).not.toContain('NaN')
    expect(css).not.toContain('Infinity')
  })
})

describe('sanitizePoint', () => {
  it('clamps x to [0, 1]', () => {
    expect(sanitizePoint({ x: 2, y: 0.5 }).x).toBe(X_MAX)
    expect(sanitizePoint({ x: -1, y: 0.5 }).x).toBe(X_MIN)
  })
  it('clamps y to [-0.5, 1.5] (allows overshoot)', () => {
    expect(sanitizePoint({ x: 0.5, y: 5 }).y).toBe(Y_MAX)
    expect(sanitizePoint({ x: 0.5, y: -5 }).y).toBe(Y_MIN)
    expect(sanitizePoint({ x: 0.5, y: 1.4 }).y).toBe(1.4)
  })
})

describe('sampleCurve', () => {
  it('produces samples+1 points including both endpoints', () => {
    const pts = sampleCurve(easeP1, easeP2, 8)
    expect(pts).toHaveLength(9)
    expect(pts[0]).toEqual({ x: 0, y: 0 })
    expect(pts[pts.length - 1].x).toBeCloseTo(1, 10)
  })

  it('coerces tiny / invalid sample counts to a sane minimum', () => {
    const pts = sampleCurve(linearP1, linearP2, 1)
    expect(pts.length).toBeGreaterThanOrEqual(3)
  })
})

describe('toControlPoints / toTuple', () => {
  it('round-trips', () => {
    const tuple = [0.42, 0, 0.58, 1] as const
    expect(toTuple(toControlPoints(tuple))).toEqual([0.42, 0, 0.58, 1])
  })
})
