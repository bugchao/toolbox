import React from 'react'
import type { BoardSpec, CellEntry } from '../lib/types'

export type BoardProps = {
  entries: CellEntry[][]
  solution: number[][]
  spec: BoardSpec
  selected: { row: number; col: number } | null
  onSelect: (row: number, col: number) => void
}

function classNames(...arr: (string | false | null | undefined)[]) {
  return arr.filter(Boolean).join(' ')
}

const Board: React.FC<BoardProps> = ({ entries, solution, spec, selected, onSelect }) => {
  const isSameUnit = (r: number, c: number) => {
    if (!selected) return false
    if (r === selected.row || c === selected.col) return true
    const br = Math.floor(selected.row / spec.boxRows) * spec.boxRows
    const bc = Math.floor(selected.col / spec.boxCols) * spec.boxCols
    return r >= br && r < br + spec.boxRows && c >= bc && c < bc + spec.boxCols
  }

  return (
    <div
      className="mx-auto select-none rounded-2xl bg-white p-2 shadow-lg ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-700"
      style={{
        // 单元格大小自适应，使整个棋盘最大约 min(90vw, 480px)
        ['--cell-size' as string]: `min(calc((90vw - 16px) / ${spec.size}), calc(480px / ${spec.size}))`,
      }}
    >
      <div
        className="grid"
        style={{ gridTemplateColumns: `repeat(${spec.size}, var(--cell-size))` }}
        role="grid"
        aria-label="sudoku-board"
      >
        {entries.map((row, r) =>
          row.map((cell, c) => {
            const isSel = !!selected && selected.row === r && selected.col === c
            const inUnit = isSameUnit(r, c)
            const isError = cell.value !== 0 && cell.value !== solution[r][c]
            const sameValue =
              selected &&
              entries[selected.row][selected.col].value !== 0 &&
              cell.value === entries[selected.row][selected.col].value
            // 宫间粗边
            const borderTop = r % spec.boxRows === 0 ? 'border-t-2 border-t-gray-500 dark:border-t-gray-400' : 'border-t border-t-gray-200 dark:border-t-gray-700'
            const borderLeft = c % spec.boxCols === 0 ? 'border-l-2 border-l-gray-500 dark:border-l-gray-400' : 'border-l border-l-gray-200 dark:border-l-gray-700'
            const borderRight = c === spec.size - 1 ? 'border-r-2 border-r-gray-500 dark:border-r-gray-400' : ''
            const borderBottom = r === spec.size - 1 ? 'border-b-2 border-b-gray-500 dark:border-b-gray-400' : ''
            return (
              <button
                type="button"
                key={`${r}-${c}`}
                onClick={() => onSelect(r, c)}
                className={classNames(
                  'relative flex items-center justify-center font-bold transition-colors',
                  borderTop,
                  borderLeft,
                  borderRight,
                  borderBottom,
                  isSel && 'bg-amber-200/70 dark:bg-amber-700/40',
                  !isSel && inUnit && 'bg-amber-50 dark:bg-amber-900/20',
                  !isSel && !inUnit && sameValue && 'bg-sky-100 dark:bg-sky-900/40',
                  cell.given && 'text-gray-900 dark:text-gray-100',
                  cell.hinted && 'text-emerald-600 dark:text-emerald-400',
                  !cell.given && !cell.hinted && !isError && 'text-indigo-600 dark:text-indigo-300',
                  isError && 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300',
                )}
                style={{ width: 'var(--cell-size)', height: 'var(--cell-size)' }}
                role="gridcell"
                aria-label={`r${r + 1}c${c + 1}`}
              >
                {cell.value !== 0 ? (
                  <span style={{ fontSize: 'calc(var(--cell-size) * 0.55)' }}>{cell.value}</span>
                ) : cell.candidates.size > 0 ? (
                  <CandidateGrid
                    candidates={cell.candidates}
                    size={spec.size}
                  />
                ) : null}
              </button>
            )
          }),
        )}
      </div>
    </div>
  )
}

const CandidateGrid: React.FC<{ candidates: Set<number>; size: number }> = ({
  candidates,
  size,
}) => {
  // 候选格按方阵铺设：4x4 -> 2x2, 6x6 -> 3x2, 9x9 -> 3x3
  let cols = 3
  if (size === 4) cols = 2
  else if (size === 6) cols = 3
  return (
    <div
      className="grid h-full w-full p-1 text-[10px] text-gray-500 dark:text-gray-400 font-medium"
      style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, fontSize: 'calc(var(--cell-size) * 0.18)' }}
    >
      {Array.from({ length: size }, (_, i) => i + 1).map((n) => (
        <div key={n} className="flex items-center justify-center">
          {candidates.has(n) ? n : ''}
        </div>
      ))}
    </div>
  )
}

export default Board
