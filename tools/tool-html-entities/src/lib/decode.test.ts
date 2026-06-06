import { describe, it, expect } from 'vitest'
import { decodeHtml, encodeHtml } from './entities'

describe('decodeHtml — named entities', () => {
  it('decodes &amp; → &', () => {
    expect(decodeHtml('&amp;')).toBe('&')
  })

  it('decodes &lt; → <', () => {
    expect(decodeHtml('&lt;')).toBe('<')
  })

  it('decodes &gt; → >', () => {
    expect(decodeHtml('&gt;')).toBe('>')
  })

  it('decodes &copy; → ©', () => {
    expect(decodeHtml('&copy;')).toBe('©')
  })

  it('decodes mixed content', () => {
    expect(decodeHtml('&lt;a href=&quot;x&quot;&gt;&amp;&lt;/a&gt;')).toBe('<a href="x">&</a>')
  })
})

describe('decodeHtml — numeric entities', () => {
  it('decodes &#38; → &', () => {
    expect(decodeHtml('&#38;')).toBe('&')
  })

  it('decodes &#x26; → &', () => {
    expect(decodeHtml('&#x26;')).toBe('&')
  })

  it('decodes &#x4E2D; → 中 (uppercase hex digits)', () => {
    expect(decodeHtml('&#x4E2D;')).toBe('中')
  })

  it('decodes &#20013; → 中 (decimal)', () => {
    expect(decodeHtml('&#20013;')).toBe('中')
  })

  it('decodes emoji via surrogate pair: &#x1F600; → 😀', () => {
    expect(decodeHtml('&#x1F600;')).toBe('😀')
  })
})

describe('decodeHtml — lenient / missing semicolon', () => {
  it('parses longest-prefix named entity: "&ampfoo" → "&foo"', () => {
    expect(decodeHtml('&ampfoo')).toBe('&foo')
  })

  it('parses numeric entity without semicolon: "&#38hi" → "&hi"', () => {
    expect(decodeHtml('&#38hi')).toBe('&hi')
  })

  it('parses hex entity without semicolon: "&#x26hi" → "&hi"', () => {
    expect(decodeHtml('&#x26hi')).toBe('&hi')
  })
})

describe('decodeHtml — unknown entities preserved', () => {
  it('keeps unknown named entity verbatim: "&unknown;"', () => {
    expect(decodeHtml('&unknown;')).toBe('&unknown;')
  })

  it('keeps stray & unchanged', () => {
    expect(decodeHtml('a & b')).toBe('a & b')
  })

  it('keeps malformed numeric entity: "&#;"', () => {
    expect(decodeHtml('&#;')).toBe('&#;')
  })
})

describe('encode ↔ decode roundtrip', () => {
  it('minimal roundtrip preserves the original text', () => {
    const original = '<div class="x">Hello & welcome \'world\'</div>'
    expect(decodeHtml(encodeHtml(original, 'minimal'))).toBe(original)
  })

  it('non-ascii-decimal roundtrip preserves text including CJK', () => {
    const original = 'Hi 中文 & "quotes" \'apos\''
    expect(decodeHtml(encodeHtml(original, 'non-ascii-decimal'))).toBe(original)
  })

  it('non-ascii-hex roundtrip preserves text including emoji', () => {
    const original = 'A 😀 B © Hello'
    expect(decodeHtml(encodeHtml(original, 'non-ascii-hex'))).toBe(original)
  })

  it('all-non-ascii-named roundtrip preserves text', () => {
    const original = '© Hello 中文 — "tip"'
    expect(decodeHtml(encodeHtml(original, 'all-non-ascii-named'))).toBe(original)
  })
})
