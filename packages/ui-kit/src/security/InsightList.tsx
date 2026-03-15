import React from 'react'
import Card from '../Card'
import { cn } from '../lib/cn'
import RiskBadge from './RiskBadge'
import type { InsightItem } from './types'

export interface InsightListProps {
  items: InsightItem[]
  title?: React.ReactNode
  emptyText?: React.ReactNode
  getLevelLabel?: (level: InsightItem['level']) => string
  className?: string
}

const InsightList: React.FC<InsightListProps> = ({
  items,
  title,
  emptyText,
  getLevelLabel = (level) => level,
  className = '',
}) => {
  return (
    <Card className={className}>
      {title ? (
        <div className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</div>
      ) : null}
      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 px-4 py-5 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
          {emptyText}
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => (
            <div
              key={item.id ?? `${item.title}-${index}`}
              className={cn(
                'rounded-2xl border border-gray-200 px-4 py-4 dark:border-gray-700',
                'bg-white/70 dark:bg-gray-900/20'
              )}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{item.title}</div>
                <RiskBadge level={item.level} label={getLevelLabel(item.level)} />
              </div>
              <div className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">{item.description}</div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

export default InsightList
