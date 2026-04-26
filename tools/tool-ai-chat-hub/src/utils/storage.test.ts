import { describe, it, expect, beforeEach } from 'vitest'
import { saveApiKey, getApiKey, deleteApiKey, getAllApiKeys, saveViewMode, getViewMode } from './storage'

describe('Storage Utility', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should save and retrieve API key', () => {
    saveApiKey('chatgpt', 'sk-test123')
    const key = getApiKey('chatgpt')
    expect(key).toBe('sk-test123')
  })

  it('should return null for non-existent key', () => {
    const key = getApiKey('gemini')
    expect(key).toBeNull()
  })

  it('should delete API key', () => {
    saveApiKey('deepseek', 'sk-test456')
    deleteApiKey('deepseek')
    const key = getApiKey('deepseek')
    expect(key).toBeNull()
  })

  it('should get all API keys', () => {
    saveApiKey('chatgpt', 'sk-1')
    saveApiKey('gemini', 'sk-2')
    const keys = getAllApiKeys()
    expect(keys).toEqual({
      chatgpt: 'sk-1',
      gemini: 'sk-2'
    })
  })

  it('should save and retrieve view mode', () => {
    saveViewMode('tab')
    const mode = getViewMode()
    expect(mode).toBe('tab')
  })

  it('should return default view mode when not set', () => {
    const mode = getViewMode()
    expect(mode).toBe('grid')
  })

  it('should handle corrupted preferences gracefully', () => {
    localStorage.setItem('ai-chat-hub:preferences', 'invalid-json{')
    const mode = getViewMode()
    expect(mode).toBe('grid')
  })
})
