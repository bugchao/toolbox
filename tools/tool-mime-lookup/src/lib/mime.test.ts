import { describe, it, expect } from 'vitest'
import { CATEGORIES, extToMime, MIME_TABLE, mimeToExt, search } from './mime'

describe('data integrity', () => {
  it('mime values are unique', () => {
    const m = MIME_TABLE.map((e) => e.mime)
    expect(new Set(m).size).toBe(m.length)
  })
  it('every entry has at least one ext and a valid category', () => {
    for (const e of MIME_TABLE) {
      expect(e.ext.length).toBeGreaterThan(0)
      expect(CATEGORIES).toContain(e.category)
    }
  })
  it('covers all six categories', () => {
    const present = new Set(MIME_TABLE.map((e) => e.category))
    for (const c of CATEGORIES) expect(present.has(c)).toBe(true)
  })
})

describe('extToMime', () => {
  it('plain extension', () => {
    expect(extToMime('png').mime).toBe('image/png')
    expect(extToMime('json').mime).toBe('application/json')
  })
  it('tolerates leading dot and filename', () => {
    expect(extToMime('.png').mime).toBe('image/png')
    expect(extToMime('photo.JPG').mime).toBe('image/jpeg')
    expect(extToMime('/path/to/archive.tar.gz').mime).toBe('application/gzip')
  })
  it('alias extension jpeg', () => {
    expect(extToMime('jpeg').mime).toBe('image/jpeg')
  })
  it('unknown → octet-stream + known=false', () => {
    const r = extToMime('xyzzy')
    expect(r.mime).toBe('application/octet-stream')
    expect(r.known).toBe(false)
  })
  it('empty → octet-stream', () => {
    expect(extToMime('').known).toBe(false)
  })
})

describe('mimeToExt', () => {
  it('returns extensions', () => {
    expect(mimeToExt('image/jpeg')).toEqual(['jpg', 'jpeg'])
    expect(mimeToExt('application/json')).toEqual(['json'])
  })
  it('tolerates parameters and case', () => {
    expect(mimeToExt('text/html; charset=utf-8')).toEqual(['html', 'htm'])
    expect(mimeToExt('IMAGE/PNG')).toEqual(['png'])
  })
  it('unknown → empty', () => {
    expect(mimeToExt('application/x-nope')).toEqual([])
  })
})

describe('search', () => {
  it('by mime substring', () => {
    const r = search('image/')
    expect(r.every((e) => e.category === 'image')).toBe(true)
  })
  it('by extension', () => {
    const r = search('mp4')
    expect(r.map((e) => e.mime)).toContain('video/mp4')
  })
  it('strips leading dot in query', () => {
    expect(search('.pdf').map((e) => e.mime)).toContain('application/pdf')
  })
  it('category filter', () => {
    const r = search('', 'font')
    expect(r.every((e) => e.category === 'font')).toBe(true)
    expect(r.length).toBeGreaterThan(0)
  })
  it('combined query + category', () => {
    const r = search('og', 'audio') // ogg
    expect(r.map((e) => e.mime)).toContain('audio/ogg')
    expect(r.every((e) => e.category === 'audio')).toBe(true)
  })
  it('empty query returns all', () => {
    expect(search('')).toHaveLength(MIME_TABLE.length)
  })
})
