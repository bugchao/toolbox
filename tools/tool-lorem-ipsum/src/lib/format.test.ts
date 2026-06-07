import { describe, it, expect } from 'vitest'
import { formatParagraphs, __testing } from './format'

const SAMPLE = ['First paragraph.', 'Second paragraph.', 'Third paragraph.']

describe('formatParagraphs - plain', () => {
  it('joins paragraphs with blank lines', () => {
    expect(formatParagraphs(SAMPLE, 'plain', 'latin')).toBe(
      'First paragraph.\n\nSecond paragraph.\n\nThird paragraph.',
    )
  })
})

describe('formatParagraphs - markdown', () => {
  it('no headings when interval is 0', () => {
    const out = formatParagraphs(SAMPLE, 'markdown', 'latin', { markdownHeadingEvery: 0 })
    expect(out).not.toContain('##')
  })

  it('inserts heading every N paragraphs', () => {
    const out = formatParagraphs(SAMPLE, 'markdown', 'latin', { markdownHeadingEvery: 2 })
    // 段 0 与段 2 都该有标题
    const headings = out.match(/^## /gm) || []
    expect(headings.length).toBe(2)
  })

  it('uses chinese faux heading for chinese flavor', () => {
    const out = formatParagraphs(SAMPLE, 'markdown', 'chinese', { markdownHeadingEvery: 1 })
    // 中文标题里至少包含中文字符
    expect(/[一-鿿]/.test(out)).toBe(true)
  })
})

describe('formatParagraphs - html', () => {
  it('wraps each paragraph in <p> by default', () => {
    const out = formatParagraphs(SAMPLE, 'html', 'latin')
    expect(out.match(/<p>/g)).toHaveLength(3)
    expect(out.match(/<\/p>/g)).toHaveLength(3)
  })

  it('uses <br><br> when htmlParagraphs is false', () => {
    const out = formatParagraphs(SAMPLE, 'html', 'latin', { htmlParagraphs: false })
    expect(out).not.toContain('<p>')
    expect(out).toContain('<br><br>')
  })

  it('escapes HTML entities in content', () => {
    const out = formatParagraphs(['<script>x</script>'], 'html', 'latin')
    expect(out).not.toContain('<script>')
    expect(out).toContain('&lt;script&gt;')
  })
})

describe('escapeHtml helper', () => {
  it('escapes &, <, > only', () => {
    expect(__testing.escapeHtml('a & b < c > d')).toBe('a &amp; b &lt; c &gt; d')
  })
})
