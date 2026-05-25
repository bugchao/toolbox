// WCAG 2.x 对比度计算
// 参考：https://www.w3.org/TR/WCAG21/#contrast-minimum

export type Rgb = { r: number; g: number; b: number }

const HEX3 = /^#?([0-9a-f])([0-9a-f])([0-9a-f])$/i
const HEX6 = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i

export function parseHex(input: string): Rgb | null {
  const value = input.trim()
  const m6 = value.match(HEX6)
  if (m6) {
    return {
      r: parseInt(m6[1], 16),
      g: parseInt(m6[2], 16),
      b: parseInt(m6[3], 16),
    }
  }
  const m3 = value.match(HEX3)
  if (m3) {
    return {
      r: parseInt(m3[1] + m3[1], 16),
      g: parseInt(m3[2] + m3[2], 16),
      b: parseInt(m3[3] + m3[3], 16),
    }
  }
  return null
}

export function toHex({ r, g, b }: Rgb): string {
  const c = (n: number) =>
    Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0')
  return `#${c(r)}${c(g)}${c(b)}`
}

// sRGB → 相对亮度（WCAG 公式）
export function relativeLuminance({ r, g, b }: Rgb): number {
  const channel = (v: number) => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

export function contrastRatio(a: Rgb, b: Rgb): number {
  const la = relativeLuminance(a)
  const lb = relativeLuminance(b)
  const [lighter, darker] = la >= lb ? [la, lb] : [lb, la]
  return (lighter + 0.05) / (darker + 0.05)
}

export type WcagGrades = {
  aaNormal: boolean
  aaLarge: boolean
  aaaNormal: boolean
  aaaLarge: boolean
  aaUi: boolean // 非文本图形与 UI 组件 (≥ 3:1)
}

export function gradeContrast(ratio: number): WcagGrades {
  return {
    aaLarge: ratio >= 3,
    aaNormal: ratio >= 4.5,
    aaaLarge: ratio >= 4.5,
    aaaNormal: ratio >= 7,
    aaUi: ratio >= 3,
  }
}

// HSL <-> RGB（用于亮度调整以达标）
type Hsl = { h: number; s: number; l: number }

function rgbToHsl({ r, g, b }: Rgb): Hsl {
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const l = (max + min) / 2
  let h = 0
  let s = 0
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case rn:
        h = (gn - bn) / d + (gn < bn ? 6 : 0)
        break
      case gn:
        h = (bn - rn) / d + 2
        break
      case bn:
        h = (rn - gn) / d + 4
        break
    }
    h /= 6
  }
  return { h, s, l }
}

function hslToRgb({ h, s, l }: Hsl): Rgb {
  if (s === 0) {
    const v = Math.round(l * 255)
    return { r: v, g: v, b: v }
  }
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s
  const p = 2 * l - q
  return {
    r: Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, h) * 255),
    b: Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
  }
}

/**
 * 调整 foreground 的 HSL 亮度，使其与 background 达到目标对比度。
 * 朝远离 background 亮度的方向探索（前景比背景暗就更暗，反之更亮）。
 */
export function adjustForegroundToRatio(
  foreground: Rgb,
  background: Rgb,
  targetRatio: number,
): Rgb {
  const bgL = relativeLuminance(background)
  const fgHsl = rgbToHsl(foreground)
  // 决定方向：前景应该更暗还是更亮
  const goDarker = relativeLuminance(foreground) < bgL
  // 二分搜索 HSL.l
  let lo = goDarker ? 0 : fgHsl.l
  let hi = goDarker ? fgHsl.l : 1
  let best = foreground
  for (let i = 0; i < 30; i++) {
    const mid = (lo + hi) / 2
    const candidate = hslToRgb({ ...fgHsl, l: mid })
    const ratio = contrastRatio(candidate, background)
    if (ratio >= targetRatio) {
      best = candidate
      if (goDarker) lo = mid
      else hi = mid
    } else {
      if (goDarker) hi = mid
      else lo = mid
    }
  }
  return best
}
