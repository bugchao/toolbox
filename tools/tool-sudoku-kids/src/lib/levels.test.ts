import { describe, it, expect } from 'vitest'
import {
  allLevels,
  getLevel,
  isUnlocked,
  levelsByDifficulty,
  makeLevelId,
  nextLevel,
  parseLevelId,
} from './levels'

describe('levels metadata', () => {
  it('has 30 levels total', () => {
    expect(allLevels()).toHaveLength(30)
  })

  it('groups 10 per difficulty', () => {
    expect(levelsByDifficulty('easy')).toHaveLength(10)
    expect(levelsByDifficulty('medium')).toHaveLength(10)
    expect(levelsByDifficulty('hard')).toHaveLength(10)
  })

  it('makeLevelId / parseLevelId roundtrip', () => {
    const id = makeLevelId('medium', 3)
    expect(parseLevelId(id)).toEqual({ difficulty: 'medium', index: 3 })
  })

  it('rejects invalid level ids', () => {
    expect(parseLevelId('foo:1')).toBeNull()
    expect(parseLevelId('easy:0')).toBeNull()
    expect(parseLevelId('easy:11')).toBeNull()
  })

  it('givens decrease across the difficulty', () => {
    const easy = levelsByDifficulty('easy')
    expect(easy[0].givens).toBeGreaterThan(easy[9].givens)
  })
})

describe('isUnlocked', () => {
  it('first level is unlocked by default', () => {
    expect(isUnlocked(getLevel('easy:1')!, {})).toBe(true)
  })

  it('subsequent level unlocks when previous has ≥1 star', () => {
    expect(isUnlocked(getLevel('easy:2')!, { 'easy:1': 1 })).toBe(true)
    expect(isUnlocked(getLevel('easy:2')!, { 'easy:1': 3 })).toBe(true)
  })

  it('subsequent level locked when previous unsolved', () => {
    expect(isUnlocked(getLevel('easy:2')!, {})).toBe(false)
    expect(isUnlocked(getLevel('easy:5')!, { 'easy:4': 0 })).toBe(false)
  })
})

describe('nextLevel', () => {
  it('advances within the same difficulty', () => {
    expect(nextLevel(getLevel('easy:3')!)?.id).toBe('easy:4')
  })

  it('crosses to next difficulty at index 10', () => {
    expect(nextLevel(getLevel('easy:10')!)?.id).toBe('medium:1')
    expect(nextLevel(getLevel('medium:10')!)?.id).toBe('hard:1')
  })

  it('returns null at the very last level', () => {
    expect(nextLevel(getLevel('hard:10')!)).toBeNull()
  })
})
