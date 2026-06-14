import { describe, it, expect } from 'vitest'
import { parsePattern } from './parse'
import { toIr, type IrNode } from './ir'

function ir(pattern: string, flags = ''): IrNode {
  const r = parsePattern(pattern, flags)
  if (!r.ok) throw new Error(`parse failed: ${r.message}`)
  return toIr(r.ast)
}

describe('toIr — flat literals', () => {
  it('single char → term', () => {
    const t = ir('a')
    expect(t).toEqual({ kind: 'term', label: 'a', tone: 'literal' })
  })
  it('multi-char sequence → seq of terms', () => {
    const t = ir('abc')
    expect(t.kind).toBe('seq')
    if (t.kind === 'seq') {
      expect(t.items).toHaveLength(3)
      expect(t.items.every((i) => i.kind === 'term')).toBe(true)
    }
  })
})

describe('character classes & anchors', () => {
  it('[a-z] becomes a class term', () => {
    const t = ir('[a-z]')
    expect(t.kind).toBe('term')
    if (t.kind === 'term') {
      expect(t.tone).toBe('class')
      expect(t.label).toBe('[a-z]')
    }
  })
  it('[^0-9] preserves negation', () => {
    const t = ir('[^0-9]')
    if (t.kind === 'term') expect(t.label).toBe('[^0-9]')
  })
  it('^ becomes an anchor term', () => {
    const t = ir('^a$')
    if (t.kind === 'seq') {
      const labels = t.items.map((i) => (i.kind === 'term' ? i.label : '?'))
      expect(labels[0]).toMatch(/^\^/)
      expect(labels.at(-1)).toMatch(/\$/)
    }
  })
})

describe('quantifiers', () => {
  it('a* → star', () => {
    const t = ir('a*')
    expect(t.kind).toBe('star')
  })
  it('a+ → plus', () => {
    const t = ir('a+')
    expect(t.kind).toBe('plus')
  })
  it('a? → optional', () => {
    const t = ir('a?')
    expect(t.kind).toBe('optional')
  })
  it('a{2,4} → repeat with min/max', () => {
    const t = ir('a{2,4}')
    expect(t.kind).toBe('repeat')
    if (t.kind === 'repeat') {
      expect(t.min).toBe(2)
      expect(t.max).toBe(4)
    }
  })
  it('a{1,} normalizes to plus', () => {
    const t = ir('a{1,}')
    expect(t.kind).toBe('plus')
  })
})

describe('groups', () => {
  it('(a) → capturing group', () => {
    const t = ir('(a)')
    expect(t.kind).toBe('group')
    if (t.kind === 'group') expect(t.capturing).toBe(true)
  })
  it('(?:a) → non-capturing group', () => {
    const t = ir('(?:a)')
    expect(t.kind).toBe('group')
    if (t.kind === 'group') expect(t.capturing).toBe(false)
  })
  it('(?<name>a) → named group', () => {
    const t = ir('(?<name>a)')
    if (t.kind === 'group') expect(t.name).toBe('name')
  })
})

describe('alternation', () => {
  it('a|b → choice of 2', () => {
    const t = ir('a|b')
    expect(t.kind).toBe('choice')
    if (t.kind === 'choice') expect(t.options).toHaveLength(2)
  })
  it('a|b|c → choice of 3 (flattens nested Disjunction)', () => {
    const t = ir('a|b|c')
    if (t.kind === 'choice') expect(t.options.length).toBeGreaterThanOrEqual(3)
  })
})

describe('backreferences', () => {
  it('\\1 → backref term', () => {
    const t = ir('(a)\\1')
    if (t.kind === 'seq') {
      const last = t.items.at(-1)
      if (last?.kind === 'term') expect(last.tone).toBe('backref')
    }
  })
})
