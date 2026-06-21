/**
 * 轻量 JSON 路径查询。支持：
 *   .key  ['key']  [0]  [-1]  *（通配当前层所有值）  [start:end]（数组切片）
 *   开头可省略 $ 或 .；如 `users[0].name` / `$.users[*].id` / `items[1:3]`
 * 零依赖纯函数。
 */

export type Token =
  | { type: 'key'; name: string }
  | { type: 'index'; index: number }
  | { type: 'wildcard' }
  | { type: 'slice'; start: number | null; end: number | null }

export type ParseResult =
  | { ok: true; tokens: Token[] }
  | { ok: false; message: string }

/** 解析路径表达式为 token 序列。 */
export function parsePath(path: string): ParseResult {
  let s = path.trim()
  if (s.startsWith('$')) s = s.slice(1)
  const tokens: Token[] = []
  let i = 0
  const n = s.length

  while (i < n) {
    const ch = s[i]
    if (ch === '.') {
      i += 1
      if (s[i] === '*') { tokens.push({ type: 'wildcard' }); i += 1; continue }
      // 读 key 到下一个 . [ 结束
      let key = ''
      while (i < n && s[i] !== '.' && s[i] !== '[') { key += s[i]; i += 1 }
      if (key === '') return { ok: false, message: 'empty_key' }
      tokens.push({ type: 'key', name: key })
      continue
    }
    if (ch === '[') {
      const close = s.indexOf(']', i)
      if (close === -1) return { ok: false, message: 'unclosed_bracket' }
      const inner = s.slice(i + 1, close).trim()
      i = close + 1
      if (inner === '*') { tokens.push({ type: 'wildcard' }); continue }
      // 引号 key
      if ((inner.startsWith("'") && inner.endsWith("'")) || (inner.startsWith('"') && inner.endsWith('"'))) {
        tokens.push({ type: 'key', name: inner.slice(1, -1) }); continue
      }
      // 切片 a:b
      if (inner.includes(':')) {
        const [a, b] = inner.split(':')
        const start = a.trim() === '' ? null : Number(a)
        const end = b.trim() === '' ? null : Number(b)
        if ((a.trim() !== '' && Number.isNaN(start)) || (b.trim() !== '' && Number.isNaN(end))) {
          return { ok: false, message: 'bad_slice' }
        }
        tokens.push({ type: 'slice', start, end }); continue
      }
      // 数字索引
      const idx = Number(inner)
      if (!Number.isInteger(idx)) return { ok: false, message: `bad_index:${inner}` }
      tokens.push({ type: 'index', index: idx }); continue
    }
    // 开头第一个裸 key（无前导 .）
    if (tokens.length === 0 || /[A-Za-z0-9_$]/.test(ch)) {
      let key = ''
      while (i < n && s[i] !== '.' && s[i] !== '[') { key += s[i]; i += 1 }
      if (key === '') return { ok: false, message: 'unexpected_char' }
      tokens.push({ type: 'key', name: key })
      continue
    }
    return { ok: false, message: `unexpected_char:${ch}` }
  }
  return { ok: true, tokens }
}

/** 对一个值应用单个 token，返回结果数组（通配/切片可能展开多个）。 */
function step(values: unknown[], tok: Token): unknown[] {
  const out: unknown[] = []
  for (const v of values) {
    if (v == null) continue
    switch (tok.type) {
      case 'key':
        if (typeof v === 'object' && !Array.isArray(v) && tok.name in (v as object)) {
          out.push((v as Record<string, unknown>)[tok.name])
        }
        break
      case 'index': {
        if (Array.isArray(v)) {
          const idx = tok.index < 0 ? v.length + tok.index : tok.index
          if (idx >= 0 && idx < v.length) out.push(v[idx])
        }
        break
      }
      case 'wildcard':
        if (Array.isArray(v)) out.push(...v)
        else if (typeof v === 'object') out.push(...Object.values(v as object))
        break
      case 'slice': {
        if (Array.isArray(v)) {
          const len = v.length
          let start = tok.start ?? 0
          let end = tok.end ?? len
          if (start < 0) start += len
          if (end < 0) end += len
          out.push(...v.slice(Math.max(0, start), Math.max(0, end)))
        }
        break
      }
    }
  }
  return out
}

export type QueryResult =
  | { ok: true; matches: unknown[] }
  | { ok: false; message: string }

/** 在已解析的 JSON 值上跑路径查询。 */
export function queryValue(root: unknown, path: string): QueryResult {
  const parsed = parsePath(path)
  if (!parsed.ok) return { ok: false, message: parsed.message }
  let cur: unknown[] = [root]
  for (const tok of parsed.tokens) {
    cur = step(cur, tok)
  }
  return { ok: true, matches: cur }
}

/** 从 JSON 文本 + 路径直接查询。 */
export function queryJson(jsonText: string, path: string): QueryResult {
  let root: unknown
  try {
    root = JSON.parse(jsonText)
  } catch (e) {
    return { ok: false, message: `bad_json:${(e as Error).message}` }
  }
  return queryValue(root, path)
}
