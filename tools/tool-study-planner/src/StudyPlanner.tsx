import React, { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { PageHero } from '@toolbox/ui-kit'
import { useToolStorage } from '@toolbox/storage'
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  Target, 
  CheckCircle2, 
  Circle, 
  BarChart3,
  Sparkles,
  RotateCcw,
  Download,
  Lightbulb,
  LayoutGrid,
  List,
  Flame,
  ExternalLink,
  Brain
} from 'lucide-react'

interface StudyTask {
  id: string
  date: string
  topic: string
  duration: number
  completed: boolean
  type: 'learn' | 'review' | 'practice'
}

interface StudyPlan {
  subject: string
  examDate: string
  dailyHours: number
  difficulty: 'easy' | 'medium' | 'hard'
  tasks: StudyTask[]
  createdAt: string
}

interface StudyPlannerState {
  plan: StudyPlan | null
}

const DEFAULT_STATE: StudyPlannerState = {
  plan: null
}

// 生成唯一ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// 生成模拟学习计划（MVP版本使用规则生成，非AI）
function generateStudyPlan(
  subject: string,
  examDate: string,
  dailyHours: number,
  difficulty: 'easy' | 'medium' | 'hard'
): StudyPlan {
  const today = new Date()
  const exam = new Date(examDate)
  const daysUntilExam = Math.ceil((exam.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  
  const tasks: StudyTask[] = []
  
  // 根据难度确定学习阶段分配
  const phases = {
    easy: { foundation: 0.4, practice: 0.4, review: 0.2 },
    medium: { foundation: 0.35, practice: 0.35, review: 0.3 },
    hard: { foundation: 0.3, practice: 0.35, review: 0.35 }
  }
  
  const phase = phases[difficulty]
  const foundationDays = Math.floor(daysUntilExam * phase.foundation)
  const practiceDays = Math.floor(daysUntilExam * phase.practice)
  const reviewDays = daysUntilExam - foundationDays - practiceDays
  
  // 基础阶段
  const foundationTopics = ['基础概念', '核心理论', '重要公式', '基础应用']
  for (let i = 0; i < foundationDays; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() + i)
    tasks.push({
      id: generateId(),
      date: date.toISOString().slice(0, 10),
      topic: `${subject} - ${foundationTopics[i % foundationTopics.length]}`,
      duration: dailyHours * 60,
      completed: false,
      type: 'learn'
    })
  }
  
  // 练习阶段
  const practiceTopics = ['例题练习', '真题演练', '错题整理', '模拟测试']
  for (let i = 0; i < practiceDays; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() + foundationDays + i)
    tasks.push({
      id: generateId(),
      date: date.toISOString().slice(0, 10),
      topic: `${subject} - ${practiceTopics[i % practiceTopics.length]}`,
      duration: dailyHours * 60,
      completed: false,
      type: 'practice'
    })
  }
  
  // 复习阶段（包含艾宾浩斯复习点）
  const reviewTopics = ['重点回顾', '易错点复习', '知识梳理', '考前冲刺']
  for (let i = 0; i < reviewDays; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() + foundationDays + practiceDays + i)
    tasks.push({
      id: generateId(),
      date: date.toISOString().slice(0, 10),
      topic: `${subject} - ${reviewTopics[i % reviewTopics.length]}`,
      duration: dailyHours * 60,
      completed: false,
      type: 'review'
    })
  }
  
  return {
    subject,
    examDate,
    dailyHours,
    difficulty,
    tasks,
    createdAt: new Date().toISOString()
  }
}

// 格式化日期显示
function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

// 获取星期几
function getWeekday(dateStr: string): string {
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return weekdays[new Date(dateStr).getDay()]
}

export default function StudyPlanner() {
  const { t } = useTranslation('toolStudyPlanner')
  const { data: state, save } = useToolStorage<StudyPlannerState>('study-planner', 'data', DEFAULT_STATE)
  
  const [subject, setSubject] = useState('')
  const [examDate, setExamDate] = useState('')
  const [dailyHours, setDailyHours] = useState(2)
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium')
  const [isGenerating, setIsGenerating] = useState(false)
  const [viewMode, setViewMode] = useState<'weekly' | 'list'>('weekly')
  
  const { plan } = state
  
  // 计算进度统计
  const stats = useMemo(() => {
    if (!plan) return null
    const total = plan.tasks.length
    const completed = plan.tasks.filter(t => t.completed).length
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0
    const daysLeft = Math.ceil((new Date(plan.examDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    return { total, completed, progress, daysLeft }
  }, [plan])
  
  // 按周分组任务
  const weeklyTasks = useMemo(() => {
    if (!plan) return []
    const weeks: { weekNum: number; tasks: StudyTask[] }[] = []
    let currentWeek: StudyTask[] = []
    let weekNum = 1
    
    plan.tasks.forEach((task, index) => {
      if (index > 0 && index % 7 === 0) {
        weeks.push({ weekNum, tasks: currentWeek })
        currentWeek = []
        weekNum++
      }
      currentWeek.push(task)
    })
    
    if (currentWeek.length > 0) {
      weeks.push({ weekNum, tasks: currentWeek })
    }
    
    return weeks
  }, [plan])
  
  // 生成计划
  const handleGenerate = () => {
    if (!subject.trim() || !examDate) return
    
    setIsGenerating(true)
    // 模拟AI生成延迟
    setTimeout(() => {
      const newPlan = generateStudyPlan(subject, examDate, dailyHours, difficulty)
      save({ plan: newPlan })
      setIsGenerating(false)
    }, 1500)
  }
  
  // 切换任务状态
  const toggleTask = (taskId: string) => {
    if (!plan) return
    const newTasks = plan.tasks.map(t =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    )
    save({ plan: { ...plan, tasks: newTasks } })
  }
  
  // 重置计划
  const resetPlan = () => {
    save({ plan: null })
    setSubject('')
    setExamDate('')
  }
  
  // 导出计划为文本
  const exportPlan = () => {
    if (!plan) return
    let content = `${plan.subject} 学习计划\n`
    content += `考试日期: ${plan.examDate}\n`
    content += `每日时长: ${plan.dailyHours}小时\n`
    content += `创建时间: ${new Date(plan.createdAt).toLocaleString()}\n\n`
    
    plan.tasks.forEach(task => {
      const status = task.completed ? '[已完成]' : '[待完成]'
      content += `${task.date} ${status} ${task.topic} (${task.duration}分钟)\n`
    })
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${plan.subject}_学习计划.txt`
    a.click()
    URL.revokeObjectURL(url)
  }
  
  // 获取任务类型样式
  const getTaskTypeStyle = (type: string) => {
    switch (type) {
      case 'learn':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
      case 'practice':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
      case 'review':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
    }
  }
  
  // 获取任务类型标签
  const getTaskTypeLabel = (type: string) => {
    switch (type) {
      case 'learn': return '学习'
      case 'practice': return '练习'
      case 'review': return '复习'
      default: return '其他'
    }
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHero
        title={t('title')}
        description={t('description')}
        icon={BookOpen}
      />
      
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* 输入表单 */}
        {!plan && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              {t('formTitle')}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 科目 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-indigo-500" />
                  {t('subject')}
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder={t('subjectPlaceholder')}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              {/* 考试日期 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-rose-500" />
                  {t('examDate')}
                </label>
                <input
                  type="date"
                  value={examDate}
                  onChange={e => setExamDate(e.target.value)}
                  min={new Date().toISOString().slice(0, 10)}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              {/* 每日时长 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-cyan-500" />
                  {t('dailyHours')}
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={1}
                    max={8}
                    step={0.5}
                    value={dailyHours}
                    onChange={e => setDailyHours(parseFloat(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100 w-16 text-right">
                    {dailyHours} {t('hoursUnit')}
                  </span>
                </div>
              </div>
              
              {/* 难度 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-orange-500" />
                  {t('difficulty')}
                </label>
                <div className="flex gap-2">
                  {(['easy', 'medium', 'hard'] as const).map((level) => (
                    <button
                      key={level}
                      onClick={() => setDifficulty(level)}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        difficulty === level
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {t(`difficulty${level.charAt(0).toUpperCase() + level.slice(1)}`)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            {/* 生成按钮 */}
            <button
              onClick={handleGenerate}
              disabled={!subject.trim() || !examDate || isGenerating}
              className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium transition-colors"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {t('generating')}
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  {t('generatePlan')}
                </>
              )}
            </button>
          </div>
        )}
        
        {/* 学习计划展示 */}
        {plan && stats && (
          <>
            {/* 统计卡片 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('progress')}</div>
                <div className="text-2xl font-bold text-indigo-600">{stats.progress}%</div>
                <div className="mt-2 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                    style={{ width: `${stats.progress}%` }}
                  />
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('daysLeft')}</div>
                <div className="text-2xl font-bold text-rose-600">{Math.max(0, stats.daysLeft)}</div>
                <div className="text-xs text-gray-400 mt-1">天</div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('totalTasks')}</div>
                <div className="text-2xl font-bold text-cyan-600">{stats.total}</div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('completedTasks')}</div>
                <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
              </div>
            </div>
            
            {/* 增强版：知识热力图 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-500" />
                  学习热力图
                </h3>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>低</span>
                  <div className="flex gap-0.5">
                    <div className="w-3 h-3 rounded-sm bg-gray-200 dark:bg-gray-700" />
                    <div className="w-3 h-3 rounded-sm bg-orange-200" />
                    <div className="w-3 h-3 rounded-sm bg-orange-400" />
                    <div className="w-3 h-3 rounded-sm bg-orange-600" />
                  </div>
                  <span>高</span>
                </div>
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                {(() => {
                  // 生成最近 28 天的热力图数据
                  const days = []
                  const today = new Date()
                  for (let i = 27; i >= 0; i--) {
                    const date = new Date(today)
                    date.setDate(date.getDate() - i)
                    const dateStr = date.toISOString().slice(0, 10)
                    const tasksForDay = plan.tasks.filter(t => t.date === dateStr)
                    const completedTasks = tasksForDay.filter(t => t.completed).length
                    const totalTasks = tasksForDay.length
                    
                    let intensity = 0
                    if (totalTasks > 0) {
                      const ratio = completedTasks / totalTasks
                      if (ratio === 1) intensity = 3
                      else if (ratio >= 0.5) intensity = 2
                      else if (ratio > 0) intensity = 1
                    }
                    
                    const colors = [
                      'bg-gray-200 dark:bg-gray-700',
                      'bg-orange-200',
                      'bg-orange-400',
                      'bg-orange-600'
                    ]
                    
                    days.push(
                      <div
                        key={dateStr}
                        className={`aspect-square rounded-sm ${colors[intensity]} transition-colors`}
                        title={`${dateStr}: ${completedTasks}/${totalTasks} 任务完成`}
                      />
                    )
                  }
                  return days
                })()}
              </div>
              
              <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                <span>{new Date(Date.now() - 27 * 86400000).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}</span>
                <span>今天</span>
              </div>
            </div>
            
            {/* 增强版：专注模式联动 */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                    <Brain className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-indigo-900 dark:text-indigo-300">开启深度专注</h3>
                    <p className="text-xs text-indigo-600/70 dark:text-indigo-400/70">将当前任务导入专注模式，高效学习</p>
                  </div>
                </div>
                <a
                  href="/focus-mode"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  进入专注模式
                </a>
              </div>
            </div>
            
            {/* 计划操作栏 */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  {plan.subject} {t('planResult')}
                </h3>
                <span className="px-2 py-0.5 text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full">
                  {t(`difficulty${plan.difficulty.charAt(0).toUpperCase() + plan.difficulty.slice(1)}`)}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                {/* 视图切换 */}
                <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5">
                  <button
                    onClick={() => setViewMode('weekly')}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      viewMode === 'weekly'
                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    {t('weeklyView')}
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      viewMode === 'list'
                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <List className="w-3.5 h-3.5" />
                    {t('listView')}
                  </button>
                </div>
                
                <button
                  onClick={exportPlan}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  {t('exportPlan')}
                </button>
                
                <button
                  onClick={resetPlan}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  {t('resetPlan')}
                </button>
              </div>
            </div>
            
            {/* 任务列表 */}
            {viewMode === 'weekly' ? (
              // 周视图
              <div className="space-y-4">
                {weeklyTasks.map((week) => (
                  <div key={week.weekNum} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        第{week.weekNum}周
                      </h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700">
                      {week.tasks.map((task) => (
                        <div
                          key={task.id}
                          onClick={() => toggleTask(task.id)}
                          className={`p-3 bg-white dark:bg-gray-800 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                            task.completed ? 'opacity-60' : ''
                          }`}
                        >
                          <div className="text-xs text-gray-400 mb-1">
                            {formatDate(task.date)} {getWeekday(task.date)}
                          </div>
                          <div className={`text-xs font-medium mb-2 line-clamp-2 ${
                            task.completed ? 'line-through text-gray-400' : 'text-gray-700 dark:text-gray-300'
                          }`}>
                            {task.topic}
                          </div>
                          <div className="flex items-center justify-between">
                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${getTaskTypeStyle(task.type)}`}>
                              {getTaskTypeLabel(task.type)}
                            </span>
                            {task.completed ? (
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                            ) : (
                              <Circle className="w-4 h-4 text-gray-300" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // 列表视图
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                {plan.tasks.map((task, index) => (
                  <div
                    key={task.id}
                    onClick={() => toggleTask(task.id)}
                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                      index !== plan.tasks.length - 1 ? 'border-b border-gray-100 dark:border-gray-700' : ''
                    }`}
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-300 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-medium truncate ${
                        task.completed ? 'line-through text-gray-400' : 'text-gray-900 dark:text-gray-100'
                      }`}>
                        {task.topic}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {formatDate(task.date)} {getWeekday(task.date)} · {task.duration}分钟
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded ${getTaskTypeStyle(task.type)}`}>
                      {getTaskTypeLabel(task.type)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
        
        {/* 学习小贴士 */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 rounded-xl border border-amber-200 dark:border-amber-800 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-medium text-amber-800 dark:text-amber-400">{t('tipTitle')}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="text-xs text-amber-700 dark:text-amber-500/80 bg-white/50 dark:bg-white/5 rounded-lg px-3 py-2">
                {t(`tip${i}`)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
