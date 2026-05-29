// 关卡元数据 + 解锁判定
import type { Difficulty, Level, LevelId } from './types'

const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard']

/** 按难度返回每关的"已知格数"配置（10 关） */
const GIVENS_PER_INDEX: Record<Difficulty, number[]> = {
  // 4×4：总 16 格；从 11 递减到 7（题面越来越难）
  easy: [11, 11, 10, 10, 9, 9, 8, 8, 7, 7],
  // 6×6：总 36 格；从 24 递减到 14
  medium: [24, 23, 22, 21, 20, 19, 18, 17, 16, 14],
  // 9×9：总 81 格；从 46 递减到 30
  hard: [46, 44, 42, 40, 38, 36, 34, 32, 31, 30],
}

export function makeLevelId(difficulty: Difficulty, index: number): LevelId {
  return `${difficulty}:${index}`
}

export function parseLevelId(id: LevelId): { difficulty: Difficulty; index: number } | null {
  const [d, idxStr] = id.split(':')
  const index = Number(idxStr)
  if (!DIFFICULTIES.includes(d as Difficulty)) return null
  if (!Number.isInteger(index) || index < 1 || index > 10) return null
  return { difficulty: d as Difficulty, index }
}

export function allLevels(): Level[] {
  const out: Level[] = []
  for (const d of DIFFICULTIES) {
    for (let i = 1; i <= 10; i++) {
      out.push({
        id: makeLevelId(d, i),
        difficulty: d,
        index: i,
        givens: GIVENS_PER_INDEX[d][i - 1],
      })
    }
  }
  return out
}

export function levelsByDifficulty(difficulty: Difficulty): Level[] {
  return allLevels().filter((l) => l.difficulty === difficulty)
}

export function getLevel(id: LevelId): Level | null {
  const parsed = parseLevelId(id)
  if (!parsed) return null
  return {
    id,
    difficulty: parsed.difficulty,
    index: parsed.index,
    givens: GIVENS_PER_INDEX[parsed.difficulty][parsed.index - 1],
  }
}

/**
 * 关卡是否解锁：
 * - 同难度的 L1 默认解锁
 * - 同难度的 L(i) 解锁 ⇔ L(i-1) 的 best 星数 ≥ 1
 */
export function isUnlocked(level: Level, best: Record<LevelId, number>): boolean {
  if (level.index === 1) return true
  const prevId = makeLevelId(level.difficulty, level.index - 1)
  return (best[prevId] ?? 0) >= 1
}

export function nextLevel(current: Level): Level | null {
  if (current.index < 10) return getLevel(makeLevelId(current.difficulty, current.index + 1))
  // 跨难度顺接
  const di = DIFFICULTIES.indexOf(current.difficulty)
  if (di === DIFFICULTIES.length - 1) return null
  return getLevel(makeLevelId(DIFFICULTIES[di + 1], 1))
}
