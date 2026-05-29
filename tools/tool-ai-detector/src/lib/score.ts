// 通用打分聚合
import type { Feature } from './textFeatures'

export type Verdict = 'human' | 'suspect' | 'ai'

export type ScoreResult = {
  total: number // 0..100
  verdict: Verdict
  features: Feature[]
}

/** 加权聚合 + 权重归一化 */
export function aggregate(features: Feature[]): ScoreResult {
  if (features.length === 0) {
    return { total: 50, verdict: 'suspect', features }
  }
  const totalWeight = features.reduce((s, f) => s + f.weight, 0) || 1
  const total =
    features.reduce((s, f) => s + f.contribution * f.weight, 0) / totalWeight
  const clamped = Math.max(0, Math.min(100, total))
  return {
    total: Math.round(clamped),
    verdict: classify(clamped),
    features,
  }
}

export function classify(score: number): Verdict {
  if (score < 35) return 'human'
  if (score < 65) return 'suspect'
  return 'ai'
}
