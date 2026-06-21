import { describe, it, expect } from 'vitest'
import {
  classOf,
  CLASSES,
  findByCode,
  groupByClass,
  search,
  STATUS_CODES,
} from './status'

describe('data integrity', () => {
  it('codes are unique', () => {
    const codes = STATUS_CODES.map((s) => s.code)
    expect(new Set(codes).size).toBe(codes.length)
  })
  it('i18n keys are unique', () => {
    const keys = STATUS_CODES.map((s) => s.i18nKey)
    expect(new Set(keys).size).toBe(keys.length)
  })
  it('every code class matches its number range', () => {
    for (const s of STATUS_CODES) {
      expect(s.klass).toBe(classOf(s.code))
    }
  })
  it('covers all five classes', () => {
    const present = new Set(STATUS_CODES.map((s) => s.klass))
    for (const c of CLASSES) expect(present.has(c)).toBe(true)
  })
})

describe('classOf', () => {
  it('maps ranges', () => {
    expect(classOf(100)).toBe('1xx')
    expect(classOf(204)).toBe('2xx')
    expect(classOf(301)).toBe('3xx')
    expect(classOf(404)).toBe('4xx')
    expect(classOf(503)).toBe('5xx')
  })
  it('returns null out of range', () => {
    expect(classOf(99)).toBeNull()
    expect(classOf(600)).toBeNull()
  })
})

describe('findByCode', () => {
  it('finds known codes', () => {
    expect(findByCode(404)?.phrase).toBe('Not Found')
    expect(findByCode(418)?.phrase).toBe("I'm a teapot")
  })
  it('undefined for unknown', () => {
    expect(findByCode(799)).toBeUndefined()
  })
})

describe('search', () => {
  it('by code prefix', () => {
    const r = search('40')
    expect(r.every((s) => String(s.code).startsWith('40'))).toBe(true)
    expect(r.map((s) => s.code)).toContain(404)
  })
  it('by phrase substring (case-insensitive)', () => {
    const r = search('gateway')
    expect(r.map((s) => s.code).sort()).toEqual([502, 504])
  })
  it('filter by class', () => {
    const r = search('', '5xx')
    expect(r.every((s) => s.klass === '5xx')).toBe(true)
  })
  it('combines query + class', () => {
    const r = search('50', '5xx')
    expect(r.map((s) => s.code)).toContain(500)
    expect(r.every((s) => s.klass === '5xx')).toBe(true)
  })
  it('uses descLookup when provided', () => {
    const lookup = (k: string) => (k === 'c404' ? 'page missing nowhere' : '')
    const r = search('missing', 'all', lookup)
    expect(r.map((s) => s.code)).toContain(404)
  })
  it('empty query returns all (or class subset)', () => {
    expect(search('')).toHaveLength(STATUS_CODES.length)
  })
})

describe('groupByClass', () => {
  it('buckets each class', () => {
    const g = groupByClass(STATUS_CODES)
    expect(g['2xx'].map((s) => s.code)).toContain(200)
    expect(g['4xx'].map((s) => s.code)).toContain(404)
    const total = CLASSES.reduce((n, c) => n + g[c].length, 0)
    expect(total).toBe(STATUS_CODES.length)
  })
})
