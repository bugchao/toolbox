/**
 * CSS clamp() 流式排版计算核心
 *
 * 给定最小/最大视口宽度与对应的最小/最大尺寸，生成
 * clamp(min, preferred, max) 表达式，其中 preferred 为
 * 一条经过两个 (viewport, size) 点的直线，使用 rem 常量 + vw 斜率表达。
 *
 * slope     = (maxPx - minPx) / (maxVw - minVw)
 * intercept = minPx - minVw * slope            （视口为 0 时的尺寸，单位 px）
 * preferred = (intercept / root)rem + (slope * 100)vw
 */

export type LengthUnit = 'px' | 'rem'

export interface ClampInput {
  /** 最小视口宽度（px） */
  minVw: number
  /** 最大视口宽度（px） */
  maxVw: number
  /** 最小尺寸（单位由 unit 决定） */
  minSize: number
  /** 最大尺寸（单位由 unit 决定） */
  maxSize: number
  /** 根字号（px），用于 px <-> rem 换算 */
  rootFontSize: number
  /** 尺寸输入单位 */
  unit: LengthUnit
}

export interface ClampResult {
  /** 完整 clamp() 字符串 */
  css: string
  /** 最小边界，按所选单位 */
  minBound: string
  /** 中间偏好表达式（rem + vw） */
  preferred: string
  /** 最大边界，按所选单位 */
  maxBound: string
  /** vw 系数（slope * 100） */
  slopeVw: number
  /** rem 常量截距 */
  interceptRem: number
}

export type WarningKey = 'viewport' | 'size' | 'root'

const DEFAULT_ROOT = 16

/** 四舍五入到指定小数位，并去掉多余尾随零 */
function round(n: number, digits = 4): number {
  if (!Number.isFinite(n)) return 0
  const factor = 10 ** digits
  return Math.round(n * factor) / factor
}

/** 把所选单位的尺寸换算为 px */
export function toPx(value: number, unit: LengthUnit, root: number): number {
  return unit === 'rem' ? value * root : value
}

function safeRoot(root: number): number {
  return root > 0 && Number.isFinite(root) ? root : DEFAULT_ROOT
}

/**
 * 输入校验，返回需要提示的警告 key 列表（空数组表示一切正常）。
 */
export function validateInput(input: ClampInput): WarningKey[] {
  const warnings: WarningKey[] = []
  if (!(input.maxVw > input.minVw)) warnings.push('viewport')
  if (input.minSize > input.maxSize) warnings.push('size')
  if (!(input.rootFontSize > 0)) warnings.push('root')
  return warnings
}

/**
 * 生成 clamp() 结果。即便存在边界问题也会尽力返回可读结果，
 * 视口相等等无法计算斜率的情况下 slope 归零（退化为固定值）。
 */
export function buildClamp(input: ClampInput): ClampResult {
  const root = safeRoot(input.rootFontSize)
  const minPx = toPx(input.minSize, input.unit, root)
  const maxPx = toPx(input.maxSize, input.unit, root)

  const vwSpan = input.maxVw - input.minVw
  const slope = vwSpan !== 0 ? (maxPx - minPx) / vwSpan : 0
  const interceptPx = minPx - input.minVw * slope

  const interceptRem = round(interceptPx / root)
  const slopeVw = round(slope * 100)

  const unitSuffix = input.unit
  const minBound = `${round(input.minSize)}${unitSuffix}`
  const maxBound = `${round(input.maxSize)}${unitSuffix}`

  const slopeSign = slopeVw < 0 ? '-' : '+'
  const preferred = `${interceptRem}rem ${slopeSign} ${Math.abs(slopeVw)}vw`

  const css = `clamp(${minBound}, ${preferred}, ${maxBound})`
  return { css, minBound, preferred, maxBound, slopeVw, interceptRem }
}

/**
 * 计算在给定视口宽度下，clamp 实际解析出的像素值。
 * 用于预览，等价于浏览器对 clamp() 的求值（夹在 min/max 之间的线性插值）。
 */
export function resolvePx(input: ClampInput, viewportPx: number): number {
  const root = safeRoot(input.rootFontSize)
  const minPx = toPx(input.minSize, input.unit, root)
  const maxPx = toPx(input.maxSize, input.unit, root)

  const vwSpan = input.maxVw - input.minVw
  const slope = vwSpan !== 0 ? (maxPx - minPx) / vwSpan : 0
  const interceptPx = minPx - input.minVw * slope
  const preferredPx = interceptPx + slope * viewportPx

  const lo = Math.min(minPx, maxPx)
  const hi = Math.max(minPx, maxPx)
  return Math.min(Math.max(preferredPx, lo), hi)
}
