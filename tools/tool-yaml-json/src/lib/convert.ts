/**
 * YAML ↔ JSON 互转纯函数。
 *
 * 所有 API 返回 ConvertResult，永远不抛异常。
 *  - 解析/序列化失败 → { ok: false, message, line? }
 *  - 成功 → { ok: true, text }
 *
 * 约定（被 convert.test.ts 守住）：
 *  - 输入是空字符串或纯空白：
 *      yamlToJson → { ok: true, text: '{}' }（或缩进为 0 时也是 '{}'）
 *      jsonToYaml → { ok: true, text: '' }
 */
import yaml from 'js-yaml'

export type ConvertOk = { ok: true; text: string }
export type ConvertErr = { ok: false; message: string; line?: number }
export type ConvertResult = ConvertOk | ConvertErr

export type JsonIndent = 2 | 4 | '\t'
export type YamlFlowStyle = 'block' | 'flow'

export interface YamlToJsonOptions {
  /** JSON 缩进：2、4 或 Tab；默认 2 */
  indent?: JsonIndent
}

export interface JsonToYamlOptions {
  /** YAML 行内 vs 块状（默认 block） */
  style?: YamlFlowStyle
  /** YAML 块缩进（默认 2） */
  indent?: number
}

function isBlank(text: string): boolean {
  return text == null || text.trim().length === 0
}

/**
 * 把 js-yaml 抛出的 YAMLException 归一成 ConvertErr。
 */
function fromYamlError(err: unknown): ConvertErr {
  if (err && typeof err === 'object') {
    const e = err as { reason?: string; message?: string; mark?: { line?: number } }
    const line =
      e.mark && typeof e.mark.line === 'number' ? e.mark.line + 1 : undefined
    const message = e.reason || e.message || String(err)
    return { ok: false, message, line }
  }
  return { ok: false, message: String(err) }
}

/**
 * 从 JSON.parse 的错误信息里抠出行号（如果能）。
 */
function fromJsonError(err: unknown, source: string): ConvertErr {
  const message = err instanceof Error ? err.message : String(err)
  // 常见信息形如 "Unexpected token ... at position 42"
  const m = /position\s+(\d+)/i.exec(message)
  let line: number | undefined
  if (m) {
    const pos = Math.min(Number(m[1]), source.length)
    line = source.slice(0, pos).split('\n').length
  }
  return { ok: false, message, line }
}

/**
 * YAML 文本 → JSON 文本。
 */
export function yamlToJson(
  text: string,
  opts: YamlToJsonOptions = {},
): ConvertResult {
  const indent: JsonIndent = opts.indent ?? 2
  if (isBlank(text)) {
    return { ok: true, text: JSON.stringify({}, null, indent) }
  }
  try {
    const data = yaml.load(text)
    // js-yaml 对 undefined（纯空白以外，比如 '~' 之类）会返回 null 等基础类型；保留语义
    const normalized = data === undefined ? null : data
    return { ok: true, text: JSON.stringify(normalized, null, indent) }
  } catch (err) {
    return fromYamlError(err)
  }
}

/**
 * JSON 文本 → YAML 文本。
 */
export function jsonToYaml(
  text: string,
  opts: JsonToYamlOptions = {},
): ConvertResult {
  const style: YamlFlowStyle = opts.style ?? 'block'
  const indent = opts.indent ?? 2
  if (isBlank(text)) {
    return { ok: true, text: '' }
  }
  try {
    const data = JSON.parse(text)
    const dumped = yaml.dump(data, {
      indent,
      noRefs: true,
      lineWidth: style === 'flow' ? -1 : 80,
      flowLevel: style === 'flow' ? 0 : -1,
    })
    return { ok: true, text: dumped }
  } catch (err) {
    return fromJsonError(err, text)
  }
}
