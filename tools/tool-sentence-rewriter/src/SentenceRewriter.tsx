import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PenLine, Copy, Check, Trash2, Sparkles } from 'lucide-react'
import { PageHero } from '@toolbox/ui-kit'

type Style = 'formal' | 'casual' | 'concise' | 'elaborate' | 'persuasive' | 'poetic'

const STYLES: Style[] = ['formal', 'casual', 'concise', 'elaborate', 'persuasive', 'poetic']

const STYLE_COLORS: Record<Style, string> = {
  formal: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  casual: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
  concise: 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
  elaborate: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  persuasive: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
  poetic: 'bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-800',
}

const FORMAL_WORDS: Record<string, string> = {
  '很': '十分', '非常': '极为', '好': '良好', '差': '欠佳', '大': '较大', '小': '较小',
  '说': '表示', '觉得': '认为', '知道': '了解', '做': '执行', '用': '使用', '看': '查阅',
  '但': '然而', '所以': '因此', '因为': '由于', '还有': '此外', '就是': '即为',
}

const CASUAL_WORDS: Record<string, string> = {
  '十分': '超级', '极为': '非常', '良好': '不错', '执行': '做', '使用': '用',
  '然而': '但是', '因此': '所以', '由于': '因为', '此外': '另外', '表示': '说',
  '认为': '觉得', '了解': '知道', '查阅': '看看',
}

function rewrite(text: string, style: Style): string {
  if (!text.trim()) return ''
  let result = text
  switch (style) {
    case 'formal':
      Object.entries(FORMAL_WORDS).forEach(([k, v]) => { result = result.replaceAll(k, v) })
      if (!result.endsWith('。') && !result.endsWith('.')) result += '。'
      result = result.charAt(0).toUpperCase() + result.slice(1)
      break
    case 'casual':
      Object.entries(CASUAL_WORDS).forEach(([k, v]) => { result = result.replaceAll(k, v) })
      result = result.replace(/。$/, '～').replace(/！$/, '！！')
      break
    case 'concise': {
      // Remove filler words
      const fillers = ['其实', '基本上', '大概', '可能', '似乎', '应该说', '总的来说', '一般而言', '就是说']
      fillers.forEach(f => { result = result.replaceAll(f, '') })
      result = result.replace(/\s+/g, ' ').trim()
      break
    }
    case 'elaborate':
      result = result.replace(/。$/, '，这一点值得我们深入思考和认真对待。')
      result = '从多角度来看，' + result
      break
    case 'persuasive':
      result = '毫无疑问，' + result
      result = result.replace(/。$/, '，这是显而易见的事实。')
      break
    case 'poetic':
      result = result.replace(/。$/, '，如诗如画，令人回味无穷。')
      result = '在岁月的长河中，' + result
      break
  }
  return result
}

export default function SentenceRewriter() {
  const { t } = useTranslation('toolSentenceRewriter')
  const [input, setInput] = useState('')
  const [style, setStyle] = useState<Style>('formal')
  const [results, setResults] = useState<Partial<Record<Style, string>>>({})
  const [copied, setCopied] = useState<string | null>(null)

  const handleRewrite = () => {
    if (!input.trim()) return
    const all: Partial<Record<Style, string>> = {}
    STYLES.forEach(s => { all[s] = rewrite(input, s) })
    setResults(all)
  }

  const handleCopy = (s: Style, text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(s)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHero
        icon={PenLine}
        titleKey="title"
        descriptionKey="description"
        i18nNamespace="toolSentenceRewriter"
      />
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Input */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <textarea
            className="w-full h-32 px-4 py-3 text-sm text-gray-800 dark:text-gray-200 bg-transparent resize-none outline-none"
            placeholder={t('inputPlaceholder')}
            value={input}
            onChange={e => setInput(e.target.value)}
          />
        </div>

        <div className="flex gap-3">
          <button onClick={handleRewrite} disabled={!input.trim()}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-lg text-sm font-medium transition-colors">
            <Sparkles className="w-4 h-4" />
            {t('rewrite')}
          </button>
          <button onClick={() => { setInput(''); setResults({}) }}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors">
            <Trash2 className="w-4 h-4" />
            {t('clear')}
          </button>
        </div>

        {/* Results - all styles */}
        {Object.keys(results).length > 0 && (
          <div className="space-y-3">
            {STYLES.map(s => (
              <div key={s} className={`rounded-xl border p-4 ${STYLE_COLORS[s]}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold">{t(s)}</span>
                  <button onClick={() => handleCopy(s, results[s] || '')}
                    className="flex items-center gap-1 text-xs opacity-70 hover:opacity-100">
                    {copied === s ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied === s ? t('copied') : t('copy')}
                  </button>
                </div>
                <p className="text-sm leading-relaxed">{results[s]}</p>
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-gray-400 dark:text-gray-500">{t('tip')}</p>
      </div>
    </div>
  )
}
