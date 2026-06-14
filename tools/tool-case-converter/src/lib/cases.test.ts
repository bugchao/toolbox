import { describe, it, expect } from 'vitest'
import { CASE_DEFS, convertCase, convertLines, tokenize } from './cases'

describe('tokenize', () => {
  it('splits space / underscore / hyphen / dot', () => {
    expect(tokenize('hello world')).toEqual(['hello', 'world'])
    expect(tokenize('hello_world')).toEqual(['hello', 'world'])
    expect(tokenize('hello-world')).toEqual(['hello', 'world'])
    expect(tokenize('hello.world')).toEqual(['hello', 'world'])
  })

  it('splits camelCase boundary', () => {
    expect(tokenize('fooBarBaz')).toEqual(['foo', 'bar', 'baz'])
  })

  it('handles consecutive caps (HTTPServer → http server)', () => {
    expect(tokenize('HTTPServer')).toEqual(['http', 'server'])
    expect(tokenize('parseHTTPResponse')).toEqual(['parse', 'http', 'response'])
  })

  it('splits letter/number boundaries', () => {
    expect(tokenize('version2')).toEqual(['version', '2'])
    expect(tokenize('2ndPlace')).toEqual(['2', 'nd', 'place'])
  })

  it('collapses multiple separators', () => {
    expect(tokenize('  foo___bar--baz  ')).toEqual(['foo', 'bar', 'baz'])
  })

  it('handles non-ascii letters', () => {
    expect(tokenize('café_münchen')).toEqual(['café', 'münchen'])
  })

  it('empty / separator-only input gives empty array', () => {
    expect(tokenize('')).toEqual([])
    expect(tokenize('___---')).toEqual([])
  })
})

describe('convertCase', () => {
  const src = 'hello world example'
  it('camelCase', () => expect(convertCase(src, 'camel')).toBe('helloWorldExample'))
  it('PascalCase', () => expect(convertCase(src, 'pascal')).toBe('HelloWorldExample'))
  it('snake_case', () => expect(convertCase(src, 'snake')).toBe('hello_world_example'))
  it('CONSTANT_CASE', () => expect(convertCase(src, 'constant')).toBe('HELLO_WORLD_EXAMPLE'))
  it('kebab-case', () => expect(convertCase(src, 'kebab')).toBe('hello-world-example'))
  it('COBOL-CASE', () => expect(convertCase(src, 'cobol')).toBe('HELLO-WORLD-EXAMPLE'))
  it('Train-Case', () => expect(convertCase(src, 'train')).toBe('Hello-World-Example'))
  it('Title Case', () => expect(convertCase(src, 'title')).toBe('Hello World Example'))
  it('Sentence case', () => expect(convertCase(src, 'sentence')).toBe('Hello world example'))
  it('lower case', () => expect(convertCase(src, 'lower')).toBe('hello world example'))
  it('UPPER CASE', () => expect(convertCase(src, 'upper')).toBe('HELLO WORLD EXAMPLE'))
  it('dot.case', () => expect(convertCase(src, 'dot')).toBe('hello.world.example'))
  it('path/case', () => expect(convertCase(src, 'path')).toBe('hello/world/example'))

  it('round-trips through different input styles', () => {
    for (const input of ['helloWorldExample', 'hello_world_example', 'HELLO-WORLD-EXAMPLE', 'Hello World Example']) {
      expect(convertCase(input, 'camel')).toBe('helloWorldExample')
    }
  })

  it('empty input → empty string', () => {
    expect(convertCase('', 'camel')).toBe('')
    expect(convertCase('___', 'snake')).toBe('')
  })
})

describe('CASE_DEFS', () => {
  it('has 13 entries with unique ids', () => {
    expect(CASE_DEFS).toHaveLength(13)
    expect(new Set(CASE_DEFS.map((d) => d.id)).size).toBe(13)
  })
  it('samples are non-empty', () => {
    CASE_DEFS.forEach((d) => expect(d.sample.length).toBeGreaterThan(0))
  })
})

describe('convertLines', () => {
  it('converts line by line, preserving blank lines', () => {
    const out = convertLines('fooBar\n\nbaz_qux', 'kebab')
    expect(out).toBe('foo-bar\n\nbaz-qux')
  })
})
