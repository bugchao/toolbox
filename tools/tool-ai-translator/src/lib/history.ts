/** 翻译历史：仅 localStorage 持久化，支持容量滚动 / 仅手动管理。 */
import { readJson, writeJson } from './storage'
import type { LangCode } from './languages'

export type HistoryEntry = {
  id: string
  /** 创建时间戳（ms） */
  ts: number
  providerId: string
  source: LangCode
  target: LangCode
  input: string
  output: string
}

export type RollingStrategy = 'cap' | 'manual'

export type HistorySettings = {
  strategy: RollingStrategy
  /** strategy='cap' 时生效；'manual' 时仅作展示参考 */
  cap: number
}

export const CAP_OPTIONS = [20, 50, 100, 200] as const

export const DEFAULT_SETTINGS: HistorySettings = { strategy: 'cap', cap: 50 }

const HISTORY_KEY = 'history'
const SETTINGS_KEY = 'history.settings'

function genId(): string {
  return `h${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export function readHistory(): HistoryEntry[] {
  const raw = readJson<HistoryEntry[]>(HISTORY_KEY, [])
  return Array.isArray(raw) ? raw : []
}

export function writeHistory(entries: HistoryEntry[]): void {
  writeJson(HISTORY_KEY, entries)
}

export function readSettings(): HistorySettings {
  const s = readJson<Partial<HistorySettings>>(SETTINGS_KEY, {})
  const strategy: RollingStrategy = s.strategy === 'manual' ? 'manual' : 'cap'
  const cap = typeof s.cap === 'number' && CAP_OPTIONS.includes(s.cap as 20 | 50 | 100 | 200)
    ? s.cap
    : DEFAULT_SETTINGS.cap
  return { strategy, cap }
}

export function writeSettings(next: HistorySettings): void {
  writeJson(SETTINGS_KEY, next)
}

/** 根据策略裁剪到容量内（cap 策略丢弃最旧；manual 不动）。返回新数组。 */
export function applyStrategy(entries: HistoryEntry[], settings: HistorySettings): HistoryEntry[] {
  if (settings.strategy !== 'cap') return entries
  if (entries.length <= settings.cap) return entries
  // 保留最新 cap 条（数组前面是最新）
  return entries.slice(0, settings.cap)
}

/** 加一条新记录（去重：与最新一条完全相同则忽略），按策略裁剪后返回。 */
export function addEntry(
  cur: HistoryEntry[],
  patch: Omit<HistoryEntry, 'id' | 'ts'>,
  settings: HistorySettings = DEFAULT_SETTINGS,
): HistoryEntry[] {
  const trimmed = patch.input.trim()
  if (!trimmed || !patch.output.trim()) return cur
  const head = cur[0]
  if (
    head &&
    head.input === patch.input &&
    head.output === patch.output &&
    head.providerId === patch.providerId &&
    head.source === patch.source &&
    head.target === patch.target
  ) {
    return cur
  }
  const entry: HistoryEntry = { ...patch, id: genId(), ts: Date.now() }
  return applyStrategy([entry, ...cur], settings)
}

export function removeEntry(cur: HistoryEntry[], id: string): HistoryEntry[] {
  return cur.filter((e) => e.id !== id)
}

export function clearAll(): HistoryEntry[] {
  return []
}

/** 当前条数 + 上限提示（cap 策略下接近上限给出警告） */
export function capacityHint(entries: HistoryEntry[], settings: HistorySettings): {
  count: number
  cap: number | null
  nearLimit: boolean
} {
  if (settings.strategy === 'manual') {
    return { count: entries.length, cap: null, nearLimit: false }
  }
  return {
    count: entries.length,
    cap: settings.cap,
    nearLimit: entries.length >= Math.floor(settings.cap * 0.9),
  }
}
