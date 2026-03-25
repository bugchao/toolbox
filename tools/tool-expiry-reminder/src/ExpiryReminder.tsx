import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Trash2, Bell } from 'lucide-react'
import { PageHero, StatusBadge } from '@toolbox/ui-kit'
import { useToolStorage } from '@toolbox/storage'

interface ExpiryItem {
  id: string
  name: string
  category: string
  buyDate: string
  shelfLife: number
}

interface ExpiryState { items: ExpiryItem[] }
const DEFAULT: ExpiryState = {
  items: [
    { id: '1', name: '牛奶', category: '食品', buyDate: new Date(Date.now() - 5 * 86400000).toISOString().slice(0,10), shelfLife: 7 },
    { id: '2', name: '面包', category: '食品', buyDate: new Date(Date.now() - 2 * 86400000).toISOString().slice(0,10), shelfLife: 5 },
    { id: '3', name: '感冒药', category: '药品', buyDate: new Date(Date.now() - 300 * 86400000).toISOString().slice(0,10), shelfLife: 730 },
  ]
}

const CATEGORIES = ['食品', '饮品', '药品', '化妆品', '调料', '其他']

function getDaysLeft(buyDate: string, shelfLife: number): number {
  const expiry = new Date(buyDate).getTime() + shelfLife * 86400000
  return Math.ceil((expiry - Date.now()) / 86400000)
}

function getStatus(days: number): 'danger' | 'warning' | 'success' {
  if (days < 0) return 'danger'
  if (days <= 7) return 'warning'
  return 'success'
}

export default function ExpiryReminder() {
  const { t } = useTranslation('toolExpiryReminder')
  const { data: state, save } = useToolStorage<ExpiryState>('expiry-reminder', 'data', DEFAULT)
  const [filter, setFilter] = useState<'all' | 'expired' | 'expiringSoon' | 'fresh'>('all')
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ name: '', category: '食品', buyDate: new Date().toISOString().slice(0,10), shelfLife: 7 })

  const { items } = state
  const set = (i: ExpiryItem[]) => save({ items: i })

  const withDays = items.map(item => ({ ...item, daysLeft: getDaysLeft(item.buyDate, item.shelfLife) }))
    .sort((a, b) => a.daysLeft - b.daysLeft)

  const filtered = withDays.filter(item => {
    if (filter === 'expired') return item.daysLeft < 0
    if (filter === 'expiringSoon') return item.daysLeft >= 0 && item.daysLeft <= 7
    if (filter === 'fresh') return item.daysLeft > 7
    return true
  })

  const expiredCount = withDays.filter(i => i.daysLeft < 0).length
  const soonCount = withDays.filter(i => i.daysLeft >= 0 && i.daysLeft <= 7).length

  const addItem = () => {
    if (!form.name.trim()) return
    set([...items, { id: Date.now().toString(), ...form }])
    setForm({ name: '', category: '食品', buyDate: new Date().toISOString().slice(0,10), shelfLife: 7 })
    setAdding(false)
  }

  const remove = (id: string) => set(items.filter(i => i.id !== id))

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHero title={t('title')} description={t('description')} icon={Bell} />
      <div className="max-w-xl mx-auto px-4 py-6 space-y-4">

        {/* 统计卡片 */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-3 text-center border border-red-100 dark:border-red-800">
            <div className="text-2xl font-bold text-red-500">{expiredCount}</div>
            <div className="text-xs text-red-400">{t('expired')}</div>
          </div>
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 text-center border border-amber-100 dark:border-amber-800">
            <div className="text-2xl font-bold text-amber-500">{soonCount}</div>
            <div className="text-xs text-amber-400">{t('expiringSoon')}</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3 text-center border border-green-100 dark:border-green-800">
            <div className="text-2xl font-bold text-green-500">{withDays.filter(i => i.daysLeft > 7).length}</div>
            <div className="text-xs text-green-400">{t('fresh')}</div>
          </div>
        </div>

        {/* 筛选 */}
        <div className="flex gap-2 flex-wrap">
          {(['all', 'expired', 'expiringSoon', 'fresh'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === f ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
              }`}>{t(f)}</button>
          ))}
        </div>

        {/* 添加按钮 */}
        <button onClick={() => setAdding(v => !v)}
          className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-sm text-gray-400 hover:border-indigo-400 hover:text-indigo-500 transition-colors">
          <Plus className="w-4 h-4" />{t('add')}
        </button>

        {/* 表单 */}
        {adding && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder={t('namePlaceholder')}
                className="col-span-2 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none">
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 shrink-0">保质期</span>
                <input type="number" value={form.shelfLife} min={1} onChange={e => setForm(f => ({ ...f, shelfLife: Number(e.target.value) }))}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none" />
                <span className="text-xs text-gray-500 shrink-0">天</span>
              </div>
              <div className="col-span-2">
                <label className="text-xs text-gray-500 mb-1 block">{t('buyDate')}</label>
                <input type="date" value={form.buyDate} onChange={e => setForm(f => ({ ...f, buyDate: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none" />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setAdding(false)} className="px-4 py-2 text-sm text-gray-500">取消</button>
              <button onClick={addItem} className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg">{t('add')}</button>
            </div>
          </div>
        )}

        {/* 列表 */}
        {filtered.length === 0 && <div className="text-center py-12 text-gray-400 text-sm">{t('empty')}</div>}
        <div className="space-y-2">
          {filtered.map(item => {
            const status = getStatus(item.daysLeft)
            const label = item.daysLeft < 0 ? `${Math.abs(item.daysLeft)}${t('daysAgo')}` : `${item.daysLeft}${t('daysLeft')}`
            return (
              <div key={item.id} className={`rounded-xl border p-3 flex items-center gap-3 ${
                status === 'danger' ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800' :
                status === 'warning' ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800' :
                'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
              }`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm text-gray-900 dark:text-gray-100">{item.name}</span>
                    <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">{item.category}</span>
                    <StatusBadge level={status} label={label} />
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">购买: {item.buyDate} · 保质期 {item.shelfLife} 天</div>
                </div>
                <button onClick={() => remove(item.id)} className="text-gray-300 hover:text-red-400 shrink-0"><Trash2 className="w-4 h-4" /></button>
              </div>
            )
          })}
        </div>
        <p className="text-xs text-center text-gray-400">{t('autoSave')}</p>
      </div>
    </div>
  )
}
