/**
 * Set-Cookie 响应头解析（每行一条）
 *
 * 规则：
 * - 按 \r?\n 切，每行解析一条 Set-Cookie
 * - 行内按 `;` 切，第一段是 name=value（可包含 `=` 的 value）
 * - 后续段是属性 `Key` 或 `Key=Value`
 * - 属性名大小写不敏感：Domain / Path / Expires / Max-Age (max-age, MaxAge, MAX-AGE 等都识别)
 *   / Secure / HttpOnly / SameSite / Priority / Partitioned
 * - SameSite 值大小写不敏感（none/lax/strict）
 *
 * 警告判定：
 * - SameSite=None 且无 Secure → danger:sameSiteNoneRequiresSecure
 * - 缺 HttpOnly 且 name 看上去像 token/sid/auth/jwt → warning:tokenShouldBeHttpOnly
 * - Expires 在过去 → warning:alreadyExpired
 * - 缺 Domain → info:noDomainHostOnly
 */

export type WarningLevel = 'info' | 'warning' | 'danger'

export interface SetCookieWarning {
  level: WarningLevel
  key: string
}

export interface SetCookieAttrs {
  domain?: string
  path?: string
  expires?: string
  expiresDate?: number | null // ms epoch
  maxAge?: number
  secure: boolean
  httpOnly: boolean
  sameSite?: 'Strict' | 'Lax' | 'None'
  priority?: string
  partitioned: boolean
}

export interface SetCookieItem {
  name: string
  value: string
  attrs: SetCookieAttrs
  warnings: SetCookieWarning[]
}

export type ParseSetCookieResult =
  | { ok: true; items: SetCookieItem[]; skipped: number }
  | { ok: false; message: string }

const SESSION_NAME_PATTERNS = [/token/i, /sid$/i, /^sid/i, /auth/i, /jwt/i, /session/i]

function looksLikeSession(name: string): boolean {
  return SESSION_NAME_PATTERNS.some((re) => re.test(name))
}

function normalizeAttrKey(raw: string): string {
  return raw.trim().toLowerCase().replace(/[-_\s]/g, '')
}

function parseSameSite(raw: string): SetCookieAttrs['sameSite'] | undefined {
  const v = raw.trim().toLowerCase()
  if (v === 'strict') return 'Strict'
  if (v === 'lax') return 'Lax'
  if (v === 'none') return 'None'
  return undefined
}

function parseOneSetCookie(line: string): SetCookieItem | null {
  const trimmed = line.trim()
  if (!trimmed) return null

  const segments = trimmed.split(';')
  const first = segments[0]?.trim() ?? ''
  if (!first) return null
  const eq = first.indexOf('=')
  let name: string
  let value: string
  if (eq === -1) {
    name = first
    value = ''
  } else {
    name = first.slice(0, eq).trim()
    value = first.slice(eq + 1).trim()
  }
  if (!name) return null

  const attrs: SetCookieAttrs = {
    secure: false,
    httpOnly: false,
    partitioned: false,
  }

  for (let i = 1; i < segments.length; i += 1) {
    const seg = segments[i]?.trim()
    if (!seg) continue
    const segEq = seg.indexOf('=')
    const rawKey = segEq === -1 ? seg : seg.slice(0, segEq)
    const rawVal = segEq === -1 ? '' : seg.slice(segEq + 1).trim()
    const key = normalizeAttrKey(rawKey)

    switch (key) {
      case 'domain':
        attrs.domain = rawVal
        break
      case 'path':
        attrs.path = rawVal
        break
      case 'expires': {
        attrs.expires = rawVal
        const ts = Date.parse(rawVal)
        attrs.expiresDate = Number.isFinite(ts) ? ts : null
        break
      }
      case 'maxage': {
        const n = Number(rawVal)
        if (Number.isFinite(n)) attrs.maxAge = n
        break
      }
      case 'secure':
        attrs.secure = true
        break
      case 'httponly':
        attrs.httpOnly = true
        break
      case 'samesite': {
        const ss = parseSameSite(rawVal)
        if (ss) attrs.sameSite = ss
        break
      }
      case 'priority':
        attrs.priority = rawVal
        break
      case 'partitioned':
        attrs.partitioned = true
        break
      default:
        // unknown attribute — ignore
        break
    }
  }

  const warnings: SetCookieWarning[] = []

  if (attrs.sameSite === 'None' && !attrs.secure) {
    warnings.push({ level: 'danger', key: 'sameSiteNoneRequiresSecure' })
  }

  if (!attrs.httpOnly && looksLikeSession(name)) {
    warnings.push({ level: 'warning', key: 'tokenShouldBeHttpOnly' })
  }

  if (typeof attrs.expiresDate === 'number' && attrs.expiresDate < Date.now()) {
    warnings.push({ level: 'warning', key: 'alreadyExpired' })
  }

  if (!attrs.domain) {
    warnings.push({ level: 'info', key: 'noDomainHostOnly' })
  }

  return { name, value, attrs, warnings }
}

export function parseSetCookieHeader(input: string): ParseSetCookieResult {
  if (typeof input !== 'string') {
    return { ok: false, message: 'input_must_be_string' }
  }
  const trimmed = input.trim()
  if (!trimmed) return { ok: true, items: [], skipped: 0 }

  const lines = trimmed.split(/\r?\n/)
  const items: SetCookieItem[] = []
  let skipped = 0

  for (const line of lines) {
    if (!line.trim()) continue
    const item = parseOneSetCookie(line)
    if (item) items.push(item)
    else skipped += 1
  }

  return { ok: true, items, skipped }
}

/**
 * 把毫秒 epoch 与现在的距离格式化为人类可读字符串（仅用于显示，不参与判定）
 * 例：1.5 天前 / 3 小时后
 */
export function formatRelative(targetMs: number, nowMs: number = Date.now()): {
  past: boolean
  amount: number
  unit: 'second' | 'minute' | 'hour' | 'day' | 'month' | 'year'
} {
  const diff = targetMs - nowMs
  const past = diff < 0
  const abs = Math.abs(diff)
  const sec = abs / 1000
  if (sec < 60) return { past, amount: Math.round(sec), unit: 'second' }
  const min = sec / 60
  if (min < 60) return { past, amount: Math.round(min), unit: 'minute' }
  const hr = min / 60
  if (hr < 24) return { past, amount: Math.round(hr), unit: 'hour' }
  const day = hr / 24
  if (day < 30) return { past, amount: Math.round(day), unit: 'day' }
  const month = day / 30
  if (month < 12) return { past, amount: Math.round(month), unit: 'month' }
  return { past, amount: Math.round(month / 12), unit: 'year' }
}
