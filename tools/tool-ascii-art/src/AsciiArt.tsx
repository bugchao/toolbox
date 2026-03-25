import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Copy, Check, Type, Download } from 'lucide-react'
import { PageHero } from '@toolbox/ui-kit'

// 简易 ASCII 字体（3行高度大字符）
const FONTS: Record<string, Record<string, string[]>> = {
  Block: {
    A: ['  ██  ','  ██  ',' ████ ','██  ██','██████'],
    B: ['█████ ','██  ██','█████ ','██  ██','█████ '],
    C: [' ████ ','██    ','██    ','██    ',' ████ '],
    D: ['████  ','██ ██ ','██  ██','██  ██','████  '],
    E: ['██████','██    ','████  ','██    ','██████'],
    F: ['██████','██    ','████  ','██    ','██    '],
    G: [' ████ ','██    ','██ ███','██  ██',' ████ '],
    H: ['██  ██','██  ██','██████','██  ██','██  ██'],
    I: ['██████','  ██  ','  ██  ','  ██  ','██████'],
    J: ['██████','   ██ ','   ██ ','██ ██ ',' ███  '],
    K: ['██  ██','██ ██ ','████  ','██ ██ ','██  ██'],
    L: ['██    ','██    ','██    ','██    ','██████'],
    M: ['██  ██','███████','██ █ ██','██   ██','██   ██'],
    N: ['██  ██','███ ██','██████','██ ███','██  ██'],
    O: [' ████ ','██  ██','██  ██','██  ██',' ████ '],
    P: ['█████ ','██  ██','█████ ','██    ','██    '],
    Q: [' ████ ','██  ██','██  ██','██ ███',' ██████'],
    R: ['█████ ','██  ██','█████ ','██ ██ ','██  ██'],
    S: [' ████ ','██    ',' ████ ','    ██',' ████ '],
    T: ['██████','  ██  ','  ██  ','  ██  ','  ██  '],
    U: ['██  ██','██  ██','██  ██','██  ██',' ████ '],
    V: ['██  ██','██  ██','██  ██',' ████ ','  ██  '],
    W: ['██   ██','██   ██','██ █ ██','███████','██   ██'],
    X: ['██  ██',' ████ ','  ██  ',' ████ ','██  ██'],
    Y: ['██  ██',' ████ ','  ██  ','  ██  ','  ██  '],
    Z: ['██████','   ██ ','  ██  ',' ██   ','██████'],
    ' ': ['      ','      ','      ','      ','      '],
    '0': [' ████ ','██  ██','██  ██','██  ██',' ████ '],
    '1': ['  ██  ',' ███  ','  ██  ','  ██  ','██████'],
    '2': [' ████ ','    ██','  ███ ',' ██   ','██████'],
    '3': ['█████ ','    ██','  ███ ','    ██','█████ '],
    '!': ['  ██  ','  ██  ','  ██  ','      ','  ██  '],
    '?': [' ████ ','    ██','  ██  ','      ','  ██  '],
  },
  Thin: {
    A: ['  /\\  ',' /  \ ',' /----\ ','/ /\ \','/_/  \_\'],
    B: ['|\\  ','| \\ ','|--/ ','| \\ ','|__/ '],
    O: [' ___ ','/ _ \','| | |','\\___/','     '],
    ' ': ['     ','     ','     ','     ','     '],
  },
}

const FONT_NAMES = Object.keys(FONTS)

function renderText(text: string, fontName: string): string {
  const font = FONTS[fontName] || FONTS.Block
  const chars = text.toUpperCase().split('')
  const rows = 5
  const lines: string[] = Array(rows).fill('')
  for (const ch of chars) {
    const glyph = font[ch] || FONTS.Block[ch] || ['     ','     ','     ','     ','     ']
    for (let r = 0; r < rows; r++) {
      lines[r] += (glyph[r] || '     ') + ' '
    }
  }
  return lines.join('\n')
}

export default function AsciiArt() {
  const { t } = useTranslation('toolAsciiArt')
  const [input, setInput] = useState('HELLO')
  const [font, setFont] = useState('Block')
  const [copied, setCopied] = useState(false)

  const output = renderText(input, font)

  const copy = () => {
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const download = () => {
    const blob = new Blob([output], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'ascii-art.txt'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHero title={t('title')} description={t('description')} icon={Type} />
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <div className="flex gap-3">
          <input value={input} onChange={e => setInput(e.target.value.slice(0, 10))}
            placeholder={t('inputPlaceholder')}
            className="flex-1 px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
          <select value={font} onChange={e => setFont(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none">
            {FONT_NAMES.map(f => <option key={f}>{f}</option>)}
          </select>
        </div>
        <div className="bg-gray-900 dark:bg-gray-950 rounded-xl p-4 overflow-x-auto">
          <pre className="text-green-400 text-xs leading-tight font-mono whitespace-pre">{output}</pre>
        </div>
        <div className="flex gap-3">
          <button onClick={copy}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-600 hover:border-indigo-400">
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            {copied ? t('copied') : t('copy')}
          </button>
          <button onClick={download}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-600 hover:border-indigo-400">
            <Download className="w-4 h-4" />{t('download')}
          </button>
        </div>
      </div>
    </div>
  )
}
