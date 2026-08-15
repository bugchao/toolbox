import { describe, it, expect } from 'vitest'
import {
  sanitizeFilename,
  ensurePdfExt,
  buildCollectionFilename,
  buildSummaryFilename,
  resolveMergeFilename,
} from '../lib/filename'

describe('sanitizeFilename', () => {
  it('strips filesystem-illegal characters', () => {
    expect(sanitizeFilename('a/b\\c:d*e?f"g<h>i|j')).toBe('abcdefghij')
  })

  it('keeps spaces, hyphens and Chinese characters', () => {
    expect(sanitizeFilename('报告 2024-合并版')).toBe('报告 2024-合并版')
  })

  it('trims and caps length at 100 characters', () => {
    expect(sanitizeFilename('  spaced  ')).toBe('spaced')
    expect(sanitizeFilename('a'.repeat(200)).length).toBe(100)
  })
})

describe('ensurePdfExt', () => {
  it('appends .pdf when missing', () => {
    expect(ensurePdfExt('report')).toBe('report.pdf')
  })

  it('leaves an existing .pdf extension untouched (case-insensitive)', () => {
    expect(ensurePdfExt('report.pdf')).toBe('report.pdf')
    expect(ensurePdfExt('report.PDF')).toBe('report.PDF')
  })
})

describe('buildCollectionFilename', () => {
  it('names the file after the file count', () => {
    expect(buildCollectionFilename(3)).toBe('3个文件合集.pdf')
  })
})

describe('buildSummaryFilename', () => {
  it('joins up to 3 source file names', () => {
    expect(buildSummaryFilename(['a.pdf', 'b.pdf'])).toBe('a_b.pdf')
  })

  it('appends 等 when there are more than 3 files', () => {
    expect(buildSummaryFilename(['a.pdf', 'b.pdf', 'c.pdf', 'd.pdf'])).toBe('a_b_c等.pdf')
  })
})

describe('resolveMergeFilename', () => {
  const names = ['x.pdf', 'y.pdf']

  it('uses the collection strategy', () => {
    expect(resolveMergeFilename('collection', '', names)).toBe('2个文件合集.pdf')
  })

  it('uses the summary strategy', () => {
    expect(resolveMergeFilename('summary', '', names)).toBe('x_y.pdf')
  })

  it('uses a custom name and appends .pdf', () => {
    expect(resolveMergeFilename('custom', '我的合并文件', names)).toBe('我的合并文件.pdf')
  })

  it('falls back to a default name when custom input is empty', () => {
    expect(resolveMergeFilename('custom', '   ', names)).toBe('合并文件.pdf')
  })

  it('sanitizes illegal characters in a custom name', () => {
    expect(resolveMergeFilename('custom', 'a/b*c', names)).toBe('abc.pdf')
  })
})
