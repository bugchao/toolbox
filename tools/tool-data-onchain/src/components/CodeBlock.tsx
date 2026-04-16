import React, { useState } from 'react'
import { Copy, Check } from 'lucide-react'

interface CodeBlockProps {
  title?: string
  code: string
  language?: string
  maxHeight?: number
  copyLabel?: string
  copiedLabel?: string
}

const CodeBlock: React.FC<CodeBlockProps> = ({
  title,
  code,
  language,
  maxHeight = 420,
  copyLabel = '复制',
  copiedLabel = '已复制',
}) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard?.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // ignore
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/60 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <div className="flex items-center gap-2">
          {title && (
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">{title}</span>
          )}
          {language && (
            <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-200">
              {language}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? copiedLabel : copyLabel}
        </button>
      </div>
      <pre
        className="text-xs leading-relaxed overflow-auto p-3 font-mono text-gray-800 dark:text-gray-100"
        style={{ maxHeight }}
      >
        <code>{code}</code>
      </pre>
    </div>
  )
}

export default CodeBlock
