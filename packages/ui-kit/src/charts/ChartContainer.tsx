import React from 'react'
import { ResponsiveContainer } from 'recharts'
import { theme } from '../theme'
import { cn } from '../lib/cn'

export interface ChartContainerProps {
  children: React.ReactElement
  /** 图表外层 className */
  className?: string
  /** 标题（可选） */
  title?: React.ReactNode
  /** 高度（默认 300） */
  height?: number
}

/**
 * 响应式图表容器，统一宽高与主题；内部放 Recharts 的 LineChart/BarChart/PieChart 等
 */
const ChartContainer: React.FC<ChartContainerProps> = ({
  children,
  className = '',
  title,
  height = 300,
}) => {
  return (
    <div className={cn('w-full', className)}>
      {title && (
        <div
          className={cn(
            'text-sm font-medium mb-2',
            theme.text
          )}
        >
          {title}
        </div>
      )}
      <ResponsiveContainer width="100%" height={height}>
        {children}
      </ResponsiveContainer>
    </div>
  )
}

export default ChartContainer
