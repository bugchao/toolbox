import { describe, it, expect } from 'vitest'
import { parseCookieHeader } from './parseCookie'

describe('parseCookieHeader', () => {
  it('parses basic a=1; b=2; c=3', () => {
    const r = parseCookieHeader('a=1; b=2; c=3')
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.items).toEqual([
      { name: 'a', value: '1' },
      { name: 'b', value: '2' },
      { name: 'c', value: '3' },
    ])
    expect(r.skipped).toBe(0)
  })

  it('trims whitespace around name and value', () => {
    const r = parseCookieHeader('a = 1; b=  2  ; c =  hello')
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.items).toEqual([
      { name: 'a', value: '1' },
      { name: 'b', value: '2' },
      { name: 'c', value: 'hello' },
    ])
  })

  it('preserves empty value (flag=)', () => {
    const r = parseCookieHeader('flag=; ready=1')
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.items).toEqual([
      { name: 'flag', value: '' },
      { name: 'ready', value: '1' },
    ])
  })

  it('keeps `=` characters that appear inside the value', () => {
    const r = parseCookieHeader('token=abc=def; b=2')
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.items[0]).toEqual({ name: 'token', value: 'abc=def' })
    expect(r.items[1]).toEqual({ name: 'b', value: '2' })
  })

  it('keeps duplicate names as separate entries', () => {
    const r = parseCookieHeader('a=1; a=2; a=3')
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.items).toHaveLength(3)
    expect(r.items.map((x) => x.value)).toEqual(['1', '2', '3'])
  })

  it('returns empty result for empty / whitespace input', () => {
    const r = parseCookieHeader('   ')
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.items).toEqual([])
    expect(r.skipped).toBe(0)
  })

  it('handles segment without `=` by treating it as bare name with empty value', () => {
    const r = parseCookieHeader('lone; a=1')
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.items).toEqual([
      { name: 'lone', value: '' },
      { name: 'a', value: '1' },
    ])
  })

  it('skips segments whose name is empty (=value only)', () => {
    const r = parseCookieHeader('=bad; a=1')
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.skipped).toBe(1)
    expect(r.items).toEqual([{ name: 'a', value: '1' }])
  })
})
