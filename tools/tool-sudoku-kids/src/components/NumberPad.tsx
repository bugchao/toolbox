import React from 'react'
import { Button } from '@toolbox/ui-kit'
import { Eraser, Lightbulb, Pencil, Undo2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export type NumberPadProps = {
  size: number
  mode: 'confirm' | 'pencil'
  canUndo: boolean
  hasSelection: boolean
  onNumber: (n: number) => void
  onErase: () => void
  onUndo: () => void
  onHint: () => void
  onToggleMode: () => void
}

const NumberPad: React.FC<NumberPadProps> = ({
  size,
  mode,
  canUndo,
  hasSelection,
  onNumber,
  onErase,
  onUndo,
  onHint,
  onToggleMode,
}) => {
  const { t } = useTranslation('toolSudokuKids')

  return (
    <div className="space-y-3">
      <div
        className="grid gap-2"
        style={{
          gridTemplateColumns: `repeat(${size <= 5 ? size : Math.ceil(size / 2)}, minmax(0, 1fr))`,
        }}
      >
        {Array.from({ length: size }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onNumber(n)}
            disabled={!hasSelection}
            className="h-12 rounded-xl bg-indigo-50 text-xl font-bold text-indigo-700 transition-colors hover:bg-indigo-100 disabled:opacity-40 disabled:cursor-not-allowed dark:bg-indigo-900/40 dark:text-indigo-200 dark:hover:bg-indigo-900/60"
          >
            {n}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant={mode === 'pencil' ? 'primary' : 'secondary'}
          size="sm"
          onClick={onToggleMode}
        >
          <span className="inline-flex items-center gap-1.5">
            <Pencil className="h-4 w-4" />
            {t('actions.pencil')}
          </span>
        </Button>
        <Button variant="secondary" size="sm" onClick={onErase} disabled={!hasSelection}>
          <span className="inline-flex items-center gap-1.5">
            <Eraser className="h-4 w-4" />
            {t('actions.erase')}
          </span>
        </Button>
        <Button variant="secondary" size="sm" onClick={onUndo} disabled={!canUndo}>
          <span className="inline-flex items-center gap-1.5">
            <Undo2 className="h-4 w-4" />
            {t('actions.undo')}
          </span>
        </Button>
        <Button variant="ghost" size="sm" onClick={onHint} disabled={!hasSelection}>
          <span className="inline-flex items-center gap-1.5">
            <Lightbulb className="h-4 w-4" />
            {t('actions.hint')}
          </span>
        </Button>
      </div>
    </div>
  )
}

export default NumberPad
