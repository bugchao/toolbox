import React, { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Volume2, Square, Pause, Play } from 'lucide-react'
import { PageHero } from '@toolbox/ui-kit'

export default function TextToSpeech() {
  const { t } = useTranslation('toolTextToSpeech')
  const [text, setText] = useState('欢迎使用文字转语音工具，请输入您想要朗读的文字内容。')
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [selectedVoice, setSelectedVoice] = useState('')
  const [rate, setRate] = useState(1)
  const [pitch, setPitch] = useState(1)
  const [volume, setVolume] = useState(1)
  const [status, setStatus] = useState<'idle' | 'speaking' | 'paused'>('idle')
  const [supported, setSupported] = useState(true)
  const uttRef = useRef<SpeechSynthesisUtterance | null>(null)

  useEffect(() => {
    if (!('speechSynthesis' in window)) { setSupported(false); return }
    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices()
      setVoices(v)
      const zhVoice = v.find(v => v.lang.startsWith('zh'))
      if (zhVoice) setSelectedVoice(zhVoice.name)
    }
    loadVoices()
    window.speechSynthesis.onvoiceschanged = loadVoices
    return () => { window.speechSynthesis.cancel() }
  }, [])

  const speak = () => {
    if (!supported || !text.trim()) return
    window.speechSynthesis.cancel()
    const utt = new SpeechSynthesisUtterance(text)
    const voice = voices.find(v => v.name === selectedVoice)
    if (voice) utt.voice = voice
    utt.rate = rate
    utt.pitch = pitch
    utt.volume = volume
    utt.onstart = () => setStatus('speaking')
    utt.onend = () => setStatus('idle')
    utt.onerror = () => setStatus('idle')
    uttRef.current = utt
    window.speechSynthesis.speak(utt)
  }

  const stop = () => {
    window.speechSynthesis.cancel()
    setStatus('idle')
  }

  const togglePause = () => {
    if (status === 'speaking') {
      window.speechSynthesis.pause()
      setStatus('paused')
    } else if (status === 'paused') {
      window.speechSynthesis.resume()
      setStatus('speaking')
    }
  }

  const zhVoices = voices.filter(v => v.lang.startsWith('zh'))
  const otherVoices = voices.filter(v => !v.lang.startsWith('zh'))

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHero title={t('title')} description={t('description')} icon={Volume2} />
      <div className="max-w-xl mx-auto px-4 py-6 space-y-4">

        {!supported && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-xl p-3 text-sm text-red-500">{t('noSupport')}</div>
        )}

        {/* 文本输入 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={t('placeholder')}
            rows={5}
            className="w-full text-sm bg-transparent resize-none outline-none text-gray-800 dark:text-gray-200 placeholder-gray-300 dark:placeholder-gray-600"
          />
          <div className="text-xs text-gray-400 text-right mt-1">{text.length} 字</div>
        </div>

        {/* 参数设置 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-4">
          {/* 语音选择 */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">{t('voice')}</label>
            <select value={selectedVoice} onChange={e => setSelectedVoice(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none">
              {zhVoices.length > 0 && (
                <optgroup label="中文语音">
                  {zhVoices.map(v => <option key={v.name} value={v.name}>{v.name} ({v.lang})</option>)}
                </optgroup>
              )}
              {otherVoices.length > 0 && (
                <optgroup label="其他语音">
                  {otherVoices.map(v => <option key={v.name} value={v.name}>{v.name} ({v.lang})</option>)}
                </optgroup>
              )}
            </select>
          </div>
          {/* 语速/音调/音量 */}
          {[{ key: 'rate', label: t('rate'), value: rate, set: setRate, min: 0.5, max: 2, step: 0.1 },
            { key: 'pitch', label: t('pitch'), value: pitch, set: setPitch, min: 0, max: 2, step: 0.1 },
            { key: 'volume', label: t('volume'), value: volume, set: setVolume, min: 0, max: 1, step: 0.1 },
          ].map(({ key, label, value, set, min, max, step }) => (
            <div key={key}>
              <div className="flex justify-between mb-1">
                <label className="text-xs text-gray-500">{label}</label>
                <span className="text-xs text-indigo-500 font-medium">{value.toFixed(1)}</span>
              </div>
              <input type="range" min={min} max={max} step={step} value={value}
                onChange={e => set(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full appearance-none cursor-pointer accent-indigo-600" />
            </div>
          ))}
        </div>

        {/* 控制按钮 */}
        <div className="flex gap-3">
          <button onClick={speak} disabled={!supported || status === 'speaking'}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-medium transition-colors">
            <Volume2 className="w-4 h-4" />{t('speak')}
          </button>
          {status !== 'idle' && (
            <>
              <button onClick={togglePause}
                className="px-4 py-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-xl hover:bg-amber-200 transition-colors">
                {status === 'paused' ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              </button>
              <button onClick={stop}
                className="px-4 py-3 bg-red-100 dark:bg-red-900/30 text-red-500 rounded-xl hover:bg-red-200 transition-colors">
                <Square className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {/* 状态 */}
        {status === 'speaking' && (
          <div className="flex items-center gap-2 text-sm text-indigo-500">
            <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />正在朗读...
          </div>
        )}
        {status === 'paused' && (
          <div className="text-sm text-amber-500">⏸ 已暂停</div>
        )}
      </div>
    </div>
  )
}
