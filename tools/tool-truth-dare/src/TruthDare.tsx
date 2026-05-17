import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  MessageCircleQuestion,
  Flame,
  HelpCircle,
  Plus,
  Trash2,
  ChevronDown,
  Users,
  History,
  RefreshCw,
  Shuffle,
  CircleUserRound,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { PageHero } from '@toolbox/ui-kit'
import { useToolStorage } from '@toolbox/storage'
import { useTranslation } from 'react-i18next'

import { BUILT_IN_PROMPTS, type Prompt, type PromptType, type PromptDifficulty } from './prompts'

const NAMESPACE = 'toolTruthDare'

const DIFFICULTIES: PromptDifficulty[] = ['mild', 'normal', 'spicy', 'wild']
const DIFFICULTY_COLOR: Record<PromptDifficulty, string> = {
  mild: 'bg-emerald-100 text-emerald-700 border-emerald-300',
  normal: 'bg-sky-100 text-sky-700 border-sky-300',
  spicy: 'bg-amber-100 text-amber-700 border-amber-300',
  wild: 'bg-rose-100 text-rose-700 border-rose-300',
}
const TYPE_COLOR: Record<PromptType, string> = {
  truth: 'bg-indigo-600 text-white',
  dare: 'bg-pink-600 text-white',
}

interface CustomPrompt {
  id: string
  type: PromptType
  difficulty: PromptDifficulty
  zh: string
  en: string
}

interface PersistedState {
  players: string[]
  currentPlayerIndex: number
  customPrompts: CustomPrompt[]
  usedPromptIds: string[]
  enabledDifficulties: PromptDifficulty[]
  enabledTypes: PromptType[]
}

const DEFAULT_STATE: PersistedState = {
  players: [],
  currentPlayerIndex: 0,
  customPrompts: [],
  usedPromptIds: [],
  enabledDifficulties: ['mild', 'normal', 'spicy'],
  enabledTypes: ['truth', 'dare'],
}

function pickRandom<T>(arr: T[]): T | null {
  if (arr.length === 0) return null
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const max = Math.floor(0xffffffff / arr.length) * arr.length
    const buf = new Uint32Array(1)
    let n: number
    do {
      crypto.getRandomValues(buf)
      n = buf[0]
    } while (n >= max)
    return arr[n % arr.length]
  }
  return arr[Math.floor(Math.random() * arr.length)]
}

const TruthDare: React.FC = () => {
  const { t, i18n } = useTranslation(NAMESPACE)
  const lang = (i18n.resolvedLanguage || i18n.language || 'zh').startsWith('zh') ? 'zh' : 'en'

  const { data, save, loading } = useToolStorage<PersistedState>(
    'truth-dare',
    'state',
    DEFAULT_STATE,
  )

  const [current, setCurrent] = useState<Prompt | null>(null)
  const [drawing, setDrawing] = useState(false)
  const [exhausted, setExhausted] = useState(false)
  const [playersOpen, setPlayersOpen] = useState(false)
  const [customOpen, setCustomOpen] = useState(false)
  const [newPlayer, setNewPlayer] = useState('')
  const [draftPrompt, setDraftPrompt] = useState<{
    type: PromptType
    difficulty: PromptDifficulty
    text: string
  }>({
    type: 'truth',
    difficulty: 'normal',
    text: '',
  })

  const allPrompts: Prompt[] = useMemo(() => {
    const custom = data.customPrompts.map((c) => ({
      ...c,
      zh: c.zh || c.en,
      en: c.en || c.zh,
    }))
    return [...BUILT_IN_PROMPTS, ...custom]
  }, [data.customPrompts])

  const filteredPrompts = useMemo(() => {
    return allPrompts.filter(
      (p) =>
        data.enabledTypes.includes(p.type) && data.enabledDifficulties.includes(p.difficulty),
    )
  }, [allPrompts, data.enabledTypes, data.enabledDifficulties])

  const availablePrompts = useMemo(() => {
    const usedSet = new Set(data.usedPromptIds)
    return filteredPrompts.filter((p) => !usedSet.has(p.id))
  }, [filteredPrompts, data.usedPromptIds])

  const drawPrompt = useCallback(
    (forceType?: PromptType) => {
      if (drawing || loading) return
      setDrawing(true)
      setExhausted(false)

      const pool = forceType
        ? availablePrompts.filter((p) => p.type === forceType)
        : availablePrompts

      if (pool.length === 0) {
        setDrawing(false)
        setCurrent(null)
        setExhausted(true)
        return
      }

      let ticks = 0
      const total = 6
      const flicker = window.setInterval(() => {
        const candidate = pickRandom(pool)
        if (candidate) setCurrent(candidate)
        ticks += 1
        if (ticks >= total) {
          window.clearInterval(flicker)
          const final = pickRandom(pool)
          if (final) {
            setCurrent(final)
            void save({
              ...data,
              usedPromptIds: [...data.usedPromptIds, final.id],
            })
          }
          setDrawing(false)
        }
      }, 70)
    },
    [drawing, loading, data, save, availablePrompts],
  )

  const resetUsed = useCallback(() => {
    void save({ ...data, usedPromptIds: [] })
    setExhausted(false)
  }, [data, save])

  const addPlayer = useCallback(() => {
    const name = newPlayer.trim()
    if (!name) return
    if (data.players.includes(name)) {
      setNewPlayer('')
      return
    }
    void save({ ...data, players: [...data.players, name] })
    setNewPlayer('')
  }, [newPlayer, data, save])

  const removePlayer = useCallback(
    (idx: number) => {
      const nextPlayers = data.players.filter((_, i) => i !== idx)
      const nextIdx =
        nextPlayers.length === 0
          ? 0
          : Math.min(data.currentPlayerIndex, nextPlayers.length - 1)
      void save({ ...data, players: nextPlayers, currentPlayerIndex: nextIdx })
    },
    [data, save],
  )

  const nextPlayer = useCallback(() => {
    if (data.players.length === 0) return
    const next = (data.currentPlayerIndex + 1) % data.players.length
    void save({ ...data, currentPlayerIndex: next })
  }, [data, save])

  const prevPlayer = useCallback(() => {
    if (data.players.length === 0) return
    const prev =
      (data.currentPlayerIndex - 1 + data.players.length) % data.players.length
    void save({ ...data, currentPlayerIndex: prev })
  }, [data, save])

  const currentPlayer =
    data.players.length > 0
      ? data.players[data.currentPlayerIndex % data.players.length]
      : null

  const toggleType = (typ: PromptType) => {
    const next = data.enabledTypes.includes(typ)
      ? data.enabledTypes.filter((x) => x !== typ)
      : [...data.enabledTypes, typ]
    if (next.length === 0) return
    void save({ ...data, enabledTypes: next })
  }
  const toggleDifficulty = (diff: PromptDifficulty) => {
    const next = data.enabledDifficulties.includes(diff)
      ? data.enabledDifficulties.filter((x) => x !== diff)
      : [...data.enabledDifficulties, diff]
    if (next.length === 0) return
    void save({ ...data, enabledDifficulties: next })
  }

  const addCustomPrompt = useCallback(() => {
    const text = draftPrompt.text.trim()
    if (!text) return
    const item: CustomPrompt = {
      id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type: draftPrompt.type,
      difficulty: draftPrompt.difficulty,
      zh: text,
      en: text,
    }
    void save({ ...data, customPrompts: [...data.customPrompts, item] })
    setDraftPrompt({ ...draftPrompt, text: '' })
  }, [draftPrompt, data, save])

  const removeCustomPrompt = useCallback(
    (id: string) => {
      void save({
        ...data,
        customPrompts: data.customPrompts.filter((c) => c.id !== id),
        usedPromptIds: data.usedPromptIds.filter((x) => x !== id),
      })
    },
    [data, save],
  )

  useEffect(() => {
    if (exhausted && availablePrompts.length > 0) setExhausted(false)
  }, [availablePrompts.length, exhausted])

  const usedCount = data.usedPromptIds.length
  const totalCount = filteredPrompts.length

  return (
    <div className="w-full space-y-6 pb-24">
      <PageHero title={t('title')} description={t('description')} />

      {/* Filters */}
      <section className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-gray-700 shrink-0">{t('typeLabel')}:</span>
          {(['truth', 'dare'] as PromptType[]).map((typ) => {
            const on = data.enabledTypes.includes(typ)
            return (
              <button
                key={typ}
                type="button"
                onClick={() => toggleType(typ)}
                className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                  on
                    ? typ === 'truth'
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-pink-600 text-white border-pink-600'
                    : 'bg-white text-gray-500 border-gray-300 hover:border-gray-400'
                }`}
              >
                {typ === 'truth' ? (
                  <HelpCircle className="inline w-3.5 h-3.5 mr-1 -mt-0.5" />
                ) : (
                  <Flame className="inline w-3.5 h-3.5 mr-1 -mt-0.5" />
                )}
                {t(`type.${typ}`)}
              </button>
            )
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-gray-700 shrink-0">{t('difficultyLabel')}:</span>
          {DIFFICULTIES.map((d) => {
            const on = data.enabledDifficulties.includes(d)
            return (
              <button
                key={d}
                type="button"
                onClick={() => toggleDifficulty(d)}
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                  on ? DIFFICULTY_COLOR[d] : 'bg-white text-gray-400 border-gray-200'
                }`}
              >
                {t(`difficulty.${d}`)}
              </button>
            )
          })}
        </div>

        <div className="text-xs text-gray-400 pt-1">
          {t('poolStatus', { used: usedCount, total: totalCount })}
          {availablePrompts.length === 0 && filteredPrompts.length > 0 && (
            <>
              {' · '}
              <button
                type="button"
                onClick={resetUsed}
                className="text-indigo-600 hover:underline inline-flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                {t('resetUsed')}
              </button>
            </>
          )}
        </div>
      </section>

      {/* Prompt card + current player */}
      <section className="rounded-2xl border border-gray-200 bg-gradient-to-br from-indigo-50 via-white to-pink-50 p-6 md:p-8 min-h-[260px] flex flex-col items-center justify-center text-center gap-4">
        {currentPlayer && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <button
              type="button"
              onClick={prevPlayer}
              className="p-1 rounded hover:bg-white/60"
              title={t('prevPlayer')}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <CircleUserRound className="w-4 h-4 text-indigo-500" />
            <span className="font-medium text-gray-800">
              {t('currentTurn', { player: currentPlayer })}
            </span>
            <button
              type="button"
              onClick={nextPlayer}
              className="p-1 rounded hover:bg-white/60"
              title={t('nextPlayer')}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {!current && !exhausted && (
          <div className="text-gray-400 text-sm flex flex-col items-center gap-2">
            <Sparkles className="w-8 h-8 text-indigo-300" />
            <span>{t('emptyHint')}</span>
          </div>
        )}

        {exhausted && (
          <div className="text-gray-500 text-sm flex flex-col items-center gap-3">
            <Sparkles className="w-8 h-8 text-amber-400" />
            <p>{t('exhaustedHint')}</p>
            <button
              type="button"
              onClick={resetUsed}
              className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              {t('resetUsed')}
            </button>
          </div>
        )}

        {current && (
          <div className="space-y-3 max-w-xl">
            <div className="flex items-center justify-center gap-2">
              <span
                className={`inline-flex items-center gap-1 px-3 py-1 text-xs rounded-full font-medium ${TYPE_COLOR[current.type]}`}
              >
                {current.type === 'truth' ? (
                  <HelpCircle className="w-3 h-3" />
                ) : (
                  <Flame className="w-3 h-3" />
                )}
                {t(`type.${current.type}`)}
              </span>
              <span
                className={`inline-block px-2 py-0.5 text-xs rounded-full border ${DIFFICULTY_COLOR[current.difficulty]}`}
              >
                {t(`difficulty.${current.difficulty}`)}
              </span>
            </div>
            <p
              className={`text-xl md:text-2xl font-medium text-gray-800 leading-relaxed transition-opacity ${
                drawing ? 'opacity-50' : 'opacity-100'
              }`}
            >
              {current[lang]}
            </p>
          </div>
        )}
      </section>

      {/* Draw buttons */}
      <section className="flex flex-wrap gap-2 justify-center">
        <button
          type="button"
          onClick={() => drawPrompt('truth')}
          disabled={drawing || loading || !data.enabledTypes.includes('truth')}
          className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          <HelpCircle className="w-4 h-4" />
          {t('drawTruth')}
        </button>
        <button
          type="button"
          onClick={() => drawPrompt('dare')}
          disabled={drawing || loading || !data.enabledTypes.includes('dare')}
          className="px-4 py-2 text-sm font-medium bg-pink-600 text-white rounded-md hover:bg-pink-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          <Flame className="w-4 h-4" />
          {t('drawDare')}
        </button>
      </section>

      {/* Players (collapsible) */}
      <section className="rounded-lg border border-gray-200 bg-white">
        <button
          type="button"
          onClick={() => setPlayersOpen((v) => !v)}
          aria-expanded={playersOpen}
          className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <Users className="w-4 h-4" />
          {t('playersLabel')} ({data.players.length})
          <ChevronDown
            className={`w-4 h-4 ml-auto text-gray-400 transition-transform ${
              playersOpen ? 'rotate-180' : ''
            }`}
          />
        </button>
        {playersOpen && (
          <div className="px-4 pb-4 border-t border-gray-100 space-y-3 pt-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={newPlayer}
                onChange={(e) => setNewPlayer(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addPlayer()}
                placeholder={t('playerPlaceholder')}
                className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={addPlayer}
                disabled={!newPlayer.trim()}
                className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-300 transition-colors flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                {t('addPlayer')}
              </button>
            </div>
            {data.players.length > 0 ? (
              <ul className="flex flex-wrap gap-2">
                {data.players.map((p, i) => (
                  <li
                    key={`${p}-${i}`}
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm border ${
                      i === data.currentPlayerIndex
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                        : 'bg-gray-50 border-gray-200 text-gray-700'
                    }`}
                  >
                    <CircleUserRound className="w-3.5 h-3.5" />
                    {p}
                    <button
                      type="button"
                      onClick={() => removePlayer(i)}
                      className="ml-1 text-gray-400 hover:text-red-500"
                      title={t('removePlayer')}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-gray-400">{t('noPlayers')}</p>
            )}
          </div>
        )}
      </section>

      {/* Custom prompts (collapsible) */}
      <section className="rounded-lg border border-gray-200 bg-white">
        <button
          type="button"
          onClick={() => setCustomOpen((v) => !v)}
          aria-expanded={customOpen}
          className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <History className="w-4 h-4" />
          {t('customLabel')} ({data.customPrompts.length})
          <ChevronDown
            className={`w-4 h-4 ml-auto text-gray-400 transition-transform ${
              customOpen ? 'rotate-180' : ''
            }`}
          />
        </button>
        {customOpen && (
          <div className="px-4 pb-4 border-t border-gray-100 space-y-3 pt-3">
            <div className="grid grid-cols-1 md:grid-cols-[auto_auto_1fr_auto] gap-2 items-center">
              <select
                value={draftPrompt.type}
                onChange={(e) =>
                  setDraftPrompt({ ...draftPrompt, type: e.target.value as PromptType })
                }
                className="px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="truth">{t('type.truth')}</option>
                <option value="dare">{t('type.dare')}</option>
              </select>
              <select
                value={draftPrompt.difficulty}
                onChange={(e) =>
                  setDraftPrompt({
                    ...draftPrompt,
                    difficulty: e.target.value as PromptDifficulty,
                  })
                }
                className="px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {DIFFICULTIES.map((d) => (
                  <option key={d} value={d}>
                    {t(`difficulty.${d}`)}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={draftPrompt.text}
                onChange={(e) => setDraftPrompt({ ...draftPrompt, text: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && addCustomPrompt()}
                placeholder={t('customPlaceholder')}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={addCustomPrompt}
                disabled={!draftPrompt.text.trim()}
                className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-300 transition-colors flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                {t('addCustom')}
              </button>
            </div>
            {data.customPrompts.length > 0 ? (
              <ul className="divide-y divide-gray-100 max-h-72 overflow-y-auto">
                {data.customPrompts.map((c) => (
                  <li key={c.id} className="py-2 flex items-start gap-3 text-sm">
                    <span
                      className={`shrink-0 mt-0.5 inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full font-medium ${TYPE_COLOR[c.type]}`}
                    >
                      {c.type === 'truth' ? (
                        <HelpCircle className="w-3 h-3" />
                      ) : (
                        <Flame className="w-3 h-3" />
                      )}
                      {t(`type.${c.type}`)}
                    </span>
                    <span
                      className={`shrink-0 mt-0.5 inline-block px-1.5 py-0.5 text-xs rounded-full border ${DIFFICULTY_COLOR[c.difficulty]}`}
                    >
                      {t(`difficulty.${c.difficulty}`)}
                    </span>
                    <span className="flex-1 text-gray-700">{c[lang]}</span>
                    <button
                      type="button"
                      onClick={() => removeCustomPrompt(c.id)}
                      className="text-gray-400 hover:text-red-500 shrink-0"
                      title={t('removeCustom')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-gray-400">{t('noCustom')}</p>
            )}
          </div>
        )}
      </section>

      {/* Sticky primary action */}
      <div className="sticky bottom-4 z-10 flex flex-wrap gap-2 justify-center pt-2">
        <button
          type="button"
          onClick={() => drawPrompt()}
          disabled={drawing || loading}
          className="px-6 py-3 text-base font-medium bg-gray-900 text-white rounded-full shadow-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          <Shuffle className={`w-5 h-5 ${drawing ? 'animate-spin' : ''}`} />
          {drawing ? t('drawing') : t('drawRandom')}
        </button>
        {currentPlayer && (
          <button
            type="button"
            onClick={nextPlayer}
            className="px-5 py-3 text-base font-medium bg-white text-gray-700 rounded-full shadow border border-gray-200 hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <ChevronRight className="w-5 h-5" />
            {t('passToNext')}
          </button>
        )}
      </div>
    </div>
  )
}

export default TruthDare
