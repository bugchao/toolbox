import React from 'react'
import { Clock3, RotateCcw, Trash2 } from 'lucide-react'
import { Button, Card, RiskBadge } from '@toolbox/ui-kit'
import type { HistoryEntry } from './history'
import type { RiskLevel } from './types'

interface HistoryPanelProps<TPayload> {
  entries: HistoryEntry<TPayload>[]
  onSelect: (entry: HistoryEntry<TPayload>) => void
  onRemove: (id: string) => void
  onClear: () => void
  getLevelLabel: (level: RiskLevel) => string
  labels: {
    title: string
    empty: string
    rerun: string
    remove: string
    clear: string
  }
}

function formatWhen(timestamp: number) {
  return new Date(timestamp).toLocaleString()
}

function HistoryPanel<TPayload>({
  entries,
  onSelect,
  onRemove,
  onClear,
  getLevelLabel,
  labels,
}: HistoryPanelProps<TPayload>) {
  return (
    <Card>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">{labels.title}</div>
        {entries.length ? (
          <Button type="button" variant="ghost" size="sm" onClick={onClear}>
            <Trash2 className="mr-2 h-4 w-4" />
            {labels.clear}
          </Button>
        ) : null}
      </div>

      {entries.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 px-4 py-6 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
          {labels.empty}
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <div key={entry.id} className="rounded-2xl border border-gray-200 px-4 py-4 dark:border-gray-700">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-semibold text-gray-900 dark:text-gray-100">{entry.title}</div>
                  {entry.subtitle ? (
                    <div className="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-300">{entry.subtitle}</div>
                  ) : null}
                  <div className="mt-2 inline-flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <Clock3 className="mr-1.5 h-3.5 w-3.5" />
                    {formatWhen(entry.createdAt)}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {typeof entry.score === 'number' ? (
                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                      {entry.score}/100
                    </span>
                  ) : null}
                  {entry.level ? <RiskBadge level={entry.level} label={getLevelLabel(entry.level)} /> : null}
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button type="button" size="sm" onClick={() => onSelect(entry)}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  {labels.rerun}
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => onRemove(entry.id)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  {labels.remove}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

export default HistoryPanel
