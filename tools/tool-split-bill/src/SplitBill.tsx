import React, { useState, useMemo } from 'react'
import { Plus, Trash2, Users } from 'lucide-react'

interface Person {
  id: string
  name: string
}

interface Expense {
  id: string
  desc: string
  amount: number
  paidBy: string // person id
  splitAmong: string[] // person ids
}

let uid = 0
const nid = () => String(++uid + Date.now())

const NameInput = ({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) => (
  <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder || ''}
    className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" />
)

export function SplitBill() {
  const [people, setPeople] = useState<Person[]>([
    { id: nid(), name: '小明' }, { id: nid(), name: '小红' }, { id: nid(), name: '小张' }
  ])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [newName, setNewName] = useState('')
  const [form, setForm] = useState({ desc: '', amount: '', paidBy: '', splitAmong: [] as string[] })

  const addPerson = () => {
    if (!newName.trim()) return
    const p = { id: nid(), name: newName.trim() }
    setPeople(prev => [...prev, p])
    setNewName('')
  }

  const removePerson = (id: string) => {
    setPeople(prev => prev.filter(p => p.id !== id))
    setExpenses(prev => prev.filter(e => e.paidBy !== id))
  }

  const toggleSplitAmong = (personId: string) => {
    setForm(f => ({
      ...f,
      splitAmong: f.splitAmong.includes(personId)
        ? f.splitAmong.filter(id => id !== personId)
        : [...f.splitAmong, personId]
    }))
  }

  const addExpense = () => {
    const amount = parseFloat(form.amount)
    if (!form.desc.trim() || !amount || !form.paidBy || form.splitAmong.length === 0) return
    setExpenses(prev => [...prev, { id: nid(), desc: form.desc, amount, paidBy: form.paidBy, splitAmong: form.splitAmong }])
    setForm(f => ({ ...f, desc: '', amount: '', splitAmong: [] }))
  }

  // 计算每人净收支
  const balances = useMemo(() => {
    const bal: Record<string, number> = {}
    people.forEach(p => { bal[p.id] = 0 })
    expenses.forEach(e => {
      const share = e.amount / e.splitAmong.length
      bal[e.paidBy] = (bal[e.paidBy] || 0) + e.amount
      e.splitAmong.forEach(pid => { bal[pid] = (bal[pid] || 0) - share })
    })
    return bal
  }, [people, expenses])

  // 计算最优转账方案
  const settlements = useMemo(() => {
    const creditors: { id: string; amount: number }[] = []
    const debtors: { id: string; amount: number }[] = []
    Object.entries(balances).forEach(([id, bal]) => {
      if (bal > 0.01) creditors.push({ id, amount: bal })
      else if (bal < -0.01) debtors.push({ id, amount: -bal })
    })
    const result: { from: string; to: string; amount: number }[] = []
    let ci = 0, di = 0
    while (ci < creditors.length && di < debtors.length) {
      const c = creditors[ci], d = debtors[di]
      const amt = Math.min(c.amount, d.amount)
      result.push({ from: d.id, to: c.id, amount: amt })
      c.amount -= amt; d.amount -= amt
      if (c.amount < 0.01) ci++
      if (d.amount < 0.01) di++
    }
    return result
  }, [balances])

  const getName = (id: string) => people.find(p => p.id === id)?.name || '?'
  const totalAmount = expenses.reduce((s, e) => s + e.amount, 0)

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">AA 分摊工具</h1>
      <p className="text-gray-500 dark:text-gray-400">多人旅行/聚餐费用分摊，自动计算最优还款方案</p>

      {/* 成员管理 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <Users className="w-4 h-4" />成员 ({people.length})
        </h2>
        <div className="flex gap-2">
          <NameInput value={newName} onChange={setNewName} placeholder="添加成员" />
          <button onClick={addPerson} className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors">
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {people.map(p => (
            <span key={p.id} className="flex items-center gap-1.5 px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-full text-sm">
              {p.name}
              <button onClick={() => removePerson(p.id)} className="text-indigo-400 hover:text-red-400">
                <Trash2 className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* 添加支出 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">添加支出</h2>
        <div className="grid grid-cols-2 gap-2">
          <input value={form.desc} onChange={e => setForm(f => ({...f, desc: e.target.value}))}
            placeholder="支出描述" className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none" />
          <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-700">
            <span className="px-2 text-xs text-gray-400">¥</span>
            <input type="number" value={form.amount} onChange={e => setForm(f => ({...f, amount: e.target.value}))}
              placeholder="金额" className="flex-1 px-2 py-2 text-sm text-gray-900 dark:text-gray-100 bg-transparent focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">谁付的</label>
            <select value={form.paidBy} onChange={e => setForm(f => ({...f, paidBy: e.target.value}))}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none">
              <option value="">选择付款人</option>
              {people.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">谁分摊</label>
            <div className="flex flex-wrap gap-1">
              {people.map(p => (
                <button key={p.id} onClick={() => toggleSplitAmong(p.id)}
                  className={`px-2 py-1 rounded text-xs transition-colors ${
                    form.splitAmong.includes(p.id) ? 'bg-indigo-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'
                  }`}>{p.name}</button>
              ))}
              <button onClick={() => setForm(f => ({...f, splitAmong: people.map(p => p.id)}))}
                className="px-2 py-1 rounded text-xs bg-gray-100 dark:bg-gray-700 text-gray-400">全选</button>
            </div>
          </div>
        </div>
        <button onClick={addExpense}
          disabled={!form.desc || !form.amount || !form.paidBy || form.splitAmong.length === 0}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" />记录支出
        </button>
      </div>

      {/* 支出列表 */}
      {expenses.length > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-500">
            <span>{expenses.length} 笔支出</span>
            <span className="font-medium">总计 ¥{totalAmount.toFixed(2)}</span>
          </div>
          {expenses.map(e => (
            <div key={e.id} className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3">
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{e.desc}</div>
                <div className="text-xs text-gray-400">{getName(e.paidBy)} 付款 · 分摊: {e.splitAmong.map(id => getName(id)).join('、')}</div>
              </div>
              <span className="font-mono font-semibold text-indigo-500">¥{e.amount.toFixed(2)}</span>
              <button onClick={() => setExpenses(prev => prev.filter(x => x.id !== e.id))} className="text-gray-300 hover:text-red-400">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 结算方案 */}
      {settlements.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">最优还款方案</h2>
          {settlements.map((s, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <span className="font-medium text-red-400">{getName(s.from)}</span>
              <span className="text-gray-400">→</span>
              <span className="font-medium text-green-500">{getName(s.to)}</span>
              <span className="ml-auto font-mono font-bold text-gray-900 dark:text-gray-100">¥{s.amount.toFixed(2)}</span>
            </div>
          ))}
        </div>
      )}

      {/* 个人余额 */}
      {expenses.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">个人收支</h2>
          <div className="space-y-2">
            {people.map(p => (
              <div key={p.id} className="flex items-center gap-2 text-sm">
                <span className="text-gray-700 dark:text-gray-300 w-16">{p.name}</span>
                <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${balances[p.id] >= 0 ? 'bg-green-400' : 'bg-red-400'}`}
                    style={{ width: `${Math.min(100, Math.abs(balances[p.id]) / totalAmount * 100 * people.length)}%` }} />
                </div>
                <span className={`font-mono w-20 text-right ${balances[p.id] >= 0 ? 'text-green-500' : 'text-red-400'}`}>
                  {balances[p.id] >= 0 ? '+' : ''}¥{balances[p.id].toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
