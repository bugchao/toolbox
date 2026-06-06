import { clamp, clamp01, roundTo } from './clamp'

export type Point = { x: number; y: number }

/** 一组 cubic-bezier 的两个内部控制点 P1 / P2（P0 固定 (0,0)，P3 固定 (1,1)）。 */
export type ControlPoints = {
  p1: Point
  p2: Point
}

/** 控制点允许的范围：x 应在 [0, 1]（CSS 规范要求），y 允许 overshoot 到 [-0.5, 1.5]。 */
export const X_MIN = 0
export const X_MAX = 1
export const Y_MIN = -0.5
export const Y_MAX = 1.5

/**
 * 把任意 Point 规范化（x clamp 到 [0,1]、y clamp 到 [-0.5, 1.5]）。
 * NaN / Infinity 走 clamp 自带的 fallback。
 */
export function sanitizePoint(p: Point): Point {
  return {
    x: clamp(p.x, X_MIN, X_MAX),
    y: clamp(p.y, Y_MIN, Y_MAX),
  }
}

/**
 * 给定 t ∈ [0, 1] 与控制点 P1 / P2，计算曲线上对应的点。
 * B(t) = (1-t)^3 P0 + 3(1-t)^2 t P1 + 3(1-t) t^2 P2 + t^3 P3
 * 其中 P0 = (0,0)，P3 = (1,1)。
 *
 * 异常输入（NaN / Infinity）会被 clamp 到合理边界，绝不抛错。
 */
export function bezierAt(t: number, p1: Point, p2: Point): Point {
  const tt = clamp01(t)
  const sp1 = sanitizePoint(p1)
  const sp2 = sanitizePoint(p2)
  const u = 1 - tt
  const uu = u * u
  const uuu = uu * u
  const ttSq = tt * tt
  const ttt = ttSq * tt

  // P0=(0,0), P3=(1,1) → 0 项与 1 项可直接写常数
  const x = 3 * uu * tt * sp1.x + 3 * u * ttSq * sp2.x + ttt
  const y = 3 * uu * tt * sp1.y + 3 * u * ttSq * sp2.y + ttt
  return { x, y }
}

/**
 * 沿 t ∈ [0, 1] 均匀采样 samples+1 个点（含两端），返回坐标数组。
 * 用来给 SVG 画 polyline。
 */
export function sampleCurve(p1: Point, p2: Point, samples = 64): Point[] {
  const n = Math.max(2, Math.floor(samples))
  const pts: Point[] = []
  for (let i = 0; i <= n; i += 1) {
    pts.push(bezierAt(i / n, p1, p2))
  }
  return pts
}

/**
 * 输出标准 CSS：`cubic-bezier(x1, y1, x2, y2)`，精度 2 位小数。
 * 异常值自动 clamp，绝不输出 NaN 字符串。
 */
export function formatCss(p1: Point, p2: Point): string {
  const sp1 = sanitizePoint(p1)
  const sp2 = sanitizePoint(p2)
  const fmt = (n: number) => roundTo(n, 2).toFixed(2)
  return `cubic-bezier(${fmt(sp1.x)}, ${fmt(sp1.y)}, ${fmt(sp2.x)}, ${fmt(sp2.y)})`
}

/** 简便：把四元组转 ControlPoints。 */
export function toControlPoints(tuple: readonly [number, number, number, number]): ControlPoints {
  return { p1: { x: tuple[0], y: tuple[1] }, p2: { x: tuple[2], y: tuple[3] } }
}

/** 反向：ControlPoints 转四元组。 */
export function toTuple(cp: ControlPoints): [number, number, number, number] {
  return [cp.p1.x, cp.p1.y, cp.p2.x, cp.p2.y]
}
