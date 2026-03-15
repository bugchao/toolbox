import React from 'react'
import { cn } from '../lib/cn'
import type { RiskLevel } from './types'

export interface RiskBadgeProps {
  level: RiskLevel
  label: string
  className?: string
}

const toneClasses: Record<RiskLevel, string> = {
  info: 'bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-800/80 dark:text-slate-200 dark:ring-slate-700',
  low: 'bg-emerald-100 text-emerald-700 ring-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:ring-emerald-800',
  medium: 'bg-amber-100 text-amber-700 ring-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:ring-amber-800',
  high: 'bg-orange-100 text-orange-700 ring-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:ring-orange-800',
  critical: 'bg-rose-100 text-rose-700 ring-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:ring-rose-800',
}

const RiskBadge: React.FC<RiskBadgeProps> = ({ level, label, className = '' }) => {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset',
        toneClasses[level],
        className
      )}
    >
      {label}
    </span>
  )
}

export default RiskBadge
