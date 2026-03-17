import React from 'react'
import type { LucideIcon } from 'lucide-react'
import { AlertCircle, CheckCircle2, Info, TriangleAlert } from 'lucide-react'
import { cn } from './lib/cn'

export interface NoticeCardProps {
  title: React.ReactNode
  description?: React.ReactNode
  tone?: 'info' | 'success' | 'warning' | 'danger'
  icon?: LucideIcon
  className?: string
}

const toneMap = {
  info: {
    icon: Info,
    wrap: 'border-sky-200 bg-sky-50 text-sky-950 dark:border-sky-800 dark:bg-sky-950/30 dark:text-sky-100',
    desc: 'text-sky-800 dark:text-sky-200',
  },
  success: {
    icon: CheckCircle2,
    wrap: 'border-emerald-200 bg-emerald-50 text-emerald-950 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-100',
    desc: 'text-emerald-800 dark:text-emerald-200',
  },
  warning: {
    icon: TriangleAlert,
    wrap: 'border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100',
    desc: 'text-amber-800 dark:text-amber-200',
  },
  danger: {
    icon: AlertCircle,
    wrap: 'border-rose-200 bg-rose-50 text-rose-950 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-100',
    desc: 'text-rose-800 dark:text-rose-200',
  },
} as const

const NoticeCard: React.FC<NoticeCardProps> = ({
  title,
  description,
  tone = 'info',
  icon,
  className = '',
}) => {
  const meta = toneMap[tone]
  const Icon = icon ?? meta.icon

  return (
    <div className={cn('rounded-2xl border px-4 py-4 shadow-sm', meta.wrap, className)}>
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 h-5 w-5 flex-shrink-0" />
        <div className="min-w-0">
          <div className="text-sm font-semibold">{title}</div>
          {description ? <div className={cn('mt-1 text-sm leading-6', meta.desc)}>{description}</div> : null}
        </div>
      </div>
    </div>
  )
}

export default NoticeCard
