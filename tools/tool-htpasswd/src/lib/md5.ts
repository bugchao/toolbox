// 零依赖 MD5 实现，作用于字节（Uint8Array）以支持 apr1 算法。
// 参考 RFC 1321。仅供本工具内部使用，纯浏览器/Node 通用。

function concatBytes(chunks: Uint8Array[]): Uint8Array {
  let total = 0
  for (const c of chunks) total += c.length
  const out = new Uint8Array(total)
  let offset = 0
  for (const c of chunks) {
    out.set(c, offset)
    offset += c.length
  }
  return out
}

function rotl(x: number, c: number): number {
  return (x << c) | (x >>> (32 - c))
}

/** 计算 MD5，返回 16 字节摘要。 */
export function md5Bytes(input: Uint8Array): Uint8Array {
  // 预处理：补位
  const originalLenBits = input.length * 8
  // 至少补一个 0x80，然后补 0 直到 length % 64 === 56，最后加 8 字节长度
  const paddedLen = ((input.length + 8) >>> 6) * 64 + 64
  const msg = new Uint8Array(paddedLen)
  msg.set(input)
  msg[input.length] = 0x80
  // 写入 64 位长度（小端，仅低 32 位足够常规输入，但写满 64 位更安全）
  const lenLo = originalLenBits >>> 0
  const lenHi = Math.floor(originalLenBits / 0x100000000) >>> 0
  const lenOffset = paddedLen - 8
  msg[lenOffset] = lenLo & 0xff
  msg[lenOffset + 1] = (lenLo >>> 8) & 0xff
  msg[lenOffset + 2] = (lenLo >>> 16) & 0xff
  msg[lenOffset + 3] = (lenLo >>> 24) & 0xff
  msg[lenOffset + 4] = lenHi & 0xff
  msg[lenOffset + 5] = (lenHi >>> 8) & 0xff
  msg[lenOffset + 6] = (lenHi >>> 16) & 0xff
  msg[lenOffset + 7] = (lenHi >>> 24) & 0xff

  // 每轮左移量
  const s = [
    7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
    5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
    4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
    6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
  ]
  // 常量 K
  const K = new Int32Array(64)
  for (let i = 0; i < 64; i++) {
    K[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 4294967296) | 0
  }

  let a0 = 0x67452301
  let b0 = 0xefcdab89
  let c0 = 0x98badcfe
  let d0 = 0x10325476

  const M = new Int32Array(16)
  for (let chunk = 0; chunk < paddedLen; chunk += 64) {
    for (let i = 0; i < 16; i++) {
      const j = chunk + i * 4
      M[i] = msg[j] | (msg[j + 1] << 8) | (msg[j + 2] << 16) | (msg[j + 3] << 24)
    }

    let A = a0
    let B = b0
    let C = c0
    let D = d0

    for (let i = 0; i < 64; i++) {
      let F: number
      let g: number
      if (i < 16) {
        F = (B & C) | (~B & D)
        g = i
      } else if (i < 32) {
        F = (D & B) | (~D & C)
        g = (5 * i + 1) % 16
      } else if (i < 48) {
        F = B ^ C ^ D
        g = (3 * i + 5) % 16
      } else {
        F = C ^ (B | ~D)
        g = (7 * i) % 16
      }
      F = (F + A + K[i] + M[g]) | 0
      A = D
      D = C
      C = B
      B = (B + rotl(F, s[i])) | 0
    }

    a0 = (a0 + A) | 0
    b0 = (b0 + B) | 0
    c0 = (c0 + C) | 0
    d0 = (d0 + D) | 0
  }

  const out = new Uint8Array(16)
  const words = [a0, b0, c0, d0]
  for (let i = 0; i < 4; i++) {
    out[i * 4] = words[i] & 0xff
    out[i * 4 + 1] = (words[i] >>> 8) & 0xff
    out[i * 4 + 2] = (words[i] >>> 16) & 0xff
    out[i * 4 + 3] = (words[i] >>> 24) & 0xff
  }
  return out
}

/** 计算多段拼接后的 MD5。 */
export function md5Concat(chunks: Uint8Array[]): Uint8Array {
  return md5Bytes(concatBytes(chunks))
}

/** 返回 32 位小写十六进制 MD5 字符串。 */
export function md5Hex(input: Uint8Array): string {
  const bytes = md5Bytes(input)
  let hex = ''
  for (const b of bytes) hex += b.toString(16).padStart(2, '0')
  return hex
}
