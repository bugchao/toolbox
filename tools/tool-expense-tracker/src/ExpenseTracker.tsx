import React, { useState } from 'react'
import { Plus, Trash2, TrendingDown } from 'lucide-react'

interface Expense {
  id: string
  date: string
  amount: number
  category: string
  note: string
}

const CATEGORIES = ['餐饮', '交通', '购物', '娱乐', '住房', '医疗', '教育', '其他']
const CAT_COLORS: Record<string, string> = {
  餐饮: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600',
  交通: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600',
  购物: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600',
  娱乐: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600',
  住房: 'bg-green-100 dark:bg-green-900/30 text-green-600',
  医疗: 'bg-red-100 dark:bg-red-900/30 text-red-600',
  教育: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600',
  其他: 'bg-gray-100 dark:bg-gray-700 text-gray-600',
}

let uid = 0
const nid = () => String(++uid + Date.now())
const today = () => new Date().toISOString().slice(0, 10)

const SAMPLE: Expense[] = [
  { id: nid(), date: today(), amount: 38, category: '餐饮', note: '午餐' },
  { id: nid(), date: today(), amount: 15, category: '交通', note: '地铁' },
  { id: nid(), date: today(), amount: 299, category: '购物', note: '衣服' },
]

const AmountInput = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
  <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-700">
    <span className="px-2 text-sm text-gray-400 bg-gray-50 dark:bg-gray-600 border-r border-gray-300 dark:border-gray-600">¥</span>
    <input type="number" value={value} onChange={e => onChange(e.target.value)} placeholder="0.00"
      className="flex-1 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 bg-transparent focus:outline-none" />
  </div>
)

export function ExpenseTracker() {
  const [expenses, setExpenses] = useState<Expense[]>(SAMPLE)
  const [form, setForm] = useState({ date: today(), amount: '', category: '餐饮', note: '' })
  const [filterCat, setFilterCat] = useState('全部')

  const add = () => {
    const amt = parseFloat(form.amount)
    if (!amt || amt <= 0) return
    setExpenses(prev => [{ id: nid(), date: form.date, amount: amt, category: form.category, note: form.note }, ...prev])
    setForm(f => ({ ...f, amount: '', note: '' }))
  }

  const remove = (id: string) => setExpenses(prev => prev.filter(e => e.id !== id))

  const filtered = filterCat === '全部' ? expenses : expenses.filter(e => e.category === filterCat)
  const total = filtered.reduce((s, e) => s + e.amount, 0)

  // 分类汇总
  const catTotals = CATEGORIES.map(c => ({
    name: c,
    total: expenses.filter(e => e.category === c).reduce((s, e) => s + e.amount, 0)
  })).filter(c => c.total > 0).sort((a, b) => b.total - a.total)

  const grandTotal = expenses.reduce((s, e) => s + e.amount, 0)

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">记账工具</h1>
      <p className="text-gray-500 dark:text-gray-400">记录每日支出，按分类统计消费</p>

      {/* 汇总卡片 */}
      <div className="bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl p-5 text-white">
        <div className="text-sm opacity-80">本期总支出</div>
        <div className="text-4xl font-bold mt-1">¥{grandTotal.toFixed(2)}</div>
        <div className="flex gap-3 mt-3 flex-wrap">
          {catTotals.slice(0, 3).map(c => (
            <div key={c.name} className="text-xs opacity-80">{c.name} ¥{c.total.toFixed(0)}</div>
          ))}
        </div>
      </div>

      {/* 添加支出 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">添加支出</h2>
        <div className="grid grid-cols-2 gap-2">
          <input type="date" value={form.date} onChange={e => setForm(f => ({...f, date: e.target.value}))}
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-1 focus:ring-rose-500" />
          <AmountInput value={form.amount} onChange={v => setForm(f => ({...f, amount: v}))} />
          <select value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))}
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-1 focus:ring-rose-500">
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input value={form.note} onChange={e => setForm(f => ({...f, note: e.target.value}))}
            placeholder="备注" onKeyDown={e => e.key === 'Enter' && add()}
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-1 focus:ring-rose-500" />
        </div>
        <button onClick={add} disabled={!form.amount}
          className="flex items-center gap-1.5 px-4 py-2 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" />记录支出
        </button>
      </div>

      {/* 分类筛选 */}
      <div className="flex gap-2 flex-wrap">
        {(['全部', ...CATEGORIES]).map(c => (
          <button key={c} onClick={() => setFilterCat(c)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              filterCat === c ? 'bg-rose-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}>{c}</button>
        ))}
      </div>

      {/* 支出列表 */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-500">
          <span>{filtered.length} 条记录</span>
          <span className="font-medium text-rose-500">¥{total.toFixed(2)}</span>
        </div>
        {filtered.map(e => (
          <div key={e.id} className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3">
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${CAT_COLORS[e.category]}`}>{e.category}</span>
            <span className="text-xs text-gray-400">{e.date}</span>
            <span className="text-sm text-gray-600 dark:text-gray-400 flex-1">{e.note || '—'}</span>
            <span className="font-mono font-semibold text-rose-500">¥{e.amount.toFixed(2)}</span>
            <button onClick={() => remove(e.id)} className="text-gray-300 hover:text-red-400 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
