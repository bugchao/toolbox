import React, { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Loader, CheckCircle, AlertCircle } from 'lucide-react'
import { Card, Button } from '@toolbox/ui-kit'
import type { AIProvider, ResponseStatus } from '../types'

export interface ResponsePanelProps {
  provider: AIProvider
  status: ResponseStatus
  content: string
  error?: string
  onRetry?: () => void
}

const ResponsePanel: React.FC<ResponsePanelProps> = ({
  provider,
  status,
  content,
  error,
  onRetry,
}) => {
  const { t } = useTranslation('toolAiChatHub')
  const contentRef = useRef<HTMLDivElement>(null)

  // Auto-scroll when content updates
  useEffect(() => {
    if (contentRef.current && status === 'success' && content) {
      contentRef.current.scrollIntoView?.({ behavior: 'smooth', block: 'end' })
    }
  }, [content, status])

  const getProviderName = () => {
    return t(`providers.${provider}`)
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader className="w-5 h-5 animate-spin" data-testid="loading-icon" />
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" data-testid="success-icon" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" data-testid="error-icon" />
      default:
        return null
    }
  }

  const renderContent = () => {
    switch (status) {
      case 'idle':
        return (
          <div className="text-gray-400 dark:text-gray-500 text-center py-8">
            {t('messages.noResponse')}
          </div>
        )
      case 'loading':
        return (
          <div className="text-gray-600 dark:text-gray-400 text-center py-8">
            {t('messages.thinking')}
          </div>
        )
      case 'success':
        return (
          <div
            ref={contentRef}
            className="prose dark:prose-invert max-w-none whitespace-pre-wrap"
          >
            {content}
          </div>
        )
      case 'error':
        return (
          <div className="space-y-4">
            <div className="text-red-600 dark:text-red-400">
              {error || t('errors.unknownError')}
            </div>
            {onRetry && (
              <Button onClick={onRetry} className="mt-4">
                {t('buttons.retry')}
              </Button>
            )}
          </div>
        )
    }
  }

  return (
    <Card className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {getProviderName()}
        </h3>
        {getStatusIcon()}
      </div>
      <div className="flex-1 overflow-auto">
        {renderContent()}
      </div>
    </Card>
  )
}

export default ResponsePanel
