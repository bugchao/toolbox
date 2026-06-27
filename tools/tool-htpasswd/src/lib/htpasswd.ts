// htpasswd 条目组装、校验与文件内容生成的纯逻辑。

import { apr1 } from './apr1'
import { bcryptHash, DEFAULT_BCRYPT_COST } from './bcrypt'
import { shaHash } from './sha'

export type HtpasswdAlgorithm = 'bcrypt' | 'apr1' | 'sha'

export interface HtpasswdEntry {
  username: string
  hash: string
  algorithm: HtpasswdAlgorithm
}

export type UsernameValidation =
  | { ok: true }
  | { ok: false; reason: 'empty' | 'colon' | 'whitespace' }

/** 校验用户名：非空、不含冒号、不含空白字符。 */
export function validateUsername(username: string): UsernameValidation {
  if (username.length === 0) return { ok: false, reason: 'empty' }
  if (username.includes(':')) return { ok: false, reason: 'colon' }
  if (/\s/.test(username)) return { ok: false, reason: 'whitespace' }
  return { ok: true }
}

/** 校验密码是否非空。 */
export function isPasswordValid(password: string): boolean {
  return password.length > 0
}

/**
 * 计算指定算法的哈希。bcrypt/apr1 为同步，sha 为异步（WebCrypto）。
 */
export async function computeHash(
  algorithm: HtpasswdAlgorithm,
  password: string,
  options?: { cost?: number; salt?: string },
): Promise<string> {
  switch (algorithm) {
    case 'bcrypt':
      return bcryptHash(password, options?.cost ?? DEFAULT_BCRYPT_COST)
    case 'apr1':
      return apr1(password, options?.salt)
    case 'sha':
      return shaHash(password)
    default:
      throw new Error(`Unsupported algorithm: ${algorithm as string}`)
  }
}

/** 生成单行 htpasswd 条目：username:hash。 */
export function formatEntry(username: string, hash: string): string {
  return `${username}:${hash}`
}

/** 将多条目组装成 .htpasswd 文件内容（每行一个，结尾换行）。 */
export function buildHtpasswdFile(entries: HtpasswdEntry[]): string {
  if (entries.length === 0) return ''
  return entries.map((e) => formatEntry(e.username, e.hash)).join('\n') + '\n'
}
