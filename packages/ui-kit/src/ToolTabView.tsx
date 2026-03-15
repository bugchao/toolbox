import React, { useState } from 'react'
import { Search, History } from 'lucide-react'

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
 * Shows two tabs: query and history (matching the design reference).
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

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Tab Switcher - Small Icons on the left */}
      <div className="flex lg:flex-col items-center gap-4 lg:pt-4">
        <button
          onClick={() => setActiveTab('query')}
          className={`group flex flex-col items-center justify-center gap-1 w-16 h-16 rounded-2xl transition-all ${
            activeTab === 'query'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none translate-y-[-2px]'
              : 'bg-white dark:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 shadow-sm'
          }`}
          title={queryLabel}
        >
          <Search className="w-6 h-6" />
          <span className="text-[10px] font-medium">{queryLabel}</span>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`group flex flex-col items-center justify-center gap-1 w-16 h-16 rounded-2xl transition-all ${
            activeTab === 'history'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none translate-y-[-2px]'
              : 'bg-white dark:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 shadow-sm'
          }`}
          title={historyLabel}
        >
          <History className="w-6 h-6" />
          <span className="text-[10px] font-medium">{historyLabel}</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6">
        {activeTab === 'history' && (
          <div className="lg:w-80 shrink-0">
            {historyPanel}
          </div>
        )}
        <div className="flex-1 min-w-0">
          {queryPanel}
        </div>
      </div>
    </div>
  )
}

export default ToolTabView
