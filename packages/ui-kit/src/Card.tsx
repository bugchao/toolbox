import React from 'react'

export interface CardProps {
  children: React.ReactNode
  /** 是否带内边距（默认 true） */
  padded?: boolean
  className?: string
  as?: 'div' | 'section' | 'article'
}

/**
 * 卡片容器，统一浅色/暗色主题
 * 依赖应用层 html.dark 切换，Tailwind content 需包含 ui-kit
 */
const Card: React.FC<CardProps> = ({
  children,
  padded = true,
  className = '',
  as: Component = 'div',
}) => {
  return (
    <Component
      className={[
        'rounded-xl',
        'bg-white dark:bg-gray-800',
        'shadow-lg dark:shadow-black/20',
        'border border-gray-200 dark:border-gray-700',
        padded ? 'p-6 sm:p-8' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </Component>
  )
}

export default Card
