import { describe, it, expect } from 'vitest'
import { nextQuality } from '../lib/quality-search'

describe('nextQuality', () => {
  it('narrows the upper bound when the result is too large', () => {
    const step = nextQuality(0, 1, 0.5, 200_000, 100_000)
    expect(step.low).toBe(0)
    expect(step.high).toBe(0.5)
    expect(step.quality).toBeCloseTo(0.25)
  })

  it('raises the lower bound when the result fits within target', () => {
    const step = nextQuality(0, 1, 0.5, 80_000, 100_000)
    expect(step.low).toBe(0.5)
    expect(step.high).toBe(1)
    expect(step.quality).toBeCloseTo(0.75)
  })

  it('treats an exact match as fitting within target', () => {
    const step = nextQuality(0, 1, 0.5, 100_000, 100_000)
    expect(step.low).toBe(0.5)
  })

  it('reports done once the interval narrows below the convergence threshold', () => {
    const step = nextQuality(0.501, 0.51, 0.505, 90_000, 100_000)
    expect(step.done).toBe(true)
  })

  it('is not done while the interval is still wide', () => {
    const step = nextQuality(0, 1, 0.5, 90_000, 100_000)
    expect(step.done).toBe(false)
  })

  it('converges to a stable quality after repeated steps', () => {
    // 模拟一个单调的编码器：size(quality) = quality * 200_000
    let low = 0
    let high = 1
    let quality = 0.5
    let lastStep
    for (let i = 0; i < 20; i++) {
      const resultSize = quality * 200_000
      lastStep = nextQuality(low, high, quality, resultSize, 100_000)
      low = lastStep.low
      high = lastStep.high
      quality = lastStep.quality
      if (lastStep.done) break
    }
    expect(quality).toBeCloseTo(0.5, 1)
  })
})
