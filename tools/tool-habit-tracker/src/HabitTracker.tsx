import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { CheckSquare, Plus, Trash2, Check, Flame } from 'lucide-react'
import { PageHero } from '@toolbox/ui-kit'

const ICONS = ['🏃', '📚', '💧', '🧘', '💪', '🥗', '😴', '✍️', '🎯', '🌅']

interface Habit {
  id: string
  name: string
  icon: string
  createdAt: string
  checkins: string[] // ISO date strings
}

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

function getStreak(checkins: string[]): number {
  if (checkins.length === 0) return 0
  const sorted = [...checkins].sort().reverse()
  let streak = 0
  let cur = new Date()
  for (const d of sorted) {
    const diff = Math.round((cur.getTime() - new Date(d).getTime()) / 86400000)
    if (diff > 1) break
    streak++
    cur = new Date(d)
  }
  return streak
}

function getLast30Days(): string[] {
  return Array.from({ length: 30 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (29 - i))
    return d.toISOString().slice(0, 10)
  })
}

const STORAGE_KEY = 'toolbox-habit-tracker'

export default function HabitTracker() {
  const { t } = useTranslation('toolHabitTracker')
  const [habits, setHabits] = useState<Habit[]>(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
  })
  const [form, setForm] = useState({ name: '', icon: ICONS[0] })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(habits))
  }, [habits])

  const addHabit = () => {
    if (!form.name.trim()) return
    setHabits(h => [...h, { id: Date.now().toString(), name: form.name, icon: form.icon, createdAt: todayStr(), checkins: [] }])
    setForm(f => ({ ...f, name: '' }))
  }

  const toggleCheckin = (id: string) => {
    const today = todayStr()
    setHabits(h => h.map(x => x.id !== id ? x : {
      ...x,
      checkins: x.checkins.includes(today) ? x.checkins.filter(d => d !== today) : [...x.checkins, today]
    }))
  }

  const removeHabit = (id: string) => {
    if (!confirm(t('confirmRemove'))) return
    setHabits(h => h.filter(x => x.id !== id))
  }

  const last30 = getLast30Days()
  const today = todayStr()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHero icon={CheckSquare} titleKey="title" descriptionKey="description" namespace="toolHabitTracker" />
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Add habit */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">{t('addHabit')}</h2>
          <div className="flex gap-2 flex-wrap mb-3">
            {ICONS.map(ic => (
              <button key={ic} onClick={() => setForm(f => ({ ...f, icon: ic }))}
                className={`text-xl w-9 h-9 rounded-lg transition-colors ${form.icon === ic ? 'bg-indigo-100 dark:bg-indigo-900/40 ring-2 ring-indigo-500' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                {ic}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input className="flex-1 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder={t('habitNamePlaceholder')} value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && addHabit()} />
            <button onClick={addHabit} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-2 text-sm font-medium flex items-center gap-1.5 transition-colors">
              <Plus className="w-4 h-4" />{t('add')}
            </button>
          </div>
        </div>

        {/* Habits */}
        {habits.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">{t('noHabits')}</div>
        ) : (
          <div className="space-y-4">
            {habits.map(h => {
              const checked = h.checkins.includes(today)
              const streak = getStreak(h.checkins)
              const rate = last30.length > 0 ? Math.round(h.checkins.filter(d => last30.includes(d)).length / last30.length * 100) : 0
              return (
                <div key={h.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{h.icon}</span>
                      <div>
                        <div className="font-semibold text-gray-800 dark:text-gray-100">{h.name}</div>
                        <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                          <span className="flex items-center gap-0.5"><Flame className="w-3 h-3 text-orange-400" />{streak} {t('days')}</span>
                          <span>{t('total')}: {h.checkins.length} {t('days')}</span>
                          <span>{t('rate')}: {rate}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggleCheckin(h.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
                          checked ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}>
                        {checked ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        {checked ? t('checkedIn') : t('checkin')}
                      </button>
                      <button onClick={() => removeHabit(h.id)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                  {/* 30-day grid */}
                  <div className="flex gap-0.5 flex-wrap mt-2">
                    {last30.map(d => (
                      <div key={d} title={d}
                        className={`w-4 h-4 rounded-sm ${
                          h.checkins.includes(d) ? 'bg-indigo-500' : 'bg-gray-100 dark:bg-gray-700'
                        }`} />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}