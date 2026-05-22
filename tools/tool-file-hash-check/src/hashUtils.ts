// 文件哈希计算：MD5 用纯 JS 实现（Web Crypto 不支持），SHA-* 用 crypto.subtle.digest

export type HashAlgo = 'MD5' | 'SHA-1' | 'SHA-256' | 'SHA-512'

export const ALGOS: HashAlgo[] = ['MD5', 'SHA-1', 'SHA-256', 'SHA-512']

export const HEX_LENGTHS: Record<HashAlgo, number> = {
  MD5: 32,
  'SHA-1': 40,
  'SHA-256': 64,
  'SHA-512': 128,
}

/** 由 hex 长度推断算法 */
export function detectAlgo(hex: string): HashAlgo | null {
  const cleaned = hex.replace(/\s+/g, '').toLowerCase()
  if (!/^[0-9a-f]+$/.test(cleaned)) return null
  for (const a of ALGOS) {
    if (cleaned.length === HEX_LENGTHS[a]) return a
  }
  return null
}

export function bytesToHex(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf)
  let hex = ''
  for (let i = 0; i < bytes.length; i++) hex += bytes[i].toString(16).padStart(2, '0')
  return hex
}

// ──────────────────────────────────────────────────────────
// MD5 —— RFC 1321 标准实现，输入 Uint8Array，返回 hex
// ──────────────────────────────────────────────────────────
const MD5_S = new Uint32Array([
  7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
  5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
  4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
  6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
])
const MD5_K = new Uint32Array(64)
for (let i = 0; i < 64; i++) {
  // floor(2^32 * |sin(i+1)|)
  MD5_K[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 0x100000000)
}

function leftRotate(x: number, n: number): number {
  return ((x << n) | (x >>> (32 - n))) | 0
}

export function md5(input: Uint8Array): string {
  const originalLen = input.length
  const bitLen = BigInt(originalLen) * 8n

  // 填充：先 0x80，然后 0..63 个 0，使得总长度 mod 64 = 56；最后 8 字节 little-endian 长度
  const padLen = ((56 - ((originalLen + 1) % 64)) + 64) % 64
  const totalLen = originalLen + 1 + padLen + 8
  const msg = new Uint8Array(totalLen)
  msg.set(input)
  msg[originalLen] = 0x80
  const view = new DataView(msg.buffer)
  view.setBigUint64(totalLen - 8, bitLen, true)

  let a0 = 0x67452301 | 0
  let b0 = 0xefcdab89 | 0
  let c0 = 0x98badcfe | 0
  let d0 = 0x10325476 | 0

  const M = new Uint32Array(16)
  for (let off = 0; off < totalLen; off += 64) {
    for (let j = 0; j < 16; j++) {
      M[j] =
        msg[off + j * 4] |
        (msg[off + j * 4 + 1] << 8) |
        (msg[off + j * 4 + 2] << 16) |
        (msg[off + j * 4 + 3] << 24)
    }
    let A = a0
    let B = b0
    let C = c0
    let D = d0
    for (let k = 0; k < 64; k++) {
      let F: number
      let g: number
      if (k < 16) {
        F = (B & C) | (~B & D)
        g = k
      } else if (k < 32) {
        F = (D & B) | (~D & C)
        g = (5 * k + 1) % 16
      } else if (k < 48) {
        F = B ^ C ^ D
        g = (3 * k + 5) % 16
      } else {
        F = C ^ (B | ~D)
        g = (7 * k) % 16
      }
      F = (F + A + MD5_K[k] + M[g]) | 0
      A = D
      D = C
      C = B
      B = (B + leftRotate(F, MD5_S[k])) | 0
    }
    a0 = (a0 + A) | 0
    b0 = (b0 + B) | 0
    c0 = (c0 + C) | 0
    d0 = (d0 + D) | 0
  }

  const toLeHex = (x: number) =>
    (x & 0xff).toString(16).padStart(2, '0') +
    ((x >>> 8) & 0xff).toString(16).padStart(2, '0') +
    ((x >>> 16) & 0xff).toString(16).padStart(2, '0') +
    ((x >>> 24) & 0xff).toString(16).padStart(2, '0')

  return toLeHex(a0) + toLeHex(b0) + toLeHex(c0) + toLeHex(d0)
}

// ──────────────────────────────────────────────────────────
// 统一计算入口
// ──────────────────────────────────────────────────────────
export async function computeHashes(
  buffer: ArrayBuffer,
  algos: HashAlgo[] = ALGOS,
): Promise<Record<HashAlgo, string>> {
  const result = {} as Record<HashAlgo, string>
  const tasks: Promise<void>[] = []
  for (const a of algos) {
    if (a === 'MD5') {
      tasks.push(
        Promise.resolve().then(() => {
          result.MD5 = md5(new Uint8Array(buffer))
        }),
      )
    } else {
      tasks.push(
        crypto.subtle.digest(a, buffer).then((buf) => {
          result[a] = bytesToHex(buf)
        }),
      )
    }
  }
  await Promise.all(tasks)
  return result
}

export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`
}
