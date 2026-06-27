// Apache APR1（基于 MD5 的迭代）密码哈希实现，零依赖。
// 生成 $apr1$salt$hash 形式，兼容 Apache htpasswd 的 -m（MD5）选项。

import { md5Concat } from './md5'

const MAGIC = '$apr1$'
const ITOA64 = './0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'

const encoder = new TextEncoder()

/** apr1 专用的 base64 变体编码：从低位起每 6 bit 取一个字符。 */
function to64(value: number, count: number): string {
  let out = ''
  let v = value
  for (let i = 0; i < count; i++) {
    out += ITOA64[v & 0x3f]
    v = Math.floor(v / 64)
  }
  return out
}

/** 生成合法的 apr1 盐（最长 8 个字符，取自 itoa64 字母表）。 */
export function generateAprSalt(length = 8): string {
  const n = Math.max(1, Math.min(8, length))
  const bytes = new Uint8Array(n)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes)
  } else {
    for (let i = 0; i < n; i++) bytes[i] = Math.floor(Math.random() * 256)
  }
  let salt = ''
  for (let i = 0; i < n; i++) salt += ITOA64[bytes[i] & 0x3f]
  return salt
}

/**
 * 计算 apr1 哈希。
 * @param password 明文密码
 * @param salt 盐（自动截断到 8 个字符；省略时随机生成）
 */
export function apr1(password: string, salt?: string): string {
  const usedSalt = (salt ?? generateAprSalt()).slice(0, 8)
  const pw = encoder.encode(password)
  const saltBytes = encoder.encode(usedSalt)
  const magicBytes = encoder.encode(MAGIC)

  // 初始摘要：password + salt + password
  const alternate = md5Concat([pw, saltBytes, pw])

  // 主上下文片段：password + magic + salt
  const chunks: Uint8Array[] = [pw, magicBytes, saltBytes]

  // 追加 password.length 字节的 alternate（按 16 字节循环取）
  for (let i = pw.length; i > 0; i -= 16) {
    chunks.push(alternate.subarray(0, Math.min(i, 16)))
  }

  // 按 password 长度的二进制位追加：奇数位补 0x00，偶数位补 password[0]
  for (let i = pw.length; i > 0; i >>>= 1) {
    if (i & 1) {
      chunks.push(new Uint8Array([0]))
    } else {
      chunks.push(pw.subarray(0, 1))
    }
  }

  let digest = md5Concat(chunks)

  // 1000 轮迭代强化
  for (let i = 0; i < 1000; i++) {
    const round: Uint8Array[] = []
    round.push(i & 1 ? pw : digest)
    if (i % 3 !== 0) round.push(saltBytes)
    if (i % 7 !== 0) round.push(pw)
    round.push(i & 1 ? digest : pw)
    digest = md5Concat(round)
  }

  // 自定义 base64 编排
  let p = ''
  p += to64((digest[0] << 16) | (digest[6] << 8) | digest[12], 4)
  p += to64((digest[1] << 16) | (digest[7] << 8) | digest[13], 4)
  p += to64((digest[2] << 16) | (digest[8] << 8) | digest[14], 4)
  p += to64((digest[3] << 16) | (digest[9] << 8) | digest[15], 4)
  p += to64((digest[4] << 16) | (digest[10] << 8) | digest[5], 4)
  p += to64(digest[11], 2)

  return `${MAGIC}${usedSalt}$${p}`
}
