/**
 * URL 拼装模块
 *
 * 把结构化的 base / params / hash 拼回完整 URL 字符串。
 * 配套 parse.ts 使用，编辑器场景下双向同步。
 */

import type { ParamRow } from './parse'

export interface AssembleOptions {
  /** value 是否做 encodeURIComponent；默认 true */
  encode?: boolean
  /** key 是否做 encodeURIComponent；默认 true */
  encodeKey?: boolean
  /** 空值是否以 `?k` 形态写出（true）还是 `?k=`（false）；默认 false */
  showBareKeys?: boolean
}

export interface AssembleInput {
  base: {
    protocol: string
    host: string
    pathname: string
  }
  params: ParamRow[]
  hash?: string
}

function safeEncode(s: string, on: boolean): string {
  if (!on) return s
  try {
    return encodeURIComponent(s)
  } catch {
    return s
  }
}

/**
 * 仅拼 query 部分，返回不带前导 '?' 的字符串。
 * params 为空时返回空字符串。
 */
export function assembleQuery(params: ParamRow[], options: AssembleOptions = {}): string {
  const { encode = true, encodeKey = true, showBareKeys = false } = options
  const filtered = params.filter((p) => p.key.length > 0)
  if (filtered.length === 0) return ''
  const parts: string[] = []
  for (const p of filtered) {
    const k = safeEncode(p.key, encodeKey)
    const isEmpty = p.value.length === 0
    if (isEmpty && (showBareKeys || p.wasBare)) {
      parts.push(k)
    } else {
      parts.push(`${k}=${safeEncode(p.value, encode)}`)
    }
  }
  return parts.join('&')
}

/**
 * 拼装完整 URL，保留 params 数组顺序。
 *
 * - protocol 缺省 'https'，host 必须有
 * - pathname 缺省 '/'，会自动补前导 '/'
 * - params 为空时不带 '?'
 * - hash 非空时拼到末尾 '#...'
 */
export function assembleUrl(input: AssembleInput, options: AssembleOptions = {}): string {
  const protocol = (input.base.protocol || 'https').replace(/:$/, '')
  const host = input.base.host
  let pathname = input.base.pathname || '/'
  if (!pathname.startsWith('/')) pathname = `/${pathname}`

  const query = assembleQuery(input.params, options)
  const queryPart = query.length > 0 ? `?${query}` : ''

  const rawHash = (input.hash ?? '').replace(/^#/, '')
  const hashPart = rawHash.length > 0 ? `#${rawHash}` : ''

  if (!host) {
    // 没有 host 时退化成 path-only（保证编辑器不爆炸）
    return `${pathname}${queryPart}${hashPart}`
  }
  return `${protocol}://${host}${pathname}${queryPart}${hashPart}`
}
