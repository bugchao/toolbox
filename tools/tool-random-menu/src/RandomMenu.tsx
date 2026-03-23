import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { PageHero } from '@toolbox/ui-kit'
import { useToolStorage } from '@toolbox/storage'
import { UtensilsCrossed, RotateCcw, Sparkles } from 'lucide-react'

const MENU_CATEGORIES: Record<string, string[]> = {
  早餐: ['豆浆油条', '包子馒头', '鸡蛋灌饼', '煎饼果子', '馄饨', '面条', '粥', '面包牛奶'],
  午餐: ['红烧肉', '宫保鸡丁', '鱼香肉丝', '麻婆豆腐', '回锅肉', '糖醋里脊', '水煮肉片', '酸菜鱼', '辣子鸡', '干锅'],
  晚餐: ['清淡炒菜', '凉拌菜', '汤面', '饺子', '馄饨', '沙拉', '三明治', '粥'],
  快餐: ['汉堡', '披萨', '炸鸡', '寿司', '拉面', '炒饭', '盖浇饭', '麻辣烫'],
  健康: ['鸡胸肉沙拉', '清蒸鱼', '水煮菜', '糙米饭', '凉拌鸡丝', '蔬菜汤', '水果沙拉'],
}

const ALL_MENUS = Object.values(MENU_CATEGORIES).flat()

interface MenuState {
  selectedCategory: string
  result: string
  history: string[]
}

const DEFAULT_STATE: MenuState = {
  selectedCategory: '全部',
  result: '',
  history: [],
}

export default function RandomMenu() {
  const { t } = useTranslation('toolRandomMenu')
  const { data: state, save } = useToolStorage<MenuState>('random-menu', 'data', DEFAULT_STATE)
  const [animating, setAnimating] = React.useState(false)

  const { selectedCategory, result, history } = state
  const set = (patch: Partial<MenuState>) => save({ ...state, ...patch })

  const getRandomMenu = useCallback(() => {
    setAnimating(true)
    const menus = selectedCategory === '全部' ? ALL_MENUS : (MENU_CATEGORIES[selectedCategory] || ALL_MENUS)
    let count = 0
    const interval = setInterval(() => {
      save({ ...state, result: menus[Math.floor(Math.random() * menus.length)] })
      count++
      if (count >= 20) {
        clearInterval(interval)
        const final = menus[Math.floor(Math.random() * menus.length)]
        save({
          ...state,
          result: final,
          history: [final, ...state.history].slice(0, 5),
        })
        setAnimating(false)
      }
    }, 80)
  }, [selectedCategory, state])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHero
        title={t('title')}
        description={t('description')}
        icon={UtensilsCrossed}
      />
      <div className="max-w-xl mx-auto px-4 py-6 space-y-4">
        {/* 分类 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('category')}</label>
          <div className="flex flex-wrap gap-2">
            {['全部', ...Object.keys(MENU_CATEGORIES)].map(cat => (
              <button key={cat} onClick={() => set({ selectedCategory: cat })}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  selectedCategory === cat
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                }`}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* 按钮 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <button onClick={getRandomMenu} disabled={animating}
            className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold text-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-70">
            <Sparkles className={`w-5 h-5 ${animating ? 'animate-spin' : ''}`} />
            {animating ? t('spinning') : t('spin')}
          </button>
        </div>

        {/* 结果 */}
        {result && (
          <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-8 text-white text-center">
            <div className="text-sm opacity-80 mb-2">{t('todayEat')}</div>
            <div className="text-5xl font-bold mb-4">{result}</div>
            <div className="text-sm opacity-80">
              {selectedCategory === '全部' ? '来自全部菜单' : `来自${selectedCategory}分类`}
            </div>
          </div>
        )}

        {/* 历史 */}
        {history.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-gray-400" />
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('history')}</h3>
              </div>
              <button onClick={() => set({ history: [] })} className="text-xs text-gray-400 hover:text-red-400 transition-colors">{t('clear')}</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {history.map((item, i) => (
                <span key={i} className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm">
                  {i + 1}. {item}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
