/**
 * Cron 表达式解析与下次运行时间计算。零运行时依赖，纯函数。
 *
 * 支持标准 5 字段（分 时 日 月 周）：* , - / ，月份/星期英文缩写，7=周日，
 * 以及常见别名 @yearly/@annually/@monthly/@weekly/@daily/@midnight/@hourly。
 *
 * 日/周字段遵循 POSIX/Vixie cron 语义：当两者都「受限」（不以 * 开头）时取并集（OR）。
 */

export type FieldKind = 'minute' | 'hour' | 'dom' | 'month' | 'dow'

export const FIELD_KINDS: FieldKind[] = ['minute', 'hour', 'dom', 'month', 'dow']

/** 各字段取值范围（含端点）。dow 允许 0-7，7 与 0 都表示周日。 */
const FIELD_RANGE: Record<FieldKind, { min: number; max: number }> = {
  minute: { min: 0, max: 59 },
  hour: { min: 0, max: 23 },
  dom: { min: 1, max: 31 },
  month: { min: 1, max: 12 },
  dow: { min: 0, max: 7 },
}

const MONTH_NAMES: Record<string, number> = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
}

const DOW_NAMES: Record<string, number> = {
  sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6,
}

/** 常见别名映射到标准 5 字段表达式。 */
export const CRON_ALIASES: Record<string, string> = {
  '@yearly': '0 0 1 1 *',
  '@annually': '0 0 1 1 *',
  '@monthly': '0 0 1 * *',
  '@weekly': '0 0 * * 0',
  '@daily': '0 0 * * *',
  '@midnight': '0 0 * * *',
  '@hourly': '0 * * * *',
}

export type CronErrorCode =
  | 'empty'
  | 'unknownAlias'
  | 'fieldCount'
  | 'invalidValue'
  | 'outOfRange'
  | 'rangeOrder'
  | 'invalidStep'

export interface CronErrorParams {
  value?: string
  min?: number
  max?: number
  from?: number
  to?: number
  count?: number
}

/** 解析错误，携带出错字段与原因，供 UI 用 i18n key 渲染。 */
export class CronParseError extends Error {
  code: CronErrorCode
  field: FieldKind | null
  params: CronErrorParams

  constructor(code: CronErrorCode, field: FieldKind | null, params: CronErrorParams = {}) {
    super(code)
    this.name = 'CronParseError'
    this.code = code
    this.field = field
    this.params = params
  }
}

export interface ParsedCron {
  /** 规范化后的 5 字段原始字符串（已展开别名、大写名转换不变）。 */
  raw: Record<FieldKind, string>
  /** 每个字段允许的取值集合（已排序去重；dow 中 7 归一为 0）。 */
  values: Record<FieldKind, number[]>
  /** 字段是否「受限」（不以 * 开头）。用于日/周并集判断。 */
  restricted: Record<FieldKind, boolean>
}

function isStarred(raw: string): boolean {
  return raw.startsWith('*')
}

/** 把单个 token 内的名称（月/星期缩写）转成数字字符串；其余原样返回。 */
function resolveName(token: string, kind: FieldKind): string {
  const lower = token.toLowerCase()
  if (kind === 'month' && lower in MONTH_NAMES) return String(MONTH_NAMES[lower])
  if (kind === 'dow' && lower in DOW_NAMES) return String(DOW_NAMES[lower])
  return token
}

function toInt(token: string, kind: FieldKind): number {
  const resolved = resolveName(token, kind)
  if (!/^\d+$/.test(resolved)) {
    throw new CronParseError('invalidValue', kind, { value: token })
  }
  return Number(resolved)
}

function ensureInRange(n: number, kind: FieldKind, original: string): void {
  const { min, max } = FIELD_RANGE[kind]
  if (n < min || n > max) {
    throw new CronParseError('outOfRange', kind, { value: original, min, max })
  }
}

/** 解析单个字段为取值集合。支持 * , - / 与名称。 */
function parseField(raw: string, kind: FieldKind): number[] {
  const { min, max } = FIELD_RANGE[kind]
  const set = new Set<number>()

  for (const part of raw.split(',')) {
    if (part === '') throw new CronParseError('invalidValue', kind, { value: raw })

    // 拆出步进
    let body = part
    let step = 1
    const slash = part.indexOf('/')
    if (slash !== -1) {
      body = part.slice(0, slash)
      const stepStr = part.slice(slash + 1)
      if (!/^\d+$/.test(stepStr) || Number(stepStr) === 0) {
        throw new CronParseError('invalidStep', kind, { value: part })
      }
      step = Number(stepStr)
    }

    let lo: number
    let hi: number
    if (body === '*') {
      lo = min
      hi = max
    } else if (body.includes('-')) {
      const [a, b] = body.split('-')
      if (a === undefined || b === undefined || body.split('-').length !== 2) {
        throw new CronParseError('invalidValue', kind, { value: part })
      }
      lo = toInt(a, kind)
      hi = toInt(b, kind)
      ensureInRange(lo, kind, part)
      ensureInRange(hi, kind, part)
      if (lo > hi) throw new CronParseError('rangeOrder', kind, { from: lo, to: hi })
    } else {
      // 单值。带步进时（如 5/10）表示 5 到 max。
      lo = toInt(body, kind)
      ensureInRange(lo, kind, part)
      hi = slash !== -1 ? max : lo
    }

    for (let v = lo; v <= hi; v += step) set.add(v)
  }

  // dow：7 归一为 0（周日）
  if (kind === 'dow' && set.has(7)) {
    set.delete(7)
    set.add(0)
  }

  return [...set].sort((a, b) => a - b)
}

/** 把任意输入规范化为标准 5 字段表达式（展开别名、压缩空白）。 */
export function normalizeExpression(input: string): string {
  const trimmed = input.trim()
  if (trimmed === '') throw new CronParseError('empty', null)

  if (trimmed.startsWith('@')) {
    const alias = trimmed.toLowerCase()
    const expanded = CRON_ALIASES[alias]
    if (!expanded) throw new CronParseError('unknownAlias', null, { value: trimmed })
    return expanded
  }
  return trimmed.replace(/\s+/g, ' ')
}

/** 解析一个 cron 表达式。失败抛出 CronParseError。 */
export function parseCron(input: string): ParsedCron {
  const expr = normalizeExpression(input)
  const parts = expr.split(' ')
  if (parts.length !== 5) {
    throw new CronParseError('fieldCount', null, { count: parts.length })
  }

  const raw: Record<FieldKind, string> = {
    minute: parts[0],
    hour: parts[1],
    dom: parts[2],
    month: parts[3],
    dow: parts[4],
  }

  const values = {} as Record<FieldKind, number[]>
  const restricted = {} as Record<FieldKind, boolean>
  for (const kind of FIELD_KINDS) {
    values[kind] = parseField(raw[kind], kind)
    restricted[kind] = !isStarred(raw[kind])
  }

  return { raw, values, restricted }
}

/** 判断某个日期的「日」是否匹配（处理 POSIX 日/周并集语义）。 */
function dayMatches(date: Date, parsed: ParsedCron): boolean {
  const domOk = parsed.values.dom.includes(date.getDate())
  const dowOk = parsed.values.dow.includes(date.getDay())
  const { dom, dow } = parsed.restricted
  if (dom && dow) return domOk || dowOk
  if (dom) return domOk
  if (dow) return dowOk
  return true
}

const MAX_ITERATIONS = 500_000

/** 从 from 之后（不含 from）求下一个匹配时间。基于本地时区。无解返回 null。 */
export function getNextRun(parsed: ParsedCron, from: Date): Date | null {
  const d = new Date(from.getTime())
  d.setSeconds(0, 0)
  d.setMinutes(d.getMinutes() + 1)

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    if (!parsed.values.month.includes(d.getMonth() + 1)) {
      // 跳到下个月 1 号 0 点
      d.setDate(1)
      d.setHours(0, 0, 0, 0)
      d.setMonth(d.getMonth() + 1)
      continue
    }
    if (!dayMatches(d, parsed)) {
      d.setHours(0, 0, 0, 0)
      d.setDate(d.getDate() + 1)
      continue
    }
    if (!parsed.values.hour.includes(d.getHours())) {
      d.setMinutes(0, 0, 0)
      d.setHours(d.getHours() + 1)
      continue
    }
    if (!parsed.values.minute.includes(d.getMinutes())) {
      d.setSeconds(0, 0)
      d.setMinutes(d.getMinutes() + 1)
      continue
    }
    return d
  }
  return null
}

/** 求接下来的 count 个匹配时间。 */
export function getNextRuns(parsed: ParsedCron, from: Date, count: number): Date[] {
  const out: Date[] = []
  let cursor = from
  for (let i = 0; i < count; i++) {
    const next = getNextRun(parsed, cursor)
    if (!next) break
    out.push(next)
    cursor = next
  }
  return out
}

/** 描述一个字段的结构，供 UI 用 i18n 渲染为人话。 */
export type FieldSummary =
  | { type: 'every' }
  | { type: 'step'; step: number }
  | { type: 'stepRange'; step: number; from: number; to: number }
  | { type: 'range'; from: number; to: number }
  | { type: 'values'; values: number[] }

/** 从原始字段字符串与解析结果推导描述结构。 */
export function summarizeField(rawField: string, kind: FieldKind, values: number[]): FieldSummary {
  if (rawField === '*') return { type: 'every' }

  // 仅由单一 token 构成时，识别 step / stepRange / range
  if (!rawField.includes(',')) {
    const stepMatch = rawField.match(/^(.+)\/(\d+)$/)
    if (stepMatch) {
      const body = stepMatch[1]
      const step = Number(stepMatch[2])
      if (body === '*') return { type: 'step', step }
      const rangeMatch = body.match(/^(\w+)-(\w+)$/)
      if (rangeMatch) {
        return {
          type: 'stepRange',
          step,
          from: toInt(rangeMatch[1], kind),
          to: toInt(rangeMatch[2], kind),
        }
      }
      // 单值带步进（如 5/10）：从该值起到 max
      return { type: 'step', step }
    }
    const rangeOnly = rawField.match(/^(\w+)-(\w+)$/)
    if (rangeOnly) {
      let from = toInt(rangeOnly[1], kind)
      let to = toInt(rangeOnly[2], kind)
      if (kind === 'dow') {
        if (from === 7) from = 0
        if (to === 7) to = 0
      }
      return { type: 'range', from, to }
    }
  }

  return { type: 'values', values }
}
