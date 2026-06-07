/**
 * URL 解析模块
 *
 * 主要功能：
 *  - 将一个 URL 字符串解析成结构化数据：
 *    {
 *      ok: true,
 *      base: { protocol, host, pathname },
 *      params: [{ id, key, value, wasBare }, ...],
 *      hash: '...'
 *    }
 *  - 失败时返回 { ok: false, raw, message }
 *
 * 说明：
 *  - 使用浏览器原生 URL 解析；遇到无法构造的字符串，尝试回退把它当作 raw query
 *    或直接报错。
 *  - 默认对 value 做一次 decodeURIComponent；通过 `keepEncoded: true` 选项可以
 *    保留原 raw 写法。
 *  - 支持重复键、空值键、空值无 '=' 等 HTTP query 常见形态。
 */

export interface ParamRow {
  /** 用于 React key 的稳定 id */
  id: string
  key: string
  value: string
  /** 是否是 `?k` 这种没有 '=' 的裸键 */
  wasBare: boolean
}

export interface ParsedUrlOk {
  ok: true
  base: {
    protocol: string
    host: string
    pathname: string
  }
  params: ParamRow[]
  hash: string
}

export interface ParsedUrlErr {
  ok: false
  raw: string
  message: string
}

export type ParsedUrl = ParsedUrlOk | ParsedUrlErr

export interface ParseOptions {
  /** 默认 false：value 会被 decodeURIComponent；true 时保留 raw */
  keepEncoded?: boolean
}

let __pid = 0
export function nextParamId(): string {
  __pid += 1
  return `p_${Date.now().toString(36)}_${__pid}`
}

/**
 * 把 raw query 字符串（不带前导 '?'）拆成 ParamRow[]。
 * 暴露出来主要给「URL 解析失败时」的 fallback 使用。
 */
export function parseQueryString(raw: string, options: ParseOptions = {}): ParamRow[] {
  const { keepEncoded = false } = options
  if (!raw) return []
  const segments = raw.split('&')
  const out: ParamRow[] = []
  for (const seg of segments) {
    if (seg.length === 0) continue
    const eq = seg.indexOf('=')
    if (eq === -1) {
      // 形如 `?k`
      const rawKey = seg
      out.push({
        id: nextParamId(),
        key: safeDecode(rawKey, keepEncoded),
        value: '',
        wasBare: true,
      })
    } else {
      const rawKey = seg.slice(0, eq)
      const rawVal = seg.slice(eq + 1)
      out.push({
        id: nextParamId(),
        key: safeDecode(rawKey, keepEncoded),
        value: safeDecode(rawVal, keepEncoded),
        wasBare: false,
      })
    }
  }
  return out
}

function safeDecode(s: string, keepEncoded: boolean): string {
  if (keepEncoded) return s
  try {
    // `+` 在 application/x-www-form-urlencoded 中表示空格
    return decodeURIComponent(s.replace(/\+/g, ' '))
  } catch {
    return s
  }
}

/**
 * 解析任意 URL。
 *
 * 返回值：
 *  - 成功：{ ok: true, base, params, hash }
 *  - 失败：{ ok: false, raw, message }
 *
 * 解析规则：
 *  - 通过原生 URL 构造解析 protocol/host/pathname/hash
 *  - 使用 url.search 自己拆 query，方便区分 `?k` 与 `?k=`
 *  - keepEncoded=false (默认) 时 value 会被 decodeURIComponent
 */
export function parseUrl(input: string, options: ParseOptions = {}): ParsedUrl {
  const raw = (input ?? '').trim()
  if (raw.length === 0) {
    return { ok: false, raw, message: 'empty' }
  }
  let url: URL
  try {
    url = new URL(raw)
  } catch (err) {
    return {
      ok: false,
      raw,
      message: err instanceof Error ? err.message : 'invalid URL',
    }
  }

  const searchRaw = url.search.startsWith('?') ? url.search.slice(1) : url.search
  const params = parseQueryString(searchRaw, options)
  const hash = url.hash.startsWith('#') ? url.hash.slice(1) : url.hash

  return {
    ok: true,
    base: {
      protocol: url.protocol.replace(/:$/, ''),
      host: url.host,
      pathname: url.pathname || '/',
    },
    params,
    hash,
  }
}
