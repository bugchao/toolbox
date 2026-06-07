import { describe, it, expect } from 'vitest'
import { validate } from './validate'

const REQUIRED_NAME_SCHEMA = JSON.stringify({
  type: 'object',
  properties: { name: { type: 'string' } },
  required: ['name'],
})

describe('validate – basic object', () => {
  it('passes for valid object', () => {
    const result = validate({
      schema: REQUIRED_NAME_SCHEMA,
      data: JSON.stringify({ name: 'Ada' }),
    })
    expect(result).toEqual({ ok: true })
  })

  it('reports required error when field is missing', () => {
    const result = validate({
      schema: REQUIRED_NAME_SCHEMA,
      data: JSON.stringify({}),
    })
    if (result.ok) throw new Error('expected validation to fail')
    if ('side' in result) throw new Error('expected schema errors, not parse error')
    expect(result.errors.length).toBeGreaterThan(0)
    const required = result.errors.find((e) => e.keyword === 'required')
    expect(required).toBeTruthy()
    expect(required!.instancePath).toBe('')
    expect(required!.params.missingProperty).toBe('name')
  })
})

describe('validate – nested array', () => {
  const SCHEMA = JSON.stringify({
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: {
          type: 'object',
          properties: { age: { type: 'number' } },
          required: ['age'],
        },
      },
    },
  })

  it('locates wrong-type element via JSON Path', () => {
    const data = JSON.stringify({
      items: [{ age: 1 }, { age: 2 }, { age: 'twelve' }],
    })
    const result = validate({ schema: SCHEMA, data })
    if (result.ok) throw new Error('expected failure')
    if ('side' in result) throw new Error('expected schema errors, not parse error')
    const typeErr = result.errors.find((e) => e.keyword === 'type' && e.instancePath === '/items/2/age')
    expect(typeErr).toBeTruthy()
  })
})

describe('validate – format', () => {
  const SCHEMA = JSON.stringify({
    type: 'object',
    properties: { email: { type: 'string', format: 'email' } },
    required: ['email'],
  })

  it('rejects non-email value when format is email', () => {
    const result = validate({
      schema: SCHEMA,
      data: JSON.stringify({ email: 'not-email' }),
    })
    if (result.ok) throw new Error('expected failure')
    if ('side' in result) throw new Error('expected schema errors, not parse error')
    expect(result.errors.some((e) => e.keyword === 'format')).toBe(true)
  })

  it('accepts valid email', () => {
    const result = validate({
      schema: SCHEMA,
      data: JSON.stringify({ email: 'ada@example.com' }),
    })
    expect(result.ok).toBe(true)
  })
})

describe('validate – parse errors', () => {
  it('returns side:schema for malformed schema JSON', () => {
    const result = validate({
      schema: '{ this is not json',
      data: '{}',
    })
    expect(result.ok).toBe(false)
    if (result.ok) return
    if (!('side' in result)) throw new Error('expected side parse error')
    expect(result.side).toBe('schema')
    expect(typeof result.message).toBe('string')
  })

  it('returns side:data for malformed data JSON', () => {
    const result = validate({
      schema: JSON.stringify({ type: 'object' }),
      data: '{ "x": ',
    })
    expect(result.ok).toBe(false)
    if (result.ok) return
    if (!('side' in result)) throw new Error('expected side parse error')
    expect(result.side).toBe('data')
  })
})

describe('validate – draft differences (dependentRequired)', () => {
  const DEPENDENT_REQUIRED_SCHEMA = JSON.stringify({
    type: 'object',
    properties: {
      credit_card: { type: 'number' },
      billing_address: { type: 'string' },
    },
    dependentRequired: {
      credit_card: ['billing_address'],
    },
  })

  it('enforces dependentRequired under draft-2020-12', () => {
    const result = validate({
      schema: DEPENDENT_REQUIRED_SCHEMA,
      data: JSON.stringify({ credit_card: 1234 }),
      draft: 'draft-2020-12',
    })
    if (result.ok) throw new Error('expected failure under draft-2020-12')
    if ('side' in result) throw new Error('expected schema errors')
    expect(result.errors.some((e) => e.keyword === 'dependentRequired')).toBe(true)
  })

  it('ignores dependentRequired under draft-07 (unknown keyword, no error)', () => {
    const result = validate({
      schema: DEPENDENT_REQUIRED_SCHEMA,
      data: JSON.stringify({ credit_card: 1234 }),
      draft: 'draft-07',
    })
    // draft-07 不认识 dependentRequired，strict:false 下当成无效关键字略过
    expect(result).toEqual({ ok: true })
  })
})
