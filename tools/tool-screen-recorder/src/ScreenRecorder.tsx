import React from 'react'
import { useTranslation } from 'react-i18next'
import { PageHero } from '@toolbox/ui-kit'
import { useScreenRecorder } from './hooks/useScreenRecorder'
import IdlePanel from './components/IdlePanel'
import RecordingPanel from './components/RecordingPanel'
import FinishedPanel from './components/FinishedPanel'
import ErrorPanel from './components/ErrorPanel'

const ScreenRecorder: React.FC = () => {
  const { t } = useTranslation('toolScreenRecorder')
  const {
    state,
    errorType,
    elapsedSeconds,
    estimatedSizeBytes,
    videoUrl,
    finalSizeBytes,
    finalDurationSeconds,
    warningDismissed,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    reset,
    dismissWarning,
  } = useScreenRecorder()

  if (!navigator.mediaDevices?.getDisplayMedia) {
    return (
      <div className="container mx-auto px-4 py-8">
        <PageHero
          title={t('title')}
          description={t('description')}
        />
        <ErrorPanel
          errorType="unsupported"
          onRetry={reset}
          onBack={reset}
        />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHero
        title={t('title')}
        description={t('description')}
      />

      {state === 'idle' && (
        <IdlePanel onStart={startRecording} />
      )}

      {state === 'requesting' && (
        <div className="max-w-md mx-auto p-6 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            {t('idle.hint')}
          </p>
        </div>
      )}

      {(state === 'recording' || state === 'paused') && (
        <RecordingPanel
          state={state}
          elapsedSeconds={elapsedSeconds}
          estimatedSizeBytes={estimatedSizeBytes}
          warningDismissed={warningDismissed}
          onPause={pauseRecording}
          onResume={resumeRecording}
          onStop={stopRecording}
          onDismissWarning={dismissWarning}
        />
      )}

      {state === 'finished' && videoUrl && (
        <FinishedPanel
          videoUrl={videoUrl}
          durationSeconds={finalDurationSeconds}
          sizeBytes={finalSizeBytes}
          mimeType="video/webm"
          onRestart={reset}
        />
      )}

      {state === 'error' && errorType && (
        <ErrorPanel
          errorType={errorType}
          onRetry={reset}
          onBack={reset}
        />
      )}
    </div>
  )
}

export default ScreenRecorder
