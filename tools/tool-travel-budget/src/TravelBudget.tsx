import React, { useState } from 'react'
import { Plus, Trash2, Plane } from 'lucide-react'

interface BudgetItem {
  id: string
  category: string
  name: string
  planned: number
  actual: number
}

const CATEGORIES = ['交通', '住宿', '餐饮', '景点门票', '购物', '通讯', '保险', '其他']
const CAT_EMOJI: Record<string, string> = {
  交通: '✈️', 住宿: '🏨', 餐饮: '🍜', 景点门票: '🎫', 购物: '🛍️', 通讯: '📱', 保险: '🛡️', 其他: '📦'
}

let uid = 0
const nid = () => String(++uid + Date.now())

const SAMPLE: BudgetItem[] = [
  { id: nid(), category: '交通', name: '国际机票（往返）', planned: 3000, actual: 2850 },
  { id: nid(), category: '交通', name: '当地交通', planned: 500, actual: 0 },
  { id: nid(), category: '住宿', name: '酒店（5晚）', planned: 2500, actual: 2200 },
  { id: nid(), category: '餐饮', name: '每日餐食', planned: 1500, actual: 0 },
  { id: nid(), category: '景点门票', name: '景点费用', planned: 800, actual: 0 },
  { id: nid(), category: '购物', name: '购物预算', planned: 2000, actual: 0 },
  { id: nid(), category: '保险', name: '旅行保险', planned: 200, actual: 180 },
]

const AmtInput = ({ value, onChange, placeholder }: { value: number; onChange: (v: number) => void; placeholder?: string }) => (
  <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-700">
    <span className="px-2 text-xs text-gray-400 bg-gray-50 dark:bg-gray-600 border-r border-gray-300 dark:border-gray-600">¥</span>
    <input type="number" value={value || ''} onChange={e => onChange(parseFloat(e.target.value) || 0)}
      placeholder={placeholder}
      className="flex-1 px-2 py-1.5 text-sm text-gray-900 dark:text-gray-100 bg-transparent focus:outline-none w-24" />
  </div>
)

export function TravelBudget() {
  const [items, setItems] = useState<BudgetItem[]>(SAMPLE)
  const [form, setForm] = useState({ category: '交通', name: '', planned: 0, actual: 0 })
  const [currency, setCurrency] = useState('CNY')
  const [days, setDays] = useState(7)

  const add = () => {
    if (!form.name.trim() || !form.planned) return
    setItems(prev => [...prev, { id: nid(), ...form }])
    setForm(f => ({ ...f, name: '', planned: 0, actual: 0 }))
  }

  const remove = (id: string) => setItems(prev => prev.filter(i => i.id !== id))
  const updateActual = (id: string, actual: number) => setItems(prev => prev.map(i => i.id === id ? { ...i, actual } : i))

  const totalPlanned = items.reduce((s, i) => s + i.planned, 0)
  const totalActual = items.reduce((s, i) => s + i.actual, 0)
  const remaining = totalPlanned - totalActual

  const catTotals = CATEGORIES.map(c => ({
    cat: c,
    planned: items.filter(i => i.category === c).reduce((s, i) => s + i.planned, 0),
    actual: items.filter(i => i.category === c).reduce((s, i) => s + i.actual, 0),
  })).filter(c => c.planned > 0)

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">旅行预算计算器</h1>
      <p className="text-gray-500 dark:text-gray-400">规划旅行各项费用，对比预算与实际花销</p>

      {/* 基本设置 */}
      <div className="flex gap-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">旅行天数</label>
          <input type="number" value={days} onChange={e => setDays(parseInt(e.target.value) || 1)} min={1}
            className="w-24 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">货币</label>
          <select value={currency} onChange={e => setCurrency(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none">
            {['CNY', 'USD', 'EUR', 'JPY', 'THB'].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* 汇总卡片 */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4 text-center">
          <div className="text-xs text-indigo-500 mb-1">总预算</div>
          <div className="text-xl font-bold text-indigo-600">¥{totalPlanned.toLocaleString()}</div>
          <div className="text-xs text-indigo-400 mt-1">≈¥{(totalPlanned/days).toFixed(0)}/天</div>
        </div>
        <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl p-4 text-center">
          <div className="text-xs text-rose-500 mb-1">已花费</div>
          <div className="text-xl font-bold text-rose-600">¥{totalActual.toLocaleString()}</div>
          <div className="text-xs text-rose-400 mt-1">{totalPlanned > 0 ? Math.round(totalActual/totalPlanned*100) : 0}% 已用</div>
        </div>
        <div className={`border rounded-xl p-4 text-center ${remaining >= 0 ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'}`}>
          <div className={`text-xs mb-1 ${remaining >= 0 ? 'text-green-500' : 'text-red-500'}`}>剩余</div>
          <div className={`text-xl font-bold ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>¥{Math.abs(remaining).toLocaleString()}</div>
          <div className={`text-xs mt-1 ${remaining >= 0 ? 'text-green-400' : 'text-red-400'}`}>{remaining >= 0 ? '结余' : '超支'}</div>
        </div>
      </div>

      {/* 添加预算项 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">添加预算项</h2>
        <div className="grid grid-cols-2 gap-2">
          <select value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))}
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none">
            {CATEGORIES.map(c => <option key={c} value={c}>{CAT_EMOJI[c]} {c}</option>)}
          </select>
          <input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))}
            placeholder="项目名称" className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none" />
          <AmtInput value={form.planned} onChange={v => setForm(f => ({...f, planned: v}))} placeholder="预算金额" />
          <AmtInput value={form.actual} onChange={v => setForm(f => ({...f, actual: v}))} placeholder="实际花费" />
        </div>
        <button onClick={add} disabled={!form.name || !form.planned}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" />添加
        </button>
      </div>

      {/* 明细表 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>{['分类', '项目', '预算', '实际', '差额', ''].map(h => (
                <th key={h} className="px-3 py-2 text-left text-xs font-medium text-gray-500">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {items.map(item => {
                const diff = item.planned - item.actual
                return (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-3 py-2 text-xs">{CAT_EMOJI[item.category]} {item.category}</td>
                    <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{item.name}</td>
                    <td className="px-3 py-2 font-mono text-gray-600 dark:text-gray-400">¥{item.planned.toLocaleString()}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center border border-gray-200 dark:border-gray-600 rounded overflow-hidden w-24">
                        <span className="px-1 text-xs text-gray-400">¥</span>
                        <input type="number" value={item.actual || ''} onChange={e => updateActual(item.id, parseFloat(e.target.value) || 0)}
                          className="flex-1 px-1 py-1 text-xs bg-transparent text-gray-900 dark:text-gray-100 focus:outline-none w-16" />
                      </div>
                    </td>
                    <td className={`px-3 py-2 font-mono text-xs ${diff >= 0 ? 'text-green-500' : 'text-red-400'}`}>
                      {item.actual > 0 ? `${diff >= 0 ? '+' : ''}¥${diff.toFixed(0)}` : '—'}
                    </td>
                    <td className="px-3 py-2">
                      <button onClick={() => remove(item.id)} className="text-gray-300 hover:text-red-400">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
