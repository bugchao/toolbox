import { describe, it, expect } from 'vitest'
import { canRename, diagramType, rangeOf, replaceFirst } from './preview-edit'

describe('diagramType / canRename', () => {
  it('normalizes graph to flowchart and detects rename-capable types', () => {
    expect(diagramType('graph LR\n A-->B')).toBe('flowchart')
    expect(diagramType('flowchart TD')).toBe('flowchart')
    expect(diagramType('sequenceDiagram')).toBe('sequencediagram')
    expect(canRename('flowchart LR\n A-->B')).toBe(true)
    expect(canRename('pie title X')).toBe(true)
    expect(canRename('gantt')).toBe(true)
    expect(canRename('zenuml')).toBe(false)
    expect(canRename('mindmap')).toBe(false)
  })
})

describe('replaceFirst', () => {
  it('replaces only the first occurrence', () => {
    expect(replaceFirst('A[开始] --> A2', '开始', '启动')).toBe('A[启动] --> A2')
    expect(replaceFirst('x x x', 'x', 'y')).toBe('y x x')
    expect(replaceFirst('abc', 'zzz', 'y')).toBe('abc')
    expect(replaceFirst('abc', 'a', 'a')).toBe('abc')
  })
})

describe('rangeOf', () => {
  it('returns offsets of first match or null', () => {
    expect(rangeOf('flowchart\n A[开始]', '开始')).toEqual([13, 15])
    expect(rangeOf('abc', 'zzz')).toBeNull()
  })
})
