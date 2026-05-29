// 数独盘面校验
import type { Board, BoardSpec } from './types'

/** 判断盘面是否合法（不含 0 的完整解）  */
export function isComplete(board: Board, spec: BoardSpec): boolean {
  for (let r = 0; r < spec.size; r++) {
    for (let c = 0; c < spec.size; c++) {
      if (board[r][c] === 0) return false
    }
  }
  return isValid(board, spec)
}

/** 判断盘面是否处处合法（允许 0，但已填入的不能冲突） */
export function isValid(board: Board, spec: BoardSpec): boolean {
  // 行
  for (let r = 0; r < spec.size; r++) {
    const seen = new Set<number>()
    for (let c = 0; c < spec.size; c++) {
      const v = board[r][c]
      if (v === 0) continue
      if (seen.has(v)) return false
      seen.add(v)
    }
  }
  // 列
  for (let c = 0; c < spec.size; c++) {
    const seen = new Set<number>()
    for (let r = 0; r < spec.size; r++) {
      const v = board[r][c]
      if (v === 0) continue
      if (seen.has(v)) return false
      seen.add(v)
    }
  }
  // 宫
  for (let br = 0; br < spec.size; br += spec.boxRows) {
    for (let bc = 0; bc < spec.size; bc += spec.boxCols) {
      const seen = new Set<number>()
      for (let r = br; r < br + spec.boxRows; r++) {
        for (let c = bc; c < bc + spec.boxCols; c++) {
          const v = board[r][c]
          if (v === 0) continue
          if (seen.has(v)) return false
          seen.add(v)
        }
      }
    }
  }
  return true
}

/** 单格冲突检测：返回 (row,col) 处的 value 是否与同行/列/宫已有数冲突 */
export function hasConflict(
  board: Board,
  row: number,
  col: number,
  value: number,
  spec: BoardSpec,
): boolean {
  if (value === 0) return false
  for (let i = 0; i < spec.size; i++) {
    if (i !== col && board[row][i] === value) return true
    if (i !== row && board[i][col] === value) return true
  }
  const br = Math.floor(row / spec.boxRows) * spec.boxRows
  const bc = Math.floor(col / spec.boxCols) * spec.boxCols
  for (let r = br; r < br + spec.boxRows; r++) {
    for (let c = bc; c < bc + spec.boxCols; c++) {
      if ((r !== row || c !== col) && board[r][c] === value) return true
    }
  }
  return false
}
