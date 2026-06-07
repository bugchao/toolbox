import { describe, it, expect } from 'vitest'
import { jsonToToml, tomlToJson } from './convert'

describe('tomlToJson', () => {
  it('returns {} for empty / whitespace input', () => {
    expect(tomlToJson('').text).toBe('{}')
    expect(tomlToJson('   \n  ').text).toBe('{}')
  })

  it('parses scalars', () => {
    const r = tomlToJson('a = 1\nb = "hi"\nc = true')
    expect(r.ok).toBe(true)
    expect(JSON.parse(r.ok ? r.text : '{}')).toEqual({ a: 1, b: 'hi', c: true })
  })

  it('parses nested tables', () => {
    const r = tomlToJson('[srv]\nhost="x"\nport=80')
    expect(JSON.parse(r.ok ? r.text : '{}')).toEqual({ srv: { host: 'x', port: 80 } })
  })

  it('parses array of tables', () => {
    const src = `[[items]]
name = "a"
[[items]]
name = "b"`
    const r = tomlToJson(src)
    expect(JSON.parse(r.ok ? r.text : '{}')).toEqual({ items: [{ name: 'a' }, { name: 'b' }] })
  })

  it('respects JSON indent option', () => {
    const t2 = tomlToJson('a = 1', 2)
    const t4 = tomlToJson('a = 1', 4)
    const tt = tomlToJson('a = 1', '\t')
    expect(t2.ok && /\n {2}"a"/.test(t2.text)).toBe(true)
    expect(t4.ok && /\n {4}"a"/.test(t4.text)).toBe(true)
    expect(tt.ok && /\n\t"a"/.test(tt.text)).toBe(true)
  })

  it('returns error with line number on parse failure', () => {
    const r = tomlToJson('a = 1\nb = ?')
    expect(r.ok).toBe(false)
    if (!r.ok) {
      expect(r.message.length).toBeGreaterThan(0)
      // @iarna/toml 报错带 line 字段（0-based 在 lib 内，导出时 +1）
      if (r.line != null) expect(r.line).toBeGreaterThan(0)
    }
  })
})

describe('jsonToToml', () => {
  it('returns "" for empty input', () => {
    expect(jsonToToml('').text).toBe('')
  })

  it('serializes simple object', () => {
    const r = jsonToToml('{"a":1,"b":"hi","c":true}')
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.text).toContain('a = 1')
      expect(r.text).toContain('b = "hi"')
      expect(r.text).toContain('c = true')
    }
  })

  it('serializes nested table', () => {
    const r = jsonToToml('{"srv":{"host":"x","port":80}}')
    if (r.ok) {
      expect(r.text).toMatch(/\[srv\]/)
      expect(r.text).toContain('host = "x"')
    }
  })

  it('rejects non-object root (TOML rule)', () => {
    expect(jsonToToml('[1, 2, 3]').ok).toBe(false)
    expect(jsonToToml('null').ok).toBe(false)
    expect(jsonToToml('"hello"').ok).toBe(false)
  })

  it('returns error with line number for invalid JSON', () => {
    const r = jsonToToml('{a: 1}')
    expect(r.ok).toBe(false)
    if (!r.ok) {
      expect(r.line).toBeGreaterThan(0)
    }
  })
})

describe('round-trip', () => {
  it('TOML → JSON → TOML preserves keys and values', () => {
    const src = 'name = "Alice"\nage = 30\n[addr]\ncity = "Shanghai"'
    const j = tomlToJson(src)
    expect(j.ok).toBe(true)
    const t = jsonToToml(j.ok ? j.text : '{}')
    expect(t.ok).toBe(true)
    if (t.ok) {
      const j2 = tomlToJson(t.text)
      expect(JSON.parse(j2.ok ? j2.text : '{}')).toEqual(JSON.parse(j.ok ? j.text : '{}'))
    }
  })
})
