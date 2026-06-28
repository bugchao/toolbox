// 本地历史记录：mermaid 源码快照，存于 localStorage，纯客户端、不上传。
export interface HistoryEntry {
  id: string
  name: string
  src: string
  ts: number
}

const KEY = 'tool-mermaid:history'
const MAX = 20
const NAME_MAX = 40

/** 自动提取名称：优先源码里的 title，否则取首行（通常是图类型声明）。 */
export function deriveName(src: string): string {
  const lines = src.split('\n').map((l) => l.trim()).filter(Boolean)
  for (const l of lines) {
    // 匹配 `title X` / `title: X` / `pie title X`（ponytail: 行内 title 关键字即可，覆盖常见图）
    const m = l.match(/^(?:\w+\s+)?title:?\s+(.+)$/i)
    if (m) return m[1].replace(/["']/g, '').trim().slice(0, NAME_MAX)
  }
  return (lines[0] ?? '').slice(0, NAME_MAX) || '未命名'
}

export function loadHistory(): HistoryEntry[] {
  try {
    const arr = JSON.parse(localStorage.getItem(KEY) ?? '[]')
    if (!Array.isArray(arr)) return []
    return arr
      .filter((e): e is HistoryEntry => !!e && typeof e.src === 'string' && typeof e.id === 'string')
      // 兼容旧数据：缺 name 时回填
      .map((e) => ({ ...e, name: typeof e.name === 'string' && e.name ? e.name : deriveName(e.src) }))
  } catch {
    return []
  }
}

export function saveHistory(list: HistoryEntry[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)))
  } catch {
    // ponytail: 忽略 localStorage 配额/隐私模式异常，历史是尽力而为的便利功能
  }
}

/** 在头部插入一条快照；空内容与连续重复内容跳过；上限 MAX。name 缺省时自动提取。 */
export function addEntry(list: HistoryEntry[], src: string, name?: string): HistoryEntry[] {
  if (!src.trim()) return list
  if (list[0]?.src === src) return list
  const entry: HistoryEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: name?.trim() || deriveName(src),
    src,
    ts: Date.now(),
  }
  return [entry, ...list].slice(0, MAX)
}

/** 重命名某条历史；空名回退到自动提取。 */
export function renameEntry(list: HistoryEntry[], id: string, name: string): HistoryEntry[] {
  return list.map((e) =>
    e.id === id ? { ...e, name: name.trim().slice(0, NAME_MAX) || deriveName(e.src) } : e,
  )
}
