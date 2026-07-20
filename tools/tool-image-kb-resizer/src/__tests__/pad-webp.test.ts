import { describe, it, expect } from 'vitest'
import { padWebp } from '../lib/pad-webp'

function u32le(n: number): number[] {
  return [n & 0xff, (n >>> 8) & 0xff, (n >>> 16) & 0xff, (n >>> 24) & 0xff]
}

function readU32le(bytes: Uint8Array, offset: number): number {
  return (bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16) | (bytes[offset + 3] << 24)) >>> 0
}

// 最小合法 WEBP：RIFF header + 'WEBP' + 一个偶数长度的最小 VP8 chunk（4 字节占位数据）
function buildMinimalWebp(): Uint8Array {
  const vp8Data = [0x00, 0x00, 0x00, 0x00]
  const vp8Chunk = [0x56, 0x50, 0x38, 0x20, ...u32le(vp8Data.length), ...vp8Data] // 'VP8 '
  const payload = [0x57, 0x45, 0x42, 0x50, ...vp8Chunk] // 'WEBP' + chunk
  const riffSize = payload.length
  return new Uint8Array([0x52, 0x49, 0x46, 0x46, ...u32le(riffSize), ...payload]) // 'RIFF' + size + payload
}

describe('padWebp', () => {
  it('pads to the exact target size (even delta)', () => {
    const webp = buildMinimalWebp()
    const result = padWebp(webp, webp.length + 20)
    expect(result.length).toBe(webp.length + 20)
  })

  it('pads to the exact target size (odd delta)', () => {
    const webp = buildMinimalWebp()
    const result = padWebp(webp, webp.length + 21)
    expect(result.length).toBe(webp.length + 21)
  })

  it('updates the outer RIFF size field to match the new chunk', () => {
    const webp = buildMinimalWebp()
    const result = padWebp(webp, webp.length + 20)
    const declaredSize = readU32le(result, 4)
    // RIFF size 字段应等于文件总长度减去 8 字节的 'RIFF'+size 头本身
    // （末尾若有 1 字节奇偶补足的原始尾随字节，不计入声明大小，属正常的“可忽略尾随数据”）
    expect(declaredSize).toBeLessThanOrEqual(result.length - 8)
    expect(declaredSize).toBeGreaterThanOrEqual(result.length - 8 - 1)
  })

  it('preserves the original WEBP payload before the new chunk', () => {
    const webp = buildMinimalWebp()
    const result = padWebp(webp, webp.length + 20)
    expect(Array.from(result.subarray(8, webp.length))).toEqual(Array.from(webp.subarray(8, webp.length)))
  })

  it('falls back to raw trailing bytes when there is no room for a chunk header', () => {
    const webp = buildMinimalWebp()
    const result = padWebp(webp, webp.length + 3)
    expect(result.length).toBe(webp.length + 3)
    expect(Array.from(result.subarray(0, webp.length))).toEqual(Array.from(webp))
  })

  it('throws when target size is not greater than current size', () => {
    const webp = buildMinimalWebp()
    expect(() => padWebp(webp, webp.length)).toThrow()
  })

  it('throws for invalid RIFF/WEBP header', () => {
    expect(() => padWebp(new Uint8Array(20), 100)).toThrow()
  })
})
