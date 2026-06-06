import { describe, it, expect } from 'vitest'
import { yamlToJson, jsonToYaml } from './convert'

describe('yamlToJson', () => {
  it('converts a simple scalar map', () => {
    const r = yamlToJson('name: toolbox\nversion: 1')
    expect(r.ok).toBe(true)
    if (r.ok) {
      const parsed = JSON.parse(r.text)
      expect(parsed).toEqual({ name: 'toolbox', version: 1 })
    }
  })

  it('handles arrays, null, booleans, numbers, nested objects', () => {
    const r = yamlToJson(`flags:
  debug: false
  verbose: true
  retry: null
items:
  - 1
  - 2
  - name: a
    value: 1.5
`)
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(JSON.parse(r.text)).toEqual({
        flags: { debug: false, verbose: true, retry: null },
        items: [1, 2, { name: 'a', value: 1.5 }],
      })
    }
  })

  it('honors JSON indent option: 2 / 4 / tab', () => {
    const input = 'a: 1\nb: 2'
    const r2 = yamlToJson(input, { indent: 2 })
    const r4 = yamlToJson(input, { indent: 4 })
    const rt = yamlToJson(input, { indent: '\t' })
    expect(r2.ok && r4.ok && rt.ok).toBe(true)
    if (r2.ok) expect(r2.text).toContain('\n  "a"')
    if (r4.ok) expect(r4.text).toContain('\n    "a"')
    if (rt.ok) expect(rt.text).toContain('\n\t"a"')
  })

  it('returns { ok: false, message, line } on parse error', () => {
    const bad = `name: ok
items:
  - one
 - two
`
    const r = yamlToJson(bad)
    expect(r.ok).toBe(false)
    if (!r.ok) {
      expect(typeof r.message).toBe('string')
      expect(r.message.length).toBeGreaterThan(0)
      // js-yaml 上抛的 mark.line 应该被归一成 1-based 行号
      expect(typeof r.line === 'number' || r.line === undefined).toBe(true)
      if (typeof r.line === 'number') {
        expect(r.line).toBeGreaterThan(0)
      }
    }
  })

  it('empty / whitespace input → "{}"', () => {
    expect(yamlToJson('')).toEqual({ ok: true, text: '{}' })
    expect(yamlToJson('   \n\n')).toEqual({ ok: true, text: '{}' })
  })
})

describe('jsonToYaml', () => {
  it('converts a simple object', () => {
    const r = jsonToYaml('{"name":"toolbox","version":1}')
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.text).toContain('name: toolbox')
      expect(r.text).toContain('version: 1')
    }
  })

  it('handles arrays, null, booleans, numbers, nested objects', () => {
    const json = JSON.stringify({
      flags: { debug: false, verbose: true, retry: null },
      items: [1, 2, { name: 'a', value: 1.5 }],
    })
    const r = jsonToYaml(json)
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.text).toMatch(/flags:/)
      expect(r.text).toMatch(/debug: false/)
      expect(r.text).toMatch(/retry: null/)
      // block 样式下数组应当以 "- " 起头
      expect(r.text).toMatch(/- 1/)
    }
  })

  it('flow style produces inline output; block style does not', () => {
    const json = '{"a":1,"b":[1,2,3]}'
    const flow = jsonToYaml(json, { style: 'flow' })
    const block = jsonToYaml(json, { style: 'block' })
    expect(flow.ok && block.ok).toBe(true)
    if (flow.ok) {
      // flow 样式：用 { } 或 [ ] 括号
      expect(flow.text).toMatch(/[{[]/)
    }
    if (block.ok) {
      // block 样式：不应是单行 { ... }
      expect(block.text).not.toMatch(/^\{.*\}\s*$/s)
      expect(block.text).toMatch(/- 1/)
    }
    if (flow.ok && block.ok) {
      expect(flow.text).not.toEqual(block.text)
    }
  })

  it('returns { ok: false, message, line? } on parse error', () => {
    const r = jsonToYaml('{"a": 1,\n"b": ,}')
    expect(r.ok).toBe(false)
    if (!r.ok) {
      expect(typeof r.message).toBe('string')
      expect(r.message.length).toBeGreaterThan(0)
      // line 是可选的，但若给了就该 > 0
      if (typeof r.line === 'number') {
        expect(r.line).toBeGreaterThan(0)
      }
    }
  })

  it('empty / whitespace input → ""', () => {
    expect(jsonToYaml('')).toEqual({ ok: true, text: '' })
    expect(jsonToYaml('   \n\n')).toEqual({ ok: true, text: '' })
  })
})

describe('roundtrip', () => {
  it('YAML → JSON → YAML preserves data shape', () => {
    const input = `name: app
ports:
  - 80
  - 443
flags:
  on: true
  off: false
`
    const j = yamlToJson(input)
    expect(j.ok).toBe(true)
    if (!j.ok) return
    const y = jsonToYaml(j.text)
    expect(y.ok).toBe(true)
    if (!y.ok) return
    const j2 = yamlToJson(y.text)
    expect(j2.ok).toBe(true)
    if (!j2.ok) return
    expect(JSON.parse(j2.text)).toEqual(JSON.parse(j.text))
  })
})
