import { describe, it, expect } from 'vitest'
import { encodeIco, ICO_HEADER_SIZE, ICO_ENTRY_SIZE } from './ico'

function makeFakePng(size: number, fill: number): Uint8Array {
  // Minimal placeholder bytes - we do not parse them, we only care about layout.
  const bytes = new Uint8Array(size)
  bytes.fill(fill)
  return bytes
}

describe('encodeIco - PNG-in-ICO container', () => {
  const entries = [
    { size: 16, png: makeFakePng(120, 0xa1) },
    { size: 32, png: makeFakePng(240, 0xb2) },
    { size: 48, png: makeFakePng(360, 0xc3) },
  ]
  const ico = encodeIco(entries)
  const view = new DataView(ico.buffer, ico.byteOffset, ico.byteLength)

  it('has the right ICONDIR header', () => {
    expect(view.getUint16(0, true)).toBe(0) // reserved
    expect(view.getUint16(2, true)).toBe(1) // type = 1 (icon)
    expect(view.getUint16(4, true)).toBe(3) // count = N
  })

  it('encodes 16/32/48 as the width/height bytes', () => {
    expect(ico[ICO_HEADER_SIZE + 0 * ICO_ENTRY_SIZE + 0]).toBe(16)
    expect(ico[ICO_HEADER_SIZE + 0 * ICO_ENTRY_SIZE + 1]).toBe(16)
    expect(ico[ICO_HEADER_SIZE + 1 * ICO_ENTRY_SIZE + 0]).toBe(32)
    expect(ico[ICO_HEADER_SIZE + 1 * ICO_ENTRY_SIZE + 1]).toBe(32)
    expect(ico[ICO_HEADER_SIZE + 2 * ICO_ENTRY_SIZE + 0]).toBe(48)
    expect(ico[ICO_HEADER_SIZE + 2 * ICO_ENTRY_SIZE + 1]).toBe(48)
  })

  it('fills planes=1 and bitCount=32 for every entry', () => {
    for (let i = 0; i < entries.length; i++) {
      const off = ICO_HEADER_SIZE + i * ICO_ENTRY_SIZE
      expect(view.getUint16(off + 4, true)).toBe(1) // planes
      expect(view.getUint16(off + 6, true)).toBe(32) // bitCount
    }
  })

  it('records bytesInRes matching the PNG byte length', () => {
    for (let i = 0; i < entries.length; i++) {
      const off = ICO_HEADER_SIZE + i * ICO_ENTRY_SIZE
      expect(view.getUint32(off + 8, true)).toBe(entries[i].png.byteLength)
    }
  })

  it('has monotonically increasing offsets that point past the header', () => {
    const headerSize = ICO_HEADER_SIZE + ICO_ENTRY_SIZE * entries.length
    let expected = headerSize
    for (let i = 0; i < entries.length; i++) {
      const off = ICO_HEADER_SIZE + i * ICO_ENTRY_SIZE
      const recorded = view.getUint32(off + 12, true)
      expect(recorded).toBe(expected)
      expected += entries[i].png.byteLength
    }
    expect(ico.byteLength).toBe(expected)
  })

  it('copies PNG bytes verbatim at each offset', () => {
    let off = ICO_HEADER_SIZE + ICO_ENTRY_SIZE * entries.length
    for (const e of entries) {
      expect(ico[off]).toBe(e.png[0])
      expect(ico[off + e.png.byteLength - 1]).toBe(e.png[e.png.byteLength - 1])
      off += e.png.byteLength
    }
  })
})

describe('encodeIco - edge cases', () => {
  it('encodes 256 as 0 in the width/height byte', () => {
    const ico = encodeIco([{ size: 256, png: new Uint8Array(8) }])
    expect(ico[ICO_HEADER_SIZE + 0]).toBe(0)
    expect(ico[ICO_HEADER_SIZE + 1]).toBe(0)
  })

  it('throws on empty input', () => {
    expect(() => encodeIco([])).toThrow()
  })
})
