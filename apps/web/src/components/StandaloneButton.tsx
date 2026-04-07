import React from 'react'
import { useLocation } from 'react-router-dom'
import { ExternalLink } from 'lucide-react'

interface StandaloneButtonProps {
  className?: string
}

export function StandaloneButton({ className = '' }: StandaloneButtonProps) {
  const location = useLocation()

  const openStandalone = () => {
    const url = `${window.location.origin}${location.pathname}?standalone=true`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <button
      onClick={openStandalone}
      className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors ${className}`}
      title="在新窗口中独立打开此工具"
    >
      <ExternalLink className="w-4 h-4" />
      <span>独立打开</span>
    </button>
  )
}
