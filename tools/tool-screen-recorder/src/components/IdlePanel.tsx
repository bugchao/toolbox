import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, Button, Switch } from '@toolbox/ui-kit'
import { getSupportedMimeTypes, getDefaultMimeType } from '../lib/getMimeTypes'

interface IdlePanelProps {
  onStart: (options: { includeSystemAudio: boolean; includeMic: boolean; mimeType: string }) => void
}

const IdlePanel: React.FC<IdlePanelProps> = ({ onStart }) => {
  const { t } = useTranslation('toolScreenRecorder')
  const [includeSystemAudio, setIncludeSystemAudio] = useState(false)
  const [includeMic, setIncludeMic] = useState(false)
  const [mimeType, setMimeType] = useState(getDefaultMimeType() || '')

  const supportedMimes = getSupportedMimeTypes()

  return (
    <Card className="max-w-md mx-auto p-6">
      <h3 className="text-lg font-semibold mb-4">{t('idle.title')}</h3>
      <div className="space-y-4">
        <Switch
          checked={includeSystemAudio}
          onChange={setIncludeSystemAudio}
          label={t('idle.includeSystemAudio')}
        />
        <Switch
          checked={includeMic}
          onChange={setIncludeMic}
          label={t('idle.includeMic')}
        />
        <div>
          <label className="block text-sm font-medium mb-2">{t('idle.mimeType')}</label>
          <select
            value={mimeType}
            onChange={(e) => setMimeType(e.target.value)}
            className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-600"
          >
            {supportedMimes.map(mime => (
              <option key={mime} value={mime}>{mime}</option>
            ))}
          </select>
        </div>
        <Button
          onClick={() => onStart({ includeSystemAudio, includeMic, mimeType })}
          className="w-full"
        >
          {t('idle.startButton')}
        </Button>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
          {t('idle.hint')}
        </p>
      </div>
    </Card>
  )
}

export default IdlePanel
