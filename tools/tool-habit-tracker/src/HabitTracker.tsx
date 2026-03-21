import React, { useState } from 'react'
import { Plus, Trash2, CheckCircle, Circle } from 'lucide-react'

interface Habit {
  id: string
  name: string
  emoji: string
  color: string
  checks: Record<string, boolean> // date -> checked
}

const COLORS = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-blue-500', 'bg-purple-500']
const EMOJIS = ['🏃', '📚', '💧', '🧘', '💪', '🥗', '😴', '✍️', '🎯', '🎸']

function getLast7Days(): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d.toISOString().slice(0, 10)
  })
}

function getStreak(habit: Habit, days: string[]): number {
  let streak = 0
  for (let i = days.length - 1; i >= 0; i--) {
    if (habit.checks[days[i]]) streak++
    else break
  }
  return streak
}

let uid = 0
const nid = () => String(++uid + Date.now())

const InputField = ({ value, onChange, placeholder, className }: { value: string; onChange: (v: string) => void; placeholder: string; className?: string }) => (
  <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
    className={`px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${className}`} />
)

export function HabitTracker() {
  const [habits, setHabits] = useState<Habit[]>([
    { id: nid(), name: '早起运动', emoji: '🏃', color: 'bg-green-500', checks: {} },
    { id: nid(), name: '阅读30分钟', emoji: '📚', color: 'bg-blue-500', checks: {} },
    { id: nid(), name: '喝8杯水', emoji: '💧', color: 'bg-cyan-500', checks: {} },
  ])
  const [newName, setNewName] = useState('')
  const [newEmoji, setNewEmoji] = useState('🎯')
  const [newColor, setNewColor] = useState(COLORS[3])

  const days = getLast7Days()
  const today = new Date().toISOString().slice(0, 10)

  const toggle = (habitId: string, date: string) => {
    setHabits(hs => hs.map(h => h.id === habitId
      ? { ...h, checks: { ...h.checks, [date]: !h.checks[date] } }
      : h))
  }

  const addHabit = () => {
    if (!newName.trim()) return
    setHabits(hs => [...hs, { id: nid(), name: newName.trim(), emoji: newEmoji, color: newColor, checks: {} }])
    setNewName('')
  }

  const removeHabit = (id: string) => setHabits(hs => hs.filter(h => h.id !== id))

  const dayLabels = days.map(d => {
    const dt = new Date(d)
    return { date: d, label: ['日', '一', '二', '三', '四', '五', '六'][dt.getDay()], isToday: d === today }
  })

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">习惯打卡</h1>
      <p className="text-gray-500 dark:text-gray-400">追踪每日习惯，建立连续打卡记录</p>

      {/* 添加习惯 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">添加新习惯</h2>
        <div className="flex gap-2 flex-wrap">
          <InputField value={newName} onChange={setNewName} placeholder="习惯名称" className="flex-1 min-w-32" />
          <select value={newEmoji} onChange={e => setNewEmoji(e.target.value)}
            className="px-2 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
            {EMOJIS.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
          <div className="flex gap-1">
            {COLORS.map(c => (
              <button key={c} onClick={() => setNewColor(c)}
                className={`w-7 h-7 rounded-full ${c} ${newColor === c ? 'ring-2 ring-offset-2 ring-indigo-500' : ''}`} />
            ))}
          </div>
          <button onClick={addHabit} disabled={!newName.trim()}
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" />添加
          </button>
        </div>
      </div>

      {/* 打卡表格 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700">
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">习惯</th>
                {dayLabels.map(d => (
                  <th key={d.date} className={`px-2 py-3 text-center text-xs font-medium ${
                    d.isToday ? 'text-indigo-500' : 'text-gray-400'
                  }`}>
                    <div>{d.label}</div>
                    <div className={`text-xs ${d.isToday ? 'font-bold' : ''}`}>{d.date.slice(8)}</div>
                  </th>
                ))}
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-400">连续</th>
                <th className="px-2 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {habits.map(habit => {
                const streak = getStreak(habit, days)
                const weekDone = days.filter(d => habit.checks[d]).length
                return (
                  <tr key={habit.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-8 rounded-full ${habit.color}`} />
                        <span className="text-lg">{habit.emoji}</span>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{habit.name}</div>
                          <div className="text-xs text-gray-400">{weekDone}/7 本周</div>
                        </div>
                      </div>
                    </td>
                    {dayLabels.map(d => (
                      <td key={d.date} className="px-2 py-3 text-center">
                        <button onClick={() => toggle(habit.id, d.date)}
                          className="mx-auto block transition-transform hover:scale-110">
                          {habit.checks[d.date]
                            ? <CheckCircle className={`w-6 h-6 ${habit.color.replace('bg-', 'text-')}`} />
                            : <Circle className="w-6 h-6 text-gray-200 dark:text-gray-600" />}
                        </button>
                      </td>
                    ))}
                    <td className="px-3 py-3 text-center">
                      <span className={`text-sm font-bold ${
                        streak >= 7 ? 'text-yellow-500' : streak >= 3 ? 'text-green-500' : 'text-gray-400'
                      }`}>{streak > 0 ? `🔥${streak}` : '—'}</span>
                    </td>
                    <td className="px-2 py-3">
                      <button onClick={() => removeHabit(habit.id)}
                        className="text-gray-300 hover:text-red-400 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
