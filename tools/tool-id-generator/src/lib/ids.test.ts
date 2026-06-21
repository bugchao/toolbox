import { describe, it, expect } from 'vitest'
import {
  formatUuid,
  generate,
  generateMany,
  isUuid,
  nanoid,
  ulid,
  ulidTime,
  uuidV4,
  uuidV7,
} from './ids'

describe('formatUuid', () => {
  it('formats 16 bytes as 8-4-4-4-12', () => {
    const b = new Uint8Array(16).map((_, i) => i)
    expect(formatUuid(b)).toBe('00010203-0405-0607-0809-0a0b0c0d0e0f')
  })
})

describe('uuidV4', () => {
  it('matches UUID shape', () => {
    expect(isUuid(uuidV4())).toBe(true)
  })
  it('has version nibble 4 and variant bits', () => {
    const id = uuidV4()
    expect(id[14]).toBe('4')
    expect(['8', '9', 'a', 'b']).toContain(id[19].toLowerCase())
  })
  it('produces distinct values', () => {
    const set = new Set(Array.from({ length: 100 }, () => uuidV4()))
    expect(set.size).toBe(100)
  })
})

describe('uuidV7', () => {
  it('has version nibble 7', () => {
    const id = uuidV7()
    expect(id[14]).toBe('7')
  })
  it('encodes the timestamp in the first 48 bits', () => {
    const now = 0x017f_0000_0000 // arbitrary 48-bit value
    const id = uuidV7(now, new Uint8Array(10))
    const hex = id.replace(/-/g, '')
    expect(hex.slice(0, 12)).toBe('017f00000000')
  })
  it('is lexically ordered by time', () => {
    const a = uuidV7(1000, new Uint8Array(10))
    const b = uuidV7(2000, new Uint8Array(10))
    expect(a < b).toBe(true)
  })
})

describe('ulid', () => {
  it('is 26 chars, Crockford base32', () => {
    const id = ulid()
    expect(id).toHaveLength(26)
    expect(/^[0-9A-HJKMNP-TV-Z]{26}$/.test(id)).toBe(true)
  })
  it('round-trips the timestamp', () => {
    const now = 1700000000000
    const id = ulid(now, new Uint8Array(10))
    expect(ulidTime(id)).toBe(now)
  })
  it('is lexically ordered by time', () => {
    const a = ulid(1000, new Uint8Array(10))
    const b = ulid(2000, new Uint8Array(10))
    expect(a < b).toBe(true)
  })
  it('ulidTime rejects invalid chars', () => {
    expect(ulidTime('IIIIIIIIII0000000000000000')).toBeNull()
  })
})

describe('nanoid', () => {
  it('default length 21', () => {
    expect(nanoid()).toHaveLength(21)
  })
  it('custom size', () => {
    expect(nanoid(10)).toHaveLength(10)
  })
  it('only uses url-safe alphabet chars', () => {
    expect(/^[A-Za-z0-9_-]+$/.test(nanoid(64))).toBe(true)
  })
  it('distinct', () => {
    const set = new Set(Array.from({ length: 100 }, () => nanoid()))
    expect(set.size).toBe(100)
  })
})

describe('generate / generateMany', () => {
  it('dispatches per kind', () => {
    expect(isUuid(generate('uuidv4'))).toBe(true)
    expect(generate('ulid')).toHaveLength(26)
    expect(generate('nanoid', 8)).toHaveLength(8)
  })
  it('generateMany returns N ids, clamped to [1,1000]', () => {
    expect(generateMany('uuidv4', 5)).toHaveLength(5)
    expect(generateMany('uuidv4', 0)).toHaveLength(1)
    expect(generateMany('uuidv4', 99999)).toHaveLength(1000)
  })
})

describe('isUuid', () => {
  it('accepts valid, rejects junk', () => {
    expect(isUuid('00010203-0405-0607-0809-0a0b0c0d0e0f')).toBe(true)
    expect(isUuid('not-a-uuid')).toBe(false)
    expect(isUuid('000102030405060708090a0b0c0d0e0f')).toBe(false)
  })
})
