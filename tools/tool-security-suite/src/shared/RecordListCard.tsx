import React from 'react'
import { Card } from '@toolbox/ui-kit'

interface RecordListCardProps {
  title: string
  items: React.ReactNode[]
  emptyText: string
}

const RecordListCard: React.FC<RecordListCardProps> = ({ title, items, emptyText }) => {
  return (
    <Card className="h-full">
      <div className="mb-4 text-base font-semibold text-gray-900 dark:text-gray-100">{title}</div>
      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 px-4 py-5 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
          {emptyText}
        </div>
      ) : (
        <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          {items.map((item, index) => (
            <div
              key={`${title}-${index}`}
              className="rounded-2xl border border-gray-200 bg-white/60 px-3 py-2 dark:border-gray-700 dark:bg-gray-900/20"
            >
              {item}
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

export default RecordListCard
