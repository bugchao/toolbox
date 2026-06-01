import { describe, it, expect } from 'vitest'
import {
  detectKind,
  joinParagraphs,
  shouldTranslate,
  splitParagraphs,
} from './chunker'

describe('splitParagraphs / joinParagraphs roundtrip', () => {
  const cases = [
    'single line',
    'p1\n\np2',
    'p1\n\np2\n\np3',
    '\n\np1\n\np2',
    'p1\n\np2\n\n',
    'with\nlinebreaks\ninside\n\nnext',
    'spaces\n   \nbetween',
    '',
  ]
  for (const t of cases) {
    it(`roundtrips: ${JSON.stringify(t.slice(0, 30))}`, () => {
      const s = splitParagraphs(t)
      const rebuilt = joinParagraphs(s, s.chunks.map((c) => c.text))
      expect(rebuilt).toBe(t)
    })
  }

  it('uses translated text in place of original', () => {
    const text = 'hello\n\nworld'
    const s = splitParagraphs(text)
    expect(s.chunks.map((c) => c.text)).toEqual(['hello', 'world'])
    const out = joinParagraphs(s, ['你好', '世界'])
    expect(out).toBe('你好\n\n世界')
  })

  it('falls back to original for missing translations', () => {
    const s = splitParagraphs('a\n\nb\n\nc')
    const out = joinParagraphs(s, ['A', undefined as unknown as string, 'C'])
    expect(out).toBe('A\n\nb\n\nC')
  })

  it('produces no chunks for empty / whitespace-only input', () => {
    expect(splitParagraphs('').chunks).toHaveLength(0)
    expect(splitParagraphs('\n\n   \n').chunks).toHaveLength(0)
  })
})

describe('detectKind', () => {
  it('recognizes markdown family', () => {
    expect(detectKind('README.md')).toBe('md')
    expect(detectKind('post.markdown')).toBe('md')
    expect(detectKind('docs.mdx')).toBe('md')
  })
  it('defaults to txt', () => {
    expect(detectKind('note.txt')).toBe('txt')
    expect(detectKind('noext')).toBe('txt')
    expect(detectKind('weird.unknown')).toBe('txt')
  })
})

describe('shouldTranslate', () => {
  it('skips empty / whitespace', () => {
    expect(shouldTranslate('')).toBe(false)
    expect(shouldTranslate('   \n')).toBe(false)
  })
  it('skips pure punctuation / numbers', () => {
    expect(shouldTranslate('---')).toBe(false)
    expect(shouldTranslate('1234')).toBe(false)
    expect(shouldTranslate('!@#$%')).toBe(false)
  })
  it('keeps meaningful text', () => {
    expect(shouldTranslate('hello world')).toBe(true)
    expect(shouldTranslate('你好')).toBe(true)
    expect(shouldTranslate('Title 1.0')).toBe(true)
  })
})
