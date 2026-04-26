import { describe, it, expect, beforeEach } from 'vitest'
import {
  saveApiKey,
  getApiKey,
  deleteApiKey,
  getAllApiKeys,
  saveBaseURL,
  getBaseURL,
  deleteBaseURL,
  saveViewMode,
  getViewMode
} from './storage'

describe('Storage Utility', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('API Key storage', () => {
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
  })

  describe('BaseURL storage', () => {
    it('should save and retrieve BaseURL', () => {
      saveBaseURL('chatgpt', 'https://api.example.com/v1')
      const baseURL = getBaseURL('chatgpt')
      expect(baseURL).toBe('https://api.example.com/v1')
    })

    it('should return null for non-existent BaseURL', () => {
      const baseURL = getBaseURL('gemini')
      expect(baseURL).toBeNull()
    })

    it('should delete BaseURL', () => {
      saveBaseURL('deepseek', 'https://api.example.com')
      deleteBaseURL('deepseek')
      const baseURL = getBaseURL('deepseek')
      expect(baseURL).toBeNull()
    })

    it('should store different BaseURLs for different providers', () => {
      saveBaseURL('chatgpt', 'https://api1.example.com')
      saveBaseURL('gemini', 'https://api2.example.com')
      expect(getBaseURL('chatgpt')).toBe('https://api1.example.com')
      expect(getBaseURL('gemini')).toBe('https://api2.example.com')
    })

    it('should store BaseURL independently from API key', () => {
      saveApiKey('chatgpt', 'sk-test-key')
      saveBaseURL('chatgpt', 'https://api.example.com')

      expect(getApiKey('chatgpt')).toBe('sk-test-key')
      expect(getBaseURL('chatgpt')).toBe('https://api.example.com')

      deleteApiKey('chatgpt')
      expect(getApiKey('chatgpt')).toBeNull()
      expect(getBaseURL('chatgpt')).toBe('https://api.example.com')
    })

    it('should handle empty string BaseURL', () => {
      saveBaseURL('chatgpt', '')
      expect(getBaseURL('chatgpt')).toBe('')
    })
  })

  describe('ViewMode storage', () => {
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
})
