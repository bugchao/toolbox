import { describe, it, expect } from 'vitest'
import { adapterFor, adapters, detectEngineByFilename } from './registry'

describe('adapter registry', () => {
  it('covers all three engines', () => {
    expect(Object.keys(adapters).sort()).toEqual(['drawio', 'mermaid', 'plantuml'])
  })

  it('each adapter reports the matching engine field', () => {
    for (const [engine, adapter] of Object.entries(adapters)) {
      expect(adapter.engine).toBe(engine)
    }
  })

  it('adapterFor returns the same instance as the registry entry', () => {
    expect(adapterFor('mermaid')).toBe(adapters.mermaid)
  })
})

describe('detectEngineByFilename', () => {
  it('recognizes mermaid extensions', () => {
    expect(detectEngineByFilename('flowchart.mmd')).toBe('mermaid')
    expect(detectEngineByFilename('a.mermaid')).toBe('mermaid')
  })
  it('recognizes plantuml extensions', () => {
    expect(detectEngineByFilename('seq.puml')).toBe('plantuml')
    expect(detectEngineByFilename('arch.plantuml')).toBe('plantuml')
  })
  it('recognizes drawio extensions', () => {
    expect(detectEngineByFilename('board.drawio')).toBe('drawio')
    expect(detectEngineByFilename('board.xml')).toBe('drawio')
  })
  it('returns null for unknown / extensionless', () => {
    expect(detectEngineByFilename('readme.md')).toBeNull()
    expect(detectEngineByFilename('noext')).toBeNull()
  })
  it('precedence: extensions are unique so first hit wins (deterministic)', () => {
    expect(detectEngineByFilename('a.MMD')).toBe('mermaid')
  })
})
