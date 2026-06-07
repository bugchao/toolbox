import { describe, it, expect } from 'vitest'
import { addCleanSuffix, replaceExtension } from './filename'

describe('addCleanSuffix', () => {
  it('inserts -clean before the extension for simple names', () => {
    expect(addCleanSuffix('foo.jpg')).toBe('foo-clean.jpg')
  })

  it('only acts on the last dot segment when there are multiple', () => {
    expect(addCleanSuffix('a.b.c.jpg')).toBe('a.b.c-clean.jpg')
  })

  it('handles PNG just like JPG', () => {
    expect(addCleanSuffix('photo.png')).toBe('photo-clean.png')
  })

  it('handles uncommon extensions (.mdx)', () => {
    expect(addCleanSuffix('readme.mdx')).toBe('readme-clean.mdx')
  })

  it('appends -clean when there is no extension', () => {
    expect(addCleanSuffix('noext')).toBe('noext-clean')
  })

  it('treats a leading dot as part of the base name', () => {
    expect(addCleanSuffix('.env')).toBe('.env-clean')
  })

  it('returns -clean for an empty string', () => {
    expect(addCleanSuffix('')).toBe('-clean')
  })
})

describe('replaceExtension', () => {
  it('replaces extension when one exists', () => {
    expect(replaceExtension('photo.heic', 'jpg')).toBe('photo.jpg')
  })

  it('accepts an extension that already has a dot', () => {
    expect(replaceExtension('photo.heic', '.jpg')).toBe('photo.jpg')
  })

  it('appends when no extension exists', () => {
    expect(replaceExtension('photo', 'jpg')).toBe('photo.jpg')
  })

  it('preserves leading dot file names', () => {
    expect(replaceExtension('.env', 'jpg')).toBe('.env.jpg')
  })
})
