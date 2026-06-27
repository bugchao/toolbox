// bcrypt 方案（基于 bcryptjs）。Apache 推荐使用 $2y$ 前缀，
// 这里在生成后将前缀规范化为 $2y$ 以获得最佳兼容性。

import bcrypt from 'bcryptjs'

export const DEFAULT_BCRYPT_COST = 10
export const MIN_BCRYPT_COST = 4
export const MAX_BCRYPT_COST = 17

/** 将 bcryptjs 生成的 $2a$/$2b$ 前缀规范化为 Apache 兼容的 $2y$。 */
export function toApacheBcrypt(hash: string): string {
  return hash.replace(/^\$2[abxy]\$/, '$2y$')
}

/** 生成 bcrypt 哈希（$2y$ 前缀）。 */
export function bcryptHash(password: string, cost = DEFAULT_BCRYPT_COST): string {
  const rounds = Math.max(MIN_BCRYPT_COST, Math.min(MAX_BCRYPT_COST, Math.floor(cost)))
  const salt = bcrypt.genSaltSync(rounds)
  return toApacheBcrypt(bcrypt.hashSync(password, salt))
}

/** 校验密码与 bcrypt 哈希是否匹配（自洽校验用）。 */
export function bcryptVerify(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash)
}
