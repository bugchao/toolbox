import { describe, it, expect, beforeEach } from 'vitest'
import { StrictMode } from 'react'
import { act, renderHook } from '@testing-library/react'
import { usePersistedSession } from './usePersistedSession'
import { readSession, writeSession } from '../lib/storage'

beforeEach(() => {
  window.localStorage.clear()
})

const defaults = { providerId: 'openai', source: 'auto' as const, target: 'en' as const }

describe('usePersistedSession', () => {
  it('starts from initial defaults when storage is empty', () => {
    const { result } = renderHook(() => usePersistedSession(defaults))
    expect(result.current.providerId).toBe('openai')
    expect(result.current.restored).toBe(true)
  })

  it('restores providerId / source / target from storage on mount', () => {
    writeSession({ providerId: 'webllm', source: 'en', target: 'zh' })
    const { result } = renderHook(() => usePersistedSession(defaults))
    expect(result.current.providerId).toBe('webllm')
    expect(result.current.source).toBe('en')
    expect(result.current.target).toBe('zh')
  })

  /**
   * 回归：bug 是首次挂载时持久化 effect 用「默认 state」抢在恢复 effect 之前
   * 写一次，把存档里的 webllm 覆盖成默认 openai。修复后存档应保持 webllm。
   */
  it('does NOT overwrite stored providerId with default during mount race', () => {
    writeSession({ providerId: 'webllm', source: 'en', target: 'zh' })
    renderHook(() => usePersistedSession(defaults))
    expect(readSession().providerId).toBe('webllm')
    expect(readSession().source).toBe('en')
    expect(readSession().target).toBe('zh')
  })

  /**
   * StrictMode 双挂载下同样不能丢存档。
   */
  it('survives React StrictMode double-mount without losing the stored providerId', () => {
    writeSession({ providerId: 'webllm', source: 'en', target: 'zh' })
    renderHook(() => usePersistedSession(defaults), {
      wrapper: ({ children }) => <StrictMode>{children}</StrictMode>,
    })
    expect(readSession().providerId).toBe('webllm')
  })

  it('persists subsequent setProviderId calls', () => {
    const { result } = renderHook(() => usePersistedSession(defaults))
    act(() => result.current.setProviderId('webllm'))
    expect(readSession().providerId).toBe('webllm')
  })

  it('persists setSource and setTarget independently', () => {
    const { result } = renderHook(() => usePersistedSession(defaults))
    act(() => {
      result.current.setSource('ja')
      result.current.setTarget('en')
    })
    const s = readSession()
    expect(s.source).toBe('ja')
    expect(s.target).toBe('en')
  })
})
