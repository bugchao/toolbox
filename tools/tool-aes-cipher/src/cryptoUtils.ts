// AES 加解密辅助函数 —— 全部基于浏览器 Web Crypto API，无第三方依赖

export type AesMode = 'GCM' | 'CBC' | 'CTR'
export type KeyBits = 128 | 192 | 256
export type Encoding = 'base64' | 'hex' | 'utf8'

// ── 二进制 / 编码 ──────────────────────────────────────────
export function bytesToBase64(bytes: Uint8Array): string {
  let bin = ''
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i])
  return btoa(bin)
}
export function base64ToBytes(b64: string): Uint8Array {
  const cleaned = b64.replace(/\s+/g, '')
  const bin = atob(cleaned)
  const arr = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i)
  return arr
}
export function bytesToHex(bytes: Uint8Array): string {
  let s = ''
  for (let i = 0; i < bytes.length; i++) s += bytes[i].toString(16).padStart(2, '0')
  return s
}
export function hexToBytes(hex: string): Uint8Array {
  const cleaned = hex.replace(/\s+|0x/gi, '')
  if (cleaned.length % 2 !== 0) throw new Error('Invalid hex length')
  const arr = new Uint8Array(cleaned.length / 2)
  for (let i = 0; i < arr.length; i++) {
    const v = parseInt(cleaned.slice(i * 2, i * 2 + 2), 16)
    if (Number.isNaN(v)) throw new Error('Invalid hex char')
    arr[i] = v
  }
  return arr
}
export function utf8Encode(s: string): Uint8Array {
  return new TextEncoder().encode(s)
}
export function utf8Decode(b: Uint8Array): string {
  return new TextDecoder('utf-8', { fatal: true }).decode(b)
}

export function encodeBytes(bytes: Uint8Array, enc: Encoding): string {
  if (enc === 'base64') return bytesToBase64(bytes)
  if (enc === 'hex') return bytesToHex(bytes)
  return utf8Decode(bytes)
}
export function decodeBytes(s: string, enc: Encoding): Uint8Array {
  if (enc === 'base64') return base64ToBytes(s)
  if (enc === 'hex') return hexToBytes(s)
  return utf8Encode(s)
}

// ── 随机 ────────────────────────────────────────────────────
export function randomBytes(n: number): Uint8Array {
  const b = new Uint8Array(n)
  crypto.getRandomValues(b)
  return b
}

export function ivBytesForMode(mode: AesMode): Uint8Array {
  // GCM 推荐 12 字节；CBC / CTR 16 字节
  return randomBytes(mode === 'GCM' ? 12 : 16)
}

// ── 密钥 ────────────────────────────────────────────────────
function aesAlgorithm(mode: AesMode): 'AES-GCM' | 'AES-CBC' | 'AES-CTR' {
  return mode === 'GCM' ? 'AES-GCM' : mode === 'CBC' ? 'AES-CBC' : 'AES-CTR'
}

export async function importRawKey(
  raw: Uint8Array,
  mode: AesMode,
): Promise<CryptoKey> {
  if (![16, 24, 32].includes(raw.length)) {
    throw new Error(`Invalid key length ${raw.length} bytes (expected 16/24/32)`)
  }
  return crypto.subtle.importKey(
    'raw',
    new Uint8Array(raw),
    { name: aesAlgorithm(mode), length: raw.length * 8 },
    false,
    ['encrypt', 'decrypt'],
  )
}

export async function derivePbkdf2Key(
  passphrase: string,
  salt: Uint8Array,
  bits: KeyBits,
  mode: AesMode,
  iterations = 200_000,
): Promise<CryptoKey> {
  if (!passphrase) throw new Error('Empty passphrase')
  const baseKey = await crypto.subtle.importKey(
    'raw',
    utf8Encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey'],
  )
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: new Uint8Array(salt), iterations, hash: 'SHA-256' },
    baseKey,
    { name: aesAlgorithm(mode), length: bits },
    false,
    ['encrypt', 'decrypt'],
  )
}

// ── 加 / 解 ─────────────────────────────────────────────────
export interface CryptParams {
  mode: AesMode
  key: CryptoKey
  iv: Uint8Array
  aad?: Uint8Array // 仅 GCM
  ctrLengthBits?: number // 仅 CTR，默认 64
}

function buildAlgParams(p: CryptParams): AesGcmParams | AesCbcParams | AesCtrParams {
  if (p.mode === 'GCM') {
    return {
      name: 'AES-GCM',
      iv: new Uint8Array(p.iv),
      additionalData: p.aad ? new Uint8Array(p.aad) : undefined,
    }
  }
  if (p.mode === 'CBC') return { name: 'AES-CBC', iv: new Uint8Array(p.iv) }
  return { name: 'AES-CTR', counter: new Uint8Array(p.iv), length: p.ctrLengthBits ?? 64 }
}

export async function encryptBytes(plaintext: Uint8Array, p: CryptParams): Promise<Uint8Array> {
  const ct = await crypto.subtle.encrypt(
    buildAlgParams(p) as AlgorithmIdentifier,
    p.key,
    new Uint8Array(plaintext),
  )
  return new Uint8Array(ct)
}

export async function decryptBytes(ciphertext: Uint8Array, p: CryptParams): Promise<Uint8Array> {
  const pt = await crypto.subtle.decrypt(
    buildAlgParams(p) as AlgorithmIdentifier,
    p.key,
    new Uint8Array(ciphertext),
  )
  return new Uint8Array(pt)
}
