import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Droplets, RotateCcw } from 'lucide-react'
import { PageHero, ProgressRing } from '@toolbox/ui-kit'
import { useToolStorage } from '@toolbox/storage'

interface Log { time: string; amount: number }
interface State { goal: number; todayDate: string; logs: Log[] }
const DEFAULT: State = { goal: 2000, todayDate: '', logs: [] }

const PRESETS = [150, 200, 250, 350, 500]

export default function WaterReminder() {
  const { t } = useTranslation('toolWaterReminder')
  const { data, save } = useToolStorage<State>('water-reminder', 'data', DEFAULT)
  const [custom, setCustom] = useState(200)

  const today = new Date().toISOString().slice(0, 10)
  const logs = data.todayDate === today ? data.logs : []
  const total = logs.reduce((s, l) => s + l.amount, 0)
  const pct = Math.min(100, Math.round(total / data.goal * 100))
  const remaining = Math.max(0, data.goal - total)

  const addWater = (amount: number) => {
    const time = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    const newLogs = [...logs, { time, amount }]
    save({ ...data, todayDate: today, logs: newLogs })
  }

  const reset = () => save({ ...data, todayDate: today, logs: [] })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHero title={t('title')} description={t('description')} icon={Droplets} />
      <div className="max-w-md mx-auto px-4 py-6 space-y-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 flex flex-col items-center gap-4">
          <ProgressRing value={pct} size={140} label={`${total}ml`} />
          <div className="text-center">
            {pct >= 100
              ? <p className="text-green-500 font-semibold">{t('completed')}</p>
              : <p className="text-sm text-gray-500">{t('remaining')}: <strong className="text-indigo-600">{remaining}ml</strong></p>
            }
          </div>
          <div className="w-full">
            <label className="text-xs text-gray-400 mb-1 block">{t('goal')}</label>
            <input type="range" min={500} max={4000} step={100} value={data.goal}
              onChange={e => save({ ...data, goal: parseInt(e.target.value) })}
              className="w-full h-1.5 accent-indigo-600" />
            <div className="flex justify-between text-xs text-gray-400 mt-0.5">
              <span>500ml</span><span className="text-indigo-600 font-medium">{data.goal}ml</span><span>4000ml</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
          <div className="flex flex-wrap gap-2">
            {PRESETS.map(ml => (
              <button key={ml} onClick={() => addWater(ml)}
                className="flex-1 min-w-[60px] py-3 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 text-blue-600 rounded-xl text-sm font-medium transition-colors">
                +{ml}ml
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input type="number" value={custom} min={50} max={2000} step={50}
              onChange={e => setCustom(parseInt(e.target.value) || 200)}
              className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none" />
            <button onClick={() => addWater(custom)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm">{t('add')}</button>
          </div>
        </div>

        {logs.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('history')}</span>
              <button onClick={reset} className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-400">
                <RotateCcw className="w-3 h-3" />{t('reset')}
              </button>
            </div>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {[...logs].reverse().map((l, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-gray-400 text-xs">{l.time}</span>
                  <span className="text-blue-500 font-medium">+{l.amount}ml</span>
                </div>
              ))}
            </div>
          </div>
        )}
        <p className="text-xs text-center text-gray-400">{t('tip')}</p>
      </div>
    </div>
  )
}
