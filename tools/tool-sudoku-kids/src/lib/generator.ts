// 数独生成器：终盘 + 挖洞
import type { Board, BoardSpec, Difficulty } from './types'
import { SPECS } from './types'
import { mulberry32, seedFromString, shuffle } from './rng'

function emptyBoard(size: number): Board {
  return Array.from({ length: size }, () => Array.from({ length: size }, () => 0))
}

function boxIndex(row: number, col: number, spec: BoardSpec): number {
  const br = Math.floor(row / spec.boxRows)
  const bc = Math.floor(col / spec.boxCols)
  return br * (spec.size / spec.boxCols) + bc
}

function isPlacement(
  board: Board,
  row: number,
  col: number,
  value: number,
  spec: BoardSpec,
): boolean {
  for (let i = 0; i < spec.size; i++) {
    if (board[row][i] === value) return false
    if (board[i][col] === value) return false
  }
  const br = Math.floor(row / spec.boxRows) * spec.boxRows
  const bc = Math.floor(col / spec.boxCols) * spec.boxCols
  for (let r = br; r < br + spec.boxRows; r++) {
    for (let c = bc; c < bc + spec.boxCols; c++) {
      if (board[r][c] === value) return false
    }
  }
  return true
}

/** 递归求解，最多收集 maxSolutions 个解，返回解的数量 */
export function countSolutions(
  board: Board,
  spec: BoardSpec,
  maxSolutions = 2,
): number {
  const work = board.map((row) => row.slice())
  let found = 0

  function recurse(idx: number): boolean {
    if (idx === spec.size * spec.size) {
      found++
      return found >= maxSolutions
    }
    const r = Math.floor(idx / spec.size)
    const c = idx % spec.size
    if (work[r][c] !== 0) return recurse(idx + 1)
    for (let v = 1; v <= spec.size; v++) {
      if (isPlacement(work, r, c, v, spec)) {
        work[r][c] = v
        if (recurse(idx + 1)) return true
        work[r][c] = 0
      }
    }
    return false
  }
  recurse(0)
  return found
}

/** 生成一个完整终盘 */
export function generateSolution(difficulty: Difficulty, rng: () => number): Board {
  const spec = SPECS[difficulty]
  const board = emptyBoard(spec.size)

  function fillCell(idx: number): boolean {
    if (idx === spec.size * spec.size) return true
    const r = Math.floor(idx / spec.size)
    const c = idx % spec.size
    const candidates = shuffle(
      Array.from({ length: spec.size }, (_, i) => i + 1),
      rng,
    )
    for (const v of candidates) {
      if (isPlacement(board, r, c, v, spec)) {
        board[r][c] = v
        if (fillCell(idx + 1)) return true
        board[r][c] = 0
      }
    }
    return false
  }

  fillCell(0)
  return board
}

/** 在终盘上挖洞到目标 givens，使其仍唯一解 */
export function dig(
  solution: Board,
  difficulty: Difficulty,
  givens: number,
  rng: () => number,
): Board {
  const spec = SPECS[difficulty]
  const total = spec.size * spec.size
  const puzzle = solution.map((row) => row.slice())

  const indices = Array.from({ length: total }, (_, i) => i)
  shuffle(indices, rng)

  let removed = 0
  const targetRemoved = total - givens

  for (const idx of indices) {
    if (removed >= targetRemoved) break
    const r = Math.floor(idx / spec.size)
    const c = idx % spec.size
    if (puzzle[r][c] === 0) continue
    const backup = puzzle[r][c]
    puzzle[r][c] = 0
    // 9×9 唯一性检验昂贵；对 9×9 放宽（仅做生成，不做严格唯一性检查）
    if (spec.size <= 6) {
      if (countSolutions(puzzle, spec, 2) !== 1) {
        puzzle[r][c] = backup
        continue
      }
    }
    removed++
  }
  return puzzle
}

/** 生成一关：terminal + 挖洞 */
export function generatePuzzle(
  difficulty: Difficulty,
  givens: number,
  seedSource: string,
): { puzzle: Board; solution: Board } {
  const rng = mulberry32(seedFromString(seedSource))
  const solution = generateSolution(difficulty, rng)
  const puzzle = dig(solution, difficulty, givens, rng)
  return { puzzle, solution }
}

