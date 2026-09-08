import React, { createContext, useContext, useEffect, useState } from 'react'

const STORAGE_KEY = 'toolbox-theme'

/** 实际生效的外观 */
export type Theme = 'light' | 'dark'
/** 用户的选择。'system' 表示跟随系统，生效值随系统变化实时切换 */
export type ThemePreference = 'system' | Theme

export const THEME_PREFERENCES: ThemePreference[] = ['system', 'light', 'dark']

const DARK_QUERY = '(prefers-color-scheme: dark)'

function systemTheme(): Theme {
  if (typeof window === 'undefined' || !window.matchMedia) return 'light'
  return window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light'
}

/**
 * 存的是「偏好」而不是「生效值」。
 *
 * 存生效值会让跟随系统失效：系统是深色 → 我们设成 dark → 又把 'dark' 写回去，
 * 下次启动就变成固定深色了。
 *
 * 兼容老数据：以前存的就是 'light'/'dark'，那是用户明确选过的，继续当固定值；
 * 没存过的默认跟随系统。
 */
function readPreference(): ThemePreference {
  if (typeof window === 'undefined') return 'system'
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'dark' || saved === 'light' || saved === 'system') return saved
  } catch (_) {
    /* 隐私模式下读不到，按跟随系统处理 */
  }
  return 'system'
}

const ThemeContext = createContext<{
  /** 当前实际生效的外观，消费方通常只关心这个 */
  theme: Theme
  preference: ThemePreference
  setPreference: (p: ThemePreference) => void
  setTheme: (t: Theme) => void
  toggleTheme: () => void
} | null>(null)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>(readPreference)
  const [resolved, setResolved] = useState<Theme>(() => {
    const initial = readPreference()
    return initial === 'system' ? systemTheme() : initial
  })

  // 跟随系统时，系统外观变了要实时跟上，而不是等下次刷新
  useEffect(() => {
    if (preference !== 'system') {
      setResolved(preference)
      return undefined
    }

    setResolved(systemTheme())
    if (typeof window === 'undefined' || !window.matchMedia) return undefined

    const media = window.matchMedia(DARK_QUERY)
    const onChange = (e: MediaQueryListEvent) => setResolved(e.matches ? 'dark' : 'light')
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [preference])

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(resolved)
  }, [resolved])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, preference)
    } catch (_) {
      /* 存不住就只在本次会话内生效 */
    }
  }, [preference])

  const setPreference = (p: ThemePreference) => setPreferenceState(p)
  // 明确指定外观即脱离跟随系统
  const setTheme = (t: Theme) => setPreferenceState(t)
  const toggleTheme = () => setPreferenceState(resolved === 'dark' ? 'light' : 'dark')

  return (
    <ThemeContext.Provider
      value={{ theme: resolved, preference, setPreference, setTheme, toggleTheme }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
