import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Trash2, ChevronDown, ChevronRight, BookMarked, CheckSquare, Check, X } from 'lucide-react'
import { PageHero, TagInput, StatusBadge } from '@toolbox/ui-kit'
import { useToolStorage } from '@toolbox/storage'

interface Mistake {
  id: string
  question: string
  answer: string
  analysis: string
  tags: string[]
  mastered: boolean
  createdAt: string
}

interface MistakeState { items: Mistake[] }
const DEFAULT: MistakeState = { items: [] }

export default function MistakeBook() {
  const { t } = useTranslation('toolMistakeBook')
  const { data: state, save } = useToolStorage<MistakeState>('mistake-book', 'data', DEFAULT)
  const [filter, setFilter] = useState<'all' | 'mastered' | 'unmastered'>('all')
  const [tagFilter, setTagFilter] = useState('')
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ question: '', answer: '', analysis: '', tags: [] as string[] })
  const [batchMode, setBatchMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const { items } = state
  const set = (i: Mistake[]) => save({ items: i })

  const filtered = items.filter(m => {
    if (filter === 'mastered' && !m.mastered) return false
    if (filter === 'unmastered' && m.mastered) return false
    if (tagFilter && !m.tags.includes(tagFilter)) return false
    return true
  })

  const allTags = Array.from(new Set(items.flatMap(m => m.tags)))
  const masteredCount = items.filter(m => m.mastered).length

  const submit = () => {
    if (!form.question.trim()) return
    set([{ id: Date.now().toString(), ...form, mastered: false, createdAt: new Date().toLocaleDateString('zh-CN') }, ...items])
    setForm({ question: '', answer: '', analysis: '', tags: [] })
    setAdding(false)
  }

  const toggleMastered = (id: string) => set(items.map(m => m.id === id ? { ...m, mastered: !m.mastered } : m))
  const remove = (id: string) => set(items.filter(m => m.id !== id))
  const toggleExpand = (id: string) => setExpanded(e => ({ ...e, [id]: !e[id] }))

  // 批量操作函数
  const toggleBatchMode = () => {
    setBatchMode(!batchMode)
    setSelectedIds(new Set())
  }

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const selectAll = () => {
    setSelectedIds(new Set(filtered.map(m => m.id)))
  }

  const deselectAll = () => {
    setSelectedIds(new Set())
  }

  const batchMaster = () => {
    set(items.map(m => selectedIds.has(m.id) ? { ...m, mastered: true } : m))
    setSelectedIds(new Set())
  }

  const batchUnmaster = () => {
    set(items.map(m => selectedIds.has(m.id) ? { ...m, mastered: false } : m))
    setSelectedIds(new Set())
  }

  const batchDelete = () => {
    if (confirm(`确定要删除选中的 ${selectedIds.size} 道题吗？`)) {
      set(items.filter(m => !selectedIds.has(m.id)))
      setSelectedIds(new Set())
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHero title={t('title')} description={t('description')} icon={BookMarked} />
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">

        {/* 统计 + 筛选 */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-500">共 {items.length} 题 · 已掌握 <span className="text-green-500 font-medium">{masteredCount}</span></span>
          <button onClick={toggleBatchMode} title="批量操作"
            className={`ml-2 p-1.5 rounded-lg transition-colors ${
              batchMode 
                ? 'bg-indigo-600 text-white' 
                : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
            }`}>
            <CheckSquare className="w-4 h-4" />
          </button>
          <div className="ml-auto flex gap-2 flex-wrap">
            {(['all','unmastered','mastered'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filter === f ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                }`}>{t(f)}</button>
            ))}
          </div>
        </div>

        {/* 标签筛选 */}
        {allTags.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setTagFilter('')}
              className={`px-2.5 py-1 rounded-lg text-xs transition-colors ${
                !tagFilter ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-500'
              }`}>全部分类</button>
            {allTags.map(tag => (
              <button key={tag} onClick={() => setTagFilter(tag === tagFilter ? '' : tag)}
                className={`px-2.5 py-1 rounded-lg text-xs transition-colors ${
                  tagFilter === tag ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-500'
                }`}>{tag}</button>
            ))}
          </div>
        )}

        {/* 批量操作工具栏 */}
        {batchMode && (
          <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">
                  已选择 {selectedIds.size} 题
                </span>
                <button onClick={selectAll} className="text-xs text-indigo-600 hover:text-indigo-700 underline">
                  全选
                </button>
                <button onClick={deselectAll} className="text-xs text-indigo-600 hover:text-indigo-700 underline">
                  取消
                </button>
              </div>
              <div className="flex gap-2">
                <button onClick={batchMaster} disabled={selectedIds.size === 0}
                  className="px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  标记掌握
                </button>
                <button onClick={batchUnmaster} disabled={selectedIds.size === 0}
                  className="px-3 py-1.5 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1">
                  <X className="w-3.5 h-3.5" />
                  取消掌握
                </button>
                <button onClick={batchDelete} disabled={selectedIds.size === 0}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1">
                  <Trash2 className="w-3.5 h-3.5" />
                  删除
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 添加按钮 */}
        <button onClick={() => setAdding(v => !v)}
          className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-sm text-gray-400 hover:border-indigo-400 hover:text-indigo-500 transition-colors">
          <Plus className="w-4 h-4" />{t('add')}
        </button>

        {/* 添加表单 */}
        {adding && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
            <textarea value={form.question} onChange={e => setForm(f => ({ ...f, question: e.target.value }))}
              placeholder={t('questionPlaceholder')} rows={3}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500" />
            <input value={form.answer} onChange={e => setForm(f => ({ ...f, answer: e.target.value }))}
              placeholder={t('answerPlaceholder')}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
            <textarea value={form.analysis} onChange={e => setForm(f => ({ ...f, analysis: e.target.value }))}
              placeholder={t('analysisPlaceholder')} rows={2}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500" />
            <TagInput tags={form.tags} onChange={tags => setForm(f => ({ ...f, tags }))} placeholder="添加分类标签..." />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setAdding(false)} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">取消</button>
              <button onClick={submit} className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg">{t('submit')}</button>
            </div>
          </div>
        )}

        {/* 列表 */}
        {filtered.length === 0 && <div className="text-center py-12 text-gray-400 text-sm">{t('empty')}</div>}
        <div className="space-y-2">
          {filtered.map(m => (
            <div key={m.id} className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden ${
              batchMode && selectedIds.has(m.id) ? 'ring-2 ring-indigo-500' : ''
            }`}>
              <div className="flex items-start gap-3 p-3">
                {batchMode && (
                  <input
                    type="checkbox"
                    checked={selectedIds.has(m.id)}
                    onChange={() => toggleSelect(m.id)}
                    className="mt-1 w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                )}
                <button onClick={() => !batchMode && toggleExpand(m.id)} className="mt-0.5 text-gray-400" disabled={batchMode}>
                  {expanded[m.id] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-800 dark:text-gray-200 line-clamp-2">{m.question}</div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <StatusBadge level={m.mastered ? 'success' : 'warning'} label={t(m.mastered ? 'mastered' : 'unmastered')} />
                    {m.tags.map(tag => <span key={tag} className="text-xs text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded">{tag}</span>)}
                    <span className="text-xs text-gray-400 ml-auto">{m.createdAt}</span>
                  </div>
                </div>
                {!batchMode && (
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => toggleMastered(m.id)}
                      className={`px-2 py-1 text-xs rounded-lg transition-colors ${
                        m.mastered ? 'bg-green-100 text-green-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'
                      }`}>{m.mastered ? '已掌握' : '标记掌握'}</button>
                    <button onClick={() => remove(m.id)} className="text-gray-300 hover:text-red-400 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                )}
              </div>
              {expanded[m.id] && (
                <div className="px-4 pb-4 space-y-2 border-t border-gray-100 dark:border-gray-700 pt-3">
                  <div><span className="text-xs font-medium text-green-600">正确答案：</span><span className="text-sm text-gray-700 dark:text-gray-300">{m.answer}</span></div>
                  {m.analysis && <div><span className="text-xs font-medium text-amber-600">解析：</span><span className="text-sm text-gray-600 dark:text-gray-400">{m.analysis}</span></div>}
                </div>
              )}
            </div>
          ))}
        </div>
        <p className="text-xs text-center text-gray-400">{t('autoSave')}</p>
      </div>
    </div>
  )
}
