import { describe, it, expect, beforeEach } from 'vitest'
import {
  addEntry,
  applyStrategy,
  capacityHint,
  CAP_OPTIONS,
  clearAll,
  DEFAULT_SETTINGS,
  readHistory,
  readSettings,
  removeEntry,
  writeHistory,
  writeSettings,
  type HistoryEntry,
} from './history'

beforeEach(() => {
  window.localStorage.clear()
})

const sample = (overrides: Partial<HistoryEntry> = {}): HistoryEntry => ({
  id: 'x',
  ts: 1,
  providerId: 'openai',
  source: 'en',
  target: 'zh',
  input: 'hello',
  output: '你好',
  ...overrides,
})

describe('readHistory / writeHistory', () => {
  it('returns empty array by default', () => {
    expect(readHistory()).toEqual([])
  })
  it('roundtrips with localStorage', () => {
    writeHistory([sample()])
    expect(readHistory()).toHaveLength(1)
  })
})

describe('settings', () => {
  it('falls back to DEFAULT_SETTINGS when unset', () => {
    expect(readSettings()).toEqual(DEFAULT_SETTINGS)
  })
  it('rejects out-of-range cap values', () => {
    writeSettings({ strategy: 'cap', cap: 7 as unknown as 20 })
    expect(readSettings().cap).toBe(DEFAULT_SETTINGS.cap)
  })
  it('accepts well-known cap options', () => {
    for (const c of CAP_OPTIONS) {
      writeSettings({ strategy: 'cap', cap: c })
      expect(readSettings().cap).toBe(c)
    }
  })
  it('accepts manual strategy', () => {
    writeSettings({ strategy: 'manual', cap: 50 })
    expect(readSettings().strategy).toBe('manual')
  })
})

describe('addEntry', () => {
  it('prepends the new entry and assigns id+ts', () => {
    const next = addEntry([], { providerId: 'openai', source: 'en', target: 'zh', input: 'hi', output: 'hi-out' })
    expect(next).toHaveLength(1)
    expect(next[0].id).toMatch(/^h/)
    expect(next[0].ts).toBeGreaterThan(0)
  })
  it('ignores empty input or empty output', () => {
    expect(addEntry([], { providerId: 'openai', source: 'en', target: 'zh', input: '   ', output: 'x' })).toEqual([])
    expect(addEntry([], { providerId: 'openai', source: 'en', target: 'zh', input: 'x', output: '   ' })).toEqual([])
  })
  it('dedupes against the most recent identical entry', () => {
    const first = addEntry([], { providerId: 'openai', source: 'en', target: 'zh', input: 'hi', output: 'hi-out' })
    const second = addEntry(first, { providerId: 'openai', source: 'en', target: 'zh', input: 'hi', output: 'hi-out' })
    expect(second).toHaveLength(1)
  })
  it('applies cap strategy on overflow', () => {
    let cur: HistoryEntry[] = []
    for (let i = 0; i < 5; i++) {
      cur = addEntry(cur, { providerId: 'openai', source: 'en', target: 'zh', input: `i${i}`, output: `o${i}` }, { strategy: 'cap', cap: 3 })
    }
    expect(cur).toHaveLength(3)
    expect(cur[0].input).toBe('i4') // newest first
    expect(cur[2].input).toBe('i2') // oldest kept
  })
  it('manual strategy does not drop', () => {
    let cur: HistoryEntry[] = []
    for (let i = 0; i < 5; i++) {
      cur = addEntry(cur, { providerId: 'openai', source: 'en', target: 'zh', input: `i${i}`, output: `o${i}` }, { strategy: 'manual', cap: 3 })
    }
    expect(cur).toHaveLength(5)
  })
})

describe('removeEntry / clearAll', () => {
  it('removeEntry filters by id', () => {
    const e1 = sample({ id: 'a' })
    const e2 = sample({ id: 'b' })
    expect(removeEntry([e1, e2], 'a').map((e) => e.id)).toEqual(['b'])
  })
  it('clearAll returns []', () => {
    expect(clearAll()).toEqual([])
  })
})

describe('applyStrategy', () => {
  it('cap trims to cap (newest first)', () => {
    const entries = Array.from({ length: 10 }, (_, i) => sample({ id: String(i), ts: i }))
    const out = applyStrategy(entries, { strategy: 'cap', cap: 3 })
    expect(out).toHaveLength(3)
    expect(out.map((e) => e.id)).toEqual(['0', '1', '2'])
  })
  it('manual is a no-op', () => {
    const entries = Array.from({ length: 10 }, (_, i) => sample({ id: String(i) }))
    expect(applyStrategy(entries, { strategy: 'manual', cap: 3 })).toHaveLength(10)
  })
})

describe('capacityHint', () => {
  it('cap mode reports nearLimit at 90%', () => {
    const entries = Array.from({ length: 45 }, (_, i) => sample({ id: String(i) }))
    expect(capacityHint(entries, { strategy: 'cap', cap: 50 }).nearLimit).toBe(true)
  })
  it('cap mode below 90% is not near limit', () => {
    const entries = Array.from({ length: 10 }, (_, i) => sample({ id: String(i) }))
    expect(capacityHint(entries, { strategy: 'cap', cap: 50 }).nearLimit).toBe(false)
  })
  it('manual mode returns cap=null', () => {
    expect(capacityHint([], { strategy: 'manual', cap: 50 }).cap).toBeNull()
  })
})
