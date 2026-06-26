import { describe, it, expect } from 'vitest'
import { arrayToJsonl, jsonlToArray, minifyJsonl, parseJsonl, stats } from './jsonl'

describe('parseJsonl', () => {
  it('parses each non-empty line', () => {
    const r = parseJsonl('{"a":1}\n{"b":2}\n')
    expect(r.values).toEqual([{ a: 1 }, { b: 2 }])
    expect(r.errors).toEqual([])
  })
  it('skips blank lines without error', () => {
    const r = parseJsonl('{"a":1}\n\n   \n{"b":2}')
    expect(r.values).toHaveLength(2)
    expect(r.errors).toEqual([])
  })
  it('records per-line errors with 1-based line numbers', () => {
    const r = parseJsonl('{"a":1}\nnot json\n{"b":2}')
    expect(r.values).toEqual([{ a: 1 }, { b: 2 }])
    expect(r.errors).toHaveLength(1)
    expect(r.errors[0].line).toBe(2)
  })
  it('handles scalars and arrays per line', () => {
    const r = parseJsonl('1\n"x"\n[1,2]\ntrue\nnull')
    expect(r.values).toEqual([1, 'x', [1, 2], true, null])
  })
})

describe('jsonlToArray', () => {
  it('converts to pretty array', () => {
    const r = jsonlToArray('{"a":1}\n{"b":2}')
    expect(r.ok).toBe(true)
    if (r.ok) expect(JSON.parse(r.json)).toEqual([{ a: 1 }, { b: 2 }])
  })
  it('custom indent', () => {
    const r = jsonlToArray('{"a":1}', 0)
    if (r.ok) expect(r.json).toBe('[{"a":1}]')
  })
  it('fails with errors when a line is invalid', () => {
    const r = jsonlToArray('{"a":1}\nbad')
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.errors[0].line).toBe(2)
  })
})

describe('arrayToJsonl', () => {
  it('array → one object per line (single-line each)', () => {
    const r = arrayToJsonl('[{"a":1},{"b":2}]')
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.jsonl).toBe('{"a":1}\n{"b":2}')
  })
  it('flattens pretty-printed input to single lines', () => {
    const r = arrayToJsonl('[\n  { "a": 1 },\n  { "b": 2 }\n]')
    if (r.ok) expect(r.jsonl).toBe('{"a":1}\n{"b":2}')
  })
  it('non-array becomes single line', () => {
    const r = arrayToJsonl('{"a":1}')
    if (r.ok) expect(r.jsonl).toBe('{"a":1}')
  })
  it('reports parse error', () => {
    const r = arrayToJsonl('{bad}')
    expect(r.ok).toBe(false)
  })
})

describe('minifyJsonl', () => {
  it('compacts each line', () => {
    const r = minifyJsonl('{ "a" : 1 }\n{ "b" : 2 }')
    expect(r.text).toBe('{"a":1}\n{"b":2}')
    expect(r.errors).toEqual([])
  })
  it('keeps bad line verbatim and records error', () => {
    const r = minifyJsonl('{ "a" : 1 }\noops')
    expect(r.text).toBe('{"a":1}\noops')
    expect(r.errors[0].line).toBe(2)
  })
  it('drops blank lines', () => {
    const r = minifyJsonl('{"a":1}\n\n{"b":2}')
    expect(r.text).toBe('{"a":1}\n{"b":2}')
  })
})

describe('stats', () => {
  it('counts records / errors / blank', () => {
    const s = stats('{"a":1}\n\nbad\n{"b":2}')
    expect(s).toEqual({ records: 2, errors: 1, blank: 1 })
  })
})

describe('round-trip', () => {
  it('jsonl → array → jsonl is stable', () => {
    const jsonl = '{"a":1}\n{"b":2}\n{"c":[1,2,3]}'
    const arr = jsonlToArray(jsonl)
    expect(arr.ok).toBe(true)
    if (arr.ok) {
      const back = arrayToJsonl(arr.json)
      if (back.ok) expect(back.jsonl).toBe(jsonl)
    }
  })
})
