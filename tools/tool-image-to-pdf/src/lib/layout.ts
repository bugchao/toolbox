// 计算「每页 N 张」时，每个槽位的 box (mm)
// 并提供"等比 contain"算法把图片放进 box

export type Box = { x: number; y: number; w: number; h: number }

export type PerPage = 1 | 2 | 4

/**
 * 把页面（去除外边距后）切分成 perPage 个槽位。
 * - 1 张：整个可用区
 * - 2 张：上下两个等高，中间 gap
 * - 4 张：2×2 网格，行列间各一 gap
 */
export function slotBoxes(
  pageWidth: number,
  pageHeight: number,
  margin: number,
  perPage: PerPage,
  gap = 4,
): Box[] {
  const usableW = Math.max(0, pageWidth - margin * 2)
  const usableH = Math.max(0, pageHeight - margin * 2)
  const baseX = margin
  const baseY = margin

  if (perPage === 1) {
    return [{ x: baseX, y: baseY, w: usableW, h: usableH }]
  }
  if (perPage === 2) {
    const h = (usableH - gap) / 2
    return [
      { x: baseX, y: baseY, w: usableW, h },
      { x: baseX, y: baseY + h + gap, w: usableW, h },
    ]
  }
  // 4 张
  const w = (usableW - gap) / 2
  const h = (usableH - gap) / 2
  return [
    { x: baseX, y: baseY, w, h },
    { x: baseX + w + gap, y: baseY, w, h },
    { x: baseX, y: baseY + h + gap, w, h },
    { x: baseX + w + gap, y: baseY + h + gap, w, h },
  ]
}

/** 把 (imgW, imgH) 以"contain"方式放入 box，返回绘制坐标与尺寸 */
export function containFit(box: Box, imgW: number, imgH: number): Box {
  if (imgW <= 0 || imgH <= 0 || box.w <= 0 || box.h <= 0) return box
  const scale = Math.min(box.w / imgW, box.h / imgH)
  const w = imgW * scale
  const h = imgH * scale
  const x = box.x + (box.w - w) / 2
  const y = box.y + (box.h - h) / 2
  return { x, y, w, h }
}
