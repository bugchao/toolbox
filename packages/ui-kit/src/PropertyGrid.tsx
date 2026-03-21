import React from 'react'
import { cn } from './lib/cn'

export interface PropertyGridItem {
  label: React.ReactNode
  value: React.ReactNode
  tone?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
}

export interface PropertyGridProps {
  items: PropertyGridItem[]
  className?: string
}

const toneClasses: Record<NonNullable<PropertyGridItem['tone']>, string> = {
  default:
    'border-gray-200 bg-white text-gray-900 dark:border-gray-700 dark:bg-gray-900/60 dark:text-gray-100',
  primary:
    'border-indigo-200 bg-indigo-50 text-indigo-950 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-100',
  success:
    'border-emerald-200 bg-emerald-50 text-emerald-950 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-100',
  warning:
    'border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100',
  danger:
    'border-rose-200 bg-rose-50 text-rose-950 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-100',
}

const PropertyGrid: React.FC<PropertyGridProps> = ({ items, className = '' }) => {
  if (!items.length) return null

  return (
    <div className={cn('grid gap-3 sm:grid-cols-2 xl:grid-cols-4', className)}>
      {items.map((item, index) => (
        <div
          key={`${index}-${String(item.label)}`}
          className={cn(
            'rounded-2xl border px-4 py-3 shadow-sm',
            toneClasses[item.tone ?? 'default']
          )}
        >
          <div className="text-xs font-medium uppercase tracking-[0.18em] opacity-70">{item.label}</div>
          <div className="mt-2 break-words text-sm font-semibold leading-6">{item.value}</div>
        </div>
      ))}
    </div>
  )
}

export default PropertyGrid
