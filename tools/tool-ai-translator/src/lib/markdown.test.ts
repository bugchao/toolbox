import { describe, it, expect } from 'vitest'
import { renderMarkdown, __testing } from './markdown'

describe('renderMarkdown', () => {
  it('renders a heading as <h1>', async () => {
    const html = await renderMarkdown('# Hello')
    expect(html).toContain('<h1')
    expect(html).toContain('Hello')
  })

  it('renders a code fence inside <pre><code>', async () => {
    const html = await renderMarkdown('```\nconst x = 1\n```')
    expect(html).toContain('<pre>')
    expect(html).toContain('<code')
    expect(html).toContain('const x = 1')
  })

  it('renders a link as anchor with the href preserved', async () => {
    const html = await renderMarkdown('[anth](https://anthropic.com)')
    expect(html).toMatch(/<a\s+[^>]*href="https:\/\/anthropic\.com"/)
  })

  it('strips <script> tags through DOMPurify', async () => {
    const html = await renderMarkdown('text <script>alert(1)</script> more')
    expect(html).not.toContain('<script')
    expect(html).not.toContain('alert(1)')
    expect(html).toContain('text')
    expect(html).toContain('more')
  })

  it('strips inline event handlers', async () => {
    const html = await renderMarkdown('<img src="x" onerror="alert(1)">')
    expect(html).not.toMatch(/onerror=/i)
  })

  it('returns empty string for empty input', async () => {
    expect(await renderMarkdown('')).toBe('')
  })
})

describe('escapeHtml', () => {
  it('escapes HTML special chars', () => {
    expect(__testing.escapeHtml('<a "b">&\'</a>')).toBe('&lt;a &quot;b&quot;&gt;&amp;&#39;&lt;/a&gt;')
  })
})
