import React, { useCallback, useMemo, useState } from 'react'
import {
  Sigma,
  Eraser,
  Square,
  Shuffle,
  Info,
  AlertCircle,
  Minus,
  Plus,
} from 'lucide-react'
import { PageHero } from '@toolbox/ui-kit'
import { useToolStorage } from '@toolbox/storage'
import { useTranslation } from 'react-i18next'

const NAMESPACE = 'toolMatrixCalc'

const MIN_DIM = 2
const MAX_DIM = 10
const EPS = 1e-10

// ─── types ────────────────────────────────────────────────────────────────

type Matrix = number[][]

interface MatrixState {
  rows: number
  cols: number
  // Stored as strings so the editor can keep transient inputs like "-" or "1."
  cells: string[][]
}

interface PersistedState {
  a: MatrixState
  b: MatrixState
  scalar: string
}

type OpKind =
  | 'transpose'
  | 'det'
  | 'inverse'
  | 'rank'
  | 'trace'
  | 'add'
  | 'sub'
  | 'mul'
  | 'scalarMul'

interface ResultMatrix {
  kind: 'matrix'
  expr: string
  value: Matrix
}
interface ResultScalar {
  kind: 'scalar'
  expr: string
  value: number
}
interface ResultError {
  kind: 'error'
  expr: string
  message: string
}
type CalcResult = ResultMatrix | ResultScalar | ResultError

// ─── helpers ──────────────────────────────────────────────────────────────

function makeMatrixState(rows: number, cols: number, fill = '0'): MatrixState {
  return {
    rows,
    cols,
    cells: Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => fill),
    ),
  }
}

const DEFAULT_STATE: PersistedState = {
  a: makeMatrixState(3, 3),
  b: makeMatrixState(3, 3),
  scalar: '2',
}

/** Reshape cells array, padding new cells with "0" and trimming overflow. */
function reshape(prev: MatrixState, rows: number, cols: number): MatrixState {
  const cells: string[][] = []
  for (let r = 0; r < rows; r++) {
    const row: string[] = []
    for (let c = 0; c < cols; c++) {
      row.push(prev.cells[r]?.[c] ?? '0')
    }
    cells.push(row)
  }
  return { rows, cols, cells }
}

/** Parse a string cell into a number; throws on invalid. Treats empty / "-" / "." as 0. */
function parseCell(raw: string): number {
  const s = raw.trim()
  if (s === '' || s === '-' || s === '.' || s === '-.') return 0
  const n = Number(s)
  if (!Number.isFinite(n)) throw new Error('invalid-number')
  return n
}

function parseMatrix(state: MatrixState): Matrix {
  const m: Matrix = []
  for (let r = 0; r < state.rows; r++) {
    const row: number[] = []
    for (let c = 0; c < state.cols; c++) {
      row.push(parseCell(state.cells[r][c]))
    }
    m.push(row)
  }
  return m
}

function cloneMatrix(m: Matrix): Matrix {
  return m.map((row) => row.slice())
}

function fmt(n: number): string {
  if (!Number.isFinite(n)) return String(n)
  if (Math.abs(n) < EPS) return '0'
  if (Number.isInteger(n)) return String(n)
  // Avoid `-0` slipping through after rounding.
  const rounded = Math.round(n * 1e4) / 1e4
  if (Math.abs(rounded) < EPS) return '0'
  return rounded.toFixed(4).replace(/\.?0+$/, '') || '0'
}

// ─── linear algebra primitives (no external deps) ─────────────────────────

function add(a: Matrix, b: Matrix): Matrix {
  return a.map((row, i) => row.map((v, j) => v + b[i][j]))
}
function sub(a: Matrix, b: Matrix): Matrix {
  return a.map((row, i) => row.map((v, j) => v - b[i][j]))
}
function mul(a: Matrix, b: Matrix): Matrix {
  const rows = a.length
  const cols = b[0].length
  const inner = b.length
  const out: Matrix = Array.from({ length: rows }, () => Array(cols).fill(0))
  for (let i = 0; i < rows; i++) {
    for (let k = 0; k < inner; k++) {
      const aik = a[i][k]
      if (aik === 0) continue
      const brow = b[k]
      const orow = out[i]
      for (let j = 0; j < cols; j++) {
        orow[j] += aik * brow[j]
      }
    }
  }
  return out
}
function scale(a: Matrix, k: number): Matrix {
  return a.map((row) => row.map((v) => v * k))
}
function transpose(a: Matrix): Matrix {
  const rows = a.length
  const cols = a[0].length
  const out: Matrix = Array.from({ length: cols }, () => Array(rows).fill(0))
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      out[j][i] = a[i][j]
    }
  }
  return out
}
function trace(a: Matrix): number {
  let t = 0
  for (let i = 0; i < a.length; i++) t += a[i][i]
  return t
}

/** Determinant via LU with partial pivoting. O(n^3). */
function determinant(a: Matrix): number {
  const n = a.length
  const m = cloneMatrix(a)
  let det = 1
  let swaps = 0
  for (let i = 0; i < n; i++) {
    // Partial pivot: find row with max |value| in column i, rows i..n-1
    let pivot = i
    let maxAbs = Math.abs(m[i][i])
    for (let r = i + 1; r < n; r++) {
      const v = Math.abs(m[r][i])
      if (v > maxAbs) {
        maxAbs = v
        pivot = r
      }
    }
    if (maxAbs < EPS) return 0
    if (pivot !== i) {
      const tmp = m[i]
      m[i] = m[pivot]
      m[pivot] = tmp
      swaps++
    }
    det *= m[i][i]
    for (let r = i + 1; r < n; r++) {
      const factor = m[r][i] / m[i][i]
      if (factor === 0) continue
      for (let c = i; c < n; c++) {
        m[r][c] -= factor * m[i][c]
      }
    }
  }
  return swaps % 2 === 0 ? det : -det
}

/** Inverse via Gauss-Jordan elimination on [A | I]. Throws "singular" if not invertible. */
function inverse(a: Matrix): Matrix {
  const n = a.length
  // Build augmented [A | I]
  const aug: Matrix = a.map((row, i) =>
    row.concat(Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))),
  )
  for (let i = 0; i < n; i++) {
    // Partial pivot
    let pivot = i
    let maxAbs = Math.abs(aug[i][i])
    for (let r = i + 1; r < n; r++) {
      const v = Math.abs(aug[r][i])
      if (v > maxAbs) {
        maxAbs = v
        pivot = r
      }
    }
    if (maxAbs < EPS) throw new Error('singular')
    if (pivot !== i) {
      const tmp = aug[i]
      aug[i] = aug[pivot]
      aug[pivot] = tmp
    }
    // Normalize pivot row
    const pv = aug[i][i]
    for (let c = 0; c < 2 * n; c++) aug[i][c] /= pv
    // Eliminate other rows
    for (let r = 0; r < n; r++) {
      if (r === i) continue
      const factor = aug[r][i]
      if (factor === 0) continue
      for (let c = 0; c < 2 * n; c++) {
        aug[r][c] -= factor * aug[i][c]
      }
    }
  }
  // Extract right half
  return aug.map((row) => row.slice(n))
}

/** Rank via row-reduction with partial pivoting. */
function rank(a: Matrix): number {
  const rows = a.length
  const cols = a[0].length
  const m = cloneMatrix(a)
  let r = 0
  for (let c = 0; c < cols && r < rows; c++) {
    // Find pivot
    let pivot = r
    let maxAbs = Math.abs(m[r][c])
    for (let i = r + 1; i < rows; i++) {
      const v = Math.abs(m[i][c])
      if (v > maxAbs) {
        maxAbs = v
        pivot = i
      }
    }
    if (maxAbs < EPS) continue
    if (pivot !== r) {
      const tmp = m[r]
      m[r] = m[pivot]
      m[pivot] = tmp
    }
    // Eliminate below
    for (let i = r + 1; i < rows; i++) {
      const factor = m[i][c] / m[r][c]
      if (factor === 0) continue
      for (let cc = c; cc < cols; cc++) {
        m[i][cc] -= factor * m[r][cc]
      }
    }
    r++
  }
  return r
}

// ─── component ────────────────────────────────────────────────────────────

const MatrixCalc: React.FC = () => {
  const { t } = useTranslation(NAMESPACE)
  const { data, save, loading } = useToolStorage<PersistedState>(
    'matrix-calc',
    'state',
    DEFAULT_STATE,
  )
  const [result, setResult] = useState<CalcResult | null>(null)

  const updateMatrix = useCallback(
    (which: 'a' | 'b', next: MatrixState) => {
      void save({ ...data, [which]: next })
    },
    [data, save],
  )

  const setDim = useCallback(
    (which: 'a' | 'b', axis: 'rows' | 'cols', value: number) => {
      const clamped = Math.min(Math.max(value, MIN_DIM), MAX_DIM)
      const cur = data[which]
      if (cur[axis] === clamped) return
      const next =
        axis === 'rows'
          ? reshape(cur, clamped, cur.cols)
          : reshape(cur, cur.rows, clamped)
      updateMatrix(which, next)
    },
    [data, updateMatrix],
  )

  const setCell = useCallback(
    (which: 'a' | 'b', r: number, c: number, raw: string) => {
      const cur = data[which]
      const cells = cur.cells.map((row, i) =>
        i === r ? row.map((v, j) => (j === c ? raw : v)) : row,
      )
      updateMatrix(which, { ...cur, cells })
    },
    [data, updateMatrix],
  )

  const fillMatrix = useCallback(
    (which: 'a' | 'b', mode: 'clear' | 'identity' | 'random') => {
      const cur = data[which]
      const cells: string[][] = []
      for (let r = 0; r < cur.rows; r++) {
        const row: string[] = []
        for (let c = 0; c < cur.cols; c++) {
          if (mode === 'clear') row.push('0')
          else if (mode === 'identity') row.push(r === c ? '1' : '0')
          else row.push(String(Math.floor(Math.random() * 21) - 10))
        }
        cells.push(row)
      }
      updateMatrix(which, { ...cur, cells })
    },
    [data, updateMatrix],
  )

  const setScalar = useCallback(
    (s: string) => {
      void save({ ...data, scalar: s })
    },
    [data, save],
  )

  // Pre-compute disabled state + tooltip for each op based on current dims.
  const opStatus = useMemo(() => {
    const a = data.a
    const b = data.b
    const aSquare = a.rows === a.cols
    const sameDim = a.rows === b.rows && a.cols === b.cols
    const mulOk = a.cols === b.rows
    const dimStr = (m: MatrixState) => `${m.rows}×${m.cols}`
    return {
      transpose: { ok: true as boolean, reason: '' },
      det: {
        ok: aSquare,
        reason: aSquare ? '' : t('errors.notSquare', { op: t('op.det') }),
      },
      inverse: {
        ok: aSquare,
        reason: aSquare ? '' : t('errors.notSquare', { op: t('op.inverse') }),
      },
      rank: { ok: true as boolean, reason: '' },
      trace: {
        ok: aSquare,
        reason: aSquare ? '' : t('errors.notSquare', { op: t('op.trace') }),
      },
      add: {
        ok: sameDim,
        reason: sameDim
          ? ''
          : t('errors.dimMismatch', {
              op: t('op.add'),
              a: dimStr(a),
              b: dimStr(b),
            }),
      },
      sub: {
        ok: sameDim,
        reason: sameDim
          ? ''
          : t('errors.dimMismatch', {
              op: t('op.sub'),
              a: dimStr(a),
              b: dimStr(b),
            }),
      },
      mul: {
        ok: mulOk,
        reason: mulOk
          ? ''
          : t('errors.mulMismatch', { aCols: a.cols, bRows: b.rows }),
      },
      scalarMul: { ok: true as boolean, reason: '' },
    }
  }, [data.a, data.b, t])

  const runOp = useCallback(
    (op: OpKind) => {
      // Parse both matrices once. If A is needed but B isn't, B still parses
      // cheaply; cheap enough to keep flow simple.
      try {
        const A = parseMatrix(data.a)
        const B = parseMatrix(data.b)
        const k = (() => {
          const n = Number(data.scalar)
          return Number.isFinite(n) ? n : 0
        })()

        switch (op) {
          case 'transpose':
            setResult({ kind: 'matrix', expr: 'Aᵀ =', value: transpose(A) })
            return
          case 'det':
            if (data.a.rows !== data.a.cols) throw new Error('not-square')
            setResult({ kind: 'scalar', expr: 'det(A) =', value: determinant(A) })
            return
          case 'inverse':
            if (data.a.rows !== data.a.cols) throw new Error('not-square')
            setResult({ kind: 'matrix', expr: 'A⁻¹ =', value: inverse(A) })
            return
          case 'rank':
            setResult({ kind: 'scalar', expr: 'rank(A) =', value: rank(A) })
            return
          case 'trace':
            if (data.a.rows !== data.a.cols) throw new Error('not-square')
            setResult({ kind: 'scalar', expr: 'tr(A) =', value: trace(A) })
            return
          case 'add':
            setResult({ kind: 'matrix', expr: 'A + B =', value: add(A, B) })
            return
          case 'sub':
            setResult({ kind: 'matrix', expr: 'A - B =', value: sub(A, B) })
            return
          case 'mul':
            setResult({ kind: 'matrix', expr: 'A × B =', value: mul(A, B) })
            return
          case 'scalarMul':
            setResult({
              kind: 'matrix',
              expr: `${fmt(k)} × A =`,
              value: scale(A, k),
            })
            return
        }
      } catch (e) {
        const msg = (e as Error).message
        let humanized = msg
        if (msg === 'invalid-number') humanized = t('errors.invalidNumber')
        else if (msg === 'singular') humanized = t('errors.singular')
        else if (msg === 'not-square')
          humanized = t('errors.notSquare', { op })
        setResult({ kind: 'error', expr: op, message: humanized })
      }
    },
    [data, t],
  )

  if (loading) {
    return (
      <div className="w-full space-y-6">
        <PageHero title={t('title')} description={t('description')} />
        <div className="text-center text-sm text-gray-400 py-12">
          {t('loading')}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6 pb-12">
      <PageHero title={t('title')} description={t('description')} />

      <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2 flex items-start gap-2">
        <Info className="w-4 h-4 mt-0.5 shrink-0" />
        <span>{t('disclaimer')}</span>
      </div>

      <MatrixEditor
        label={t('matrix.matrixA')}
        state={data.a}
        onCellChange={(r, c, v) => setCell('a', r, c, v)}
        onDimChange={(axis, v) => setDim('a', axis, v)}
        onFill={(mode) => fillMatrix('a', mode)}
      />
      <MatrixEditor
        label={t('matrix.matrixB')}
        state={data.b}
        onCellChange={(r, c, v) => setCell('b', r, c, v)}
        onDimChange={(axis, v) => setDim('b', axis, v)}
        onFill={(mode) => fillMatrix('b', mode)}
      />

      {/* Operations */}
      <section className="rounded-lg border border-gray-200 bg-white p-4 space-y-4">
        <OpGroup title={t('op.section.unary')}>
          <OpButton
            label={t('op.transpose')}
            status={opStatus.transpose}
            onClick={() => runOp('transpose')}
          />
          <OpButton
            label={t('op.det')}
            status={opStatus.det}
            onClick={() => runOp('det')}
          />
          <OpButton
            label={t('op.inverse')}
            status={opStatus.inverse}
            onClick={() => runOp('inverse')}
          />
          <OpButton
            label={t('op.rank')}
            status={opStatus.rank}
            onClick={() => runOp('rank')}
          />
          <OpButton
            label={t('op.trace')}
            status={opStatus.trace}
            onClick={() => runOp('trace')}
          />
        </OpGroup>

        <OpGroup title={t('op.section.binary')}>
          <OpButton
            label={t('op.add')}
            status={opStatus.add}
            onClick={() => runOp('add')}
          />
          <OpButton
            label={t('op.sub')}
            status={opStatus.sub}
            onClick={() => runOp('sub')}
          />
          <OpButton
            label={t('op.mul')}
            status={opStatus.mul}
            onClick={() => runOp('mul')}
          />
        </OpGroup>

        <OpGroup title={t('op.section.scalar')}>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500">{t('matrix.scalar')}</label>
            <input
              type="text"
              inputMode="decimal"
              value={data.scalar}
              onChange={(e) => setScalar(e.target.value)}
              className="w-20 px-2 py-1 text-sm border border-gray-300 rounded-md font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
              spellCheck={false}
            />
          </div>
          <OpButton
            label={t('op.scalarMul')}
            status={opStatus.scalarMul}
            onClick={() => runOp('scalarMul')}
          />
        </OpGroup>
      </section>

      {/* Result */}
      <section className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
        <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
          <Sigma className="w-4 h-4" /> {t('result.title')}
        </h2>
        {!result && (
          <p className="text-sm text-gray-400">{t('result.empty')}</p>
        )}
        {result?.kind === 'error' && (
          <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span className="break-all">{result.message}</span>
          </div>
        )}
        {result?.kind === 'scalar' && (
          <div className="text-base font-mono text-gray-800">
            <span className="text-gray-500 mr-2">{result.expr}</span>
            <span className="text-indigo-600 font-semibold tabular-nums">
              {fmt(result.value)}
            </span>
          </div>
        )}
        {result?.kind === 'matrix' && (
          <div className="space-y-2">
            <div className="text-sm text-gray-500 font-mono">{result.expr}</div>
            <MatrixView matrix={result.value} />
          </div>
        )}
      </section>
    </div>
  )
}

// ─── sub-components ───────────────────────────────────────────────────────

interface MatrixEditorProps {
  label: string
  state: MatrixState
  onCellChange: (r: number, c: number, value: string) => void
  onDimChange: (axis: 'rows' | 'cols', value: number) => void
  onFill: (mode: 'clear' | 'identity' | 'random') => void
}

const MatrixEditor: React.FC<MatrixEditorProps> = ({
  label,
  state,
  onCellChange,
  onDimChange,
  onFill,
}) => {
  const { t } = useTranslation(NAMESPACE)
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-gray-800">{label}</h2>
        <div className="flex flex-wrap items-center gap-2">
          <DimStepper
            label={t('matrix.rows')}
            value={state.rows}
            onChange={(v) => onDimChange('rows', v)}
          />
          <DimStepper
            label={t('matrix.cols')}
            value={state.cols}
            onChange={(v) => onDimChange('cols', v)}
          />
        </div>
      </div>

      <MatrixGrid state={state} onCellChange={onCellChange} />

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onFill('clear')}
          className="px-2 py-1 text-xs text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-1"
        >
          <Eraser className="w-3 h-3" /> {t('matrix.clear')}
        </button>
        <button
          type="button"
          onClick={() => onFill('identity')}
          disabled={state.rows !== state.cols}
          className="px-2 py-1 text-xs text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 disabled:text-gray-300 disabled:cursor-not-allowed flex items-center gap-1"
          title={
            state.rows !== state.cols
              ? t('errors.notSquare', { op: t('matrix.identity') })
              : t('matrix.identity')
          }
        >
          <Square className="w-3 h-3" /> {t('matrix.identity')}
        </button>
        <button
          type="button"
          onClick={() => onFill('random')}
          className="px-2 py-1 text-xs text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-1"
        >
          <Shuffle className="w-3 h-3" /> {t('matrix.random')}
        </button>
      </div>
    </section>
  )
}

interface DimStepperProps {
  label: string
  value: number
  onChange: (v: number) => void
}
const DimStepper: React.FC<DimStepperProps> = ({ label, value, onChange }) => (
  <div className="flex items-center gap-1">
    <span className="text-xs text-gray-500">{label}</span>
    <div className="inline-flex items-center border border-gray-300 rounded-md overflow-hidden">
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={value <= MIN_DIM}
        className="px-1.5 py-1 text-gray-600 hover:bg-gray-50 disabled:text-gray-300 disabled:cursor-not-allowed"
        aria-label="decrement"
      >
        <Minus className="w-3 h-3" />
      </button>
      <span className="px-2 py-0.5 text-xs font-mono text-gray-800 min-w-[1.75rem] text-center tabular-nums">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={value >= MAX_DIM}
        className="px-1.5 py-1 text-gray-600 hover:bg-gray-50 disabled:text-gray-300 disabled:cursor-not-allowed"
        aria-label="increment"
      >
        <Plus className="w-3 h-3" />
      </button>
    </div>
  </div>
)

interface MatrixGridProps {
  state: MatrixState
  onCellChange: (r: number, c: number, value: string) => void
}
const MatrixGrid: React.FC<MatrixGridProps> = ({ state, onCellChange }) => {
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    r: number,
    c: number,
  ) => {
    // Enter = move down one row (wrap to next column then row 0 at end)
    if (e.key === 'Enter') {
      e.preventDefault()
      const nextR = r + 1 < state.rows ? r + 1 : 0
      const nextC = r + 1 < state.rows ? c : c + 1 < state.cols ? c + 1 : 0
      const next = document.querySelector<HTMLInputElement>(
        `input[data-cell="${nextR}-${nextC}"][data-grid="${e.currentTarget.dataset.grid}"]`,
      )
      next?.focus()
      next?.select()
    }
  }
  // Unique grid id (per-instance, derived from random label fallback)
  const gridId = useMemo(() => `mg-${Math.random().toString(36).slice(2, 8)}`, [])
  return (
    <div
      className="inline-grid gap-1 p-2 border border-gray-200 rounded-md bg-gray-50 max-w-full overflow-x-auto"
      style={{
        gridTemplateColumns: `repeat(${state.cols}, minmax(3.5rem, 1fr))`,
      }}
    >
      {state.cells.flatMap((row, r) =>
        row.map((cell, c) => (
          <input
            key={`${r}-${c}`}
            type="text"
            inputMode="decimal"
            data-cell={`${r}-${c}`}
            data-grid={gridId}
            value={cell}
            onChange={(e) => onCellChange(r, c, e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, r, c)}
            onFocus={(e) => e.currentTarget.select()}
            className="w-full px-1 py-1 text-xs font-mono text-center bg-white border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            spellCheck={false}
          />
        )),
      )}
    </div>
  )
}

interface MatrixViewProps {
  matrix: Matrix
}
const MatrixView: React.FC<MatrixViewProps> = ({ matrix }) => {
  const rows = matrix.length
  const cols = matrix[0]?.length ?? 0
  return (
    <div
      className="inline-grid gap-1 p-2 border border-indigo-200 rounded-md bg-indigo-50/40 max-w-full overflow-x-auto"
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(3.5rem, 1fr))` }}
    >
      {Array.from({ length: rows }, (_, r) =>
        Array.from({ length: cols }, (_, c) => (
          <span
            key={`${r}-${c}`}
            className="px-1 py-1 text-xs font-mono text-center text-indigo-900 bg-white border border-indigo-100 rounded tabular-nums"
          >
            {fmt(matrix[r][c])}
          </span>
        )),
      )}
    </div>
  )
}

interface OpGroupProps {
  title: string
  children: React.ReactNode
}
const OpGroup: React.FC<OpGroupProps> = ({ title, children }) => (
  <div className="space-y-2">
    <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide">
      {title}
    </h3>
    <div className="flex flex-wrap items-center gap-2">{children}</div>
  </div>
)

interface OpButtonProps {
  label: string
  status: { ok: boolean; reason: string }
  onClick: () => void
}
const OpButton: React.FC<OpButtonProps> = ({ label, status, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={!status.ok}
    title={status.ok ? label : status.reason}
    className="px-3 py-1.5 text-sm border border-gray-300 bg-white rounded-md hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200 disabled:cursor-not-allowed transition-colors font-mono"
  >
    {label}
  </button>
)

export default MatrixCalc
