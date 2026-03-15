import { useCallback, useState, useEffect } from 'react'

const STORAGE_KEY = 'toolbox-favorites'

function loadFavorites(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter((x): x is string => typeof x === 'string')
  } catch {
    return []
  }
}

function saveFavorites(paths: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(paths))
  } catch (_) {}
}

export function useFavorites() {
  const [paths, setPaths] = useState<string[]>(() => loadFavorites())

  useEffect(() => {
    const handler = () => setPaths(loadFavorites())
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  const toggle = useCallback((path: string) => {
    setPaths((prev) => {
      const next = prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path]
      saveFavorites(next)
      return next
    })
  }, [])

  const add = useCallback((path: string) => {
    setPaths((prev) => {
      if (prev.includes(path)) return prev
      const next = [...prev, path]
      saveFavorites(next)
      return next
    })
  }, [])

  const remove = useCallback((path: string) => {
    setPaths((prev) => {
      const next = prev.filter((p) => p !== path)
      saveFavorites(next)
      return next
    })
  }, [])

  const isFavorite = useCallback(
    (path: string) => paths.includes(path),
    [paths]
  )

  return { favorites: paths, toggle, add, remove, isFavorite }
}
