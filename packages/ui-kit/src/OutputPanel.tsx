import React from 'react'
import CopyButton from './CopyButton'

export interface OutputPanelProps {
  label: React.ReactNode
  value: string
  placeholder?: string
  copyLabel: string
  copiedLabel?: string
  copyDisabled?: boolean
  /** 复制按钮前的额外操作，如下载按钮 */
  actions?: React.ReactNode
  size?: 'sm' | 'md'
  className?: string
}

const LABEL_CLASS: Record<NonNullable<OutputPanelProps['size']>, string> = {
  sm: 'text-sm font-medium text-gray-700 dark:text-gray-200',
  md: 'text-lg font-semibold text-gray-900 dark:text-gray-100',
}

const PRE_CLASS: Record<NonNullable<OutputPanelProps['size']>, string> = {
  sm: 'overflow-x-auto rounded-md border border-gray-200 bg-gray-50 p-3 text-xs text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100',
  md: 'overflow-auto rounded-lg border border-gray-200 bg-gray-50 p-4 font-mono text-sm leading-relaxed text-gray-800 dark:border-gray-700 dark:bg-gray-900/40 dark:text-gray-100',
}

/**
 * 统一的"标题/标签 + 复制按钮 + 只读代码块"输出面板，替代各工具内重复的同款 JSX。
 */
export default function OutputPanel({
  label,
  value,
  placeholder = '',
  copyLabel,
  copiedLabel,
  copyDisabled,
  actions,
  size = 'sm',
  className = '',
}: OutputPanelProps) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className={LABEL_CLASS[size]}>{label}</span>
        <div className="flex items-center gap-2">
          {actions}
          <CopyButton
            variant="button"
            buttonVariant="ghost"
            size="sm"
            value={value}
            label={copyLabel}
            copiedLabel={copiedLabel}
            disabled={copyDisabled ?? !value}
          />
        </div>
      </div>
      <pre className={className || PRE_CLASS[size]}>{value || placeholder}</pre>
    </div>
  )
}
