/** 颜色格式互转核心：culori 处理所有矩阵转换，自己负责字符串格式化和 WCAG / P3 判定。 */
import {
  formatHex,
  formatHex8,
  inGamut,
  parse,
  type Color,
  wcagContrast,
} from 'culori'
import {
  converter,
  rgb,
  hsl,
  hwb,
  lab,
  lch,
  oklab,
  oklch,
} from 'culori'

export type ColorFormat = 'hex' | 'rgb' | 'hsl' | 'hwb' | 'lab' | 'lch' | 'oklch' | 'oklab' | 'named'

export type ParseResult =
  | { ok: true; color: Color; alpha: number }
  | { ok: false; message: string }

/** 解析任意 CSS 颜色字符串。包名 + 转换都通过 culori。 */
export function parseColor(input: string): ParseResult {
  const trimmed = input.trim()
  if (!trimmed) return { ok: false, message: 'empty' }
  try {
    const c = parse(trimmed)
    if (!c) return { ok: false, message: 'cannot_parse' }
    return { ok: true, color: c, alpha: c.alpha ?? 1 }
  } catch (e) {
    return { ok: false, message: (e as Error).message ?? 'parse_error' }
  }
}

function n(v: number | undefined, digits = 2): string {
  if (v == null || Number.isNaN(v)) return '0'
  const r = Math.round(v * Math.pow(10, digits)) / Math.pow(10, digits)
  return String(r)
}

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v))
}

/** —— 字符串格式化 —— */

export function toHex(color: Color): string {
  const a = color.alpha ?? 1
  return a < 1 ? formatHex8(color) ?? '#000000ff' : formatHex(color) ?? '#000000'
}

export function toRgb(color: Color): string {
  const c = converter('rgb')(color)
  const r = Math.round(clamp01(c.r) * 255)
  const g = Math.round(clamp01(c.g) * 255)
  const b = Math.round(clamp01(c.b) * 255)
  const a = c.alpha ?? 1
  return a < 1 ? `rgb(${r} ${g} ${b} / ${n(a, 3)})` : `rgb(${r} ${g} ${b})`
}

export function toHsl(color: Color): string {
  const c = converter('hsl')(color)
  const h = n(c.h ?? 0, 1)
  const s = n((c.s ?? 0) * 100, 1)
  const l = n((c.l ?? 0) * 100, 1)
  const a = c.alpha ?? 1
  return a < 1 ? `hsl(${h} ${s}% ${l}% / ${n(a, 3)})` : `hsl(${h} ${s}% ${l}%)`
}

export function toHwb(color: Color): string {
  const c = converter('hwb')(color)
  const h = n(c.h ?? 0, 1)
  const w = n((c.w ?? 0) * 100, 1)
  const b = n((c.b ?? 0) * 100, 1)
  const a = c.alpha ?? 1
  return a < 1 ? `hwb(${h} ${w}% ${b}% / ${n(a, 3)})` : `hwb(${h} ${w}% ${b}%)`
}

export function toLab(color: Color): string {
  const c = converter('lab')(color)
  const l = n(c.l ?? 0, 2)
  const a = n(c.a ?? 0, 2)
  const b = n(c.b ?? 0, 2)
  const alpha = c.alpha ?? 1
  return alpha < 1 ? `lab(${l} ${a} ${b} / ${n(alpha, 3)})` : `lab(${l} ${a} ${b})`
}

export function toLch(color: Color): string {
  const c = converter('lch')(color)
  const l = n(c.l ?? 0, 2)
  const cc = n(c.c ?? 0, 2)
  const h = n(c.h ?? 0, 1)
  const alpha = c.alpha ?? 1
  return alpha < 1 ? `lch(${l} ${cc} ${h} / ${n(alpha, 3)})` : `lch(${l} ${cc} ${h})`
}

export function toOklch(color: Color): string {
  const c = converter('oklch')(color)
  const l = n((c.l ?? 0), 4)
  const cc = n(c.c ?? 0, 4)
  const h = n(c.h ?? 0, 1)
  const alpha = c.alpha ?? 1
  return alpha < 1 ? `oklch(${l} ${cc} ${h} / ${n(alpha, 3)})` : `oklch(${l} ${cc} ${h})`
}

export function toOklab(color: Color): string {
  const c = converter('oklab')(color)
  const l = n(c.l ?? 0, 4)
  const a = n(c.a ?? 0, 4)
  const b = n(c.b ?? 0, 4)
  const alpha = c.alpha ?? 1
  return alpha < 1 ? `oklab(${l} ${a} ${b} / ${n(alpha, 3)})` : `oklab(${l} ${a} ${b})`
}

/** 所有可用格式 → 字符串集合。 */
export function formatAll(color: Color): Record<Exclude<ColorFormat, 'named'>, string> {
  return {
    hex: toHex(color),
    rgb: toRgb(color),
    hsl: toHsl(color),
    hwb: toHwb(color),
    lab: toLab(color),
    lch: toLch(color),
    oklch: toOklch(color),
    oklab: toOklab(color),
  }
}

/** —— 色域判定 —— */

export function isInSrgbGamut(color: Color): boolean {
  return inGamut('rgb')(color)
}

export function isInP3Gamut(color: Color): boolean {
  return inGamut('p3')(color)
}

/** —— WCAG —— */

/** 返回 WCAG 对比度（4.5 ≥ AA、7 ≥ AAA）。 */
export function contrast(c1: Color, c2: Color): number {
  return wcagContrast(c1, c2)
}

export type ContrastVerdict = 'AAA' | 'AA' | 'AA-large' | 'fail'

export function verdict(ratio: number): ContrastVerdict {
  if (ratio >= 7) return 'AAA'
  if (ratio >= 4.5) return 'AA'
  if (ratio >= 3) return 'AA-large'
  return 'fail'
}

/** 给定颜色，分别返回对纯白和纯黑的对比度与判定。 */
export function contrastHints(color: Color): {
  vsWhite: { ratio: number; verdict: ContrastVerdict }
  vsBlack: { ratio: number; verdict: ContrastVerdict }
} {
  const white = rgb({ mode: 'rgb', r: 1, g: 1, b: 1 })
  const black = rgb({ mode: 'rgb', r: 0, g: 0, b: 0 })
  const rw = contrast(color, white)
  const rb = contrast(color, black)
  return {
    vsWhite: { ratio: Math.round(rw * 100) / 100, verdict: verdict(rw) },
    vsBlack: { ratio: Math.round(rb * 100) / 100, verdict: verdict(rb) },
  }
}

/** 试探：是否能直接以 named color 还原（exact rgb match）。 */
const NAMED_COLORS_PARTIAL: Record<string, string> = {
  black: '#000000', white: '#ffffff', red: '#ff0000', green: '#008000', lime: '#00ff00',
  blue: '#0000ff', yellow: '#ffff00', cyan: '#00ffff', magenta: '#ff00ff',
  gray: '#808080', silver: '#c0c0c0', maroon: '#800000', olive: '#808000',
  purple: '#800080', teal: '#008080', navy: '#000080', orange: '#ffa500',
  pink: '#ffc0cb', gold: '#ffd700', indigo: '#4b0082', violet: '#ee82ee',
  brown: '#a52a2a', tan: '#d2b48c', salmon: '#fa8072', coral: '#ff7f50',
  tomato: '#ff6347', khaki: '#f0e68c', plum: '#dda0dd', orchid: '#da70d6',
  beige: '#f5f5dc', ivory: '#fffff0', azure: '#f0ffff',
}

export function tryNamedColor(color: Color): string | null {
  const hex = toHex(color).toLowerCase()
  // 去掉 alpha
  const base = hex.length > 7 ? hex.slice(0, 7) : hex
  for (const [name, value] of Object.entries(NAMED_COLORS_PARTIAL)) {
    if (value === base) return name
  }
  return null
}

/** 用 HSL 滑块控制颜色的辅助：从 HSL → Color。 */
export function fromHsl(h: number, s: number, l: number, alpha = 1): Color {
  return hsl({ mode: 'hsl', h, s, l, alpha })
}

export const __helpers = { rgb, hsl, hwb, lab, lch, oklab, oklch }
