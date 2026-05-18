import React, { useCallback, useMemo, useState } from 'react'
import {
  UserSearch,
  Users,
  Eye,
  EyeOff,
  ChevronRight,
  X,
  Trophy,
  Skull,
  RotateCcw,
  Plus,
  Trash2,
  ChevronDown,
  Shuffle,
  Crown,
} from 'lucide-react'
import { PageHero } from '@toolbox/ui-kit'
import { useToolStorage } from '@toolbox/storage'
import { useTranslation } from 'react-i18next'

import { BUILT_IN_WORD_PAIRS, type WordPair } from './wordPairs'

const NAMESPACE = 'toolUndercoverGame'

type Role = 'civilian' | 'undercover' | 'whiteboard'
type Stage = 'setup' | 'reveal' | 'discuss' | 'vote' | 'reveal-elim' | 'ended'
type Winner = 'civilian' | 'undercover' | null

interface Player {
  id: string
  name: string
  role: Role
  word: string | null // null for whiteboard
  alive: boolean
}

interface ActiveGame {
  players: Player[]
  pair: { civilian: { zh: string; en: string }; undercover: { zh: string; en: string } }
  stage: Stage
  currentRevealIdx: number
  revealVisible: boolean
  lastEliminatedId: string | null
  winner: Winner
  round: number
}

interface CustomPair {
  id: string
  civilian: string
  undercover: string
}

interface PersistedState {
  game: ActiveGame | null
  defaults: {
    playerCount: number
    undercoverCount: number
    includeWhiteboard: boolean
  }
  customPairs: CustomPair[]
}

const DEFAULT_STATE: PersistedState = {
  game: null,
  defaults: {
    playerCount: 6,
    undercoverCount: 1,
    includeWhiteboard: false,
  },
  customPairs: [],
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

const ROLE_COLOR: Record<Role, string> = {
  civilian: 'bg-sky-100 text-sky-700 border-sky-300',
  undercover: 'bg-rose-100 text-rose-700 border-rose-300',
  whiteboard: 'bg-amber-100 text-amber-700 border-amber-300',
}

const UndercoverGame: React.FC = () => {
  const { t, i18n } = useTranslation(NAMESPACE)
  const lang: 'zh' | 'en' = (i18n.resolvedLanguage || i18n.language || 'zh').startsWith('zh') ? 'zh' : 'en'

  const { data, save, loading } = useToolStorage<PersistedState>(
    'undercover-game',
    'state',
    DEFAULT_STATE,
  )

  const [customOpen, setCustomOpen] = useState(false)
  const [draftCustom, setDraftCustom] = useState({ civilian: '', undercover: '' })
  const [playerNames, setPlayerNames] = useState<string[]>([])

  const game = data.game

  // Sync local playerNames buffer to defaults.playerCount when switching to setup mode
  React.useEffect(() => {
    if (!game) {
      setPlayerNames((prev) => {
        const targetLen = data.defaults.playerCount
        if (prev.length === targetLen) return prev
        if (prev.length > targetLen) return prev.slice(0, targetLen)
        return [...prev, ...Array.from({ length: targetLen - prev.length }, () => '')]
      })
    }
  }, [game, data.defaults.playerCount])

  // ── Setup phase helpers ────────────────────────────────────
  const setPlayerCount = (n: number) => {
    const clamped = Math.min(Math.max(n, 3), 12)
    const maxUnder = Math.max(1, Math.floor((clamped - 1) / 2))
    const nextUnder = Math.min(data.defaults.undercoverCount, maxUnder)
    void save({
      ...data,
      defaults: { ...data.defaults, playerCount: clamped, undercoverCount: nextUnder },
    })
  }
  const setUndercoverCount = (n: number) => {
    const max = Math.max(1, Math.floor((data.defaults.playerCount - 1) / 2))
    const clamped = Math.min(Math.max(n, 1), max)
    void save({ ...data, defaults: { ...data.defaults, undercoverCount: clamped } })
  }
  const setIncludeWhiteboard = (v: boolean) => {
    void save({ ...data, defaults: { ...data.defaults, includeWhiteboard: v } })
  }

  const pickPair = useCallback((): WordPair | null => {
    const customWp: WordPair[] = data.customPairs.map((c) => ({
      id: c.id,
      category: 'misc',
      civilian: { zh: c.civilian, en: c.civilian },
      undercover: { zh: c.undercover, en: c.undercover },
    }))
    const pool = [...BUILT_IN_WORD_PAIRS, ...customWp]
    if (pool.length === 0) return null
    return pool[cryptoRandInt(pool.length)]
  }, [data.customPairs])

  const startGame = useCallback(() => {
    const { playerCount, undercoverCount, includeWhiteboard } = data.defaults
    const pair = pickPair()
    if (!pair) return

    // 50/50 chance to swap which side is "civilian" word to keep majority not always pointing same direction.
    // Actually we keep civilian as majority by definition; swap only randomizes which raw word is civilian.
    const swap = cryptoRandInt(2) === 0
    const civilianText = swap ? pair.undercover : pair.civilian
    const undercoverText = swap ? pair.civilian : pair.undercover

    // Roles: undercoverCount undercover, optionally 1 whiteboard, rest civilians
    const total = playerCount
    const roles: Role[] = []
    for (let i = 0; i < undercoverCount; i++) roles.push('undercover')
    if (includeWhiteboard) roles.push('whiteboard')
    while (roles.length < total) roles.push('civilian')
    const shuffledRoles = shuffle(roles)

    const players: Player[] = Array.from({ length: total }, (_, i) => {
      const role = shuffledRoles[i]
      const word =
        role === 'whiteboard'
          ? null
          : role === 'undercover'
            ? undercoverText[lang]
            : civilianText[lang]
      const fallbackName = (lang === 'zh' ? '玩家 ' : 'Player ') + (i + 1)
      const supplied = (playerNames[i] || '').trim()
      return {
        id: `p${i}`,
        name: supplied || fallbackName,
        role,
        word,
        alive: true,
      }
    })

    void save({
      ...data,
      game: {
        players,
        pair: { civilian: civilianText, undercover: undercoverText },
        stage: 'reveal',
        currentRevealIdx: 0,
        revealVisible: false,
        lastEliminatedId: null,
        winner: null,
        round: 1,
      },
    })
  }, [data, save, pickPair, playerNames, lang])

  // ── Reveal phase ──────────────────────────────────────────
  const flipCard = () => {
    if (!game || game.stage !== 'reveal') return
    void save({ ...data, game: { ...game, revealVisible: !game.revealVisible } })
  }
  const passNext = () => {
    if (!game || game.stage !== 'reveal') return
    const nextIdx = game.currentRevealIdx + 1
    if (nextIdx >= game.players.length) {
      void save({ ...data, game: { ...game, stage: 'discuss', revealVisible: false } })
    } else {
      void save({
        ...data,
        game: { ...game, currentRevealIdx: nextIdx, revealVisible: false },
      })
    }
  }

  // ── Voting / elimination ─────────────────────────────────
  const goToVote = () => {
    if (!game || game.stage !== 'discuss') return
    void save({ ...data, game: { ...game, stage: 'vote' } })
  }

  const checkWinner = (players: Player[]): Winner => {
    const aliveUndercover = players.filter((p) => p.alive && p.role === 'undercover').length
    const aliveNonUndercover = players.filter((p) => p.alive && p.role !== 'undercover').length
    if (aliveUndercover === 0) return 'civilian'
    if (aliveUndercover >= aliveNonUndercover) return 'undercover'
    return null
  }

  const eliminate = (playerId: string) => {
    if (!game || game.stage !== 'vote') return
    const nextPlayers = game.players.map((p) => (p.id === playerId ? { ...p, alive: false } : p))
    const winner = checkWinner(nextPlayers)
    void save({
      ...data,
      game: {
        ...game,
        players: nextPlayers,
        lastEliminatedId: playerId,
        stage: winner ? 'ended' : 'reveal-elim',
        winner,
      },
    })
  }

  const nextRound = () => {
    if (!game || game.stage !== 'reveal-elim') return
    void save({ ...data, game: { ...game, stage: 'discuss', round: game.round + 1 } })
  }

  const endGame = () => {
    void save({ ...data, game: null })
  }

  const playAgainSamePlayers = () => {
    if (!game) return
    const names = game.players.map((p) => p.name)
    setPlayerNames(names)
    void save({ ...data, game: null })
  }

  // ── Custom pairs ──────────────────────────────────────────
  const addCustomPair = () => {
    const civ = draftCustom.civilian.trim()
    const und = draftCustom.undercover.trim()
    if (!civ || !und) return
    const item: CustomPair = {
      id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      civilian: civ,
      undercover: und,
    }
    void save({ ...data, customPairs: [...data.customPairs, item] })
    setDraftCustom({ civilian: '', undercover: '' })
  }
  const removeCustomPair = (id: string) => {
    void save({ ...data, customPairs: data.customPairs.filter((c) => c.id !== id) })
  }

  // ── Memo derived values ───────────────────────────────────
  const alivePlayers = useMemo(() => (game ? game.players.filter((p) => p.alive) : []), [game])
  const eliminatedPlayer = useMemo(
    () => (game?.lastEliminatedId ? game.players.find((p) => p.id === game.lastEliminatedId) : null),
    [game],
  )

  if (loading) {
    return (
      <div className="w-full space-y-6">
        <PageHero title={t('title')} description={t('description')} />
        <div className="text-center text-sm text-gray-400 py-12">{t('loading')}</div>
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════════
  // Render branches by stage
  // ═══════════════════════════════════════════════════════════

  if (!game) {
    // ── SETUP ────────────────────────────────────────────────
    const { playerCount, undercoverCount, includeWhiteboard } = data.defaults
    const maxUnder = Math.max(1, Math.floor((playerCount - 1) / 2))
    return (
      <div className="w-full space-y-6 pb-24">
        <PageHero title={t('title')} description={t('description')} />

        {/* Setup */}
        <section className="rounded-lg border border-gray-200 bg-white p-5 space-y-5">
          <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
            <Users className="w-4 h-4" /> {t('setup.title')}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-700 block mb-1">
                {t('setup.playerCount')}: <span className="font-mono">{playerCount}</span>
              </label>
              <input
                type="range"
                min={3}
                max={12}
                value={playerCount}
                onChange={(e) => setPlayerCount(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>3</span>
                <span>12</span>
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-700 block mb-1">
                {t('setup.undercoverCount')}: <span className="font-mono">{undercoverCount}</span>{' '}
                <span className="text-xs text-gray-400">({t('setup.maxHint', { max: maxUnder })})</span>
              </label>
              <input
                type="range"
                min={1}
                max={maxUnder}
                value={undercoverCount}
                onChange={(e) => setUndercoverCount(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>1</span>
                <span>{maxUnder}</span>
              </div>
            </div>
          </div>

          <label className="inline-flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={includeWhiteboard}
              onChange={(e) => setIncludeWhiteboard(e.target.checked)}
              className="rounded border-gray-300"
            />
            {t('setup.includeWhiteboard')}{' '}
            <span className="text-xs text-gray-400">{t('setup.whiteboardHint')}</span>
          </label>

          {/* Player names (optional) */}
          <div className="space-y-2">
            <p className="text-sm text-gray-700">{t('setup.playerNames')}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Array.from({ length: playerCount }).map((_, i) => (
                <input
                  key={i}
                  type="text"
                  value={playerNames[i] || ''}
                  onChange={(e) => {
                    const next = [...playerNames]
                    next[i] = e.target.value
                    setPlayerNames(next)
                  }}
                  placeholder={(lang === 'zh' ? '玩家 ' : 'Player ') + (i + 1)}
                  className="px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              ))}
            </div>
          </div>

          <div className="text-xs text-gray-400">
            {t('setup.poolStatus', { total: BUILT_IN_WORD_PAIRS.length + data.customPairs.length })}
          </div>
        </section>

        {/* Custom word pairs */}
        <section className="rounded-lg border border-gray-200 bg-white">
          <button
            type="button"
            onClick={() => setCustomOpen((v) => !v)}
            aria-expanded={customOpen}
            className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            {t('custom.title')} ({data.customPairs.length})
            <ChevronDown
              className={`w-4 h-4 ml-auto text-gray-400 transition-transform ${
                customOpen ? 'rotate-180' : ''
              }`}
            />
          </button>
          {customOpen && (
            <div className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2">
                <input
                  type="text"
                  value={draftCustom.civilian}
                  onChange={(e) => setDraftCustom({ ...draftCustom, civilian: e.target.value })}
                  placeholder={t('custom.civilianPlaceholder')}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="text"
                  value={draftCustom.undercover}
                  onChange={(e) => setDraftCustom({ ...draftCustom, undercover: e.target.value })}
                  placeholder={t('custom.undercoverPlaceholder')}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={addCustomPair}
                  disabled={!draftCustom.civilian.trim() || !draftCustom.undercover.trim()}
                  className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-300 transition-colors flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  {t('custom.add')}
                </button>
              </div>
              {data.customPairs.length > 0 ? (
                <ul className="divide-y divide-gray-100 max-h-60 overflow-y-auto">
                  {data.customPairs.map((c) => (
                    <li key={c.id} className="py-2 flex items-center gap-3 text-sm">
                      <span className="font-mono text-gray-700">{c.civilian}</span>
                      <span className="text-gray-300">↔</span>
                      <span className="font-mono text-gray-700">{c.undercover}</span>
                      <button
                        type="button"
                        onClick={() => removeCustomPair(c.id)}
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

        <div className="sticky bottom-4 z-10 flex justify-center pt-2">
          <button
            type="button"
            onClick={startGame}
            className="w-full max-w-md px-6 py-3 text-base font-medium bg-gray-900 text-white rounded-full shadow-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
          >
            <Shuffle className="w-5 h-5" />
            {t('setup.start')}
          </button>
        </div>
      </div>
    )
  }

  if (game.stage === 'reveal') {
    // ── REVEAL (pass-and-flip) ───────────────────────────────
    const player = game.players[game.currentRevealIdx]
    return (
      <div className="w-full space-y-6">
        <PageHero title={t('title')} description={t('description')} />
        <section className="rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-6 md:p-8 min-h-[360px] flex flex-col items-center justify-center text-center gap-4">
          <div className="text-xs text-gray-500 uppercase tracking-wide">
            {t('reveal.progress', { idx: game.currentRevealIdx + 1, total: game.players.length })}
          </div>
          <div className="text-base font-medium text-gray-700">
            {t('reveal.playerLabel', { name: player.name })}
          </div>

          <button
            type="button"
            onClick={flipCard}
            className={`group w-64 h-80 rounded-2xl border-2 shadow-xl flex flex-col items-center justify-center transition-all ${
              game.revealVisible
                ? 'bg-white border-gray-300'
                : 'bg-gradient-to-br from-indigo-600 to-purple-700 border-indigo-700 text-white hover:scale-105'
            }`}
            aria-label={game.revealVisible ? t('reveal.hide') : t('reveal.tap')}
          >
            {game.revealVisible ? (
              <div className="space-y-4 px-4">
                <span
                  className={`inline-block px-3 py-1 text-xs font-medium rounded-full border ${ROLE_COLOR[player.role]}`}
                >
                  {t(`role.${player.role}`)}
                </span>
                <div className="text-4xl md:text-5xl font-bold text-gray-800">
                  {player.word ?? t('reveal.blankWord')}
                </div>
                <div className="text-xs text-gray-400">{t('reveal.tapToHide')}</div>
              </div>
            ) : (
              <>
                <Eye className="w-12 h-12 mb-2 opacity-90" />
                <div className="text-lg font-medium">{t('reveal.tap')}</div>
                <div className="text-xs opacity-75 mt-1">{t('reveal.privateHint')}</div>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={passNext}
            disabled={!game.revealVisible}
            className="px-5 py-2 text-sm font-medium bg-gray-900 text-white rounded-full hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {game.currentRevealIdx + 1 === game.players.length
              ? t('reveal.allDone')
              : t('reveal.passNext')}
            <ChevronRight className="w-4 h-4" />
          </button>
        </section>

        <div className="text-center">
          <button
            type="button"
            onClick={endGame}
            className="text-xs text-gray-400 hover:text-red-500 inline-flex items-center gap-1"
          >
            <X className="w-3 h-3" /> {t('actions.abort')}
          </button>
        </div>
      </div>
    )
  }

  // For discuss/vote/reveal-elim/ended — show the player list + stage-specific action
  return (
    <div className="w-full space-y-6 pb-24">
      <PageHero title={t('title')} description={t('description')} />

      <section className="rounded-lg border border-gray-200 bg-white p-4 space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
            <UserSearch className="w-4 h-4" />
            {t('stage.round', { round: game.round })}
            <span className="text-xs text-gray-400 font-normal">
              · {t(`stageLabel.${game.stage}`)}
            </span>
          </h2>
          <span className="text-xs text-gray-500">
            {t('stage.aliveCount', {
              alive: alivePlayers.length,
              total: game.players.length,
            })}
          </span>
        </div>

        <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {game.players.map((p) => {
            const showRole = game.stage === 'ended' || !p.alive
            return (
              <li
                key={p.id}
                className={`relative rounded-lg border px-3 py-2 text-sm transition-all ${
                  p.alive
                    ? 'bg-white border-gray-200'
                    : 'bg-gray-50 border-gray-200 opacity-60'
                } ${game.stage === 'vote' && p.alive ? 'cursor-pointer hover:border-indigo-500 hover:bg-indigo-50' : ''}`}
                onClick={() => game.stage === 'vote' && p.alive && eliminate(p.id)}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${p.alive ? 'bg-emerald-500' : 'bg-gray-400'}`}
                  />
                  <span className={`font-medium ${p.alive ? 'text-gray-800' : 'text-gray-500 line-through'}`}>
                    {p.name}
                  </span>
                  {!p.alive && <Skull className="w-3 h-3 text-gray-400 ml-auto" />}
                </div>
                {showRole && (
                  <div className="mt-1 flex items-center gap-1">
                    <span
                      className={`inline-block px-1.5 py-0.5 text-xs rounded-full border ${ROLE_COLOR[p.role]}`}
                    >
                      {t(`role.${p.role}`)}
                    </span>
                    {p.word && <span className="text-xs text-gray-500 truncate">{p.word}</span>}
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      </section>

      {/* Stage-specific content */}
      {game.stage === 'discuss' && (
        <section className="rounded-lg border border-indigo-200 bg-indigo-50 p-5 text-center space-y-3">
          <p className="text-sm text-indigo-700">{t('discuss.hint')}</p>
          <button
            type="button"
            onClick={goToVote}
            className="px-5 py-2 text-sm font-medium bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors"
          >
            {t('discuss.toVote')}
          </button>
        </section>
      )}

      {game.stage === 'vote' && (
        <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-center">
          <p className="text-sm text-amber-800">{t('vote.hint')}</p>
        </section>
      )}

      {game.stage === 'reveal-elim' && eliminatedPlayer && (
        <section className="rounded-2xl border border-gray-200 bg-gradient-to-br from-rose-50 to-white p-6 md:p-8 text-center space-y-4">
          <Skull className="w-10 h-10 text-rose-500 mx-auto" />
          <h3 className="text-lg font-semibold text-gray-800">
            {t('elim.title', { name: eliminatedPlayer.name })}
          </h3>
          <div className="flex items-center justify-center gap-2">
            <span
              className={`inline-block px-3 py-1 text-sm rounded-full border ${ROLE_COLOR[eliminatedPlayer.role]}`}
            >
              {t(`role.${eliminatedPlayer.role}`)}
            </span>
            {eliminatedPlayer.word && (
              <span className="text-sm text-gray-700 font-mono">"{eliminatedPlayer.word}"</span>
            )}
          </div>
          <button
            type="button"
            onClick={nextRound}
            className="px-5 py-2 text-sm font-medium bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors"
          >
            {t('elim.continue')}
          </button>
        </section>
      )}

      {game.stage === 'ended' && game.winner && (
        <section className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-yellow-50 p-6 md:p-8 text-center space-y-4">
          <Crown className="w-12 h-12 text-amber-500 mx-auto" />
          <h3 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            {t(`winner.${game.winner}`)}
          </h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p>
              {t('winner.civilianWord')}:{' '}
              <span className="font-mono font-semibold">{game.pair.civilian[lang]}</span>
            </p>
            <p>
              {t('winner.undercoverWord')}:{' '}
              <span className="font-mono font-semibold">{game.pair.undercover[lang]}</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2 justify-center pt-2">
            <button
              type="button"
              onClick={playAgainSamePlayers}
              className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors flex items-center gap-1"
            >
              <RotateCcw className="w-4 h-4" />
              {t('winner.again')}
            </button>
            <button
              type="button"
              onClick={endGame}
              className="px-4 py-2 text-sm font-medium bg-white text-gray-700 rounded-full border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              {t('winner.exit')}
            </button>
          </div>
        </section>
      )}

      {game.stage !== 'ended' && (
        <div className="text-center">
          <button
            type="button"
            onClick={endGame}
            className="text-xs text-gray-400 hover:text-red-500 inline-flex items-center gap-1"
          >
            <X className="w-3 h-3" /> {t('actions.abort')}
          </button>
        </div>
      )}
    </div>
  )
}

export default UndercoverGame
