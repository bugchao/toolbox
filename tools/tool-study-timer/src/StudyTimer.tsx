import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Play, Pause, RotateCcw, BookOpen, BarChart2 } from 'lucide-react'

interface Session {
  subject: string
  duration: number // seconds
  date: string
}

const SUBJECTS = ['数学', '英语', '编程', '阅读', '写作', '物理', '化学', '历史', '其他']
const SUBJECT_COLORS: Record<string, string> = {
  数学: 'bg-blue-500', 英语: 'bg-green-500', 编程: 'bg-purple-500',
  阅读: 'bg-orange-500', 写作: 'bg-pink-500', 物理: 'bg-cyan-500',
  化学: 'bg-red-500', 历史: 'bg-yellow-500', 其他: 'bg-gray-500',
}

function fmtTime(s: number): string {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return h > 0
    ? `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
    : `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
}

function fmtDuration(s: number): string {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  if (h > 0) return `${h}h${m}m`
  return `${m}m`
}

export function StudyTimer() {
  const [subject, setSubject] = useState('编程')
  const [elapsed, setElapsed] = useState(0)
  const [running, setRunning] = useState(false)
  const [sessions, setSessions] = useState<Session[]>([])
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const today = new Date().toISOString().slice(0, 10)

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setElapsed(e => e + 1), 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running])

  const stop = useCallback(() => {
    setRunning(false)
    if (elapsed > 0) {
      setSessions(s => [...s, { subject, duration: elapsed, date: today }])
    }
    setElapsed(0)
  }, [elapsed, subject, today])

  const reset = () => { setRunning(false); setElapsed(0) }

  // 统计
  const todaySessions = sessions.filter(s => s.date === today)
  const todayTotal = todaySessions.reduce((sum, s) => sum + s.duration, 0)

  const subjectTotals = SUBJECTS.map(sub => ({
    subject: sub,
    total: sessions.filter(s => s.subject === sub).reduce((sum, s) => sum + s.duration, 0),
  })).filter(s => s.total > 0).sort((a, b) => b.total - a.total)

  const maxTotal = subjectTotals[0]?.total || 1

  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">学习计时器</h1>
      <p className="text-gray-500 dark:text-gray-400">记录学习时长，分科目统计，养成学习习惯</p>

      {/* 科目选择 */}
      <div className="flex flex-wrap gap-2">
        {SUBJECTS.map(s => (
          <button key={s} onClick={() => !running && setSubject(s)}
            disabled={running}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              subject === s ? `${SUBJECT_COLORS[s] || 'bg-gray-500'} text-white` : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            } disabled:opacity-60`}>{s}</button>
        ))}
      </div>

      {/* 计时器 */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 text-center">
        <div className="text-5xl font-mono font-bold text-gray-900 dark:text-gray-100 mb-2">{fmtTime(elapsed)}</div>
        <div className="text-sm text-gray-500 mb-6">正在学习：<span className="font-medium text-gray-700 dark:text-gray-300">{subject}</span></div>
        <div className="flex gap-3 justify-center">
          <button onClick={reset}
            className="p-3 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-gray-200 transition-colors">
            <RotateCcw className="w-5 h-5" />
          </button>
          <button onClick={() => setRunning(r => !r)}
            className={`px-8 py-3 rounded-full font-semibold text-white transition-colors ${
              running ? 'bg-orange-500 hover:bg-orange-600' : `${SUBJECT_COLORS[subject] || 'bg-gray-500'} hover:opacity-90`
            }`}>
            {running ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>
          {elapsed > 0 && !running && (
            <button onClick={stop}
              className="px-4 py-3 rounded-full bg-green-500 hover:bg-green-600 text-white font-medium text-sm transition-colors">
              记录
            </button>
          )}
        </div>
      </div>

      {/* 今日统计 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="w-4 h-4 text-indigo-500" />
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">今日学习</span>
          <span className="ml-auto text-sm font-bold text-indigo-500">{fmtDuration(todayTotal)}</span>
        </div>
        {todaySessions.length === 0 ? (
          <div className="text-xs text-gray-400 text-center py-2">今天还没有学习记录</div>
        ) : (
          <div className="space-y-1.5">
            {todaySessions.map((s, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span className={`w-2 h-2 rounded-full ${SUBJECT_COLORS[s.subject] || 'bg-gray-400'}`} />
                <span className="text-gray-600 dark:text-gray-400">{s.subject}</span>
                <span className="ml-auto text-gray-500 font-mono">{fmtDuration(s.duration)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 科目分布 */}
      {subjectTotals.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-2 mb-3">
            <BarChart2 className="w-4 h-4 text-indigo-500" />
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">科目统计</span>
          </div>
          <div className="space-y-2">
            {subjectTotals.map(s => (
              <div key={s.subject} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-12 shrink-0">{s.subject}</span>
                <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${SUBJECT_COLORS[s.subject] || 'bg-gray-400'}`}
                    style={{ width: `${s.total / maxTotal * 100}%` }} />
                </div>
                <span className="text-xs font-mono text-gray-500 w-12 text-right shrink-0">{fmtDuration(s.total)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
