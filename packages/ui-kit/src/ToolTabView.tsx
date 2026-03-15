import React, { useState } from 'react'
import { Search, History } from 'lucide-react'
import { cn } from './lib/cn'

export interface ToolTabViewProps {
  queryPanel: React.ReactNode
  historyPanel: React.ReactNode
  queryLabel?: string
  historyLabel?: string
  activeTab?: 'query' | 'history'
  onTabChange?: (tab: 'query' | 'history') => void
}

/**
 * ToolTabView - Tab layout for query tools.
 * 查询/历史 水平排列在顶部，内容区域在下方（上下关系）。
 */
const ToolTabView: React.FC<ToolTabViewProps> = ({
  queryPanel,
  historyPanel,
  queryLabel = '查询',
  historyLabel = '历史',
  activeTab: controlledTab,
  onTabChange,
}) => {
  const [internalTab, setInternalTab] = useState<'query' | 'history'>('query')
  const activeTab = controlledTab ?? internalTab
  const setActiveTab = (tab: 'query' | 'history') => {
    if (onTabChange) {
      onTabChange(tab)
    } else {
      setInternalTab(tab)
    }
  }

  const tabButtonClass = (isActive: boolean) =>
    cn(
      'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
      isActive
        ? 'bg-indigo-600 text-white shadow-sm'
        : 'bg-white dark:bg-gray-800 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
    )

  return (
    <div className="flex flex-col gap-6">
      {/* 标题区：查询/历史 水平排列，靠右 */}
      <div className="flex flex-wrap justify-end gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('query')}
          className={tabButtonClass(activeTab === 'query')}
          title={queryLabel}
        >
          <Search className="h-4 w-4" />
          {queryLabel}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={tabButtonClass(activeTab === 'history')}
          title={historyLabel}
        >
          <History className="h-4 w-4" />
          {historyLabel}
        </button>
      </div>

      {/* 内容区：始终在下方 */}
      <div className="flex-1 min-w-0">
        {activeTab === 'history' ? (
          <div className="max-w-2xl">{historyPanel}</div>
        ) : (
          queryPanel
        )}
      </div>
    </div>
  )
}

export default ToolTabView
