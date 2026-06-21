/** 标准 5 字段 cron 解析 + 人类可读描述 + 下次运行计算。零依赖，纯函数。 */

export type CronField = {
  /** 命中的取值集合（已展开 * , - /） */
  values: Set<number>
  /** 是否是 `*`（用于 DOM/DOW 的 OR 语义判定） */
  isWildcard: boolean
}

export type ParsedCron = {
  minute: CronField
  hour: CronField
  dom: CronField // day of month 1-31
  month: CronField // 1-12
  dow: CronField // day of week 0-6 (0=Sun)
}

export type ParseResult =
  | { ok: true; cron: ParsedCron }
  | { ok: false; message: string; field?: string }

type Range = { min: number; max: number }

const RANGES: Record<string, Range> = {
  minute: { min: 0, max: 59 },
  hour: { min: 0, max: 23 },
  dom: { min: 1, max: 31 },
  month: { min: 1, max: 12 },
  dow: { min: 0, max: 6 },
}

const MONTH_ALIAS: Record<string, number> = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
}
const DOW_ALIAS: Record<string, number> = {
  sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6,
}

function resolveAlias(token: string, field: string): string {
  const lower = token.toLowerCase()
  if (field === 'month' && lower in MONTH_ALIAS) return String(MONTH_ALIAS[lower])
  if (field === 'dow' && lower in DOW_ALIAS) return String(DOW_ALIAS[lower])
  return token
}

/** 解析单个字段为取值集合。 */
function parseField(raw: string, field: string): { ok: true; result: CronField } | { ok: false; message: string } {
  const range = RANGES[field]
  const values = new Set<number>()
  const isWildcard = raw === '*' || raw === '*/1'

  for (const part of raw.split(',')) {
    // step: base/step
    let base = part
    let step = 1
    const slash = part.indexOf('/')
    if (slash !== -1) {
      base = part.slice(0, slash)
      const stepStr = part.slice(slash + 1)
      step = Number(stepStr)
      if (!Number.isInteger(step) || step <= 0) return { ok: false, message: `bad step "${stepStr}"` }
    }

    let lo: number
    let hi: number
    if (base === '*' || base === '') {
      lo = range.min
      hi = range.max
    } else if (base.includes('-')) {
      const [a, b] = base.split('-')
      lo = Number(resolveAlias(a, field))
      hi = Number(resolveAlias(b, field))
    } else {
      lo = hi = Number(resolveAlias(base, field))
    }
    if (!Number.isInteger(lo) || !Number.isInteger(hi)) return { ok: false, message: `bad value "${part}"` }
    // dow: 接受 7 作为周日
    if (field === 'dow') { if (lo === 7) lo = 0; if (hi === 7) hi = 0 }
    if (lo < range.min || hi > range.max || lo > hi) {
      return { ok: false, message: `out of range "${part}" (${range.min}-${range.max})` }
    }
    for (let v = lo; v <= hi; v += step) values.add(v)
  }
  if (values.size === 0) return { ok: false, message: `empty field "${raw}"` }
  return { ok: true, result: { values, isWildcard } }
}

export function parseCron(expr: string): ParseResult {
  const trimmed = expr.trim().replace(/\s+/g, ' ')
  if (!trimmed) return { ok: false, message: 'empty' }
  const parts = trimmed.split(' ')
  if (parts.length !== 5) {
    return { ok: false, message: `expected 5 fields, got ${parts.length}` }
  }
  const names = ['minute', 'hour', 'dom', 'month', 'dow'] as const
  const out: Partial<ParsedCron> = {}
  for (let i = 0; i < 5; i++) {
    const r = parseField(parts[i], names[i])
    if (!r.ok) return { ok: false, message: r.message, field: names[i] }
    out[names[i]] = r.result
  }
  return { ok: true, cron: out as ParsedCron }
}

/** 某个时刻是否匹配该 cron。DOM/DOW 都非通配时用 OR 语义（cron 标准行为）。 */
export function matches(cron: ParsedCron, d: Date): boolean {
  if (!cron.minute.values.has(d.getMinutes())) return false
  if (!cron.hour.values.has(d.getHours())) return false
  if (!cron.month.values.has(d.getMonth() + 1)) return false

  const domMatch = cron.dom.values.has(d.getDate())
  const dowMatch = cron.dow.values.has(d.getDay())

  if (cron.dom.isWildcard && cron.dow.isWildcard) return true
  if (cron.dom.isWildcard) return dowMatch
  if (cron.dow.isWildcard) return domMatch
  // 两者都限制 → OR
  return domMatch || dowMatch
}

/** 从 from（不含）起算，找接下来 count 个匹配时刻。逐分钟步进，封顶约 1 年。 */
export function nextRuns(cron: ParsedCron, from: Date, count = 5): Date[] {
  const out: Date[] = []
  const cur = new Date(from.getTime())
  cur.setSeconds(0, 0)
  cur.setMinutes(cur.getMinutes() + 1)
  const CAP = 366 * 24 * 60 // ~1 年的分钟数
  let i = 0
  while (out.length < count && i < CAP) {
    if (matches(cron, cur)) out.push(new Date(cur.getTime()))
    cur.setMinutes(cur.getMinutes() + 1)
    i++
  }
  return out
}

// ───────────── 人类可读描述 ─────────────

function describeField(f: CronField, range: Range, unit: string): string {
  if (f.isWildcard) return `every ${unit}`
  const sorted = [...f.values].sort((a, b) => a - b)
  if (sorted.length === 1) return `at ${unit} ${sorted[0]}`
  // 等差判定 → "every N"
  if (sorted.length > 2) {
    const stepGuess = sorted[1] - sorted[0]
    const isArith = sorted.every((v, i) => i === 0 || v - sorted[i - 1] === stepGuess)
    if (isArith && sorted[0] === range.min && stepGuess > 1) {
      return `every ${stepGuess} ${unit}s`
    }
  }
  if (sorted.length > 6) return `${sorted.length} selected ${unit}s`
  return `at ${unit}s ${sorted.join(', ')}`
}

const DOW_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH_NAMES = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** 生成英文摘要（zh 文案由 UI 层组合 i18n key；这里给独立可测的英文串）。 */
export function describeEnglish(cron: ParsedCron): string {
  const parts: string[] = []
  parts.push(cron.minute.isWildcard ? 'every minute' : describeField(cron.minute, RANGES.minute, 'minute'))
  if (!cron.hour.isWildcard) parts.push(describeField(cron.hour, RANGES.hour, 'hour'))
  if (!cron.dom.isWildcard) {
    const days = [...cron.dom.values].sort((a, b) => a - b)
    parts.push(days.length <= 6 ? `on day-of-month ${days.join(', ')}` : `on ${days.length} days of the month`)
  }
  if (!cron.month.isWildcard) {
    const months = [...cron.month.values].sort((a, b) => a - b).map((m) => MONTH_NAMES[m])
    parts.push(`in ${months.join(', ')}`)
  }
  if (!cron.dow.isWildcard) {
    const dows = [...cron.dow.values].sort((a, b) => a - b).map((w) => DOW_NAMES[w])
    parts.push(`on ${dows.join(', ')}`)
  }
  return parts.join(', ')
}

/** 常见预设。 */
export const PRESETS: { expr: string; key: string }[] = [
  { expr: '* * * * *', key: 'everyMinute' },
  { expr: '*/5 * * * *', key: 'every5Min' },
  { expr: '0 * * * *', key: 'hourly' },
  { expr: '0 0 * * *', key: 'daily' },
  { expr: '0 9 * * 1-5', key: 'weekdays9am' },
  { expr: '0 0 * * 0', key: 'weekly' },
  { expr: '0 0 1 * *', key: 'monthly' },
  { expr: '0 0 1 1 *', key: 'yearly' },
]
