import type { EffectType, PixelBuffer } from './types'

interface EffectDefBase {
  min: number
  max: number
  step: number
  defaultValue: number
}

export interface FilterEffectDef extends EffectDefBase {
  kind: 'filter'
  toFilter: (value: number) => string
}

export interface PixelEffectDef extends EffectDefBase {
  kind: 'pixel'
  applyPixel: (buf: PixelBuffer, value: number) => void
}

export type EffectDef = FilterEffectDef | PixelEffectDef

function threshold(buf: PixelBuffer, value: number): void {
  const d = buf.data
  for (let i = 0; i < d.length; i += 4) {
    const lum = 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]
    const out = lum >= value ? 255 : 0
    d[i] = out
    d[i + 1] = out
    d[i + 2] = out
  }
}

function pixelate(buf: PixelBuffer, value: number): void {
  const size = Math.max(2, Math.floor(value))
  const { data, width, height } = buf
  for (let by = 0; by < height; by += size) {
    for (let bx = 0; bx < width; bx += size) {
      const yEnd = Math.min(by + size, height)
      const xEnd = Math.min(bx + size, width)
      let r = 0
      let g = 0
      let b = 0
      let a = 0
      let n = 0
      for (let y = by; y < yEnd; y++) {
        for (let x = bx; x < xEnd; x++) {
          const i = (y * width + x) * 4
          r += data[i]
          g += data[i + 1]
          b += data[i + 2]
          a += data[i + 3]
          n++
        }
      }
      r /= n
      g /= n
      b /= n
      a /= n
      for (let y = by; y < yEnd; y++) {
        for (let x = bx; x < xEnd; x++) {
          const i = (y * width + x) * 4
          data[i] = r
          data[i + 1] = g
          data[i + 2] = b
          data[i + 3] = a
        }
      }
    }
  }
}

export const EFFECTS: Record<EffectType, EffectDef> = {
  brightness: { kind: 'filter', min: 0, max: 200, step: 1, defaultValue: 100, toFilter: (v) => `brightness(${v}%)` },
  contrast: { kind: 'filter', min: 0, max: 200, step: 1, defaultValue: 100, toFilter: (v) => `contrast(${v}%)` },
  saturate: { kind: 'filter', min: 0, max: 200, step: 1, defaultValue: 100, toFilter: (v) => `saturate(${v}%)` },
  grayscale: { kind: 'filter', min: 0, max: 100, step: 1, defaultValue: 100, toFilter: (v) => `grayscale(${v}%)` },
  sepia: { kind: 'filter', min: 0, max: 100, step: 1, defaultValue: 100, toFilter: (v) => `sepia(${v}%)` },
  hueRotate: { kind: 'filter', min: 0, max: 360, step: 1, defaultValue: 90, toFilter: (v) => `hue-rotate(${v}deg)` },
  invert: { kind: 'filter', min: 0, max: 100, step: 1, defaultValue: 100, toFilter: (v) => `invert(${v}%)` },
  blur: { kind: 'filter', min: 0, max: 20, step: 0.5, defaultValue: 4, toFilter: (v) => `blur(${v}px)` },
  pixelate: { kind: 'pixel', min: 2, max: 64, step: 1, defaultValue: 8, applyPixel: pixelate },
  threshold: { kind: 'pixel', min: 0, max: 255, step: 1, defaultValue: 128, applyPixel: threshold },
}

export const EFFECT_TYPES = Object.keys(EFFECTS) as EffectType[]
