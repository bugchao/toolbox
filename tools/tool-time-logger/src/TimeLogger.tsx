import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Trash2, Clock } from 'lucide-react'
import { PageHero } from '@toolbox/ui-kit'
import { useToolStorage } from '@toolbox/storage'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface Record { id: string; activity: string; duration: number; category: string; date: string }
interface State { records: Record[] }
const DEFAULT: State = { records: [] }

const CATEGORIES = ['work', 'learn', 'life', 'entertainment', 'exercise', 'other']
const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#14b8a6', '#94a3b8']

export default function TimeLogger() {
  const { t } = useTranslation('toolTimeLogger')
  const { data, save } = useToolStorage<State>('time-logger', 'data', DEFAULT)
  const [form, setForm] = useState({ activity: '', duration: 30, category: 'work' })
  const [adding, setAdding] = useState(false)

  const today = new Date().toISOString().slice(0, 10)
  const todayRecords = data.records.filter(r => r.date === today)

  const add = () => {
    if (!form.activity.trim()) return
    const rec: Record = { id: Date.now().toString(), ...form, date: today }
    save({ records: [...data.records, rec] })
    setForm({ activity: '', duration: 30, category: 'work' })
    setAdding(false)
  }

  const remove = (id: string) => save({ records: data.records.filter(r => r.id !== id) })

  const pieData = CATEGORIES.map((cat, i) => {
    const mins = todayRecords.filter(r => r.category === cat).reduce((s, r) => s + r.duration, 0)
    return { name: t(cat), value: mins, color: COLORS[i] }
  }).filter(d => d.value > 0)

  const totalMins = todayRecords.reduce((s, r) => s + r.duration, 0)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHero title={t('title')} description={t('description')} icon={Clock} />
      <div className="max-w-xl mx-auto px-4 py-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">{t('today')}: <strong className="text-indigo-600">{(totalMins / 60).toFixed(1)}</strong> {t('hours')}</div>
          <button onClick={() => setAdding(v => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm">
            <Plus className="w-3.5 h-3.5" />{t('addRecord')}
          </button>
        </div>

        {adding && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
            <input value={form.activity} onChange={e => setForm(f => ({ ...f, activity: e.target.value }))}
              placeholder={t('activityPlaceholder')}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">{t('duration')}</label>
                <input type="number" min={1} max={480} value={form.duration}
                  onChange={e => setForm(f => ({ ...f, duration: parseInt(e.target.value) || 30 }))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">{t('category')}</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none">
                  {CATEGORIES.map(c => <option key={c} value={c}>{t(c)}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setAdding(false)} className="px-4 py-2 text-sm text-gray-500">取消</button>
              <button onClick={add} className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg">{t('save')}</button>
            </div>
          </div>
        )}

        {pieData.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('distribution')}</p>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} label={({ name, value }) => `${name} ${value}min`}>
                  {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip formatter={(v: number) => [`${v} 分钟`]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {todayRecords.length === 0 && !adding && (
          <div className="text-center py-10 text-gray-400 text-sm">{t('empty')}</div>
        )}

        <div className="space-y-2">
          {todayRecords.map(r => (
            <div key={r.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 flex items-center gap-3">
              <div className="w-2 h-8 rounded-full" style={{ backgroundColor: COLORS[CATEGORIES.indexOf(r.category)] }} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-800 dark:text-gray-200">{r.activity}</div>
                <div className="text-xs text-gray-400">{t(r.category)} · {r.duration} 分钟</div>
              </div>
              <button onClick={() => remove(r.id)} className="text-gray-300 hover:text-red-400 shrink-0"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
