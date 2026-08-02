import React from 'react'

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const SIZE_CLASSES: Record<NonNullable<SpinnerProps['size']>, string> = {
  sm: 'w-4 h-4 border-2',
  md: 'w-5 h-5 border-2',
  lg: 'w-8 h-8 border-[3px]',
}

/**
 * 统一的旋转 loading 指示器，替代各工具里重复的
 * `border-2 border-t-transparent rounded-full animate-spin` 手写样式。
 * 颜色继承自 currentColor，放进带 text-* 的容器即可换色。
 */
export default function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label="loading"
      className={`inline-block shrink-0 rounded-full border-current border-t-transparent animate-spin ${SIZE_CLASSES[size]} ${className}`}
    />
  )
}
