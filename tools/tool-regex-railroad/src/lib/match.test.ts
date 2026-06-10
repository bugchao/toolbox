import { describe, it, expect } from 'vitest'
import { runMatches } from './match'

describe('runMatches', () => {
  it('finds all non-overlapping matches', () => {
    const r = runMatches('\\d+', '', 'abc 12 def 345 ghi 6')
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.matches.map((m) => m.full)).toEqual(['12', '345', '6'])
      expect(r.matches[0].index).toBe(4)
    }
  })

  it('returns positional captures', () => {
    const r = runMatches('(\\w+)=(\\d+)', '', 'a=1; b=22')
    if (r.ok) {
      expect(r.matches).toHaveLength(2)
      expect(r.matches[0].groups).toEqual(['a', '1'])
    }
  })

  it('returns named captures', () => {
    const r = runMatches('(?<key>\\w+)=(?<val>\\d+)', '', 'a=1')
    if (r.ok) {
      expect(r.matches[0].named?.key).toBe('a')
      expect(r.matches[0].named?.val).toBe('1')
    }
  })

  it('respects flags (i)', () => {
    const r = runMatches('abc', 'i', 'XYZ ABC abc')
    if (r.ok) expect(r.matches.map((m) => m.full)).toEqual(['ABC', 'abc'])
  })

  it('returns error for invalid pattern', () => {
    const r = runMatches('[abc', '', 'x')
    expect(r.ok).toBe(false)
  })

  it('handles zero-width matches without infinite loop', () => {
    const r = runMatches('a?', '', 'bb')
    expect(r.ok).toBe(true)
    // 不应该死循环；具体匹配数取决于实现，但必须返回
    if (r.ok) expect(r.matches.length).toBeGreaterThan(0)
  })
})
