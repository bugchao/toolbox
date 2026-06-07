/**
 * 把 n 限制到 [min, max]。
 * - NaN / Infinity 退化为 min（保证不会向 UI 抛出怪值）。
 * - 允许调用方传入 min > max（视为反向区间，自动 swap）。
 */
export function clamp(n: number, min: number, max: number): number {
  if (typeof n !== 'number' || Number.isNaN(n)) return min
  if (!Number.isFinite(n)) return n > 0 ? max : min
  const lo = Math.min(min, max)
  const hi = Math.max(min, max)
  if (n < lo) return lo
  if (n > hi) return hi
  return n
}

/** 同 clamp，但 NaN 默认成 0、Infinity 仍按符号 clamp 到边界。 */
export function clamp01(n: number): number {
  return clamp(n, 0, 1)
}

/** 四舍五入到指定小数位，避免浮点尾巴（0.1 + 0.2 之流）。 */
export function roundTo(n: number, decimals: number): number {
  if (!Number.isFinite(n)) return 0
  const f = 10 ** Math.max(0, Math.floor(decimals))
  return Math.round(n * f) / f
}
