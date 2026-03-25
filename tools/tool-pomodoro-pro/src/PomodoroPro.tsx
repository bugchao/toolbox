import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Timer, Play, Pause, RotateCcw, SkipForward, Plus, Trash2, Check } from 'lucide-react'
import { PageHero } from '@toolbox/ui-kit'
import { useToolStorage } from '@toolbox/storage'

type Phase = 'work' | 'shortBreak' | 'longBreak'
interface Task { id: string; text: string; done: boolean; pomodoros: number }
interface Stats { today: number; total: number; totalMinutes: number }
interface PomData { tasks: Task[]; stats: Stats }
const DEFAULT: PomData = { tasks: [], stats: { today: 0, total: 0, totalMinutes: 0 } }

const DURATIONS: Record<Phase, number> = { work: 25 * 60, shortBreak: 5 * 60, longBreak: 15 * 60 }
const PHASE_COLORS: Record<Phase, string> = {
  work: 'from-rose-500 to-red-600',
  shortBreak: 'from-emerald-500 to-green-600',
  longBreak: 'from-blue-500 to-indigo-600',
}

export default function PomodoroPro() {
  const { t } = useTranslation('toolPomodoroPro')
  const { data, save } = useToolStorage<PomData>('pomodoro-pro', 'data', DEFAULT)
  const [phase, setPhase] = useState<Phase>('work')
  const [timeLeft, setTimeLeft] = useState(DURATIONS.work)
  const [running, setRunning] = useState(false)
  const [pomCount, setPomCount] = useState(0)
  const [newTask, setNewTask] = useState('')
  const [activeTask, setActiveTask] = useState<string | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const total = DURATIONS[phase]
  const pct = Math.round((1 - timeLeft / total) * 100)
  const mm = String(Math.floor(timeLeft / 60)).padStart(2, '0')
  const ss = String(timeLeft % 60).padStart(2, '0')

  const switchPhase = useCallback((p: Phase) => {
    setPhase(p)
    setTimeLeft(DURATIONS[p])
    setRunning(false)
  }, [])

  const completePom = useCallback(() => {
    const next = pomCount + 1
    setPomCount(next)
    const newStats = {
      today: data.stats.today + 1,
      total: data.stats.total + 1,
      totalMinutes: data.stats.totalMinutes + 25,
    }
    const newTasks = activeTask
      ? data.tasks.map(t => t.id === activeTask ? { ...t, pomodoros: t.pomodoros + 1 } : t)
      : data.tasks
    save({ tasks: newTasks, stats: newStats })
    if (next % 4 === 0) switchPhase('longBreak')
    else switchPhase('shortBreak')
    try { new Notification('番茄钟完成！', { body: '休息一下吧 ☕' }) } catch {}
  }, [pomCount, activeTask, data, save, switchPhase])

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) { clearInterval(intervalRef.current!); completePom(); return 0 }
          return t - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running, completePom])

  const reset = () => { setRunning(false); setTimeLeft(DURATIONS[phase]) }

  const addTask = () => {
    if (!newTask.trim()) return
    const task: Task = { id: Date.now().toString(), text: newTask.trim(), done: false, pomodoros: 0 }
    save({ ...data, tasks: [...data.tasks, task] })
    setNewTask('')
  }

  const toggleTask = (id: string) => {
    save({ ...data, tasks: data.tasks.map(t => t.id === id ? { ...t, done: !t.done } : t) })
  }

  const removeTask = (id: string) => {
    save({ ...data, tasks: data.tasks.filter(t => t.id !== id) })
    if (activeTask === id) setActiveTask(null)
  }

  const circumference = 2 * Math.PI * 54

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHero title={t('title')} description={t('description')} icon={Timer} />
      <div className="max-w-md mx-auto px-4 py-6 space-y-4">

        {/* 阶段切换 */}
        <div className="flex bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-1">
          {(['work', 'shortBreak', 'longBreak'] as Phase[]).map(p => (
            <button key={p} onClick={() => switchPhase(p)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                phase === p ? 'bg-indigo-600 text-white' : 'text-gray-500'
              }`}>{t(p)}</button>
          ))}
        </div>

        {/* 计时器圆环 */}
        <div className={`bg-gradient-to-br ${PHASE_COLORS[phase]} rounded-2xl p-8 flex flex-col items-center gap-4`}>
          <div className="relative w-36 h-36">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="8" />
              <circle cx="60" cy="60" r="54" fill="none" stroke="white" strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - pct / 100)}
                className="transition-all duration-1000" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl font-bold text-white tabular-nums">{mm}:{ss}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={reset} className="p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors">
              <RotateCcw className="w-5 h-5" />
            </button>
            <button onClick={() => setRunning(r => !r)}
              className="px-8 py-3 bg-white text-gray-900 rounded-full font-bold text-lg shadow-lg hover:bg-gray-100 transition-colors">
              {running ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </button>
            <button onClick={() => switchPhase(phase === 'work' ? 'shortBreak' : 'work')}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors">
              <SkipForward className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center gap-4 text-white/80 text-sm">
            <span>{t('todayPomodoros')}: <strong className="text-white">{data.stats.today}</strong></span>
            <span>{t('totalFocus')}: <strong className="text-white">{data.stats.totalMinutes}min</strong></span>
          </div>
          <div className="flex gap-1">{[0,1,2,3].map(i => (
            <div key={i} className={`w-3 h-3 rounded-full ${ i < pomCount % 4 ? 'bg-white' : 'bg-white/30'}`} />
          ))}</div>
        </div>

        {/* 任务列表 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
          <div className="flex gap-2">
            <input value={newTask} onChange={e => setNewTask(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addTask()}
              placeholder={t('taskPlaceholder')}
              className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
            <button onClick={addTask} className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          {data.tasks.length === 0 && (
            <p className="text-sm text-center text-gray-400 py-2">{t('taskPlaceholder')}</p>
          )}
          {data.tasks.map(task => (
            <div key={task.id}
              onClick={() => setActiveTask(activeTask === task.id ? null : task.id)}
              className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                activeTask === task.id ? 'bg-indigo-50 dark:bg-indigo-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700/30'
              }`}>
              <button onClick={e => { e.stopPropagation(); toggleTask(task.id) }}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                  task.done ? 'bg-green-500 border-green-500' : 'border-gray-300'
                }`}>
                {task.done && <Check className="w-3 h-3 text-white" />}
              </button>
              <span className={`flex-1 text-sm ${task.done ? 'line-through text-gray-400' : 'text-gray-800 dark:text-gray-200'}`}>
                {task.text}
              </span>
              <span className="text-xs text-rose-500 shrink-0">🍅×{task.pomodoros}</span>
              <button onClick={e => { e.stopPropagation(); removeTask(task.id) }}
                className="text-gray-300 hover:text-red-400 shrink-0">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
        <p className="text-xs text-center text-gray-400">{t('autoSave')}</p>
      </div>
    </div>
  )
}
