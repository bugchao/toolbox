/**
 * chmod 权限计算核心逻辑（纯函数，无副作用）
 *
 * 设计要点：
 * - 三类主体：owner / group / other，每类含 read(4) / write(2) / execute(1)
 * - 三个特殊位：setuid(4) / setgid(2) / sticky(1)
 * - 双向：state <-> 八进制字符串
 */

export type ClassId = 'owner' | 'group' | 'other'
export type PermId = 'read' | 'write' | 'execute'
export type SpecialId = 'setuid' | 'setgid' | 'sticky'

export const CLASS_IDS: ClassId[] = ['owner', 'group', 'other']
export const PERM_IDS: PermId[] = ['read', 'write', 'execute']
export const SPECIAL_IDS: SpecialId[] = ['setuid', 'setgid', 'sticky']

/** 权限位对应的数值权重 */
export const PERM_VALUE: Record<PermId, number> = { read: 4, write: 2, execute: 1 }
/** 特殊位对应的数值权重 */
export const SPECIAL_VALUE: Record<SpecialId, number> = { setuid: 4, setgid: 2, sticky: 1 }

export type ClassPerms = Record<PermId, boolean>

export interface ChmodState {
  owner: ClassPerms
  group: ClassPerms
  other: ClassPerms
  setuid: boolean
  setgid: boolean
  sticky: boolean
}

const emptyClass = (): ClassPerms => ({ read: false, write: false, execute: false })

/** 默认值：755（rwxr-xr-x），常见目录/脚本权限 */
export function createDefaultState(): ChmodState {
  return {
    owner: { read: true, write: true, execute: true },
    group: { read: true, write: false, execute: true },
    other: { read: true, write: false, execute: true },
    setuid: false,
    setgid: false,
    sticky: false,
  }
}

/** 单个主体的八进制数字 0-7 */
export function classDigit(perms: ClassPerms): number {
  return (
    (perms.read ? PERM_VALUE.read : 0) +
    (perms.write ? PERM_VALUE.write : 0) +
    (perms.execute ? PERM_VALUE.execute : 0)
  )
}

/** 特殊位的八进制数字 0-7 */
export function specialDigit(state: ChmodState): number {
  return (
    (state.setuid ? SPECIAL_VALUE.setuid : 0) +
    (state.setgid ? SPECIAL_VALUE.setgid : 0) +
    (state.sticky ? SPECIAL_VALUE.sticky : 0)
  )
}

/**
 * 八进制表示。
 * - 无特殊位：3 位（如 "755"）
 * - 有特殊位：4 位（如 "1755"）
 */
export function toOctal(state: ChmodState): string {
  const base = `${classDigit(state.owner)}${classDigit(state.group)}${classDigit(state.other)}`
  const special = specialDigit(state)
  return special > 0 ? `${special}${base}` : base
}

/** 始终返回 4 位八进制（如 "0755"），用于稳定展示 */
export function toOctal4(state: ChmodState): string {
  return `${specialDigit(state)}${classDigit(state.owner)}${classDigit(state.group)}${classDigit(
    state.other,
  )}`
}

/**
 * 符号表示，9 个字符（如 "rwxr-xr-x"）。
 * 特殊位规则：
 * - setuid 作用于 owner 的 execute 位：有 x → 's'，无 x → 'S'
 * - setgid 作用于 group 的 execute 位：有 x → 's'，无 x → 'S'
 * - sticky 作用于 other 的 execute 位：有 x → 't'，无 x → 'T'
 */
export function toSymbolic(state: ChmodState): string {
  const triad = (
    perms: ClassPerms,
    special: boolean,
    specialChar: 's' | 't',
  ): string => {
    const r = perms.read ? 'r' : '-'
    const w = perms.write ? 'w' : '-'
    let x: string
    if (special) {
      const lower = specialChar
      const upper = specialChar.toUpperCase()
      x = perms.execute ? lower : upper
    } else {
      x = perms.execute ? 'x' : '-'
    }
    return `${r}${w}${x}`
  }

  return (
    triad(state.owner, state.setuid, 's') +
    triad(state.group, state.setgid, 's') +
    triad(state.other, state.sticky, 't')
  )
}

/** 校验八进制字符串是否合法（3 或 4 位，每位 0-7） */
export function isValidOctal(input: string): boolean {
  const trimmed = input.trim()
  if (!/^[0-7]{3,4}$/.test(trimmed)) return false
  return true
}

const digitToClass = (digit: number): ClassPerms => ({
  read: (digit & 4) !== 0,
  write: (digit & 2) !== 0,
  execute: (digit & 1) !== 0,
})

/**
 * 由八进制字符串反推 state。输入非法时返回 null。
 * 接受 3 位（无特殊位）或 4 位（首位为特殊位）。
 */
export function fromOctal(input: string): ChmodState | null {
  const trimmed = input.trim()
  if (!isValidOctal(trimmed)) return null

  const padded = trimmed.length === 3 ? `0${trimmed}` : trimmed
  const [s, o, g, ot] = padded.split('').map((c) => Number.parseInt(c, 10))

  return {
    owner: digitToClass(o),
    group: digitToClass(g),
    other: digitToClass(ot),
    setuid: (s & 4) !== 0,
    setgid: (s & 2) !== 0,
    sticky: (s & 1) !== 0,
  }
}
