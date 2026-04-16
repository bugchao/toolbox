/**
 * 自定义加解密模块 (DXNC Envelope)
 *
 * 背景：
 *   链上数据是公开可读的。对于 "16+ / 敏感" 的业务内容，
 *   必须在上链之前加密；读回后再解密，只有持有口令的人才能看到原文。
 *
 * 设计：
 *   - 口令 → PBKDF2-HMAC-SHA256 (310000 iterations) → 256-bit key
 *   - AES-GCM (96-bit IV, 128-bit tag) 加密
 *   - 自定义二进制信封 "DXNC":
 *       magic(4) = 'DXNC'
 *       ver(1)   = 0x01
 *       flags(1) = 0x00 (预留)
 *       iter(2)  = PBKDF2 迭代次数 / 1000, big-endian
 *       salt(16) = 随机盐
 *       iv(12)   = 随机 IV
 *       ct(?)    = AES-GCM 密文 (含 16 字节 auth tag)
 *   - 最终以 0x 前缀的 hex 输出，方便直接作为 bytes 写入以太坊。
 *
 * 该信封设计为 "自定义" 格式，与开源库默认格式不一致，
 * 避免与第三方通用工具直接兼容，满足使用方自有的数据保护需求。
 */

const MAGIC = new Uint8Array([0x44, 0x58, 0x4e, 0x43]) // 'DXNC'
const VERSION = 0x01
const DEFAULT_ITER = 310000
const SALT_LEN = 16
const IV_LEN = 12

const textEncoder = new TextEncoder()
const textDecoder = new TextDecoder()

function assertCrypto(): Crypto {
  const c = (globalThis as { crypto?: Crypto }).crypto
  if (!c || !c.subtle) {
    throw new Error('WebCrypto 不可用，请使用现代浏览器 (HTTPS)')
  }
  return c
}

function concatBytes(...parts: Uint8Array[]): Uint8Array {
  const total = parts.reduce((n, p) => n + p.length, 0)
  const out = new Uint8Array(total)
  let off = 0
  for (const p of parts) {
    out.set(p, off)
    off += p.length
  }
  return out
}

export function bytesToHex(bytes: Uint8Array, withPrefix = true): string {
  let hex = ''
  for (const b of bytes) hex += b.toString(16).padStart(2, '0')
  return withPrefix ? `0x${hex}` : hex
}

export function hexToBytes(hex: string): Uint8Array {
  let s = hex.trim()
  if (s.startsWith('0x') || s.startsWith('0X')) s = s.slice(2)
  if (s.length % 2 !== 0) throw new Error('hex 长度必须为偶数')
  const out = new Uint8Array(s.length / 2)
  for (let i = 0; i < out.length; i++) {
    const byte = parseInt(s.slice(i * 2, i * 2 + 2), 16)
    if (Number.isNaN(byte)) throw new Error('hex 字符非法')
    out[i] = byte
  }
  return out
}

async function deriveKey(password: string, salt: Uint8Array, iterations: number): Promise<CryptoKey> {
  const crypto = assertCrypto()
  const baseKey = await crypto.subtle.importKey(
    'raw',
    textEncoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  )
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as unknown as BufferSource,
      iterations,
      hash: 'SHA-256',
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

export interface EncryptOptions {
  /** PBKDF2 迭代次数，默认 310000。信封内以 千为单位 记录。 */
  iterations?: number
}

/**
 * 用口令加密任意字符串，返回 0x 前缀的 hex，便于直接写入链上 bytes 类型。
 */
export async function encrypt(
  plaintext: string,
  password: string,
  opts: EncryptOptions = {}
): Promise<string> {
  const crypto = assertCrypto()
  const iterations = opts.iterations ?? DEFAULT_ITER
  if (iterations < 1000 || iterations > 5_000_000) {
    throw new Error('iterations 超出允许范围 [1000, 5000000]')
  }
  const iterK = Math.round(iterations / 1000)
  if (iterK < 1 || iterK > 0xffff) {
    throw new Error('iterations/1000 超过 uint16 范围')
  }

  const salt = new Uint8Array(SALT_LEN)
  const iv = new Uint8Array(IV_LEN)
  crypto.getRandomValues(salt)
  crypto.getRandomValues(iv)

  const key = await deriveKey(password, salt, iterations)
  const ct = new Uint8Array(
    (await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv as unknown as BufferSource },
      key,
      textEncoder.encode(plaintext)
    )) as ArrayBuffer
  )

  const header = new Uint8Array(4 + 1 + 1 + 2)
  header.set(MAGIC, 0)
  header[4] = VERSION
  header[5] = 0x00
  header[6] = (iterK >> 8) & 0xff
  header[7] = iterK & 0xff

  return bytesToHex(concatBytes(header, salt, iv, ct), true)
}

/**
 * 解析 DXNC 信封并用口令解密为字符串。
 * 输入可以是 0x-hex，也可以是无前缀 hex。
 */
export async function decrypt(envelopeHex: string, password: string): Promise<string> {
  const crypto = assertCrypto()
  const bytes = hexToBytes(envelopeHex)
  if (bytes.length < 4 + 1 + 1 + 2 + SALT_LEN + IV_LEN + 16) {
    throw new Error('密文过短，不是合法的 DXNC 信封')
  }
  for (let i = 0; i < 4; i++) {
    if (bytes[i] !== MAGIC[i]) throw new Error('magic 不匹配：不是 DXNC 格式')
  }
  const ver = bytes[4]
  if (ver !== VERSION) throw new Error(`不支持的版本: ${ver}`)
  const iterK = (bytes[6] << 8) | bytes[7]
  const iterations = iterK * 1000
  const salt = bytes.slice(8, 8 + SALT_LEN)
  const iv = bytes.slice(8 + SALT_LEN, 8 + SALT_LEN + IV_LEN)
  const ct = bytes.slice(8 + SALT_LEN + IV_LEN)

  const key = await deriveKey(password, salt, iterations)
  try {
    const pt = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv as unknown as BufferSource },
      key,
      ct as unknown as BufferSource
    )
    return textDecoder.decode(pt)
  } catch {
    throw new Error('解密失败：口令错误或数据被篡改')
  }
}

/**
 * 判断一段 hex 是否是 DXNC 信封。
 */
export function isDxncEnvelope(hex: string): boolean {
  try {
    const bytes = hexToBytes(hex)
    if (bytes.length < 4) return false
    for (let i = 0; i < 4; i++) if (bytes[i] !== MAGIC[i]) return false
    return true
  } catch {
    return false
  }
}
