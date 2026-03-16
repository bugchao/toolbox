import React from 'react'
import { cn } from './lib/cn'

export interface DataTableColumn<T> {
  key: string
  header: React.ReactNode
  className?: string
  cell: (row: T, index: number) => React.ReactNode
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  rows: T[]
  emptyText?: React.ReactNode
  rowKey?: (row: T, index: number) => string
  className?: string
}

function DataTable<T>({
  columns,
  rows,
  emptyText = 'No data',
  rowKey,
  className = '',
}: DataTableProps<T>) {
  return (
    <div className={cn('overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700', className)}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800/70">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400',
                    column.className
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white dark:divide-gray-800 dark:bg-gray-900/10">
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
                >
                  {emptyText}
                </td>
              </tr>
            ) : (
              rows.map((row, index) => (
                <tr key={rowKey ? rowKey(row, index) : String(index)} className="align-top">
                  {columns.map((column) => (
                    <td key={column.key} className={cn('px-4 py-3 text-sm text-gray-700 dark:text-gray-300', column.className)}>
                      {column.cell(row, index)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default DataTable
