import React, { useState, useMemo } from 'react'
import { Search, ChefHat, Clock, Users } from 'lucide-react'

interface Recipe {
  id: string
  name: string
  ingredients: string[]
  time: number // minutes
  servings: number
  difficulty: '简单' | '中等' | '复杂'
  steps: string[]
  tags: string[]
}

const RECIPES: Recipe[] = [
  {
    id: '1', name: '番茄炒蛋', ingredients: ['番茄', '鸡蛋', '葱', '盐', '糖', '油'],
    time: 15, servings: 2, difficulty: '简单',
    steps: ['鸡蛋打散加盐', '热锅冷油炒蛋盛出', '番茄切块下锅翻炒', '加入鸡蛋，调味出锅'],
    tags: ['家常', '快手', '下饭'],
  },
  {
    id: '2', name: '蒜蓉西兰花', ingredients: ['西兰花', '大蒜', '盐', '油', '生抽'],
    time: 10, servings: 2, difficulty: '简单',
    steps: ['西兰花切小朵焯水', '蒜末爆香', '西兰花下锅翻炒', '加盐生抽调味'],
    tags: ['健康', '素食', '快手'],
  },
  {
    id: '3', name: '红烧肉', ingredients: ['五花肉', '生姜', '大葱', '老抽', '生抽', '冰糖', '料酒'],
    time: 90, servings: 4, difficulty: '中等',
    steps: ['五花肉切块焯水', '热锅炒糖色', '下肉块翻炒上色', '加调料和水焖煮1小时'],
    tags: ['下饭', '家常', '荤菜'],
  },
  {
    id: '4', name: '蛋炒饭', ingredients: ['米饭', '鸡蛋', '葱', '盐', '油', '生抽'],
    time: 10, servings: 1, difficulty: '简单',
    steps: ['鸡蛋打散', '热锅下油炒蛋', '加入冷米饭翻炒', '加葱花生抽调味'],
    tags: ['快手', '主食', '简单'],
  },
  {
    id: '5', name: '宫保鸡丁', ingredients: ['鸡胸肉', '花生', '干辣椒', '葱', '姜', '蒜', '生抽', '醋', '糖', '淀粉'],
    time: 25, servings: 2, difficulty: '中等',
    steps: ['鸡肉切丁腌制', '花生炒熟备用', '爆香辣椒姜蒜', '下鸡丁翻炒，加调味汁，放花生'],
    tags: ['辣', '下饭', '经典'],
  },
  {
    id: '6', name: '皮蛋豆腐', ingredients: ['皮蛋', '豆腐', '葱', '生抽', '香油', '小米辣'],
    time: 5, servings: 2, difficulty: '简单',
    steps: ['豆腐切块摆盘', '皮蛋切块放上', '淋上生抽香油', '撒葱花小米辣'],
    tags: ['凉菜', '快手', '夏天'],
  },
  {
    id: '7', name: '麻婆豆腐', ingredients: ['豆腐', '猪肉末', '豆瓣酱', '花椒', '姜', '蒜', '生抽', '淀粉'],
    time: 20, servings: 2, difficulty: '中等',
    steps: ['豆腐切块焯水', '肉末炒散', '下豆瓣酱炒香', '加豆腐炖煮，勾芡撒花椒'],
    tags: ['辣', '下饭', '经典'],
  },
  {
    id: '8', name: '清蒸鱼', ingredients: ['鱼', '姜', '葱', '生抽', '蒸鱼豉油', '油'],
    time: 20, servings: 3, difficulty: '简单',
    steps: ['鱼处理干净划刀', '铺姜丝上锅蒸10分钟', '铺葱丝淋蒸鱼豉油', '热油泼上即可'],
    tags: ['清淡', '健康', '鱼类'],
  },
  {
    id: '9', name: '土豆炖鸡', ingredients: ['鸡肉', '土豆', '胡萝卜', '葱', '姜', '生抽', '老抽', '盐'],
    time: 45, servings: 4, difficulty: '简单',
    steps: ['鸡肉焯水', '土豆胡萝卜切块', '炒香姜葱下鸡肉', '加土豆胡萝卜和调料炖煮'],
    tags: ['炖菜', '家常', '暖胃'],
  },
  {
    id: '10', name: '黄瓜拌花生', ingredients: ['黄瓜', '花生', '大蒜', '醋', '生抽', '香油', '盐'],
    time: 10, servings: 2, difficulty: '简单',
    steps: ['黄瓜切段拍扁', '花生炸熟', '大蒜切末', '所有材料混合调味'],
    tags: ['凉菜', '素食', '快手'],
  },
]

const DIFF_COLOR: Record<string, string> = {
  简单: 'bg-green-100 dark:bg-green-900/30 text-green-600',
  中等: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600',
  复杂: 'bg-red-100 dark:bg-red-900/30 text-red-600',
}

export function RecipeFinder() {
  const [input, setInput] = useState('')
  const [selected, setSelected] = useState<Recipe | null>(null)

  const ingredients = useMemo(() =>
    input.split(/[,，、\s]+/).map(s => s.trim()).filter(Boolean),
    [input]
  )

  const results = useMemo(() => {
    if (ingredients.length === 0) return RECIPES
    return RECIPES
      .map(r => {
        const matched = ingredients.filter(ing => r.ingredients.some(ri => ri.includes(ing) || ing.includes(ri)))
        return { recipe: r, score: matched.length, matched }
      })
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(r => r.recipe)
  }, [ingredients])

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">菜谱推荐</h1>
      <p className="text-gray-500 dark:text-gray-400">输入你有的食材，推荐可以做的菜</p>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-gray-400" />
          <input value={input} onChange={e => setInput(e.target.value)}
            placeholder="输入食材，用逗号分隔，如：鸡蛋,番茄,葱"
            className="flex-1 text-sm text-gray-900 dark:text-gray-100 bg-transparent focus:outline-none" />
        </div>
      </div>

      {ingredients.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {ingredients.map(ing => (
            <span key={ing} className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded text-xs">{ing}</span>
          ))}
        </div>
      )}

      <div className="text-sm text-gray-500">找到 {results.length} 道菜</div>

      <div className="grid gap-3">
        {results.map(recipe => (
          <div key={recipe.id}
            onClick={() => setSelected(selected?.id === recipe.id ? null : recipe)}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 cursor-pointer hover:border-indigo-300 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <ChefHat className="w-4 h-4 text-orange-400" />
                <span className="font-semibold text-gray-900 dark:text-gray-100">{recipe.name}</span>
              </div>
              <span className={`px-1.5 py-0.5 rounded text-xs ${DIFF_COLOR[recipe.difficulty]}`}>{recipe.difficulty}</span>
            </div>
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{recipe.time}分钟</span>
              <span className="flex items-center gap-1"><Users className="w-3 h-3" />{recipe.servings}人份</span>
              {recipe.tags.map(t => <span key={t} className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">{t}</span>)}
            </div>
            {selected?.id === recipe.id && (
              <div className="mt-4 space-y-3">
                <div>
                  <div className="text-xs font-semibold text-gray-500 mb-1.5">所需食材</div>
                  <div className="flex flex-wrap gap-1.5">
                    {recipe.ingredients.map(ing => (
                      <span key={ing} className={`px-2 py-0.5 rounded text-xs ${
                        ingredients.some(i => ing.includes(i) || i.includes(ing))
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-600'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-500'
                      }`}>{ing}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-500 mb-1.5">烹饪步骤</div>
                  <ol className="space-y-1">
                    {recipe.steps.map((step, i) => (
                      <li key={i} className="flex gap-2 text-sm">
                        <span className="w-5 h-5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-full text-xs flex items-center justify-center shrink-0">{i+1}</span>
                        <span className="text-gray-600 dark:text-gray-400">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
