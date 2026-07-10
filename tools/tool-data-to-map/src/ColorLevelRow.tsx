import React from 'react'

interface ColorLevelRowProps {
  label: string
  color: string
  onColorChange: (color: string) => void
  children: React.ReactNode
}

/** 一行“数值区间 + 颜色”配置：左侧标签、中间任意数量的数值输入框、右侧色块选择器 */
export const ColorLevelRow: React.FC<ColorLevelRowProps> = ({ label, color, onColorChange, children }) => (
  <div className="flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 bg-gray-50/60 px-3 py-2 dark:border-gray-700 dark:bg-gray-800/40">
    <span className="w-24 shrink-0 text-sm text-gray-600 dark:text-gray-300">{label}</span>
    <div className="flex flex-1 flex-wrap items-center gap-2">{children}</div>
    <input
      type="color"
      value={color}
      onChange={(e) => onColorChange(e.target.value)}
      className="h-8 w-10 shrink-0 cursor-pointer rounded border border-gray-300 bg-transparent dark:border-gray-600"
    />
  </div>
)

interface LevelNumberInputProps {
  value: number
  onChange: (value: number) => void
  title?: string
}

export const LevelNumberInput: React.FC<LevelNumberInputProps> = ({ value, onChange, title }) => (
  <input
    type="number"
    min={0}
    title={title}
    value={value}
    onChange={(e) => onChange(Number(e.target.value))}
    className="w-24 rounded-md border border-gray-300 bg-white px-2 py-1 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
  />
)
