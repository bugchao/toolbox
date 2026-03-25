import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Trash2, MapPin, Clock } from 'lucide-react'
import { PageHero } from '@toolbox/ui-kit'
import { useToolStorage } from '@toolbox/storage'

interface Activity {
  id: string
  time: string
  text: string
  type: 'attraction' | 'food' | 'transport' | 'hotel'
}

interface Day {
  id: string
  label: string
  date: string
  activities: Activity[]
}

interface TripState { tripName: string; days: Day[] }
const DEFAULT: TripState = {
  tripName: '我的旅行',
  days: [
    {
      id: '1', label: '第1天', date: '',
      activities: [
        { id: 'a1', time: '09:00', text: '抵达目的地，办理入住', type: 'hotel' },
        { id: 'a2', time: '11:00', text: '参观景点', type: 'attraction' },
        { id: 'a3', time: '13:00', text: '午餐', type: 'food' },
        { id: 'a4', time: '15:00', text: '下午游览', type: 'attraction' },
      ]
    }
  ]
}

const TYPE_ICON: Record<string, string> = {
  attraction: '🏛️', food: '🍜', transport: '🚌', hotel: '🏨'
}
const TYPE_COLOR: Record<string, string> = {
  attraction: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700',
  food: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700',
  transport: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700',
  hotel: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700',
}

export default function TripPlanner() {
  const { t } = useTranslation('toolTripPlanner')
  const { data: state, save } = useToolStorage<TripState>('trip-planner', 'data', DEFAULT)
  const [activeDay, setActiveDay] = useState(0)
  const [newItem, setNewItem] = useState({ time: '', text: '', type: 'attraction' as Activity['type'] })
  const [editName, setEditName] = useState(false)

  const { tripName, days } = state
  const upd = (patch: Partial<TripState>) => save({ ...state, ...patch })

  const addDay = () => {
    const n = days.length + 1
    upd({ days: [...days, { id: Date.now().toString(), label: `第${n}天`, date: '', activities: [] }] })
    setActiveDay(days.length)
  }

  const removeDay = (idx: number) => {
    const newDays = days.filter((_, i) => i !== idx)
    upd({ days: newDays })
    setActiveDay(Math.min(activeDay, newDays.length - 1))
  }

  const addActivity = () => {
    if (!newItem.text.trim()) return
    const day = days[activeDay]
    const activity: Activity = { id: Date.now().toString(), ...newItem }
    const newActivities = [...day.activities, activity].sort((a, b) => a.time.localeCompare(b.time))
    const newDays = days.map((d, i) => i === activeDay ? { ...d, activities: newActivities } : d)
    upd({ days: newDays })
    setNewItem({ time: '', text: '', type: 'attraction' })
  }

  const removeActivity = (dayIdx: number, actId: string) => {
    const newDays = days.map((d, i) => i === dayIdx
      ? { ...d, activities: d.activities.filter(a => a.id !== actId) } : d)
    upd({ days: newDays })
  }

  const updateDate = (dayIdx: number, date: string) => {
    const newDays = days.map((d, i) => i === dayIdx ? { ...d, date } : d)
    upd({ days: newDays })
  }

  const currentDay = days[activeDay]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHero title={t('title')} description={t('description')} icon={MapPin} />
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">

        {/* 行程名称 */}
        <div className="flex items-center gap-2">
          {editName ? (
            <input value={tripName} onChange={e => upd({ tripName: e.target.value })}
              onBlur={() => setEditName(false)} autoFocus
              className="flex-1 px-3 py-2 text-lg font-bold border border-indigo-300 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none" />
          ) : (
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 cursor-pointer hover:text-indigo-500 flex-1" onClick={() => setEditName(true)}>{tripName} ✏️</h2>
          )}
        </div>

        {/* 天数 Tab */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {days.map((day, idx) => (
            <button key={day.id} onClick={() => setActiveDay(idx)}
              className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                activeDay === idx ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
              }`}>{day.label}</button>
          ))}
          <button onClick={addDay}
            className="shrink-0 flex items-center gap-1 px-3 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-sm text-gray-400 hover:border-indigo-400 hover:text-indigo-500">
            <Plus className="w-4 h-4" />{t('addDay')}
          </button>
        </div>

        {/* 当天详情 */}
        {currentDay && (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <input type="date" value={currentDay.date} onChange={e => updateDate(activeDay, e.target.value)}
                className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none" />
              {days.length > 1 && (
                <button onClick={() => removeDay(activeDay)} className="ml-auto text-xs text-red-400 hover:text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* 活动列表 */}
            {currentDay.activities.length === 0 && (
              <div className="text-center py-8 text-gray-400 text-sm">{t('empty')}</div>
            )}
            <div className="space-y-2">
              {currentDay.activities.map(act => (
                <div key={act.id} className={`flex items-center gap-3 p-3 rounded-xl border ${TYPE_COLOR[act.type]}`}>
                  <span className="text-lg shrink-0">{TYPE_ICON[act.type]}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-gray-800 dark:text-gray-200">{act.text}</div>
                    {act.time && <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5"><Clock className="w-3 h-3" />{act.time}</div>}
                  </div>
                  <button onClick={() => removeActivity(activeDay, act.id)} className="text-gray-300 hover:text-red-400 shrink-0">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* 添加活动 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 space-y-2">
              <div className="flex gap-2">
                <input value={newItem.time} onChange={e => setNewItem(v => ({ ...v, time: e.target.value }))}
                  placeholder={t('timePlaceholder')}
                  className="w-24 px-2 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none" />
                <select value={newItem.type} onChange={e => setNewItem(v => ({ ...v, type: e.target.value as Activity['type'] }))}
                  className="px-2 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none">
                  <option value="attraction">🏛️ 景点</option>
                  <option value="food">🍜 餐食</option>
                  <option value="transport">🚌 交通</option>
                  <option value="hotel">🏨 住宿</option>
                </select>
              </div>
              <div className="flex gap-2">
                <input value={newItem.text} onChange={e => setNewItem(v => ({ ...v, text: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && addActivity()}
                  placeholder={t('placeholder')}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none" />
                <button onClick={addActivity} className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
        <p className="text-xs text-center text-gray-400">{t('autoSave')}</p>
      </div>
    </div>
  )
}
