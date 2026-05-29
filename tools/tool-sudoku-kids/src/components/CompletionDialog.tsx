import React from 'react'
import { Button } from '@toolbox/ui-kit'
import { useTranslation } from 'react-i18next'
import StarRating from './StarRating'

export type CompletionDialogProps = {
  stars: number
  errors: number
  hints: number
  hasNext: boolean
  onReplay: () => void
  onNext: () => void
  onBackToMap: () => void
}

const CompletionDialog: React.FC<CompletionDialogProps> = ({
  stars,
  errors,
  hints,
  hasNext,
  onReplay,
  onNext,
  onBackToMap,
}) => {
  const { t } = useTranslation('toolSudokuKids')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-3xl bg-gradient-to-br from-amber-50 via-white to-pink-50 p-6 text-center shadow-2xl dark:from-amber-900/40 dark:via-gray-800 dark:to-pink-900/30">
        <div className="mb-2 text-5xl" aria-hidden>
          🎉
        </div>
        <h3 className="mb-3 text-xl font-extrabold text-gray-900 dark:text-gray-100">
          {t('complete.title')}
        </h3>
        <div className="my-3 flex justify-center">
          <StarRating stars={stars} size="lg" />
        </div>
        <div className="mb-5 text-sm text-gray-600 dark:text-gray-300">
          {t('complete.errors')}: <span className="font-semibold">{errors}</span>　·
          {t('complete.hints')}: <span className="font-semibold">{hints}</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" onClick={onReplay}>
            {t('complete.replay')}
          </Button>
          {hasNext ? (
            <Button variant="primary" onClick={onNext}>
              {t('complete.next')}
            </Button>
          ) : (
            <Button variant="primary" onClick={onBackToMap}>
              {t('complete.backToMap')}
            </Button>
          )}
        </div>
        {hasNext && (
          <button
            type="button"
            onClick={onBackToMap}
            className="mt-3 w-full text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            {t('complete.backToMap')}
          </button>
        )}
      </div>
    </div>
  )
}

export default CompletionDialog
