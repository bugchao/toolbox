import React, { useState } from 'react'

export interface Tab {
  label: string
  content: React.ReactNode
}

export interface TabViewProps {
  tabs: Tab[]
}

/**
 * Tab view container component
 * Displays content in tabs with navigation
 */
const TabView: React.FC<TabViewProps> = ({ tabs }) => {
  const [activeIndex, setActiveIndex] = useState(0)

  if (tabs.length === 0) {
    return <div className="p-4" />
  }

  return (
    <div className="flex flex-col h-full">
      {/* Tab navigation */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={`
              px-4 py-2 font-medium text-sm transition-colors
              border-b-2 -mb-px
              ${
                activeIndex === index
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-auto p-4">
        {tabs[activeIndex]?.content}
      </div>
    </div>
  )
}

export default TabView
