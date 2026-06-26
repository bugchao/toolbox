import { describe, it, expect } from 'vitest'
import { diffJson, summarize, parseJson } from './jsonDiff'
import type { DiffEntry } from './jsonDiff'

function find(entries: DiffEntry[], path: string): DiffEntry | undefined {
  return entries.find((e) => e.path === path)
}

describe('parseJson', () => {
  it('returns ok with parsed value for valid JSON', () => {
    expect(parseJson('{"a":1}')).toEqual({ ok: true, value: { a: 1 } })
  })

  it('returns error with message for invalid JSON', () => {
    const r = parseJson('{a:1}')
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.message).toBeTruthy()
  })
})

describe('diffJson', () => {
  it('marks an added key', () => {
    const entries = diffJson({ a: 1 }, { a: 1, b: 2 })
    expect(find(entries, 'b')).toEqual({ path: 'b', type: 'added', right: 2 })
  })

  it('marks a removed key', () => {
    const entries = diffJson({ a: 1, b: 2 }, { a: 1 })
    expect(find(entries, 'b')).toEqual({ path: 'b', type: 'removed', left: 2 })
  })

  it('marks a changed primitive value', () => {
    const entries = diffJson({ a: 1 }, { a: 2 })
    expect(find(entries, 'a')).toEqual({ path: 'a', type: 'changed', left: 1, right: 2 })
  })

  it('marks an unchanged primitive value', () => {
    const entries = diffJson({ a: 1 }, { a: 1 })
    expect(find(entries, 'a')).toEqual({ path: 'a', type: 'unchanged', left: 1, right: 1 })
  })

  it('recurses into nested objects without emitting the container', () => {
    const entries = diffJson({ user: { name: 'x' } }, { user: { name: 'y' } })
    expect(find(entries, 'user')).toBeUndefined()
    expect(find(entries, 'user.name')).toEqual({ path: 'user.name', type: 'changed', left: 'x', right: 'y' })
  })

  it('diffs arrays by index — changed element', () => {
    const entries = diffJson({ a: [1, 2] }, { a: [1, 3] })
    expect(find(entries, 'a[0]')).toMatchObject({ type: 'unchanged' })
    expect(find(entries, 'a[1]')).toEqual({ path: 'a[1]', type: 'changed', left: 2, right: 3 })
  })

  it('diffs arrays by index — added element', () => {
    const entries = diffJson({ a: [1] }, { a: [1, 2] })
    expect(find(entries, 'a[1]')).toEqual({ path: 'a[1]', type: 'added', right: 2 })
  })

  it('diffs arrays by index — removed element', () => {
    const entries = diffJson({ a: [1, 2] }, { a: [1] })
    expect(find(entries, 'a[1]')).toEqual({ path: 'a[1]', type: 'removed', left: 2 })
  })

  it('treats a type change as changed', () => {
    const entries = diffJson({ a: { x: 1 } }, { a: 5 })
    expect(find(entries, 'a')).toEqual({ path: 'a', type: 'changed', left: { x: 1 }, right: 5 })
  })

  it('ignores key order', () => {
    const entries = diffJson({ a: 1, b: 2 }, { b: 2, a: 1 })
    expect(entries.every((e) => e.type === 'unchanged')).toBe(true)
  })

  it('distinguishes null from an object', () => {
    const entries = diffJson({ a: null }, { a: { x: 1 } })
    expect(find(entries, 'a')).toEqual({ path: 'a', type: 'changed', left: null, right: { x: 1 } })
  })

  it('uses (root) path for a top-level scalar change', () => {
    const entries = diffJson(1, 2)
    expect(entries).toEqual([{ path: '(root)', type: 'changed', left: 1, right: 2 }])
  })
})

describe('summarize', () => {
  it('counts entries by type', () => {
    const entries = diffJson({ a: 1, b: 2, c: 3 }, { a: 1, b: 9, d: 4 })
    // a unchanged, b changed, c removed, d added
    expect(summarize(entries)).toEqual({ added: 1, removed: 1, changed: 1, unchanged: 1 })
  })
})
