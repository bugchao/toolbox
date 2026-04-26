import type { AIProvider, ViewMode } from '../types'

const STORAGE_KEY_PREFIX = 'ai-chat-hub:api-key:'
const PREFERENCES_KEY = 'ai-chat-hub:preferences'

export function saveApiKey(provider: AIProvider, apiKey: string): void {
  localStorage.setItem(`${STORAGE_KEY_PREFIX}${provider}`, apiKey)
}

export function getApiKey(provider: AIProvider): string | null {
  return localStorage.getItem(`${STORAGE_KEY_PREFIX}${provider}`)
}

export function deleteApiKey(provider: AIProvider): void {
  localStorage.removeItem(`${STORAGE_KEY_PREFIX}${provider}`)
}

export function getAllApiKeys(): Record<string, string> {
  const keys: Record<string, string> = {}
  const providers: AIProvider[] = ['chatgpt', 'gemini', 'deepseek', 'grok']

  providers.forEach(provider => {
    const key = getApiKey(provider)
    if (key) {
      keys[provider] = key
    }
  })

  return keys
}

export function saveViewMode(mode: ViewMode): void {
  const prefs = getPreferences()
  prefs.viewMode = mode
  localStorage.setItem(PREFERENCES_KEY, JSON.stringify(prefs))
}

export function getViewMode(): ViewMode {
  const prefs = getPreferences()
  return prefs.viewMode || 'grid'
}

function getPreferences(): { viewMode?: ViewMode } {
  const stored = localStorage.getItem(PREFERENCES_KEY)
  if (!stored) return {}

  try {
    return JSON.parse(stored)
  } catch {
    return {}
  }
}
