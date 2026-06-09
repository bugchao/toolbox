import { describe, it, expect } from 'vitest'
import { decodeWorkspace, encodeWorkspace } from './json'
import { createDefaultWorkspace, createDocument } from '../domain/factory'

describe('encodeWorkspace', () => {
  it('always emits schemaVersion=1', () => {
    const ws = createDefaultWorkspace()
    const json = JSON.parse(encodeWorkspace(ws))
    expect(json.schemaVersion).toBe(1)
  })

  it('emits documents with id/title/engine/source', () => {
    const ws = createDefaultWorkspace()
    const json = JSON.parse(encodeWorkspace(ws))
    expect(Array.isArray(json.documents)).toBe(true)
    const d = json.documents[0]
    expect(d.id).toBeDefined()
    expect(d.title).toBeDefined()
    expect(d.engine).toBe('mermaid')
    expect(d.source.length).toBeGreaterThan(0)
  })
})

describe('decodeWorkspace', () => {
  it('round-trips a default workspace', () => {
    const ws = createDefaultWorkspace()
    const r = decodeWorkspace(encodeWorkspace(ws))
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.workspace.id).toBe(ws.id)
      expect(r.workspace.documents).toHaveLength(1)
      expect(r.workspace.mainId).toBe(ws.mainId)
    }
  })

  it('rejects invalid JSON', () => {
    const r = decodeWorkspace('{nope}')
    expect(r.ok).toBe(false)
  })

  it('rejects unsupported schemaVersion', () => {
    const r = decodeWorkspace(JSON.stringify({ schemaVersion: 99, documents: [] }))
    expect(r.ok).toBe(false)
  })

  it('rejects non-object root', () => {
    expect(decodeWorkspace('[]').ok).toBe(false)
    expect(decodeWorkspace('null').ok).toBe(false)
  })

  it('skips malformed documents but keeps valid ones', () => {
    const goodDoc = createDocument('plantuml', 'OK')
    const payload = {
      schemaVersion: 1,
      id: 'ws_test',
      selectedId: goodDoc.id,
      mainId: goodDoc.id,
      createdAt: 1,
      updatedAt: 2,
      documents: [
        goodDoc,
        { title: 'missing engine', source: 'x' }, // skipped
        { engine: 'bogus', title: 't', source: 'x' }, // skipped
        null, // skipped
      ],
    }
    const r = decodeWorkspace(JSON.stringify(payload))
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.workspace.documents).toHaveLength(1)
  })

  it('fills missing selectedId/mainId fallbacks', () => {
    const doc = createDocument('mermaid', 'D')
    const r = decodeWorkspace(JSON.stringify({
      schemaVersion: 1,
      documents: [doc],
    }))
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.workspace.selectedId).toBe(doc.id)
      expect(r.workspace.mainId).toBeNull()
    }
  })

  it('rejects when no valid documents', () => {
    const r = decodeWorkspace(JSON.stringify({ schemaVersion: 1, documents: [] }))
    expect(r.ok).toBe(false)
  })
})
