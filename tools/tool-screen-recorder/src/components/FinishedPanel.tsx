import React from 'react'
import { useTranslation } from 'react-i18next'
import { Card, Button, formatBytes } from '@toolbox/ui-kit'
import { Download, RotateCcw } from 'lucide-react'
import { formatDuration } from '../lib/formatDuration'
import { getExtensionForMime } from '../lib/getMimeTypes'

interface FinishedPanelProps {
  videoUrl: string
  durationSeconds: number
  sizeBytes: number
  mimeType: string
  onRestart: () => void
}

const FinishedPanel: React.FC<FinishedPanelProps> = ({
  videoUrl,
  durationSeconds,
  sizeBytes,
  mimeType,
  onRestart,
}) => {
  const { t } = useTranslation('toolScreenRecorder')

  const handleDownload = () => {
    const now = new Date()
    const timestamp = now.toISOString().replace(/[-:]/g, '').split('.')[0].replace('T', '-')
    const ext = getExtensionForMime(mimeType)
    const filename = `screen-recording-${timestamp}.${ext}`

    const a = document.createElement('a')
    a.href = videoUrl
    a.download = filename
    a.click()
  }

  return (
    <Card className="max-w-2xl mx-auto p-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{t('finished.previewLabel')}</h3>

        <video
          src={videoUrl}
          controls
          className="w-full rounded-md bg-black"
        />

        <div className="flex justify-between text-sm">
          <div>
            <span className="text-gray-500 dark:text-gray-400">{t('finished.durationLabel')}: </span>
            <span className="font-mono">{formatDuration(durationSeconds)}</span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">{t('finished.sizeLabel')}: </span>
            <span className="font-mono">{formatBytes(sizeBytes)}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleDownload} className="flex-1">
            <Download className="w-4 h-4 mr-2" />
            {t('finished.downloadButton')}
          </Button>
          <Button onClick={onRestart} variant="secondary" className="flex-1">
            <RotateCcw className="w-4 h-4 mr-2" />
            {t('finished.restartButton')}
          </Button>
        </div>
      </div>
    </Card>
  )
}

export default FinishedPanel
