import React from 'react'

export interface TimelineItem {
  time?: string
  title: string
  description?: string
  icon?: React.ReactNode
  color?: string
}

export interface TimelineProps {
  items: TimelineItem[]
  className?: string
}

export default function Timeline({ items, className = '' }: TimelineProps) {
  return (
    <div className={`space-y-0 ${className}`}>
      {items.map((item, i) => (
        <div key={i} className="flex gap-4">
          {/* Line + dot */}
          <div className="flex flex-col items-center">
            <div className={`w-3 h-3 rounded-full shrink-0 mt-1 ${item.color ? '' : 'bg-indigo-500'}`}
              style={item.color ? { backgroundColor: item.color } : {}} />
            {i < items.length - 1 && (
              <div className="w-0.5 flex-1 bg-gray-200 dark:bg-gray-700 my-1" />
            )}
          </div>
          {/* Content */}
          <div className="pb-6 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {item.time && (
                <span className="text-xs text-gray-400 shrink-0">{item.time}</span>
              )}
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{item.title}</span>
              {item.icon && <span className="text-gray-400">{item.icon}</span>}
            </div>
            {item.description && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{item.description}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
