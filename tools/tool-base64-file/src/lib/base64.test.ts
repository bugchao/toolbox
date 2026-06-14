import { describe, it, expect } from 'vitest'
import {
  base64ToBytes,
  bytesToBase64,
  formatSize,
  looksLikeText,
  sniffType,
  toDataUri,
} from './base64'

describe('bytesToBase64 / base64ToBytes roundtrip', () => {
  it('roundtrips ASCII text', () => {
    const src = new TextEncoder().encode('hello world')
    const b64 = bytesToBase64(src)
    expect(b64).toBe('aGVsbG8gd29ybGQ=')
    const back = base64ToBytes(b64)
    expect(back.ok).toBe(true)
    if (back.ok) expect(new TextDecoder().decode(back.bytes)).toBe('hello world')
  })

  it('roundtrips binary bytes (0-255)', () => {
    const src = new Uint8Array(256).map((_, i) => i)
    const back = base64ToBytes(bytesToBase64(src))
    expect(back.ok).toBe(true)
    if (back.ok) expect([...back.bytes]).toEqual([...src])
  })

  it('handles large input without stack overflow', () => {
    const src = new Uint8Array(300_000).fill(0xab)
    const b64 = bytesToBase64(src)
    expect(b64.length).toBeGreaterThan(0)
    const back = base64ToBytes(b64)
    expect(back.ok && back.bytes.length).toBe(300_000)
  })
})

describe('base64ToBytes tolerance', () => {
  it('strips whitespace and newlines', () => {
    const r = base64ToBytes('aGVs\nbG8g  d29y\tbGQ=')
    expect(r.ok).toBe(true)
    if (r.ok) expect(new TextDecoder().decode(r.bytes)).toBe('hello world')
  })

  it('accepts URL-safe variant', () => {
    // '+/' → '-_'：构造一个含 - _ 的样本
    const bytes = new Uint8Array([0xfb, 0xff, 0xfe])
    const std = bytesToBase64(bytes) // 含 + 或 /
    const urlSafe = std.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
    const r = base64ToBytes(urlSafe)
    expect(r.ok).toBe(true)
    if (r.ok) expect([...r.bytes]).toEqual([...bytes])
  })

  it('adds missing padding', () => {
    const r = base64ToBytes('aGVsbG8') // 'hello' 无 padding
    expect(r.ok).toBe(true)
    if (r.ok) expect(new TextDecoder().decode(r.bytes)).toBe('hello')
  })

  it('extracts mime from data URI', () => {
    const r = base64ToBytes('data:image/png;base64,aGVsbG8=')
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.mime).toBe('image/png')
  })

  it('handles URL-encoded (non-base64) data URI', () => {
    const r = base64ToBytes('data:text/plain,hello%20world')
    expect(r.ok).toBe(true)
    if (r.ok) expect(new TextDecoder().decode(r.bytes)).toBe('hello world')
  })

  it('rejects invalid characters', () => {
    expect(base64ToBytes('abc!@#').ok).toBe(false)
  })

  it('rejects empty input', () => {
    expect(base64ToBytes('   ').ok).toBe(false)
  })

  it('rejects impossible length (4n+1)', () => {
    expect(base64ToBytes('aaaaa').ok).toBe(false)
  })
})

describe('toDataUri', () => {
  it('builds data URI with mime', () => {
    expect(toDataUri('aGk=', 'text/plain')).toBe('data:text/plain;base64,aGk=')
  })
  it('falls back to octet-stream', () => {
    expect(toDataUri('aGk=', '')).toContain('application/octet-stream')
  })
})

describe('sniffType', () => {
  it('detects PNG', () => {
    const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
    expect(sniffType(png)?.mime).toBe('image/png')
  })
  it('detects JPEG', () => {
    expect(sniffType(new Uint8Array([0xff, 0xd8, 0xff, 0xe0]))?.mime).toBe('image/jpeg')
  })
  it('detects PDF', () => {
    expect(sniffType(new TextEncoder().encode('%PDF-1.7'))?.mime).toBe('application/pdf')
  })
  it('detects ZIP', () => {
    expect(sniffType(new Uint8Array([0x50, 0x4b, 0x03, 0x04]))?.mime).toBe('application/zip')
  })
  it('detects WEBP via RIFF+WEBP double check', () => {
    const webp = new Uint8Array(12)
    webp.set([0x52, 0x49, 0x46, 0x46], 0)
    webp.set([0x57, 0x45, 0x42, 0x50], 8)
    expect(sniffType(webp)?.mime).toBe('image/webp')
  })
  it('plain RIFF without WEBP marker is not webp', () => {
    const riff = new Uint8Array(12)
    riff.set([0x52, 0x49, 0x46, 0x46], 0)
    // bytes 8-11 留 0
    const r = sniffType(riff)
    expect(r?.mime === 'image/webp').toBe(false)
  })
  it('detects SVG text', () => {
    expect(sniffType(new TextEncoder().encode('<svg xmlns="…">'))?.mime).toBe('image/svg+xml')
  })
  it('detects JSON text', () => {
    expect(sniffType(new TextEncoder().encode('{"a":1}'))?.mime).toBe('application/json')
  })
  it('returns null for unknown', () => {
    expect(sniffType(new Uint8Array([0x00, 0x01, 0x02]))).toBeNull()
  })
})

describe('looksLikeText', () => {
  it('true for plain UTF-8', () => {
    expect(looksLikeText(new TextEncoder().encode('hello 你好'))).toBe(true)
  })
  it('false for binary with invalid UTF-8', () => {
    expect(looksLikeText(new Uint8Array([0xff, 0xfe, 0x00, 0x80, 0x90]))).toBe(false)
  })
  it('true for empty', () => {
    expect(looksLikeText(new Uint8Array(0))).toBe(true)
  })
})

describe('formatSize', () => {
  it('bytes / KB / MB tiers', () => {
    expect(formatSize(512)).toBe('512 B')
    expect(formatSize(2048)).toBe('2.0 KB')
    expect(formatSize(3 * 1024 * 1024)).toBe('3.00 MB')
  })
})
