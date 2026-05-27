import React, { useMemo } from 'react'
import { TextArea, Button } from '@toolbox/ui-kit'
import { useTranslation } from 'react-i18next'
import { Trash2 } from 'lucide-react'
import { analyzeText } from '../lib/textFeatures'
import { aggregate } from '../lib/score'
import ResultPanel from './ResultPanel'

const MIN_LENGTH = 80

const TextTab: React.FC = () => {
  const { t } = useTranslation('toolAiDetector')
  const [text, setText] = React.useState('')

  const analysis = useMemo(() => {
    if (text.trim().length < MIN_LENGTH) return null
    return analyzeText(text)
  }, [text])

  const result = useMemo(() => (analysis ? aggregate(analysis.features) : null), [analysis])

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {t('text.heading')} ·{' '}
            <span className="font-mono">
              {text.length} {t('text.chars')}
            </span>
          </span>
          <Button variant="ghost" size="sm" onClick={() => setText('')}>
            <span className="inline-flex items-center gap-1.5">
              <Trash2 className="h-4 w-4" />
              {t('text.clear')}
            </span>
          </Button>
        </div>
        <TextArea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t('text.placeholder')}
          className="min-h-[360px] font-sans text-sm leading-relaxed"
        />
      </div>

      <div>
        {result && analysis ? (
          <ResultPanel result={result} suspicious={analysis.suspiciousSentences} />
        ) : (
          <div className="flex h-full min-h-[200px] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
            <p className="mb-2 text-lg">📝</p>
            <p>
              {text.length === 0
                ? t('text.empty')
                : t('text.tooShort', { min: MIN_LENGTH })}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default TextTab
