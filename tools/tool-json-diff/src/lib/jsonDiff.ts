/** 两份 JSON 的语义/结构化对比。零依赖纯函数，按键递归、数组按索引比较，键顺序无关。 */

export type DiffType = 'added' | 'removed' | 'changed' | 'unchanged'

export interface DiffEntry {
  /** 点/方括号路径，例如 "user.name"、"items[0]"；顶层标量为 "(root)" */
  path: string
  type: DiffType
  /** 左侧（旧）值，added 时缺省 */
  left?: unknown
  /** 右侧（新）值，removed 时缺省 */
  right?: unknown
}

export interface DiffSummary {
  added: number
  removed: number
  changed: number
  unchanged: number
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

function childPath(parent: string, key: string): string {
  return parent ? `${parent}.${key}` : key
}

function walk(path: string, left: unknown, right: unknown, out: DiffEntry[]): void {
  if (isPlainObject(left) && isPlainObject(right)) {
    const keys = new Set([...Object.keys(left), ...Object.keys(right)])
    for (const key of keys) {
      const p = childPath(path, key)
      const inL = Object.prototype.hasOwnProperty.call(left, key)
      const inR = Object.prototype.hasOwnProperty.call(right, key)
      if (inL && inR) walk(p, left[key], right[key], out)
      else if (inR) out.push({ path: p, type: 'added', right: right[key] })
      else out.push({ path: p, type: 'removed', left: left[key] })
    }
    return
  }

  if (Array.isArray(left) && Array.isArray(right)) {
    const len = Math.max(left.length, right.length)
    for (let i = 0; i < len; i++) {
      const p = `${path}[${i}]`
      const inL = i < left.length
      const inR = i < right.length
      if (inL && inR) walk(p, left[i], right[i], out)
      else if (inR) out.push({ path: p, type: 'added', right: right[i] })
      else out.push({ path: p, type: 'removed', left: left[i] })
    }
    return
  }

  // 叶子：基本类型 / 类型不一致。用 Object.is 区分 NaN、±0 等边界。
  const p = path || '(root)'
  if (Object.is(left, right)) out.push({ path: p, type: 'unchanged', left, right })
  else out.push({ path: p, type: 'changed', left, right })
}

/** 计算结构化 diff，返回扁平的逐路径条目列表。 */
export function diffJson(left: unknown, right: unknown): DiffEntry[] {
  const out: DiffEntry[] = []
  walk('', left, right, out)
  return out
}

/** 按类型汇总条目数量。 */
export function summarize(entries: DiffEntry[]): DiffSummary {
  const s: DiffSummary = { added: 0, removed: 0, changed: 0, unchanged: 0 }
  for (const e of entries) s[e.type]++
  return s
}

/** 解析 JSON 文本，成功返回值，失败返回错误信息。 */
export function parseJson(text: string): { ok: true; value: unknown } | { ok: false; message: string } {
  try {
    return { ok: true, value: JSON.parse(text) }
  } catch (e) {
    return { ok: false, message: (e as Error).message }
  }
}
