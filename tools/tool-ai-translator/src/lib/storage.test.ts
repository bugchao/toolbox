import { describe, it, expect, beforeEach } from 'vitest'
import {
  __testing,
  readProviderConfig,
  readSession,
  writeProviderConfig,
  writeSession,
  readString,
  writeString,
  readJson,
  writeJson,
  removeKey,
} from './storage'

beforeEach(() => {
  window.localStorage.clear()
})

describe('storage primitives', () => {
  it('writeString / readString roundtrip with namespace', () => {
    writeString('hello', 'world')
    expect(readString('hello')).toBe('world')
    // 实际写入的是带 namespace 的 key
    expect(window.localStorage.getItem(__testing.NS + 'hello')).toBe('world')
  })

  it('readString returns fallback when missing', () => {
    expect(readString('nope', 'default')).toBe('default')
  })

  it('removeKey clears value', () => {
    writeString('k', 'v')
    removeKey('k')
    expect(readString('k')).toBe('')
  })

  it('readJson tolerates corrupt JSON', () => {
    window.localStorage.setItem(__testing.NS + 'bad', '{not json')
    expect(readJson('bad', { ok: true })).toEqual({ ok: true })
  })

  it('writeJson / readJson roundtrip', () => {
    writeJson('cfg', { x: 1, y: 'z' })
    expect(readJson('cfg', null)).toEqual({ x: 1, y: 'z' })
  })
})

describe('provider config', () => {
  it('reads empty config by default', () => {
    expect(readProviderConfig('openai')).toEqual({})
  })

  it('persists and reloads per provider', () => {
    writeProviderConfig('openai', { apiKey: 'sk-xxx', model: 'gpt-4o-mini' })
    expect(readProviderConfig('openai')).toEqual({ apiKey: 'sk-xxx', model: 'gpt-4o-mini' })
    // 不同 provider 不串号
    expect(readProviderConfig('anthropic')).toEqual({})
  })
})

describe('session state', () => {
  it('merges partial updates instead of overwriting', () => {
    writeSession({ providerId: 'openai', source: 'auto', target: 'zh' })
    writeSession({ target: 'en' })
    expect(readSession()).toEqual({ providerId: 'openai', source: 'auto', target: 'en' })
  })
})
