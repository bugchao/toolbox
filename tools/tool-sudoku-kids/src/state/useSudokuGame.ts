// 单关游戏状态机
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { generatePuzzle } from '../lib/generator'
import { SPECS } from '../lib/types'
import type { Board, CellEntry, Difficulty, Level, Move } from '../lib/types'

function buildEntries(puzzle: Board): CellEntry[][] {
  return puzzle.map((row) =>
    row.map<CellEntry>((v) => ({
      value: v,
      candidates: new Set(),
      given: v !== 0,
      hinted: false,
    })),
  )
}

function cloneEntry(e: CellEntry): CellEntry {
  return {
    value: e.value,
    candidates: new Set(e.candidates),
    given: e.given,
    hinted: e.hinted,
  }
}

export type GameSnapshot = {
  level: Level
  difficulty: Difficulty
  size: number
  entries: CellEntry[][]
  solution: Board
  selected: { row: number; col: number } | null
  mode: 'confirm' | 'pencil'
  errors: number
  hints: number
  isComplete: boolean
  canUndo: boolean
}

export function useSudokuGame(level: Level) {
  const { puzzle, solution } = useMemo(
    () => generatePuzzle(level.difficulty, level.givens, `sudoku-kids:${level.id}`),
    [level.id, level.difficulty, level.givens],
  )
  const spec = SPECS[level.difficulty]

  const [entries, setEntries] = useState<CellEntry[][]>(() => buildEntries(puzzle))
  const [selected, setSelected] = useState<{ row: number; col: number } | null>(null)
  const [mode, setMode] = useState<'confirm' | 'pencil'>('confirm')
  const [errors, setErrors] = useState(0)
  const [hints, setHints] = useState(0)
  const historyRef = useRef<Move[]>([])

  const reset = useCallback(() => {
    setEntries(buildEntries(puzzle))
    setSelected(null)
    setMode('confirm')
    setErrors(0)
    setHints(0)
    historyRef.current = []
  }, [puzzle])

  // 关卡切换时自动重置
  useEffect(() => {
    reset()
  }, [reset])

  const isComplete = useMemo(() => {
    for (let r = 0; r < spec.size; r++) {
      for (let c = 0; c < spec.size; c++) {
        if (entries[r][c].value !== solution[r][c]) return false
      }
    }
    return true
  }, [entries, solution, spec.size])

  const select = useCallback((row: number, col: number) => {
    setSelected({ row, col })
  }, [])

  const toggleMode = useCallback(() => {
    setMode((m) => (m === 'confirm' ? 'pencil' : 'confirm'))
  }, [])

  const setValue = useCallback(
    (row: number, col: number, value: number) => {
      const cell = entries[row][col]
      if (cell.given || cell.hinted) return
      // 在 confirm 模式下：填入正式数字
      if (mode === 'confirm') {
        const prev = cloneEntry(cell)
        const correct = solution[row][col]
        const next: CellEntry = {
          ...prev,
          value,
          candidates: new Set(),
        }
        // 是否计为错误：与终盘不一致；用户清零不算错
        if (value !== 0 && value !== correct) {
          setErrors((e) => e + 1)
        }
        setEntries((prevEntries) => {
          const copy = prevEntries.map((r) => r.slice())
          copy[row][col] = next
          return copy
        })
        historyRef.current.push({ kind: 'set', row, col, prev })
      } else {
        // pencil 模式下：切换候选
        if (value === 0) return
        const prev = new Set(cell.candidates)
        const next = new Set(cell.candidates)
        if (next.has(value)) next.delete(value)
        else next.add(value)
        setEntries((prevEntries) => {
          const copy = prevEntries.map((r) => r.slice())
          copy[row][col] = { ...cell, candidates: next }
          return copy
        })
        historyRef.current.push({ kind: 'pencil', row, col, prev })
      }
    },
    [entries, mode, solution],
  )

  const clearCell = useCallback(
    (row: number, col: number) => {
      const cell = entries[row][col]
      if (cell.given || cell.hinted) return
      const prev = cloneEntry(cell)
      setEntries((prevEntries) => {
        const copy = prevEntries.map((r) => r.slice())
        copy[row][col] = { ...cell, value: 0, candidates: new Set() }
        return copy
      })
      historyRef.current.push({ kind: 'clear', row, col, prev })
    },
    [entries],
  )

  const undo = useCallback(() => {
    const last = historyRef.current.pop()
    if (!last) return
    setEntries((prevEntries) => {
      const copy = prevEntries.map((r) => r.slice())
      if (last.kind === 'pencil') {
        copy[last.row][last.col] = {
          ...copy[last.row][last.col],
          candidates: new Set(last.prev),
        }
      } else {
        copy[last.row][last.col] = cloneEntry(last.prev)
      }
      return copy
    })
  }, [])

  const hint = useCallback(() => {
    if (!selected) return
    const { row, col } = selected
    const cell = entries[row][col]
    if (cell.given || cell.hinted || cell.value === solution[row][col]) return
    setHints((h) => h + 1)
    setEntries((prevEntries) => {
      const copy = prevEntries.map((r) => r.slice())
      copy[row][col] = {
        value: solution[row][col],
        candidates: new Set(),
        given: false,
        hinted: true,
      }
      return copy
    })
    // 提示不入历史（不能被撤销，否则就能撤掉惩罚同时保留正确答案）
  }, [entries, selected, solution])

  const snapshot: GameSnapshot = {
    level,
    difficulty: level.difficulty,
    size: spec.size,
    entries,
    solution,
    selected,
    mode,
    errors,
    hints,
    isComplete,
    canUndo: historyRef.current.length > 0,
  }

  return {
    ...snapshot,
    spec,
    select,
    setValue,
    clearCell,
    toggleMode,
    undo,
    hint,
    reset,
  }
}
