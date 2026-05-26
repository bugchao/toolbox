import { describe, it, expect } from 'vitest'
import { generatePuzzle, generateSolution, countSolutions } from './generator'
import { isValid, isComplete } from './validator'
import { SPECS } from './types'
import { mulberry32 } from './rng'

describe('generateSolution', () => {
  it('produces a complete valid 4x4 board', () => {
    const sol = generateSolution('easy', mulberry32(1))
    expect(isComplete(sol, SPECS.easy)).toBe(true)
  })

  it('produces a complete valid 6x6 board', () => {
    const sol = generateSolution('medium', mulberry32(42))
    expect(isComplete(sol, SPECS.medium)).toBe(true)
  })

  it('produces a complete valid 9x9 board', () => {
    const sol = generateSolution('hard', mulberry32(7))
    expect(isComplete(sol, SPECS.hard)).toBe(true)
  })

  it('same seed yields same solution', () => {
    const a = generateSolution('easy', mulberry32(123))
    const b = generateSolution('easy', mulberry32(123))
    expect(a).toEqual(b)
  })
})

describe('generatePuzzle', () => {
  it('puzzle is a valid sub-board of solution', () => {
    const { puzzle, solution } = generatePuzzle('easy', 10, 'sudoku-kids:easy:1')
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        const v = puzzle[r][c]
        if (v !== 0) expect(v).toBe(solution[r][c])
      }
    }
    expect(isValid(puzzle, SPECS.easy)).toBe(true)
  })

  it('4x4 puzzle has unique solution', () => {
    const { puzzle } = generatePuzzle('easy', 9, 'sudoku-kids:easy:2')
    expect(countSolutions(puzzle, SPECS.easy, 2)).toBe(1)
  })

  it('same seed yields identical puzzle (reproducible)', () => {
    const a = generatePuzzle('medium', 18, 'sudoku-kids:medium:5')
    const b = generatePuzzle('medium', 18, 'sudoku-kids:medium:5')
    expect(a.puzzle).toEqual(b.puzzle)
    expect(a.solution).toEqual(b.solution)
  })
})
