import React, { useState } from 'react'
import { Plus, Trash2, Flame } from 'lucide-react'

interface FoodItem {
  id: string
  name: string
  amount: number
  unit: string
  calories: number
  protein: number
  carbs: number
  fat: number
}

const FOOD_DB: Array<{ name: string; unit: string; per100: { cal: number; protein: number; carbs: number; fat: number } }> = [
  { name: '白米饭', unit: '克', per100: { cal: 116, protein: 2.6, carbs: 25.6, fat: 0.3 } },
  { name: '全麦面包', unit: '克', per100: { cal: 246, protein: 9, carbs: 43, fat: 3.4 } },
  { name: '鸡胸肉', unit: '克', per100: { cal: 133, protein: 24, carbs: 0, fat: 3.2 } },
  { name: '鸡蛋', unit: '个', per100: { cal: 144, protein: 12.5, carbs: 1.5, fat: 10 } },
  { name: '牛奶', unit: '毫升', per100: { cal: 61, protein: 3.2, carbs: 4.8, fat: 3.3 } },
  { name: '苹果', unit: '克', per100: { cal: 52, protein: 0.3, carbs: 13.8, fat: 0.2 } },
  { name: '香蕉', unit: '克', per100: { cal: 89, protein: 1.1, carbs: 22.8, fat: 0.3 } },
  { name: '西兰花', unit: '克', per100: { cal: 34, protein: 2.8, carbs: 6.6, fat: 0.4 } },
  { name: '三文鱼', unit: '克', per100: { cal: 208, protein: 20, carbs: 0, fat: 13 } },
  { name: '豆腐', unit: '克', per100: { cal: 76, protein: 8.1, carbs: 1.9, fat: 4.2 } },
  { name: '花生', unit: '克', per100: { cal: 567, protein: 25.8, carbs: 16.1, fat: 49.2 } },
  { name: '燕麦', unit: '克', per100: { cal: 389, protein: 16.9, carbs: 66, fat: 6.9 } },
]

const UNIT_WEIGHT: Record<string, number> = { 克: 1, 毫升: 1, 个: 50 }

let uid = 0
const nid = () => String(++uid + Date.now())

const SelectField = ({ value, onChange, children }: { value: string; onChange: (v: string) => void; children: React.ReactNode }) => (
  <select value={value} onChange={e => onChange(e.target.value)}
    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500">
    {children}
  </select>
)

export function CalorieCalc() {
  const [items, setItems] = useState<FoodItem[]>([])
  const [selected, setSelected] = useState(FOOD_DB[0].name)
  const [amount, setAmount] = useState(100)
  const [goal, setGoal] = useState(2000)

  const addFood = () => {
    const food = FOOD_DB.find(f => f.name === selected)!
    const weight = amount * (UNIT_WEIGHT[food.unit] || 1)
    const ratio = weight / 100
    setItems(prev => [{
      id: nid(), name: food.name, amount, unit: food.unit,
      calories: Math.round(food.per100.cal * ratio),
      protein: Math.round(food.per100.protein * ratio * 10) / 10,
      carbs: Math.round(food.per100.carbs * ratio * 10) / 10,
      fat: Math.round(food.per100.fat * ratio * 10) / 10,
    }, ...prev])
  }

  const remove = (id: string) => setItems(prev => prev.filter(i => i.id !== id))

  const totalCal = items.reduce((s, i) => s + i.calories, 0)
  const totalProtein = items.reduce((s, i) => s + i.protein, 0)
  const totalCarbs = items.reduce((s, i) => s + i.carbs, 0)
  const totalFat = items.reduce((s, i) => s + i.fat, 0)
  const pct = Math.min(100, Math.round(totalCal / goal * 100))

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">卡路里估算</h1>
      <p className="text-gray-500 dark:text-gray-400">记录今日饮食，估算热量和营养素摄入</p>

      {/* 目标与进度 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{totalCal} / {goal} 千卡</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">目标</span>
            <input type="number" value={goal} onChange={e => setGoal(parseInt(e.target.value) || 2000)}
              className="w-20 px-2 py-1 text-xs rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none" />
          </div>
        </div>
        <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all ${
            pct >= 100 ? 'bg-red-500' : pct >= 80 ? 'bg-orange-400' : 'bg-green-500'
          }`} style={{ width: `${pct}%` }} />
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          {[['蛋白质', totalProtein.toFixed(1), 'g', 'text-blue-500'],
            ['碳水', totalCarbs.toFixed(1), 'g', 'text-yellow-500'],
            ['脂肪', totalFat.toFixed(1), 'g', 'text-pink-500']].map(([label, val, unit, color]) => (
            <div key={label as string} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
              <div className={`text-lg font-bold ${color}`}>{val}<span className="text-xs">{unit}</span></div>
              <div className="text-xs text-gray-400">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 添加食物 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">添加食物</h2>
        <div className="flex gap-2">
          <div className="flex-1">
            <SelectField value={selected} onChange={setSelected}>
              {FOOD_DB.map(f => <option key={f.name} value={f.name}>{f.name}</option>)}
            </SelectField>
          </div>
          <input type="number" value={amount} onChange={e => setAmount(parseInt(e.target.value) || 0)}
            className="w-20 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500" />
          <span className="flex items-center text-sm text-gray-500">{FOOD_DB.find(f => f.name === selected)?.unit}</span>
          <button onClick={addFood}
            className="flex items-center gap-1 px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" />加
          </button>
        </div>
      </div>

      {/* 食物列表 */}
      {items.length > 0 && (
        <div className="space-y-2">
          {items.map(item => (
            <div key={item.id} className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3">
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.name} <span className="text-gray-400 font-normal">{item.amount}{item.unit}</span></div>
                <div className="text-xs text-gray-400 mt-0.5">蛋白质 {item.protein}g · 碳水 {item.carbs}g · 脂肪 {item.fat}g</div>
              </div>
              <div className="flex items-center gap-1 text-orange-500 font-semibold">
                <Flame className="w-3.5 h-3.5" />{item.calories}
              </div>
              <button onClick={() => remove(item.id)} className="text-gray-300 hover:text-red-400 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
