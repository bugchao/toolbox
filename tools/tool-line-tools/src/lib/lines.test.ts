import { describe, it, expect } from 'vitest'
import {
  dedupe,
  filterLines,
  fromText,
  numberLines,
  removeBlank,
  reverse,
  shuffle,
  sortLines,
  stats,
  toText,
  trimLines,
  unnumberLines,
} from './lines'

describe('fromText / toText', () => {
  it('splits on \\n \\r\\n \\r', () => {
    expect(fromText('a\nb\r\nc\rd')).toEqual(['a', 'b', 'c', 'd'])
  })
  it('toText joins with \\n', () => {
    expect(toText(['a', 'b'])).toBe('a\nb')
  })
})

describe('sortLines', () => {
  it('asc / desc', () => {
    expect(sortLines(['b', 'a', 'c'], 'asc')).toEqual(['a', 'b', 'c'])
    expect(sortLines(['b', 'a', 'c'], 'desc')).toEqual(['c', 'b', 'a'])
  })
  it('case-insensitive', () => {
    expect(sortLines(['B', 'a', 'C'], 'asc', true)).toEqual(['a', 'B', 'C'])
  })
  it('natural sort (file2 < file10)', () => {
    expect(sortLines(['file10', 'file2', 'file1'], 'natural')).toEqual(['file1', 'file2', 'file10'])
  })
  it('by length', () => {
    expect(sortLines(['ccc', 'a', 'bb'], 'length')).toEqual(['a', 'bb', 'ccc'])
  })
  it('does not mutate input', () => {
    const inp = ['b', 'a']
    sortLines(inp, 'asc')
    expect(inp).toEqual(['b', 'a'])
  })
})

describe('dedupe', () => {
  it('keeps first occurrence order', () => {
    expect(dedupe(['a', 'b', 'a', 'c', 'b'])).toEqual(['a', 'b', 'c'])
  })
  it('case-insensitive', () => {
    expect(dedupe(['A', 'a', 'B'], true)).toEqual(['A', 'B'])
  })
  it('trim-compare', () => {
    expect(dedupe(['a', ' a ', 'b'], false, true)).toEqual(['a', 'b'])
  })
})

describe('reverse / removeBlank / trimLines', () => {
  it('reverse', () => expect(reverse(['a', 'b', 'c'])).toEqual(['c', 'b', 'a']))
  it('removeBlank drops whitespace-only', () => {
    expect(removeBlank(['a', '', '  ', 'b'])).toEqual(['a', 'b'])
  })
  it('trimLines', () => {
    expect(trimLines(['  a ', 'b  '])).toEqual(['a', 'b'])
  })
})

describe('shuffle', () => {
  it('is a permutation (deterministic rng)', () => {
    const seq = [0.9, 0.1, 0.5, 0.3]
    let i = 0
    const rng = () => seq[i++ % seq.length]
    const out = shuffle(['a', 'b', 'c', 'd'], rng)
    expect(out.slice().sort()).toEqual(['a', 'b', 'c', 'd'])
    expect(out).toHaveLength(4)
  })
})

describe('numberLines / unnumberLines', () => {
  it('numbers with default separator', () => {
    expect(numberLines(['a', 'b'])).toEqual(['1. a', '2. b'])
  })
  it('custom start + zero pad', () => {
    expect(numberLines(['a', 'b'], { start: 9, pad: true })).toEqual(['09. a', '10. b'])
  })
  it('round-trips with unnumberLines', () => {
    const numbered = numberLines(['hello', 'world'])
    expect(unnumberLines(numbered)).toEqual(['hello', 'world'])
  })
  it('unnumber handles ) ] : separators', () => {
    expect(unnumberLines(['1) a', '2] b', '3: c'])).toEqual(['a', 'b', 'c'])
  })
})

describe('filterLines', () => {
  it('includes matching by substring', () => {
    expect(filterLines(['apple', 'banana', 'grape'], 'ap')).toEqual(['apple', 'grape'])
  })
  it('exclude mode', () => {
    expect(filterLines(['apple', 'banana'], 'ap', { exclude: true })).toEqual(['banana'])
  })
  it('regex mode', () => {
    expect(filterLines(['a1', 'b2', 'cc'], '\\d', { regex: true })).toEqual(['a1', 'b2'])
  })
  it('case-insensitive', () => {
    expect(filterLines(['Apple', 'kiwi'], 'apple', { caseInsensitive: true })).toEqual(['Apple'])
  })
  it('bad regex returns all', () => {
    expect(filterLines(['a', 'b'], '(', { regex: true })).toEqual(['a', 'b'])
  })
})

describe('stats', () => {
  it('counts total / blank / unique / chars', () => {
    const s = stats(['a', '', 'a', 'bb'])
    expect(s.total).toBe(4)
    expect(s.blank).toBe(1)
    expect(s.nonBlank).toBe(3)
    expect(s.unique).toBe(3) // 'a','', 'bb'
    expect(s.chars).toBe(4) // a(1)+''(0)+a(1)+bb(2)
  })
})
