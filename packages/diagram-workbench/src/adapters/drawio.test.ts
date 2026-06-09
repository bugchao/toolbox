import { describe, it, expect, vi } from 'vitest'
import {
  DEFAULT_ALLOWED_ORIGINS,
  DrawioMessageBus,
  drawioAdapter,
  isAllowedOrigin,
  matchesDrawioExtension,
  parseDrawioMessage,
} from './drawio'

describe('drawioAdapter metadata', () => {
  it('declares engine + extensions', () => {
    expect(drawioAdapter.engine).toBe('drawio')
    expect(drawioAdapter.fileExtensions).toContain('.drawio')
    expect(drawioAdapter.fileExtensions).toContain('.xml')
  })

  it('template is valid mxfile XML', () => {
    expect(drawioAdapter.template()).toContain('<mxfile')
  })

  it('defaultSourceName ends with .drawio', () => {
    expect(drawioAdapter.defaultSourceName('My Diagram')).toMatch(/\.drawio$/)
  })
})

describe('matchesDrawioExtension', () => {
  it('matches .drawio / .xml case-insensitively', () => {
    expect(matchesDrawioExtension('a.drawio')).toBe(true)
    expect(matchesDrawioExtension('A.XML')).toBe(true)
  })
  it('rejects others', () => {
    expect(matchesDrawioExtension('a.mmd')).toBe(false)
    expect(matchesDrawioExtension('a.puml')).toBe(false)
  })
})

describe('isAllowedOrigin', () => {
  it('uses embed.diagrams.net + app.diagrams.net by default', () => {
    expect(isAllowedOrigin('https://embed.diagrams.net')).toBe(true)
    expect(isAllowedOrigin('https://app.diagrams.net')).toBe(true)
  })

  it('rejects look-alikes', () => {
    expect(isAllowedOrigin('https://embed.diagrams.net.evil.com')).toBe(false)
    expect(isAllowedOrigin('http://embed.diagrams.net')).toBe(false) // http, not https
    expect(isAllowedOrigin('https://embed.diagrams.net/path')).toBe(false) // trailing path means full match fails
  })

  it('rejects empty', () => {
    expect(isAllowedOrigin('')).toBe(false)
  })

  it('accepts custom allowlist when provided', () => {
    expect(isAllowedOrigin('https://internal.example.com', ['https://internal.example.com'])).toBe(true)
    expect(isAllowedOrigin('https://internal.example.com', DEFAULT_ALLOWED_ORIGINS)).toBe(false)
  })
})

describe('parseDrawioMessage', () => {
  it('parses valid JSON events', () => {
    expect(parseDrawioMessage(JSON.stringify({ event: 'init' }))).toEqual({ event: 'init' })
    expect(parseDrawioMessage(JSON.stringify({ event: 'save', xml: '<a/>' })))
      .toEqual({ event: 'save', xml: '<a/>' })
  })

  it('ignores non-string payloads', () => {
    expect(parseDrawioMessage({ event: 'init' })).toBeNull()
    expect(parseDrawioMessage(null)).toBeNull()
    expect(parseDrawioMessage(42)).toBeNull()
  })

  it('ignores malformed JSON', () => {
    expect(parseDrawioMessage('{not json')).toBeNull()
  })

  it('ignores objects without event field', () => {
    expect(parseDrawioMessage(JSON.stringify({ foo: 'bar' }))).toBeNull()
  })
})

describe('validate', () => {
  it('rejects empty', async () => {
    expect((await drawioAdapter.validate('')).ok).toBe(false)
  })
  it('requires mxfile or mxGraphModel root tag', async () => {
    expect((await drawioAdapter.validate('<html></html>')).ok).toBe(false)
    expect((await drawioAdapter.validate('<mxfile></mxfile>')).ok).toBe(true)
    expect((await drawioAdapter.validate('<mxGraphModel></mxGraphModel>')).ok).toBe(true)
  })
})

describe('render', () => {
  it('always rejects — iframe handles rendering', async () => {
    const r = await drawioAdapter.render('<mxfile/>')
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.message).toMatch(/iframe/i)
  })
})

describe('DrawioMessageBus', () => {
  /** 构造一个最小 Window 模拟，仅支持 addEventListener / removeEventListener / dispatchEvent。 */
  function fakeWindow(): Window {
    const listeners = new Map<string, Set<(e: Event) => void>>()
    return {
      addEventListener: (type: string, l: (e: Event) => void) => {
        if (!listeners.has(type)) listeners.set(type, new Set())
        listeners.get(type)!.add(l)
      },
      removeEventListener: (type: string, l: (e: Event) => void) => {
        listeners.get(type)?.delete(l)
      },
      dispatchEvent: (e: Event) => {
        listeners.get(e.type)?.forEach((l) => l(e))
        return true
      },
    } as unknown as Window
  }

  function emitMessage(w: Window, origin: string, data: unknown) {
    const e = new MessageEvent('message', { origin, data })
    w.dispatchEvent(e)
  }

  it('passes through messages from allowed origin', () => {
    const w = fakeWindow()
    const onMessage = vi.fn()
    const bus = new DrawioMessageBus(w, { onMessage })
    emitMessage(w, 'https://embed.diagrams.net', JSON.stringify({ event: 'save', xml: '<a/>' }))
    expect(onMessage).toHaveBeenCalledWith({ event: 'save', xml: '<a/>' })
    bus.dispose()
  })

  it('rejects messages from disallowed origin', () => {
    const w = fakeWindow()
    const onMessage = vi.fn()
    const bus = new DrawioMessageBus(w, { onMessage })
    emitMessage(w, 'https://evil.com', JSON.stringify({ event: 'save', xml: '<a/>' }))
    expect(onMessage).not.toHaveBeenCalled()
    bus.dispose()
  })

  it('respects custom allowlist', () => {
    const w = fakeWindow()
    const onMessage = vi.fn()
    const bus = new DrawioMessageBus(w, {
      allowedOrigins: ['https://internal.example.com'],
      onMessage,
    })
    emitMessage(w, 'https://embed.diagrams.net', JSON.stringify({ event: 'init' }))
    expect(onMessage).not.toHaveBeenCalled()
    emitMessage(w, 'https://internal.example.com', JSON.stringify({ event: 'init' }))
    expect(onMessage).toHaveBeenCalledWith({ event: 'init' })
    bus.dispose()
  })

  it('dispose unhooks the listener', () => {
    const w = fakeWindow()
    const onMessage = vi.fn()
    const bus = new DrawioMessageBus(w, { onMessage })
    bus.dispose()
    emitMessage(w, 'https://embed.diagrams.net', JSON.stringify({ event: 'init' }))
    expect(onMessage).not.toHaveBeenCalled()
  })

  it('ignores malformed payloads from allowed origin', () => {
    const w = fakeWindow()
    const onMessage = vi.fn()
    new DrawioMessageBus(w, { onMessage })
    emitMessage(w, 'https://embed.diagrams.net', 'garbage{')
    emitMessage(w, 'https://embed.diagrams.net', JSON.stringify({ foo: 'bar' }))
    expect(onMessage).not.toHaveBeenCalled()
  })
})
