import React, { useState } from 'react'
import { Plus, Trash2, CreditCard } from 'lucide-react'

interface Subscription {
  id: string
  name: string
  price: number
  cycle: 'monthly' | 'yearly'
  category: string
  nextBill: string
  color: string
}

const CATEGORIES = ['流媒体', 'AI工具', '开发工具', '云服务', '办公', '游戏', '其他']
const COLORS = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500', 'bg-pink-500', 'bg-indigo-500']

let uid = 0
const nid = () => String(++uid + Date.now())

const SAMPLE: Subscription[] = [
  { id: nid(), name: 'Netflix', price: 68, cycle: 'monthly', category: '流媒体', nextBill: '2026-04-01', color: 'bg-red-500' },
  { id: nid(), name: 'ChatGPT Plus', price: 140, cycle: 'monthly', category: 'AI工具', nextBill: '2026-04-05', color: 'bg-green-500' },
  { id: nid(), name: 'GitHub Copilot', price: 100, cycle: 'monthly', category: '开发工具', nextBill: '2026-04-10', color: 'bg-purple-500' },
  { id: nid(), name: 'iCloud 200GB', price: 21, cycle: 'monthly', category: '云服务', nextBill: '2026-04-15', color: 'bg-blue-500' },
]

const NameInput = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
  <input value={value} onChange={e => onChange(e.target.value)} placeholder="服务名称"
    className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" />
)

const PriceInput = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
  <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-700">
    <span className="px-2 text-xs text-gray-400 bg-gray-50 dark:bg-gray-600 border-r border-gray-300 dark:border-gray-600">¥</span>
    <input type="number" value={value} onChange={e => onChange(e.target.value)} placeholder="金额"
      className="flex-1 px-2 py-2 text-sm text-gray-900 dark:text-gray-100 bg-transparent focus:outline-none w-20" />
  </div>
)

const NextBillInput = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
  <input type="date" value={value} onChange={e => onChange(e.target.value)}
    className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" />
)

export function SubscriptionManager() {
  const [subs, setSubs] = useState<Subscription[]>(SAMPLE)
  const [form, setForm] = useState({ name: '', price: '', cycle: 'monthly' as const, category: '其他', nextBill: '', color: COLORS[0] })
  const [filterCat, setFilterCat] = useState('全部')

  const add = () => {
    const price = parseFloat(form.price)
    if (!form.name.trim() || !price) return
    setSubs(prev => [...prev, { id: nid(), ...form, price }])
    setForm(f => ({ ...f, name: '', price: '', nextBill: '' }))
  }

  const remove = (id: string) => setSubs(prev => prev.filter(s => s.id !== id))

  const filtered = filterCat === '全部' ? subs : subs.filter(s => s.category === filterCat)
  const monthlyTotal = subs.reduce((sum, s) => sum + (s.cycle === 'monthly' ? s.price : s.price / 12), 0)
  const yearlyTotal = monthlyTotal * 12

  // 即将到期（7天内）
  const soon = subs.filter(s => {
    const diff = (new Date(s.nextBill).getTime() - Date.now()) / 86400000
    return diff >= 0 && diff <= 7
  })

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">订阅费用管理</h1>
      <p className="text-gray-500 dark:text-gray-400">管理 Netflix、AI 工具等订阅服务，掌握每月费用</p>

      {/* 统计 */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-4 text-white">
          <div className="text-xs opacity-70">月均支出</div>
          <div className="text-2xl font-bold mt-1">¥{monthlyTotal.toFixed(0)}</div>
        </div>
        <div className="bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl p-4 text-white">
          <div className="text-xs opacity-70">年均支出</div>
          <div className="text-2xl font-bold mt-1">¥{yearlyTotal.toFixed(0)}</div>
        </div>
      </div>

      {/* 即将到期 */}
      {soon.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-xl p-3">
          <div className="text-xs font-semibold text-yellow-700 dark:text-yellow-400 mb-2">⏰ 7天内到期</div>
          <div className="space-y-1">
            {soon.map(s => (
              <div key={s.id} className="flex justify-between text-sm">
                <span className="text-yellow-800 dark:text-yellow-300">{s.name}</span>
                <span className="text-yellow-600">{s.nextBill} · ¥{s.price}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 添加订阅 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">添加订阅</h2>
        <div className="grid grid-cols-2 gap-2">
          <NameInput value={form.name} onChange={v => setForm(f => ({...f, name: v}))} />
          <PriceInput value={form.price} onChange={v => setForm(f => ({...f, price: v}))} />
          <select value={form.cycle} onChange={e => setForm(f => ({...f, cycle: e.target.value as any}))}
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500">
            <option value="monthly">按月</option>
            <option value="yearly">按年</option>
          </select>
          <select value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))}
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500">
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <NextBillInput value={form.nextBill} onChange={v => setForm(f => ({...f, nextBill: v}))} />
          <div className="flex gap-1 items-center">
            {COLORS.map(c => (
              <button key={c} onClick={() => setForm(f => ({...f, color: c}))}
                className={`w-6 h-6 rounded-full ${c} ${form.color === c ? 'ring-2 ring-offset-1 ring-indigo-500' : ''}`} />
            ))}
          </div>
        </div>
        <button onClick={add} disabled={!form.name || !form.price}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" />添加
        </button>
      </div>

      {/* 分类筛选 */}
      <div className="flex gap-2 flex-wrap">
        {(['全部', ...CATEGORIES]).map(c => (
          <button key={c} onClick={() => setFilterCat(c)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              filterCat === c ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}>{c}</button>
        ))}
      </div>

      {/* 列表 */}
      <div className="space-y-2">
        {filtered.map(s => (
          <div key={s.id} className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3">
            <div className={`w-2 h-10 rounded-full ${s.color} shrink-0`} />
            <CreditCard className="w-4 h-4 text-gray-400" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{s.name}</div>
              <div className="text-xs text-gray-400">{s.category} · {s.cycle === 'monthly' ? '月付' : '年付'} · 下次 {s.nextBill || '未设置'}</div>
            </div>
            <div className="text-right shrink-0">
              <div className="font-mono font-semibold text-indigo-500">¥{s.price}</div>
              <div className="text-xs text-gray-400">{s.cycle === 'yearly' ? `≈¥${(s.price/12).toFixed(0)}/月` : '/月'}</div>
            </div>
            <button onClick={() => remove(s.id)} className="text-gray-300 hover:text-red-400 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
