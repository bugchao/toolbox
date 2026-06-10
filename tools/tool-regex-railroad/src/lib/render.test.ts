import { describe, it, expect } from 'vitest'
import { parsePattern } from './parse'
import { toIr } from './ir'
import { renderSvg } from './render'

function svg(pattern: string, flags = ''): string {
  const r = parsePattern(pattern, flags)
  if (!r.ok) throw new Error(r.message)
  return renderSvg(toIr(r.ast))
}

describe('renderSvg', () => {
  it('returns a valid SVG root element', () => {
    const s = svg('a')
    expect(s.startsWith('<svg ')).toBe(true)
    expect(s.endsWith('</svg>')).toBe(true)
    expect(s).toContain('xmlns="http://www.w3.org/2000/svg"')
  })

  it('encodes the literal text inside a <text>', () => {
    const s = svg('abc')
    expect(s).toContain('>a<')
    expect(s).toContain('>b<')
    expect(s).toContain('>c<')
  })

  it('renders character class label without HTML escaping of brackets', () => {
    const s = svg('[a-z]')
    expect(s).toContain('[a-z]')
    // [ ] 不在 escapeXml 名单里，应原样保留
    expect(s).not.toContain('&lbrack;')
  })

  it('renders alternation as multiple <text> nodes for each branch', () => {
    const s = svg('a|b')
    const texts = s.match(/>a</g) ?? []
    expect(texts.length).toBeGreaterThanOrEqual(1)
    expect(s).toContain('>b<')
  })

  it('renders quantifier loop with star suffix tag', () => {
    expect(svg('a*')).toContain('*')
  })

  it('renders ranged quantifier tag', () => {
    expect(svg('a{2,4}')).toContain('{2,4}')
  })

  it('renders group with capturing label', () => {
    expect(svg('(a)')).toContain('(…)')
  })

  it('renders named group with its name', () => {
    expect(svg('(?<x>a)')).toContain('(?&lt;x&gt;)')
  })

  it('renders non-capturing group prefix', () => {
    expect(svg('(?:a)')).toContain('(?:…)')
  })
})
