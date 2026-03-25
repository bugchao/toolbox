import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FileText, Trash2 } from 'lucide-react'
import { PageHero } from '@toolbox/ui-kit'

function analyze(text: string) {
  const chars = text.length
  const charsNoSpace = text.replace(/\s/g, '').length
  const words = text.trim() ? text.trim().split(/\s+/).length : 0
  const sentences = text.trim() ? (text.match(/[.!?\u3002\uff01\uff1f]+/g) || []).length || 1 : 0
  const paragraphs = text.trim() ? text.split(/\n\s*\n/).filter(p => p.trim()).length || 1 : 0
  const lines = text ? text.split('\n').length : 0
  const zhChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length
  const enWords = text.trim() ? (text.match(/[a-zA-Z]+/g) || []).length : 0
  const readTimeMin = Math.max(1, Math.ceil(words / 200 + zhChars / 400))
  return { chars, charsNoSpace, words, sentences, paragraphs, lines, zhChars, enWords, readTimeMin }
}

export default function WordCount() {
  const { t } = useTranslation('toolWordCount')
  const [text, setText] = useState('')
  const stats = analyze(text)

  const CARDS = [
    { label: t('chars'), value: stats.chars, color: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600' },
    { label: t('charsNoSpace'), value: stats.charsNoSpace, color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' },
    { label: t('words'), value: stats.words, color: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' },
    { label: t('sentences'), value: stats.sentences, color: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600' },
    { label: t('paragraphs'), value: stats.paragraphs, color: 'bg-rose-50 dark:bg-rose-900/20 text-rose-500' },
    { label: t('lines'), value: stats.lines, color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600' },
    { label: '中文字符', value: stats.zhChars, color: 'bg-pink-50 dark:bg-pink-900/20 text-pink-500' },
    { label: '英文单词', value: stats.enWords, color: 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHero title={t('title')} description={t('description')} icon={FileText} />
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <div className="relative">
          <textarea value={text} onChange={e => setText(e.target.value)}
            placeholder={t('placeholder')} rows={8}
            className="w-full px-4 py-3 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-300 resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500" />
          {text && (
            <button onClick={() => setText('')}
              className="absolute top-3 right-3 text-gray-300 hover:text-red-400 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-4 gap-2">
          {CARDS.map(c => (
            <div key={c.label} className={`rounded-xl p-3 text-center ${c.color}`}>
              <div className="text-2xl font-bold">{c.value}</div>
              <div className="text-xs mt-0.5 opacity-75">{c.label}</div>
            </div>
          ))}
        </div>

        {text && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
            <span className="text-sm text-gray-500">{t('readTime')}</span>
            <span className="text-lg font-bold text-indigo-600">{stats.readTimeMin} {t('minutes')}</span>
          </div>
        )}
      </div>
    </div>
  )
}
