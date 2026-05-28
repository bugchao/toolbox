// 标准纸张尺寸（mm，竖向）

export type PaperKey = 'a4' | 'letter' | 'legal' | 'a3' | 'a5' | 'fit'
export type Orientation = 'portrait' | 'landscape'

export const PAPER_MM: Record<Exclude<PaperKey, 'fit'>, [number, number]> = {
  a4: [210, 297],
  letter: [215.9, 279.4],
  legal: [215.9, 355.6],
  a3: [297, 420],
  a5: [148, 210],
}

/** 返回给定纸张 + 方向下的 (width, height) mm */
export function pageDimensions(
  paper: PaperKey,
  orientation: Orientation,
  fit?: { width: number; height: number },
): { width: number; height: number } {
  if (paper === 'fit') {
    if (!fit || fit.width <= 0 || fit.height <= 0) {
      // 退化为 A4 竖向
      const [w, h] = PAPER_MM.a4
      return orientation === 'portrait' ? { width: w, height: h } : { width: h, height: w }
    }
    // 以最长边 297mm 等比缩放，避免极端比例溢出
    const max = 297
    if (fit.width >= fit.height) {
      return { width: max, height: (max * fit.height) / fit.width }
    }
    return { width: (max * fit.width) / fit.height, height: max }
  }
  const [w, h] = PAPER_MM[paper]
  return orientation === 'portrait' ? { width: w, height: h } : { width: h, height: w }
}

export const MARGIN_MM: Record<'none' | 'small' | 'medium' | 'large', number> = {
  none: 0,
  small: 6,
  medium: 12,
  large: 20,
}

export type MarginKey = keyof typeof MARGIN_MM
