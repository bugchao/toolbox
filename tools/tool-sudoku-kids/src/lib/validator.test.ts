import { describe, it, expect } from 'vitest'
import { hasConflict, isComplete, isValid } from './validator'
import { SPECS } from './types'

const VALID_4 = [
  [1, 2, 3, 4],
  [3, 4, 1, 2],
  [2, 1, 4, 3],
  [4, 3, 2, 1],
]

describe('isComplete', () => {
  it('accepts a complete valid board', () => {
    expect(isComplete(VALID_4, SPECS.easy)).toBe(true)
  })

  it('rejects boards with 0', () => {
    const incomplete = VALID_4.map((r) => r.slice())
    incomplete[0][0] = 0
    expect(isComplete(incomplete, SPECS.easy)).toBe(false)
  })

  it('rejects invalid boards', () => {
    const bad = VALID_4.map((r) => r.slice())
    bad[0][0] = bad[0][1] // 同行冲突
    expect(isComplete(bad, SPECS.easy)).toBe(false)
  })
})

describe('isValid', () => {
  it('allows partial empty boards if no conflicts', () => {
    const partial = [
      [1, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]
    expect(isValid(partial, SPECS.easy)).toBe(true)
  })

  it('rejects when the same value repeats in a box', () => {
    const bad = [
      [1, 2, 0, 0],
      [2, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]
    expect(isValid(bad, SPECS.easy)).toBe(false)
  })
})

describe('hasConflict', () => {
  it('returns false for empty cell value 0', () => {
    expect(hasConflict(VALID_4, 0, 0, 0, SPECS.easy)).toBe(false)
  })

  it('detects row conflict', () => {
    const b = [
      [1, 2, 3, 4],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]
    expect(hasConflict(b, 0, 1, 1, SPECS.easy)).toBe(true)
  })

  it('detects column conflict', () => {
    const b = [
      [1, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]
    expect(hasConflict(b, 1, 0, 1, SPECS.easy)).toBe(true)
  })

  it('detects box conflict', () => {
    const b = [
      [1, 2, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]
    expect(hasConflict(b, 1, 0, 2, SPECS.easy)).toBe(true)
  })
})
