import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Star } from 'lucide-react'
import { TOOLS, getToolTitle } from '../config/tools'
import { useFavorites } from '../hooks/useFavorites'

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ open, onClose }) => {
  const { t } = useTranslation('nav')
  const { t: tCp } = useTranslation('commandPalette')
  const navigate = useNavigate()
  const { isFavorite, toggle } = useFavorites()
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return TOOLS
    return TOOLS.filter((tool) => {
      const name = getToolTitle(tool, t).toLowerCase()
      const path = tool.path.toLowerCase()
      const keywords = (tool.keywords ?? []).join(' ').toLowerCase()
      return name.includes(q) || path.includes(q) || keywords.includes(q)
    })
  }, [query, t])

  const selectAndGo = useCallback(
    (tool: (typeof TOOLS)[number]) => {
      navigate(tool.path)
      onClose()
      setQuery('')
      setSelectedIndex(0)
    },
    [navigate, onClose]
  )

  useEffect(() => {
    if (!open) return
    setQuery('')
    setSelectedIndex(0)
    setTimeout(() => inputRef.current?.focus(), 0)
  }, [open])

  useEffect(() => {
    setSelectedIndex((i) => (filtered.length ? Math.min(i, filtered.length - 1) : 0))
  }, [filtered.length])

  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((i) => (i + 1) % Math.max(1, filtered.length))
        return
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((i) => (i - 1 + filtered.length) % Math.max(1, filtered.length))
        return
      }
      if (e.key === 'Enter' && filtered[selectedIndex]) {
        e.preventDefault()
        selectAndGo(filtered[selectedIndex])
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose, filtered, selectedIndex, selectAndGo])

  useEffect(() => {
    const el = listRef.current
    if (!el) return
    const item = el.children[selectedIndex] as HTMLElement | undefined
    item?.scrollIntoView({ block: 'nearest' })
  }, [selectedIndex])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/50 dark:bg-black/70"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-label="Command palette"
    >
      <div
        className="w-full max-w-xl rounded-xl shadow-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center border-b border-gray-200 dark:border-gray-700 px-4">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={tCp('placeholder')}
            className="flex-1 py-3 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300 outline-none"
            aria-autocomplete="list"
            aria-controls="command-palette-list"
            aria-activedescendant={filtered[selectedIndex] ? `cmd-${selectedIndex}` : undefined}
          />
          <kbd className="hidden sm:inline text-xs text-gray-400 dark:text-gray-300 px-2 py-1 rounded border border-gray-200 dark:border-gray-600">
            {tCp('shortcut')}
          </kbd>
        </div>
        <div
          id="command-palette-list"
          ref={listRef}
          className="max-h-[60vh] overflow-y-auto py-2"
          role="listbox"
        >
          {filtered.length === 0 ? (
            <div className="px-4 py-6 text-center text-gray-500 dark:text-gray-300 text-sm">
              {tCp('noResults')}
            </div>
          ) : (
            filtered.map((tool, index) => {
              const Icon = tool.icon
              const isSelected = index === selectedIndex
              const fav = tool.path !== '/' && isFavorite(tool.path)
              return (
                <div
                  key={tool.path}
                  id={`cmd-${index}`}
                  role="option"
                  aria-selected={isSelected}
                  className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                      : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                  onMouseEnter={() => setSelectedIndex(index)}
                  onClick={() => selectAndGo(tool)}
                >
                  <Icon className="w-5 h-5 flex-shrink-0 text-gray-500 dark:text-gray-300" />
                  <span className="flex-1 truncate">{getToolTitle(tool, t)}</span>
                  {tool.path !== '/' && tool.path !== '/favorites' && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggle(tool.path)
                      }}
                      className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${
                        fav ? 'text-amber-500' : 'text-gray-400 dark:text-gray-300'
                      }`}
                      aria-label={fav ? tCp('removeFavorite') : tCp('addFavorite')}
                    >
                      <Star className={`w-4 h-4 ${fav ? 'fill-current' : ''}`} />
                    </button>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
