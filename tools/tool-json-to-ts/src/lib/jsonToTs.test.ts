import { describe, it, expect } from 'vitest'
import { jsonToTs } from './jsonToTs'

describe('jsonToTs - primitives', () => {
  it('emits type alias for top-level string', () => {
    expect(jsonToTs('"hello"').trim()).toBe('export type Root = string;')
  })

  it('emits type alias for top-level number', () => {
    expect(jsonToTs('42').trim()).toBe('export type Root = number;')
  })

  it('emits type alias for null', () => {
    expect(jsonToTs('null').trim()).toBe('export type Root = null;')
  })
})

describe('jsonToTs - flat object', () => {
  it('generates interface for flat object', () => {
    const out = jsonToTs('{"id": 1, "name": "Ada", "active": true}')
    expect(out).toContain('export interface Root {')
    expect(out).toContain('id: number;')
    expect(out).toContain('name: string;')
    expect(out).toContain('active: boolean;')
  })

  it('quotes invalid identifiers as keys', () => {
    const out = jsonToTs('{"first-name": "Ada"}')
    expect(out).toContain('"first-name": string;')
  })

  it('supports type style', () => {
    const out = jsonToTs('{"id": 1}', { style: 'type' })
    expect(out).toContain('export type Root = {')
  })

  it('uses custom rootName', () => {
    const out = jsonToTs('{"id": 1}', { rootName: 'User' })
    expect(out).toContain('export interface User {')
  })
})

describe('jsonToTs - nested object', () => {
  it('extracts nested object to a top-level interface', () => {
    const out = jsonToTs('{"user": {"id": 1, "name": "x"}}')
    expect(out).toContain('export interface Root {')
    expect(out).toContain('user: User;')
    expect(out).toContain('export interface User {')
    expect(out).toContain('id: number;')
  })
})

describe('jsonToTs - arrays', () => {
  it('empty array becomes unknown[]', () => {
    const out = jsonToTs('{"items": []}')
    expect(out).toContain('items: unknown[];')
  })

  it('primitive array', () => {
    const out = jsonToTs('{"tags": ["a", "b"]}')
    expect(out).toContain('tags: string[];')
  })

  it('mixed primitive array becomes union[]', () => {
    const out = jsonToTs('{"mix": [1, "a", true]}')
    expect(out).toMatch(/mix: \((number \| string \| boolean|.*)\)\[\];/)
  })

  it('array of objects merges into one item interface', () => {
    const out = jsonToTs('{"users": [{"id": 1, "name": "a"}, {"id": 2, "age": 9}]}')
    // 合并后 name 与 age 都应是可选
    expect(out).toContain('users: User[];')
    expect(out).toContain('export interface User {')
    expect(out).toContain('id: number;')
    expect(out).toMatch(/name\?: string;/)
    expect(out).toMatch(/age\?: number;/)
  })

  it('array of objects unions value types when present in all but differ', () => {
    const out = jsonToTs('[{"v": 1}, {"v": "x"}]', { rootName: 'List' })
    expect(out).toMatch(/v: number \| string;/)
  })
})

describe('jsonToTs - errors', () => {
  it('throws SyntaxError on invalid JSON', () => {
    expect(() => jsonToTs('{not-json')).toThrow(SyntaxError)
  })
})
