import { describe, it, expect } from 'vitest'
import { containFit, slotBoxes } from './layout'

describe('slotBoxes', () => {
  it('single slot uses full page minus margin', () => {
    const [s] = slotBoxes(210, 297, 10, 1)
    expect(s).toEqual({ x: 10, y: 10, w: 190, h: 277 })
  })

  it('two slots split vertically with gap', () => {
    const slots = slotBoxes(210, 297, 10, 2, 4)
    expect(slots).toHaveLength(2)
    expect(slots[0].w).toBe(190)
    expect(slots[1].y).toBeCloseTo(10 + slots[0].h + 4, 3)
    expect(slots[0].h + slots[1].h + 4).toBeCloseTo(277, 3)
  })

  it('four slots in 2x2', () => {
    const slots = slotBoxes(210, 297, 10, 4, 4)
    expect(slots).toHaveLength(4)
    expect(slots[0].x).toBe(10)
    expect(slots[1].x).toBeCloseTo(10 + slots[0].w + 4, 3)
    expect(slots[3].y).toBeCloseTo(10 + slots[0].h + 4, 3)
  })
})

describe('containFit', () => {
  it('centers a square in a wide box', () => {
    const fit = containFit({ x: 0, y: 0, w: 200, h: 100 }, 100, 100)
    expect(fit.w).toBe(100)
    expect(fit.h).toBe(100)
    expect(fit.x).toBe(50)
    expect(fit.y).toBe(0)
  })

  it('centers a tall image in a square box', () => {
    const fit = containFit({ x: 10, y: 10, w: 100, h: 100 }, 50, 200)
    expect(fit.w).toBe(25)
    expect(fit.h).toBe(100)
    expect(fit.x).toBeCloseTo(10 + (100 - 25) / 2, 3)
    expect(fit.y).toBe(10)
  })

  it('handles degenerate dimensions safely', () => {
    expect(containFit({ x: 0, y: 0, w: 0, h: 0 }, 100, 100)).toEqual({
      x: 0,
      y: 0,
      w: 0,
      h: 0,
    })
  })
})
