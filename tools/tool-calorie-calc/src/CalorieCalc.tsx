import React, { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { PageHero } from '@toolbox/ui-kit'
import { useToolStorage } from '@toolbox/storage'
import { Apple, Flame, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react'

const FOOD_DATABASE: { name: string; calories: number; category: string }[] = [
  // 主食
  { name: '米饭', calories: 116, category: '主食' },
  { name: '馒头', calories: 223, category: '主食' },
  { name: '面条', calories: 110, category: '主食' },
  { name: '面包', calories: 265, category: '主食' },
  { name: '玉米', calories: 112, category: '主食' },
  { name: '红薯', calories: 86, category: '主食' },
  { name: '燕麦', calories: 389, category: '主食' },
  { name: '糙米', calories: 111, category: '主食' },
  // 肉类
  { name: '鸡胸肉', calories: 133, category: '肉类' },
  { name: '牛肉', calories: 220, category: '肉类' },
  { name: '猪肉(瘦)', calories: 143, category: '肉类' },
  { name: '羊肉', calories: 203, category: '肉类' },
  { name: '鱼肉', calories: 105, category: '肉类' },
  { name: '虾', calories: 93, category: '肉类' },
  { name: '鸡腿', calories: 181, category: '肉类' },
  { name: '猪蹄', calories: 260, category: '肉类' },
  // 蔬菜
  { name: '西兰花', calories: 34, category: '蔬菜' },
  { name: '胡萝卜', calories: 41, category: '蔬菜' },
  { name: '黄瓜', calories: 16, category: '蔬菜' },
  { name: '番茄', calories: 18, category: '蔬菜' },
  { name: '生菜', calories: 15, category: '蔬菜' },
  { name: '土豆', calories: 77, category: '蔬菜' },
  { name: '菠菜', calories: 23, category: '蔬菜' },
  { name: '白菜', calories: 17, category: '蔬菜' },
  // 水果
  { name: '苹果', calories: 52, category: '水果' },
  { name: '香蕉', calories: 89, category: '水果' },
  { name: '橙子', calories: 47, category: '水果' },
  { name: '葡萄', calories: 67, category: '水果' },
  { name: '西瓜', calories: 30, category: '水果' },
  { name: '草莓', calories: 32, category: '水果' },
  { name: '芒果', calories: 60, category: '水果' },
  { name: '猕猴桃', calories: 61, category: '水果' },
  // 饮品
  { name: '牛奶', calories: 54, category: '饮品' },
  { name: '豆浆', calories: 31, category: '饮品' },
  { name: '酸奶', calories: 70, category: '饮品' },
  { name: '橙汁', calories: 45, category: '饮品' },
  { name: '可乐', calories: 42, category: '饮品' },
  { name: '咖啡(黑)', calories: 2, category: '饮品' },
  // 零食
  { name: '鸡蛋', calories: 155, category: '零食' },
  { name: '坚果', calories: 600, category: '零食' },
  { name: '饼干', calories: 450, category: '零食' },
  { name: '巧克力', calories: 546, category: '零食' },
  { name: '薯片', calories: 536, category: '零食' },
  { name: '豆腐', calories: 76, category: '零食' },
]

const MEALS = ['早餐', '午餐', '晚餐', '加餐'] as const
type MealType = typeof MEALS[number]
const MEAL_COLORS: Record<MealType, string> = {
  早餐: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20',
  午餐: 'text-green-500 bg-green-50 dark:bg-green-900/20',
  晚餐: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20',
  加餐: 'text-pink-500 bg-pink-50 dark:bg-pink-900/20',
}

interface DiaryEntry {
  id: string
  meal: MealType
  food: string
  weight: number
  calories: number
  time: string
}

interface CalorieState {
  diary: Record<string, DiaryEntry[]> // key: YYYY-MM-DD
  goal: number
}

const DEFAULT_STATE: CalorieState = {
  diary: {},
  goal: 2000,
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

export default function CalorieCalc() {
  const { t } = useTranslation('toolCalorieCalc')
  const { data: state, save } = useToolStorage<CalorieState>('calorie-calc', 'data', DEFAULT_STATE)

  const [date, setDate] = useState(today())
  const [category, setCategory] = useState('全部')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<{ food: string; weight: number }[]>([])
  const [meal, setMeal] = useState<MealType>('早餐')
  const [showPicker, setShowPicker] = useState(true)

  const diary = (state.diary ?? {})[date] || []
  const totalCalories = diary.reduce((s, e) => s + e.calories, 0)
  const goalPct = Math.min(100, Math.round((totalCalories / state.goal) * 100))

  const mealCalories = (m: MealType) => diary.filter(e => e.meal === m).reduce((s, e) => s + e.calories, 0)

  const categories = ['全部', ...Array.from(new Set(FOOD_DATABASE.map(f => f.category)))]
  const filteredFoods = useMemo(() =>
    FOOD_DATABASE.filter(f =>
      (category === '全部' || f.category === category) &&
      (!search || f.name.includes(search))
    ), [category, search])

  const toggleSelect = (food: string) => {
    setSelected(prev => {
      const exists = prev.find(s => s.food === food)
      if (exists) return prev.filter(s => s.food !== food)
      return [...prev, { food, weight: 100 }]
    })
  }

  const updateWeight = (food: string, weight: number) => {
    setSelected(prev => prev.map(s => s.food === food ? { ...s, weight } : s))
  }

  const addEntries = () => {
    if (selected.length === 0) return
    const newEntries: DiaryEntry[] = selected.map(s => {
      const fd = FOOD_DATABASE.find(f => f.name === s.food)!
      return {
        id: `${Date.now()}-${Math.random()}`,
        meal,
        food: s.food,
        weight: s.weight,
        calories: Math.round((fd.calories * s.weight) / 100),
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      }
    })
    const newDiary = { ...(state.diary ?? {}), [date]: [...diary, ...newEntries] }
    save({ ...state, diary: newDiary })
    setSelected([])
    setShowPicker(false)
  }

  const removeEntry = (id: string) => {
    const newDiary = { ...(state.diary ?? {}), [date]: diary.filter(e => e.id !== id) }
    save({ ...state, diary: newDiary })
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHero
        title={t('title')}
        description={t('description')}
        icon={Apple}
      />
      <div className="max-w-xl mx-auto px-4 py-6 space-y-4">

        {/* 日期 + 目标 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-3">
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="flex-1 text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-400" />
            <span className="text-sm text-gray-500">目标</span>
            <input type="number" value={state.goal} onChange={e => save({ ...state, goal: Number(e.target.value) })}
              className="w-20 text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-center" />
            <span className="text-sm text-gray-500">kcal</span>
          </div>
        </div>

        {/* 今日汇总 */}
        <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl p-5 text-white">
          <div className="flex justify-between items-start mb-3">
            <div>
              <div className="text-sm opacity-80">今日摄入</div>
              <div className="text-4xl font-bold">{totalCalories} <span className="text-lg">kcal</span></div>
            </div>
            <div className="text-right">
              <div className="text-sm opacity-80">剩余</div>
              <div className="text-2xl font-bold">{Math.max(0, state.goal - totalCalories)}</div>
            </div>
          </div>
          <div className="h-2 bg-white/30 rounded-full overflow-hidden">
            <div className="h-full bg-white transition-all" style={{ width: `${goalPct}%` }} />
          </div>
          <div className="flex justify-between mt-2 text-xs opacity-70">
            <span>{goalPct}% 已达成</span>
            <span>目标 {state.goal} kcal</span>
          </div>
        </div>

        {/* 三餐汇总 */}
        <div className="grid grid-cols-4 gap-2">
          {MEALS.map(m => (
            <div key={m} className={`rounded-xl p-3 text-center ${MEAL_COLORS[m]}`}>
              <div className="text-xs font-medium mb-1">{m}</div>
              <div className="text-lg font-bold">{mealCalories(m)}</div>
              <div className="text-xs opacity-70">kcal</div>
            </div>
          ))}
        </div>

        {/* 食物选择器 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <button onClick={() => setShowPicker(v => !v)}
            className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
            <span>➕ 添加食物</span>
            {showPicker ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showPicker && (
            <div className="px-4 pb-4 space-y-3 border-t border-gray-100 dark:border-gray-700 pt-3">
              {/* 餐次选择 */}
              <div className="flex gap-2">
                {MEALS.map(m => (
                  <button key={m} onClick={() => setMeal(m)}
                    className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      meal === m ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}>{m}</button>
                ))}
              </div>

              {/* 分类 + 搜索 */}
              <div className="flex gap-2">
                <select value={category} onChange={e => setCategory(e.target.value)}
                  className="px-2 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                  {categories.map(c => <option key={c}>{c}</option>)}
                </select>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索食物..."
                  className="flex-1 px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
              </div>

              {/* 食物网格 */}
              <div className="grid grid-cols-3 gap-1.5 max-h-48 overflow-y-auto">
                {filteredFoods.map(f => {
                  const sel = selected.find(s => s.food === f.name)
                  return (
                    <button key={f.name} onClick={() => toggleSelect(f.name)}
                      className={`px-2 py-2 rounded-lg text-sm text-center transition-colors ${
                        sel ? 'bg-green-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                      }`}>
                      <div className="font-medium">{f.name}</div>
                      <div className="text-xs opacity-70">{f.calories}/100g</div>
                    </button>
                  )
                })}
              </div>

              {/* 已选食物 + 重量调整 */}
              {selected.length > 0 && (
                <div className="space-y-2 border-t border-gray-100 dark:border-gray-700 pt-3">
                  <div className="text-xs font-medium text-gray-500 mb-1">已选 {selected.length} 种，调整重量后录入：</div>
                  {selected.map(s => {
                    const fd = FOOD_DATABASE.find(f => f.name === s.food)!
                    const cal = Math.round((fd.calories * s.weight) / 100)
                    return (
                      <div key={s.food} className="flex items-center gap-2">
                        <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">{s.food}</span>
                        <input type="number" value={s.weight} min={1} max={2000}
                          onChange={e => updateWeight(s.food, Number(e.target.value))}
                          className="w-16 text-center text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
                        <span className="text-xs text-gray-400 w-4">g</span>
                        <span className="text-sm font-medium text-orange-500 w-16 text-right">{cal} kcal</span>
                        <button onClick={() => toggleSelect(s.food)} className="text-gray-300 hover:text-red-400">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )
                  })}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-sm text-gray-500">合计：<span className="font-bold text-orange-500">{selected.reduce((s, sel) => { const fd = FOOD_DATABASE.find(f => f.name === sel.food)!; return s + Math.round((fd.calories * sel.weight) / 100) }, 0)} kcal</span></span>
                    <button onClick={addEntries}
                      className="flex items-center gap-1.5 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors">
                      <Plus className="w-4 h-4" />录入{meal}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 今日饮食记录 */}
        {diary.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">今日饮食记录</h3>
            </div>
            {MEALS.map(m => {
              const mealEntries = diary.filter(e => e.meal === m)
              if (mealEntries.length === 0) return null
              return (
                <div key={m} className="border-b border-gray-50 dark:border-gray-700/50 last:border-0">
                  <div className={`px-4 py-2 text-xs font-medium ${MEAL_COLORS[m]}`}>
                    {m} · {mealCalories(m)} kcal
                  </div>
                  {mealEntries.map(entry => (
                    <div key={entry.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <div className="flex-1">
                        <span className="text-sm text-gray-700 dark:text-gray-300">{entry.food}</span>
                        <span className="text-xs text-gray-400 ml-2">{entry.weight}g · {entry.time}</span>
                      </div>
                      <span className="text-sm font-medium text-orange-500">{entry.calories} kcal</span>
                      <button onClick={() => removeEntry(entry.id)} className="text-gray-300 hover:text-red-400 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        )}

        {/* 健康贴士 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">💡 健康贴士</h3>
          <ul className="text-sm text-gray-500 space-y-1">
            <li>• 成人每日推荐摄入：1800-2500 kcal（根据活动量）</li>
            <li>• 减脂期建议：每日摄入比消耗少 500 kcal</li>
            <li>• 1kg 脂肪 ≈ 7700 kcal</li>
            <li>• 📷 拍照识别食物功能（接入 AI）敬请期待</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
