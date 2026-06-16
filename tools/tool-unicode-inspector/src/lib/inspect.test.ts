import { describe, it, expect } from 'vitest'
import {
  blockOf,
  inspect,
  inspectChar,
  jsEscape,
  textStats,
  toHex,
  utf8Bytes,
  utf16Units,
} from './inspect'

describe('toHex', () => {
  it('pads to 4 digits', () => {
    expect(toHex(0x41)).toBe('U+0041')
    expect(toHex(0x4e2d)).toBe('U+4E2D')
    expect(toHex(0x1f600)).toBe('U+1F600')
  })
})

describe('utf8Bytes', () => {
  it('1-byte ASCII', () => expect(utf8Bytes(0x41)).toEqual([0x41]))
  it('2-byte (¢ U+00A2)', () => expect(utf8Bytes(0x00a2)).toEqual([0xc2, 0xa2]))
  it('3-byte (中 U+4E2D)', () => expect(utf8Bytes(0x4e2d)).toEqual([0xe4, 0xb8, 0xad]))
  it('4-byte (😀 U+1F600)', () => expect(utf8Bytes(0x1f600)).toEqual([0xf0, 0x9f, 0x98, 0x80]))
})

describe('utf16Units', () => {
  it('BMP char is single unit', () => expect(utf16Units(0x4e2d)).toEqual([0x4e2d]))
  it('astral char is surrogate pair', () => {
    expect(utf16Units(0x1f600)).toEqual([0xd83d, 0xde00])
  })
})

describe('jsEscape', () => {
  it('BMP uses \\uXXXX', () => expect(jsEscape(0x4e2d)).toBe('\\u4E2D'))
  it('astral uses \\u{XXXXX}', () => expect(jsEscape(0x1f600)).toBe('\\u{1F600}'))
})

describe('blockOf', () => {
  it('classifies common blocks', () => {
    expect(blockOf(0x41)).toBe('Basic Latin')
    expect(blockOf(0x4e2d)).toBe('CJK Unified Ideographs')
    expect(blockOf(0x1f600)).toBe('Emoticons')
    expect(blockOf(0x3042)).toBe('Hiragana')
    expect(blockOf(0x20ac)).toBe('Currency Symbols')
  })
  it('unknown for unmapped ranges', () => {
    expect(blockOf(0x0530)).toBe('Unknown')
  })
})

describe('inspectChar', () => {
  it('full info for 中', () => {
    const info = inspectChar('中')
    expect(info.codePoint).toBe(0x4e2d)
    expect(info.hex).toBe('U+4E2D')
    expect(info.block).toBe('CJK Unified Ideographs')
    expect(info.utf8).toBe('E4 B8 AD')
    expect(info.utf16).toBe('4E2D')
    expect(info.isAstral).toBe(false)
    expect(info.htmlEntity).toBe('&#x4E2D;')
    expect(info.cssEscape).toBe('\\4E2D')
  })

  it('astral emoji 😀', () => {
    const info = inspectChar('😀')
    expect(info.codePoint).toBe(0x1f600)
    expect(info.isAstral).toBe(true)
    expect(info.utf16).toBe('D83D DE00')
    expect(info.jsEscape).toBe('\\u{1F600}')
  })
})

describe('inspect', () => {
  it('iterates by code point — emoji counts as one', () => {
    const out = inspect('a😀中')
    expect(out).toHaveLength(3)
    expect(out[0].char).toBe('a')
    expect(out[1].char).toBe('😀')
    expect(out[2].char).toBe('中')
  })

  it('empty string → empty array', () => {
    expect(inspect('')).toEqual([])
  })
})

describe('textStats', () => {
  it('distinguishes code points from UTF-16 length', () => {
    const s = textStats('a😀')
    expect(s.codePoints).toBe(2)
    expect(s.utf16Length).toBe(3) // emoji = 2 UTF-16 units
    expect(s.hasAstral).toBe(true)
  })

  it('counts UTF-8 bytes', () => {
    // 'a' = 1, '中' = 3
    expect(textStats('a中').utf8Bytes).toBe(4)
  })

  it('pure ASCII has no astral', () => {
    expect(textStats('hello').hasAstral).toBe(false)
    expect(textStats('hello').utf16Length).toBe(5)
  })

  it('empty string', () => {
    expect(textStats('')).toEqual({ codePoints: 0, utf16Length: 0, utf8Bytes: 0, hasAstral: false })
  })
})
