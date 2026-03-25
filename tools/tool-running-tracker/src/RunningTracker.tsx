import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Activity, Plus, Trash2 } from 'lucide-react'
import { PageHero } from '@toolbox/ui-kit'
import { useToolStorage } from '@toolbox/storage'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

interface Run { id: string; date: string; distance: number; duration: number; note: string }
interface State { runs: Run[] }
const DEFAULT: State = { runs: [] }

function pace(distance: number, duration: number): string {
  if (!distance) return '--'
  const secPerKm = (duration * 60) / distance
  const m = Math.floor(secPerKm / 60)
  const s = Math.round(secPerKm % 60)
  return `${m}'${String(s).padStart(2, '0')}'`
}

function calories(distance: number): number {
  return Math.round(distance * 65)
}

export default function RunningTracker() {
  const { t } = useTranslation('toolRunningTracker')
  const { data, save } = useToolStorage<State>('running-tracker', 'data', DEFAULT)
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0, 10), distance: 5, duration: 30, note: '' })
  const [adding, setAdding] = useState(false)

  const add = () => {
    save({ runs: [{ id: Date.now().toString(), ...form }, ...data.runs] })
    setForm(f => ({ ...f, distance: 5, duration: 30, note: '' }))
    setAdding(false)
  }

  const remove = (id: string) => save({ runs: data.runs.filter(r => r.id !== id) })

  const totalDist = data.runs.reduce((s, r) => s + r.distance, 0)
  const avgPace = data.runs.length
    ? pace(data.runs.reduce((s, r) => s + r.distance, 0), data.runs.reduce((s, r) => s + r.duration, 0))
    : '--'

  const chartData = [...data.runs].reverse().slice(-14).map(r => ({
    date: r.date.slice(5),
    distance: r.distance,
  }))

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHero title={t('title')} description={t('description')} icon={Activity} />
      <div className="max-w-xl mx-auto px-4 py-6 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: t('totalDistance'), value: `${totalDist.toFixed(1)} km`, color: 'text-indigo-600' },
            { label: t('totalRuns'), value: `${data.runs.length} 次`, color: 'text-emerald-600' },
            { label: t('avgPace'), value: avgPace, color: 'text-amber-600' },
          ].map(s => (
            <div key={s.label} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 text-center">
              <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <button onClick={() => setAdding(v => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm">
            <Plus className="w-3.5 h-3.5" />{t('addRun')}
          </button>
        </div>

        {adding && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
            <div className="grid grid-cols-3 gap-3">
              {[['date', form.date, 'date', 'date'], ['distance', form.distance, 'number', 'distance'], ['duration', form.duration, 'number', 'duration']].map(([key, val, type, label]) => (
                <div key={String(key)}>
                  <label className="text-xs text-gray-500 mb-1 block">{t(String(label))}</label>
                  <input type={String(type)} value={String(val)} min={type === 'number' ? 0 : undefined}
                    onChange={e => setForm(f => ({ ...f, [key]: type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value }))}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none" />
                </div>
              ))}
            </div>
            <input value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
              placeholder="备注（可选）"
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none" />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setAdding(false)} className="px-4 py-2 text-sm text-gray-500">取消</button>
              <button onClick={add} className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg">{t('save')}</button>
            </div>
          </div>
        )}

        {chartData.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">{t('trend')}</p>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} unit="km" width={40} />
                <Tooltip formatter={(v: number) => [`${v} km`]} />
                <Line type="monotone" dataKey="distance" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {data.runs.length === 0 && !adding && (
          <div className="text-center py-10 text-gray-400 text-sm">{t('empty')}</div>
        )}

        <div className="space-y-2">
          {data.runs.slice(0, 10).map(r => (
            <div key={r.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 flex items-center gap-3">
              <div className="text-2xl">🏃</div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{r.distance} km</span>
                  <span className="text-xs text-indigo-500">{pace(r.distance, r.duration)}/km</span>
                  <span className="text-xs text-amber-500">{calories(r.distance)} kcal</span>
                </div>
                <div className="text-xs text-gray-400">{r.date} · {r.duration} 分钟{r.note ? ` · ${r.note}` : ''}</div>
              </div>
              <button onClick={() => remove(r.id)} className="text-gray-300 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
