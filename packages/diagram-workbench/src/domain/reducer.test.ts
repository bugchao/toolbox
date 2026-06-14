import { describe, it, expect } from 'vitest'
import { createDefaultWorkspace, createDocument } from './factory'
import { initialState, reduce } from './reducer'

const fresh = () => initialState(createDefaultWorkspace())

describe('SELECT', () => {
  it('switches selectedId', () => {
    const s = fresh()
    const extra = createDocument('plantuml', 'X')
    const withDoc = reduce(s, { type: 'IMPORT_DOCUMENT', document: extra })
    const next = reduce(withDoc, { type: 'SELECT', id: extra.id })
    expect(next.workspace.selectedId).toBe(extra.id)
  })

  it('ignores unknown ids', () => {
    const s = fresh()
    expect(reduce(s, { type: 'SELECT', id: 'nope' }).workspace.selectedId).toBe(s.workspace.selectedId)
  })
})

describe('CREATE', () => {
  it('adds doc, selects it, sets dirty', () => {
    const s = fresh()
    const n1 = reduce(s, { type: 'CREATE', engine: 'plantuml' })
    expect(n1.workspace.documents).toHaveLength(2)
    expect(n1.dirty).toBe(true)
    expect(n1.workspace.selectedId).toBe(n1.workspace.documents.at(-1)!.id)
  })

  it('keeps existing mainId when present', () => {
    const s = fresh()
    const mainBefore = s.workspace.mainId
    const n = reduce(s, { type: 'CREATE', engine: 'mermaid' })
    expect(n.workspace.mainId).toBe(mainBefore)
  })
})

describe('UPDATE_SOURCE / UPDATE_TITLE / UPDATE_SETTINGS', () => {
  it('source patches only target doc', () => {
    const s = fresh()
    const id = s.workspace.documents[0].id
    const next = reduce(s, { type: 'UPDATE_SOURCE', id, source: 'graph LR; A-->B' })
    expect(next.workspace.documents[0].source).toContain('A-->B')
    expect(next.workspace.documents[0].updatedAt).toBeGreaterThanOrEqual(s.workspace.documents[0].updatedAt)
  })

  it('title update marks dirty', () => {
    const s = fresh()
    const id = s.workspace.documents[0].id
    const next = reduce(s, { type: 'UPDATE_TITLE', id, title: 'Renamed' })
    expect(next.workspace.documents[0].title).toBe('Renamed')
    expect(next.dirty).toBe(true)
  })

  it('settings merge instead of overwrite', () => {
    const s = fresh()
    const id = s.workspace.documents[0].id
    const a = reduce(s, { type: 'UPDATE_SETTINGS', id, patch: { theme: 'dark' } })
    const b = reduce(a, { type: 'UPDATE_SETTINGS', id, patch: { background: '#fff' } })
    expect(b.workspace.documents[0].settings).toEqual({ theme: 'dark', background: '#fff' })
  })
})

describe('SET_MAIN / DELETE', () => {
  it('SET_MAIN updates mainId', () => {
    const s = fresh()
    const extra = createDocument('drawio', 'X')
    const withDoc = reduce(s, { type: 'IMPORT_DOCUMENT', document: extra })
    const next = reduce(withDoc, { type: 'SET_MAIN', id: extra.id })
    expect(next.workspace.mainId).toBe(extra.id)
  })

  it('SET_MAIN ignores unknown id', () => {
    const s = fresh()
    expect(reduce(s, { type: 'SET_MAIN', id: 'nope' }).workspace.mainId).toBe(s.workspace.mainId)
  })

  it('DELETE removes doc; reassigns selected/main fallback', () => {
    const s = fresh()
    const onlyId = s.workspace.documents[0].id
    const next = reduce(s, { type: 'DELETE', id: onlyId })
    expect(next.workspace.documents).toHaveLength(0)
    expect(next.workspace.selectedId).toBeNull()
    expect(next.workspace.mainId).toBeNull()
  })

  it('DELETE other doc keeps main intact', () => {
    const s = fresh()
    const extra = createDocument('plantuml', 'X')
    const withDoc = reduce(s, { type: 'IMPORT_DOCUMENT', document: extra })
    const next = reduce(withDoc, { type: 'DELETE', id: extra.id })
    expect(next.workspace.mainId).toBe(s.workspace.mainId)
  })
})

describe('IMPORT', () => {
  it('IMPORT_WORKSPACE replaces fully', () => {
    const s = fresh()
    const replacement = createDefaultWorkspace()
    const next = reduce(s, { type: 'IMPORT_WORKSPACE', workspace: replacement })
    expect(next.workspace.id).toBe(replacement.id)
    expect(next.dirty).toBe(true)
  })

  it('IMPORT_DOCUMENT appends and selects', () => {
    const s = fresh()
    const doc = createDocument('plantuml', 'Imported')
    const next = reduce(s, { type: 'IMPORT_DOCUMENT', document: doc })
    expect(next.workspace.documents).toHaveLength(2)
    expect(next.workspace.selectedId).toBe(doc.id)
  })
})

describe('SAVE lifecycle', () => {
  it('start → ok clears dirty', () => {
    const s0 = fresh()
    const s1 = reduce(s0, { type: 'UPDATE_TITLE', id: s0.workspace.documents[0].id, title: 'x' })
    expect(s1.dirty).toBe(true)
    const s2 = reduce(s1, { type: 'SAVE_START' })
    expect(s2.saveStatus).toBe('saving')
    const s3 = reduce(s2, { type: 'SAVE_OK' })
    expect(s3.saveStatus).toBe('saved')
    expect(s3.dirty).toBe(false)
  })

  it('start → fail keeps dirty', () => {
    const s = fresh()
    const dirty = reduce(s, { type: 'UPDATE_SOURCE', id: s.workspace.documents[0].id, source: 'x' })
    const failed = reduce(reduce(dirty, { type: 'SAVE_START' }), { type: 'SAVE_FAIL' })
    expect(failed.saveStatus).toBe('error')
    expect(failed.dirty).toBe(true)
  })
})
