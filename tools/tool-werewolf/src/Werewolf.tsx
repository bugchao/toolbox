import React, { useCallback, useMemo, useState } from 'react'
import {
  Moon,
  Eye,
  ChevronRight,
  X,
  RotateCcw,
  Plus,
  Minus,
  Users,
  Shuffle,
  AlertCircle,
} from 'lucide-react'
import { PageHero } from '@toolbox/ui-kit'
import { useToolStorage } from '@toolbox/storage'
import { useTranslation } from 'react-i18next'

const NAMESPACE = 'toolWerewolf'

type RoleId =
  | 'villager'
  | 'werewolf'
  | 'seer'
  | 'witch'
  | 'hunter'
  | 'guard'
  | 'idiot'
  | 'wolfKing'
  | 'cupid'

type Team = 'good' | 'evil' | 'neutral'

interface RoleDef {
  id: RoleId
  team: Team
  // English fallback colour
  color: string
}

const ROLE_DEFS: RoleDef[] = [
  { id: 'villager', team: 'good', color: 'bg-sky-100 text-sky-700 border-sky-300' },
  { id: 'werewolf', team: 'evil', color: 'bg-rose-100 text-rose-700 border-rose-300' },
  { id: 'wolfKing', team: 'evil', color: 'bg-rose-200 text-rose-800 border-rose-400' },
  { id: 'seer', team: 'good', color: 'bg-violet-100 text-violet-700 border-violet-300' },
  { id: 'witch', team: 'good', color: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
  { id: 'hunter', team: 'good', color: 'bg-amber-100 text-amber-700 border-amber-300' },
  { id: 'guard', team: 'good', color: 'bg-cyan-100 text-cyan-700 border-cyan-300' },
  { id: 'idiot', team: 'good', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
  { id: 'cupid', team: 'neutral', color: 'bg-pink-100 text-pink-700 border-pink-300' },
]

const ROLE_DEF_BY_ID: Record<RoleId, RoleDef> = ROLE_DEFS.reduce(
  (m, r) => ((m[r.id] = r), m),
  {} as Record<RoleId, RoleDef>,
)

interface Player {
  id: string
  name: string
  role: RoleId
  revealed: boolean
}

interface ActiveDeal {
  players: Player[]
  currentIdx: number
  cardVisible: boolean
}

interface PersistedState {
  // role -> count (0 if absent)
  composition: Partial<Record<RoleId, number>>
  playerNames: string[]
  deal: ActiveDeal | null
}

const DEFAULT_STATE: PersistedState = {
  composition: { villager: 4, werewolf: 3, seer: 1, witch: 1, hunter: 1 },
  playerNames: [],
  deal: null,
}

function cryptoRandInt(max: number): number {
  if (max <= 0) return 0
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const bound = Math.floor(0xffffffff / max) * max
    const buf = new Uint32Array(1)
    let n: number
    do {
      crypto.getRandomValues(buf)
      n = buf[0]
    } while (n >= bound)
    return n % max
  }
  return Math.floor(Math.random() * max)
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = cryptoRandInt(i + 1)
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const Werewolf: React.FC = () => {
  const { t } = useTranslation(NAMESPACE)

  const { data, save, loading } = useToolStorage<PersistedState>(
    'werewolf',
    'state',
    DEFAULT_STATE,
  )

  const [localNames, setLocalNames] = useState<string[]>([])

  const totalCount = useMemo(
    () => Object.values(data.composition).reduce((s, n) => s + (n ?? 0), 0),
    [data.composition],
  )

  // Sync local name buffer with composition total when no deal in progress
  React.useEffect(() => {
    if (data.deal) return
    setLocalNames((prev) => {
      const target = totalCount
      const base = prev.length > 0 ? prev : data.playerNames
      if (base.length === target) return base
      if (base.length > target) return base.slice(0, target)
      return [...base, ...Array.from({ length: target - base.length }, () => '')]
    })
  }, [data.deal, totalCount, data.playerNames])

  const wolfTotal = useMemo(
    () =>
      Object.entries(data.composition).reduce(
        (s, [k, n]) => s + (ROLE_DEF_BY_ID[k as RoleId]?.team === 'evil' ? (n ?? 0) : 0),
        0,
      ),
    [data.composition],
  )
  const goodTotal = useMemo(
    () =>
      Object.entries(data.composition).reduce(
        (s, [k, n]) => s + (ROLE_DEF_BY_ID[k as RoleId]?.team === 'good' ? (n ?? 0) : 0),
        0,
      ),
    [data.composition],
  )

  const balanceWarning = useMemo(() => {
    if (totalCount < 4) return 'tooFew'
    if (wolfTotal === 0) return 'noWolf'
    if (wolfTotal >= goodTotal) return 'wolfTooMany'
    return null
  }, [totalCount, wolfTotal, goodTotal])

  const incRole = (id: RoleId, delta: number) => {
    const next = (data.composition[id] ?? 0) + delta
    if (next < 0) return
    const cap = id === 'cupid' || id === 'idiot' || id === 'guard' || id === 'witch' || id === 'seer' || id === 'wolfKing'
      ? 1
      : 99
    if (next > cap) return
    if (totalCount + delta > 20) return
    void save({
      ...data,
      composition: { ...data.composition, [id]: next },
    })
  }

  const startDeal = useCallback(() => {
    const roleList: RoleId[] = []
    for (const [id, n] of Object.entries(data.composition)) {
      for (let i = 0; i < (n ?? 0); i++) roleList.push(id as RoleId)
    }
    if (roleList.length < 4) return
    const shuffled = shuffle(roleList)
    const players: Player[] = shuffled.map((role, i) => {
      const supplied = (localNames[i] || '').trim()
      const fallback = `P${i + 1}`
      return {
        id: `p${i}`,
        name: supplied || fallback,
        role,
        revealed: false,
      }
    })
    void save({
      ...data,
      playerNames: localNames.slice(0, players.length),
      deal: { players, currentIdx: 0, cardVisible: false },
    })
  }, [data, save, localNames])

  const flipCard = () => {
    if (!data.deal) return
    const deal = data.deal
    void save({
      ...data,
      deal: {
        ...deal,
        cardVisible: !deal.cardVisible,
        players: deal.players.map((p, i) =>
          i === deal.currentIdx ? { ...p, revealed: true } : p,
        ),
      },
    })
  }

  const passNext = () => {
    if (!data.deal) return
    const deal = data.deal
    const nextIdx = deal.currentIdx + 1
    if (nextIdx >= deal.players.length) {
      void save({ ...data, deal: null }) // dealing finished — back to setup
    } else {
      void save({ ...data, deal: { ...deal, currentIdx: nextIdx, cardVisible: false } })
    }
  }

  const endDeal = () => {
    void save({ ...data, deal: null })
  }

  const resetComposition = () => {
    void save({ ...data, composition: DEFAULT_STATE.composition })
  }

  if (loading) {
    return (
      <div className="w-full space-y-6">
        <PageHero title={t('title')} description={t('description')} />
        <div className="text-center text-sm text-gray-400 py-12">{t('loading')}</div>
      </div>
    )
  }

  // ─── REVEAL screen (pass-and-flip) ──────────────────────────
  if (data.deal) {
    const player = data.deal.players[data.deal.currentIdx]
    const def = ROLE_DEF_BY_ID[player.role]
    return (
      <div className="w-full space-y-6">
        <PageHero title={t('title')} description={t('description')} />
        <section className="rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-900 to-indigo-900 p-6 md:p-8 min-h-[400px] flex flex-col items-center justify-center text-center gap-4 text-white">
          <div className="text-xs text-white/70 uppercase tracking-wide">
            {t('reveal.progress', {
              idx: data.deal.currentIdx + 1,
              total: data.deal.players.length,
            })}
          </div>
          <div className="text-base font-medium">
            {t('reveal.playerLabel', { name: player.name })}
          </div>

          <button
            type="button"
            onClick={flipCard}
            className={`group w-64 h-80 rounded-2xl border-2 shadow-2xl flex flex-col items-center justify-center transition-all ${
              data.deal.cardVisible
                ? 'bg-white border-gray-300 text-gray-900'
                : 'bg-gradient-to-br from-indigo-700 via-purple-800 to-gray-900 border-indigo-500 hover:scale-105'
            }`}
            aria-label={data.deal.cardVisible ? t('reveal.tapToHide') : t('reveal.tap')}
          >
            {data.deal.cardVisible ? (
              <div className="space-y-4 px-4">
                <span
                  className={`inline-block px-3 py-1 text-xs font-medium rounded-full border ${def.color}`}
                >
                  {t(`team.${def.team}`)}
                </span>
                <div className="text-3xl md:text-4xl font-bold">{t(`roles.${player.role}.name`)}</div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {t(`roles.${player.role}.desc`)}
                </p>
                <div className="text-xs text-gray-400 pt-2">{t('reveal.tapToHide')}</div>
              </div>
            ) : (
              <>
                <Moon className="w-12 h-12 mb-2 opacity-90" />
                <div className="text-lg font-medium">{t('reveal.tap')}</div>
                <div className="text-xs opacity-75 mt-1">{t('reveal.privateHint')}</div>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={passNext}
            disabled={!data.deal.cardVisible}
            className="px-5 py-2 text-sm font-medium bg-white text-gray-900 rounded-full hover:bg-gray-100 disabled:bg-white/30 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {data.deal.currentIdx + 1 === data.deal.players.length
              ? t('reveal.allDone')
              : t('reveal.passNext')}
            <ChevronRight className="w-4 h-4" />
          </button>
        </section>

        <div className="text-center">
          <button
            type="button"
            onClick={endDeal}
            className="text-xs text-gray-400 hover:text-red-500 inline-flex items-center gap-1"
          >
            <X className="w-3 h-3" /> {t('actions.abort')}
          </button>
        </div>
      </div>
    )
  }

  // ─── SETUP screen ──────────────────────────────────────────
  return (
    <div className="w-full space-y-6 pb-24">
      <PageHero title={t('title')} description={t('description')} />

      <section className="rounded-lg border border-gray-200 bg-white p-5 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
            <Users className="w-4 h-4" /> {t('setup.title')}
            <span className="text-xs text-gray-400 font-normal ml-2">
              {t('setup.totalLabel', { total: totalCount, wolves: wolfTotal })}
            </span>
          </h2>
          <button
            type="button"
            onClick={resetComposition}
            className="text-xs text-gray-500 hover:text-gray-800 inline-flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" /> {t('setup.resetDefault')}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {ROLE_DEFS.map((def) => {
            const n = data.composition[def.id] ?? 0
            return (
              <div
                key={def.id}
                className="flex items-center justify-between gap-2 rounded-md border border-gray-200 px-3 py-2 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full border shrink-0 ${def.color}`}
                  >
                    {t(`team.${def.team}`)}
                  </span>
                  <span className="text-sm font-medium text-gray-800 truncate">
                    {t(`roles.${def.id}.name`)}
                  </span>
                </div>
                <div className="inline-flex items-center border border-gray-200 rounded-md overflow-hidden shrink-0">
                  <button
                    type="button"
                    onClick={() => incRole(def.id, -1)}
                    disabled={n <= 0}
                    className="px-2 py-1 text-gray-600 hover:bg-gray-50 disabled:text-gray-300 disabled:cursor-not-allowed"
                    aria-label={t('setup.decrement')}
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-2 py-1 text-sm font-mono text-gray-800 min-w-[1.75rem] text-center tabular-nums">
                    {n}
                  </span>
                  <button
                    type="button"
                    onClick={() => incRole(def.id, +1)}
                    className="px-2 py-1 text-gray-600 hover:bg-gray-50"
                    aria-label={t('setup.increment')}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {balanceWarning && (
          <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{t(`warnings.${balanceWarning}`)}</span>
          </div>
        )}
      </section>

      {totalCount >= 4 && (
        <section className="rounded-lg border border-gray-200 bg-white p-5 space-y-3">
          <h3 className="text-sm font-medium text-gray-700">{t('setup.namesLabel')}</h3>
          <p className="text-xs text-gray-400">{t('setup.namesHint')}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {Array.from({ length: totalCount }).map((_, i) => (
              <input
                key={i}
                type="text"
                value={localNames[i] || ''}
                onChange={(e) => {
                  const next = [...localNames]
                  next[i] = e.target.value
                  setLocalNames(next)
                }}
                placeholder={`P${i + 1}`}
                className="px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            ))}
          </div>
        </section>
      )}

      <div className="sticky bottom-4 z-10 flex justify-center pt-2">
        <button
          type="button"
          onClick={startDeal}
          disabled={totalCount < 4 || wolfTotal === 0 || wolfTotal >= goodTotal}
          className="w-full max-w-md px-6 py-3 text-base font-medium bg-gray-900 text-white rounded-full shadow-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          <Shuffle className="w-5 h-5" />
          {t('setup.dealStart')}
        </button>
      </div>
    </div>
  )
}

export default Werewolf
