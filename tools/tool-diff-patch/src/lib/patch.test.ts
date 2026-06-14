import { describe, it, expect } from 'vitest'
import { applyUnifiedPatch, classifyPatchLines, makePatch, patchStats } from './patch'

// 末尾带换行，避免 jsdiff 的 "no newline at end of file" 边界把末行算成重写
const OLD = `line one
line two
line three
line four
line five
`

const NEW = `line one
line 2
line three
line four
line five
line six
`

describe('makePatch', () => {
  it('returns empty string for identical inputs', () => {
    expect(makePatch('same', 'same')).toBe('')
  })

  it('produces a unified diff with @@ hunks', () => {
    const p = makePatch(OLD, NEW)
    expect(p).toContain('@@')
    expect(p).toContain('-line two')
    expect(p).toContain('+line 2')
    expect(p).toContain('+line six')
  })

  it('respects custom context size', () => {
    const p0 = makePatch(OLD, NEW, { context: 0 })
    const p3 = makePatch(OLD, NEW, { context: 3 })
    // context 0 不带未改动行，比 context 3 短
    expect(p0.length).toBeLessThan(p3.length)
  })

  it('uses custom file names in header', () => {
    const p = makePatch('a', 'b', { oldName: 'old.txt', newName: 'new.txt' })
    expect(p).toContain('old.txt')
    expect(p).toContain('new.txt')
  })
})

describe('applyUnifiedPatch', () => {
  it('round-trips: apply(make(old, new), old) === new', () => {
    const p = makePatch(OLD, NEW)
    const r = applyUnifiedPatch(OLD, p)
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.text).toBe(NEW)
  })

  it('fails with hunk_mismatch on wrong source', () => {
    const p = makePatch(OLD, NEW)
    const r = applyUnifiedPatch('totally different content', p)
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.message).toBe('hunk_mismatch')
  })

  it('rejects empty patch', () => {
    const r = applyUnifiedPatch(OLD, '  ')
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.message).toBe('empty_patch')
  })

  it('rejects garbage patch text', () => {
    const r = applyUnifiedPatch(OLD, 'not a patch at all')
    expect(r.ok).toBe(false)
  })
})

describe('patchStats', () => {
  it('counts additions / deletions / hunks', () => {
    const p = makePatch(OLD, NEW)
    const s = patchStats(p)
    expect(s).not.toBeNull()
    if (s) {
      expect(s.additions).toBe(2) // line 2 + line six
      expect(s.deletions).toBe(1) // line two
      expect(s.hunks).toBeGreaterThanOrEqual(1)
    }
  })

  it('returns null for empty / garbage', () => {
    expect(patchStats('')).toBeNull()
  })
})

describe('classifyPatchLines', () => {
  it('classifies meta / hunk / add / del / context', () => {
    const p = makePatch(OLD, NEW)
    const kinds = classifyPatchLines(p).map((l) => l.kind)
    expect(kinds).toContain('meta')
    expect(kinds).toContain('hunk')
    expect(kinds).toContain('add')
    expect(kinds).toContain('del')
    expect(kinds).toContain('context')
  })

  it('+++ / --- headers are meta, not add/del', () => {
    const lines = classifyPatchLines('--- a/file\n+++ b/file\n@@ -1 +1 @@\n-x\n+y')
    expect(lines[0].kind).toBe('meta')
    expect(lines[1].kind).toBe('meta')
    expect(lines[2].kind).toBe('hunk')
    expect(lines[3].kind).toBe('del')
    expect(lines[4].kind).toBe('add')
  })
})
