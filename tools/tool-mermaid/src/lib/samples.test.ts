import { describe, it, expect } from 'vitest'
import { SAMPLES, findSample } from './samples'

describe('samples', () => {
  it('exports at least 8 samples', () => {
    expect(SAMPLES.length).toBeGreaterThanOrEqual(8)
  })

  it('every sample has a unique id', () => {
    const ids = SAMPLES.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every sample has non-empty id / label / src', () => {
    for (const s of SAMPLES) {
      expect(s.id.length).toBeGreaterThan(0)
      expect(s.label.length).toBeGreaterThan(0)
      expect(s.src.trim().length).toBeGreaterThan(0)
    }
  })

  it('covers the required diagram kinds', () => {
    const keywords: Record<string, RegExp> = {
      flowchart: /flowchart\b/i,
      sequence: /sequenceDiagram\b/,
      class: /classDiagram\b/,
      state: /stateDiagram-v2\b/,
      er: /erDiagram\b/,
      gantt: /^gantt\b/m,
      pie: /\bpie\b/,
      mindmap: /^mindmap\b/m,
    }
    for (const [id, re] of Object.entries(keywords)) {
      const found = SAMPLES.find((s) => s.id === id)
      expect(found, `missing sample for ${id}`).toBeDefined()
      expect(re.test(found!.src), `${id} src should match ${re}`).toBe(true)
    }
  })

  it('findSample looks up by id', () => {
    expect(findSample('flowchart')?.id).toBe('flowchart')
    expect(findSample('nope-not-here')).toBeUndefined()
  })
})
