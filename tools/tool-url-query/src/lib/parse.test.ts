import { describe, it, expect } from 'vitest'
import { parseUrl, parseQueryString } from './parse'

describe('parseUrl', () => {
  it('parses a typical https URL with path / params / hash', () => {
    const r = parseUrl('https://x.com/path?a=1&b=2&c=3#sec')
    if (!r.ok) throw new Error('expected ok')
    expect(r.base.protocol).toBe('https')
    expect(r.base.host).toBe('x.com')
    expect(r.base.pathname).toBe('/path')
    expect(r.hash).toBe('sec')
    expect(r.params.map((p) => ({ key: p.key, value: p.value }))).toEqual([
      { key: 'a', value: '1' },
      { key: 'b', value: '2' },
      { key: 'c', value: '3' },
    ])
  })

  it('decodes percent-encoded values by default', () => {
    const r = parseUrl('https://x.com/?key=%E4%B8%AD')
    if (!r.ok) throw new Error('expected ok')
    expect(r.params[0]?.value).toBe('中')
  })

  it('keeps raw value when keepEncoded: true', () => {
    const r = parseUrl('https://x.com/?key=%E4%B8%AD', { keepEncoded: true })
    if (!r.ok) throw new Error('expected ok')
    expect(r.params[0]?.value).toBe('%E4%B8%AD')
  })

  it('preserves duplicate keys', () => {
    const r = parseUrl('https://x.com/?t=a&t=b')
    if (!r.ok) throw new Error('expected ok')
    expect(r.params.length).toBe(2)
    expect(r.params[0]?.key).toBe('t')
    expect(r.params[0]?.value).toBe('a')
    expect(r.params[1]?.key).toBe('t')
    expect(r.params[1]?.value).toBe('b')
  })

  it('distinguishes bare keys (?k1) from empty value keys (?k2=)', () => {
    const r = parseUrl('https://x.com/?k1&k2=')
    if (!r.ok) throw new Error('expected ok')
    expect(r.params).toHaveLength(2)
    expect(r.params[0]?.key).toBe('k1')
    expect(r.params[0]?.value).toBe('')
    expect(r.params[0]?.wasBare).toBe(true)
    expect(r.params[1]?.key).toBe('k2')
    expect(r.params[1]?.value).toBe('')
    expect(r.params[1]?.wasBare).toBe(false)
  })

  it('returns { ok: false, raw, message } on invalid URL', () => {
    const r = parseUrl('not a url')
    expect(r.ok).toBe(false)
    if (r.ok) throw new Error('expected err')
    expect(r.raw).toBe('not a url')
    expect(typeof r.message).toBe('string')
    expect(r.message.length).toBeGreaterThan(0)
  })

  it('returns ok:false on empty input', () => {
    const r = parseUrl('   ')
    expect(r.ok).toBe(false)
  })

  it('decodes "+" as space', () => {
    const r = parseUrl('https://x.com/?q=hello+world')
    if (!r.ok) throw new Error('expected ok')
    expect(r.params[0]?.value).toBe('hello world')
  })

  it('strips trailing : from protocol and # from hash', () => {
    const r = parseUrl('https://x.com/#top')
    if (!r.ok) throw new Error('expected ok')
    expect(r.base.protocol).toBe('https')
    expect(r.hash).toBe('top')
  })
})

describe('parseQueryString', () => {
  it('parses empty string to []', () => {
    expect(parseQueryString('')).toEqual([])
  })

  it('parses raw query with mixed bare / empty / valued', () => {
    const rows = parseQueryString('k1&k2=&k3=v3')
    expect(rows.map((r) => ({ key: r.key, value: r.value, wasBare: r.wasBare }))).toEqual([
      { key: 'k1', value: '', wasBare: true },
      { key: 'k2', value: '', wasBare: false },
      { key: 'k3', value: 'v3', wasBare: false },
    ])
  })
})
