import { describe, it, expect } from 'vitest'
import {
  bitwise,
  bitwiseNot,
  groupBits,
  parseInBase,
  toAllBases,
  toBase,
  twosComplement,
} from './base'

const val = (s: string, base: number) => {
  const r = parseInBase(s, base)
  if (!r.ok) throw new Error(r.message)
  return r.negative ? -r.value : r.value
}

describe('parseInBase', () => {
  it('parses common bases', () => {
    expect(val('ff', 16)).toBe(255n)
    expect(val('777', 8)).toBe(511n)
    expect(val('1010', 2)).toBe(10n)
    expect(val('100', 10)).toBe(100n)
  })
  it('arbitrary base up to 36', () => {
    expect(val('z', 36)).toBe(35n)
    expect(val('10', 36)).toBe(36n)
  })
  it('handles sign and separators', () => {
    expect(val('-ff', 16)).toBe(-255n)
    expect(val('1010_1010', 2)).toBe(170n)
    expect(val('ff ff', 16)).toBe(65535n)
  })
  it('big integers beyond Number range', () => {
    const big = val('ffffffffffffffff', 16)
    expect(big).toBe(18446744073709551615n)
  })
  it('rejects bad digits / empty / bad base', () => {
    expect(parseInBase('2', 2).ok).toBe(false) // 2 not valid in binary
    expect(parseInBase('xyz', 16).ok).toBe(false)
    expect(parseInBase('', 10).ok).toBe(false)
    expect(parseInBase('10', 37).ok).toBe(false)
  })
})

describe('toBase', () => {
  it('formats common bases', () => {
    expect(toBase(255n, 16, true)).toBe('FF')
    expect(toBase(10n, 2)).toBe('1010')
    expect(toBase(511n, 8)).toBe('777')
  })
  it('zero and negative', () => {
    expect(toBase(0n, 2)).toBe('0')
    expect(toBase(-255n, 16, true)).toBe('-FF')
  })
  it('arbitrary base 36', () => {
    expect(toBase(35n, 36)).toBe('z')
    expect(toBase(36n, 36)).toBe('10')
  })
  it('round-trips with parseInBase across bases', () => {
    for (const base of [2, 8, 10, 16, 36]) {
      const s = toBase(123456789n, base)
      expect(val(s, base)).toBe(123456789n)
    }
  })
})

describe('toAllBases', () => {
  it('gives bin/oct/dec/hex', () => {
    expect(toAllBases(255n)).toEqual({ bin: '11111111', oct: '377', dec: '255', hex: 'FF' })
  })
})

describe('twosComplement', () => {
  it('positive within range', () => {
    const r = twosComplement(5n, 8)
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.bits).toBe('00000101')
      expect(r.hex).toBe('05')
      expect(r.signed).toBe(5n)
    }
  })
  it('negative → two complement bits', () => {
    const r = twosComplement(-1n, 8)
    if (r.ok) {
      expect(r.bits).toBe('11111111')
      expect(r.unsigned).toBe(255n)
      expect(r.signed).toBe(-1n)
    }
  })
  it('-128 is the 8-bit min', () => {
    const r = twosComplement(-128n, 8)
    if (r.ok) expect(r.bits).toBe('10000000')
  })
  it('high unsigned reinterpreted as signed', () => {
    const r = twosComplement(200n, 8) // > signedMax 127
    if (r.ok) expect(r.signed).toBe(-56n)
  })
  it('out of range errors', () => {
    expect(twosComplement(256n, 8).ok).toBe(false)
    expect(twosComplement(-129n, 8).ok).toBe(false)
  })
  it('64-bit width', () => {
    const r = twosComplement(-1n, 64)
    if (r.ok) {
      expect(r.bits.length).toBe(64)
      expect(r.unsigned).toBe(18446744073709551615n)
    }
  })
})

describe('groupBits', () => {
  it('groups every 4 bits from the right', () => {
    expect(groupBits('11111111')).toBe('1111 1111')
    expect(groupBits('101010')).toBe('10 1010')
  })
})

describe('bitwise', () => {
  it('and / or / xor', () => {
    expect(bitwise(0b1100n, 0b1010n, 'and')).toBe(0b1000n)
    expect(bitwise(0b1100n, 0b1010n, 'or')).toBe(0b1110n)
    expect(bitwise(0b1100n, 0b1010n, 'xor')).toBe(0b0110n)
  })
  it('shifts', () => {
    expect(bitwise(1n, 4n, 'shl')).toBe(16n)
    expect(bitwise(256n, 2n, 'shr')).toBe(64n)
  })
})

describe('bitwiseNot', () => {
  it('masks to width', () => {
    expect(bitwiseNot(0n, 8)).toBe(255n)
    expect(bitwiseNot(0b1111n, 8)).toBe(0b11110000n)
  })
})
