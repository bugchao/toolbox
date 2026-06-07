/**
 * JSON Schema 校验核心逻辑。
 *
 * 输入是字符串（schema / data），返回规范化结果：
 *   - { ok: true }                                 数据通过校验
 *   - { ok: false, side: 'schema', message }       schema 自身 JSON 解析失败 / 编译失败
 *   - { ok: false, side: 'data', message }         data 自身 JSON 解析失败
 *   - { ok: false, errors: NormalizedError[] }     校验未通过，返回结构化错误
 *
 * 通过 module 级 Map 缓存按 draft 区分的 Ajv 实例，避免每次输入都重建。
 */

import Ajv2020 from 'ajv/dist/2020.js'
import Ajv2019 from 'ajv/dist/2019.js'
import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import type { ErrorObject } from 'ajv'

export type SchemaDraft = 'draft-07' | 'draft-2019-09' | 'draft-2020-12'

export interface NormalizedError {
  instancePath: string
  schemaPath: string
  keyword: string
  message: string
  params: Record<string, unknown>
}

export type ValidateResult =
  | { ok: true }
  | { ok: false; side: 'schema' | 'data'; message: string }
  | { ok: false; errors: NormalizedError[] }

export interface ValidateInput {
  schema: string
  data: string
  draft?: SchemaDraft
}

type AnyAjv = Ajv | Ajv2019 | Ajv2020

const ajvCache = new Map<SchemaDraft, AnyAjv>()

function getAjv(draft: SchemaDraft): AnyAjv {
  const cached = ajvCache.get(draft)
  if (cached) return cached

  let ajv: AnyAjv
  if (draft === 'draft-2020-12') {
    ajv = new Ajv2020({ allErrors: true, strict: false })
  } else if (draft === 'draft-2019-09') {
    ajv = new Ajv2019({ allErrors: true, strict: false })
  } else {
    ajv = new Ajv({ allErrors: true, strict: false })
  }
  // ajv-formats 的类型签名按不同 Ajv 主版本写，这里两边都兼容
  ;(addFormats as unknown as (instance: AnyAjv) => void)(ajv)
  ajvCache.set(draft, ajv)
  return ajv
}

function normalizeError(err: ErrorObject): NormalizedError {
  return {
    instancePath: err.instancePath ?? '',
    schemaPath: err.schemaPath ?? '',
    keyword: err.keyword ?? '',
    message: err.message ?? '',
    params: (err.params ?? {}) as Record<string, unknown>,
  }
}

function tryParse(raw: string, side: 'schema' | 'data'): { ok: true; value: unknown } | { ok: false; side: 'schema' | 'data'; message: string } {
  try {
    return { ok: true, value: JSON.parse(raw) }
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    return { ok: false, side, message }
  }
}

export function validate(input: ValidateInput): ValidateResult {
  const draft: SchemaDraft = input.draft ?? 'draft-2020-12'

  // 1. 解析 schema
  const schemaParsed = tryParse(input.schema, 'schema')
  if (!schemaParsed.ok) return schemaParsed

  // 2. 解析 data
  const dataParsed = tryParse(input.data, 'data')
  if (!dataParsed.ok) return dataParsed

  // 3. 编译并校验
  const ajv = getAjv(draft)
  let validateFn
  try {
    validateFn = ajv.compile(schemaParsed.value as object)
  } catch (e) {
    return {
      ok: false,
      side: 'schema',
      message: e instanceof Error ? e.message : String(e),
    }
  }

  const valid = validateFn(dataParsed.value)
  if (valid) return { ok: true }
  const errors = (validateFn.errors ?? []).map(normalizeError)
  return { ok: false, errors }
}

/** 仅供测试与极少数高级场景使用，可清理 ajv 实例缓存。 */
export function _resetAjvCache(): void {
  ajvCache.clear()
}
