import { describe, it, expect } from 'vitest'
import { PRESETS, findPreset, type PresetId } from './presets'

describe('PRESETS', () => {
  it('all preset ids are unique', () => {
    const ids = PRESETS.map((p) => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every preset is a valid 4-tuple of finite numbers', () => {
    for (const p of PRESETS) {
      expect(p.value).toHaveLength(4)
      for (const n of p.value) {
        expect(typeof n).toBe('number')
        expect(Number.isFinite(n)).toBe(true)
      }
    }
  })

  it('every preset has an i18nKey starting with "preset."', () => {
    for (const p of PRESETS) {
      expect(p.i18nKey.startsWith('preset.')).toBe(true)
    }
  })

  it('linear preset is [0, 0, 1, 1]', () => {
    const linear = findPreset('linear')
    expect(linear).toBeDefined()
    expect(linear!.value).toEqual([0, 0, 1, 1])
  })

  it('CSS-spec presets match the official numbers', () => {
    expect(findPreset('ease')!.value).toEqual([0.25, 0.1, 0.25, 1])
    expect(findPreset('ease-in')!.value).toEqual([0.42, 0, 1, 1])
    expect(findPreset('ease-out')!.value).toEqual([0, 0, 0.58, 1])
    expect(findPreset('ease-in-out')!.value).toEqual([0.42, 0, 0.58, 1])
  })

  it('overshoot presets have y values outside [0, 1] to express bounce / back', () => {
    const back = findPreset('easeOutBack')!
    const bounce = findPreset('easeOutBounce')!
    // 至少有一个 y 分量超出 [0, 1]，体现 overshoot
    const overshoots = (v: readonly number[]) => v[1] < 0 || v[1] > 1 || v[3] < 0 || v[3] > 1
    expect(overshoots(back.value)).toBe(true)
    expect(overshoots(bounce.value)).toBe(true)
  })

  it('x components stay within [0, 1] (CSS spec)', () => {
    for (const p of PRESETS) {
      const [x1, , x2] = p.value
      expect(x1).toBeGreaterThanOrEqual(0)
      expect(x1).toBeLessThanOrEqual(1)
      expect(x2).toBeGreaterThanOrEqual(0)
      expect(x2).toBeLessThanOrEqual(1)
    }
  })

  it('findPreset returns undefined for unknown id', () => {
    expect(findPreset('not-a-preset' as unknown as PresetId)).toBeUndefined()
  })
})
