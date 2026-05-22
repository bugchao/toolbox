// 表格数据模型 + 多格式互转

export type Alignment = 'left' | 'center' | 'right'

export interface TableData {
  headers: string[]
  rows: string[][]
  alignment: Alignment[]
}

export const ALIGNMENT_SYMBOL: Record<Alignment, string> = {
  left: '⫷',
  center: '↔',
  right: '⫸',
}

export function emptyTable(cols = 3, rows = 3): TableData {
  return {
    headers: Array.from({ length: cols }, (_, i) => `Col ${i + 1}`),
    rows: Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => ''),
    ),
    alignment: Array.from({ length: cols }, () => 'left'),
  }
}

export function sampleTable(): TableData {
  return {
    headers: ['Name', 'Age', 'City'],
    alignment: ['left', 'center', 'right'],
    rows: [
      ['Alice', '28', 'Beijing'],
      ['Bob', '35', 'Shanghai'],
      ['Carol', '42', 'Shenzhen'],
    ],
  }
}

// ── 行/列操作 ──────────────────────────────────────────
export function addRow(td: TableData, at = td.rows.length): TableData {
  const empty = Array.from({ length: td.headers.length }, () => '')
  const rows = [...td.rows.slice(0, at), empty, ...td.rows.slice(at)]
  return { ...td, rows }
}
export function removeRow(td: TableData, idx: number): TableData {
  if (td.rows.length <= 1) return td
  return { ...td, rows: td.rows.filter((_, i) => i !== idx) }
}
export function moveRow(td: TableData, idx: number, dir: -1 | 1): TableData {
  const target = idx + dir
  if (target < 0 || target >= td.rows.length) return td
  const rows = [...td.rows]
  ;[rows[idx], rows[target]] = [rows[target], rows[idx]]
  return { ...td, rows }
}
export function addCol(td: TableData, at = td.headers.length): TableData {
  const headers = [...td.headers.slice(0, at), `Col ${at + 1}`, ...td.headers.slice(at)]
  const alignment = [...td.alignment.slice(0, at), 'left' as Alignment, ...td.alignment.slice(at)]
  const rows = td.rows.map((r) => [...r.slice(0, at), '', ...r.slice(at)])
  return { headers, rows, alignment }
}
export function removeCol(td: TableData, idx: number): TableData {
  if (td.headers.length <= 1) return td
  return {
    headers: td.headers.filter((_, i) => i !== idx),
    alignment: td.alignment.filter((_, i) => i !== idx),
    rows: td.rows.map((r) => r.filter((_, i) => i !== idx)),
  }
}
export function moveCol(td: TableData, idx: number, dir: -1 | 1): TableData {
  const target = idx + dir
  if (target < 0 || target >= td.headers.length) return td
  const swap = <T>(arr: T[]): T[] => {
    const a = [...arr]
    ;[a[idx], a[target]] = [a[target], a[idx]]
    return a
  }
  return {
    headers: swap(td.headers),
    alignment: swap(td.alignment),
    rows: td.rows.map((r) => swap(r)),
  }
}
export function setHeader(td: TableData, idx: number, value: string): TableData {
  const headers = [...td.headers]
  headers[idx] = value
  return { ...td, headers }
}
export function setCell(td: TableData, row: number, col: number, value: string): TableData {
  const rows = td.rows.map((r, i) => {
    if (i !== row) return r
    const nr = [...r]
    nr[col] = value
    return nr
  })
  return { ...td, rows }
}
export function setAlignment(td: TableData, col: number, a: Alignment): TableData {
  const alignment = [...td.alignment]
  alignment[col] = a
  return { ...td, alignment }
}

// ── 序列化 ──────────────────────────────────────────────
function escapeMd(s: string): string {
  return String(s ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ')
}

export function toMarkdown(td: TableData): string {
  const header = '| ' + td.headers.map(escapeMd).join(' | ') + ' |'
  const sep =
    '| ' +
    td.alignment
      .map((a) => (a === 'center' ? ':---:' : a === 'right' ? '---:' : ':---'))
      .join(' | ') +
    ' |'
  const body = td.rows
    .map((r) => {
      const padded = [...r]
      while (padded.length < td.headers.length) padded.push('')
      return '| ' + padded.map(escapeMd).join(' | ') + ' |'
    })
    .join('\n')
  return td.rows.length === 0 ? `${header}\n${sep}` : `${header}\n${sep}\n${body}`
}

export function toCsv(td: TableData, sep = ','): string {
  const esc = (s: string) => {
    if (s.includes(sep) || s.includes('"') || s.includes('\n')) {
      return `"${s.replace(/"/g, '""')}"`
    }
    return s
  }
  const header = td.headers.map(esc).join(sep)
  const rows = td.rows.map((r) => {
    const padded = [...r]
    while (padded.length < td.headers.length) padded.push('')
    return padded.map(esc).join(sep)
  })
  return [header, ...rows].join('\n')
}

export function toJson(td: TableData): string {
  const objs = td.rows.map((r) => {
    const obj: Record<string, string> = {}
    td.headers.forEach((h, i) => {
      obj[h] = r[i] ?? ''
    })
    return obj
  })
  return JSON.stringify(objs, null, 2)
}

// ── 反向解析 ────────────────────────────────────────────
export function fromMarkdown(input: string): TableData | null {
  const lines = input
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.startsWith('|'))
  if (lines.length < 2) return null
  const splitRow = (line: string): string[] =>
    line.replace(/^\|/, '').replace(/\|$/, '').split('|').map((s) => s.trim())
  const headers = splitRow(lines[0])
  const sepCells = splitRow(lines[1])
  if (!sepCells.every((s) => /^:?-{1,}:?$/.test(s.trim()))) return null
  const alignment: Alignment[] = sepCells.map((s) => {
    const left = s.startsWith(':')
    const right = s.endsWith(':')
    if (left && right) return 'center'
    if (right) return 'right'
    return 'left'
  })
  const rows: string[][] = []
  for (let i = 2; i < lines.length; i++) {
    rows.push(splitRow(lines[i]))
  }
  return { headers, alignment, rows }
}

export function fromCsv(input: string, sep = ','): TableData | null {
  const lines = parseCsvLines(input, sep)
  if (lines.length === 0) return null
  const headers = lines[0]
  const rows = lines.slice(1)
  const alignment: Alignment[] = headers.map(() => 'left')
  return { headers, rows, alignment }
}

/** 简易 CSV/TSV 行解析（支持双引号 + 换行内引号 + "" 转义） */
function parseCsvLines(input: string, sep: string): string[][] {
  const lines: string[][] = []
  let cur: string[] = []
  let field = ''
  let inQuote = false
  for (let i = 0; i < input.length; i++) {
    const ch = input[i]
    if (inQuote) {
      if (ch === '"') {
        if (input[i + 1] === '"') {
          field += '"'
          i++
        } else inQuote = false
      } else {
        field += ch
      }
    } else {
      if (ch === '"') inQuote = true
      else if (ch === sep) {
        cur.push(field)
        field = ''
      } else if (ch === '\n') {
        cur.push(field)
        lines.push(cur)
        cur = []
        field = ''
      } else if (ch === '\r') {
        // skip
      } else {
        field += ch
      }
    }
  }
  if (field !== '' || cur.length > 0) {
    cur.push(field)
    lines.push(cur)
  }
  // pad ragged rows to longest length
  const maxLen = Math.max(0, ...lines.map((l) => l.length))
  for (const l of lines) while (l.length < maxLen) l.push('')
  return lines
}

export function fromJson(input: string): TableData | null {
  try {
    const parsed = JSON.parse(input)
    if (!Array.isArray(parsed) || parsed.length === 0) return null
    // 取所有 key 的并集，保持首次出现顺序
    const headers: string[] = []
    for (const obj of parsed) {
      if (obj && typeof obj === 'object') {
        for (const k of Object.keys(obj)) {
          if (!headers.includes(k)) headers.push(k)
        }
      }
    }
    const rows = parsed.map((obj) =>
      headers.map((k) => {
        const v = obj?.[k]
        if (v == null) return ''
        if (typeof v === 'object') return JSON.stringify(v)
        return String(v)
      }),
    )
    const alignment: Alignment[] = headers.map(() => 'left')
    return { headers, rows, alignment }
  } catch {
    return null
  }
}
