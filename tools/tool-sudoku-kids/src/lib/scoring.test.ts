import { describe, it, expect } from 'vitest'
import { computeStars } from './scoring'

describe('computeStars', () => {
  it('returns 3 for no errors and no hints', () => {
    expect(computeStars(0, 0)).toBe(3)
  })

  it('returns 2 with one penalty', () => {
    expect(computeStars(1, 0)).toBe(2)
    expect(computeStars(0, 1)).toBe(2)
  })

  it('returns 1 floor', () => {
    expect(computeStars(2, 0)).toBe(1)
    expect(computeStars(10, 10)).toBe(1)
  })
})
