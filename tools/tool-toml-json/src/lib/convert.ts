/** TOML ↔ JSON 双向转换核心。错误统一形态便于 UI 渲染。 */
import TOML from '@iarna/toml'

export type ConvertResult =
  | { ok: true; text: string }
  | { ok: false; message: string; line?: number }

export type JsonIndent = 2 | 4 | '\t'

/** 把 indent 选项归一成 JSON.stringify 的 space 参数。 */
function indentOf(i: JsonIndent): number | string {
  return i === '\t' ? '\t' : i
}

/** TOML → JSON。空输入约定返回 `{}`. */
export function tomlToJson(text: string, indent: JsonIndent = 2): ConvertResult {
  if (!text || !text.trim()) return { ok: true, text: '{}' }
  try {
    const parsed = TOML.parse(text)
    return { ok: true, text: JSON.stringify(parsed, null, indentOf(indent)) }
  } catch (e) {
    const err = e as { message?: string; line?: number; pos?: number }
    return {
      ok: false,
      message: err.message ?? String(e),
      line: typeof err.line === 'number' ? err.line + 1 : undefined,
    }
  }
}

/** JSON → TOML。空输入约定返回 ''. */
export function jsonToToml(text: string): ConvertResult {
  if (!text || !text.trim()) return { ok: true, text: '' }
  try {
    const parsed = JSON.parse(text) as Record<string, unknown>
    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return { ok: false, message: 'TOML root must be a table (object)' }
    }
    const out = TOML.stringify(parsed as TOML.JsonMap)
    return { ok: true, text: out }
  } catch (e) {
    const msg = (e as Error).message ?? String(e)
    // 从 SyntaxError 的 "in JSON at position N" 推断行号
    let line: number | undefined
    const m = msg.match(/position (\d+)/)
    if (m) {
      const pos = Number(m[1])
      line = text.slice(0, pos).split('\n').length
    }
    return { ok: false, message: msg, line }
  }
}
