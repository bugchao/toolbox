import { describe, it, expect } from 'vitest'
import { crc32 } from '../lib/crc32'

describe('crc32', () => {
  it('matches the standard test vector for "123456789"', () => {
    const bytes = new TextEncoder().encode('123456789')
    expect(crc32(bytes)).toBe(0xcbf43926)
  })

  it('returns 0 for empty input', () => {
    expect(crc32(new Uint8Array(0))).toBe(0)
  })

  it('is deterministic and order-sensitive', () => {
    const a = crc32(new TextEncoder().encode('abc'))
    const b = crc32(new TextEncoder().encode('cba'))
    expect(a).not.toBe(b)
    expect(crc32(new TextEncoder().encode('abc'))).toBe(a)
  })
})
