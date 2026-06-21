/** 任意进制（2–36）+ BigInt + 位运算 + 补码视图。零依赖纯函数。 */

const DIGITS = '0123456789abcdefghijklmnopqrstuvwxyz'

export type ParseResult =
  | { ok: true; value: bigint; negative: boolean }
  | { ok: false; message: string }

/** 按指定进制解析字符串为 BigInt（支持前导 +/-、忽略下划线/空格分隔）。 */
export function parseInBase(input: string, base: number): ParseResult {
  if (base < 2 || base > 36) return { ok: false, message: 'base_out_of_range' }
  let s = input.trim().toLowerCase().replace(/[_\s]/g, '')
  if (!s) return { ok: false, message: 'empty' }
  let negative = false
  if (s[0] === '+') s = s.slice(1)
  else if (s[0] === '-') { negative = true; s = s.slice(1) }
  if (!s) return { ok: false, message: 'empty' }

  let value = 0n
  const b = BigInt(base)
  for (const ch of s) {
    const d = DIGITS.indexOf(ch)
    if (d === -1 || d >= base) return { ok: false, message: `bad_digit:${ch}` }
    value = value * b + BigInt(d)
  }
  return { ok: true, value, negative }
}

/** BigInt → 指定进制字符串（保留符号）。 */
export function toBase(value: bigint, base: number, upper = false): string {
  if (base < 2 || base > 36) return ''
  const neg = value < 0n
  let v = neg ? -value : value
  if (v === 0n) return '0'
  const b = BigInt(base)
  let out = ''
  while (v > 0n) {
    out = DIGITS[Number(v % b)] + out
    v = v / b
  }
  return (neg ? '-' : '') + (upper ? out.toUpperCase() : out)
}

/** 一次性转所有常用进制。 */
export function toAllBases(value: bigint): { bin: string; oct: string; dec: string; hex: string } {
  return {
    bin: toBase(value, 2),
    oct: toBase(value, 8),
    dec: toBase(value, 10),
    hex: toBase(value, 16, true),
  }
}

// ───────────── 补码视图 ─────────────

export type BitWidth = 8 | 16 | 32 | 64

export type TwosComplement =
  | { ok: true; bits: string; hex: string; unsigned: bigint; signed: bigint }
  | { ok: false; message: string }

/** 把整数按指定位宽显示为补码二进制 + 十六进制。超范围报错。 */
export function twosComplement(value: bigint, width: BitWidth): TwosComplement {
  const max = (1n << BigInt(width)) - 1n
  const signedMin = -(1n << BigInt(width - 1))
  const signedMax = (1n << BigInt(width - 1)) - 1n

  // 接受：无符号 [0, max] 或 有符号 [signedMin, signedMax]
  let raw: bigint
  if (value >= 0n && value <= max) {
    raw = value
  } else if (value >= signedMin && value < 0n) {
    raw = value & max // 补码
  } else {
    return { ok: false, message: `out_of_range_${width}` }
  }

  const bits = raw.toString(2).padStart(width, '0')
  const hex = raw.toString(16).toUpperCase().padStart(width / 4, '0')
  // signed 解释
  const signed = raw > signedMax ? raw - (1n << BigInt(width)) : raw
  return { ok: true, bits, hex, unsigned: raw, signed }
}

/** 分组显示二进制（每 4 位空格）。 */
export function groupBits(bits: string): string {
  const rev = [...bits].reverse().join('')
  const grouped = rev.match(/.{1,4}/g)?.map((g) => [...g].reverse().join('')).reverse().join(' ') ?? bits
  return grouped
}

// ───────────── 位运算 ─────────────

export type BitOp = 'and' | 'or' | 'xor' | 'shl' | 'shr'

export function bitwise(a: bigint, b: bigint, op: BitOp): bigint {
  switch (op) {
    case 'and': return a & b
    case 'or': return a | b
    case 'xor': return a ^ b
    case 'shl': return a << b
    case 'shr': return a >> b
  }
}

/** NOT 需要位宽（否则 BigInt 的 ~ 是无限位）。返回该位宽内的按位取反。 */
export function bitwiseNot(a: bigint, width: BitWidth): bigint {
  const mask = (1n << BigInt(width)) - 1n
  return (~a) & mask
}
