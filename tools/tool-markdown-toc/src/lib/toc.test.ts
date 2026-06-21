import { describe, it, expect } from 'vitest'
import { buildToc, extractHeadings, githubSlug } from './toc'

describe('githubSlug', () => {
  it('lowercases and hyphenates', () => {
    expect(githubSlug('Hello World')).toBe('hello-world')
  })
  it('strips punctuation', () => {
    expect(githubSlug('What is this?!')).toBe('what-is-this')
    expect(githubSlug('foo.bar (baz)')).toBe('foobar-baz')
  })
  it('keeps CJK', () => {
    expect(githubSlug('中文 标题')).toBe('中文-标题')
  })
  it('collapses and trims dashes', () => {
    expect(githubSlug('  a  --  b  ')).toBe('a-b')
  })
})

describe('extractHeadings', () => {
  it('extracts ATX headings with levels', () => {
    const md = '# Title\n## Section\n### Sub'
    const hs = extractHeadings(md)
    expect(hs).toEqual([
      { level: 1, text: 'Title', slug: 'title' },
      { level: 2, text: 'Section', slug: 'section' },
      { level: 3, text: 'Sub', slug: 'sub' },
    ])
  })

  it('ignores non-heading lines and trailing #', () => {
    const hs = extractHeadings('# A ##\ntext\nnot # heading')
    expect(hs).toHaveLength(1)
    expect(hs[0].text).toBe('A')
  })

  it('skips headings inside fenced code blocks', () => {
    const md = '# Real\n```\n# fake in code\n```\n## AfterCode\n~~~\n## also fake\n~~~'
    const hs = extractHeadings(md)
    expect(hs.map((h) => h.text)).toEqual(['Real', 'AfterCode'])
  })

  it('dedupes duplicate slugs with numeric suffix', () => {
    const hs = extractHeadings('# Setup\n# Setup\n# Setup')
    expect(hs.map((h) => h.slug)).toEqual(['setup', 'setup-1', 'setup-2'])
  })

  it('strips inline markdown in heading text', () => {
    const hs = extractHeadings('# **Bold** and `code` and [link](http://x)')
    expect(hs[0].text).toBe('Bold and code and link')
    expect(hs[0].slug).toBe('bold-and-code-and-link')
  })

  it('requires space after #', () => {
    expect(extractHeadings('#NoSpace')).toHaveLength(0)
  })
})

describe('buildToc', () => {
  const md = '# A\n## B\n### C\n## D\n# E'

  it('nests by level with default unordered', () => {
    const toc = buildToc(extractHeadings(md))
    expect(toc).toBe([
      '- [A](#a)',
      '  - [B](#b)',
      '    - [C](#c)',
      '  - [D](#d)',
      '- [E](#e)',
    ].join('\n'))
  })

  it('ordered list', () => {
    const toc = buildToc(extractHeadings('# A\n## B'), { ordered: true })
    expect(toc).toBe('1. [A](#a)\n  1. [B](#b)')
  })

  it('custom indent', () => {
    const toc = buildToc(extractHeadings('# A\n## B'), { indent: 4 })
    expect(toc).toBe('- [A](#a)\n    - [B](#b)')
  })

  it('links=false → plain text', () => {
    expect(buildToc(extractHeadings('# A'), { links: false })).toBe('- A')
  })

  it('level range filters', () => {
    const toc = buildToc(extractHeadings(md), { minLevel: 2, maxLevel: 2 })
    expect(toc).toBe('- [B](#b)\n- [D](#d)')
  })

  it('rebases indentation when document starts at h2', () => {
    const toc = buildToc(extractHeadings('## A\n### B'))
    // 最浅层是 h2，应归零，不留空缩进
    expect(toc).toBe('- [A](#a)\n  - [B](#b)')
  })

  it('empty when no headings in range', () => {
    expect(buildToc(extractHeadings('# A'), { minLevel: 3 })).toBe('')
  })
})
