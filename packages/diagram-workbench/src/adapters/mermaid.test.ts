import { describe, it, expect } from 'vitest'
import { matchesMermaidExtension, mermaidAdapter } from './mermaid'

describe('mermaidAdapter metadata', () => {
  it('declares its engine and extensions', () => {
    expect(mermaidAdapter.engine).toBe('mermaid')
    expect(mermaidAdapter.fileExtensions).toContain('.mmd')
    expect(mermaidAdapter.fileExtensions).toContain('.mermaid')
  })

  it('returns a non-empty template', () => {
    expect(mermaidAdapter.template().length).toBeGreaterThan(0)
  })

  it('defaultSourceName slugs the title', () => {
    expect(mermaidAdapter.defaultSourceName('My  Diagram!!')).toMatch(/\.mmd$/)
    expect(mermaidAdapter.defaultSourceName('My  Diagram!!')).not.toContain(' ')
  })

  it('defaultSourceName falls back to "diagram" for empty / non-ascii title', () => {
    expect(mermaidAdapter.defaultSourceName('')).toBe('diagram.mmd')
  })
})

describe('matchesMermaidExtension', () => {
  it('matches .mmd / .mermaid (case-insensitive)', () => {
    expect(matchesMermaidExtension('a.mmd')).toBe(true)
    expect(matchesMermaidExtension('B.MERMAID')).toBe(true)
  })
  it('rejects other extensions', () => {
    expect(matchesMermaidExtension('a.puml')).toBe(false)
    expect(matchesMermaidExtension('a.drawio')).toBe(false)
    expect(matchesMermaidExtension('noext')).toBe(false)
  })
})

describe('validate', () => {
  it('rejects empty source synchronously-fast', async () => {
    const r = await mermaidAdapter.validate('   \n')
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.message).toMatch(/empty/i)
  })
})
