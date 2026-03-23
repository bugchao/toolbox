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
  const [state, setState] = useToolStorage<MenuState>('random-menu', DEFAULT_STATE)
  const [animating, setAnimating] = React.useState(false)

  const { selectedCategory, result, history } = state
  const set = (patch: Partial<MenuState>) => setState(prev => ({ ...prev, ...patch }))

  const getRandomMenu = useCallback(() => {
    setAnimating(true)
    const menus = selectedCategory === '全部' ? ALL_MENUS : (MENU_CATEGORIES[selectedCategory] || ALL_MENUS)
    let count = 0
    const interval = setInterval(() => {
      set({ result: menus[Math.floor(Math.random() * menus.length)] })
      count++
      if (count >= 20) {
        clearInterval(interval)
        const final = menus[Math.floor(Math.random() * menus.length)]
        setState(prev => ({
          ...prev,
          result: final,
          history: [final, ...prev.history].slice(0, 5),
        }))
        setAnimating(false)
      }
    }, 80)
  }, [selectedCategory])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHero
        title={t('title')}
        description={t('description')}
        icon={<UtensilsCrossed className="w-8 h-8" />}
      />
      <div className="max-w-xl mx-auto px-4 py-6 space-y-4">
        {/* 分类 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('selectCategory')}</label>
          <div className="flex flex-wrap gap-2">
            {['全部', ...Object.keys(MENU_CATEGORIES)].map(cat => (
              <button key={cat} onClick={() => set({ selectedCategory: cat })}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === cat
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}>{cat}</button>
            ))}
          </div>
        </div>

        {/* 随机按钮 */}
        <div className="flex justify-center">
          <button onClick={getRandomMenu} disabled={animating}
            className="px-12 py-6 bg-gradient-to-br from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 disabled:opacity-50 text-white rounded-2xl font-bold text-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:transform-none">
            <div className="flex items-center gap-3">
              <Sparkles className={`w-6 h-6 ${animating ? 'animate-spin' : ''}`} />
              {animating ? t('picking') : t('randomPick')}
              <Sparkles className={`w-6 h-6 ${animating ? 'animate-spin' : ''}`} />
            </div>
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
