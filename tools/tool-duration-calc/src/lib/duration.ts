/** 时长解析 / 单位互转 / 人性化。零依赖纯函数。基准单位：毫秒。 */

export const MS = {
  ms: 1,
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
  w: 7 * 24 * 60 * 60 * 1000,
} as const

export type Unit = keyof typeof MS

export type ParseResult =
  | { ok: true; ms: number }
  | { ok: false; message: string }

const TOKEN_RE = /(-?\d+(?:\.\d+)?)\s*(ms|s|m|h|d|w)/gi

/**
 * 解析人类时长串，如 "1d2h30m"、"90 min"、"1.5h"、"500ms"。
 * 也接受纯数字（按秒）。多个单位累加。
 */
export function parseDuration(input: string): ParseResult {
  const trimmed = input.trim()
  if (!trimmed) return { ok: false, message: 'empty' }

  // 纯数字 → 秒
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
    return { ok: true, ms: Number(trimmed) * MS.s }
  }

  let total = 0
  let matched = false
  let lastIndex = 0
  TOKEN_RE.lastIndex = 0
  let m: RegExpExecArray | null
  // 校验：去掉所有合法 token + 空白后应为空
  const stripped = trimmed.replace(TOKEN_RE, '').replace(/\s+/g, '')
  if (stripped !== '') return { ok: false, message: 'unrecognized' }

  while ((m = TOKEN_RE.exec(trimmed)) !== null) {
    matched = true
    const value = Number(m[1])
    const unit = m[2].toLowerCase() as Unit
    total += value * MS[unit]
    lastIndex = TOKEN_RE.lastIndex
  }
  void lastIndex
  if (!matched) return { ok: false, message: 'unrecognized' }
  return { ok: true, ms: total }
}

/** ms → 指定单位的数值。 */
export function toUnit(ms: number, unit: Unit): number {
  return ms / MS[unit]
}

/** ms → 所有单位的换算表。 */
export function toAllUnits(ms: number): Record<Unit, number> {
  return {
    ms: ms / MS.ms,
    s: ms / MS.s,
    m: ms / MS.m,
    h: ms / MS.h,
    d: ms / MS.d,
    w: ms / MS.w,
  }
}

/**
 * 人性化：把 ms 拆成 d/h/m/s（默认）紧凑串。
 * - 7320000 → "2h 2m"
 * - 0 → "0s"
 * - 负数保留符号
 */
export function humanize(ms: number, opts: { maxUnits?: number; includeMs?: boolean } = {}): string {
  const maxUnits = opts.maxUnits ?? 0 // 0 = 全部
  const neg = ms < 0
  // includeMs 时按整 ms，否则四舍五入到整秒
  let rem = opts.includeMs ? Math.round(Math.abs(ms)) : Math.round(Math.abs(ms) / 1000) * 1000

  const order: { unit: Unit; label: string }[] = [
    { unit: 'd', label: 'd' },
    { unit: 'h', label: 'h' },
    { unit: 'm', label: 'm' },
    { unit: 's', label: 's' },
  ]
  if (opts.includeMs) order.push({ unit: 'ms', label: 'ms' })

  const parts: string[] = []
  for (const { unit, label } of order) {
    const size = MS[unit]
    const v = Math.floor(rem / size)
    if (v > 0) { parts.push(`${v}${label}`); rem -= v * size }
    if (maxUnits > 0 && parts.length >= maxUnits) break
  }
  if (parts.length === 0) return opts.includeMs ? '0ms' : '0s'
  return (neg ? '-' : '') + parts.join(' ')
}

/** 时钟格式 HH:MM:SS（超 24h 进位到大时数）。 */
export function clockFormat(ms: number): string {
  const neg = ms < 0
  let total = Math.floor(Math.abs(ms) / 1000)
  const s = total % 60; total = Math.floor(total / 60)
  const m = total % 60; total = Math.floor(total / 60)
  const h = total
  const pad = (n: number) => String(n).padStart(2, '0')
  return (neg ? '-' : '') + `${pad(h)}:${pad(m)}:${pad(s)}`
}

/** 基准时间加/减时长，返回新 Date。 */
export function addToDate(base: Date, ms: number): Date {
  return new Date(base.getTime() + ms)
}
