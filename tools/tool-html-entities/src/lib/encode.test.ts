import { describe, it, expect } from 'vitest'
import { encodeHtml } from './entities'

const NBSP = ' '

describe('encodeHtml — minimal', () => {
  it('escapes < > & " \'', () => {
    expect(encodeHtml('<a href="x">&</a>', 'minimal')).toBe(
      '&lt;a href=&quot;x&quot;&gt;&amp;&lt;/a&gt;',
    )
  })

  it("escapes single quote as &apos;", () => {
    expect(encodeHtml("it's", 'minimal')).toBe('it&apos;s')
  })

  it('leaves non-ASCII alone in minimal mode', () => {
    expect(encodeHtml('中© 文', 'minimal')).toBe('中© 文')
  })

  it('returns empty string for empty input', () => {
    expect(encodeHtml('', 'minimal')).toBe('')
  })
})

describe('encodeHtml — non-ascii-decimal', () => {
  it('encodes 中 to &#20013;', () => {
    expect(encodeHtml('中', 'non-ascii-decimal')).toBe('&#20013;')
  })

  it('encodes 你好 as two decimal entities', () => {
    expect(encodeHtml('你好', 'non-ascii-decimal')).toBe('&#20320;&#22909;')
  })

  it('keeps ASCII as-is while encoding non-ASCII', () => {
    expect(encodeHtml('a中b', 'non-ascii-decimal')).toBe('a&#20013;b')
  })

  it('still applies minimal escapes alongside non-ASCII', () => {
    expect(encodeHtml('<中>', 'non-ascii-decimal')).toBe('&lt;&#20013;&gt;')
  })
})

describe('encodeHtml — non-ascii-hex', () => {
  it('encodes 中 to &#x4e2d; (case-insensitive comparison)', () => {
    const out = encodeHtml('中', 'non-ascii-hex')
    expect(out.toLowerCase()).toBe('&#x4e2d;')
  })

  it('encodes emoji 😀 via surrogate-pair-safe code point', () => {
    // 😀 = U+1F600
    const out = encodeHtml('😀', 'non-ascii-hex')
    expect(out.toLowerCase()).toBe('&#x1f600;')
  })

  it('does not double-encode ASCII', () => {
    expect(encodeHtml('hi', 'non-ascii-hex')).toBe('hi')
  })
})

describe('encodeHtml — named-extended', () => {
  it('encodes © as &copy;', () => {
    expect(encodeHtml('©', 'named-extended')).toBe('&copy;')
  })

  it('encodes ™ « » as named entities', () => {
    expect(encodeHtml('™«»', 'named-extended')).toBe('&trade;&laquo;&raquo;')
  })

  it('encodes NBSP (U+00A0) as &nbsp;', () => {
    expect(encodeHtml(NBSP, 'named-extended')).toBe('&nbsp;')
  })

  it('leaves regular space (U+0020) untouched', () => {
    expect(encodeHtml('a b', 'named-extended')).toBe('a b')
  })

  it('leaves chars without a named mapping untouched', () => {
    // 中 is not in the named table
    expect(encodeHtml('中', 'named-extended')).toBe('中')
  })
})

describe('encodeHtml — all-non-ascii-named', () => {
  it('prefers named entity for ©: "© Hello" → "&copy; Hello"', () => {
    expect(encodeHtml('© Hello', 'all-non-ascii-named')).toBe('&copy; Hello')
  })

  it('falls back to hex for non-ASCII that has no named entity (e.g. 中)', () => {
    const out = encodeHtml('中', 'all-non-ascii-named')
    expect(out.toLowerCase()).toBe('&#x4e2d;')
  })

  it('handles emoji via hex fallback', () => {
    const out = encodeHtml('😀', 'all-non-ascii-named')
    expect(out.toLowerCase()).toBe('&#x1f600;')
  })

  it('leaves plain ASCII as-is', () => {
    expect(encodeHtml('hi', 'all-non-ascii-named')).toBe('hi')
  })
})
