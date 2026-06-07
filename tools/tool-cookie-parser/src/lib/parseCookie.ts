/**
 * Cookie 请求头解析
 * 例：parseCookieHeader('a=1; b=2; token=abc=def')
 *
 * 规则：
 * - 按 `;` 切，每段 `name=value`
 * - 第一个 `=` 之前是 name，其余整体作为 value（含 `=` 的 value 保留）
 * - 允许 value 为空（`flag=` → value=''）
 * - trim 两侧空白
 * - 跳过 name 为空的项（计入 skipped）
 * - 重复 name 保留两条
 */

export interface CookieItem {
  name: string
  value: string
}

export type ParseCookieResult =
  | { ok: true; items: CookieItem[]; skipped: number }
  | { ok: false; message: string }

export function parseCookieHeader(input: string): ParseCookieResult {
  if (typeof input !== 'string') {
    return { ok: false, message: 'input_must_be_string' }
  }

  const trimmed = input.trim()
  if (!trimmed) {
    return { ok: true, items: [], skipped: 0 }
  }

  const items: CookieItem[] = []
  let skipped = 0
  // 请求头里 cookie 也可能放跨行，统一去掉 \r\n 再按 ; 切
  const segments = trimmed.replace(/\r?\n/g, ';').split(';')

  for (const raw of segments) {
    const segment = raw.trim()
    if (!segment) continue
    const eq = segment.indexOf('=')
    let name: string
    let value: string
    if (eq === -1) {
      // 无 `=`，按空 value 处理
      name = segment.trim()
      value = ''
    } else {
      name = segment.slice(0, eq).trim()
      value = segment.slice(eq + 1).trim()
    }
    if (!name) {
      skipped += 1
      continue
    }
    items.push({ name, value })
  }

  return { ok: true, items, skipped }
}
