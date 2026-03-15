import React from 'react'

const STORAGE_KEY = 'toolbox-background-visible'

export interface BackgroundVisibilityContextValue {
  /** 是否显示装饰背景（渐变 + 粒子） */
  visible: boolean
  setVisible: (v: boolean) => void
}

const defaultValue: BackgroundVisibilityContextValue = {
  visible: true,
  setVisible: () => {},
}

const BackgroundVisibilityContext =
  React.createContext<BackgroundVisibilityContextValue>(defaultValue)

export function useBackgroundVisibility() {
  return React.useContext(BackgroundVisibilityContext)
}

export interface BackgroundVisibilityProviderProps {
  children: React.ReactNode
  defaultVisible?: boolean
}

export function BackgroundVisibilityProvider({
  children,
  defaultVisible = true,
}: BackgroundVisibilityProviderProps) {
  const [visible, setVisibleState] = React.useState(() => {
    if (typeof window === 'undefined') return defaultVisible
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'false') return false
    if (saved === 'true') return true
    return defaultVisible
  })

  const setVisible = React.useCallback((v: boolean) => {
    setVisibleState(v)
    try {
      localStorage.setItem(STORAGE_KEY, String(v))
    } catch (_) {}
  }, [])

  const value = React.useMemo(
    () => ({ visible, setVisible }),
    [visible, setVisible]
  )
  return (
    <BackgroundVisibilityContext.Provider value={value}>
      {children}
    </BackgroundVisibilityContext.Provider>
  )
}

export default BackgroundVisibilityContext
