/** ID 生成：UUID v4 / v7、ULID、NanoID。全用 crypto.getRandomValues，零依赖。 */

export type IdKind = 'uuidv4' | 'uuidv7' | 'ulid' | 'nanoid'

function randomBytes(n: number): Uint8Array {
  const a = new Uint8Array(n)
  crypto.getRandomValues(a)
  return a
}

function toHex(bytes: Uint8Array): string {
  let s = ''
  for (const b of bytes) s += b.toString(16).padStart(2, '0')
  return s
}

/** 把 16 字节格式化成 8-4-4-4-12 UUID 字符串。 */
export function formatUuid(bytes: Uint8Array): string {
  const h = toHex(bytes)
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20, 32)}`
}

/** UUID v4（随机）。 */
export function uuidV4(): string {
  const b = randomBytes(16)
  b[6] = (b[6] & 0x0f) | 0x40 // version 4
  b[8] = (b[8] & 0x3f) | 0x80 // variant
  return formatUuid(b)
}

/** UUID v7（时间有序：前 48 位毫秒时间戳 + 随机）。 */
export function uuidV7(now = Date.now(), rnd: Uint8Array = randomBytes(10)): string {
  const b = new Uint8Array(16)
  const ts = BigInt(now)
  // 48-bit big-endian timestamp
  for (let i = 0; i < 6; i++) {
    b[i] = Number((ts >> BigInt((5 - i) * 8)) & 0xffn)
  }
  // 余下 10 字节随机
  b.set(rnd.subarray(0, 10), 6)
  b[6] = (b[6] & 0x0f) | 0x70 // version 7
  b[8] = (b[8] & 0x3f) | 0x80 // variant
  return formatUuid(b)
}

// ───────────── ULID ─────────────

const CROCKFORD = '0123456789ABCDEFGHJKMNPQRSTVWXYZ' // 无 I L O U

/** ULID：48 位时间戳（10 字符）+ 80 位随机（16 字符），Crockford Base32。 */
export function ulid(now = Date.now(), rnd: Uint8Array = randomBytes(10)): string {
  let ts = BigInt(now)
  let timeChars = ''
  for (let i = 0; i < 10; i++) {
    timeChars = CROCKFORD[Number(ts & 0x1fn)] + timeChars
    ts >>= 5n
  }
  // 80 位随机 → 16 个 base32 字符
  let randBits = 0n
  for (const byte of rnd.subarray(0, 10)) randBits = (randBits << 8n) | BigInt(byte)
  let randChars = ''
  for (let i = 0; i < 16; i++) {
    randChars = CROCKFORD[Number(randBits & 0x1fn)] + randChars
    randBits >>= 5n
  }
  return timeChars + randChars
}

/** 解析 ULID 的时间戳部分（毫秒）。非法返回 null。 */
export function ulidTime(id: string): number | null {
  if (id.length < 10) return null
  let ts = 0n
  for (const ch of id.slice(0, 10).toUpperCase()) {
    const d = CROCKFORD.indexOf(ch)
    if (d === -1) return null
    ts = ts * 32n + BigInt(d)
  }
  return Number(ts)
}

// ───────────── NanoID ─────────────

const NANO_ALPHABET = 'useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict'

/** NanoID：默认 21 字符，URL-safe。alphabet 可定制。 */
export function nanoid(size = 21, alphabet = NANO_ALPHABET): string {
  const bytes = randomBytes(size)
  let out = ''
  for (let i = 0; i < size; i++) {
    out += alphabet[bytes[i] % alphabet.length]
  }
  return out
}

export function generate(kind: IdKind, nanoSize = 21): string {
  switch (kind) {
    case 'uuidv4': return uuidV4()
    case 'uuidv7': return uuidV7()
    case 'ulid': return ulid()
    case 'nanoid': return nanoid(nanoSize)
  }
}

/** 批量生成。 */
export function generateMany(kind: IdKind, count: number, nanoSize = 21): string[] {
  const n = Math.max(1, Math.min(1000, count))
  const out: string[] = []
  for (let i = 0; i < n; i++) out.push(generate(kind, nanoSize))
  return out
}

/** UUID 合法性校验（任意版本）。 */
export function isUuid(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s)
}
