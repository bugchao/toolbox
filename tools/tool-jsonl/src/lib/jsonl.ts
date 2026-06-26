/** JSON Lines (NDJSON) ↔ JSON 数组互转、逐行校验。零依赖纯函数。 */

export type LineError = { line: number; message: string }

export type ParseResult = {
  values: unknown[]
  errors: LineError[]
}

/**
 * 解析 NDJSON：每非空行一个 JSON。返回成功值 + 逐行错误。
 * 空行（含纯空白）被跳过、不报错。
 */
export function parseJsonl(text: string): ParseResult {
  const lines = text.split(/\r\n|\r|\n/)
  const values: unknown[] = []
  const errors: LineError[] = []
  lines.forEach((raw, i) => {
    const line = raw.trim()
    if (line === '') return
    try {
      values.push(JSON.parse(line))
    } catch (e) {
      errors.push({ line: i + 1, message: (e as Error).message })
    }
  })
  return { values, errors }
}

/** NDJSON → 美化的 JSON 数组字符串。 */
export function jsonlToArray(text: string, indent = 2): { ok: true; json: string } | { ok: false; errors: LineError[] } {
  const { values, errors } = parseJsonl(text)
  if (errors.length > 0) return { ok: false, errors }
  return { ok: true, json: JSON.stringify(values, null, indent) }
}

/**
 * JSON 数组（或单值）→ NDJSON。
 * - 数组：每元素一行
 * - 非数组：单行
 * minify=true 时每行紧凑；否则保持紧凑（NDJSON 每行必须单行，故始终单行）。
 */
export function arrayToJsonl(jsonText: string): { ok: true; jsonl: string } | { ok: false; message: string } {
  let parsed: unknown
  try {
    parsed = JSON.parse(jsonText)
  } catch (e) {
    return { ok: false, message: (e as Error).message }
  }
  const items = Array.isArray(parsed) ? parsed : [parsed]
  // 每行必须是单行 JSON（无内部换行）→ 用无缩进 stringify
  const jsonl = items.map((v) => JSON.stringify(v)).join('\n')
  return { ok: true, jsonl }
}

/** 重新规整 NDJSON：把每行压成紧凑单行（去多余空白），跳过空行；遇错保留原行并记录。 */
export function minifyJsonl(text: string): { text: string; errors: LineError[] } {
  const lines = text.split(/\r\n|\r|\n/)
  const errors: LineError[] = []
  const out: string[] = []
  lines.forEach((raw, i) => {
    const line = raw.trim()
    if (line === '') return
    try {
      out.push(JSON.stringify(JSON.parse(line)))
    } catch (e) {
      errors.push({ line: i + 1, message: (e as Error).message })
      out.push(raw)
    }
  })
  return { text: out.join('\n'), errors }
}

/** 统计：有效行 / 错误行 / 总记录数。 */
export function stats(text: string): { records: number; errors: number; blank: number } {
  const lines = text.split(/\r\n|\r|\n/)
  let records = 0
  let errors = 0
  let blank = 0
  for (const raw of lines) {
    const line = raw.trim()
    if (line === '') { blank++; continue }
    try { JSON.parse(line); records++ } catch { errors++ }
  }
  return { records, errors, blank }
}
