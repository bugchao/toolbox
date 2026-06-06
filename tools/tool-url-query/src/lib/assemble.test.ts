import { describe, it, expect } from 'vitest'
import { assembleUrl, assembleQuery } from './assemble'
import { nextParamId, type ParamRow } from './parse'

function row(key: string, value: string, wasBare = false): ParamRow {
  return { id: nextParamId(), key, value, wasBare }
}

describe('assembleUrl', () => {
  it('joins base + params in order, with query and hash', () => {
    const url = assembleUrl({
      base: { protocol: 'https', host: 'x.com', pathname: '/path' },
      params: [row('a', '1'), row('b', '2'), row('c', '3')],
      hash: 'sec',
    })
    expect(url).toBe('https://x.com/path?a=1&b=2&c=3#sec')
  })

  it('preserves param order even when keys repeat', () => {
    const url = assembleUrl({
      base: { protocol: 'https', host: 'x.com', pathname: '/' },
      params: [row('t', 'a'), row('t', 'b')],
    })
    expect(url).toBe('https://x.com/?t=a&t=b')
  })

  it('omits "?" entirely when params is empty', () => {
    const url = assembleUrl({
      base: { protocol: 'https', host: 'x.com', pathname: '/' },
      params: [],
    })
    expect(url).toBe('https://x.com/')
  })

  it('encodes values by default and decodes-roundtrips through encodeURIComponent', () => {
    const url = assembleUrl({
      base: { protocol: 'https', host: 'x.com', pathname: '/' },
      params: [row('q', '中 文')],
    })
    expect(url).toBe(`https://x.com/?q=${encodeURIComponent('中 文')}`)
  })

  it('writes raw when encode: false', () => {
    const url = assembleUrl(
      {
        base: { protocol: 'https', host: 'x.com', pathname: '/' },
        params: [row('q', '中 文')],
      },
      { encode: false, encodeKey: false }
    )
    expect(url).toBe('https://x.com/?q=中 文')
  })

  it('renders bare key form when showBareKeys: true and value is empty', () => {
    const url = assembleUrl(
      {
        base: { protocol: 'https', host: 'x.com', pathname: '/' },
        params: [row('k', '')],
      },
      { showBareKeys: true }
    )
    expect(url).toBe('https://x.com/?k')
  })

  it('renders k= form when showBareKeys: false and wasBare: false', () => {
    const url = assembleUrl(
      {
        base: { protocol: 'https', host: 'x.com', pathname: '/' },
        params: [row('k', '')],
      },
      { showBareKeys: false }
    )
    expect(url).toBe('https://x.com/?k=')
  })

  it('honors per-row wasBare flag when showBareKeys is false', () => {
    const url = assembleUrl(
      {
        base: { protocol: 'https', host: 'x.com', pathname: '/' },
        params: [row('a', '', true), row('b', '', false)],
      },
      { showBareKeys: false }
    )
    expect(url).toBe('https://x.com/?a&b=')
  })

  it('appends hash at the end and only when provided', () => {
    const noHash = assembleUrl({
      base: { protocol: 'https', host: 'x.com', pathname: '/p' },
      params: [row('a', '1')],
    })
    expect(noHash).toBe('https://x.com/p?a=1')

    const withHash = assembleUrl({
      base: { protocol: 'https', host: 'x.com', pathname: '/p' },
      params: [row('a', '1')],
      hash: 'frag',
    })
    expect(withHash).toBe('https://x.com/p?a=1#frag')
  })

  it('skips rows with empty keys', () => {
    const url = assembleUrl({
      base: { protocol: 'https', host: 'x.com', pathname: '/' },
      params: [row('', 'x'), row('a', '1')],
    })
    expect(url).toBe('https://x.com/?a=1')
  })
})

describe('assembleQuery', () => {
  it('returns empty string for empty params', () => {
    expect(assembleQuery([])).toBe('')
  })

  it('does not encode when both encode flags are false', () => {
    expect(
      assembleQuery([row('a b', 'c d')], { encode: false, encodeKey: false })
    ).toBe('a b=c d')
  })
})
