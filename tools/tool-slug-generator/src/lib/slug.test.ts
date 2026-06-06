import { describe, it, expect } from 'vitest'
import { slugify, slugifyBatch } from './slug'

describe('slugify – English basics', () => {
  it('kebab-cases a simple sentence', () => {
    expect(slugify('Hello World')).toBe('hello-world')
  })

  it('collapses multiple separators / punctuation', () => {
    expect(slugify('Hello,   world!!!  How are you?')).toBe('hello-world-how-are-you')
  })

  it('trims leading and trailing separators', () => {
    expect(slugify('---Hello-World---')).toBe('hello-world')
  })

  it('preserves digits', () => {
    expect(slugify('iPhone 15 Pro Max')).toBe('iphone-15-pro-max')
  })

  it('returns empty for input that becomes empty after filter', () => {
    expect(slugify('!!!')).toBe('')
    expect(slugify('')).toBe('')
  })
})

describe('slugify – case modes', () => {
  it('lower case (default)', () => {
    expect(slugify('Hello World')).toBe('hello-world')
  })
  it('upper case', () => {
    expect(slugify('Hello World', { case: 'upper' })).toBe('HELLO-WORLD')
  })
  it('preserve case', () => {
    expect(slugify('Hello World', { case: 'preserve' })).toBe('Hello-World')
  })
})

describe('slugify – separators', () => {
  it('underscore separator', () => {
    expect(slugify('Hello World', { separator: '_' })).toBe('hello_world')
  })
  it('dot separator', () => {
    expect(slugify('Hello World', { separator: '.' })).toBe('hello.world')
  })
  it('empty separator joins directly', () => {
    expect(slugify('Hello World', { separator: '' })).toBe('helloworld')
  })
})

describe('slugify – Chinese strategies', () => {
  it('pinyin-full converts to full pinyin', () => {
    expect(slugify('你好世界', { chineseStrategy: 'pinyin-full' })).toBe('ni-hao-shi-jie')
  })

  it('pinyin-initials reduces each char to first letter', () => {
    expect(slugify('你好世界', { chineseStrategy: 'pinyin-initials' })).toBe('n-h-s-j')
  })

  it('skip removes Chinese chars entirely', () => {
    expect(slugify('你好 Hello 世界', { chineseStrategy: 'skip' })).toBe('hello')
  })

  it('keep preserves CJK characters when allowed', () => {
    const out = slugify('你好 World', { chineseStrategy: 'keep' })
    expect(out).toContain('你好')
    expect(out).toContain('world')
  })

  it('mixed Chinese / English with pinyin-full', () => {
    expect(slugify('我爱 React 框架', { chineseStrategy: 'pinyin-full' })).toBe(
      'wo-ai-react-kuang-jia',
    )
  })
})

describe('slugify – diacritics', () => {
  it('strips diacritics by default', () => {
    expect(slugify('café déjà vu')).toBe('cafe-deja-vu')
    expect(slugify('Mañana español')).toBe('manana-espanol')
  })

  it('does not strip when disabled (chars filtered as non-ascii)', () => {
    // 不剥离 diacritics → é 不在 [a-z0-9] 范围内 → 被切掉
    const out = slugify('café', { stripDiacritics: false })
    expect(out).toBe('caf')
  })
})

describe('slugify – stopwords', () => {
  it('strips common English stopwords when enabled', () => {
    expect(slugify('The Quick Brown Fox Jumps Over The Lazy Dog', { stripStopwords: true }))
      .toBe('quick-brown-fox-jumps-over-lazy-dog')
  })

  it('does not strip when disabled', () => {
    expect(slugify('The Quick Brown Fox')).toBe('the-quick-brown-fox')
  })
})

describe('slugify – maxLength', () => {
  it('truncates at separator when possible', () => {
    const slug = slugify('one two three four five six seven', { maxLength: 18 })
    expect(slug.length).toBeLessThanOrEqual(18)
    expect(slug.endsWith('-')).toBe(false)
    expect(slug).toBe('one-two-three-four')
  })

  it('falls back to hard cut when no near-boundary separator', () => {
    const slug = slugify('antidisestablishmentarianism', { maxLength: 10 })
    expect(slug.length).toBe(10)
  })
})

describe('slugify – custom replacements', () => {
  it('applies replacements before other transforms', () => {
    const slug = slugify('foo & bar', { customReplacements: { '&': 'and' } })
    expect(slug).toBe('foo-and-bar')
  })

  it('case-sensitive substitutions', () => {
    const slug = slugify('JS vs js', { customReplacements: { JS: 'javascript' } })
    expect(slug).toBe('javascript-vs-js')
  })
})

describe('slugify – allowedExtras', () => {
  it('keeps allowed extra characters (e.g. dot)', () => {
    const slug = slugify('foo.bar.baz', { allowedExtras: '.' })
    expect(slug).toBe('foo.bar.baz')
  })
})

describe('slugifyBatch', () => {
  it('processes line by line preserving blank lines', () => {
    const out = slugifyBatch('Hello World\n\nGoodbye Friend')
    expect(out).toBe('hello-world\n\ngoodbye-friend')
  })
})
