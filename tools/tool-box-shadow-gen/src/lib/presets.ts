import type { ShadowLayer } from './shadow'
import { createLayer } from './layers'

export type PresetId =
  | 'material-1'
  | 'material-2'
  | 'material-4'
  | 'material-8'
  | 'material-16'
  | 'neumorphism-light'
  | 'neumorphism-dark'
  | 'glassmorphism'

export type Preset = {
  id: PresetId
  /** 用于 UI 显示的 i18n key（不含 namespace） */
  i18nKey: string
  build: () => ShadowLayer[]
}

/** Material Design elevation（key shadow + ambient shadow 双层）。 */
function material(elevation: 1 | 2 | 4 | 8 | 16): ShadowLayer[] {
  const table: Record<number, [number, number, number, number]> = {
    1: [1, 1, 3, 2],
    2: [2, 3, 6, 4],
    4: [4, 6, 10, 6],
    8: [8, 12, 17, 5],
    16: [16, 24, 38, 15],
  }
  const [k1, k2, a1, a2] = table[elevation]
  return [
    createLayer({ x: 0, y: k1, blur: k2, spread: 0, color: '#000000', alpha: 0.2, inset: false }),
    createLayer({ x: 0, y: a1, blur: a2, spread: 0, color: '#000000', alpha: 0.14, inset: false }),
  ]
}

/** Neumorphism light：白底上「外凸」效果——左上白高光、右下灰阴影。 */
function neumorphismLight(): ShadowLayer[] {
  return [
    createLayer({ x: -8, y: -8, blur: 16, spread: 0, color: '#ffffff', alpha: 1, inset: false }),
    createLayer({ x: 8, y: 8, blur: 16, spread: 0, color: '#a3b1c6', alpha: 0.6, inset: false }),
  ]
}

/** Neumorphism dark：深色底上外凸——左上微亮、右下深阴影。 */
function neumorphismDark(): ShadowLayer[] {
  return [
    createLayer({ x: -6, y: -6, blur: 14, spread: 0, color: '#4a4a5a', alpha: 0.6, inset: false }),
    createLayer({ x: 6, y: 6, blur: 14, spread: 0, color: '#000000', alpha: 0.7, inset: false }),
  ]
}

/** Glassmorphism 子集：单层柔和投影，模拟玻璃悬浮感。 */
function glassmorphism(): ShadowLayer[] {
  return [
    createLayer({ x: 0, y: 8, blur: 32, spread: 0, color: '#000000', alpha: 0.12, inset: false }),
  ]
}

export const PRESETS: Preset[] = [
  { id: 'material-1', i18nKey: 'preset.material1', build: () => material(1) },
  { id: 'material-2', i18nKey: 'preset.material2', build: () => material(2) },
  { id: 'material-4', i18nKey: 'preset.material4', build: () => material(4) },
  { id: 'material-8', i18nKey: 'preset.material8', build: () => material(8) },
  { id: 'material-16', i18nKey: 'preset.material16', build: () => material(16) },
  { id: 'neumorphism-light', i18nKey: 'preset.neumorphismLight', build: neumorphismLight },
  { id: 'neumorphism-dark', i18nKey: 'preset.neumorphismDark', build: neumorphismDark },
  { id: 'glassmorphism', i18nKey: 'preset.glassmorphism', build: glassmorphism },
]
