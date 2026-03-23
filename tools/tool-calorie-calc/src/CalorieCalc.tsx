import React, { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { PageHero } from '@toolbox/ui-kit'
import { useToolStorage } from '@toolbox/storage'
import { Apple, Flame } from 'lucide-react'

const FOOD_DATABASE = [
  { name: '米饭', calories: 116, category: '主食' },
  { name: '馒头', calories: 223, category: '主食' },
  { name: '面条', calories: 110, category: '主食' },
  { name: '面包', calories: 265, category: '主食' },
  { name: '玉米', calories: 112, category: '主食' },
  { name: '红薯', calories: 86, category: '主食' },
  { name: '鸡胸肉', calories: 133, category: '肉类' },
  { name: '牛肉', calories: 220, category: '肉类' },
  { name: '猪肉(瘦)', calories: 143, category: '肉类' },
  { name: '羊肉', calories: 203, category: '肉类' },
  { name: '鱼肉', calories: 105, category: '肉类' },
  { name: '虾', calories: 93, category: '肉类' },
  { name: '西兰花', calories: 34, category: '蔬菜' },
  { name: '胡萝卜', calories: 41, category: '蔬菜' },
  { name: '黄瓜', calories: 16, category: '蔬菜' },
  { name: '番茄', calories: 18, category: '蔬菜' },
  { name: '生菜', calories: 15, category: '蔬菜' },
  { name: '土豆', calories: 77, category: '蔬菜' },
  { name: '苹果', calories: 52, category: '水果' },
  { name: '香蕉', calories: 89, category: '水果' },
  { name: '橙子', calories: 47, category: '水果' },
  { name: '葡萝', calories: 67, category: '水果' },
  { name: '西瓜', calories: 30, category: '水果' },
  { name: '草莓', calories: 32, category: '水果' },
  { name: '鸡蛋', calories: 155, category: '其他' },
  { name: '牛奶', calories: 54, category: '其他' },
  { name: '酸奶', calories: 70, category: '其他' },
  { name: '豆腐', calories: 76, category: '其他' },
  { name: '坚果', calories: 600, category: '其他' },
]

const CATEGORIES = ['全部', '主食', '肉类', '蔬菜', '水果', '其他']

interface CalorieState {
  selectedFood: string
  weight: number
  category: string
}

const DEFAULT_STATE: CalorieState = {
  selectedFood: '',
  weight: 100,
  category: '全部',
}

export default function CalorieCalc() {
  const { t } = useTranslation('toolCalorieCalc')
  const { data: state, save } = useToolStorage<CalorieState>('calorie-calc', 'data', DEFAULT_STATE)
  const [search, setSearch] = useState('')

  const { selectedFood, weight, category } = state
  const set = (patch: Partial<CalorieState>) => save({ ...state, ...patch })

  const filteredFoods = useMemo(() =>
    FOOD_DATABASE.filter(f =>
      (category === '全部' || f.category === category) &&
      (!search || f.name.includes(search))
    ), [category, search])

  const foodData = FOOD_DATABASE.find(f => f.name === selectedFood)
  const calories = foodData ? (foodData.calories * weight) / 100 : 0

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHero
        title={t('title')}
        description={t('description')}
        icon={Apple}
      />
      <div className="max-w-xl mx-auto px-4 py-6 space-y-4">
        {/* 分类 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('category')}</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => set({ category: cat })}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  category === cat
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                }`}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* 搜索 + 食物列表 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
          <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
            {filteredFoods.map(f => (
              <button key={f.name} onClick={() => set({ selectedFood: f.name })}
                className={`px-2 py-2 rounded-lg text-sm text-center transition-colors ${
                  selectedFood === f.name
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                }`}>
                <div>{f.name}</div>
                <div className="text-xs opacity-70">{f.calories}kcal/100g</div>
              </button>
            ))}
          </div>
        </div>

        {/* 重量 */}
        {selectedFood && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('weight')}: {weight}g</label>
            <input type="range" min={10} max={1000} step={10} value={weight}
              onChange={e => set({ weight: Number(e.target.value) })}
              className="w-full accent-green-500" />
            <div className="flex gap-2">
              {[50, 100, 200, 300, 500].map(w => (
                <button key={w} onClick={() => set({ weight: w })}
                  className="flex-1 px-2 py-2 text-sm rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 transition-colors">
                  {w}g
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 结果 */}
        {selectedFood && (
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-5 h-5" />
              <span className="text-sm opacity-80">{t('estimatedCalories')}</span>
            </div>
            <div className="text-4xl font-bold mb-1">{calories.toFixed(0)} <span className="text-lg">kcal</span></div>
            <div className="text-sm opacity-80">{weight}g {selectedFood} ≈ {calories.toFixed(0)} 大卡</div>
          </div>
        )}

        {/* 贴士 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">💡 {t('tips')}</h3>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li>• 成人每日推荐摄入：1800-2500 kcal（根据活动量）</li>
            <li>• 减脂期建议：每日摄入 &lt; 每日消耗 500 kcal</li>
            <li>• 1kg 脂肪 ≈ 7700 kcal</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
