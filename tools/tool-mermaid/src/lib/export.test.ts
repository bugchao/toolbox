import { describe, it, expect } from 'vitest'
import {
  sanitizeSvgForExport,
  svgToBlob,
  derivePngFilename,
  deriveSvgFilename,
} from './export'

describe('svgToBlob', () => {
  it('returns a Blob with image/svg+xml type', () => {
    const blob = svgToBlob('<svg>x</svg>')
    expect(blob).toBeInstanceOf(Blob)
    expect(blob.type).toContain('image/svg+xml')
  })
})

describe('sanitizeSvgForExport', () => {
  it('adds xmlns when missing', () => {
    const out = sanitizeSvgForExport('<svg width="100"><g/></svg>')
    expect(out).toContain('xmlns="http://www.w3.org/2000/svg"')
    expect(out).toContain('width="100"')
  })

  it('keeps xmlns when present (no duplication)', () => {
    const input = '<svg xmlns="http://www.w3.org/2000/svg" width="10"></svg>'
    const out = sanitizeSvgForExport(input)
    const occurrences = out.match(/xmlns="http:\/\/www\.w3\.org\/2000\/svg"/g) || []
    expect(occurrences.length).toBe(1)
  })

  it('handles bare <svg> with no attrs', () => {
    const out = sanitizeSvgForExport('<svg></svg>')
    expect(out.startsWith('<svg xmlns="http://www.w3.org/2000/svg"')).toBe(true)
  })

  it('returns input unchanged when empty', () => {
    expect(sanitizeSvgForExport('')).toBe('')
  })
})

describe('derivePngFilename', () => {
  it('returns mermaid-<timestamp>.png style by default', () => {
    const name = derivePngFilename()
    expect(name).toMatch(/^mermaid-\d+\.png$/)
  })

  it('returns mermaid-<timestamp>.png for empty input', () => {
    expect(derivePngFilename('')).toMatch(/^mermaid-\d+\.png$/)
    expect(derivePngFilename(null)).toMatch(/^mermaid-\d+\.png$/)
  })

  it('replaces existing extension with .png', () => {
    expect(derivePngFilename('foo.svg')).toBe('foo.png')
    expect(derivePngFilename('foo.bar.svg')).toBe('foo.bar.png')
  })

  it('appends .png when no extension', () => {
    expect(derivePngFilename('foo')).toBe('foo.png')
  })
})

describe('deriveSvgFilename', () => {
  it('returns mermaid-<timestamp>.svg by default', () => {
    expect(deriveSvgFilename()).toMatch(/^mermaid-\d+\.svg$/)
  })

  it('replaces existing extension with .svg', () => {
    expect(deriveSvgFilename('foo.png')).toBe('foo.svg')
  })
})
