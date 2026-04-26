import React from 'react'
import { useTranslation } from 'react-i18next'
import { Card, Button, formatBytes } from '@toolbox/ui-kit'
import { Pause, Play, Square, AlertTriangle } from 'lucide-react'
import { formatDuration } from '../lib/formatDuration'

interface RecordingPanelProps {
  state: 'recording' | 'paused'
  elapsedSeconds: number
  estimatedSizeBytes: number
  warningDismissed: boolean
  onPause: () => void
  onResume: () => void
  onStop: () => void
  onDismissWarning: () => void
}

const RecordingPanel: React.FC<RecordingPanelProps> = ({
  state,
  elapsedSeconds,
  estimatedSizeBytes,
  warningDismissed,
  onPause,
  onResume,
  onStop,
  onDismissWarning,
}) => {
  const { t } = useTranslation('toolScreenRecorder')
  const showWarning = estimatedSizeBytes > 1024 * 1024 * 1024 && !warningDismissed

  return (
    <Card className="max-w-md mx-auto p-6">
      <div className="space-y-4">
        <div className="text-center">
          <div className="text-3xl font-mono font-bold">
            {formatDuration(elapsedSeconds)}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {state === 'recording' ? t('recording.statusRecording') : t('recording.statusPaused')}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm">{t('recording.sizeLabel')}</span>
          <span className="font-mono text-sm">{formatBytes(estimatedSizeBytes)}</span>
        </div>

        {showWarning && (
          <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
            <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                {t('recording.sizeWarning')}
              </p>
            </div>
            <button
              onClick={onDismissWarning}
              className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-200"
            >
              ×
            </button>
          </div>
        )}

        <div className="flex gap-2">
          {state === 'recording' ? (
            <Button onClick={onPause} variant="secondary" className="flex-1">
              <Pause className="w-4 h-4 mr-2" />
              {t('recording.pauseButton')}
            </Button>
          ) : (
            <Button onClick={onResume} variant="secondary" className="flex-1">
              <Play className="w-4 h-4 mr-2" />
              {t('recording.resumeButton')}
            </Button>
          )}
          <Button onClick={onStop} variant="destructive" className="flex-1">
            <Square className="w-4 h-4 mr-2" />
            {t('recording.stopButton')}
          </Button>
        </div>
      </div>
    </Card>
  )
}

export default RecordingPanel
