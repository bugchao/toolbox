import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { langToBcp47, pickVoice, speak, stopSpeaking, isSpeechSupported } from './speech'

type Voice = Pick<SpeechSynthesisVoice, 'lang' | 'name' | 'voiceURI' | 'default' | 'localService'>

function v(lang: string, name = lang): Voice {
  return { lang, name, voiceURI: name, default: false, localService: true }
}

describe('langToBcp47', () => {
  it('maps core codes', () => {
    expect(langToBcp47('zh')).toBe('zh-CN')
    expect(langToBcp47('zh-TW')).toBe('zh-TW')
    expect(langToBcp47('en')).toBe('en-US')
    expect(langToBcp47('ja')).toBe('ja-JP')
  })
  it('returns empty for auto / unknown', () => {
    expect(langToBcp47('auto')).toBe('')
    expect(langToBcp47(undefined)).toBe('')
  })
})

describe('pickVoice', () => {
  const voices = [v('en-US', 'Samantha'), v('zh-CN', 'Tingting'), v('zh-TW', 'Mei-Jia'), v('ja-JP', 'Kyoko')]
  it('picks exact lang match', () => {
    expect(pickVoice(voices as unknown as SpeechSynthesisVoice[], 'zh-CN')?.name).toBe('Tingting')
  })
  it('falls back to base-language prefix', () => {
    expect(pickVoice(voices as unknown as SpeechSynthesisVoice[], 'zh-HK')?.lang).toMatch(/^zh-/)
  })
  it('returns null when no match', () => {
    expect(pickVoice(voices as unknown as SpeechSynthesisVoice[], 'ko-KR')).toBeNull()
  })
  it('returns null for empty bcp47', () => {
    expect(pickVoice(voices as unknown as SpeechSynthesisVoice[], '')).toBeNull()
  })
})

describe('speak / stopSpeaking', () => {
  let cancelSpy: ReturnType<typeof vi.fn>
  let speakSpy: ReturnType<typeof vi.fn>
  let lastUtter: SpeechSynthesisUtterance | null = null
  const originalSynth = (window as { speechSynthesis?: unknown }).speechSynthesis
  const originalUtter = (window as { SpeechSynthesisUtterance?: unknown }).SpeechSynthesisUtterance

  beforeEach(() => {
    lastUtter = null
    cancelSpy = vi.fn()
    speakSpy = vi.fn((u: SpeechSynthesisUtterance) => {
      lastUtter = u
    })
    const fakeSynth = {
      cancel: cancelSpy,
      speak: speakSpy,
      getVoices: () => [v('zh-CN', 'Tingting')] as unknown as SpeechSynthesisVoice[],
    }
    Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: fakeSynth })
    class FakeUtter {
      text: string
      lang = ''
      voice: SpeechSynthesisVoice | null = null
      onstart: (() => void) | null = null
      onend: (() => void) | null = null
      onerror: ((e: { error?: string }) => void) | null = null
      constructor(text: string) { this.text = text }
    }
    Object.defineProperty(window, 'SpeechSynthesisUtterance', {
      configurable: true,
      value: FakeUtter as unknown as typeof SpeechSynthesisUtterance,
    })
  })

  afterEach(() => {
    Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: originalSynth })
    Object.defineProperty(window, 'SpeechSynthesisUtterance', { configurable: true, value: originalUtter })
  })

  it('isSpeechSupported reflects window features', () => {
    expect(isSpeechSupported()).toBe(true)
  })

  it('speak() cancels any in-flight utterance then speaks the new one', () => {
    const started = speak('你好', 'zh')
    expect(started).toBe(true)
    expect(cancelSpy).toHaveBeenCalledTimes(1)
    expect(speakSpy).toHaveBeenCalledTimes(1)
    expect(lastUtter?.lang).toBe('zh-CN')
    expect(lastUtter?.voice?.name).toBe('Tingting')
  })

  it('speak() noops on empty text', () => {
    expect(speak('   ', 'zh')).toBe(false)
    expect(speakSpy).not.toHaveBeenCalled()
  })

  it('stopSpeaking() calls cancel', () => {
    stopSpeaking()
    expect(cancelSpy).toHaveBeenCalled()
  })
})
