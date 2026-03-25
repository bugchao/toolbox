import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { PageHero } from '@toolbox/ui-kit'
import { useToolStorage } from '@toolbox/storage'
import { 
  Focus, 
  Play, 
  Pause, 
  RotateCcw, 
  Square,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  CheckCircle2,
  Target,
  BarChart3,
  Flame,
  Clock,
  Lightbulb,
  CheckCheck
} from 'lucide-react'

type InterruptReason = 'phone' | 'notification' | 'self' | 'external' | 'other'

interface FocusSession {
  id: string
  startTime: string
  endTime: string
  duration: number
  taskName?: string
  completed: boolean
  interruptReason?: InterruptReason
}

const INTERRUPT_REASONS: { key: InterruptReason; label: string; icon: string }[] = [
  { key: 'phone', label: '手机/社交应用', icon: '📱' },
  { key: 'notification', label: '通知/消息', icon: '🔔' },
  { key: 'self', label: '自发性分心', icon: '💭' },
  { key: 'external', label: '外部干扰', icon: '👥' },
  { key: 'other', label: '其他原因', icon: '❓' }
]

interface CurrentSession {
  timeLeft: number
  totalTime: number
  status: 'ready' | 'focusing' | 'paused' | 'break'
  mode: 'focus' | 'shortBreak' | 'longBreak'
  cycles: number
  focusDuration: number
  shortBreakDuration: number
  longBreakDuration: number
  currentTask: string
  startTime: string
}

interface FocusState {
  sessions: FocusSession[]
  lastFocusDate: string
  streak: number
  currentSession?: CurrentSession
}

const DEFAULT_STATE: FocusState = {
  sessions: [],
  lastFocusDate: '',
  streak: 0
}

// 生成唯一ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// 格式化时间显示（mm:ss）
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// 格式化时长显示
function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}分钟`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`
}

export default function FocusMode() {
  const { t } = useTranslation('toolFocusMode')
  const { data: state, save } = useToolStorage<FocusState>('focus-mode', 'data', DEFAULT_STATE)
  
  // 计时器状态
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [totalTime, setTotalTime] = useState(25 * 60)
  const [status, setStatus] = useState<'ready' | 'focusing' | 'paused' | 'break'>('ready')
  const [mode, setMode] = useState<'focus' | 'shortBreak' | 'longBreak'>('focus')
  const [cycles, setCycles] = useState(0)
  
  // 设置
  const [focusDuration, setFocusDuration] = useState(25)
  const [shortBreakDuration, setShortBreakDuration] = useState(5)
  const [longBreakDuration, setLongBreakDuration] = useState(15)
  const [sound, setSound] = useState<'none' | 'rain' | 'cafe' | 'forest' | 'waves' | 'fire'>('none')
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [currentTask, setCurrentTask] = useState('')
  
  // 统计
  const [showStats, setShowStats] = useState(false)
  const [tipIndex, setTipIndex] = useState(0)
  
  // 打断原因记录
  const [showInterruptDialog, setShowInterruptDialog] = useState(false)
  
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  
  // 预设时长选项
  const focusPresets = [15, 25, 45, 60, 90]
  const breakPresets = [5, 10, 15, 20, 30]
  
  // 恢复保存的状态
  useEffect(() => {
    if (state.currentSession) {
      const saved = state.currentSession
      // 检查保存的状态是否过期（超过24小时）
      const savedTime = new Date(saved.startTime).getTime()
      const now = Date.now()
      const hoursPassed = (now - savedTime) / (1000 * 60 * 60)
      
      if (hoursPassed < 24) {
        setTimeLeft(saved.timeLeft)
        setTotalTime(saved.totalTime)
        setStatus(saved.status === 'focusing' ? 'paused' : saved.status) // 长时间后自动暂停
        setMode(saved.mode)
        setCycles(saved.cycles)
        setFocusDuration(saved.focusDuration)
        setShortBreakDuration(saved.shortBreakDuration)
        setLongBreakDuration(saved.longBreakDuration)
        setCurrentTask(saved.currentTask)
      } else {
        // 状态过期，清除
        const { currentSession: _, ...rest } = state
        save(rest)
      }
    }
  }, [state.currentSession])
  
  // 保存当前状态
  useEffect(() => {
    if (status !== 'ready') {
      const currentSession: CurrentSession = {
        timeLeft,
        totalTime,
        status,
        mode,
        cycles,
        focusDuration,
        shortBreakDuration,
        longBreakDuration,
        currentTask,
        startTime: new Date().toISOString()
      }
      save({ ...state, currentSession })
    } else {
      // 清除当前会话状态
      const { currentSession: _, ...rest } = state
      save(rest)
    }
  }, [timeLeft, status, mode, cycles, focusDuration, shortBreakDuration, longBreakDuration, currentTask])
  
  // 计算统计数据
  const stats = React.useMemo(() => {
    const today = new Date().toDateString()
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    
    const todaySessions = state.sessions.filter(s => 
      new Date(s.startTime).toDateString() === today
    )
    const weekSessions = state.sessions.filter(s => 
      new Date(s.startTime) >= weekAgo
    )
    
    const todayMinutes = todaySessions.reduce((sum, s) => sum + s.duration, 0)
    const weekMinutes = weekSessions.reduce((sum, s) => sum + s.duration, 0)
    const totalMinutes = state.sessions.reduce((sum, s) => sum + s.duration, 0)
    
    return {
      today: todayMinutes,
      week: weekMinutes,
      total: totalMinutes,
      count: state.sessions.length,
      avg: state.sessions.length > 0 ? Math.round(totalMinutes / state.sessions.length) : 0,
      best: state.sessions.length > 0 ? Math.max(...state.sessions.map(s => s.duration)) : 0,
      streak: state.streak
    }
  }, [state])
  
  // 切换提示
  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex(prev => (prev + 1) % 5)
    }, 10000)
    return () => clearInterval(interval)
  }, [])
  
  // 计时器逻辑
  useEffect(() => {
    if (status === 'focusing' || status === 'break') {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // 计时结束
            handleComplete()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [status])
  
  // 标题更新
  useEffect(() => {
    if (status === 'focusing') {
      document.title = `(${formatTime(timeLeft)}) 专注中 - 专注模式`
    } else if (status === 'break') {
      document.title = `(${formatTime(timeLeft)}) 休息中 - 专注模式`
    } else {
      document.title = '专注模式'
    }
    
    return () => {
      document.title = '工具盒子'
    }
  }, [status, timeLeft])
  
  // 计时完成处理
  const handleComplete = () => {
    if (status === 'focusing') {
      // 保存专注记录
      const session: FocusSession = {
        id: generateId(),
        startTime: new Date(Date.now() - totalTime * 1000).toISOString(),
        endTime: new Date().toISOString(),
        duration: totalTime / 60,
        taskName: currentTask || undefined,
        completed: true
      }
      
      // 更新连续打卡
      const today = new Date().toDateString()
      const lastDate = state.lastFocusDate
      let newStreak = state.streak
      
      if (lastDate) {
        const last = new Date(lastDate)
        const diff = Math.floor((Date.now() - last.getTime()) / (1000 * 60 * 60 * 24))
        if (diff === 1) {
          newStreak = state.streak + 1
        } else if (diff > 1) {
          newStreak = 1
        }
      } else {
        newStreak = 1
      }
      
      const { currentSession: _, ...restState } = state
      save({
        ...restState,
        sessions: [...state.sessions, session],
        lastFocusDate: today,
        streak: newStreak
      })
      
      // 播放提示音
      playNotification()
      
      // 进入休息
      const newCycles = cycles + 1
      setCycles(newCycles)
      
      if (newCycles % 4 === 0) {
        setMode('longBreak')
        setTimeLeft(longBreakDuration * 60)
        setTotalTime(longBreakDuration * 60)
      } else {
        setMode('shortBreak')
        setTimeLeft(shortBreakDuration * 60)
        setTotalTime(shortBreakDuration * 60)
      }
      setStatus('break')
      
    } else if (status === 'break') {
      playNotification()
      setMode('focus')
      setTimeLeft(focusDuration * 60)
      setTotalTime(focusDuration * 60)
      setStatus('ready')
    }
  }
  
  // 播放提示音
  const playNotification = () => {
    const audio = new Audio()
    audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZSw0PVanu87plHQUuh9Dz2YU2Bhxqv+zplkcODVGm5O+4ZSAEMYrO89GFNwYdcfDr4ZdJDQtPp+XysWUeBjiS1/LNfi0GI33R8tOENAcdcO/r4phJDQxPqOXyxWUhBDeS1/LNfi0GI33R8tOENAcdcO/r4phJDQxPqOXyxWUhBDeS1/LNfi0GI33R8tOENAcdcO/r4phJDQxPqOXyxWUhBDeS1/LNfi0GI33R8tOENAcdcO/r4phJDQxPqOXyxWUhBDeS1/LNfi0GI33R8tOENAcdcO/r4phJDQxPqOXyxWUhBDeS1/LNfi0GI33R8tOENAcdcO/r4phJDQxPqOXyxWUhBDeS1/LNfi0GI33R8tOENAcdcO/r4phJDQxPqOXyxWUhBDeS1/LNfi0GI33R8tOENAcdcO/r4phJDQxPqOXyxWUhBDeS1/LNfi0GI33R8tOENAcdcO/r4phJDQxPqOXyxWUhBDeS1/LNfi0GI33R8tOENAcdcO/r4phJDQxPqOXyxWUhBDeS1/LNfi0GI33R8tOENAcdcO/r4phJDQxPqOXyxWUhBDeS1/LNfi0GI33R8tOENAcdcO/r4phJDQxPqOXyxWUhBDeS1/LNfi0GI33R8tOENAcdcO/r4phJDQxPqOXyxWUhBDeS1/LNfi0GI33R8tOENAcdcO/r4phJDQxPqOXyxWUhBDeS1/LNfi0GI33R8tOENAcdcO/r4phJDQxPqOXyxWUhBDeS1/LNfi0GI33R8tOENAcdcO/r4phJDQxPqOXyxWUhBDeS1/LNfi0GI33R8tOENAcdcO/r4phJDQxPqOXyxWUhBDeS1/LNfi0GI33R8tOENAcdcO/r4phJDQxPqOXyxWUhBDeS1/LNfi0GI33R8tOENAcdcO/r4phJDQxPqOXyxWUhBDeS1/LNfi0GI33R8tOENAcdcO/r4phJDQxPqOXyxWUhBDeS1/LNfi0GI33R8tOENAcdcO/r4phJDQxPqOXyxWUhBDeS1/LNfi0GI33R8tOENAcdcO/r4phJDQxPqOXyxWUhBDeS1/LNfi0GI33R8tOENAcdcO/r4phJDQxPqOXyxWUhBDeS1/LNfi0GI33R8tOENAcdcO/r4phJDQxPqOXyxWUhBDeS1/LNfi0GI33R8tOENAcdcO/r4phJDQxPqOXyxWUhBDeS1/LNfi0GI33R8tOENAcdcO/r4phJDQxPqOXyxWUhBDeS1/LNfi0GI33R8tOENAcdcO/r4phJDQxPqOXyxWUhBDeS1/LNfi0GI33R8tOENAcdcO/r4phJDQxPqOXyxWUhBD'
    audio.play().catch(() => {})
  }
  
  // 控制按钮
  const handleStart = () => {
    setStatus('focusing')
    setMode('focus')
  }
  
  const handlePause = () => {
    setStatus('paused')
  }
  
  const handleResume = () => {
    setStatus(mode === 'focus' ? 'focusing' : 'break')
  }
  
  const handleReset = () => {
    setStatus('ready')
    setTimeLeft(focusDuration * 60)
    setTotalTime(focusDuration * 60)
    setMode('focus')
    setCycles(0)
    // 清除保存的状态
    const { currentSession: _, ...rest } = state
    save(rest)
  }
  
  const handleStop = () => {
    // 如果专注时间超过1分钟，显示打断原因选择
    if (status === 'focusing' && totalTime - timeLeft > 60) {
      setShowInterruptDialog(true)
    } else {
      handleReset()
    }
  }
  
  // 保存打断原因并停止
  const saveInterruptAndStop = (reason: InterruptReason) => {
    const session: FocusSession = {
      id: generateId(),
      startTime: new Date(Date.now() - (totalTime - timeLeft) * 1000).toISOString(),
      endTime: new Date().toISOString(),
      duration: Math.floor((totalTime - timeLeft) / 60),
      taskName: currentTask || undefined,
      completed: false,
      interruptReason: reason
    }
    
    const { currentSession: _, ...restState } = state
    save({
      ...restState,
      sessions: [...state.sessions, session]
    })
    
    setShowInterruptDialog(false)
    handleReset()
  }
  
  // 获取状态颜色和图标
  const getStatusColor = () => {
    switch (status) {
      case 'focusing': return 'text-indigo-600 dark:text-indigo-400'
      case 'break': return 'text-green-600 dark:text-green-400'
      case 'paused': return 'text-amber-600 dark:text-amber-400'
      default: return 'text-gray-600 dark:text-gray-400'
    }
  }
  
  const getStatusBg = () => {
    switch (status) {
      case 'focusing': return 'bg-indigo-50 dark:bg-indigo-900/20'
      case 'break': return 'bg-green-50 dark:bg-green-900/20'
      case 'paused': return 'bg-amber-50 dark:bg-amber-900/20'
      default: return 'bg-gray-50 dark:bg-gray-800/50'
    }
  }
  
  // 获取状态文字
  const getStatusText = () => {
    switch (status) {
      case 'focusing': return t('focusing')
      case 'break': return t('break')
      case 'paused': return t('paused')
      default: return t('ready')
    }
  }
  
  // 全屏切换
  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen)
  }
  
  // 计算进度百分比
  const progress = totalTime > 0 ? ((totalTime - timeLeft) / totalTime) * 100 : 0
  
  // 沉浸式模式
  if (isFullScreen) {
    return (
      <div className="fixed inset-0 z-50 bg-gray-900 flex flex-col items-center justify-center">
        {/* 背景效果 */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/50 via-purple-900/50 to-pink-900/50 animate-pulse" />
        </div>
        
        {/* 退出全屏 */}
        <button
          onClick={toggleFullScreen}
          className="absolute top-4 right-4 p-2 text-white/60 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
        >
          <Minimize className="w-5 h-5" />
        </button>
        
        {/* 计时器 */}
        <div className="relative z-10 text-center">
          <div className={`text-8xl md:text-9xl font-mono font-bold tabular-nums tracking-tight ${getStatusColor()}`}>
            {formatTime(timeLeft)}
          </div>
          <div className="mt-4 text-white/60 text-lg">{getStatusText()}</div>
          
          {/* 控制按钮 */}
          <div className="mt-8 flex items-center justify-center gap-4">
            {status === 'ready' || status === 'break' ? (
              <button
                onClick={handleStart}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors"
              >
                <Play className="w-5 h-5" />
                {status === 'break' ? t('nextFocus') : t('start')}
              </button>
            ) : status === 'paused' ? (
              <button
                onClick={handleResume}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors"
              >
                <Play className="w-5 h-5" />
                {t('resume')}
              </button>
            ) : (
              <button
                onClick={handlePause}
                className="flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-medium transition-colors"
              >
                <Pause className="w-5 h-5" />
                {t('pause')}
              </button>
            )}
            
            <button
              onClick={handleReset}
              className="p-3 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHero
        title={t('title')}
        description={t('description')}
        icon={Focus}
      />
      
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* 主计时器卡片 */}
        <div className={`relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 ${getStatusBg()} transition-colors duration-500`}>
          {/* 进度条背景 */}
          <div 
            className="absolute top-0 left-0 h-1 bg-indigo-500 transition-all duration-1000"
            style={{ width: `${progress}%` }}
          />
          
          <div className="p-6 md:p-8">
            {/* 顶部工具栏 */}
            <div className="flex items-center justify-between mb-8">
              <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${getStatusColor()} bg-white/50 dark:bg-black/20`}>
                <div className={`w-1.5 h-1.5 rounded-full ${status === 'focusing' ? 'bg-indigo-500 animate-pulse' : status === 'break' ? 'bg-green-500' : 'bg-gray-400'}`} />
                {getStatusText()}
                {cycles > 0 && (
                  <span className="ml-1 text-gray-500">· {cycles} {t('cycles')}</span>
                )}
              </div>
              
              <div className="flex items-center gap-1">
                <button
                  onClick={toggleFullScreen}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-black/20 rounded-lg transition-colors"
                  title={t('fullScreen')}
                >
                  <Maximize className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* 大计时器 */}
            <div className="text-center mb-8">
              <div className={`text-6xl md:text-8xl font-mono font-bold tabular-nums tracking-tight ${getStatusColor()} transition-colors`}>
                {formatTime(timeLeft)}
              </div>
            </div>
            
            {/* 控制按钮 */}
            <div className="flex items-center justify-center gap-3">
              {status === 'ready' || status === 'break' ? (
                <button
                  onClick={handleStart}
                  className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors shadow-lg shadow-indigo-500/25"
                >
                  <Play className="w-5 h-5" />
                  {status === 'break' ? t('nextFocus') : t('start')}
                </button>
              ) : status === 'paused' ? (
                <>
                  <button
                    onClick={handleResume}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors"
                  >
                    <Play className="w-5 h-5" />
                    {t('resume')}
                  </button>
                  <button
                    onClick={handleStop}
                    className="flex items-center gap-2 px-4 py-3 bg-rose-100 hover:bg-rose-200 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 dark:hover:bg-rose-900/50 rounded-xl font-medium transition-colors"
                  >
                    <Square className="w-4 h-4" />
                    {t('stop')}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handlePause}
                    className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium transition-colors"
                  >
                    <Pause className="w-5 h-5" />
                    {t('pause')}
                  </button>
                  <button
                    onClick={handleStop}
                    className="p-3 text-gray-500 hover:text-rose-600 hover:bg-rose-50 dark:text-gray-400 dark:hover:text-rose-400 dark:hover:bg-rose-900/20 rounded-xl transition-colors"
                  >
                    <Square className="w-5 h-5" />
                  </button>
                </>
              )}
              
              {(status === 'paused' || status === 'ready') && (
                <button
                  onClick={handleReset}
                  className="p-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-black/20 rounded-xl transition-colors"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* 设置和统计 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 时长设置 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-500" />
              {t('focusTime')}
            </h3>
            <div className="flex flex-wrap gap-2">
              {focusPresets.map((min) => (
                <button
                  key={min}
                  onClick={() => {
                    setFocusDuration(min)
                    if (status === 'ready') {
                      setTimeLeft(min * 60)
                      setTotalTime(min * 60)
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    focusDuration === min
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {min}分钟
                </button>
              ))}
            </div>
            
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-4 mb-2 flex items-center gap-2">
              <Target className="w-4 h-4 text-green-500" />
              {t('breakTime')}
            </h3>
            <div className="flex flex-wrap gap-2">
              {breakPresets.map((min) => (
                <button
                  key={min}
                  onClick={() => setShortBreakDuration(min)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    shortBreakDuration === min
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {min}分钟
                </button>
              ))}
            </div>
          </div>
          
          {/* 音效和任务 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              {sound === 'none' ? <VolumeX className="w-4 h-4 text-gray-500" /> : <Volume2 className="w-4 h-4 text-cyan-500" />}
              {t('sound')}
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: 'none', label: t('soundNone') },
                { key: 'rain', label: t('soundRain') },
                { key: 'cafe', label: t('soundCafe') },
                { key: 'forest', label: t('soundForest') },
                { key: 'waves', label: t('soundWaves') },
                { key: 'fire', label: t('soundFire') }
              ].map((s) => (
                <button
                  key={s.key}
                  onClick={() => setSound(s.key as any)}
                  className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    sound === s.key
                      ? 'bg-cyan-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
            
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-4 mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-500" />
              {t('currentTask')}
            </h3>
            <input
              type="text"
              value={currentTask}
              onChange={e => setCurrentTask(e.target.value)}
              placeholder={t('selectTask')}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>
        
        {/* 统计卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('todayFocus')}</div>
            <div className="text-2xl font-bold text-indigo-600">{formatDuration(stats.today)}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('focusCount')}</div>
            <div className="text-2xl font-bold text-cyan-600">{stats.count}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('avgDuration')}</div>
            <div className="text-2xl font-bold text-amber-600">{stats.avg}分钟</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('streak')}</div>
            <div className="flex items-baseline gap-1">
              <div className="text-2xl font-bold text-rose-600">{stats.streak}</div>
              <Flame className="w-4 h-4 text-rose-500" />
            </div>
          </div>
        </div>
        
        {/* 增强版：效率分析图表 */}
        {state.sessions.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 本周专注趋势 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-500" />
                本周专注趋势
              </h3>
              <div className="flex items-end justify-between gap-1 h-24">
                {(() => {
                  const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
                  const today = new Date().getDay()
                  const data = []
                  
                  for (let i = 6; i >= 0; i--) {
                    const d = new Date()
                    d.setDate(d.getDate() - i)
                    const dayName = days[d.getDay()]
                    const dateStr = d.toDateString()
                    const minutes = state.sessions
                      .filter(s => new Date(s.startTime).toDateString() === dateStr)
                      .reduce((sum, s) => sum + s.duration, 0)
                    
                    const maxMinutes = Math.max(...Array.from({ length: 7 }, (_, idx) => {
                      const dd = new Date()
                      dd.setDate(dd.getDate() - idx)
                      const ds = dd.toDateString()
                      return state.sessions
                        .filter(s => new Date(s.startTime).toDateString() === ds)
                        .reduce((sum, s) => sum + s.duration, 0)
                    })) || 1
                    
                    data.push({ day: dayName, minutes, height: maxMinutes > 0 ? (minutes / maxMinutes) * 100 : 0 })
                  }
                  
                  return data.map((d, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-t-sm relative" style={{ height: '80px' }}>
                        <div
                          className="absolute bottom-0 left-0 right-0 bg-indigo-500 rounded-t-sm transition-all duration-500"
                          style={{ height: `${d.height}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-gray-400">{d.day}</span>
                    </div>
                  ))
                })()}
              </div>
            </div>
            
            {/* 打断原因分析 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <Target className="w-4 h-4 text-rose-500" />
                打断原因分析
              </h3>
              {(() => {
                const interrupted = state.sessions.filter(s => !s.completed && s.interruptReason)
                if (interrupted.length === 0) {
                  return <div className="text-sm text-gray-400 text-center py-8">暂无数据，专注被打断时会记录原因</div>
                }
                
                const counts: Record<string, number> = {}
                interrupted.forEach(s => {
                  counts[s.interruptReason!] = (counts[s.interruptReason!] || 0) + 1
                })
                
                const total = interrupted.length
                
                return (
                  <div className="space-y-2">
                    {Object.entries(counts)
                      .sort(([,a], [,b]) => b - a)
                      .map(([reason, count]) => {
                        const r = INTERRUPT_REASONS.find(ir => ir.key === reason)
                        return (
                          <div key={reason} className="flex items-center gap-3">
                            <span className="text-lg">{r?.icon}</span>
                            <div className="flex-1">
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span className="text-gray-600 dark:text-gray-400">{r?.label}</span>
                                <span className="text-gray-400">{count}次 ({Math.round(count/total*100)}%)</span>
                              </div>
                              <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-rose-500 rounded-full"
                                  style={{ width: `${(count / total) * 100}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        )
                      })}
                  </div>
                )
              })()}
            </div>
          </div>
        )}
        
        {/* 专注提示 */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/10 dark:to-purple-900/10 rounded-xl border border-indigo-200 dark:border-indigo-800 p-4">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-medium text-indigo-900 dark:text-indigo-400 mb-1">{t('focusTip')}</div>
              <div className="text-xs text-indigo-700 dark:text-indigo-500/80">{t(`tip${tipIndex + 1}`)}</div>
            </div>
          </div>
        </div>
        
        {/* 打断原因选择对话框 */}
        {showInterruptDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 max-w-sm w-full shadow-2xl">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                是什么打断了你的专注？
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                记录打断原因有助于分析你的专注模式
              </p>
              
              <div className="space-y-2">
                {INTERRUPT_REASONS.map((r) => (
                  <button
                    key={r.key}
                    onClick={() => saveInterruptAndStop(r.key)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors text-left"
                  >
                    <span className="text-xl">{r.icon}</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{r.label}</span>
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => setShowInterruptDialog(false)}
                className="mt-4 w-full py-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
