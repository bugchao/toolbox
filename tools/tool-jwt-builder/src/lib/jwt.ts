/** JWT HS256/384/512 签名核心：WebCrypto，零依赖。 */

export type HsAlg = 'HS256' | 'HS384' | 'HS512'

const HASH_FOR: Record<HsAlg, string> = {
  HS256: 'SHA-256',
  HS384: 'SHA-384',
  HS512: 'SHA-512',
}

// ───────────── base64url 编解码 ─────────────

export function base64UrlEncode(bytes: Uint8Array): string {
  const CHUNK = 0x8000
  let binary = ''
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK))
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function base64UrlEncodeJson(value: unknown): string {
  return base64UrlEncode(new TextEncoder().encode(JSON.stringify(value)))
}

export function base64UrlDecode(s: string): Uint8Array | null {
  let raw = s.replace(/-/g, '+').replace(/_/g, '/')
  const pad = raw.length % 4
  if (pad === 1) return null
  if (pad > 0) raw += '='.repeat(4 - pad)
  try {
    const binary = atob(raw)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
    return bytes
  } catch {
    return null
  }
}

// ───────────── 签名 / 验证 ─────────────

export type SecretEncoding = 'utf8' | 'base64'

export type SignInput = {
  alg: HsAlg
  /** 自定义 header 字段会合并进 {alg, typ}，alg/typ 不可覆盖 */
  headerExtra?: Record<string, unknown>
  payload: Record<string, unknown>
  secret: string
  secretEncoding?: SecretEncoding
}

export type SignResult =
  | { ok: true; token: string; header: Record<string, unknown> }
  | { ok: false; message: string }

function secretToBytes(secret: string, encoding: SecretEncoding): Uint8Array | null {
  if (encoding === 'base64') return base64UrlDecode(secret.replace(/\s+/g, ''))
  return new TextEncoder().encode(secret)
}

async function hmac(alg: HsAlg, keyBytes: Uint8Array, data: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    'raw',
    keyBytes as unknown as BufferSource,
    { name: 'HMAC', hash: HASH_FOR[alg] },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data))
  return new Uint8Array(sig)
}

export async function signJwt(input: SignInput): Promise<SignResult> {
  if (!input.secret) return { ok: false, message: 'missing_secret' }
  const keyBytes = secretToBytes(input.secret, input.secretEncoding ?? 'utf8')
  if (!keyBytes || keyBytes.length === 0) return { ok: false, message: 'bad_secret_encoding' }

  const header: Record<string, unknown> = {
    ...(input.headerExtra ?? {}),
    alg: input.alg,
    typ: 'JWT',
  }
  try {
    const h = base64UrlEncodeJson(header)
    const p = base64UrlEncodeJson(input.payload)
    const signingInput = `${h}.${p}`
    const sig = await hmac(input.alg, keyBytes, signingInput)
    return { ok: true, token: `${signingInput}.${base64UrlEncode(sig)}`, header }
  } catch (e) {
    return { ok: false, message: (e as Error).message ?? 'sign_failed' }
  }
}

export type VerifyResult =
  | { ok: true; valid: boolean; alg: HsAlg | null }
  | { ok: false; message: string }

/** 验证 token 签名（仅 HS*）。 */
export async function verifyJwt(token: string, secret: string, secretEncoding: SecretEncoding = 'utf8'): Promise<VerifyResult> {
  const parts = token.trim().split('.')
  if (parts.length !== 3) return { ok: false, message: 'malformed_token' }
  const headerBytes = base64UrlDecode(parts[0])
  if (!headerBytes) return { ok: false, message: 'bad_header' }
  let alg: HsAlg
  try {
    const header = JSON.parse(new TextDecoder().decode(headerBytes)) as { alg?: string }
    if (header.alg !== 'HS256' && header.alg !== 'HS384' && header.alg !== 'HS512') {
      return { ok: false, message: 'unsupported_alg' }
    }
    alg = header.alg
  } catch {
    return { ok: false, message: 'bad_header' }
  }
  const keyBytes = secretToBytes(secret, secretEncoding)
  if (!keyBytes || keyBytes.length === 0) return { ok: false, message: 'bad_secret_encoding' }
  const expected = base64UrlEncode(await hmac(alg, keyBytes, `${parts[0]}.${parts[1]}`))
  return { ok: true, valid: timingSafeEqual(expected, parts[2]), alg }
}

/** 常数时间比较（避免早退泄露长度前缀信息）。 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

// ───────────── payload 辅助 ─────────────

/** 校验 payload JSON 字符串；返回对象或错误。 */
export function parsePayload(text: string): { ok: true; payload: Record<string, unknown> } | { ok: false; message: string } {
  if (!text.trim()) return { ok: false, message: 'empty' }
  try {
    const v = JSON.parse(text)
    if (v === null || typeof v !== 'object' || Array.isArray(v)) {
      return { ok: false, message: 'payload_must_be_object' }
    }
    return { ok: true, payload: v as Record<string, unknown> }
  } catch (e) {
    return { ok: false, message: (e as Error).message ?? 'bad_json' }
  }
}

/** 生成常用 claims 模板。 */
export function buildClaimsTemplate(now = Math.floor(Date.now() / 1000)): Record<string, unknown> {
  return {
    sub: 'user-123',
    name: 'Alice',
    iat: now,
    exp: now + 3600,
  }
}
