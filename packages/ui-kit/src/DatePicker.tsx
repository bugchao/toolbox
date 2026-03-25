import React, { useState, useCallback, useMemo } from 'react'
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'

export interface DatePickerProps {
  /** 日期值 (YYYY-MM-DD 格式) */
  value: string
  /** 日期变化回调 */
  onChange: (date: string) => void
  /** 占位符文本 */
  placeholder?: string
  /** 禁用状态 */
  disabled?: boolean
  /** 自定义类名 */
  className?: string
  /** 最小日期 */
  min?: string
  /** 最大日期 */
  max?: string
}

/**
 * 获取今天的日期字符串 (YYYY-MM-DD)
 */
export function getTodayString(): string {
  return new Date().toISOString().slice(0, 10)
}

/**
 * 格式化日期显示 (YYYY-MM-DD -> YYYY年MM月DD日)
 */
export function formatDateDisplay(dateStr: string, locale: string = 'zh-CN'): string {
  if (!dateStr) return ''
  const [year, month, day] = dateStr.split('-')
  
  if (locale === 'en-US') {
    return `${month}/${day}/${year}`
  }
  return `${year}年${month}月${day}日`
}

/**
 * 解析日期字符串
 */
export function parseDate(dateStr: string): { year: number; month: number; day: number } | null {
  if (!dateStr) return null
  const [year, month, day] = dateStr.split('-').map(Number)
  if (isNaN(year) || isNaN(month) || isNaN(day)) return null
  return { year, month: month - 1, day }
}

/**
 * 日期选择器组件
 * 
 * 特性：
 * - 支持年/月下拉选择
 * - 支持日期网格选择
 * - 支持快捷选择"今天"
 * - 支持清除选择
 * - 浅色/暗色主题适配
 */
const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  placeholder = '选择日期',
  disabled = false,
  className = '',
  min,
  max,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  
  const parsedValue = useMemo(() => parseDate(value), [value])
  
  const [viewDate, setViewDate] = useState(() => {
    return parsedValue ? new Date(parsedValue.year, parsedValue.month, 1) : new Date()
  })

  const currentYear = viewDate.getFullYear()
  const currentMonth = viewDate.getMonth()

  // 生成年份选项（前后5年）
  const years = useMemo(() => {
    return Array.from({ length: 11 }, (_, i) => currentYear - 5 + i)
  }, [currentYear])

  const months = useMemo(() => Array.from({ length: 12 }, (_, i) => i), [])

  const getDaysInMonth = useCallback((year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }, [])

  const getFirstDayOfMonth = useCallback((year: number, month: number) => {
    return new Date(year, month, 1).getDay()
  }, [])

  const daysInMonth = getDaysInMonth(currentYear, currentMonth)
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth)

  const days = useMemo(() => Array.from({ length: daysInMonth }, (_, i) => i + 1), [daysInMonth])
  const emptyDays = useMemo(() => Array.from({ length: firstDay }, (_, i) => i), [firstDay])

  const handleDateSelect = useCallback((day: number) => {
    const selectedDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    onChange(selectedDate)
    setIsOpen(false)
  }, [currentYear, currentMonth, onChange])

  const handlePrevMonth = useCallback(() => {
    setViewDate(new Date(currentYear, currentMonth - 1, 1))
  }, [currentYear, currentMonth])

  const handleNextMonth = useCallback(() => {
    setViewDate(new Date(currentYear, currentMonth + 1, 1))
  }, [currentYear, currentMonth])

  const isSelectedDate = useCallback((day: number) => {
    if (!parsedValue) return false
    return parsedValue.year === currentYear && parsedValue.month === currentMonth && parsedValue.day === day
  }, [parsedValue, currentYear, currentMonth])

  const isToday = useCallback((day: number) => {
    const today = new Date()
    return today.getFullYear() === currentYear && today.getMonth() === currentMonth && today.getDate() === day
  }, [currentYear, currentMonth])

  const isDisabledDate = useCallback((day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    if (min && dateStr < min) return true
    if (max && dateStr > max) return true
    return false
  }, [currentYear, currentMonth, min, max])

  const handleClear = useCallback(() => {
    onChange('')
    setIsOpen(false)
  }, [onChange])

  const handleSelectToday = useCallback(() => {
    onChange(getTodayString())
    setIsOpen(false)
  }, [onChange])

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={[
          'w-full px-3 py-2 rounded-lg border text-sm transition-colors flex items-center justify-between',
          'bg-white dark:bg-gray-700',
          'border-gray-300 dark:border-gray-600',
          'text-gray-900 dark:text-gray-100',
          'focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400',
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-gray-400 dark:hover:border-gray-500',
        ].join(' ')}
      >
        <span className={value ? '' : 'text-gray-400 dark:text-gray-500'}>
          {value ? formatDateDisplay(value) : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-50 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3 min-w-[280px]">
            {/* 年月选择 */}
            <div className="flex items-center justify-between mb-3">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
              <div className="flex gap-2">
                <select
                  value={currentYear}
                  onChange={(e) => setViewDate(new Date(parseInt(e.target.value), currentMonth, 1))}
                  className="text-sm bg-transparent border-none focus:ring-0 text-gray-900 dark:text-gray-100 font-medium cursor-pointer"
                >
                  {years.map(year => (
                    <option key={year} value={year}>{year}年</option>
                  ))}
                </select>
                <select
                  value={currentMonth}
                  onChange={(e) => setViewDate(new Date(currentYear, parseInt(e.target.value), 1))}
                  className="text-sm bg-transparent border-none focus:ring-0 text-gray-900 dark:text-gray-100 font-medium cursor-pointer"
                >
                  {months.map(month => (
                    <option key={month} value={month}>{month + 1}月</option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* 星期标题 */}
            <div className="grid grid-cols-7 mb-1">
              {['日', '一', '二', '三', '四', '五', '六'].map(day => (
                <div key={day} className="text-center text-xs text-gray-400 dark:text-gray-500 py-1">
                  {day}
                </div>
              ))}
            </div>

            {/* 日期网格 */}
            <div className="grid grid-cols-7 gap-1">
              {emptyDays.map(i => (
                <div key={`empty-${i}`} className="h-8" />
              ))}
              {days.map(day => {
                const disabled = isDisabledDate(day)
                const selected = isSelectedDate(day)
                const today = isToday(day)
                
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => !disabled && handleDateSelect(day)}
                    disabled={disabled}
                    className={[
                      'h-8 w-8 rounded-full text-sm flex items-center justify-center transition-colors',
                      disabled 
                        ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                        : selected 
                          ? 'bg-indigo-600 text-white'
                          : today
                            ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    ].join(' ')}
                  >
                    {day}
                  </button>
                )
              })}
            </div>

            {/* 快捷操作 */}
            <div className="flex justify-between mt-3 pt-2 border-t border-gray-100 dark:border-gray-700">
              <button
                type="button"
                onClick={handleSelectToday}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                今天
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                清除
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default DatePicker
