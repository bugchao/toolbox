import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'toolbox-settings'

export interface AppSettings {
  hideServerTools: boolean
  apiBaseUrl: string  // 自定义后端地址，空字符串表示同域
}

const DEFAULT_SETTINGS: AppSettings = {
  hideServerTools: false,
  apiBaseUrl: '',
}

interface SettingsContextValue {
  settings: AppSettings
  updateSettings: (patch: Partial<AppSettings>) => void
  resetSettings: () => void
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) }
    } catch {}
    return DEFAULT_SETTINGS
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  }, [settings])

  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }))
  }, [])

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS)
  }, [])

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider')
  return ctx
}

// 全局 API 地址工具函数，供各工具 fetch 使用
export function getApiUrl(path: string): string {
  const raw = localStorage.getItem(STORAGE_KEY)
  let base = ''
  try {
    if (raw) base = JSON.parse(raw).apiBaseUrl || ''
  } catch {}
  // 去掉末尾斜杠
  base = base.replace(/\/$/, '')
  return base ? `${base}${path}` : path
}
