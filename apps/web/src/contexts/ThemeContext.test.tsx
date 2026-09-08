import React from 'react'
import { act, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ThemeProvider, useTheme } from './ThemeContext'

const STORAGE_KEY = 'toolbox-theme'

/** jsdom 没有 matchMedia，自己造一个能触发 change 的 */
function stubMatchMedia(prefersDark: boolean) {
  const listeners = new Set<(e: MediaQueryListEvent) => void>()
  let matches = prefersDark

  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockImplementation((query: string) => ({
      media: query,
      get matches() {
        return matches
      },
      addEventListener: (_: string, cb: (e: MediaQueryListEvent) => void) => listeners.add(cb),
      removeEventListener: (_: string, cb: (e: MediaQueryListEvent) => void) => listeners.delete(cb),
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
      onchange: null,
    })),
  )

  return {
    /** 模拟用户在系统设置里切换了外观 */
    setSystemDark(next: boolean) {
      matches = next
      act(() => {
        listeners.forEach((cb) => cb({ matches: next } as MediaQueryListEvent))
      })
    },
  }
}

const Probe: React.FC = () => {
  const { theme, preference, setPreference } = useTheme()
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <span data-testid="preference">{preference}</span>
      <button type="button" onClick={() => setPreference('light')}>
        pick-light
      </button>
      <button type="button" onClick={() => setPreference('system')}>
        pick-system
      </button>
    </div>
  )
}

const renderProbe = () =>
  render(
    <ThemeProvider>
      <Probe />
    </ThemeProvider>,
  )

describe('主题偏好', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('light', 'dark')
    vi.unstubAllGlobals()
  })

  it('没存过偏好时跟随系统', () => {
    stubMatchMedia(true)
    renderProbe()
    expect(screen.getByTestId('preference')).toHaveTextContent('system')
    expect(screen.getByTestId('theme')).toHaveTextContent('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('跟随系统时，系统外观变了要实时跟上', () => {
    const media = stubMatchMedia(false)
    renderProbe()
    expect(screen.getByTestId('theme')).toHaveTextContent('light')

    media.setSystemDark(true)
    expect(screen.getByTestId('theme')).toHaveTextContent('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('存进去的是偏好而不是解析后的值——否则跟随系统会被自己覆盖掉', () => {
    stubMatchMedia(true)
    renderProbe()
    // 这里如果写成 'dark'，下次启动就变成固定深色了
    expect(localStorage.getItem(STORAGE_KEY)).toBe('system')
  })

  it('明确选了浅色就不再跟随系统', () => {
    const media = stubMatchMedia(true)
    renderProbe()

    act(() => {
      screen.getByText('pick-light').click()
    })
    expect(screen.getByTestId('preference')).toHaveTextContent('light')
    expect(localStorage.getItem(STORAGE_KEY)).toBe('light')

    media.setSystemDark(true)
    expect(screen.getByTestId('theme')).toHaveTextContent('light')
  })

  it('选回跟随系统后立刻按系统的来', () => {
    stubMatchMedia(true)
    localStorage.setItem(STORAGE_KEY, 'light')
    renderProbe()
    expect(screen.getByTestId('theme')).toHaveTextContent('light')

    act(() => {
      screen.getByText('pick-system').click()
    })
    expect(screen.getByTestId('preference')).toHaveTextContent('system')
    expect(screen.getByTestId('theme')).toHaveTextContent('dark')
  })

  it('老数据里存的 light/dark 继续当固定值，不会被当成跟随系统', () => {
    stubMatchMedia(true)
    localStorage.setItem(STORAGE_KEY, 'dark')
    renderProbe()
    expect(screen.getByTestId('preference')).toHaveTextContent('dark')
    expect(screen.getByTestId('theme')).toHaveTextContent('dark')
  })
})
