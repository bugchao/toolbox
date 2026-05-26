import React from 'react'
import { Lock, Sparkles } from 'lucide-react'
import { Card } from '@toolbox/ui-kit'
import { useTranslation } from 'react-i18next'
import { isUnlocked, levelsByDifficulty } from '../lib/levels'
import type { Difficulty, Level, LevelId } from '../lib/types'
import StarRating from './StarRating'

export type LevelMapProps = {
  best: Record<LevelId, number>
  onPick: (level: Level) => void
}

const DIFFICULTY_ORDER: Difficulty[] = ['easy', 'medium', 'hard']

const EMOJI: Record<Difficulty, string> = {
  easy: '🦄',
  medium: '🐯',
  hard: '🐉',
}

const ACCENT: Record<Difficulty, string> = {
  easy: 'from-pink-200 via-rose-100 to-orange-100 dark:from-pink-900/40 dark:via-rose-900/30 dark:to-orange-900/30',
  medium: 'from-amber-200 via-yellow-100 to-lime-100 dark:from-amber-900/40 dark:via-yellow-900/30 dark:to-lime-900/30',
  hard: 'from-sky-200 via-indigo-100 to-violet-100 dark:from-sky-900/40 dark:via-indigo-900/30 dark:to-violet-900/30',
}

const LevelMap: React.FC<LevelMapProps> = ({ best, onPick }) => {
  const { t } = useTranslation('toolSudokuKids')

  return (
    <div className="space-y-6">
      {DIFFICULTY_ORDER.map((d) => {
        const levels = levelsByDifficulty(d)
        return (
          <Card key={d} padded={false} className={`overflow-hidden bg-gradient-to-br ${ACCENT[d]}`}>
            <div className="px-5 pt-5 pb-3 flex items-baseline justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl" aria-hidden>
                  {EMOJI[d]}
                </span>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {t(`difficulty.${d}`)}
                </h3>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {t(`difficulty.${d}Spec`)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-3 px-5 pb-5">
              {levels.map((lv) => {
                const stars = best[lv.id] ?? 0
                const unlocked = isUnlocked(lv, best)
                return (
                  <button
                    key={lv.id}
                    type="button"
                    onClick={() => unlocked && onPick(lv)}
                    disabled={!unlocked}
                    className={[
                      'group relative aspect-square rounded-2xl border-2 transition-all',
                      unlocked
                        ? 'border-white/60 bg-white/80 dark:bg-gray-800/60 dark:border-gray-700 hover:scale-[1.04] hover:shadow-lg cursor-pointer'
                        : 'border-gray-200/60 bg-white/40 dark:bg-gray-800/30 dark:border-gray-700/60 cursor-not-allowed opacity-70',
                    ].join(' ')}
                    aria-label={`${t(`difficulty.${d}`)} ${lv.index}`}
                  >
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                      {unlocked ? (
                        <>
                          <span className="text-2xl font-extrabold text-gray-800 dark:text-gray-100">
                            {lv.index}
                          </span>
                          <StarRating stars={stars} size="sm" />
                        </>
                      ) : (
                        <Lock className="h-6 w-6 text-gray-400 dark:text-gray-500" aria-hidden />
                      )}
                    </div>
                    {stars === 3 && (
                      <span className="absolute -top-1 -right-1 rounded-full bg-amber-400 p-1 text-white shadow">
                        <Sparkles className="h-3 w-3" />
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </Card>
        )
      })}
    </div>
  )
}

export default LevelMap
