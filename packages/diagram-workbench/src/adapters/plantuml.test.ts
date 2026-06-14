import { describe, it, expect, vi } from 'vitest'
import {
  __testing,
  buildPlantUmlUrl,
  encodePlantUml,
  matchesPlantUmlExtension,
  normalizeServerUrl,
  plantumlAdapter,
} from './plantuml'

describe('plantumlAdapter metadata', () => {
  it('declares engine + extensions', () => {
    expect(plantumlAdapter.engine).toBe('plantuml')
    expect(plantumlAdapter.fileExtensions).toContain('.puml')
    expect(plantumlAdapter.fileExtensions).toContain('.plantuml')
  })

  it('template is wrapped by @startuml/@enduml', () => {
    const t = plantumlAdapter.template()
    expect(/@startuml/i.test(t)).toBe(true)
    expect(/@enduml/i.test(t)).toBe(true)
  })

  it('defaultSourceName ends with .puml', () => {
    expect(plantumlAdapter.defaultSourceName('Sequence A')).toMatch(/\.puml$/)
    expect(plantumlAdapter.defaultSourceName('')).toBe('diagram.puml')
  })
})

describe('matchesPlantUmlExtension', () => {
  it('matches .puml / .plantuml case-insensitively', () => {
    expect(matchesPlantUmlExtension('a.puml')).toBe(true)
    expect(matchesPlantUmlExtension('B.PLANTUML')).toBe(true)
  })
  it('rejects other extensions', () => {
    expect(matchesPlantUmlExtension('a.mmd')).toBe(false)
    expect(matchesPlantUmlExtension('a.drawio')).toBe(false)
  })
})

describe('normalizeServerUrl', () => {
  it('falls back to localhost when blank', () => {
    expect(normalizeServerUrl(undefined)).toBe('http://localhost:8080/plantuml/')
    expect(normalizeServerUrl('   ')).toBe('http://localhost:8080/plantuml/')
  })
  it('adds trailing slash', () => {
    expect(normalizeServerUrl('https://uml.example.com/plantuml')).toBe('https://uml.example.com/plantuml/')
  })
  it('preserves existing trailing slash', () => {
    expect(normalizeServerUrl('https://x/y/')).toBe('https://x/y/')
  })
})

describe('encodePlantUml', () => {
  const SIMPLE = '@startuml\nAlice -> Bob: Hi\n@enduml'

  it('produces only alphabet characters', () => {
    const encoded = encodePlantUml(SIMPLE)
    expect(encoded.length).toBeGreaterThan(0)
    for (const ch of encoded) {
      expect(__testing.ALPHABET).toContain(ch)
    }
  })

  it('is deterministic (same source = same encoding)', () => {
    expect(encodePlantUml(SIMPLE)).toBe(encodePlantUml(SIMPLE))
  })

  it('differs across sources', () => {
    expect(encodePlantUml(SIMPLE)).not.toBe(encodePlantUml(SIMPLE + ' ; '))
  })
})

describe('encode64 byte triples', () => {
  it('encodes exactly 4 chars per 3 bytes', () => {
    const enc = __testing.encode64(new Uint8Array([0x00, 0x00, 0x00]))
    expect(enc).toBe('0000')
  })
  it('handles trailing 1-byte chunk (emits 2 chars)', () => {
    expect(__testing.encode64(new Uint8Array([0x00])).length).toBe(2)
  })
  it('handles trailing 2-byte chunk (emits 3 chars)', () => {
    expect(__testing.encode64(new Uint8Array([0x00, 0x00])).length).toBe(3)
  })
})

describe('buildPlantUmlUrl', () => {
  it('builds <server>/svg/<encoded>', () => {
    const url = buildPlantUmlUrl('@startuml\nA->B\n@enduml', 'svg', 'https://uml.example.com/plantuml/')
    expect(url.startsWith('https://uml.example.com/plantuml/svg/')).toBe(true)
    // 编码部分仅含合法 alphabet
    const payload = url.split('/svg/')[1]
    for (const ch of payload) expect(__testing.ALPHABET).toContain(ch)
  })

  it('supports png format', () => {
    expect(buildPlantUmlUrl('@startuml\nx\n@enduml', 'png', 'http://localhost/'))
      .toContain('/png/')
  })
})

describe('validate', () => {
  it('rejects empty source', async () => {
    expect((await plantumlAdapter.validate('')).ok).toBe(false)
    expect((await plantumlAdapter.validate('   ')).ok).toBe(false)
  })
  it('requires @startuml + @enduml', async () => {
    const a = await plantumlAdapter.validate('Alice -> Bob')
    expect(a.ok).toBe(false)
    const b = await plantumlAdapter.validate('@startuml\nAlice -> Bob')
    expect(b.ok).toBe(false)
  })
  it('passes well-formed source', async () => {
    expect((await plantumlAdapter.validate('@startuml\nA->B\n@enduml')).ok).toBe(true)
  })
})

describe('render with mocked fetch', () => {
  const SOURCE = '@startuml\nA -> B\n@enduml'

  it('builds URL with given format / server and returns svg on 200', async () => {
    const fetchFn = vi.fn(async (url: string | URL) => {
      const u = String(url)
      expect(u).toContain('https://uml.example.com/plantuml/svg/')
      return new Response('<svg xmlns="http://www.w3.org/2000/svg"></svg>', { status: 200 })
    })
    const r = await plantumlAdapter.render(SOURCE, {
      serverUrl: 'https://uml.example.com/plantuml/',
      fetchFn: fetchFn as unknown as typeof fetch,
    })
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.svg).toContain('<svg')
  })

  it('surfaces non-200 with status code', async () => {
    const fetchFn = vi.fn(async () => new Response('boom', { status: 500 }))
    const r = await plantumlAdapter.render(SOURCE, {
      serverUrl: 'http://localhost/',
      fetchFn: fetchFn as unknown as typeof fetch,
    })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.message).toMatch(/500/)
  })

  it('surfaces network failure', async () => {
    const fetchFn = vi.fn(async () => { throw new Error('ECONNREFUSED') })
    const r = await plantumlAdapter.render(SOURCE, {
      serverUrl: 'http://localhost/',
      fetchFn: fetchFn as unknown as typeof fetch,
    })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.message).toMatch(/Cannot reach/)
  })

  it('rejects when server returns non-SVG', async () => {
    const fetchFn = vi.fn(async () => new Response('<html>no</html>', { status: 200 }))
    const r = await plantumlAdapter.render(SOURCE, {
      serverUrl: 'http://localhost/',
      fetchFn: fetchFn as unknown as typeof fetch,
    })
    expect(r.ok).toBe(false)
  })

  it('skips fetch when source fails validation', async () => {
    const fetchFn = vi.fn()
    const r = await plantumlAdapter.render('not valid', { fetchFn: fetchFn as unknown as typeof fetch })
    expect(r.ok).toBe(false)
    expect(fetchFn).not.toHaveBeenCalled()
  })
})
