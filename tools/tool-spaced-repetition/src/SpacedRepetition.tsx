import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, RotateCcw, Brain } from 'lucide-react'
import { PageHero, ProgressRing } from '@toolbox/ui-kit'
import { useToolStorage } from '@toolbox/storage'

interface Card {
  id: string
  front: string
  back: string
  interval: number   // days
  easeFactor: number // SM-2
  dueDate: string
  reviews: number
}

interface SRState { cards: Card[] }
const DEFAULT: SRState = {
  cards: [
    { id: '1', front: '什么是间隔重复？', back: '一种根据记忆曲线科学安排复习时间的学习方法', interval: 1, easeFactor: 2.5, dueDate: new Date().toISOString().slice(0,10), reviews: 0 },
    { id: '2', front: 'React 中 useEffect 的作用？', back: '在函数组件中执行副作用（数据获取、订阅、DOM操作等）', interval: 1, easeFactor: 2.5, dueDate: new Date().toISOString().slice(0,10), reviews: 0 },
  ]
}

function today() { return new Date().toISOString().slice(0, 10) }

// SM-2 算法
function sm2(card: Card, quality: 0 | 1 | 2 | 3): Card {
  const q = quality  // 0=again,1=hard,2=good,3=easy
  let ef = card.easeFactor + (0.1 - (3 - q) * (0.08 + (3 - q) * 0.02))
  ef = Math.max(1.3, ef)
  let interval: number
  if (q === 0) {
    interval = 1
  } else if (card.reviews === 0) {
    interval = 1
  } else if (card.reviews === 1) {
    interval = 6
  } else {
    interval = Math.round(card.interval * ef)
  }
  const due = new Date()
  due.setDate(due.getDate() + interval)
  return { ...card, interval, easeFactor: ef, dueDate: due.toISOString().slice(0,10), reviews: card.reviews + 1 }
}

export default function SpacedRepetition() {
  const { t } = useTranslation('toolSpacedRepetition')
  const { data: state, save } = useToolStorage<SRState>('spaced-repetition', 'data', DEFAULT)
  const [flipped, setFlipped] = useState(false)
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ front: '', back: '' })
  const [mode, setMode] = useState<'review' | 'list'>('review')

  const { cards } = state
  const set = (c: Card[]) => save({ cards: c })

  const dueCards = cards.filter(c => c.dueDate <= today())
  const current = dueCards[0]

  const rate = (quality: 0 | 1 | 2 | 3) => {
    if (!current) return
    const updated = sm2(current, quality)
    set(cards.map(c => c.id === current.id ? updated : c))
    setFlipped(false)
  }

  const addCard = () => {
    if (!form.front.trim() || !form.back.trim()) return
    set([...cards, { id: Date.now().toString(), ...form, interval: 1, easeFactor: 2.5, dueDate: today(), reviews: 0 }])
    setForm({ front: '', back: '' })
    setAdding(false)
  }

  const removeCard = (id: string) => set(cards.filter(c => c.id !== id))

  const masteredCount = cards.filter(c => c.reviews >= 3 && c.interval >= 7).length
  const pct = cards.length ? Math.round(masteredCount / cards.length * 100) : 0

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHero title={t('title')} description={t('description')} icon={Brain} />
      <div className="max-w-xl mx-auto px-4 py-6 space-y-4">

        {/* 统计 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-4">
          <ProgressRing value={pct} size={60} label={`${pct}%`} />
          <div className="flex-1">
            <div className="text-sm text-gray-500">总卡片 <span className="font-bold text-gray-900 dark:text-gray-100">{cards.length}</span> · 今日待复习 <span className="font-bold text-amber-500">{dueCards.length}</span> · 已掌握 <span className="font-bold text-green-500">{masteredCount}</span></div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setMode(m => m === 'review' ? 'list' : 'review')}
              className="px-3 py-1.5 text-xs border border-gray-200 dark:border-gray-600 rounded-lg text-gray-500 hover:border-indigo-400">
              {mode === 'review' ? '卡片库' : '复习'}
            </button>
          </div>
        </div>

        {/* 添加 */}
        <button onClick={() => setAdding(v => !v)}
          className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-sm text-gray-400 hover:border-indigo-400 hover:text-indigo-500 transition-colors">
          <Plus className="w-4 h-4" />{t('addCard')}
        </button>

        {adding && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
            <input value={form.front} onChange={e => setForm(f => ({ ...f, front: e.target.value }))}
              placeholder={t('front')}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
            <textarea value={form.back} onChange={e => setForm(f => ({ ...f, back: e.target.value }))}
              placeholder={t('back')} rows={3}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500" />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setAdding(false)} className="px-4 py-2 text-sm text-gray-500">取消</button>
              <button onClick={addCard} className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg">{t('addCard')}</button>
            </div>
          </div>
        )}

        {/* 复习模式 */}
        {mode === 'review' && (
          <>
            {dueCards.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="text-4xl">🎉</div>
                <div className="text-lg font-semibold text-gray-700 dark:text-gray-300">{t('finished')}</div>
                <div className="text-sm text-gray-400">下一批复习：{cards.length > 0 ? cards.reduce((min, c) => c.dueDate < min ? c.dueDate : min, '9999') : '-'}</div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-xs text-center text-gray-400">{dueCards.length} 张待复习</div>
                <div onClick={() => setFlipped(f => !f)}
                  className="cursor-pointer bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 p-8 text-center min-h-[200px] flex flex-col items-center justify-center gap-3 hover:border-indigo-300 transition-all shadow-sm">
                  {!flipped ? (
                    <>
                      <div className="text-xl font-bold text-gray-900 dark:text-gray-100">{current.front}</div>
                      <div className="text-xs text-gray-400">点击查看答案</div>
                    </>
                  ) : (
                    <>
                      <div className="text-sm text-gray-400 mb-2">{current.front}</div>
                      <div className="text-lg font-medium text-indigo-600 dark:text-indigo-400">{current.back}</div>
                    </>
                  )}
                </div>
                {flipped && (
                  <div className="grid grid-cols-4 gap-2">
                    {([0,1,2,3] as const).map((q, i) => {
                      const labels = [t('again'), t('hard'), t('good'), t('easy')]
                      const colors = [
                        'bg-red-100 dark:bg-red-900/30 text-red-600 hover:bg-red-200',
                        'bg-orange-100 dark:bg-orange-900/30 text-orange-600 hover:bg-orange-200',
                        'bg-blue-100 dark:bg-blue-900/30 text-blue-600 hover:bg-blue-200',
                        'bg-green-100 dark:bg-green-900/30 text-green-600 hover:bg-green-200',
                      ]
                      return (
                        <button key={q} onClick={() => rate(q)}
                          className={`py-3 rounded-xl text-sm font-medium transition-colors ${colors[i]}`}>
                          {labels[i]}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* 列表模式 */}
        {mode === 'list' && (
          <div className="space-y-2">
            {cards.length === 0 && <div className="text-center py-12 text-gray-400 text-sm">{t('empty')}</div>}
            {cards.map(c => (
              <div key={c.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-800 dark:text-gray-200">{c.front}</div>
                  <div className="text-xs text-gray-400 mt-0.5 truncate">{c.back}</div>
                  <div className="text-xs text-gray-400 mt-1">下次复习: {c.dueDate} · 间隔: {c.interval}天 · 复习{c.reviews}次</div>
                </div>
                <button onClick={() => removeCard(c.id)} className="text-gray-300 hover:text-red-400 shrink-0">
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
        <p className="text-xs text-center text-gray-400">{t('autoSave')}</p>
      </div>
    </div>
  )
}
