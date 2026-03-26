import React, { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { FileText, Copy, Check, Trash2, Zap } from 'lucide-react'
import { PageHero } from '@toolbox/ui-kit'

type Length = 'short' | 'medium' | 'long'

function extractSentences(text: string): string[] {
  return text
    .replace(/\n+/g, ' ')
    .split(/(?<=[。！？.!?])\s*/)
    .map(s => s.trim())
    .filter(s => s.length > 5)
}

function extractKeywords(text: string): string[] {
  const stopWords = new Set(['的','了','是','在','和','有','我','你','他','她','它','们','这','那','个','一','不','人','都','也','就','但','而','与','或','从','到','被','把','让','对','为','以','及','等','中','上','下','前','后','内','外','大','小','多','少','可','要','能','会','说','去','来','做','看','想','知','用','时','其','所','如','还','已','又','很','只','也','都','才','没','最','再','更','些','什','么','谁','哪','怎','为','因','所','虽','但','然','而','如','若','当','于','由','在','自','至','从'])
  const words = text.replace(/[^\u4e00-\u9fa5a-zA-Z]/g, ' ').split(/\s+/).filter(w => w.length > 1)
  const freq: Record<string, number> = {}
  words.forEach(w => {
    if (!stopWords.has(w)) freq[w] = (freq[w] || 0) + 1
  })
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(e => e[0])
}

function summarize(text: string, length: Length): string {
  const sentences = extractSentences(text)
  if (sentences.length === 0) return ''
  const counts: Record<Length, number> = { short: 2, medium: 4, long: 8 }
  const n = Math.min(counts[length], sentences.length)
  // Score sentences by position and keyword frequency
  const keywords = extractKeywords(text)
  const scored = sentences.map((s, i) => {
    let score = 0
    keywords.forEach(k => { if (s.includes(k)) score += 2 })
    if (i < 3) score += 3
    if (i === sentences.length - 1) score += 1
    score += s.length > 20 && s.length < 100 ? 1 : 0
    return { s, score, i }
  })
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, n)
    .sort((a, b) => a.i - b.i)
    .map(x => x.s)
    .join('。')
    .replace(/。+/g, '。')
}

export default function TextSummary() {
  const { t } = useTranslation('toolTextSummary')
  const [input, setInput] = useState('')
  const [length, setLength] = useState<Length>('medium')
  const [result, setResult] = useState('')
  const [keywords, setKeywords] = useState<string[]>([])
  const [copied, setCopied] = useState(false)

  const handleSummarize = useCallback(() => {
    if (!input.trim()) return
    setResult(summarize(input, length))
    setKeywords(extractKeywords(input))
  }, [input, length])

  const handleCopy = () => {
    navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const inputLen = input.length
  const resultLen = result.length
  const compression = inputLen > 0 && resultLen > 0 ? Math.round((1 - resultLen / inputLen) * 100) : 0
  const readingTime = Math.max(1, Math.ceil(inputLen / 300))

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHero
        icon={FileText}
        titleKey="title"
        descriptionKey="description"
        i18nNamespace="toolTextSummary"
      />
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Length selector */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('summaryLength')}：</span>
          {(['short', 'medium', 'long'] as Length[]).map(l => (
            <button key={l} onClick={() => setLength(l)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                length === l
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-indigo-400'
              }`}>
              {t(l)}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 dark:border-gray-700">
            <span className="text-xs font-medium text-gray-500">{t('inputLabel')}</span>
            <span className="text-xs text-gray-400">{inputLen} {t('chars')} · {t('readingTime')} {readingTime} {t('minutes')}</span>
          </div>
          <textarea
            className="w-full h-52 px-4 py-3 text-sm text-gray-800 dark:text-gray-200 bg-transparent resize-none outline-none"
            placeholder={t('inputPlaceholder')}
            value={input}
            onChange={e => setInput(e.target.value)}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button onClick={handleSummarize}
            disabled={!input.trim()}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-lg text-sm font-medium transition-colors">
            <Zap className="w-4 h-4" />
            {t('summarize')}
          </button>
          <button onClick={() => { setInput(''); setResult(''); setKeywords([]) }}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors">
            <Trash2 className="w-4 h-4" />
            {t('clear')}
          </button>
        </div>

        {/* Result */}
        {result && (
          <div className="space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: t('original'), value: `${inputLen} ${t('chars')}` },
                { label: t('summary'), value: `${resultLen} ${t('chars')}` },
                { label: t('compressionRate'), value: `${compression}%` },
              ].map(({ label, value }) => (
                <div key={label} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
                  <div className="text-xl font-bold text-indigo-600">{value}</div>
                  <div className="text-xs text-gray-500 mt-1">{label}</div>
                </div>
              ))}
            </div>

            {/* Summary text */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-xs font-medium text-gray-500">{t('result')}</span>
                <button onClick={handleCopy}
                  className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-indigo-600 transition-colors">
                  {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? t('copied') : t('copy')}
                </button>
              </div>
              <div className="px-4 py-4 text-sm text-gray-800 dark:text-gray-200 leading-relaxed">{result}</div>
            </div>

            {/* Keywords */}
            {keywords.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-3">
                <span className="text-xs font-medium text-gray-500 mr-3">{t('keywords')}：</span>
                {keywords.map(k => (
                  <span key={k} className="inline-block mr-2 mb-1 px-2.5 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs rounded-full">{k}</span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
