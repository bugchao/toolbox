import { describe, it, expect } from 'vitest'
import { addEntry, deriveName, renameEntry, type HistoryEntry } from './history'

describe('addEntry', () => {
  it('ignores empty / whitespace-only source', () => {
    expect(addEntry([], '   ')).toEqual([])
  })

  it('dedupes consecutive identical source', () => {
    const list = addEntry([], 'flowchart LR')
    expect(addEntry(list, 'flowchart LR')).toBe(list)
  })

  it('prepends newest and caps at 20', () => {
    let list: HistoryEntry[] = []
    for (let i = 0; i < 25; i++) list = addEntry(list, `graph ${i}`)
    expect(list).toHaveLength(20)
    expect(list[0].src).toBe('graph 24')
  })

  it('auto-derives a name, overridable explicitly', () => {
    expect(addEntry([], 'gantt\n  title 项目计划')[0].name).toBe('项目计划')
    expect(addEntry([], 'flowchart LR', '我的图')[0].name).toBe('我的图')
  })
})

describe('deriveName', () => {
  it('prefers a title line over the first line', () => {
    expect(deriveName('pie title 销售占比\n  "A": 1')).toBe('销售占比')
    expect(deriveName('---\ntitle: My Flow\n---\nflowchart LR')).toBe('My Flow')
  })
  it('falls back to the first line', () => {
    expect(deriveName('flowchart LR\n  A-->B')).toBe('flowchart LR')
    expect(deriveName('   ')).toBe('未命名')
  })
})

describe('renameEntry', () => {
  it('renames by id; empty name falls back to auto-derived', () => {
    const list = addEntry([], 'flowchart LR')
    const id = list[0].id
    expect(renameEntry(list, id, ' 新名 ')[0].name).toBe('新名')
    expect(renameEntry(list, id, '   ')[0].name).toBe('flowchart LR')
  })
})
