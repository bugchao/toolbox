import React from 'react'
import type { LucideIcon } from 'lucide-react'
import { theme } from './theme'

export interface PageHeroProps {
  /** 标题前的图标（可选） */
  icon?: LucideIcon
  /** 主标题 */
  title: React.ReactNode
  /** 副标题/描述（可选） */
  description?: React.ReactNode
  /** 外层容器 className */
  className?: string
}

/**
 * 页面顶部标题区，随浅色/暗色主题自动切换文字颜色（浅色下深色字、暗色下浅色字）
 * 用于替换各处硬编码的 text-white，避免在 light 模式下不可见
 */
const PageHero: React.FC<PageHeroProps> = ({ icon: Icon, title, description, className = '' }) => {
  return (
    <div className={`text-center ${className}`}>
      {Icon ? (
        <div className="mb-3 flex justify-center">
          <span className="inline-flex rounded-2xl bg-indigo-100 p-3 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300">
            <Icon className="h-6 w-6" />
          </span>
        </div>
      ) : null}
      <h1 className={`text-3xl font-bold mb-2 ${theme.text}`}>{title}</h1>
      {description != null && (
        <p className={`${theme.textMuted} opacity-90`}>{description}</p>
      )}
    </div>
  )
}

export default PageHero
