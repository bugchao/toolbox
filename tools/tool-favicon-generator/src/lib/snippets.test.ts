import { describe, it, expect } from 'vitest'
import { buildHtmlSnippet, buildWebManifest, buildWebManifestJson } from './snippets'

describe('buildHtmlSnippet', () => {
  const snippet = buildHtmlSnippet({ themeColor: '#101820' })

  it('includes the favicon.ico link', () => {
    expect(snippet).toContain('rel="icon" href="/favicon.ico"')
  })

  it('includes the 180x180 apple-touch-icon', () => {
    expect(snippet).toMatch(/apple-touch-icon[^>]*180x180[^>]*apple-touch-icon-180\.png/)
  })

  it('links to the webmanifest', () => {
    expect(snippet).toContain('<link rel="manifest" href="/site.webmanifest">')
  })

  it('embeds the theme color', () => {
    expect(snippet).toContain('#101820')
  })
})

describe('buildWebManifest', () => {
  it('includes 192 and 512 icons', () => {
    const m = buildWebManifest()
    const sizes = m.icons.map((i) => i.sizes)
    expect(sizes).toContain('192x192')
    expect(sizes).toContain('512x512')
  })

  it('uses purpose="any" by default', () => {
    const m = buildWebManifest()
    for (const ic of m.icons) {
      expect(ic.purpose).toBe('any')
    }
  })

  it('sets purpose="any maskable" when maskable is on', () => {
    const m = buildWebManifest({ maskable: true })
    for (const ic of m.icons) {
      expect(ic.purpose).toBe('any maskable')
    }
  })

  it('JSON is parseable and round-trips', () => {
    const json = buildWebManifestJson({ maskable: true, name: 'Acme' })
    const parsed = JSON.parse(json)
    expect(parsed.name).toBe('Acme')
    expect(parsed.icons).toHaveLength(2)
    expect(parsed.icons[0].purpose).toBe('any maskable')
  })
})
