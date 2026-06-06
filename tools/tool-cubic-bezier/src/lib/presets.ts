/**
 * 预置缓动曲线。元组语义：[x1, y1, x2, y2]。
 *
 * - linear / ease / ease-in / ease-out / ease-in-out 与 CSS 关键字对齐
 * - easeInOutCubic / easeOutBack / easeInOutQuart / easeOutBounce
 *   是常见 JS easing 库的三次贝塞尔近似（bounce 无法精确表达，给出视觉接近的常用近似）。
 */
export type PresetId =
  | 'linear'
  | 'ease'
  | 'ease-in'
  | 'ease-out'
  | 'ease-in-out'
  | 'easeInOutCubic'
  | 'easeOutBack'
  | 'easeInOutQuart'
  | 'easeOutBounce'

export type Preset = {
  id: PresetId
  /** i18n key（不含 namespace），用于 UI 显示标签 */
  i18nKey: string
  /** [x1, y1, x2, y2] */
  value: readonly [number, number, number, number]
}

export const PRESETS: readonly Preset[] = [
  { id: 'linear', i18nKey: 'preset.linear', value: [0, 0, 1, 1] },
  { id: 'ease', i18nKey: 'preset.ease', value: [0.25, 0.1, 0.25, 1] },
  { id: 'ease-in', i18nKey: 'preset.easeIn', value: [0.42, 0, 1, 1] },
  { id: 'ease-out', i18nKey: 'preset.easeOut', value: [0, 0, 0.58, 1] },
  { id: 'ease-in-out', i18nKey: 'preset.easeInOut', value: [0.42, 0, 0.58, 1] },
  { id: 'easeInOutCubic', i18nKey: 'preset.easeInOutCubic', value: [0.645, 0.045, 0.355, 1] },
  { id: 'easeOutBack', i18nKey: 'preset.easeOutBack', value: [0.175, 0.885, 0.32, 1.275] },
  { id: 'easeInOutQuart', i18nKey: 'preset.easeInOutQuart', value: [0.77, 0, 0.175, 1] },
  // bounce 不可能精确单段三次贝塞尔表达，这里给的是常见近似（视觉上有"回弹"感）。
  { id: 'easeOutBounce', i18nKey: 'preset.easeOutBounce', value: [0.34, 1.56, 0.64, 1] },
] as const

export function findPreset(id: PresetId): Preset | undefined {
  return PRESETS.find((p) => p.id === id)
}
