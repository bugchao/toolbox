import React from 'react'
import { Clock, History, Trash2, ChevronRight } from 'lucide-react'
import type { QueryHistoryRecord } from './hooks/useQueryHistory'

export interface QueryHistoryProps<T> {
  history: QueryHistoryRecord<T>[]
  onRestore: (record: QueryHistoryRecord<T>) => void
  onDelete: (id: string) => void
  onClear: () => void
  renderItem: (queryInfo: T extends any ? any : any) => React.ReactNode
  title?: string
  emptyMessage?: string
}

export default function QueryHistory<T>({
  history,
  onRestore,
  onDelete,
  onClear,
  renderItem,
  title = 'Query History',
  emptyMessage = 'No history yet'
}: QueryHistoryProps<T>) {

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 dark:divide-gray-700 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50">
        <h3 className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <History className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          {title}
        </h3>
        {history.length > 0 && (
          <button
            onClick={onClear}
            className="text-sm text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors flex items-center gap-1"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
      
      {history.length === 0 ? (
        <div className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
          {emptyMessage}
        </div>
      ) : (
        <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-[400px] overflow-y-auto">
          {history.map((record) => (
            <div
              key={record.id}
              className="group flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
              onClick={() => onRestore(record)}
            >
              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center text-sm mb-1 text-gray-500 dark:text-gray-400">
                  <Clock className="w-3 h-3 mr-1.5" />
                  {new Date(record.timestamp).toLocaleString()}
                </div>
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {renderItem(record.queryInfo)}
                </div>
              </div>
              
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(record.id)
                  }}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="p-1 text-gray-300 dark:text-gray-600">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
