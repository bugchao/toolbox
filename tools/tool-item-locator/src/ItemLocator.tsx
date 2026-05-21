import React, { useCallback, useMemo, useState } from 'react'
import {
  Boxes,
  Search,
  Plus,
  Trash2,
  Pencil,
  MapPin,
  X,
  Tag,
  Download,
  Upload,
} from 'lucide-react'
import { PageHero } from '@toolbox/ui-kit'
import { useToolStorage } from '@toolbox/storage'
import { useTranslation } from 'react-i18next'

import {
  CATEGORIES,
  CATEGORY_BY_ID,
  SCENARIOS,
  SCENARIO_BY_ID,
  type CategoryId,
  type ScenarioId,
} from './presets'

const NAMESPACE = 'toolItemLocator'

interface Item {
  id: string
  name: string
  location: string
  category: CategoryId
  scenario: ScenarioId
  tags: string[]
  note?: string
  createdAt: number
  updatedAt: number
}

interface PersistedState {
  items: Item[]
}

const DEFAULT_STATE: PersistedState = { items: [] }

interface DraftItem {
  id: string | null
  name: string
  location: string
  category: CategoryId
  scenario: ScenarioId
  tagsInput: string
  note: string
}

const EMPTY_DRAFT: DraftItem = {
  id: null,
  name: '',
  location: '',
  category: 'other',
  scenario: 'homeStorage',
  tagsInput: '',
  note: '',
}

const ItemLocator: React.FC = () => {
  const { t, i18n } = useTranslation(NAMESPACE)
  const isZh = (i18n.resolvedLanguage || i18n.language || 'zh').startsWith('zh')

  const { data, save, loading } = useToolStorage<PersistedState>(
    'item-locator',
    'state',
    DEFAULT_STATE,
  )

  // ── 搜索与筛选 ──
  const [query, setQuery] = useState('')
  const [catFilter, setCatFilter] = useState<CategoryId | 'all'>('all')
  const [scenFilter, setScenFilter] = useState<ScenarioId | 'all'>('all')

  // ── 表单 ──
  const [draft, setDraft] = useState<DraftItem>(EMPTY_DRAFT)
  const [formOpen, setFormOpen] = useState(false)

  const isEditing = draft.id !== null

  const openAdd = () => {
    setDraft(EMPTY_DRAFT)
    setFormOpen(true)
  }
  const openEdit = (item: Item) => {
    setDraft({
      id: item.id,
      name: item.name,
      location: item.location,
      category: item.category,
      scenario: item.scenario,
      tagsInput: item.tags.join(', '),
      note: item.note ?? '',
    })
    setFormOpen(true)
  }
  const closeForm = () => {
    setFormOpen(false)
    setDraft(EMPTY_DRAFT)
  }

  const saveDraft = useCallback(() => {
    const name = draft.name.trim()
    const location = draft.location.trim()
    if (!name || !location) return
    const tags = draft.tagsInput
      .split(/[,，\s]+/)
      .map((s) => s.trim())
      .filter(Boolean)
    const now = Date.now()
    if (draft.id) {
      // 编辑
      const next = data.items.map((it) =>
        it.id === draft.id
          ? {
              ...it,
              name,
              location,
              category: draft.category,
              scenario: draft.scenario,
              tags,
              note: draft.note.trim() || undefined,
              updatedAt: now,
            }
          : it,
      )
      void save({ ...data, items: next })
    } else {
      // 新增
      const item: Item = {
        id: `i-${now}-${Math.random().toString(36).slice(2, 8)}`,
        name,
        location,
        category: draft.category,
        scenario: draft.scenario,
        tags,
        note: draft.note.trim() || undefined,
        createdAt: now,
        updatedAt: now,
      }
      void save({ ...data, items: [item, ...data.items] })
    }
    closeForm()
  }, [draft, data, save])

  const removeItem = (id: string) => {
    if (!window.confirm(t('confirmDelete'))) return
    void save({ ...data, items: data.items.filter((it) => it.id !== id) })
  }

  // ── 筛选 + 搜索 ──
  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase()
    return data.items
      .filter((it) => catFilter === 'all' || it.category === catFilter)
      .filter((it) => scenFilter === 'all' || it.scenario === scenFilter)
      .filter((it) => {
        if (!q) return true
        return (
          it.name.toLowerCase().includes(q) ||
          it.location.toLowerCase().includes(q) ||
          (it.note?.toLowerCase().includes(q) ?? false) ||
          it.tags.some((tag) => tag.toLowerCase().includes(q))
        )
      })
      .sort((a, b) => b.updatedAt - a.updatedAt)
  }, [data.items, catFilter, scenFilter, query])

  // ── 各分类下的物品计数（用于侧栏 badge） ──
  const catCounts = useMemo(() => {
    const m: Partial<Record<CategoryId, number>> = {}
    for (const it of data.items) m[it.category] = (m[it.category] ?? 0) + 1
    return m
  }, [data.items])
  const scenCounts = useMemo(() => {
    const m: Partial<Record<ScenarioId, number>> = {}
    for (const it of data.items) m[it.scenario] = (m[it.scenario] ?? 0) + 1
    return m
  }, [data.items])

  // ── 导入 / 导出 ──
  const exportJson = () => {
    const blob = new Blob([JSON.stringify(data.items, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `item-locator-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }
  const importJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as Item[]
        if (!Array.isArray(parsed)) throw new Error('Not an array')
        // 简易校验
        const ok = parsed.every(
          (x) =>
            typeof x?.id === 'string' &&
            typeof x?.name === 'string' &&
            typeof x?.location === 'string',
        )
        if (!ok) throw new Error('Schema mismatch')
        if (!window.confirm(t('confirmImport', { count: parsed.length }))) return
        void save({ ...data, items: parsed })
      } catch (err) {
        window.alert(t('importError') + ': ' + (err as Error).message)
      } finally {
        e.target.value = ''
      }
    }
    reader.readAsText(file)
  }

  if (loading) {
    return (
      <div className="w-full space-y-6">
        <PageHero title={t('title')} description={t('description')} />
        <div className="text-center text-sm text-gray-400 py-12">{t('loading')}</div>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6 pb-24">
      <PageHero title={t('title')} description={t('description')} />

      {/* 搜索 + 操作 */}
      <section className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('search.placeholder')}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            type="button"
            onClick={openAdd}
            className="px-3 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            {t('action.add')}
          </button>
          <button
            type="button"
            onClick={exportJson}
            disabled={data.items.length === 0}
            className="px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 transition-colors flex items-center gap-1.5"
            title={t('action.exportTitle')}
          >
            <Download className="w-4 h-4" />
          </button>
          <label className="px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center gap-1.5 cursor-pointer">
            <Upload className="w-4 h-4" />
            <input type="file" accept="application/json" onChange={importJson} className="hidden" />
          </label>
        </div>

        {/* 筛选器 */}
        <div className="flex flex-wrap gap-2 items-center text-xs">
          <span className="text-gray-500">{t('filter.category')}:</span>
          <button
            type="button"
            onClick={() => setCatFilter('all')}
            className={`px-2 py-0.5 rounded-full border ${
              catFilter === 'all'
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
            }`}
          >
            {t('filter.all')}
          </button>
          {CATEGORIES.map((c) => {
            const n = catCounts[c.id] ?? 0
            if (n === 0 && catFilter !== c.id) return null
            const active = catFilter === c.id
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setCatFilter(c.id)}
                className={`px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                  active
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                }`}
              >
                <span>{c.emoji}</span>
                {isZh ? c.zh : c.en}
                <span className="opacity-70">({n})</span>
              </button>
            )
          })}
        </div>

        <div className="flex flex-wrap gap-2 items-center text-xs">
          <span className="text-gray-500">{t('filter.scenario')}:</span>
          <button
            type="button"
            onClick={() => setScenFilter('all')}
            className={`px-2 py-0.5 rounded-full border ${
              scenFilter === 'all'
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
            }`}
          >
            {t('filter.all')}
          </button>
          {SCENARIOS.map((s) => {
            const n = scenCounts[s.id] ?? 0
            if (n === 0 && scenFilter !== s.id) return null
            const active = scenFilter === s.id
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setScenFilter(s.id)}
                className={`px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                  active
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                }`}
              >
                <span>{s.emoji}</span>
                {isZh ? s.zh : s.en}
                <span className="opacity-70">({n})</span>
              </button>
            )
          })}
        </div>
      </section>

      {/* 列表 */}
      {filteredItems.length > 0 ? (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredItems.map((it) => (
            <ItemCard
              key={it.id}
              item={it}
              isZh={isZh}
              onEdit={() => openEdit(it)}
              onRemove={() => removeItem(it.id)}
              t={t}
            />
          ))}
        </section>
      ) : (
        <section className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-12 text-center text-sm text-gray-500">
          {data.items.length === 0 ? t('empty.first') : t('empty.filtered')}
        </section>
      )}

      <p className="text-xs text-gray-400 text-center">
        {t('disclaimer', { count: data.items.length })}
      </p>

      {/* 表单 modal */}
      {formOpen && (
        <ItemFormModal
          draft={draft}
          setDraft={setDraft}
          onSave={saveDraft}
          onClose={closeForm}
          isEditing={isEditing}
          isZh={isZh}
          t={t}
        />
      )}
    </div>
  )
}

interface ItemCardProps {
  item: Item
  isZh: boolean
  onEdit: () => void
  onRemove: () => void
  t: (k: string, opts?: Record<string, unknown>) => string
}
const ItemCard: React.FC<ItemCardProps> = ({ item, isZh, onEdit, onRemove, t }) => {
  const cat = CATEGORY_BY_ID[item.category]
  const scen = SCENARIO_BY_ID[item.scenario]
  const updatedStr = new Date(item.updatedAt).toLocaleDateString(isZh ? 'zh-CN' : 'en-US')
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="text-2xl shrink-0">{cat?.emoji ?? '📦'}</span>
        <h3 className="text-base font-semibold text-gray-800 truncate flex-1">{item.name}</h3>
        <button
          type="button"
          onClick={onEdit}
          className="text-gray-400 hover:text-indigo-600"
          title={t('action.edit')}
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="text-gray-400 hover:text-red-500"
          title={t('action.delete')}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex items-start gap-1.5 text-sm text-gray-700">
        <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-emerald-500" />
        <span className="break-words">{item.location}</span>
      </div>

      <div className="flex flex-wrap gap-1.5 text-xs">
        <span className="px-2 py-0.5 rounded-full border bg-indigo-50 text-indigo-700 border-indigo-200">
          {cat?.emoji} {isZh ? cat?.zh : cat?.en}
        </span>
        <span className="px-2 py-0.5 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200">
          {scen?.emoji} {isZh ? scen?.zh : scen?.en}
        </span>
      </div>

      {item.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 text-xs text-gray-500">
          {item.tags.map((tag, i) => (
            <span key={i} className="inline-flex items-center gap-0.5">
              <Tag className="w-3 h-3" />
              {tag}
            </span>
          ))}
        </div>
      )}

      {item.note && (
        <div className="text-xs text-gray-500 italic border-l-2 border-gray-200 pl-2 break-words">
          {item.note}
        </div>
      )}

      <div className="text-[10px] text-gray-400 mt-auto">{t('updatedAt', { date: updatedStr })}</div>
    </div>
  )
}

interface ItemFormModalProps {
  draft: DraftItem
  setDraft: React.Dispatch<React.SetStateAction<DraftItem>>
  onSave: () => void
  onClose: () => void
  isEditing: boolean
  isZh: boolean
  t: (k: string, opts?: Record<string, unknown>) => string
}
const ItemFormModal: React.FC<ItemFormModalProps> = ({
  draft,
  setDraft,
  onSave,
  onClose,
  isEditing,
  isZh,
  t,
}) => {
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center gap-2 p-4 border-b border-gray-200">
          <Boxes className="w-5 h-5 text-indigo-600" />
          <h3 className="text-base font-semibold text-gray-800 flex-1">
            {isEditing ? t('form.editTitle') : t('form.addTitle')}
          </h3>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </header>

        <div className="overflow-y-auto p-4 space-y-3">
          <Field label={t('field.name')}>
            <input
              type="text"
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              placeholder={t('field.namePlaceholder')}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              autoFocus
            />
          </Field>
          <Field label={t('field.location')}>
            <input
              type="text"
              value={draft.location}
              onChange={(e) => setDraft({ ...draft, location: e.target.value })}
              placeholder={t('field.locationPlaceholder')}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label={t('field.category')}>
              <select
                value={draft.category}
                onChange={(e) => setDraft({ ...draft, category: e.target.value as CategoryId })}
                className="w-full px-2 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.emoji} {isZh ? c.zh : c.en}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={t('field.scenario')}>
              <select
                value={draft.scenario}
                onChange={(e) => setDraft({ ...draft, scenario: e.target.value as ScenarioId })}
                className="w-full px-2 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {SCENARIOS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.emoji} {isZh ? s.zh : s.en}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <Field label={t('field.tags')}>
            <input
              type="text"
              value={draft.tagsInput}
              onChange={(e) => setDraft({ ...draft, tagsInput: e.target.value })}
              placeholder={t('field.tagsPlaceholder')}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </Field>
          <Field label={t('field.note')}>
            <textarea
              value={draft.note}
              onChange={(e) => setDraft({ ...draft, note: e.target.value })}
              placeholder={t('field.notePlaceholder')}
              rows={3}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </Field>
        </div>

        <footer className="p-4 border-t border-gray-200 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            {t('action.cancel')}
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={!draft.name.trim() || !draft.location.trim()}
            className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-300 transition-colors"
          >
            {isEditing ? t('action.update') : t('action.save')}
          </button>
        </footer>
      </div>
    </div>
  )
}

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <label className="block text-sm">
    <span className="block text-xs text-gray-500 mb-1">{label}</span>
    {children}
  </label>
)

export default ItemLocator
