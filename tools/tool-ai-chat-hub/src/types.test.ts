import { describe, it, expect } from 'vitest'
import type { AIProvider, APIConfig, Message, ViewMode, ResponseStatus, AIResponse, ProviderConfig } from './types'

describe('Type Definitions', () => {
  it('should accept valid AIProvider values', () => {
    const providers: AIProvider[] = ['chatgpt', 'gemini', 'deepseek', 'grok']
    expect(providers).toHaveLength(4)
  })

  it('should create valid APIConfig', () => {
    const config: APIConfig = {
      provider: 'chatgpt',
      apiKey: 'sk-test123',
      baseURL: 'https://api.openai.com/v1'
    }
    expect(config.provider).toBe('chatgpt')
  })

  it('should create valid Message', () => {
    const message: Message = {
      role: 'assistant',
      content: 'Hello',
      provider: 'chatgpt',
      timestamp: Date.now()
    }
    expect(message.role).toBe('assistant')
  })

  it('should accept valid ViewMode values', () => {
    const modes: ViewMode[] = ['grid', 'tab']
    expect(modes).toHaveLength(2)
  })

  it('should accept valid ResponseStatus values', () => {
    const statuses: ResponseStatus[] = ['idle', 'loading', 'success', 'error']
    expect(statuses).toHaveLength(4)
  })

  it('should create valid AIResponse', () => {
    const response: AIResponse = {
      provider: 'gemini',
      status: 'success',
      content: 'Response text'
    }
    expect(response.provider).toBe('gemini')
    expect(response.error).toBeUndefined()
  })

  it('should create valid ProviderConfig', () => {
    const config: ProviderConfig = {
      provider: 'deepseek',
      name: 'DeepSeek',
      enabled: true,
      configured: false
    }
    expect(config.provider).toBe('deepseek')
  })
})
