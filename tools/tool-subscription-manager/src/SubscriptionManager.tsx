import React, { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { PageHero, DatePicker } from '@toolbox/ui-kit'
import { useToolStorage } from '@toolbox/storage'
import { Plus, Trash2, CreditCard, Calendar, Tag, RefreshCw, X } from 'lucide-react'

interface Subscription {
  id: string
  name: string
  price: number
  cycle: 'monthly' | 'yearly'
  category: string
  nextBill: string
  color: string
}

interface SubscriptionState {
  subscriptions: Subscription[]
  categories: string[]
}

const DEFAULT_CATEGORIES = [
  'streaming',
  'ai_tools',
  'dev_tools',
  'cloud_services',
  'office',
  'gaming',
  'others'
]

const COLORS = [
  'bg-red-500',
  'bg-blue-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-yellow-500',
  'bg-pink-500',
  'bg-indigo-500'
]

const SAMPLE_SUBSCRIPTIONS: Subscription[] = [
  { id: '1', name: 'Netflix', price: 68, cycle: 'monthly', category: 'streaming', nextBill: '2026-04-01', color: 'bg-red-500' },
  { id: '2', name: 'ChatGPT Plus', price: 140, cycle: 'monthly', category: 'ai_tools', nextBill: '2026-04-05', color: 'bg-green-500' },
  { id: '3', name: 'GitHub Copilot', price: 100, cycle: 'monthly', category: 'dev_tools', nextBill: '2026-04-10', color: 'bg-purple-500' },
  { id: '4', name: 'iCloud 200GB', price: 21, cycle: 'monthly', category: 'cloud_services', nextBill: '2026-04-15', color: 'bg-blue-500' },
]

const DEFAULT_STATE: SubscriptionState = {
  subscriptions: SAMPLE_SUBSCRIPTIONS,
  categories: DEFAULT_CATEGORIES
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

function formatCurrency(n: number): string {
  return `¥${n.toFixed(0)}`
}

export default function SubscriptionManager() {
  const { t } = useTranslation('toolSubscriptionManager')
  const { data: state, save } = useToolStorage<SubscriptionState>('subscription-manager', 'data', DEFAULT_STATE)

  const [form, setForm] = useState({
    name: '',
    price: '',
    cycle: 'monthly' as const,
    category: 'others',
    nextBill: '',
    color: COLORS[0]
  })
  const [filterCat, setFilterCat] = useState<string>('all')
  
  // 自定义分类相关状态
  const [newCategory, setNewCategory] = useState('')
  const [isAddingCategory, setIsAddingCategory] = useState(false)

  const { subscriptions, categories = DEFAULT_CATEGORIES } = state

  const monthlyTotal = useMemo(() => {
    return subscriptions.reduce((sum, s) => sum + (s.cycle === 'monthly' ? s.price : s.price / 12), 0)
  }, [subscriptions])

  const yearlyTotal = monthlyTotal * 12

  // 即将到期（7天内）
  const soonSubscriptions = useMemo(() => {
    return subscriptions.filter(s => {
      if (!s.nextBill) return false
      const diff = (new Date(s.nextBill).getTime() - Date.now()) / 86400000
      return diff >= 0 && diff <= 7
    })
  }, [subscriptions])

  // 按分类统计
  const categoryStats = useMemo(() => {
    const stats: Record<string, number> = {}
    subscriptions.forEach(s => {
      const monthly = s.cycle === 'monthly' ? s.price : s.price / 12
      stats[s.category] = (stats[s.category] || 0) + monthly
    })
    return stats
  }, [subscriptions])

  const filteredSubscriptions = filterCat === 'all' 
    ? subscriptions 
    : subscriptions.filter(s => s.category === filterCat)

  const addSubscription = () => {
    const price = parseFloat(form.price)
    if (!form.name.trim() || !price || !form.nextBill) return

    const newSub: Subscription = {
      id: generateId(),
      name: form.name.trim(),
      price,
      cycle: form.cycle,
      category: form.category,
      nextBill: form.nextBill,
      color: form.color
    }

    save({ ...state, subscriptions: [...subscriptions, newSub] })
    setForm({
      name: '',
      price: '',
      cycle: 'monthly',
      category: 'others',
      nextBill: '',
      color: COLORS[0]
    })
  }

  const removeSubscription = (id: string) => {
    save({ ...state, subscriptions: subscriptions.filter(s => s.id !== id) })
  }

  const renewSubscription = (id: string) => {
    const sub = subscriptions.find(s => s.id === id)
    if (!sub) return

    const nextDate = new Date(sub.nextBill)
    if (sub.cycle === 'monthly') {
      nextDate.setMonth(nextDate.getMonth() + 1)
    } else {
      nextDate.setFullYear(nextDate.getFullYear() + 1)
    }

    save({
      ...state,
      subscriptions: subscriptions.map(s =>
        s.id === id ? { ...s, nextBill: nextDate.toISOString().slice(0, 10) } : s
      )
    })
  }

  // 添加自定义分类
  const addCategory = () => {
    const trimmed = newCategory.trim()
    if (!trimmed || categories.includes(trimmed)) return
    
    save({ ...state, categories: [...categories, trimmed] })
    setNewCategory('')
    setIsAddingCategory(false)
  }

  // 删除自定义分类
  const removeCategory = (cat: string) => {
    if (DEFAULT_CATEGORIES.includes(cat)) return // 不能删除默认分类
    
    const newCategories = categories.filter(c => c !== cat)
    // 将该分类下的订阅移到 others
    const newSubscriptions = subscriptions.map(s => 
      s.category === cat ? { ...s, category: 'others' } : s
    )
    
    save({ categories: newCategories, subscriptions: newSubscriptions })
    
    if (filterCat === cat) {
      setFilterCat('all')
    }
  }

  // 获取分类显示名称
  const getCategoryName = (cat: string) => {
    if (DEFAULT_CATEGORIES.includes(cat)) {
      return t(`categories.${cat}`)
    }
    return cat
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHero
        title={t('title')}
        description={t('description')}
        icon={CreditCard}
      />
      
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-5 text-white">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 opacity-70" />
              <span className="text-sm opacity-80">{t('monthlyTotal')}</span>
            </div>
            <div className="text-3xl font-bold">{formatCurrency(monthlyTotal)}</div>
            <div className="text-xs opacity-70 mt-1">{t('subscriptionCount', { count: subscriptions.length })}</div>
          </div>
          <div className="bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl p-5 text-white">
            <div className="flex items-center gap-2 mb-1">
              <RefreshCw className="w-4 h-4 opacity-70" />
              <span className="text-sm opacity-80">{t('yearlyTotal')}</span>
            </div>
            <div className="text-3xl font-bold">{formatCurrency(yearlyTotal)}</div>
            <div className="text-xs opacity-70 mt-1">{t('yearlyEstimate')}</div>
          </div>
        </div>

        {/* 即将到期提醒 */}
        {soonSubscriptions.length > 0 && (
          <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-semibold text-yellow-700 dark:text-yellow-400">{t('expiringSoon')}</span>
            </div>
            <div className="space-y-2">
              {soonSubscriptions.map(s => (
                <div key={s.id} className="flex justify-between items-center text-sm">
                  <span className="text-yellow-800 dark:text-yellow-300">{s.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-yellow-600">{s.nextBill} · {formatCurrency(s.price)}</span>
                    <button
                      onClick={() => renewSubscription(s.id)}
                      className="px-2 py-1 text-xs bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 rounded hover:bg-yellow-300 transition-colors"
                    >
                      {t('renew')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 分类统计 */}
        {subscriptions.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Tag className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('categoryBreakdown')}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.filter(c => categoryStats[c]).map(cat => (
                <div key={cat} className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{getCategoryName(cat)}</span>
                  <span className="ml-2 font-medium text-indigo-500">{formatCurrency(categoryStats[cat])}/月</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 添加订阅表单 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">{t('addSubscription')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder={t('namePlaceholder')}
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-700">
              <span className="px-3 text-sm text-gray-400 bg-gray-50 dark:bg-gray-600 border-r border-gray-300 dark:border-gray-600">¥</span>
              <input
                type="number"
                value={form.price}
                onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                placeholder={t('pricePlaceholder')}
                className="flex-1 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 bg-transparent focus:outline-none"
              />
            </div>
            <select
              value={form.cycle}
              onChange={e => setForm(f => ({ ...f, cycle: e.target.value as any }))}
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="monthly">{t('monthly')}</option>
              <option value="yearly">{t('yearly')}</option>
            </select>
            <select
              value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {categories.map(c => (
                <option key={c} value={c}>{getCategoryName(c)}</option>
              ))}
            </select>
            <DatePicker
              value={form.nextBill}
              onChange={(date) => setForm(f => ({ ...f, nextBill: date }))}
              placeholder={t('nextBill')}
            />
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">{t('color')}:</span>
              {COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setForm(f => ({ ...f, color: c }))}
                  className={`w-6 h-6 rounded-full ${c} ${form.color === c ? 'ring-2 ring-offset-1 ring-indigo-500' : ''}`}
                />
              ))}
            </div>
          </div>
          <button
            onClick={addSubscription}
            disabled={!form.name || !form.price || !form.nextBill}
            className="mt-4 flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />{t('add')}
          </button>
        </div>

        {/* 分类筛选 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('filterByCategory')}</span>
            <button
              onClick={() => setIsAddingCategory(!isAddingCategory)}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              {isAddingCategory ? t('cancel') : t('addCategory')}
            </button>
          </div>
          
          {/* 添加新分类输入框 */}
          {isAddingCategory && (
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newCategory}
                onChange={e => setNewCategory(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCategory()}
                placeholder={t('newCategoryPlaceholder')}
                className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                autoFocus
              />
              <button
                onClick={addCategory}
                disabled={!newCategory.trim() || categories.includes(newCategory.trim())}
                className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
              >
                {t('confirm')}
              </button>
            </div>
          )}

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilterCat('all')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filterCat === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              {t('allCategories')}
            </button>
            {categories.map(c => (
              <div key={c} className="relative group">
                <button
                  onClick={() => setFilterCat(c)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    filterCat === c ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {getCategoryName(c)}
                </button>
                {/* 删除按钮 - 仅自定义分类显示 */}
                {!DEFAULT_CATEGORIES.includes(c) && (
                  <button
                    onClick={() => removeCategory(c)}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    title={t('deleteCategory')}
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 订阅列表 */}
        <div className="space-y-3">
          {filteredSubscriptions.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <CreditCard className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-400">{t('emptyHint')}</p>
            </div>
          ) : (
            filteredSubscriptions.map(s => (
              <div
                key={s.id}
                className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4"
              >
                <div className={`w-2 h-12 rounded-full ${s.color} shrink-0`} />
                <CreditCard className="w-5 h-5 text-gray-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{s.name}</div>
                  <div className="text-xs text-gray-500">
                    {getCategoryName(s.category)} · {s.cycle === 'monthly' ? t('monthly') : t('yearly')} · {t('nextBill')}: {s.nextBill}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-mono font-semibold text-indigo-500">{formatCurrency(s.price)}</div>
                  <div className="text-xs text-gray-400">
                    {s.cycle === 'yearly' ? `≈${formatCurrency(s.price / 12)}/${t('month')}` : `/${t('month')}`}
                  </div>
                </div>
                <button
                  onClick={() => renewSubscription(s.id)}
                  className="p-2 text-gray-400 hover:text-indigo-500 transition-colors"
                  title={t('renew')}
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => removeSubscription(s.id)}
                  className="p-2 text-gray-300 hover:text-red-400 transition-colors"
                  title={t('delete')}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
