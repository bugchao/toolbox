export type EffectType =
  | 'brightness'
  | 'contrast'
  | 'saturate'
  | 'grayscale'
  | 'sepia'
  | 'hueRotate'
  | 'invert'
  | 'blur'
  | 'pixelate'
  | 'threshold'

export interface PipelineStep {
  id: string
  type: EffectType
  value: number
  enabled: boolean
}

/** canvas 无关的像素缓冲，便于 jsdom 下单测像素效果 */
export interface PixelBuffer {
  data: Uint8ClampedArray
  width: number
  height: number
}
