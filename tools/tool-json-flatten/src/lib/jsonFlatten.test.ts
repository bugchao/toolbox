import { describe, it, expect } from 'vitest'
import { flatten, toCsv, parseJson } from './jsonFlatten'

describe('parseJson', () => {
  it('returns ok with parsed value for valid JSON', () => {
    expect(parseJson('[1,2]')).toEqual({ ok: true, value: [1, 2] })
  })

  it('returns error with message for invalid JSON', () => {
    const r = parseJson('{bad}')
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.message).toBeTruthy()
  })
})

describe('flatten', () => {
  it('flattens nested objects with dot paths', () => {
    expect(flatten({ a: { b: 1 } })).toEqual({ 'a.b': 1 })
  })

  it('flattens arrays with bracket indices', () => {
    expect(flatten({ a: [1, 2] })).toEqual({ 'a[0]': 1, 'a[1]': 2 })
  })

  it('flattens deeply mixed objects and arrays', () => {
    expect(flatten({ a: { b: [{ c: 1 }] } })).toEqual({ 'a.b[0].c': 1 })
  })

  it('preserves primitive leaf values', () => {
    expect(flatten({ a: 1, b: 'x', c: true, d: null })).toEqual({ a: 1, b: 'x', c: true, d: null })
  })

  it('keeps empty object and empty array as leaves', () => {
    expect(flatten({ a: {}, b: [] })).toEqual({ a: {}, b: [] })
  })

  it('flattens a top-level array', () => {
    expect(flatten([{ x: 1 }, { x: 2 }])).toEqual({ '[0].x': 1, '[1].x': 2 })
  })

  it('returns a single (root) entry for a top-level primitive', () => {
    expect(flatten(42)).toEqual({ '(root)': 42 })
  })
})

describe('toCsv', () => {
  it('emits header + rows for an array of objects', () => {
    expect(toCsv([{ a: 1, b: 2 }, { a: 3, b: 4 }])).toBe('a,b\n1,2\n3,4')
  })

  it('unions columns across rows, leaving missing cells empty', () => {
    expect(toCsv([{ a: 1 }, { b: 2 }])).toBe('a,b\n1,\n,2')
  })

  it('uses flattened paths as column headers', () => {
    expect(toCsv([{ u: { n: 'x' } }])).toBe('u.n\nx')
  })

  it('quotes values containing comma, quote or newline', () => {
    expect(toCsv([{ a: 'x,y' }])).toBe('a\n"x,y"')
    expect(toCsv([{ a: 'he"llo' }])).toBe('a\n"he""llo"')
  })

  it('treats a single object as one row', () => {
    expect(toCsv({ a: 1, b: 2 })).toBe('a,b\n1,2')
  })

  it('renders an array of primitives as a single value column', () => {
    expect(toCsv([1, 2, 3])).toBe('value\n1\n2\n3')
  })
})
