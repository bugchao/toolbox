import React, { useCallback, useEffect, useState } from 'react'
import { Button, Card, PageHero, ParticlesBackground } from '@toolbox/ui-kit'
import { ChevronLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import LevelMap from './components/LevelMap'
import Board from './components/Board'
import NumberPad from './components/NumberPad'
import CompletionDialog from './components/CompletionDialog'
import StarRating from './components/StarRating'
import { getLevel, nextLevel } from './lib/levels'
import { computeStars } from './lib/scoring'
import { useSudokuGame } from './state/useSudokuGame'
import { useProgress } from './state/useProgress'
import type { Level } from './lib/types'

const SudokuKids: React.FC = () => {
  const { t } = useTranslation('toolSudokuKids')
  const { progress, bumpBest } = useProgress()
  const [active, setActive] = useState<Level | null>(null)

  return (
    <div className="relative min-h-[60vh]">
      <ParticlesBackground preset="minimal" className="absolute inset-0" />
      <div className="relative z-10 space-y-6">
        <PageHero title={t('title')} description={t('description')} />

        {active ? (
          <GameScreen
            level={active}
            onBack={() => setActive(null)}
            onComplete={(stars) => bumpBest(active.id, stars)}
            onAdvance={(lv) => setActive(lv)}
          />
        ) : (
          <LevelMap best={progress.best} onPick={(lv) => setActive(lv)} />
        )}
      </div>
    </div>
  )
}

const GameScreen: React.FC<{
  level: Level
  onBack: () => void
  onComplete: (stars: number) => void
  onAdvance: (lv: Level) => void
}> = ({ level, onBack, onComplete, onAdvance }) => {
  const { t } = useTranslation('toolSudokuKids')
  const game = useSudokuGame(level)
  const [shownComplete, setShownComplete] = useState(false)

  // 关卡切换重置弹窗状态
  useEffect(() => setShownComplete(false), [level.id])

  // 完成时上报 + 弹窗
  useEffect(() => {
    if (game.isComplete && !shownComplete) {
      const stars = computeStars(game.errors, game.hints)
      onComplete(stars)
      setShownComplete(true)
    }
  }, [game.isComplete, game.errors, game.hints, shownComplete, onComplete])

  // 键盘事件
  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (!game.selected) return
      const { row, col } = game.selected
      if (e.key >= '1' && e.key <= '9') {
        const n = Number(e.key)
        if (n <= game.size) {
          game.setValue(row, col, n)
          e.preventDefault()
        }
      } else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
        game.clearCell(row, col)
        e.preventDefault()
      } else if (e.key === 'n' || e.key === 'N') {
        game.toggleMode()
        e.preventDefault()
      } else if (e.key.startsWith('Arrow')) {
        let nr = row
        let nc = col
        if (e.key === 'ArrowUp') nr = Math.max(0, row - 1)
        if (e.key === 'ArrowDown') nr = Math.min(game.size - 1, row + 1)
        if (e.key === 'ArrowLeft') nc = Math.max(0, col - 1)
        if (e.key === 'ArrowRight') nc = Math.min(game.size - 1, col + 1)
        if (nr !== row || nc !== col) {
          game.select(nr, nc)
          e.preventDefault()
        }
      }
    },
    [game],
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [handleKey])

  const stars = game.isComplete ? computeStars(game.errors, game.hints) : 0
  const next = nextLevel(level)

  return (
    <div className="space-y-4">
      <Card padded={false} className="px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <span className="inline-flex items-center gap-1.5">
              <ChevronLeft className="h-4 w-4" />
              {t('game.backToMap')}
            </span>
          </Button>
          <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            {t(`difficulty.${level.difficulty}`)} · #{level.index}
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
            <span title={t('game.errors')}>
              ❌ <span className="font-bold">{game.errors}</span>
            </span>
            <span title={t('game.hints')}>
              💡 <span className="font-bold">{game.hints}</span>
            </span>
            <StarRating
              stars={Math.max(1, 3 - game.errors - game.hints)}
              size="sm"
            />
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[auto_1fr]">
        <div className="flex justify-center">
          <Board
            entries={game.entries}
            solution={game.solution}
            spec={game.spec}
            selected={game.selected}
            onSelect={game.select}
          />
        </div>
        <Card>
          <NumberPad
            size={game.size}
            mode={game.mode}
            canUndo={game.canUndo}
            hasSelection={!!game.selected}
            onNumber={(n) => {
              if (game.selected) game.setValue(game.selected.row, game.selected.col, n)
            }}
            onErase={() => {
              if (game.selected) game.clearCell(game.selected.row, game.selected.col)
            }}
            onUndo={game.undo}
            onHint={game.hint}
            onToggleMode={game.toggleMode}
          />
          <div className="mt-4 rounded-lg bg-indigo-50/60 p-3 text-xs leading-relaxed text-indigo-900 dark:bg-indigo-900/30 dark:text-indigo-200">
            {t('game.tips')}
          </div>
        </Card>
      </div>

      {game.isComplete && shownComplete && (
        <CompletionDialog
          stars={stars}
          errors={game.errors}
          hints={game.hints}
          hasNext={!!next}
          onReplay={() => {
            game.reset()
            setShownComplete(false)
          }}
          onNext={() => next && onAdvance(next)}
          onBackToMap={onBack}
        />
      )}
    </div>
  )
}

export default SudokuKids
