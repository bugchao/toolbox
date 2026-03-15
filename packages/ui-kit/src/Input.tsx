import React from 'react'

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** 尺寸 */
  size?: 'sm' | 'md' | 'lg'
  /** 错误状态 */
  error?: boolean
}

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-3 py-2',
  lg: 'px-4 py-3 text-base',
}

/**
 * 输入框，统一浅色/暗色主题与 focus 样式
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ size = 'md', error = false, className = '', ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={[
          'w-full rounded-lg font-sans text-gray-900 dark:text-gray-100',
          'bg-white dark:bg-gray-700',
          'border transition-colors',
          'placeholder:text-gray-400 dark:placeholder:text-gray-500',
          'focus:outline-none focus:ring-2 focus:ring-offset-0',
          error
            ? 'border-red-500 dark:border-red-400 focus:ring-red-500 dark:focus:ring-red-400'
            : 'border-gray-300 dark:border-gray-600 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400',
          sizeClasses[size],
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      />
    )
  }
)

Input.displayName = 'Input'

export default Input
