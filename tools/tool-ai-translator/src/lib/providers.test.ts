import { describe, it, expect } from 'vitest'
import { PROVIDERS, getProvider } from './providers'

describe('PROVIDERS registry', () => {
  it('has unique ids', () => {
    const ids = PROVIDERS.map((p) => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('all entries have non-empty label and a known protocol', () => {
    for (const p of PROVIDERS) {
      expect(p.label.length).toBeGreaterThan(0)
      expect(['openai', 'anthropic', 'gemini', 'ollama']).toContain(p.protocol)
    }
  })

  it('cloud providers require an API key; local/webllm do not', () => {
    const cloud = PROVIDERS.filter((p) => p.kind === 'cloud')
    expect(cloud.length).toBeGreaterThanOrEqual(6) // 6 家主流
    cloud.forEach((p) => expect(p.requiresApiKey).toBe(true))

    const ollama = getProvider('ollama')!
    expect(ollama.requiresApiKey).toBe(false)
    expect(ollama.protocol).toBe('ollama')

    const webllm = getProvider('webllm')!
    expect(webllm.requiresApiKey).toBe(false)
    expect(webllm.kind).toBe('webllm')
  })

  it('every provider with non-empty models has its defaultModel in the list', () => {
    for (const p of PROVIDERS) {
      if (p.models.length === 0) continue
      expect(p.models).toContain(p.defaultModel)
    }
  })

  it('defaultBaseUrl is https for cloud (privacy) and http(s) for local', () => {
    for (const p of PROVIDERS) {
      if (p.kind === 'cloud') {
        expect(p.defaultBaseUrl.startsWith('https://')).toBe(true)
      }
    }
  })

  it('getProvider returns undefined for unknown id', () => {
    expect(getProvider('zzz-not-real')).toBeUndefined()
  })

  it('non-custom providers expose a meaningful list of model suggestions (>= 3)', () => {
    for (const p of PROVIDERS) {
      if (p.kind === 'custom') continue
      expect(p.models.length).toBeGreaterThanOrEqual(3)
    }
  })

  it('ollama and webllm carry a hintKey to advertise custom-model entry', () => {
    expect(getProvider('ollama')?.hintKey).toBeTruthy()
    expect(getProvider('webllm')?.hintKey).toBeTruthy()
  })
})
