import React from 'react'

export type StatusLevel = 'success' | 'warning' | 'danger' | 'info' | 'neutral'

export interface StatusBadgeProps {
  level: StatusLevel
  label: string
  dot?: boolean
  className?: string
}

const STYLES: Record<StatusLevel, string> = {
  success: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  warning: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
  danger:  'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  info:    'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  neutral: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400',
}

const DOT_STYLES: Record<StatusLevel, string> = {
  success: 'bg-green-500',
  warning: 'bg-amber-500',
  danger:  'bg-red-500',
  info:    'bg-blue-500',
  neutral: 'bg-gray-400',
}

export default function StatusBadge({ level, label, dot = true, className = '' }: StatusBadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${STYLES[level]} ${className}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${DOT_STYLES[level]}`} />}
      {label}
    </span>
  )
}
