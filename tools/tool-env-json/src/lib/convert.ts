/** .env ↔ JSON（扁平 string map）互转。零依赖，纯函数。 */

export type EnvMap = Record<string, string>

export type ParseResult =
  | { ok: true; map: EnvMap; skipped: number }
  | { ok: false; message: string }

/**
 * 解析 .env 文本。规则（dotenv 兼容子集）：
 * - 忽略空行与 # 注释行
 * - 可选 `export ` 前缀
 * - KEY=VALUE；KEY 仅允许 [A-Za-z_][A-Za-z0-9_]*
 * - 双引号值：支持 \n \t \r \\ \" 转义、可跨保留换行
 * - 单引号值：原样（不解析转义）
 * - 无引号值：剥行内 # 注释（前面有空格）+ 去首尾空白
 */
export function parseEnv(text: string): ParseResult {
  if (!text.trim()) return { ok: true, map: {}, skipped: 0 }
  const map: EnvMap = {}
  let skipped = 0
  const lines = text.split('\n')
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i]
    const trimmed = line.trim()
    if (trimmed === '' || trimmed.startsWith('#')) continue

    // 去掉 export 前缀
    line = line.replace(/^\s*export\s+/, '')
    const eq = line.indexOf('=')
    if (eq === -1) { skipped += 1; continue }

    const key = line.slice(0, eq).trim()
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) { skipped += 1; continue }

    let rest = line.slice(eq + 1)
    // 去掉前导空白（值定义允许 KEY = value）
    rest = rest.replace(/^[ \t]+/, '')

    let value: string
    if (rest.startsWith('"')) {
      // 双引号：可能跨行直到配对的未转义 "
      const parsed = readDoubleQuoted(rest.slice(1), lines, i)
      value = parsed.value
      i = parsed.lineIndex
    } else if (rest.startsWith("'")) {
      const parsed = readSingleQuoted(rest.slice(1), lines, i)
      value = parsed.value
      i = parsed.lineIndex
    } else {
      // 无引号：剥行内注释（空格 + #）
      const hash = rest.search(/\s+#/)
      value = (hash === -1 ? rest : rest.slice(0, hash)).trim()
    }
    map[key] = value
  }
  return { ok: true, map, skipped }
}

function readDoubleQuoted(start: string, lines: string[], lineIndex: number): { value: string; lineIndex: number } {
  let buf = ''
  let s = start
  let li = lineIndex
  for (;;) {
    let i = 0
    while (i < s.length) {
      const ch = s[i]
      if (ch === '\\') {
        const next = s[i + 1]
        if (next === 'n') buf += '\n'
        else if (next === 't') buf += '\t'
        else if (next === 'r') buf += '\r'
        else if (next === '"') buf += '"'
        else if (next === '\\') buf += '\\'
        else buf += next ?? '\\'
        i += 2
        continue
      }
      if (ch === '"') return { value: buf, lineIndex: li }
      buf += ch
      i += 1
    }
    // 未闭合，续下一行
    if (li + 1 >= lines.length) return { value: buf, lineIndex: li }
    li += 1
    buf += '\n'
    s = lines[li]
  }
}

function readSingleQuoted(start: string, lines: string[], lineIndex: number): { value: string; lineIndex: number } {
  let buf = ''
  let s = start
  let li = lineIndex
  for (;;) {
    const q = s.indexOf("'")
    if (q !== -1) { buf += s.slice(0, q); return { value: buf, lineIndex: li } }
    buf += s
    if (li + 1 >= lines.length) return { value: buf, lineIndex: li }
    li += 1
    buf += '\n'
    s = lines[li]
  }
}

// ───────────── 序列化 ─────────────

export type EnvifyOptions = {
  /** 是否加 export 前缀 */
  exportPrefix?: boolean
  /** 是否给所有值加双引号（默认仅按需） */
  alwaysQuote?: boolean
}

const NEEDS_QUOTE_RE = /[\s#'"\\]|^$/

function envQuote(value: string, always: boolean): string {
  const needs = always || NEEDS_QUOTE_RE.test(value) || value.includes('\n')
  if (!needs) return value
  const escaped = value
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\t/g, '\\t')
    .replace(/\r/g, '\\r')
  return `"${escaped}"`
}

export function toEnv(map: EnvMap, options: EnvifyOptions = {}): string {
  const prefix = options.exportPrefix ? 'export ' : ''
  return Object.entries(map)
    .map(([k, v]) => `${prefix}${k}=${envQuote(String(v), options.alwaysQuote ?? false)}`)
    .join('\n')
}

// ───────────── JSON 侧 ─────────────

export type JsonResult =
  | { ok: true; map: EnvMap }
  | { ok: false; message: string }

/** JSON → 扁平 string map。值非字符串则 String() 化；拒非对象根。 */
export function jsonToMap(text: string): JsonResult {
  if (!text.trim()) return { ok: true, map: {} }
  let v: unknown
  try {
    v = JSON.parse(text)
  } catch (e) {
    return { ok: false, message: (e as Error).message ?? 'bad_json' }
  }
  if (v === null || typeof v !== 'object' || Array.isArray(v)) {
    return { ok: false, message: 'root_must_be_object' }
  }
  const map: EnvMap = {}
  for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
    if (val === null) { map[k] = ''; continue }
    if (typeof val === 'object') {
      // 嵌套对象 → JSON 串（.env 是扁平的）
      map[k] = JSON.stringify(val)
    } else {
      map[k] = String(val)
    }
  }
  return { ok: true, map }
}

export function mapToJson(map: EnvMap, indent: 2 | 4 = 2): string {
  return JSON.stringify(map, null, indent)
}
