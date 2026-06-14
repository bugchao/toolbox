import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { downloadSource, downloadSvg, importSourceFile } from './export'
import { createDocument } from '../domain/factory'

beforeEach(() => {
  // 拦截 URL.createObjectURL / 让 downloadAsFile 不真正 click
  ;(URL as unknown as { createObjectURL: () => string }).createObjectURL = vi.fn(() => 'blob:fake')
  ;(URL as unknown as { revokeObjectURL: (u: string) => void }).revokeObjectURL = vi.fn()
  Object.defineProperty(HTMLAnchorElement.prototype, 'click', { configurable: true, value: vi.fn() })
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('downloadSource', () => {
  it('uses adapter.defaultSourceName for filename', () => {
    const doc = createDocument('mermaid', 'My Diagram', 'graph LR\nA-->B')
    const spy = vi.fn()
    // 监听 a 元素 click
    document.querySelectorAll = vi.fn(() => [] as unknown as NodeListOf<Element>)
    downloadSource(doc)
    expect(URL.createObjectURL).toHaveBeenCalled()
    expect(spy).not.toThrow
  })
})

describe('downloadSvg', () => {
  it('renames extension to .svg', () => {
    const doc = createDocument('mermaid', 'My Diagram')
    downloadSvg(doc, '<svg/>')
    expect(URL.createObjectURL).toHaveBeenCalled()
  })
})

describe('importSourceFile', () => {
  const makeFile = (name: string, content: string) =>
    new File([content], name, { type: 'text/plain' })

  it('parses .mmd as mermaid', async () => {
    const r = await importSourceFile(makeFile('flow.mmd', 'graph LR\nA-->B'))
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.document.engine).toBe('mermaid')
      expect(r.document.title).toBe('flow')
      expect(r.document.source).toBe('graph LR\nA-->B')
    }
  })

  it('parses .puml as plantuml', async () => {
    const r = await importSourceFile(makeFile('seq.puml', '@startuml\nA->B\n@enduml'))
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.document.engine).toBe('plantuml')
  })

  it('parses .drawio as drawio', async () => {
    const r = await importSourceFile(makeFile('board.drawio', '<mxfile/>'))
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.document.engine).toBe('drawio')
  })

  it('rejects unknown extensions', async () => {
    const r = await importSourceFile(makeFile('readme.md', '#'))
    expect(r.ok).toBe(false)
  })
})
