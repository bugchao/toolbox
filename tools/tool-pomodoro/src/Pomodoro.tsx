import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Play, Pause, RotateCcw, Coffee, Brain } from 'lucide-react'

type Mode = 'focus' | 'short' | 'long'

const MODE_CONFIG: Record<Mode, { label: string; duration: number; color: string; bg: string }> = {
  focus: { label: '专注', duration: 25 * 60, color: 'text-red-500', bg: 'bg-red-500' },
  short: { label: '短休息', duration: 5 * 60, color: 'text-green-500', bg: 'bg-green-500' },
  long: { label: '长休息', duration: 15 * 60, color: 'text-blue-500', bg: 'bg-blue-500' },
}

interface Session { mode: Mode; completedAt: string }

export function Pomodoro() {
  const [mode, setMode] = useState<Mode>('focus')
  const [timeLeft, setTimeLeft] = useState(MODE_CONFIG.focus.duration)
  const [running, setRunning] = useState(false)
  const [sessions, setSessions] = useState<Session[]>([])
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const cfg = MODE_CONFIG[mode]

  const reset = useCallback(() => {
    setRunning(false)
    if (intervalRef.current) clearInterval(intervalRef.current)
    setTimeLeft(MODE_CONFIG[mode].duration)
  }, [mode])

  useEffect(() => { reset() }, [mode])

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            clearInterval(intervalRef.current!)
            setRunning(false)
            setSessions(s => [...s, { mode, completedAt: new Date().toLocaleTimeString() }])
            return 0
          }
          return t - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running, mode])

  const mins = String(Math.floor(timeLeft / 60)).padStart(2, '0')
  const secs = String(timeLeft % 60).padStart(2, '0')
  const total = MODE_CONFIG[mode].duration
  const pct = ((total - timeLeft) / total) * 100

  const focusDone = sessions.filter(s => s.mode === 'focus').length

  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 text-center">番茄钟</h1>

      {/* 模式切换 */}
      <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
        {(Object.keys(MODE_CONFIG) as Mode[]).map(m => (
          <button key={m} onClick={() => setMode(m)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === m ? 'bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-gray-100' : 'text-gray-500'
            }`}>{MODE_CONFIG[m].label}</button>
        ))}
      </div>

      {/* 计时圆 */}
      <div className="flex justify-center">
        <div className="relative w-52 h-52">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="4" className="text-gray-200 dark:text-gray-700" />
            <circle cx="50" cy="50" r="45" fill="none" strokeWidth="4"
              strokeLinecap="round"
              stroke="currentColor"
              className={cfg.color}
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - pct / 100)}`}
              style={{ transition: 'stroke-dashoffset 1s linear' }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-mono font-bold text-gray-900 dark:text-gray-100">{mins}:{secs}</span>
            <span className={`text-sm font-medium mt-1 ${cfg.color}`}>{cfg.label}</span>
          </div>
        </div>
      </div>

      {/* 控制按钮 */}
      <div className="flex gap-3 justify-center">
        <button onClick={reset}
          className="p-3 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-gray-200 transition-colors">
          <RotateCcw className="w-5 h-5" />
        </button>
        <button onClick={() => setRunning(r => !r)}
          className={`px-8 py-3 rounded-full font-semibold text-white transition-colors ${cfg.bg} hover:opacity-90`}>
          {running ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </button>
      </div>

      {/* 统计 */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 text-center">
          <div className="text-2xl font-bold text-red-500">{focusDone}</div>
          <div className="text-xs text-gray-500 mt-1 flex items-center justify-center gap-1"><Brain className="w-3 h-3" />专注完成</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 text-center">
          <div className="text-2xl font-bold text-green-500">{focusDone * 25}</div>
          <div className="text-xs text-gray-500 mt-1">专注分钟</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 text-center">
          <div className="text-2xl font-bold text-blue-500">{sessions.filter(s => s.mode !== 'focus').length}</div>
          <div className="text-xs text-gray-500 mt-1 flex items-center justify-center gap-1"><Coffee className="w-3 h-3" />休息次数</div>
        </div>
      </div>

      {/* 历史 */}
      {sessions.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="text-xs font-semibold text-gray-500 mb-2">今日记录</h3>
          <div className="flex flex-wrap gap-1.5">
            {sessions.map((s, i) => (
              <span key={i} className={`px-2 py-0.5 rounded text-xs ${
                s.mode === 'focus' ? 'bg-red-100 dark:bg-red-900/30 text-red-600' :
                s.mode === 'short' ? 'bg-green-100 dark:bg-green-900/30 text-green-600' :
                'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
              }`}>{MODE_CONFIG[s.mode].label} {s.completedAt}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
