// localStorage 持久化（解锁 / 最佳星数）
import type { LevelId } from './types'

const KEY = 'toolbox.sudoku-kids.progress'
const VERSION = 1

export type StoredProgress = {
  v: typeof VERSION
  best: Record<LevelId, number>
}

function emptyProgress(): StoredProgress {
  return { v: VERSION, best: {} }
}

export function loadProgress(): StoredProgress {
  if (typeof window === 'undefined' || !window.localStorage) return emptyProgress()
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return emptyProgress()
    const parsed = JSON.parse(raw) as Partial<StoredProgress>
    if (parsed.v !== VERSION || !parsed.best || typeof parsed.best !== 'object') {
      return emptyProgress()
    }
    return { v: VERSION, best: parsed.best as Record<LevelId, number> }
  } catch {
    return emptyProgress()
  }
}

export function saveProgress(p: StoredProgress): void {
  if (typeof window === 'undefined' || !window.localStorage) return
  try {
    window.localStorage.setItem(KEY, JSON.stringify(p))
  } catch {
    // 容忍 quota / 隐私模式
  }
}

/** 写入一关最佳星数（如果新分数更高） */
export function recordBest(levelId: LevelId, stars: number): StoredProgress {
  const p = loadProgress()
  const prev = p.best[levelId] ?? 0
  if (stars > prev) {
    p.best[levelId] = stars
    saveProgress(p)
  }
  return p
}
