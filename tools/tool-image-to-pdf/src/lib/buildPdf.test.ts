import { describe, it, expect } from 'vitest'
import { __testing } from './buildPdf'

const { rotatedDims } = __testing

function fakeItem(naturalWidth: number, naturalHeight: number, rotation: number) {
  return {
    id: 'x',
    file: new File([], 'x.jpg', { type: 'image/jpeg' }),
    rotation,
    naturalWidth,
    naturalHeight,
  }
}

describe('rotatedDims', () => {
  it('keeps dims at 0°', () => {
    expect(rotatedDims(fakeItem(100, 50, 0))).toEqual({ width: 100, height: 50 })
  })

  it('swaps at 90°', () => {
    expect(rotatedDims(fakeItem(100, 50, 90))).toEqual({ width: 50, height: 100 })
  })

  it('keeps at 180°', () => {
    expect(rotatedDims(fakeItem(100, 50, 180))).toEqual({ width: 100, height: 50 })
  })

  it('swaps at 270° and negative values', () => {
    expect(rotatedDims(fakeItem(100, 50, 270))).toEqual({ width: 50, height: 100 })
    expect(rotatedDims(fakeItem(100, 50, -90))).toEqual({ width: 50, height: 100 })
  })
})
