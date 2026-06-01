/**
 * Web Speech API（SpeechSynthesis）封装 —— 朗读输入 / 翻译结果。
 *
 * - 默认从 `speechSynthesis.getVoices()` 里挑匹配 `lang` 前缀的 voice
 * - 同一时刻只允许一个朗读：开始新朗读前先 cancel
 * - 提供 `start / stop / onStateChange` 三个最小 API，便于 UI 切按钮
 */
import type { LangCode } from './languages'

/** 把工具内部的 LangCode 映射到 BCP47（Web Speech 使用）。`auto` 返回空字符串 → 让浏览器自选。 */
export function langToBcp47(code: LangCode | undefined): string {
  switch (code) {
    case 'zh': return 'zh-CN'
    case 'zh-TW': return 'zh-TW'
    case 'en': return 'en-US'
    case 'ja': return 'ja-JP'
    case 'ko': return 'ko-KR'
    case 'fr': return 'fr-FR'
    case 'de': return 'de-DE'
    case 'es': return 'es-ES'
    case 'ru': return 'ru-RU'
    case 'pt': return 'pt-BR'
    case 'it': return 'it-IT'
    case 'ar': return 'ar-SA'
    case 'th': return 'th-TH'
    case 'vi': return 'vi-VN'
    case 'auto':
    case undefined:
    default:
      return ''
  }
}

function getSynth(): SpeechSynthesis | null {
  try {
    if (typeof window === 'undefined') return null
    return window.speechSynthesis ?? null
  } catch {
    return null
  }
}

export function isSpeechSupported(): boolean {
  return getSynth() !== null && typeof window !== 'undefined' && 'SpeechSynthesisUtterance' in window
}

/** 在 voices 列表里挑选最契合 `bcp47` 的 voice。前缀匹配优先，找不到返回 null（让浏览器选默认）。 */
export function pickVoice(
  voices: SpeechSynthesisVoice[],
  bcp47: string,
): SpeechSynthesisVoice | null {
  if (!bcp47) return null
  const exact = voices.find((v) => v.lang.toLowerCase() === bcp47.toLowerCase())
  if (exact) return exact
  const base = bcp47.split('-')[0].toLowerCase()
  const prefix = voices.find((v) => v.lang.toLowerCase().startsWith(base))
  return prefix ?? null
}

/** 启动朗读；若已在朗读会先 cancel。回调用于 UI 同步按钮状态。 */
export function speak(
  text: string,
  lang: LangCode | undefined,
  callbacks: {
    onStart?: () => void
    onEnd?: () => void
    onError?: (msg: string) => void
  } = {},
): boolean {
  const synth = getSynth()
  if (!synth || typeof SpeechSynthesisUtterance === 'undefined') {
    callbacks.onError?.('speech_not_supported')
    return false
  }
  const trimmed = text.trim()
  if (!trimmed) return false

  try {
    synth.cancel()
  } catch {
    /* ignore */
  }

  const u = new SpeechSynthesisUtterance(trimmed)
  const bcp47 = langToBcp47(lang)
  if (bcp47) u.lang = bcp47
  const voice = pickVoice(synth.getVoices(), bcp47)
  if (voice) u.voice = voice

  u.onstart = () => callbacks.onStart?.()
  u.onend = () => callbacks.onEnd?.()
  u.onerror = (e) => callbacks.onError?.(e.error || 'speech_error')

  synth.speak(u)
  return true
}

export function stopSpeaking(): void {
  const synth = getSynth()
  if (!synth) return
  try {
    synth.cancel()
  } catch {
    /* ignore */
  }
}
