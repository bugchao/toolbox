import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CalendarDays, Plus, Trash2 } from 'lucide-react'
import { PageHero } from '@toolbox/ui-kit'
import { useToolStorage } from '@toolbox/storage'

interface Block {
  hour: number
  tasks: { id: string; text: string; done: boolean }[]
}

interface PlannerState {
  plans: Record<string, Block[]>
}

const HOURS = Array.from({ length: 18 }, (_, i) => i + 6) // 6-23

const WORKDAY_DEFAULTS: Record<number, string> = {
  6: '起床 + 晨练',
  7: '早餐',
  8: '上班通勤',
  9: '处理邮件/晨会',
  10: '深度工作',
  12: '午餐休息',
  14: '深度工作',
  17: '整理收尾',
  18: '下班通勤',
  19: '晚餐',
  21: '阅读/学习',
  22: '复盘/准备明日计划',
  23: '就寝',
}

const WEEKEND_DEFAULTS: Record<number, string> = {
  7: '自然醒',
  8: '早餐',
  9: '运动/爱好',
  11: '休闲购物',
  12: '午餐',
  14: '午休',
  15: '户外活动',
  18: '晚餐',
  20: '娱乐/家庭时间',
  22: '准备睡眠',
}

function makeBlocks(defaults: Record<number, string>): Block[] {
  return HOURS.map(hour => ({
    hour,
    tasks: defaults[hour] ? [{ id: `${hour}-0`, text: defaults[hour], done: false }] : []
  }))
}

const DEFAULT_STATE: PlannerState = { plans: {} }

function today() { return new Date().toISOString().slice(0, 10) }

export default function DailyPlanner() {
  const { t } = useTranslation('toolDailyPlanner')
  const { data: state, save } = useToolStorage<PlannerState>('daily-planner', 'data', DEFAULT_STATE)
  const [date, setDate] = useState(today())
  const [newTexts, setNewTexts] = useState<Record<number, string>>({})

  const blocks: Block[] = state.plans[date] || makeBlocks({})
  const setBlocks = (b: Block[]) => save({ plans: { ...state.plans, [date]: b } })

  const loadTemplate = (type: 'workday' | 'weekend') => {
    setBlocks(makeBlocks(type === 'workday' ? WORKDAY_DEFAULTS : WEEKEND_DEFAULTS))
  }

  const addTask = (hour: number) => {
    const text = newTexts[hour]?.trim()
    if (!text) return
    setBlocks(blocks.map(b => b.hour === hour
      ? { ...b, tasks: [...b.tasks, { id: `${hour}-${Date.now()}`, text, done: false }] }
      : b))
    setNewTexts(t => ({ ...t, [hour]: '' }))
  }

  const toggleTask = (hour: number, id: string) => setBlocks(blocks.map(b => b.hour === hour
    ? { ...b, tasks: b.tasks.map(t => t.id === id ? { ...t, done: !t.done } : t) } : b))

  const removeTask = (hour: number, id: string) => setBlocks(blocks.map(b => b.hour === hour
    ? { ...b, tasks: b.tasks.filter(t => t.id !== id) } : b))

  const clearDay = () => setBlocks(makeBlocks({}))

  const totalTasks = blocks.reduce((s, b) => s + b.tasks.length, 0)
  const doneTasks = blocks.reduce((s, b) => s + b.tasks.filter(t => t.done).length, 0)
  const pct = totalTasks ? Math.round(doneTasks / totalTasks * 100) : 0

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHero title={t('title')} description={t('description')} icon={CalendarDays} />
      <div className="max-w-xl mx-auto px-4 py-6 space-y-4">

        {/* 日期 + 模板 */}
        <div className="flex flex-wrap items-center gap-2">
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none" />
          <button onClick={() => loadTemplate('workday')}
            className="px-3 py-2 text-sm bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 border border-indigo-200 dark:border-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors">{t('workday')}</button>
          <button onClick={() => loadTemplate('weekend')}
            className="px-3 py-2 text-sm bg-green-50 dark:bg-green-900/20 text-green-600 border border-green-200 dark:border-green-700 rounded-lg hover:bg-green-100 transition-colors">{t('weekend')}</button>
          <button onClick={clearDay}
            className="px-3 py-2 text-sm text-gray-400 border border-gray-200 dark:border-gray-600 rounded-lg hover:text-gray-600 transition-colors ml-auto">{t('clear')}</button>
        </div>

        {/* 进度 */}
        {totalTasks > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3">
            <div className="flex justify-between text-sm mb-1.5">
              <span className="text-gray-500">{t('done')} {doneTasks}/{totalTasks}</span>
              <span className={`font-semibold ${pct === 100 ? 'text-green-500' : 'text-indigo-500'}`}>{pct}%</span>
            </div>
            <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className={`h-full transition-all ${pct === 100 ? 'bg-green-500' : 'bg-indigo-500'}`} style={{ width: `${pct}%` }} />
            </div>
          </div>
        )}

        {/* 时间块 */}
        <div className="space-y-1">
          {blocks.map(block => (
            <div key={block.hour} className="flex gap-2">
              <div className="w-12 pt-2 text-right text-xs text-gray-400 shrink-0">{String(block.hour).padStart(2, '0')}:00</div>
              <div className="flex-1 min-w-0">
                <div className={`rounded-xl border transition-colors ${
                  block.tasks.length > 0
                    ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                    : 'border-dashed border-gray-200 dark:border-gray-700'
                }`}>
                  {block.tasks.map(task => (
                    <div key={task.id} className="flex items-center gap-2 px-3 py-2">
                      <button onClick={() => toggleTask(block.hour, task.id)}
                        className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                          task.done ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 dark:border-gray-500'
                        }`}>{task.done && <span className="text-xs">✓</span>}</button>
                      <span className={`flex-1 text-sm ${
                        task.done ? 'line-through text-gray-400' : 'text-gray-700 dark:text-gray-300'
                      }`}>{task.text}</span>
                      <button onClick={() => removeTask(block.hour, task.id)}
                        className="text-gray-300 hover:text-red-400 transition-colors">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {/* 添加任务输入 */}
                  <div className="flex items-center gap-2 px-3 py-1.5">
                    <Plus className="w-3 h-3 text-gray-300 shrink-0" />
                    <input
                      value={newTexts[block.hour] || ''}
                      onChange={e => setNewTexts(t => ({ ...t, [block.hour]: e.target.value }))}
                      onKeyDown={e => e.key === 'Enter' && addTask(block.hour)}
                      placeholder={t('placeholder')}
                      className="flex-1 text-xs bg-transparent outline-none text-gray-500 placeholder-gray-300 dark:placeholder-gray-600 py-1"
                    />
                    {newTexts[block.hour] && (
                      <button onClick={() => addTask(block.hour)}
                        className="text-indigo-500 text-xs hover:text-indigo-700">+</button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-center text-gray-400">{t('autoSave')}</p>
      </div>
    </div>
  )
}
