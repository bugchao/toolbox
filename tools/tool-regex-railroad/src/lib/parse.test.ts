import { describe, it, expect } from 'vitest'
import { isValidJsRegex, parsePattern } from './parse'

describe('parsePattern', () => {
  it('parses simple literal', () => {
    const r = parsePattern('hello')
    expect(r.ok).toBe(true)
  })
  it('respects flags', () => {
    const r = parsePattern('hello', 'gi')
    expect(r.ok).toBe(true)
  })
  it('parses /pattern/flags literal', () => {
    const r = parsePattern('/foo/gi')
    expect(r.ok).toBe(true)
  })
  it('rejects empty input', () => {
    expect(parsePattern('').ok).toBe(false)
  })
  it('reports parse errors', () => {
    const r = parsePattern('[abc')
    expect(r.ok).toBe(false)
  })
})

describe('isValidJsRegex', () => {
  it('accepts well-formed patterns', () => {
    expect(isValidJsRegex('a+', '')).toBe(true)
    expect(isValidJsRegex('\\d{2,4}', 'i')).toBe(true)
  })
  it('rejects malformed patterns', () => {
    expect(isValidJsRegex('[abc', '')).toBe(false)
    expect(isValidJsRegex('a', 'q')).toBe(false) // bad flag
  })
})
