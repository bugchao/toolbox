import { useEffect, useState, type Dispatch, type SetStateAction } from 'react'

/**
 * 本地持久化 state：懒加载读取 localStorage，写入时自动保存。
 * 对象类型的 initial 会与已保存值合并，避免旧数据缺字段导致 UI 出现 undefined。
 */
export function useLocalStorageState<T>(key: string, initial: T): [T, Dispatch<SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key)
      if (raw == null) return initial
      const parsed = JSON.parse(raw)
      if (initial && typeof initial === 'object' && !Array.isArray(initial)) {
        return { ...initial, ...parsed }
      }
      return parsed
    } catch {
      return initial
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state))
    } catch {
      // ponytail: 本地持久化是尽力而为，配额超限或序列化失败时静默跳过
    }
  }, [key, state])

  return [state, setState]
}
