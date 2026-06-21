import { describe, it, expect } from 'vitest'
import { escape, unescape, type EscapeLang } from './escape'

describe('escape — json', () => {
  it('escapes quotes / backslash / control', () => {
    expect(escape('json', 'a"b\\c')).toBe('a\\"b\\\\c')
    expect(escape('json', 'line1\nline2\t!')).toBe('line1\\nline2\\t!')
  })
  it('control chars below 0x20 → \\uXXXX', () => {
    expect(escape('json', '')).toBe('\\u0001')
  })
  it('does not escape single quote', () => {
    expect(escape('json', "it's")).toBe("it's")
  })
})

describe('escape — js', () => {
  it('escapes single / backtick / \\v \\0', () => {
    expect(escape('js', "a'b`c")).toBe("a\\'b\\`c")
    expect(escape('js', '\v\0')).toBe('\\v\\0')
  })
  it('control → \\xHH', () => {
    expect(escape('js', '')).toBe('\\x01')
  })
})

describe('escape — cstyle', () => {
  it('control → octal', () => {
    expect(escape('cstyle', '')).toBe('\\001')
  })
  it('common escapes', () => {
    expect(escape('cstyle', 'tab\tnl\n')).toBe('tab\\tnl\\n')
  })
})

describe('escape — shell', () => {
  it('wraps in single quotes', () => {
    expect(escape('shell', 'hello world')).toBe("'hello world'")
  })
  it("escapes embedded single quote as '\\''", () => {
    expect(escape('shell', "it's")).toBe("'it'\\''s'")
  })
})

describe('escape — sql', () => {
  it('doubles single quotes', () => {
    expect(escape('sql', "O'Brien")).toBe("'O''Brien'")
  })
})

describe('escape — regex', () => {
  it('escapes regex metacharacters', () => {
    expect(escape('regex', 'a.b*c+?')).toBe('a\\.b\\*c\\+\\?')
    expect(escape('regex', '(x)[y]{z}')).toBe('\\(x\\)\\[y\\]\\{z\\}')
  })
})

describe('unescape — backslash family (json/js/c)', () => {
  it('restores common escapes', () => {
    expect(unescape('json', 'line1\\nline2\\t!')).toBe('line1\nline2\t!')
    expect(unescape('js', "a\\'b\\`c")).toBe("a'b`c")
  })
  it('\\xHH', () => {
    expect(unescape('js', '\\x41')).toBe('A')
  })
  it('\\uHHHH', () => {
    expect(unescape('json', '\\u4e2d')).toBe('中')
  })
  it('\\u{...} astral', () => {
    expect(unescape('js', '\\u{1F600}')).toBe('😀')
  })
  it('octal \\ooo', () => {
    expect(unescape('cstyle', '\\101')).toBe('A')
  })
  it('leaves unknown escapes as the following char', () => {
    expect(unescape('json', '\\q')).toBe('q')
  })
  it('invalid \\x falls back', () => {
    expect(unescape('js', '\\xZZ')).toBe('xZZ')
  })
})

describe('unescape — shell / sql', () => {
  it('shell strips outer quotes and restores', () => {
    expect(unescape('shell', "'it'\\''s'")).toBe("it's")
    expect(unescape('shell', "'hello world'")).toBe('hello world')
  })
  it('sql strips outer quotes and undoubles', () => {
    expect(unescape('sql', "'O''Brien'")).toBe("O'Brien")
  })
})

describe('unescape — regex', () => {
  it('removes escaping backslashes from metachars', () => {
    expect(unescape('regex', 'a\\.b\\*c')).toBe('a.b*c')
  })
})

describe('round-trip escape → unescape', () => {
  const cases: { lang: EscapeLang; input: string }[] = [
    { lang: 'json', input: 'quote " back \\ tab \t nl \n' },
    { lang: 'js', input: "single ' backtick ` nl \n null \0" },
    { lang: 'cstyle', input: 'tab\tnl\nbell' },
    { lang: 'shell', input: "it's a test with spaces" },
    { lang: 'sql', input: "O'Brien & sons" },
    { lang: 'regex', input: 'a.b*c+(d)[e]' },
  ]
  for (const { lang, input } of cases) {
    it(`${lang} round-trips`, () => {
      expect(unescape(lang, escape(lang, input))).toBe(input)
    })
  }
})
