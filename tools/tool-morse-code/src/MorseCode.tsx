import React, { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Copy, Check, Radio, Play, Square } from 'lucide-react'
import { PageHero } from '@toolbox/ui-kit'

const MORSE: Record<string, string> = {
  A:'.-', B:'-...', C:'-.-.', D:'-..', E:'.', F:'..-.', G:'--.', H:'....', I:'..', J:'.---',
  K:'-.-', L:'.-..', M:'--', N:'-.', O:'---', P:'.--.', Q:'--.-', R:'.-.', S:'...', T:'-',
  U:'..-', V:'...-', W:'.--', X:'-..-', Y:'-.--', Z:'--..',
  '0':'-----','1':'.----','2':'..---','3':'...--','4':'....-','5':'.....',
  '6':'-....','7':'--...','8':'---..','9':'----.',
  '.':'.-.-.-',',':'--..--','?':'..--..','!':'-.-.--','/':'-..-.','(':'-.--.',')':`-.--.-`,
  '&':'.-...',':':'---...',';':'-.-.-.','=':'-...-','+':'.-.-.','–':'-....-','_':'..--.-',
}
const MORSE_INV = Object.fromEntries(Object.entries(MORSE).map(([k, v]) => [v, k]))

const textToMorse = (text: string) =>
  text.toUpperCase().split('').map(c => c === ' ' ? '/' : (MORSE[c] || '?')).join(' ')

const morseToText = (morse: string) =>
  morse.trim().split(' / ').map(word =>
    word.split(' ').map(code => MORSE_INV[code] || '?').join('')
  ).join(' ')

export default function MorseCode() {
  const { t } = useTranslation('toolMorseCode')
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')
  const [input, setInput] = useState('')
  const [copied, setCopied] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const stopRef = useRef(false)
  const audioCtxRef = useRef<AudioContext | null>(null)

  const output = mode === 'encode' ? textToMorse(input) : morseToText(input)

  const copy = () => {
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const playMorse = async () => {
    const morse = mode === 'encode' ? output : textToMorse(output)
    stopRef.current = false
    setPlaying(true)
    const ctx = new AudioContext()
    audioCtxRef.current = ctx
    const dot = 0.06 / speed
    let t = ctx.currentTime
    for (const c of morse) {
      if (stopRef.current) break
      if (c === '.') {
        const o = ctx.createOscillator()
        const g = ctx.createGain()
        o.connect(g); g.connect(ctx.destination)
        o.frequency.value = 600; g.gain.value = 0.3
        o.start(t); o.stop(t + dot)
        t += dot + dot * 0.5
      } else if (c === '-') {
        const o = ctx.createOscillator()
        const g = ctx.createGain()
        o.connect(g); g.connect(ctx.destination)
        o.frequency.value = 600; g.gain.value = 0.3
        o.start(t); o.stop(t + dot * 3)
        t += dot * 3 + dot * 0.5
      } else if (c === ' ') { t += dot * 3 }
      else if (c === '/') { t += dot * 7 }
    }
    setTimeout(() => { setPlaying(false); ctx.close() }, (t - ctx.currentTime) * 1000 + 200)
  }

  const stopPlay = () => {
    stopRef.current = true
    audioCtxRef.current?.close()
    setPlaying(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHero title={t('title')} description={t('description')} icon={Radio} />
      <div className="max-w-xl mx-auto px-4 py-6 space-y-4">
        <div className="flex bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-1">
          {(['encode', 'decode'] as const).map(m => (
            <button key={m} onClick={() => { setMode(m); setInput('') }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                mode === m ? 'bg-indigo-600 text-white' : 'text-gray-500'
              }`}>{m === 'encode' ? t('textToMorse') : t('morseToText')}</button>
          ))}
        </div>
        <textarea value={input} onChange={e => setInput(e.target.value)} rows={4}
          placeholder={mode === 'encode' ? t('textPlaceholder') : t('morsePlaceholder')}
          className="w-full px-4 py-3 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-300 resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500" />
        {output && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-mono text-gray-800 dark:text-gray-200 break-all">{output}</p>
              <button onClick={copy} className="shrink-0 text-gray-300 hover:text-indigo-500">
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}
        {mode === 'encode' && output && (
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex justify-between mb-1 text-xs text-gray-400">
                <span>{t('speed')}</span><span>{speed.toFixed(1)}x</span>
              </div>
              <input type="range" min={0.5} max={3} step={0.5} value={speed}
                onChange={e => setSpeed(parseFloat(e.target.value))}
                className="w-full h-1.5 accent-indigo-600" />
            </div>
            <button onClick={playing ? stopPlay : playMorse}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                playing ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}>
              {playing ? <><Square className="w-4 h-4" />{t('stop')}</> : <><Play className="w-4 h-4" />{t('play')}</>}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
