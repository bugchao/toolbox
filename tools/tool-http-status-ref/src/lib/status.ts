/** HTTP 状态码速查数据 + 查询。零依赖纯函数。文案的中英描述放 i18n，这里只放结构化数据。 */

export type StatusClass = '1xx' | '2xx' | '3xx' | '4xx' | '5xx'

export type StatusCode = {
  code: number
  /** 标准 reason phrase（英文，作为稳定 key 展示） */
  phrase: string
  klass: StatusClass
  /** i18n 文案 key（在 locale 里写中/英含义） */
  i18nKey: string
}

export const STATUS_CODES: StatusCode[] = [
  // 1xx
  { code: 100, phrase: 'Continue', klass: '1xx', i18nKey: 'c100' },
  { code: 101, phrase: 'Switching Protocols', klass: '1xx', i18nKey: 'c101' },
  { code: 102, phrase: 'Processing', klass: '1xx', i18nKey: 'c102' },
  { code: 103, phrase: 'Early Hints', klass: '1xx', i18nKey: 'c103' },
  // 2xx
  { code: 200, phrase: 'OK', klass: '2xx', i18nKey: 'c200' },
  { code: 201, phrase: 'Created', klass: '2xx', i18nKey: 'c201' },
  { code: 202, phrase: 'Accepted', klass: '2xx', i18nKey: 'c202' },
  { code: 204, phrase: 'No Content', klass: '2xx', i18nKey: 'c204' },
  { code: 206, phrase: 'Partial Content', klass: '2xx', i18nKey: 'c206' },
  // 3xx
  { code: 301, phrase: 'Moved Permanently', klass: '3xx', i18nKey: 'c301' },
  { code: 302, phrase: 'Found', klass: '3xx', i18nKey: 'c302' },
  { code: 303, phrase: 'See Other', klass: '3xx', i18nKey: 'c303' },
  { code: 304, phrase: 'Not Modified', klass: '3xx', i18nKey: 'c304' },
  { code: 307, phrase: 'Temporary Redirect', klass: '3xx', i18nKey: 'c307' },
  { code: 308, phrase: 'Permanent Redirect', klass: '3xx', i18nKey: 'c308' },
  // 4xx
  { code: 400, phrase: 'Bad Request', klass: '4xx', i18nKey: 'c400' },
  { code: 401, phrase: 'Unauthorized', klass: '4xx', i18nKey: 'c401' },
  { code: 403, phrase: 'Forbidden', klass: '4xx', i18nKey: 'c403' },
  { code: 404, phrase: 'Not Found', klass: '4xx', i18nKey: 'c404' },
  { code: 405, phrase: 'Method Not Allowed', klass: '4xx', i18nKey: 'c405' },
  { code: 409, phrase: 'Conflict', klass: '4xx', i18nKey: 'c409' },
  { code: 410, phrase: 'Gone', klass: '4xx', i18nKey: 'c410' },
  { code: 418, phrase: "I'm a teapot", klass: '4xx', i18nKey: 'c418' },
  { code: 422, phrase: 'Unprocessable Entity', klass: '4xx', i18nKey: 'c422' },
  { code: 429, phrase: 'Too Many Requests', klass: '4xx', i18nKey: 'c429' },
  // 5xx
  { code: 500, phrase: 'Internal Server Error', klass: '5xx', i18nKey: 'c500' },
  { code: 501, phrase: 'Not Implemented', klass: '5xx', i18nKey: 'c501' },
  { code: 502, phrase: 'Bad Gateway', klass: '5xx', i18nKey: 'c502' },
  { code: 503, phrase: 'Service Unavailable', klass: '5xx', i18nKey: 'c503' },
  { code: 504, phrase: 'Gateway Timeout', klass: '5xx', i18nKey: 'c504' },
  { code: 511, phrase: 'Network Authentication Required', klass: '5xx', i18nKey: 'c511' },
]

export const CLASSES: StatusClass[] = ['1xx', '2xx', '3xx', '4xx', '5xx']

export function classOf(code: number): StatusClass | null {
  if (code >= 100 && code < 200) return '1xx'
  if (code >= 200 && code < 300) return '2xx'
  if (code >= 300 && code < 400) return '3xx'
  if (code >= 400 && code < 500) return '4xx'
  if (code >= 500 && code < 600) return '5xx'
  return null
}

export function findByCode(code: number): StatusCode | undefined {
  return STATUS_CODES.find((s) => s.code === code)
}

/**
 * 搜索：按 code 前缀 / phrase 子串过滤；可叠加 class 过滤。
 * descLookup 用于把 i18n 描述也纳入搜索（caller 注入 t）。
 */
export function search(
  query: string,
  klass: StatusClass | 'all' = 'all',
  descLookup?: (key: string) => string,
): StatusCode[] {
  const q = query.trim().toLowerCase()
  return STATUS_CODES.filter((s) => {
    if (klass !== 'all' && s.klass !== klass) return false
    if (!q) return true
    if (String(s.code).startsWith(q)) return true
    if (s.phrase.toLowerCase().includes(q)) return true
    if (descLookup && descLookup(s.i18nKey).toLowerCase().includes(q)) return true
    return false
  })
}

export function groupByClass(list: StatusCode[]): Record<StatusClass, StatusCode[]> {
  const out = { '1xx': [], '2xx': [], '3xx': [], '4xx': [], '5xx': [] } as Record<StatusClass, StatusCode[]>
  for (const s of list) out[s.klass].push(s)
  return out
}
