import React from 'react'
import { useTranslation } from 'react-i18next'
import { Card, Button } from '@toolbox/ui-kit'
import { AlertCircle, RotateCcw, ArrowLeft } from 'lucide-react'
import type { ErrorType } from '../hooks/useScreenRecorder'

interface ErrorPanelProps {
  errorType: ErrorType
  onRetry: () => void
  onBack: () => void
}

const ErrorPanel: React.FC<ErrorPanelProps> = ({ errorType, onRetry, onBack }) => {
  const { t } = useTranslation('toolScreenRecorder')

  const errorMessages: Record<ErrorType, string> = {
    unsupported: t('error.unsupported'),
    permissionDenied: t('error.permissionDenied'),
    deviceError: t('error.deviceError'),
    recordingFailed: t('error.recordingFailed'),
  }

  return (
    <Card className="max-w-md mx-auto p-6">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-gray-700 dark:text-gray-200">
            {errorMessages[errorType]}
          </p>
        </div>

        <div className="flex gap-2">
          {errorType !== 'unsupported' && (
            <Button onClick={onRetry} variant="secondary" className="flex-1">
              <RotateCcw className="w-4 h-4 mr-2" />
              {t('error.retryButton')}
            </Button>
          )}
          <Button onClick={onBack} variant="secondary" className="flex-1">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('error.backButton')}
          </Button>
        </div>
      </div>
    </Card>
  )
}

export default ErrorPanel
