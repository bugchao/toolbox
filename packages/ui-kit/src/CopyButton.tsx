import React, { useCallback, useState } from 'react'
import { Check, Copy } from 'lucide-react'
import Button, { type ButtonProps } from './Button'

export interface CopyButtonProps {
  /** 要复制到剪贴板的内容 */
  value: string
  /** 未复制时的文案（icon 变体作为 title/aria-label，button 变体作为可见文案） */
  label?: string
  /** 复制成功后短暂展示的文案 */
  copiedLabel?: string
  size?: 'sm' | 'md'
  /** icon：纯图标按钮（默认）；button：复用 <Button> 的样式与 variant 体系；inline：无背景的图标+文案行内链接 */
  variant?: 'icon' | 'button' | 'inline'
  /** 仅 variant="button" 时生效，透传给内部 <Button> 的 variant，默认 secondary */
  buttonVariant?: ButtonProps['variant']
  disabled?: boolean
  className?: string
  onCopied?: () => void
}

const ICON_SIZE: Record<NonNullable<CopyButtonProps['size']>, string> = {
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
}

/**
 * 统一的复制按钮：封装 clipboard 写入 + 复制成功态图标切换 + 自动复位。
 * 替代各工具内重复的 useState(copied) + setTimeout 逻辑。
 */
export default function CopyButton({
  value,
  label = 'Copy',
  copiedLabel = 'Copied',
  size = 'md',
  variant = 'icon',
  buttonVariant = 'secondary',
  disabled = false,
  className = '',
  onCopied,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      onCopied?.()
      window.setTimeout(() => setCopied(false), 1200)
    } catch {
      /* 剪贴板权限被拒绝时静默失败，不打断用户操作 */
    }
  }, [value, onCopied])

  const icon = copied ? (
    <Check className={ICON_SIZE[size]} />
  ) : (
    <Copy className={ICON_SIZE[size]} />
  )

  if (variant === 'button') {
    return (
      <Button
        type="button"
        variant={buttonVariant}
        size={size === 'sm' ? 'sm' : 'md'}
        disabled={disabled}
        onClick={() => void handleCopy()}
        className={className}
      >
        <span className="inline-flex items-center gap-1.5">
          {icon}
          {copied ? copiedLabel : label}
        </span>
      </Button>
    )
  }

  if (variant === 'inline') {
    return (
      <button
        type="button"
        onClick={() => void handleCopy()}
        disabled={disabled}
        className={`inline-flex items-center gap-1 text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:pointer-events-none dark:text-gray-400 dark:hover:text-gray-200 transition-colors ${className}`}
      >
        {icon}
        {copied ? copiedLabel : label}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={() => void handleCopy()}
      disabled={disabled}
      title={copied ? copiedLabel : label}
      aria-label={copied ? copiedLabel : label}
      className={`inline-flex items-center justify-center rounded-md p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:pointer-events-none dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 transition-colors ${className}`}
    >
      {icon}
    </button>
  )
}
