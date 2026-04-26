export type AIProvider = 'chatgpt' | 'gemini' | 'deepseek' | 'grok'

export interface APIConfig {
  provider: AIProvider
  apiKey: string
  baseURL?: string
}

export interface Message {
  role: 'user' | 'assistant'
  content: string
  provider: AIProvider
  timestamp: number
}

export type ViewMode = 'grid' | 'tab'

export type ResponseStatus = 'idle' | 'loading' | 'success' | 'error'

export interface AIResponse {
  provider: AIProvider
  status: ResponseStatus
  content: string
  error?: string
}

export interface ProviderConfig {
  provider: AIProvider
  name: string
  enabled: boolean
  configured: boolean
}
