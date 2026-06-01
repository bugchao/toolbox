import { describe, it, expect, beforeEach } from 'vitest'
import {
  addEntry,
  applicable,
  createEntry,
  entryAppliesToLang,
  entryMatches,
  exportJson,
  formatPromptInjection,
  importJson,
  readGlossary,
  removeEntry,
  updateEntry,
  writeGlossary,
} from './glossary'

beforeEach(() => {
  window.localStorage.clear()
})

describe('CRUD + storage', () => {
  it('readGlossary returns [] by default', () => {
    expect(readGlossary()).toEqual([])
  })

  it('writeGlossary + readGlossary roundtrip', () => {
    writeGlossary([createEntry({ source: 'API', target: '接口' })])
    expect(readGlossary()).toHaveLength(1)
  })

  it('addEntry prepends and immutable', () => {
    const a = [createEntry({ source: 'one', target: '1' })]
    const b = addEntry(a, { source: 'two', target: '2' })
    expect(b).toHaveLength(2)
    expect(b[0].source).toBe('two')
    expect(a).toHaveLength(1)
  })

  it('updateEntry patches only target id', () => {
    const a = [createEntry({ id: 'x', source: 'foo', target: 'bar' })]
    const b = updateEntry(a, 'x', { target: 'baz' })
    expect(b[0].target).toBe('baz')
  })

  it('removeEntry filters', () => {
    const a = [
      createEntry({ id: '1', source: 'a', target: 'A' }),
      createEntry({ id: '2', source: 'b', target: 'B' }),
    ]
    expect(removeEntry(a, '1').map((e) => e.id)).toEqual(['2'])
  })
})

describe('entryMatches', () => {
  it('matches case-insensitive substring by default', () => {
    const e = createEntry({ source: 'GitHub', target: 'GitHub' })
    expect(entryMatches(e, 'I love github')).toBe(true)
    expect(entryMatches(e, 'gitlab only')).toBe(false)
  })
  it('respects caseSensitive flag', () => {
    const e = createEntry({ source: 'API', target: '接口', caseSensitive: true })
    expect(entryMatches(e, 'use the API')).toBe(true)
    expect(entryMatches(e, 'use the api')).toBe(false)
  })
  it('empty source never matches', () => {
    const e = createEntry({ source: '', target: 'x' })
    expect(entryMatches(e, 'anything')).toBe(false)
  })
})

describe('entryAppliesToLang', () => {
  it('no langPair = applies to all', () => {
    const e = createEntry({ source: 'x', target: 'y' })
    expect(entryAppliesToLang(e, 'en', 'zh')).toBe(true)
    expect(entryAppliesToLang(e, 'ja', 'ko')).toBe(true)
  })
  it('with langPair = only that direction', () => {
    const e = createEntry({
      source: 'x',
      target: 'y',
      langPair: { source: 'en', target: 'zh' },
    })
    expect(entryAppliesToLang(e, 'en', 'zh')).toBe(true)
    expect(entryAppliesToLang(e, 'zh', 'en')).toBe(false) // 反向不匹配
  })
})

describe('applicable + formatPromptInjection', () => {
  const entries = [
    createEntry({ source: 'API', target: '接口', langPair: { source: 'en', target: 'zh' } }),
    createEntry({ source: 'Cache', target: '缓存' }),
    createEntry({ source: 'GraphQL', target: 'GraphQL', caseSensitive: true }),
  ]

  it('returns only entries that match text AND lang direction', () => {
    const out = applicable(entries, 'en', 'zh', 'We use API and cache for performance')
    expect(out.map((e) => e.source).sort()).toEqual(['API', 'Cache'])
  })

  it('drops entries whose langPair does not match', () => {
    const out = applicable(entries, 'zh', 'en', 'We use API frequently')
    // 「API」条目绑定 en->zh，反向不命中；Cache 无 langPair 也不在 text 中
    expect(out).toHaveLength(0)
  })

  it('formatPromptInjection produces a "- src → tgt" listing', () => {
    const out = applicable(entries, 'en', 'zh', 'API and Cache here')
    const text = formatPromptInjection(out)
    expect(text).toContain('"API"')
    expect(text).toContain('"接口"')
    expect(text).toContain('"Cache"')
    expect(text).toContain('"缓存"')
    expect(text.split('\n').filter((l) => l.startsWith('-'))).toHaveLength(2)
  })

  it('formatPromptInjection returns empty string when no entries', () => {
    expect(formatPromptInjection([])).toBe('')
  })
})

describe('import / export', () => {
  it('exportJson strips ids', () => {
    const arr = [createEntry({ id: 'fixed', source: 'a', target: 'b' })]
    const out = JSON.parse(exportJson(arr))
    expect(out[0].id).toBeUndefined()
    expect(out[0].source).toBe('a')
  })

  it('importJson re-creates entries with fresh ids', () => {
    const json = JSON.stringify([
      { source: 'API', target: '接口' },
      { source: 'Cache', target: '缓存', caseSensitive: true },
    ])
    const out = importJson(json)
    expect(out).toHaveLength(2)
    out.forEach((e) => expect(e.id).toMatch(/^g/))
    expect(out[1].caseSensitive).toBe(true)
  })

  it('importJson drops entries missing source or target', () => {
    const json = JSON.stringify([
      { source: 'ok', target: 'OK' },
      { source: '', target: 'no source' },
      { source: 'no target' },
      'not an object',
    ])
    expect(importJson(json)).toHaveLength(1)
  })

  it('importJson tolerates bad JSON', () => {
    expect(importJson('{not json')).toEqual([])
    expect(importJson('null')).toEqual([])
  })
})
