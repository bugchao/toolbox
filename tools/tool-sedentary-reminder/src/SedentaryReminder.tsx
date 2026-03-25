import React, { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { AlarmClock, Play, Square, RotateCcw } from 'lucide-react'
import { PageHero } from '@toolbox/ui-kit'

const STRETCHES = [
  { name: '颈部旋转', desc: '缓慢转动头部，顺逆时针各10次', emoji: '🔄' },
  { name: '肩部环绕', desc: '双肩向后环绕，做10次', emoji: '💆' },
  { name: '扩胸伸展', desc: '双手交叉于背后，挺胸向上伸展，保持15秒', emoji: '🙆' },
  { name: '腰部侧弯', desc: '站立，左右侧弯各10次', emoji: '🧘' },
  { name: '踮脚站立', desc: '缓慢踮脚，保持3秒后放下，重复15次', emoji: '🦶' },
  { name: '眼部放松', desc: '闭眼休息20秒，或眺望远处放松眼肌', emoji: '👀' },
]

export default function SedentaryReminder() {
  const { t } = useTranslation('toolSedentaryReminder')
  const [interval, setIntervalMin] = useState(45)
  const [running, setRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [breaks, setBreaks] = useState(0)
  const [alerting, setAlerting] = useState(false)
  const [stretchIdx, setStretchIdx] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const target = interval * 60
  const remaining = Math.max(0, target - elapsed)
  const mm = String(Math.floor(remaining / 60)).padStart(2, '0')
  const ss = String(remaining % 60).padStart(2, '0')
  const pct = Math.round(elapsed / target * 100)

  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(() => {
        setElapsed(e => {
          if (e + 1 >= target) {
            setAlerting(true)
            setStretchIdx(Math.floor(Math.random() * STRETCHES.length))
            setBreaks(b => b + 1)
            setRunning(false)
            try { new Notification(t('timeToMove'), { body: STRETCHES[Math.floor(Math.random() * STRETCHES.length)].name }) } catch {}
            return 0
          }
          return e + 1
        })
      }, 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [running, target, t])

  const reset = () => { setRunning(false); setElapsed(0); setAlerting(false) }

  const circumference = 2 * Math.PI * 54

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHero title={t('title')} description={t('description')} icon={AlarmClock} />
      <div className="max-w-md mx-auto px-4 py-6 space-y-4">

        {alerting && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-400 rounded-2xl p-5 text-center space-y-3">
            <div className="text-4xl">{STRETCHES[stretchIdx].emoji}</div>
            <h3 className="text-lg font-bold text-amber-700 dark:text-amber-300">{t('timeToMove')}</h3>
            <p className="font-semibold text-amber-800 dark:text-amber-200">{STRETCHES[stretchIdx].name}</p>
            <p className="text-sm text-amber-700 dark:text-amber-300">{STRETCHES[stretchIdx].desc}</p>
            <button onClick={() => { setAlerting(false); setRunning(true) }}
              className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium">好的，已活动</button>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 flex flex-col items-center gap-4">
          <div className="relative w-36 h-36">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="54" fill="none" stroke="#e5e7eb" strokeWidth="8" />
              <circle cx="60" cy="60" r="54" fill="none" stroke="#6366f1" strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - pct / 100)}
                className="transition-all duration-1000" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-gray-900 dark:text-gray-100 tabular-nums">{mm}:{ss}</span>
              <span className="text-xs text-gray-400">{running ? t('sitting') : '已暂停'}</span>
            </div>
          </div>

          <div className="w-full">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>{t('interval')}</span>
              <span className="text-indigo-600 font-medium">{interval} {t('minutes')}</span>
            </div>
            <input type="range" min={15} max={120} step={5} value={interval}
              onChange={e => { setIntervalMin(parseInt(e.target.value)); reset() }}
              className="w-full h-1.5 accent-indigo-600" />
          </div>

          <div className="flex items-center gap-3">
            <button onClick={reset} className="p-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 rounded-full text-gray-500 transition-colors">
              <RotateCcw className="w-5 h-5" />
            </button>
            <button onClick={() => setRunning(r => !r)}
              className={`px-8 py-3 rounded-xl font-bold text-base transition-colors ${
                running ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}>
              {running ? <><Square className="w-5 h-5 inline mr-1" />{t('stop')}</> : <><Play className="w-5 h-5 inline mr-1" />{t('start')}</>}
            </button>
          </div>

          <div className="flex gap-6 text-center">
            <div>
              <div className="text-xl font-bold text-indigo-600">{breaks}</div>
              <div className="text-xs text-gray-400">{t('todayBreaks')}</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">{t('stretches')}</p>
          <div className="grid grid-cols-2 gap-2">
            {STRETCHES.map((s, i) => (
              <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-700">
                <span className="text-lg">{s.emoji}</span>
                <div>
                  <div className="text-xs font-medium text-gray-700 dark:text-gray-300">{s.name}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
