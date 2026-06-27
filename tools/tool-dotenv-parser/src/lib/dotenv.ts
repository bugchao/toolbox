/**
 * .env 解析与多格式序列化纯逻辑。
 * 所有逻辑均在浏览器本地执行，不依赖第三方 dotenv 库。
 */

export type Quote = 'none' | 'single' | 'double'

export interface EnvEntry {
  key: string
  value: string
  /** 源文件中的行号（1-based）；来自 JSON 输入时为 0 */
  line: number
  quoted: Quote
  hadExport: boolean
}

export interface ParseStats {
  /** 有效键值对数量 */
  total: number
  /** 注释行数量 */
  comments: number
  /** 空行数量 */
  blanks: number
}

export type IssueType =
  | 'duplicate'
  | 'empty-key'
  | 'invalid-key'
  | 'suspicious-unquoted'
  | 'no-equals'

export interface ParseIssue {
  type: IssueType
  key?: string
  line?: number
  /** 触发该提示的原始文本片段 */
  raw?: string
}

export interface ParseResult {
  entries: EnvEntry[]
  stats: ParseStats
  issues: ParseIssue[]
}

export type OutputFormat = 'env' | 'json' | 'yaml' | 'shell'
export type InputFormat = 'env' | 'json'

export const VALID_KEY_RE = /^[A-Za-z_][A-Za-z0-9_]*$/

/** 还原双引号值中的转义序列 */
function unescapeDouble(content: string): string {
  let out = ''
  for (let i = 0; i < content.length; i++) {
    const c = content[i]
    if (c === '\\' && i + 1 < content.length) {
      const next = content[i + 1]
      switch (next) {
        case 'n':
          out += '\n'
          break
        case 'r':
          out += '\r'
          break
        case 't':
          out += '\t'
          break
        case 'f':
          out += '\f'
          break
        case 'b':
          out += '\b'
          break
        case '\\':
          out += '\\'
          break
        case '"':
          out += '"'
          break
        case "'":
          out += "'"
          break
        case '`':
          out += '`'
          break
        case '$':
          out += '$'
          break
        default:
          out += next
      }
      i++
      continue
    }
    out += c
  }
  return out
}

/** 解析单个值，识别引号类型并处理行内注释 */
function parseValue(raw: string): { value: string; quoted: Quote } {
  const s = raw.replace(/^[ \t]+/, '')

  if (s.startsWith('"')) {
    let out = ''
    let i = 1
    while (i < s.length) {
      const c = s[i]
      if (c === '\\' && i + 1 < s.length) {
        out += s[i] + s[i + 1]
        i += 2
        continue
      }
      if (c === '"') {
        return { value: unescapeDouble(out), quoted: 'double' }
      }
      out += c
      i++
    }
    // 未闭合：尽力还原剩余内容
    return { value: unescapeDouble(out), quoted: 'double' }
  }

  if (s.startsWith("'")) {
    const end = s.indexOf("'", 1)
    if (end !== -1) {
      return { value: s.slice(1, end), quoted: 'single' }
    }
    return { value: s.slice(1), quoted: 'single' }
  }

  // 未加引号：仅当 # 前有空白时才视为行内注释
  let body = s
  const m = body.match(/\s#/)
  if (m && m.index !== undefined) {
    body = body.slice(0, m.index)
  }
  body = body.replace(/[ \t]+$/, '')
  return { value: body, quoted: 'none' }
}

/** 解析 .env 文本内容 */
export function parseDotenv(input: string): ParseResult {
  const entries: EnvEntry[] = []
  const issues: ParseIssue[] = []
  let comments = 0
  let blanks = 0

  const lines = input.split('\n')
  for (let idx = 0; idx < lines.length; idx++) {
    const rawLine = lines[idx].replace(/\r$/, '')
    const lineNo = idx + 1
    const trimmed = rawLine.trim()

    if (trimmed === '') {
      blanks++
      continue
    }
    if (trimmed.startsWith('#')) {
      comments++
      continue
    }

    // 去掉 export 前缀
    let work = rawLine.replace(/^[ \t]*/, '')
    let hadExport = false
    const exportMatch = work.match(/^export[ \t]+/)
    if (exportMatch) {
      hadExport = true
      work = work.slice(exportMatch[0].length)
    }

    const eq = work.indexOf('=')
    if (eq === -1) {
      issues.push({ type: 'no-equals', line: lineNo, raw: trimmed })
      continue
    }

    const key = work.slice(0, eq).trim()
    const { value, quoted } = parseValue(work.slice(eq + 1))

    if (key === '') {
      issues.push({ type: 'empty-key', line: lineNo, raw: trimmed })
      continue
    }

    if (!VALID_KEY_RE.test(key)) {
      issues.push({ type: 'invalid-key', key, line: lineNo, raw: trimmed })
    }

    if (quoted === 'none' && /\s/.test(value) && value !== '') {
      issues.push({ type: 'suspicious-unquoted', key, line: lineNo, raw: trimmed })
    }

    entries.push({ key, value, line: lineNo, quoted, hadExport })
  }

  // 重复 key 检测
  const seen = new Set<string>()
  for (const e of entries) {
    if (seen.has(e.key)) {
      issues.push({ type: 'duplicate', key: e.key, line: e.line })
    } else {
      seen.add(e.key)
    }
  }

  return {
    entries,
    stats: { total: entries.length, comments, blanks },
    issues,
  }
}

/**
 * 解析 JSON 对象输入为 entries。
 * 值的转换：字符串原样；数字/布尔转字符串；null → 空字符串；对象/数组 → JSON.stringify。
 */
export function parseJsonObject(input: string): { ok: true; result: ParseResult } | { ok: false; message: string } {
  let parsed: unknown
  try {
    parsed = JSON.parse(input)
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : String(err) }
  }
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return { ok: false, message: 'not-an-object' }
  }

  const entries: EnvEntry[] = []
  const issues: ParseIssue[] = []
  for (const [key, rawVal] of Object.entries(parsed as Record<string, unknown>)) {
    let value: string
    if (rawVal === null || rawVal === undefined) {
      value = ''
    } else if (typeof rawVal === 'string') {
      value = rawVal
    } else if (typeof rawVal === 'number' || typeof rawVal === 'boolean') {
      value = String(rawVal)
    } else {
      value = JSON.stringify(rawVal)
    }

    if (key === '') {
      issues.push({ type: 'empty-key', key })
      continue
    }
    if (!VALID_KEY_RE.test(key)) {
      issues.push({ type: 'invalid-key', key })
    }
    entries.push({ key, value, line: 0, quoted: 'none', hadExport: false })
  }

  return {
    ok: true,
    result: {
      entries,
      stats: { total: entries.length, comments: 0, blanks: 0 },
      issues,
    },
  }
}

/** 解析任意输入（自动按 inputFormat 分派） */
export function parseInput(input: string, format: InputFormat):
  | { ok: true; result: ParseResult }
  | { ok: false; message: string } {
  if (format === 'json') {
    return parseJsonObject(input)
  }
  return { ok: true, result: parseDotenv(input) }
}

/** 后写覆盖先写，得到去重后的有序 entries */
function dedupe(entries: EnvEntry[]): EnvEntry[] {
  const map = new Map<string, EnvEntry>()
  for (const e of entries) {
    map.set(e.key, e)
  }
  return Array.from(map.values())
}

export function toJson(entries: EnvEntry[]): string {
  const obj: Record<string, string> = {}
  for (const e of entries) obj[e.key] = e.value
  return JSON.stringify(obj, null, 2)
}

function yamlNeedsQuote(value: string): boolean {
  if (value === '') return true
  if (/^\s|\s$/.test(value)) return true
  if (/[:#\n\r\t"'{}[\],&*?|<>=!%@`]/.test(value)) return true
  // 看起来像布尔/数字/null 的标量需要加引号以保持字符串语义
  if (/^(true|false|null|yes|no|on|off|~)$/i.test(value)) return true
  if (/^[-+]?(\d+\.?\d*|\.\d+)([eE][-+]?\d+)?$/.test(value)) return true
  return false
}

export function toYaml(entries: EnvEntry[]): string {
  return dedupe(entries)
    .map((e) => {
      const v = yamlNeedsQuote(e.value) ? JSON.stringify(e.value) : e.value
      return `${e.key}: ${v}`
    })
    .join('\n')
}

function escapeShell(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\$/g, '\\$')
    .replace(/`/g, '\\`')
}

export function toShell(entries: EnvEntry[]): string {
  return dedupe(entries)
    .map((e) => `export ${e.key}="${escapeShell(e.value)}"`)
    .join('\n')
}

function envValueNeedsQuote(value: string): boolean {
  if (value === '') return false
  if (/^\s|\s$/.test(value)) return true
  if (/[\n\r\t"'#]/.test(value)) return true
  if (/\s/.test(value)) return true
  return false
}

function escapeEnv(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t')
}

/** 还原为规范化的 .env 文本 */
export function toEnv(entries: EnvEntry[]): string {
  return dedupe(entries)
    .map((e) => {
      if (e.value === '') return `${e.key}=`
      if (envValueNeedsQuote(e.value)) return `${e.key}="${escapeEnv(e.value)}"`
      return `${e.key}=${e.value}`
    })
    .join('\n')
}

export function serialize(entries: EnvEntry[], format: OutputFormat): string {
  switch (format) {
    case 'json':
      return toJson(entries)
    case 'yaml':
      return toYaml(entries)
    case 'shell':
      return toShell(entries)
    case 'env':
    default:
      return toEnv(entries)
  }
}
