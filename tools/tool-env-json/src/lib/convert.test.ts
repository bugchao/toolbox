import { describe, it, expect } from 'vitest'
import { jsonToMap, mapToJson, parseEnv, toEnv } from './convert'

const env = (t: string) => {
  const r = parseEnv(t)
  if (!r.ok) throw new Error(r.message)
  return r.map
}

describe('parseEnv', () => {
  it('parses simple KEY=VALUE', () => {
    expect(env('A=1\nB=hello')).toEqual({ A: '1', B: 'hello' })
  })

  it('ignores blank lines and # comments', () => {
    expect(env('# comment\n\nA=1\n  # indented comment\nB=2')).toEqual({ A: '1', B: '2' })
  })

  it('strips export prefix', () => {
    expect(env('export A=1\nexport  B=2')).toEqual({ A: '1', B: '2' })
  })

  it('trims whitespace around key and unquoted value', () => {
    expect(env('  A = hello world  ')).toEqual({ A: 'hello world' })
  })

  it('strips inline comments from unquoted values', () => {
    expect(env('A=value # trailing comment')).toEqual({ A: 'value' })
    // # 紧贴无空格不算注释
    expect(env('A=val#ue')).toEqual({ A: 'val#ue' })
  })

  it('double-quoted values process escapes', () => {
    expect(env('A="line1\\nline2\\ttab"')).toEqual({ A: 'line1\nline2\ttab' })
    expect(env('A="has # hash and spaces"')).toEqual({ A: 'has # hash and spaces' })
    expect(env('A="escaped \\"quote\\""')).toEqual({ A: 'escaped "quote"' })
  })

  it('single-quoted values are literal (no escape)', () => {
    expect(env("A='raw \\n no escape'")).toEqual({ A: 'raw \\n no escape' })
  })

  it('double-quoted value can span lines', () => {
    expect(env('A="line1\nline2"\nB=2')).toEqual({ A: 'line1\nline2', B: '2' })
  })

  it('skips invalid keys / lines without =', () => {
    const r = parseEnv('VALID=1\n123BAD=2\nnokeyhere\nALSO_OK=3')
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.map).toEqual({ VALID: '1', ALSO_OK: '3' })
      expect(r.skipped).toBe(2)
    }
  })

  it('empty input → empty map', () => {
    const r = parseEnv('   ')
    expect(r.ok && r.map).toEqual({})
  })
})

describe('toEnv', () => {
  it('emits KEY=value', () => {
    expect(toEnv({ A: '1', B: 'hello' })).toBe('A=1\nB=hello')
  })

  it('quotes values needing quotes', () => {
    expect(toEnv({ A: 'has space' })).toBe('A="has space"')
    expect(toEnv({ A: 'has#hash but no space' })).toContain('"') // # triggers quote
    expect(toEnv({ EMPTY: '' })).toBe('EMPTY=""')
  })

  it('escapes newlines / quotes inside double quotes', () => {
    expect(toEnv({ A: 'line1\nline2' })).toBe('A="line1\\nline2"')
    expect(toEnv({ A: 'say "hi"' })).toBe('A="say \\"hi\\""')
  })

  it('export prefix option', () => {
    expect(toEnv({ A: '1' }, { exportPrefix: true })).toBe('export A=1')
  })

  it('alwaysQuote option', () => {
    expect(toEnv({ A: 'plain' }, { alwaysQuote: true })).toBe('A="plain"')
  })

  it('round-trips through parseEnv', () => {
    const original = { A: '1', B: 'has space', C: 'multi\nline', D: 'with "quote"', E: '' }
    expect(env(toEnv(original))).toEqual(original)
  })
})

describe('jsonToMap', () => {
  it('flattens scalar values to strings', () => {
    const r = jsonToMap('{"A":1,"B":true,"C":"x","D":null}')
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.map).toEqual({ A: '1', B: 'true', C: 'x', D: '' })
  })

  it('serializes nested objects/arrays to JSON strings', () => {
    const r = jsonToMap('{"obj":{"a":1},"arr":[1,2]}')
    if (r.ok) {
      expect(r.map.obj).toBe('{"a":1}')
      expect(r.map.arr).toBe('[1,2]')
    }
  })

  it('rejects non-object root', () => {
    expect(jsonToMap('[1,2]').ok).toBe(false)
    expect(jsonToMap('"x"').ok).toBe(false)
    expect(jsonToMap('42').ok).toBe(false)
  })

  it('rejects bad JSON', () => {
    expect(jsonToMap('{bad').ok).toBe(false)
  })

  it('empty input → empty map', () => {
    const r = jsonToMap('  ')
    expect(r.ok && r.map).toEqual({})
  })
})

describe('mapToJson', () => {
  it('pretty-prints with indent', () => {
    expect(mapToJson({ A: '1' }, 2)).toBe('{\n  "A": "1"\n}')
  })
})

describe('full round-trip env → json → env', () => {
  it('preserves keys and values', () => {
    const original = 'export NAME="Alice Smith"\nPORT=8080\nDEBUG=false\nEMPTY='
    const m1 = env(original)
    const json = mapToJson(m1)
    const back = jsonToMap(json)
    expect(back.ok).toBe(true)
    if (back.ok) expect(back.map).toEqual(m1)
  })
})
