import React, { useState, KeyboardEvent } from 'react'
import { X } from 'lucide-react'

export interface TagInputProps {
  tags: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  className?: string
  maxTags?: number
}

export default function TagInput({
  tags,
  onChange,
  placeholder = '输入后按回车添加...',
  className = '',
  maxTags = 20,
}: TagInputProps) {
  const [input, setInput] = useState('')

  const add = () => {
    const v = input.trim()
    if (!v || tags.includes(v) || tags.length >= maxTags) return
    onChange([...tags, v])
    setInput('')
  }

  const remove = (tag: string) => onChange(tags.filter(t => t !== tag))

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add() }
    if (e.key === 'Backspace' && !input && tags.length) remove(tags[tags.length - 1])
  }

  return (
    <div className={`flex flex-wrap gap-1.5 items-center p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 min-h-[42px] focus-within:ring-1 focus-within:ring-indigo-500 ${className}`}>
      {tags.map(tag => (
        <span key={tag} className="flex items-center gap-1 px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded text-sm">
          {tag}
          <button onClick={() => remove(tag)} className="hover:text-red-500 transition-colors">
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={onKey}
        onBlur={add}
        placeholder={tags.length === 0 ? placeholder : ''}
        className="flex-1 min-w-[120px] bg-transparent outline-none text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400"
      />
    </div>
  )
}
