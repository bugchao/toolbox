import { describe, it, expect } from 'vitest'
import { computeFit } from './ImageCompressor'

describe('computeFit (ImageCompressor resize)', () => {
  it('keeps size when no limits', () => {
    expect(computeFit(1920, 1080, 0, 0)).toEqual({ width: 1920, height: 1080 })
  })

  it('scales down by the tighter dimension, preserving aspect ratio', () => {
    expect(computeFit(2000, 1000, 1000, 0)).toEqual({ width: 1000, height: 500 })
    expect(computeFit(1000, 2000, 0, 1000)).toEqual({ width: 500, height: 1000 })
    // width allows 0.5x but height only 0.4x -> 0.4x wins
    expect(computeFit(2000, 1000, 1000, 400)).toEqual({ width: 800, height: 400 })
  })

  it('never upscales past the original', () => {
    expect(computeFit(500, 500, 4000, 4000)).toEqual({ width: 500, height: 500 })
  })

  it('clamps to at least 1px', () => {
    expect(computeFit(1000, 1, 10, 0)).toEqual({ width: 10, height: 1 })
  })
})
