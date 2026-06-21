import { describe, it, expect } from 'vitest'
import { parsePath, queryJson, queryValue } from './jsonpath'

const DATA = {
  store: {
    name: 'Demo',
    books: [
      { title: 'A', price: 10, tags: ['x', 'y'] },
      { title: 'B', price: 20, tags: ['z'] },
      { title: 'C', price: 30, tags: [] },
    ],
    open: true,
  },
}

const q = (path: string) => {
  const r = queryValue(DATA, path)
  if (!r.ok) throw new Error(r.message)
  return r.matches
}

describe('parsePath', () => {
  it('parses dot + bracket + wildcard + slice', () => {
    const r = parsePath('$.a.b[0][*][1:3]')
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.tokens).toEqual([
        { type: 'key', name: 'a' },
        { type: 'key', name: 'b' },
        { type: 'index', index: 0 },
        { type: 'wildcard' },
        { type: 'slice', start: 1, end: 3 },
      ])
    }
  })
  it('leading bare key without dot', () => {
    const r = parsePath('users[0]')
    if (r.ok) expect(r.tokens[0]).toEqual({ type: 'key', name: 'users' })
  })
  it('quoted keys', () => {
    const r = parsePath("['a.b']['c']")
    if (r.ok) expect(r.tokens).toEqual([{ type: 'key', name: 'a.b' }, { type: 'key', name: 'c' }])
  })
  it('errors on unclosed bracket / bad index', () => {
    expect(parsePath('a[0').ok).toBe(false)
    expect(parsePath('a[x]').ok).toBe(false)
  })
})

describe('queryValue — basic navigation', () => {
  it('nested key', () => {
    expect(q('store.name')).toEqual(['Demo'])
    expect(q('$.store.open')).toEqual([true])
  })
  it('array index', () => {
    expect(q('store.books[0].title')).toEqual(['A'])
    expect(q('store.books[1].price')).toEqual([20])
  })
  it('negative index', () => {
    expect(q('store.books[-1].title')).toEqual(['C'])
  })
  it('missing path → empty', () => {
    expect(q('store.nope')).toEqual([])
    expect(q('store.books[99]')).toEqual([])
  })
})

describe('queryValue — wildcard & slice', () => {
  it('wildcard over array → all titles', () => {
    expect(q('store.books[*].title')).toEqual(['A', 'B', 'C'])
  })
  it('wildcard over object values', () => {
    expect(q('store.books[0].*').sort()).toEqual([10, 'A', ['x', 'y']].sort())
  })
  it('slice', () => {
    expect(q('store.books[0:2].title')).toEqual(['A', 'B'])
    expect(q('store.books[1:].title')).toEqual(['B', 'C'])
    expect(q('store.books[:1].title')).toEqual(['A'])
  })
  it('flattens nested wildcard', () => {
    expect(q('store.books[*].tags[*]')).toEqual(['x', 'y', 'z'])
  })
})

describe('queryJson', () => {
  it('parses then queries', () => {
    const r = queryJson('{"a":[1,2,3]}', 'a[*]')
    expect(r.ok && r.matches).toEqual([1, 2, 3])
  })
  it('reports bad json', () => {
    const r = queryJson('{bad', 'a')
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.message.startsWith('bad_json')).toBe(true)
  })
  it('reports bad path', () => {
    const r = queryJson('{}', 'a[')
    expect(r.ok).toBe(false)
  })
})
