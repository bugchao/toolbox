import { describe, it, expect, beforeEach } from 'vitest'
import { loadProgress, recordBest, saveProgress } from './storage'

beforeEach(() => {
  window.localStorage.clear()
})

describe('storage', () => {
  it('returns empty progress when nothing stored', () => {
    const p = loadProgress()
    expect(p.v).toBe(1)
    expect(p.best).toEqual({})
  })

  it('round-trips progress', () => {
    saveProgress({ v: 1, best: { 'easy:1': 3 } })
    expect(loadProgress().best['easy:1']).toBe(3)
  })

  it('recordBest only updates when higher', () => {
    recordBest('easy:1', 2)
    recordBest('easy:1', 1) // 不应降级
    expect(loadProgress().best['easy:1']).toBe(2)
    recordBest('easy:1', 3)
    expect(loadProgress().best['easy:1']).toBe(3)
  })

  it('drops stored value with mismatched version', () => {
    window.localStorage.setItem(
      'toolbox.sudoku-kids.progress',
      JSON.stringify({ v: 99, best: { 'easy:1': 3 } }),
    )
    expect(loadProgress().best).toEqual({})
  })

  it('survives malformed JSON', () => {
    window.localStorage.setItem('toolbox.sudoku-kids.progress', 'not-json')
    expect(loadProgress().best).toEqual({})
  })
})
