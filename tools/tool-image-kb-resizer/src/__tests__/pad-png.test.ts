import { describe, it, expect } from 'vitest'
import { padPng } from '../lib/pad-png'
import { crc32 } from '../lib/crc32'

function u32be(n: number): number[] {
  return [(n >>> 24) & 0xff, (n >>> 16) & 0xff, (n >>> 8) & 0xff, n & 0xff]
}

function buildMinimalPng(): Uint8Array {
  const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]
  const ihdrData = new Array(13).fill(0)
  const ihdrChunk = [...u32be(13), 0x49, 0x48, 0x44, 0x52, ...ihdrData, ...u32be(0)] // 'IHDR', dummy crc
  const iendChunk = [...u32be(0), 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82] // 'IEND' + real crc
  return new Uint8Array([...signature, ...ihdrChunk, ...iendChunk])
}

describe('padPng', () => {
  it('pads to the exact target size', () => {
    const png = buildMinimalPng()
    const result = padPng(png, 500)
    expect(result.length).toBe(500)
  })

  it('keeps the IEND chunk as the last chunk after padding', () => {
    const png = buildMinimalPng()
    const result = padPng(png, 200)
    // IEND 块总长 12 字节：length(4)+type(4)+crc(4)，data 为空
    const iendType = result.subarray(result.length - 8, result.length - 4)
    expect(Array.from(iendType)).toEqual([0x49, 0x45, 0x4e, 0x44]) // 'IEND' type
  })

  it('inserted chunk type is ancillary + safe-to-copy with reserved bit correct', () => {
    const png = buildMinimalPng()
    const result = padPng(png, 200)
    // 插入块紧跟在 IHDR 之后，签名(8)+IHDR(4+4+13+4=25) = 33
    const insertedType = result.subarray(33 + 4, 33 + 8)
    const [b0, b1, b2, b3] = Array.from(insertedType)
    expect(b0 & 0x20).toBe(0x20) // ancillary
    expect(b1 & 0x20).toBe(0x20) // private
    expect(b2 & 0x20).toBe(0x00) // reserved must stay 0（大写）
    expect(b3 & 0x20).toBe(0x20) // safe-to-copy
  })

  it('inserted chunk has a correct CRC-32 over type+data', () => {
    const png = buildMinimalPng()
    const result = padPng(png, 200)
    const insertedStart = 33
    const dataLen = ((result[insertedStart] << 24) | (result[insertedStart + 1] << 16) | (result[insertedStart + 2] << 8) | result[insertedStart + 3]) >>> 0
    const typeAndData = result.subarray(insertedStart + 4, insertedStart + 8 + dataLen)
    const storedCrc = result.subarray(insertedStart + 8 + dataLen, insertedStart + 12 + dataLen)
    const expectedCrc = crc32(typeAndData)
    expect(Array.from(storedCrc)).toEqual(Array.from(new Uint8Array([(expectedCrc >>> 24) & 0xff, (expectedCrc >>> 16) & 0xff, (expectedCrc >>> 8) & 0xff, expectedCrc & 0xff])))
  })

  it('throws when target is too small to fit even an empty padding chunk', () => {
    const png = buildMinimalPng()
    expect(() => padPng(png, png.length + 1)).toThrow()
  })

  it('throws when target size is not greater than current size', () => {
    const png = buildMinimalPng()
    expect(() => padPng(png, png.length)).toThrow()
  })

  it('throws for invalid PNG signature', () => {
    expect(() => padPng(new Uint8Array(20), 100)).toThrow()
  })
})
