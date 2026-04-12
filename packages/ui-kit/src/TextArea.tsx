import React from 'react'

export interface TextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  size?: 'sm' | 'md' | 'lg'
  error?: boolean
}

const sizeClasses = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-3',
  lg: 'px-5 py-4 text-base',
}

const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ size = 'md', error = false, className = '', ...props }, ref) => (
    <textarea
      ref={ref}
      className={[
        'w-full rounded-2xl font-sans text-gray-900 dark:text-gray-100',
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
)

TextArea.displayName = 'TextArea'

export default TextArea
