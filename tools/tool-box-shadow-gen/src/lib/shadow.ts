export type ShadowLayer = {
  id: string
  x: number
  y: number
  blur: number
  spread: number
  /** hex 颜色，如 "#000000"；不含 alpha */
  color: string
  /** 0..1 */
  alpha: number
  inset: boolean
}

function clamp01(n: number): number {
  if (Number.isNaN(n)) return 0
  if (n < 0) return 0
  if (n > 1) return 1
  return n
}

/** 解析 `#rgb` / `#rrggbb`，返回 `[r,g,b]` (0..255)，无效则返回 [0,0,0]。 */
export function hexToRgb(hex: string): [number, number, number] {
  if (typeof hex !== 'string') return [0, 0, 0]
  let h = hex.trim().replace(/^#/, '')
  if (h.length === 3) h = h.split('').map((c) => c + c).join('')
  if (h.length !== 6 || !/^[0-9a-fA-F]{6}$/.test(h)) return [0, 0, 0]
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return [r, g, b]
}

/** 合并 hex + alpha 为 rgba 字符串。alpha 用 3 位小数（去尾零）。 */
export function toRgba(hex: string, alpha: number): string {
  const [r, g, b] = hexToRgb(hex)
  const a = clamp01(alpha)
  const aStr = a === 1 ? '1' : a === 0 ? '0' : a.toFixed(3).replace(/\.?0+$/, '')
  return `rgba(${r}, ${g}, ${b}, ${aStr})`
}

/** 单层 → CSS 字符串：`[inset ]x y blur spread rgba(...)` */
export function layerToCss(layer: ShadowLayer): string {
  const prefix = layer.inset ? 'inset ' : ''
  const color = toRgba(layer.color, layer.alpha)
  return `${prefix}${layer.x}px ${layer.y}px ${layer.blur}px ${layer.spread}px ${color}`
}

/** 多层 → 完整 box-shadow value（逗号空格分隔）。 */
export function layersToCss(layers: ShadowLayer[]): string {
  if (layers.length === 0) return 'none'
  return layers.map(layerToCss).join(', ')
}

/** 多层 → Tailwind 任意值：`[box-shadow:value]`，内部空格被 `_` 替换。 */
export function layersToTailwind(layers: ShadowLayer[]): string {
  const value = layersToCss(layers)
  return `[box-shadow:${value.replace(/\s+/g, '_')}]`
}
