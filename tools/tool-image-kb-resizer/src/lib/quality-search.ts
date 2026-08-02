const EPSILON = 0.02

export interface QualityStep {
  quality: number
  low: number
  high: number
  done: boolean
}

/**
 * 二分搜索的单步：给定当前搜索区间 [low, high]、刚尝试的 quality 与其编码结果字节数，
 * 返回下一个待尝试的 quality（区间中点）及是否已收敛。目标是在 size ≤ targetSize 的
 * 前提下找到尽量高的 quality（画质与体积的最优折中）。
 */
export function nextQuality(low: number, high: number, lastQuality: number, resultSize: number, targetSize: number): QualityStep {
  const newLow = resultSize <= targetSize ? lastQuality : low
  const newHigh = resultSize <= targetSize ? high : lastQuality
  const done = newHigh - newLow < EPSILON
  return { quality: (newLow + newHigh) / 2, low: newLow, high: newHigh, done }
}
