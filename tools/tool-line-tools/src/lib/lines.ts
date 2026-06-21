/** 文本行处理操作集。纯函数，零依赖。所有操作签名统一 (lines, opts?) => lines。 */

export type SortMode = 'asc' | 'desc' | 'natural' | 'length'

const splitLines = (text: string): string[] => text.split(/\r\n|\r|\n/)

/** 自然排序比较（数字按数值，如 file2 < file10）。 */
function naturalCompare(a: string, b: string): number {
  const re = /(\d+)|(\D+)/g
  const ax = a.match(re) ?? []
  const bx = b.match(re) ?? []
  for (let i = 0; i < Math.min(ax.length, bx.length); i++) {
    const an = Number(ax[i]); const bn = Number(bx[i])
    if (!Number.isNaN(an) && !Number.isNaN(bn)) {
      if (an !== bn) return an - bn
    } else if (ax[i] !== bx[i]) {
      return ax[i] < bx[i] ? -1 : 1
    }
  }
  return ax.length - bx.length
}

export function sortLines(lines: string[], mode: SortMode = 'asc', caseInsensitive = false): string[] {
  const norm = (s: string) => (caseInsensitive ? s.toLowerCase() : s)
  const out = lines.slice()
  switch (mode) {
    case 'asc': out.sort((a, b) => (norm(a) < norm(b) ? -1 : norm(a) > norm(b) ? 1 : 0)); break
    case 'desc': out.sort((a, b) => (norm(a) < norm(b) ? 1 : norm(a) > norm(b) ? -1 : 0)); break
    case 'natural': out.sort((a, b) => naturalCompare(norm(a), norm(b))); break
    case 'length': out.sort((a, b) => a.length - b.length); break
  }
  return out
}

/** 去重，保留首次出现顺序。 */
export function dedupe(lines: string[], caseInsensitive = false, trimCompare = false): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const line of lines) {
    let key = line
    if (trimCompare) key = key.trim()
    if (caseInsensitive) key = key.toLowerCase()
    if (!seen.has(key)) { seen.add(key); out.push(line) }
  }
  return out
}

export function reverse(lines: string[]): string[] {
  return lines.slice().reverse()
}

/** 用注入的 rng（默认 Math.random）做 Fisher-Yates 洗牌，便于测试。 */
export function shuffle(lines: string[], rng: () => number = Math.random): string[] {
  const out = lines.slice()
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

export function removeBlank(lines: string[]): string[] {
  return lines.filter((l) => l.trim() !== '')
}

export function trimLines(lines: string[]): string[] {
  return lines.map((l) => l.trim())
}

export type NumberOptions = { start?: number; pad?: boolean; sep?: string }

export function numberLines(lines: string[], opts: NumberOptions = {}): string[] {
  const start = opts.start ?? 1
  const sep = opts.sep ?? '. '
  const width = String(start + lines.length - 1).length
  return lines.map((l, i) => {
    const n = String(start + i)
    return (opts.pad ? n.padStart(width, '0') : n) + sep + l
  })
}

/** 去掉每行已有的行号前缀（数字 + 常见分隔符）。 */
export function unnumberLines(lines: string[]): string[] {
  return lines.map((l) => l.replace(/^\s*\d+[.)\]:\t ]\s*/, ''))
}

export function filterLines(lines: string[], keyword: string, opts: { exclude?: boolean; regex?: boolean; caseInsensitive?: boolean } = {}): string[] {
  if (!keyword) return lines.slice()
  let test: (s: string) => boolean
  if (opts.regex) {
    let re: RegExp
    try { re = new RegExp(keyword, opts.caseInsensitive ? 'i' : '') } catch { return lines.slice() }
    test = (s) => re.test(s)
  } else {
    const k = opts.caseInsensitive ? keyword.toLowerCase() : keyword
    test = (s) => (opts.caseInsensitive ? s.toLowerCase() : s).includes(k)
  }
  return lines.filter((l) => (opts.exclude ? !test(l) : test(l)))
}

export type LineStats = {
  total: number
  nonBlank: number
  blank: number
  unique: number
  chars: number
}

export function stats(lines: string[]): LineStats {
  const nonBlank = lines.filter((l) => l.trim() !== '').length
  return {
    total: lines.length,
    nonBlank,
    blank: lines.length - nonBlank,
    unique: new Set(lines).size,
    chars: lines.reduce((n, l) => n + l.length, 0),
  }
}

/** 文本 ↔ 行数组的便捷封装。 */
export function fromText(text: string): string[] { return splitLines(text) }
export function toText(lines: string[]): string { return lines.join('\n') }
