import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Play, Pause, RotateCcw, Coffee, Brain } from 'lucide-react'
import { useToolStorage } from '@toolbox/storage'

type Mode = 'focus' | 'short' | 'long'

const MODE_CONFIG: Record<Mode, { label: string; duration: number; color: string; bg: string }> = {
  focus: { label: '专注', duration: 25 * 60, color: 'text-red-500', bg: 'bg-red-500' },
  short: { label: '短休息', duration: 5 * 60, color: 'text-green-500', bg: 'bg-green-500' },
  long: { label: '长休息', duration: 15 * 60, color: 'text-blue-500', bg: 'bg-blue-500' },
}

interface PomodoroSession { mode: Mode; completedAt: string; date: string }

interface PomodoroData {
  sessions: PomodoroSession[]
  totalFocus: number // total completed focus sessions ever
}

const DEFAULT_DATA: PomodoroData = { sessions: [], totalFocus: 0 }

export function Pomodoro() {
  const { data, save, loading, error, backend } = useToolStorage<PomodoroData>(
    'pomodoro', 'data', DEFAULT_DATA
  )

  const [mode, setMode] = useState<Mode>('focus')
  const [timeLeft, setTimeLeft] = useState(MODE_CONFIG.focus.duration)
  const [running, setRunning] = useState(false)
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
            const now = new Date()
            const session: PomodoroSession = {
              mode,
              completedAt: now.toLocaleTimeString(),
              date: now.toISOString().slice(0, 10),
            }
            // persist completed session
            save({
              sessions: [...data.sessions, session],
              totalFocus: data.totalFocus + (mode === 'focus' ? 1 : 0),
            })
            return 0
          }
          return t - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running, mode, data, save])

  const mins = String(Math.floor(timeLeft / 60)).padStart(2, '0')
  const secs = String(timeLeft % 60).padStart(2, '0')
  const total = MODE_CONFIG[mode].duration
  const pct = ((total - timeLeft) / total) * 100

  // Today's sessions
  const today = new Date().toISOString().slice(0, 10)
  const todaySessions = data.sessions.filter(s => s.date === today)
  const focusDone = todaySessions.filter(s => s.mode === 'focus').length

  if (loading) return (
    <div className="max-w-md mx-auto p-6 text-center text-gray-400 py-20">加载中...</div>
  )

  if (error) return (
    <div className="max-w-md mx-auto p-6">
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
        <div className="text-red-600 dark:text-red-400 font-semibold mb-2">⚠️ 服务端不可用</div>
        <div className="text-sm text-red-500 dark:text-red-300 mb-4">{error}</div>
        <div className="text-xs text-red-400 dark:text-red-500">请确保后端服务已启动（node server.js）</div>
      </div>
    </div>
  )

  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 text-center flex-1">番茄钟</h1>
        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-400">
          {backend === 'server' ? '☁️ 云端' : '💾 本地'}
        </span>
      </div>

      {/* 模式切换 */}
      <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
        {(Object.keys(MODE_CONFIG) as Mode[]).map(m => (
          <button key={m} onClick={() => !running && setMode(m)}
            disabled={running}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-60 ${
              mode === m ? `bg-white dark:bg-gray-700 shadow ${MODE_CONFIG[m].color}` : 'text-gray-500'
            }`}>{MODE_CONFIG[m].label}</button>
        ))}
      </div>

      {/* 计时器圆环 */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-48 h-48">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor"
              className="text-gray-100 dark:text-gray-700" strokeWidth="6" />
            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor"
              className={cfg.color} strokeWidth="6" strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - pct / 100)}`}
              style={{ transition: 'stroke-dashoffset 0.5s ease' }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className={`text-4xl font-mono font-bold ${cfg.color}`}>{mins}:{secs}</div>
            <div className="text-sm text-gray-400 mt-1">{cfg.label}</div>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={reset}
            className="p-3 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-gray-200 transition-colors">
            <RotateCcw className="w-5 h-5" />
          </button>
          <button onClick={() => setRunning(r => !r)}
            className={`px-10 py-3 rounded-full font-semibold text-white transition-colors ${
              running ? 'bg-gray-400 hover:bg-gray-500' : `${cfg.bg} hover:opacity-90`
            }`}>
            {running ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* 今日统计 */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 text-center">
          <div className="text-2xl font-bold text-red-500">{focusDone}</div>
          <div className="text-xs text-gray-500 mt-1 flex items-center justify-center gap-1"><Brain className="w-3 h-3" />今日专注</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 text-center">
          <div className="text-2xl font-bold text-green-500">{focusDone * 25}</div>
          <div className="text-xs text-gray-500 mt-1">专注分钟</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 text-center">
          <div className="text-2xl font-bold text-indigo-500">{data.totalFocus}</div>
          <div className="text-xs text-gray-500 mt-1">累计番茄</div>
        </div>
      </div>

      {/* 今日记录 */}
      {todaySessions.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="text-xs font-semibold text-gray-500 mb-2">今日记录</h3>
          <div className="flex flex-wrap gap-1.5">
            {todaySessions.map((s, i) => (
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
