import { describe, it, expect } from 'vitest'
import { padJpeg } from '../lib/pad-jpeg'

// 最小合法 JPEG：SOI + 一个占位标记 + EOI
const MINIMAL_JPEG = new Uint8Array([0xff, 0xd8, 0xff, 0xd9])

describe('padJpeg', () => {
  it('pads to the exact target size', () => {
    const result = padJpeg(MINIMAL_JPEG, 100)
    expect(result.length).toBe(100)
  })

  it('preserves the original bytes up to and including EOI', () => {
    const result = padJpeg(MINIMAL_JPEG, 10)
    expect(Array.from(result.subarray(0, 4))).toEqual([0xff, 0xd8, 0xff, 0xd9])
  })

  it('drops any pre-existing trailing bytes after EOI before re-padding', () => {
    const withJunk = new Uint8Array([0xff, 0xd8, 0xff, 0xd9, 0x11, 0x22, 0x33])
    const result = padJpeg(withJunk, 20)
    expect(result.length).toBe(20)
    expect(Array.from(result.subarray(0, 4))).toEqual([0xff, 0xd8, 0xff, 0xd9])
    expect(Array.from(result.subarray(4))).toEqual(new Array(16).fill(0))
  })

  it('throws when target size is not greater than current size', () => {
    expect(() => padJpeg(MINIMAL_JPEG, 4)).toThrow()
    expect(() => padJpeg(MINIMAL_JPEG, 2)).toThrow()
  })

  it('throws for missing SOI marker', () => {
    expect(() => padJpeg(new Uint8Array([0x00, 0x00, 0xff, 0xd9]), 100)).toThrow()
  })

  it('throws for missing EOI marker', () => {
    expect(() => padJpeg(new Uint8Array([0xff, 0xd8, 0x00, 0x00]), 100)).toThrow()
  })
})
