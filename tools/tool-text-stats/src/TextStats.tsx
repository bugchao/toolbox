import React, { useMemo, useState } from 'react'
import { AlignLeft, BookOpenText, Clock3, Type } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card, PageHero } from '@toolbox/ui-kit'

function countSentences(text: string) {
  const matches = text.match(/[.!?。！？]+/g)
  return matches ? matches.length : text.trim() ? 1 : 0
}

function countParagraphs(text: string) {
  return text
    .split(/\n\s*\n/)
    .map((item) => item.trim())
    .filter(Boolean).length
}

export default function TextStats() {
  const { t } = useTranslation('toolTextStats')
  const [text, setText] = useState('')

  const stats = useMemo(() => {
    const trimmed = text.trim()
    const characters = text.length
    const charactersNoSpaces = text.replace(/\s/g, '').length
    const words = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0
    const lines = text ? text.split('\n').length : 0
    const sentences = countSentences(text)
    const paragraphs = countParagraphs(text)
    const readingMinutes = words > 0 ? Math.max(1, Math.ceil(words / 220)) : 0

    return {
      characters,
      charactersNoSpaces,
      words,
      lines,
      sentences,
      paragraphs,
      readingMinutes,
    }
  }, [text])

  const cards = [
    { key: 'characters', label: t('stats.characters'), value: stats.characters, icon: <Type className="h-4 w-4" /> },
    { key: 'charactersNoSpaces', label: t('stats.charactersNoSpaces'), value: stats.charactersNoSpaces, icon: <AlignLeft className="h-4 w-4" /> },
    { key: 'words', label: t('stats.words'), value: stats.words, icon: <BookOpenText className="h-4 w-4" /> },
    { key: 'readingMinutes', label: t('stats.readingMinutes'), value: stats.readingMinutes, icon: <Clock3 className="h-4 w-4" /> },
    { key: 'lines', label: t('stats.lines'), value: stats.lines, icon: <AlignLeft className="h-4 w-4" /> },
    { key: 'sentences', label: t('stats.sentences'), value: stats.sentences, icon: <BookOpenText className="h-4 w-4" /> },
    { key: 'paragraphs', label: t('stats.paragraphs'), value: stats.paragraphs, icon: <AlignLeft className="h-4 w-4" /> },
  ]

  return (
    <div className="space-y-6">
      <Card className="border-slate-200/80 bg-gradient-to-br from-white via-slate-50 to-cyan-50/70 dark:border-slate-700/80 dark:from-slate-950 dark:via-slate-900 dark:to-cyan-950/20">
        <PageHero icon={AlignLeft} title={t('title')} description={t('description')} />
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_360px]">
        <Card className="space-y-3">
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('inputLabel')}</div>
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={18}
            placeholder={t('placeholder')}
            className="min-h-[420px] w-full rounded-3xl border border-slate-300 bg-white px-5 py-4 text-base leading-7 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
        </Card>

        <div className="space-y-6">
          <Card className="space-y-4">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('summaryTitle')}</div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              {cards.map((card) => (
                <div key={card.key} className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900/80">
                  <div className="mb-2 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                    {card.icon}
                    {card.label}
                  </div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{card.value}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="space-y-2">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('tipsTitle')}</div>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              {(t('tips', { returnObjects: true }) as string[]).map((tip) => (
                <li key={tip}>• {tip}</li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  )
}
