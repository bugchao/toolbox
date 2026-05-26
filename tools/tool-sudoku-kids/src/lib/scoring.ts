// 三星评分

export function computeStars(errors: number, hints: number): 1 | 2 | 3 {
  const raw = 3 - errors - hints
  if (raw >= 3) return 3
  if (raw === 2) return 2
  return 1
}
