/** 术语表：用户维护中外对照表，翻译时把命中条目注入到系统提示词中。 */
import { readJson, writeJson } from './storage'
import type { LangCode } from './languages'

export type GlossaryEntry = {
  id: string
  /** 原文术语 */
  source: string
  /** 译文术语 */
  target: string
  /** 仅在特定语向启用；undefined 表示对所有语向生效 */
  langPair?: { source: LangCode; target: LangCode }
  /** 大小写敏感匹配；默认 false */
  caseSensitive?: boolean
  /** 用户备注（可选） */
  note?: string
}

const STORAGE_KEY = 'glossary'

export function readGlossary(): GlossaryEntry[] {
  const v = readJson<GlossaryEntry[]>(STORAGE_KEY, [])
  return Array.isArray(v) ? v : []
}

export function writeGlossary(entries: GlossaryEntry[]): void {
  writeJson(STORAGE_KEY, entries)
}

function genId(): string {
  return `g${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}

export function createEntry(patch: Partial<GlossaryEntry> = {}): GlossaryEntry {
  return {
    id: patch.id ?? genId(),
    source: patch.source ?? '',
    target: patch.target ?? '',
    langPair: patch.langPair,
    caseSensitive: patch.caseSensitive ?? false,
    note: patch.note,
  }
}

export function addEntry(cur: GlossaryEntry[], patch: Partial<GlossaryEntry>): GlossaryEntry[] {
  return [createEntry(patch), ...cur]
}

export function removeEntry(cur: GlossaryEntry[], id: string): GlossaryEntry[] {
  return cur.filter((e) => e.id !== id)
}

export function updateEntry(
  cur: GlossaryEntry[],
  id: string,
  patch: Partial<GlossaryEntry>,
): GlossaryEntry[] {
  return cur.map((e) => (e.id === id ? { ...e, ...patch } : e))
}

/** 一个术语是否在文本中命中：默认不区分大小写，子串匹配（覆盖词组）。 */
export function entryMatches(entry: GlossaryEntry, text: string): boolean {
  if (!entry.source) return false
  if (entry.caseSensitive) return text.includes(entry.source)
  return text.toLowerCase().includes(entry.source.toLowerCase())
}

/** 判定一条 entry 是否适用于当前语向。 */
export function entryAppliesToLang(
  entry: GlossaryEntry,
  source: LangCode,
  target: LangCode,
): boolean {
  if (!entry.langPair) return true
  return entry.langPair.source === source && entry.langPair.target === target
}

/** 找到对当前文本 + 语向生效的术语条目。 */
export function applicable(
  entries: GlossaryEntry[],
  source: LangCode,
  target: LangCode,
  text: string,
): GlossaryEntry[] {
  if (!text) return []
  return entries.filter(
    (e) =>
      e.source && e.target &&
      entryAppliesToLang(e, source, target) &&
      entryMatches(e, text),
  )
}

/** 把生效条目格式化成给 LLM 用的提示词片段。 */
export function formatPromptInjection(entries: GlossaryEntry[]): string {
  if (entries.length === 0) return ''
  const lines = entries.map((e) => `- "${e.source}" → "${e.target}"`)
  return [
    'Glossary (use these mappings strictly; preserve the target term verbatim):',
    ...lines,
  ].join('\n')
}

/** 导入：把 JSON 数组解析后逐条 createEntry 规范化（容错坏数据）。 */
export function importJson(raw: string): GlossaryEntry[] {
  try {
    const arr = JSON.parse(raw)
    if (!Array.isArray(arr)) return []
    return arr
      .map((x) => {
        if (!x || typeof x !== 'object') return null
        const src = String(x.source ?? '').trim()
        const tgt = String(x.target ?? '').trim()
        if (!src || !tgt) return null
        return createEntry({
          source: src,
          target: tgt,
          langPair: x.langPair && x.langPair.source && x.langPair.target
            ? { source: x.langPair.source, target: x.langPair.target }
            : undefined,
          caseSensitive: !!x.caseSensitive,
          note: x.note ? String(x.note) : undefined,
        })
      })
      .filter((x): x is GlossaryEntry => x !== null)
  } catch {
    return []
  }
}

/** 导出：纯字段 JSON（去掉 id，方便跨设备） */
export function exportJson(entries: GlossaryEntry[]): string {
  const stripped = entries.map(({ id: _id, ...rest }) => rest)
  return JSON.stringify(stripped, null, 2)
}
