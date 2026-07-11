import { describe, expect, it } from 'vitest'
import { EFFECTS, EFFECT_TYPES } from './effects'
import type { PixelBuffer } from './types'

function makeBuffer(width: number, height: number, fill?: (i: number) => number): PixelBuffer {
  const data = new Uint8ClampedArray(width * height * 4)
  for (let i = 0; i < data.length; i++) data[i] = fill ? fill(i) : 0
  return { data, width, height }
}

describe('EFFECTS', () => {
  it('包含全部 10 种效果，default 落在 [min, max] 内', () => {
    expect(EFFECT_TYPES).toHaveLength(10)
    for (const type of EFFECT_TYPES) {
      const def = EFFECTS[type]
      expect(def.defaultValue).toBeGreaterThanOrEqual(def.min)
      expect(def.defaultValue).toBeLessThanOrEqual(def.max)
    }
  })

  it('filter 类效果输出正确的 CSS filter 片段', () => {
    const cases: Array<[keyof typeof EFFECTS, number, string]> = [
      ['brightness', 120, 'brightness(120%)'],
      ['contrast', 80, 'contrast(80%)'],
      ['saturate', 150, 'saturate(150%)'],
      ['grayscale', 100, 'grayscale(100%)'],
      ['sepia', 60, 'sepia(60%)'],
      ['hueRotate', 90, 'hue-rotate(90deg)'],
      ['invert', 100, 'invert(100%)'],
      ['blur', 4.5, 'blur(4.5px)'],
    ]
    for (const [type, value, expected] of cases) {
      const def = EFFECTS[type]
      if (def.kind !== 'filter') throw new Error(`${type} should be filter kind`)
      expect(def.toFilter(value)).toBe(expected)
    }
  })

  it('threshold 将 RGB 二值化为 0/255，alpha 不变', () => {
    // 2x1：左像素暗（30），右像素亮（200），alpha 128
    const buf = makeBuffer(2, 1)
    buf.data.set([30, 30, 30, 128, 200, 200, 200, 128])
    const def = EFFECTS.threshold
    if (def.kind !== 'pixel') throw new Error('threshold should be pixel kind')
    def.applyPixel(buf, 128)
    expect(Array.from(buf.data)).toEqual([0, 0, 0, 128, 255, 255, 255, 128])
  })

  it('pixelate 使每个块内颜色一致（块平均）', () => {
    // 4x4，左半 0，右半 200 → 块大小 2 时每个 2x2 块取平均
    const buf = makeBuffer(4, 4, (i) => {
      const px = Math.floor(i / 4)
      const x = px % 4
      return i % 4 === 3 ? 255 : x < 2 ? 0 : 200
    })
    const def = EFFECTS.pixelate
    if (def.kind !== 'pixel') throw new Error('pixelate should be pixel kind')
    def.applyPixel(buf, 2)
    // 块 (0,0)-(1,1) 全 0；块 (2,0)-(3,1) 全 200
    const px = (x: number, y: number) => Array.from(buf.data.slice((y * 4 + x) * 4, (y * 4 + x) * 4 + 3))
    expect(px(0, 0)).toEqual(px(1, 1))
    expect(px(2, 0)).toEqual(px(3, 1))
    expect(px(0, 0)).toEqual([0, 0, 0])
    expect(px(2, 0)).toEqual([200, 200, 200])
  })
})
