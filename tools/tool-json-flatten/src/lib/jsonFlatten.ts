/** 嵌套 JSON 扁平化为点/方括号路径键，并可导出为 CSV。零依赖纯函数。 */

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

function isEmptyContainer(v: unknown): boolean {
  if (Array.isArray(v)) return v.length === 0
  if (isPlainObject(v)) return Object.keys(v).length === 0
  return false
}

function walk(prefix: string, value: unknown, out: Record<string, unknown>): void {
  // 空对象/空数组作为叶子保留，避免信息丢失
  if (isPlainObject(value) && !isEmptyContainer(value)) {
    for (const [k, v] of Object.entries(value)) {
      walk(prefix ? `${prefix}.${k}` : k, v, out)
    }
    return
  }
  if (Array.isArray(value) && !isEmptyContainer(value)) {
    value.forEach((v, i) => walk(`${prefix}[${i}]`, v, out))
    return
  }
  out[prefix || '(root)'] = value
}

/** 将嵌套结构扁平化为 `{ 路径: 叶子值 }`。 */
export function flatten(value: unknown): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  walk('', value, out)
  return out
}

function csvCell(v: unknown): string {
  if (v === undefined || v === null) return ''
  const s = typeof v === 'object' ? JSON.stringify(v) : String(v)
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

/**
 * 导出 CSV：
 * - 对象数组：列为各行扁平化键的并集（首次出现顺序），缺失留空
 * - 单个对象：扁平化为单行
 * - 基本类型数组：单列 `value`
 */
export function toCsv(value: unknown): string {
  const rows: unknown[] = Array.isArray(value) ? value : [value]

  // 基本类型数组 → 单列 value
  if (rows.every((r) => !isPlainObject(r) && !Array.isArray(r))) {
    return ['value', ...rows.map((r) => csvCell(r))].join('\n')
  }

  const flatRows = rows.map((r) => flatten(r))
  const columns: string[] = []
  const seen = new Set<string>()
  for (const fr of flatRows) {
    for (const key of Object.keys(fr)) {
      if (!seen.has(key)) {
        seen.add(key)
        columns.push(key)
      }
    }
  }

  const header = columns.map(csvCell).join(',')
  const body = flatRows.map((fr) => columns.map((c) => csvCell(fr[c])).join(','))
  return [header, ...body].join('\n')
}

/** 解析 JSON 文本，成功返回值，失败返回错误信息。 */
export function parseJson(text: string): { ok: true; value: unknown } | { ok: false; message: string } {
  try {
    return { ok: true, value: JSON.parse(text) }
  } catch (e) {
    return { ok: false, message: (e as Error).message }
  }
}
