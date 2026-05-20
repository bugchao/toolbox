import React, { useCallback, useMemo, useState } from 'react'
import {
  Recycle,
  Search,
  Shuffle,
  ChevronDown,
  Plus,
  Trash2,
  Info,
  History,
} from 'lucide-react'
import { PageHero } from '@toolbox/ui-kit'
import { useToolStorage } from '@toolbox/storage'
import { useTranslation } from 'react-i18next'

import {
  CATEGORIES,
  TRASH_DB,
  searchTrash,
  type TrashCategory,
  type TrashItem,
} from './trashData'

const NAMESPACE = 'toolTrashClassifier'

interface CustomItem extends TrashItem {
  id: string
}

interface PersistedState {
  customs: CustomItem[]
  history: string[] // 最近搜索的物品名
  browseOpen: TrashCategory | null
}

const DEFAULT_STATE: PersistedState = {
  customs: [],
  history: [],
  browseOpen: null,
}

const MAX_HISTORY = 20
const ALL_CATS: TrashCategory[] = ['recyclable', 'wet', 'dry', 'hazardous']

const TrashClassifier: React.FC = () => {
  const { t, i18n } = useTranslation(NAMESPACE)
  const isZh = (i18n.resolvedLanguage || i18n.language || 'zh').startsWith('zh')

  const { data, save, loading } = useToolStorage<PersistedState>(
    'trash-classifier',
    'state',
    DEFAULT_STATE,
  )

  const [query, setQuery] = useState('')
  const [draftCustom, setDraftCustom] = useState<{ name: string; category: TrashCategory; hint: string }>({
    name: '',
    category: 'dry',
    hint: '',
  })
  const [customOpen, setCustomOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)

  // 合并内置和自定义条目
  const allItems = useMemo<TrashItem[]>(() => {
    return [...TRASH_DB, ...data.customs]
  }, [data.customs])

  // 当前查询的匹配结果
  const matches = useMemo(() => {
    if (!query.trim()) return []
    const internal = searchTrash(query)
    // 也搜自定义
    const q = query.trim().toLowerCase()
    const customHits = data.customs
      .filter((c) => {
        const name = c.name.toLowerCase()
        const aliases = (c.aliases ?? []).map((a) => a.toLowerCase())
        return name === q || aliases.includes(q) || name.includes(q) || aliases.some((a) => a.includes(q))
      })
      .map((item) => ({ item: item as TrashItem, score: 90 }))
    return [...customHits, ...internal]
  }, [query, data.customs])

  const topMatch = matches[0]
  const otherMatches = matches.slice(1, 6)

  const recordSearch = useCallback(
    (term: string) => {
      const trimmed = term.trim()
      if (!trimmed) return
      const next = [trimmed, ...data.history.filter((x) => x !== trimmed)].slice(0, MAX_HISTORY)
      void save({ ...data, history: next })
    },
    [data, save],
  )

  const onSearch = (term: string) => {
    setQuery(term)
    if (term.trim()) recordSearch(term)
  }

  const onRandom = () => {
    const idx = Math.floor(Math.random() * allItems.length)
    const pick = allItems[idx]
    setQuery(pick.name)
    recordSearch(pick.name)
  }

  const clearHistory = () => {
    void save({ ...data, history: [] })
  }

  const addCustom = () => {
    const name = draftCustom.name.trim()
    if (!name) return
    const item: CustomItem = {
      id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name,
      category: draftCustom.category,
      hint: draftCustom.hint.trim() || undefined,
    }
    void save({ ...data, customs: [...data.customs, item] })
    setDraftCustom({ name: '', category: draftCustom.category, hint: '' })
  }

  const removeCustom = (id: string) => {
    void save({ ...data, customs: data.customs.filter((c) => c.id !== id) })
  }

  const toggleBrowse = (cat: TrashCategory) => {
    void save({ ...data, browseOpen: data.browseOpen === cat ? null : cat })
  }

  // 按类别分组内置 + 自定义条目（用于"浏览"区）
  const itemsByCategory = useMemo(() => {
    const grouped: Record<TrashCategory, TrashItem[]> = {
      recyclable: [],
      wet: [],
      dry: [],
      hazardous: [],
    }
    for (const it of allItems) grouped[it.category].push(it)
    return grouped
  }, [allItems])

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

      {/* 搜索 */}
      <section className="rounded-2xl border border-gray-200 bg-gradient-to-br from-emerald-50 via-white to-sky-50 p-6">
        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSearch(query)}
              onBlur={() => query.trim() && recordSearch(query)}
              placeholder={t('search.placeholder')}
              className="w-full pl-9 pr-3 py-2.5 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              autoFocus
            />
          </div>
          <button
            type="button"
            onClick={onRandom}
            className="px-3 py-2.5 text-sm bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center gap-1.5"
            title={t('search.random')}
          >
            <Shuffle className="w-4 h-4" />
            {t('search.random')}
          </button>
        </div>

        {/* 结果 */}
        {query.trim() && (
          <div className="mt-4">
            {topMatch ? (
              <ResultCard item={topMatch.item} isZh={isZh} t={t} />
            ) : (
              <div className="text-sm text-gray-500 bg-white/60 rounded-md border border-gray-200 p-4 text-center">
                {t('search.notFound')}
              </div>
            )}
            {otherMatches.length > 0 && (
              <div className="mt-3">
                <div className="text-xs text-gray-500 mb-1.5">{t('search.related')}：</div>
                <div className="flex flex-wrap gap-1.5">
                  {otherMatches.map(({ item }) => (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => setQuery(item.name)}
                      className={`px-2 py-1 text-xs rounded-full border ${CATEGORIES[item.category].ringColor} hover:opacity-80 transition-opacity`}
                    >
                      {CATEGORIES[item.category].emoji} {item.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* 4 大类总览 */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {ALL_CATS.map((cat) => {
          const meta = CATEGORIES[cat]
          const open = data.browseOpen === cat
          const count = itemsByCategory[cat].length
          return (
            <button
              key={cat}
              type="button"
              onClick={() => toggleBrowse(cat)}
              className={`rounded-2xl border p-4 text-left transition-all ${
                open ? 'ring-2 ring-offset-2 ring-emerald-400' : ''
              } ${meta.ringColor}`}
            >
              <div className="text-3xl">{meta.emoji}</div>
              <div className="mt-1 font-semibold">{isZh ? meta.zh : meta.en}</div>
              <div className="text-xs opacity-75 mt-0.5">{isZh ? meta.desc_zh : meta.desc_en}</div>
              <div className="text-xs mt-2 opacity-70">{t('browse.count', { count })}</div>
            </button>
          )
        })}
      </section>

      {/* 浏览展开列表（展开的那个分类） */}
      {data.browseOpen && (
        <section className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">{CATEGORIES[data.browseOpen].emoji}</span>
            <h3 className="text-sm font-semibold text-gray-800">
              {isZh ? CATEGORIES[data.browseOpen].zh : CATEGORIES[data.browseOpen].en}
            </h3>
            <span className="text-xs text-gray-400">
              ({itemsByCategory[data.browseOpen].length} {t('browse.entries')})
            </span>
            <button
              type="button"
              onClick={() => save({ ...data, browseOpen: null })}
              className="ml-auto text-xs text-gray-500 hover:text-gray-800"
            >
              {t('browse.collapse')}
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-72 overflow-y-auto">
            {itemsByCategory[data.browseOpen].map((it) => (
              <button
                key={it.name}
                type="button"
                onClick={() => setQuery(it.name)}
                className="px-2 py-1 text-xs bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-md text-gray-700 transition-colors"
                title={it.hint}
              >
                {it.name}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* 自定义条目 */}
      <section className="rounded-lg border border-gray-200 bg-white">
        <button
          type="button"
          onClick={() => setCustomOpen((v) => !v)}
          className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t('custom.title')} ({data.customs.length})
          <ChevronDown
            className={`w-4 h-4 ml-auto text-gray-400 transition-transform ${
              customOpen ? 'rotate-180' : ''
            }`}
          />
        </button>
        {customOpen && (
          <div className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_2fr_auto] gap-2">
              <input
                type="text"
                value={draftCustom.name}
                onChange={(e) => setDraftCustom({ ...draftCustom, name: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && addCustom()}
                placeholder={t('custom.namePlaceholder')}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <select
                value={draftCustom.category}
                onChange={(e) =>
                  setDraftCustom({ ...draftCustom, category: e.target.value as TrashCategory })
                }
                className="px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {ALL_CATS.map((c) => (
                  <option key={c} value={c}>
                    {CATEGORIES[c].emoji} {isZh ? CATEGORIES[c].zh : CATEGORIES[c].en}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={draftCustom.hint}
                onChange={(e) => setDraftCustom({ ...draftCustom, hint: e.target.value })}
                placeholder={t('custom.hintPlaceholder')}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={addCustom}
                disabled={!draftCustom.name.trim()}
                className="px-3 py-1.5 text-sm bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:bg-gray-300 transition-colors flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                {t('custom.add')}
              </button>
            </div>
            {data.customs.length > 0 ? (
              <ul className="divide-y divide-gray-100">
                {data.customs.map((c) => (
                  <li key={c.id} className="py-2 flex items-center gap-3 text-sm">
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full border ${CATEGORIES[c.category].ringColor}`}
                    >
                      {CATEGORIES[c.category].emoji} {isZh ? CATEGORIES[c.category].zh : CATEGORIES[c.category].en}
                    </span>
                    <span className="text-gray-800">{c.name}</span>
                    {c.hint && <span className="text-xs text-gray-500">{c.hint}</span>}
                    <button
                      type="button"
                      onClick={() => removeCustom(c.id)}
                      className="ml-auto text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-gray-400">{t('custom.empty')}</p>
            )}
          </div>
        )}
      </section>

      {/* 历史 */}
      {data.history.length > 0 && (
        <section className="rounded-lg border border-gray-200 bg-white">
          <button
            type="button"
            onClick={() => setHistoryOpen((v) => !v)}
            className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <History className="w-4 h-4" />
            {t('history.title')} ({data.history.length})
            <ChevronDown
              className={`w-4 h-4 ml-auto text-gray-400 transition-transform ${
                historyOpen ? 'rotate-180' : ''
              }`}
            />
          </button>
          {historyOpen && (
            <div className="px-4 pb-4 border-t border-gray-100 pt-3">
              <div className="flex flex-wrap gap-1.5">
                {data.history.map((h, i) => (
                  <button
                    key={`${h}-${i}`}
                    type="button"
                    onClick={() => setQuery(h)}
                    className="px-2 py-1 text-xs bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-md text-gray-700 transition-colors"
                  >
                    {h}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={clearHistory}
                className="mt-2 text-xs text-gray-500 hover:text-red-600 inline-flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" /> {t('history.clear')}
              </button>
            </div>
          )}
        </section>
      )}

      <p className="text-xs text-gray-400 text-center flex items-center justify-center gap-1">
        <Info className="w-3 h-3" /> {t('disclaimer')}
      </p>
    </div>
  )
}

interface ResultCardProps {
  item: TrashItem
  isZh: boolean
  t: (k: string, opts?: Record<string, unknown>) => string
}
const ResultCard: React.FC<ResultCardProps> = ({ item, isZh, t }) => {
  const meta = CATEGORIES[item.category]
  return (
    <div className={`rounded-xl border-2 ${meta.ringColor} p-5 bg-white/80`}>
      <div className="flex items-start gap-4">
        <div className="text-5xl">{meta.emoji}</div>
        <div className="flex-1 min-w-0">
          <div className="text-xs uppercase tracking-wide opacity-70">
            {t('result.belongs')}
          </div>
          <div className="text-2xl font-bold mt-0.5">
            {isZh ? meta.zh : meta.en}
          </div>
          <div className="text-sm text-gray-700 mt-1">{item.name}</div>
          {item.hint && (
            <div className="mt-2 text-xs px-2 py-1 rounded bg-white/70 text-gray-600 border border-gray-200 inline-block">
              💡 {item.hint}
            </div>
          )}
          {item.aliases && item.aliases.length > 0 && (
            <div className="mt-2 text-xs text-gray-500">
              {t('result.aliases')}: {item.aliases.slice(0, 5).join(' / ')}
            </div>
          )}
        </div>
        <Recycle className="w-5 h-5 opacity-60 shrink-0" />
      </div>
    </div>
  )
}

export default TrashClassifier
