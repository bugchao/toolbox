import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Moon, Plus, Trash2 } from 'lucide-react'
import { PageHero } from '@toolbox/ui-kit'
import { useToolStorage } from '@toolbox/storage'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

interface SleepRecord { id: string; date: string; bedtime: string; wakeTime: string; quality: number; note: string }
interface State { records: SleepRecord[] }
const DEFAULT: State = { records: [] }

const QUALITY_LABELS = ['', '较差', '一般', '良好', '很好']
const QUALITY_COLORS = ['', '#ef4444', '#f59e0b', '#22c55e', '#6366f1']

function calcDuration(bedtime: string, wakeTime: string): number {
  const [bh, bm] = bedtime.split(':').map(Number)
  const [wh, wm] = wakeTime.split(':').map(Number)
  let mins = (wh * 60 + wm) - (bh * 60 + bm)
  if (mins < 0) mins += 24 * 60
  return mins
}

export default function SleepTracker() {
  const { t } = useTranslation('toolSleepTracker')
  const { data, save } = useToolStorage<State>('sleep-tracker', 'data', DEFAULT)
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0, 10), bedtime: '23:00', wakeTime: '07:00', quality: 3, note: '' })
  const [adding, setAdding] = useState(false)

  const add = () => {
    const rec: SleepRecord = { id: Date.now().toString(), ...form }
    save({ records: [rec, ...data.records].slice(0, 30) })
    setAdding(false)
  }

  const remove = (id: string) => save({ records: data.records.filter(r => r.id !== id) })

  const recent = data.records.slice(0, 14)
  const avgDuration = recent.length ? recent.reduce((s, r) => s + calcDuration(r.bedtime, r.wakeTime), 0) / recent.length : 0
  const avgQuality = recent.length ? recent.reduce((s, r) => s + r.quality, 0) / recent.length : 0

  const chartData = [...recent].reverse().map(r => ({
    date: r.date.slice(5),
    duration: parseFloat((calcDuration(r.bedtime, r.wakeTime) / 60).toFixed(1)),
    quality: r.quality,
  }))

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHero title={t('title')} description={t('description')} icon={Moon} />
      <div className="max-w-xl mx-auto px-4 py-6 space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-indigo-600">{(avgDuration / 60).toFixed(1)}h</div>
              <div className="text-xs text-gray-400">{t('avgDuration')}</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-amber-500">{avgQuality.toFixed(1)}/4</div>
              <div className="text-xs text-gray-400">{t('avgQuality')}</div>
            </div>
          </div>
          <button onClick={() => setAdding(v => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm">
            <Plus className="w-3.5 h-3.5" />{t('addRecord')}
          </button>
        </div>

        {adding && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
            <div className="grid grid-cols-3 gap-3">
              {[['date', form.date, 'date'], ['bedtime', form.bedtime, 'time'], ['wakeTime', form.wakeTime, 'time']].map(([key, val, type]) => (
                <div key={key}>
                  <label className="text-xs text-gray-500 mb-1 block">{t(key)}</label>
                  <input type={type} value={val}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none" />
                </div>
              ))}
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-2 block">{t('quality')}</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4].map(q => (
                  <button key={q} onClick={() => setForm(f => ({ ...f, quality: q }))}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors border-2 ${
                      form.quality === q ? 'border-indigo-500 bg-indigo-50 text-indigo-600' : 'border-gray-200 text-gray-500'
                    }`}>{QUALITY_LABELS[q]}</button>
                ))}
              </div>
            </div>
            <input value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
              placeholder={t('note')}
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
              <BarChart data={chartData}>
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} domain={[0, 12]} unit="h" width={30} />
                <Tooltip formatter={(v: number) => [`${v}h`, t('duration')]} />
                <Bar dataKey="duration" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {data.records.length === 0 && !adding && (
          <div className="text-center py-10 text-gray-400 text-sm">{t('empty')}</div>
        )}

        <div className="space-y-2">
          {data.records.slice(0, 7).map(r => {
            const dur = calcDuration(r.bedtime, r.wakeTime)
            return (
              <div key={r.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 flex items-center gap-3">
                <div className="w-2 h-10 rounded-full" style={{ backgroundColor: QUALITY_COLORS[r.quality] }} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{r.date}</span>
                    <span className="text-xs text-indigo-500 font-medium">{(dur / 60).toFixed(1)}h</span>
                    <span className="text-xs" style={{ color: QUALITY_COLORS[r.quality] }}>{QUALITY_LABELS[r.quality]}</span>
                  </div>
                  <div className="text-xs text-gray-400">{r.bedtime} → {r.wakeTime}{r.note ? ` · ${r.note}` : ''}</div>
                </div>
                <button onClick={() => remove(r.id)} className="text-gray-300 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
