// 跨关进度管理
import { useCallback, useEffect, useState } from 'react'
import { loadProgress, recordBest, type StoredProgress } from '../lib/storage'
import type { LevelId } from '../lib/types'

export function useProgress() {
  const [progress, setProgress] = useState<StoredProgress>(() => loadProgress())

  // 跨页面/标签页同步
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'toolbox.sudoku-kids.progress') setProgress(loadProgress())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const bumpBest = useCallback((levelId: LevelId, stars: number) => {
    const next = recordBest(levelId, stars)
    setProgress({ ...next })
  }, [])

  return { progress, bumpBest }
}
