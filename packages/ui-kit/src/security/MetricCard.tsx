import React from 'react'
import type { LucideIcon } from 'lucide-react'
import Card from '../Card'
import { cn } from '../lib/cn'
import RiskBadge from './RiskBadge'
import type { RiskLevel } from './types'

export interface MetricCardProps {
  title: string
  value: React.ReactNode
  hint?: React.ReactNode
  icon?: LucideIcon
  level?: RiskLevel
  levelLabel?: string
  className?: string
}

const iconTone: Record<RiskLevel, string> = {
  info: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  low: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  critical: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  hint,
  icon: Icon,
  level = 'info',
  levelLabel,
  className = '',
}) => {
  return (
    <Card className={cn('h-full', className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</div>
          <div className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">{value}</div>
          {hint ? (
            <div className="text-sm leading-6 text-gray-600 dark:text-gray-300">{hint}</div>
          ) : null}
        </div>
        <div className="flex flex-col items-end gap-3">
          {levelLabel ? <RiskBadge level={level} label={levelLabel} /> : null}
          {Icon ? (
            <span className={cn('inline-flex rounded-2xl p-3', iconTone[level])}>
              <Icon className="h-5 w-5" />
            </span>
          ) : null}
        </div>
      </div>
    </Card>
  )
}

export default MetricCard
