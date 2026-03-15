import React from 'react'
import { cn } from '../lib/cn'
import { useBackgroundVisibility } from './BackgroundVisibilityContext'

export interface GlobalBackgroundProps {
  /** 外层 className，通常不需要传 */
  className?: string
}

/**
 * 全局背景层：随 html.dark 切换 light / dark；受「背景开关」控制，关闭时为纯色
 */
const GlobalBackground: React.FC<GlobalBackgroundProps> = ({ className = '' }) => {
  const { visible } = useBackgroundVisibility()

  return (
    <div
      aria-hidden
      className={cn(
        'fixed inset-0 -z-10 min-h-screen w-full transition-colors duration-300',
        visible
          ? [
              'bg-gradient-to-br from-slate-50 via-indigo-50/40 to-white',
              'dark:from-gray-950 dark:via-indigo-950/50 dark:to-gray-900',
            ].join(' ')
          : 'bg-gray-100 dark:bg-gray-900',
        className
      )}
    />
  )
}

export default GlobalBackground
