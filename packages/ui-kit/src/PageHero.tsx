import React from 'react'
import type { LucideIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { theme } from './theme'

type PageHeroBase = {
  /** 标题前的图标（可选） */
  icon?: LucideIcon
  /** 外层容器 className */
  className?: string
}

export type PageHeroProps = PageHeroBase &
  (
    | {
        /** 主标题 */
        title: React.ReactNode
        /** 副标题/描述（可选） */
        description?: React.ReactNode
      }
    | ({
        titleKey: string
        descriptionKey?: string
      } & (
        | { namespace: string; i18nNamespace?: string }
        | { i18nNamespace: string; namespace?: string }
      ))
  )

function PageHeroLayout({
  icon: Icon,
  title,
  description,
  className = '',
}: {
  icon?: LucideIcon
  title: React.ReactNode
  description?: React.ReactNode
  className?: string
}) {
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

function PageHeroI18n(
  props: Extract<PageHeroProps, { titleKey: string }>
) {
  const {
    icon,
    titleKey,
    descriptionKey,
    namespace,
    i18nNamespace,
    className = '',
  } = props
  const ns = i18nNamespace ?? namespace
  const { t } = useTranslation(ns)
  return (
    <PageHeroLayout
      icon={icon}
      title={t(titleKey)}
      description={descriptionKey != null ? t(descriptionKey) : undefined}
      className={className}
    />
  )
}

/**
 * 页面顶部标题区，随浅色/暗色主题自动切换文字颜色（浅色下深色字、暗色下浅色字）
 * 用于替换各处硬编码的 text-white，避免在 light 模式下不可见
 */
const PageHero: React.FC<PageHeroProps> = (props) => {
  if ('titleKey' in props) {
    return <PageHeroI18n {...props} />
  }
  const { icon, title, description, className } = props
  return (
    <PageHeroLayout
      icon={icon}
      title={title}
      description={description}
      className={className}
    />
  )
}

export default PageHero
