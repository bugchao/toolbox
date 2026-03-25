import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, RotateCcw, BookOpen } from 'lucide-react'
import { PageHero, ProgressRing } from '@toolbox/ui-kit'
import { useToolStorage } from '@toolbox/storage'

interface Word {
  id: string
  word: string
  meaning: string
  mastered: boolean
}

interface VocabState {
  words: Word[]
}

const DEFAULT: VocabState = { words: [
  { id: '1', word: 'Serendipity', meaning: '意外发现美好事物的运气', mastered: false },
  { id: '2', word: 'Ephemeral', meaning: '短暂的；瞬息的', mastered: false },
  { id: '3', word: 'Melancholy', meaning: '忧郁；沉思的悲伤', mastered: true },
]}

export default function VocabTrainer() {
  const { t } = useTranslation('toolVocabTrainer')
  const { data: state, save } = useToolStorage<VocabState>('vocab-trainer', 'data', DEFAULT)
  const [newWord, setNewWord] = useState('')
  const [newMeaning, setNewMeaning] = useState('')
  const [filter, setFilter] = useState<'all' | 'learning' | 'mastered'>('all')
  const [flipped, setFlipped] = useState<Record<string, boolean>>({})
  const [current, setCurrent] = useState(0)
  const [mode, setMode] = useState<'list' | 'card'>('card')

  const { words } = state
  const set = (w: Word[]) => save({ words: w })

  const filtered = words.filter(w =>
    filter === 'all' ? true : filter === 'mastered' ? w.mastered : !w.mastered
  )
  const masteredCount = words.filter(w => w.mastered).length
  const pct = words.length ? Math.round(masteredCount / words.length * 100) : 0

  const addWord = () => {
    if (!newWord.trim() || !newMeaning.trim()) return
    set([...words, { id: Date.now().toString(), word: newWord.trim(), meaning: newMeaning.trim(), mastered: false }])
    setNewWord('')
    setNewMeaning('')
  }

  const toggleMastered = (id: string) => set(words.map(w => w.id === id ? { ...w, mastered: !w.mastered } : w))
  const removeWord = (id: string) => set(words.filter(w => w.id !== id))
  const resetAll = () => set(words.map(w => ({ ...w, mastered: false })))
  const toggleFlip = (id: string) => setFlipped(f => ({ ...f, [id]: !f[id] }))

  const cardWord = filtered[current]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHero title={t('title')} description={t('description')} icon={BookOpen} />
      <div className="max-w-xl mx-auto px-4 py-6 space-y-4">

        {/* 进度 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-4">
          <ProgressRing value={pct} size={64} label={`${pct}%`} />
          <div>
            <div className="text-sm text-gray-500">{t('masteredCount')} <span className="font-bold text-green-500">{masteredCount}</span> / {t('totalCount')} <span className="font-bold">{words.length}</span></div>
            <div className="mt-1 flex gap-2">
              {(['all','learning','mastered'] as const).map(f => (
                <button key={f} onClick={() => { setFilter(f); setCurrent(0) }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    filter === f ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}>{t(f)}</button>
              ))}
            </div>
          </div>
          <div className="ml-auto flex gap-2">
            <button onClick={() => setMode(m => m === 'card' ? 'list' : 'card')}
              className="px-3 py-1.5 text-xs border border-gray-200 dark:border-gray-600 rounded-lg text-gray-500 hover:border-indigo-400">
              {mode === 'card' ? '列表' : '卡片'}
            </button>
            <button onClick={resetAll} className="text-gray-400 hover:text-gray-600"><RotateCcw className="w-4 h-4" /></button>
          </div>
        </div>

        {/* 添加单词 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-2">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('addWord')}</h2>
          <div className="flex gap-2">
            <input value={newWord} onChange={e => setNewWord(e.target.value)} placeholder={t('wordPlaceholder')}
              className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
            <input value={newMeaning} onChange={e => setNewMeaning(e.target.value)} placeholder={t('meaningPlaceholder')}
              onKeyDown={e => e.key === 'Enter' && addWord()}
              className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
            <button onClick={addWord} className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"><Plus className="w-4 h-4" /></button>
          </div>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">{t('empty')}</div>
        )}

        {/* 卡片模式 */}
        {mode === 'card' && cardWord && (
          <div className="space-y-3">
            <div className="text-xs text-center text-gray-400">{current + 1} / {filtered.length}</div>
            <div onClick={() => toggleFlip(cardWord.id)}
              className="cursor-pointer bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 p-8 text-center min-h-[180px] flex flex-col items-center justify-center gap-3 hover:border-indigo-300 transition-all shadow-sm">
              {!flipped[cardWord.id] ? (
                <>
                  <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{cardWord.word}</div>
                  <div className="text-xs text-gray-400">{t('clickToFlip')}</div>
                </>
              ) : (
                <>
                  <div className="text-lg font-medium text-indigo-600 dark:text-indigo-400">{cardWord.meaning}</div>
                  <div className="text-sm text-gray-500">{cardWord.word}</div>
                </>
              )}
              {cardWord.mastered && <span className="absolute top-3 right-3 text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">✓</span>}
            </div>
            <div className="flex gap-3">
              <button onClick={() => { toggleMastered(cardWord.id); setCurrent(c => Math.min(c + 1, filtered.length - 1)) }}
                className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
                  cardWord.mastered ? 'bg-green-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-green-50'
                }`}>{t('know')}</button>
              <button onClick={() => setCurrent(c => Math.min(c + 1, filtered.length - 1))}
                className="flex-1 py-3 rounded-xl font-medium bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 transition-colors">{t('dontKnow')}</button>
            </div>
            <div className="flex justify-between">
              <button onClick={() => setCurrent(c => Math.max(c - 1, 0))} disabled={current === 0}
                className="px-4 py-2 text-sm text-gray-400 disabled:opacity-30">← 上一个</button>
              <button onClick={() => setCurrent(c => Math.min(c + 1, filtered.length - 1))} disabled={current === filtered.length - 1}
                className="px-4 py-2 text-sm text-gray-400 disabled:opacity-30">下一个 →</button>
            </div>
          </div>
        )}

        {/* 列表模式 */}
        {mode === 'list' && (
          <div className="space-y-2">
            {filtered.map(w => (
              <div key={w.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                w.mastered ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
              }`}>
                <button onClick={() => toggleMastered(w.id)}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                    w.mastered ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300'
                  }`}>{w.mastered && '✓'}</button>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">{w.word}</div>
                  <div className="text-xs text-gray-500 truncate">{w.meaning}</div>
                </div>
                <button onClick={() => removeWord(w.id)} className="text-gray-300 hover:text-red-400 text-xs">✕</button>
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-center text-gray-400">{t('autoSave')}</p>
      </div>
    </div>
  )
}
