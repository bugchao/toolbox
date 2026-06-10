/** regexp-tree 包装：把字符串 + flags 解析成 AST，统一错误形态。 */
import { parse as regexParse } from 'regexp-tree'

export type ParseResult =
  | { ok: true; ast: unknown }
  | { ok: false; message: string }

/** parse(`/pattern/flags`) 字符串 OR (pattern, flags) 两种入参。 */
export function parsePattern(pattern: string, flags = ''): ParseResult {
  if (!pattern) return { ok: false, message: 'Empty pattern' }
  try {
    const literal = pattern.startsWith('/')
      ? pattern
      : `/${pattern}/${flags}`
    const ast = regexParse(literal)
    return { ok: true, ast }
  } catch (e) {
    return { ok: false, message: (e as Error).message ?? 'Parse failed' }
  }
}

/** 测试该 pattern 是否合法（JS RegExp 视角） */
export function isValidJsRegex(pattern: string, flags = ''): boolean {
  try {
    // eslint-disable-next-line no-new
    new RegExp(pattern, flags)
    return true
  } catch {
    return false
  }
}
