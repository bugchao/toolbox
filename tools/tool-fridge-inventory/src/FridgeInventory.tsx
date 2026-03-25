import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Trash2, ShoppingBag } from 'lucide-react'
import { PageHero, StatusBadge } from '@toolbox/ui-kit'
import { useToolStorage } from '@toolbox/storage'

interface FoodItem {
  id: string
  name: string
  qty: number
  unit: string
  category: string
  expiryDate: string
}

interface FridgeState { items: FoodItem[] }
const DEFAULT: FridgeState = {
  items: [
    { id: '1', name: '鸡蛋', qty: 6, unit: '个', category: '蛋奶', expiryDate: '' },
    { id: '2', name: '牛奶', qty: 2, unit: '盒', category: '蛋奶', expiryDate: new Date(Date.now() + 3 * 86400000).toISOString().slice(0,10) },
    { id: '3', name: '胡萝卜', qty: 3, unit: '根', category: '蔬菜', expiryDate: new Date(Date.now() - 86400000).toISOString().slice(0,10) },
  ]
}

const CATEGORIES = ['蔬菜', '水果', '肉类', '海鲜', '蛋奶', '饮品', '调料', '其他']
const UNITS = ['个', '袋', '盒', '瓶', '根', '克', '公斤', '升', '份']

function getStatus(expiryDate: string): 'success' | 'warning' | 'danger' | 'neutral' {
  if (!expiryDate) return 'neutral'
  const days = Math.ceil((new Date(expiryDate).getTime() - Date.now()) / 86400000)
  if (days < 0) return 'danger'
  if (days <= 3) return 'warning'
  return 'success'
}

function getStatusLabel(expiryDate: string, t: (k: string) => string): string {
  if (!expiryDate) return ''
  const days = Math.ceil((new Date(expiryDate).getTime() - Date.now()) / 86400000)
  if (days < 0) return t('expired')
  if (days <= 3) return `${days}天后过期`
  return `${days}天`
}

export default function FridgeInventory() {
  const { t } = useTranslation('toolFridgeInventory')
  const { data: state, save } = useToolStorage<FridgeState>('fridge-inventory', 'data', DEFAULT)
  const [catFilter, setCatFilter] = useState('全部')
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ name: '', qty: 1, unit: '个', category: '蔬菜', expiryDate: '' })

  const { items } = state
  const set = (i: FoodItem[]) => save({ items: i })

  const filtered = catFilter === '全部' ? items : items.filter(i => i.category === catFilter)
  const categories = ['全部', ...CATEGORIES]

  const addItem = () => {
    if (!form.name.trim()) return
    set([...items, { id: Date.now().toString(), ...form }])
    setForm({ name: '', qty: 1, unit: '个', category: '蔬菜', expiryDate: '' })
    setAdding(false)
  }

  const remove = (id: string) => set(items.filter(i => i.id !== id))
  const updateQty = (id: string, qty: number) => set(items.map(i => i.id === id ? { ...i, qty: Math.max(0, qty) } : i))

  const expiringSoon = items.filter(i => i.expiryDate && getStatus(i.expiryDate) !== 'success' && getStatus(i.expiryDate) !== 'neutral').length

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHero title={t('title')} description={t('description')} icon={ShoppingBag} />
      <div className="max-w-xl mx-auto px-4 py-6 space-y-4">

        {/* 警告提示 */}
        {expiringSoon > 0 && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-3 text-sm text-amber-700 dark:text-amber-400">
            ⚠️ 有 {expiringSoon} 种食材即将过期或已过期，请尽快处理
          </div>
        )}

        {/* 分类筛选 */}
        <div className="flex gap-2 flex-wrap">
          {categories.map(cat => (
            <button key={cat} onClick={() => setCatFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                catFilter === cat ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
              }`}>{cat}</button>
          ))}
        </div>

        {/* 添加按钮 */}
        <button onClick={() => setAdding(v => !v)}
          className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-sm text-gray-400 hover:border-indigo-400 hover:text-indigo-500 transition-colors">
          <Plus className="w-4 h-4" />{t('add')}
        </button>

        {/* 添加表单 */}
        {adding && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder={t('name')}
                className="col-span-2 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
              <div className="flex gap-2">
                <input type="number" value={form.qty} min={1} onChange={e => setForm(f => ({ ...f, qty: Number(e.target.value) }))}
                  className="w-20 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none" />
                <select value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                  className="flex-1 px-2 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none">
                  {UNITS.map(u => <option key={u}>{u}</option>)}
                </select>
              </div>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none">
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
              <input type="date" value={form.expiryDate} onChange={e => setForm(f => ({ ...f, expiryDate: e.target.value }))}
                className="col-span-2 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none" />
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setAdding(false)} className="px-4 py-2 text-sm text-gray-500">取消</button>
              <button onClick={addItem} className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg">{t('add')}</button>
            </div>
          </div>
        )}

        {/* 食材列表 */}
        {filtered.length === 0 && <div className="text-center py-12 text-gray-400 text-sm">{t('empty')}</div>}
        <div className="space-y-2">
          {filtered.map(item => {
            const status = getStatus(item.expiryDate)
            const statusLabel = getStatusLabel(item.expiryDate, t)
            return (
              <div key={item.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-gray-900 dark:text-gray-100">{item.name}</span>
                    <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">{item.category}</span>
                    {statusLabel && <StatusBadge level={status} label={statusLabel} />}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => updateQty(item.id, item.qty - 1)} className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 text-sm flex items-center justify-center hover:bg-gray-200">-</button>
                  <span className="text-sm font-medium w-8 text-center">{item.qty}{item.unit}</span>
                  <button onClick={() => updateQty(item.id, item.qty + 1)} className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 text-sm flex items-center justify-center hover:bg-gray-200">+</button>
                  <button onClick={() => remove(item.id)} className="text-gray-300 hover:text-red-400 ml-1"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            )
          })}
        </div>
        <p className="text-xs text-center text-gray-400">{t('autoSave')}</p>
      </div>
    </div>
  )
}
