import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@toolbox/ui-kit'
import { Settings } from 'lucide-react'
import type { AIProvider, ViewMode, AIResponse } from './types'
import { getApiKey } from './utils/storage'
import ProviderSelector from './components/ProviderSelector'
import ApiKeyConfig from './components/ApiKeyConfig'
import PromptInput from './components/PromptInput'
import ViewModeToggle from './components/ViewModeToggle'
import GridView from './components/GridView'
import TabView from './components/TabView'
import ResponsePanel from './components/ResponsePanel'

const AiChatHub: React.FC = () => {
  const { t } = useTranslation('toolAiChatHub')
  const [selectedProviders, setSelectedProviders] = useState<AIProvider[]>([])
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [responses, setResponses] = useState<Map<AIProvider, AIResponse>>(new Map())
  const [isLoading, setIsLoading] = useState(false)
  const [configOpen, setConfigOpen] = useState(false)

  const handleSend = async (prompt: string) => {
    if (selectedProviders.length === 0) {
      alert(t('messages.selectAI'))
      return
    }

    // Check if all selected providers have API keys configured
    const unconfiguredProviders = selectedProviders.filter(provider => !getApiKey(provider))
    if (unconfiguredProviders.length > 0) {
      alert(t('messages.configureKey'))
      setConfigOpen(true)
      return
    }

    setIsLoading(true)

    // Initialize responses to loading state
    const newResponses = new Map<AIProvider, AIResponse>()
    selectedProviders.forEach(provider => {
      newResponses.set(provider, {
        provider,
        status: 'loading',
        content: ''
      })
    })
    setResponses(newResponses)

    // Simulate API calls with mock responses
    const mockApiCall = (provider: AIProvider): Promise<string> => {
      return new Promise((resolve) => {
        const delay = 1000 + Math.random() * 2000 // 1-3 seconds
        setTimeout(() => {
          const mockResponses = {
            chatgpt: `ChatGPT response to: "${prompt}"\n\nThis is a simulated response from ChatGPT. In production, this would be replaced with actual API calls to OpenAI's GPT models.`,
            gemini: `Gemini response to: "${prompt}"\n\nThis is a simulated response from Google Gemini. In production, this would be replaced with actual API calls to Google's Gemini API.`,
            deepseek: `DeepSeek response to: "${prompt}"\n\nThis is a simulated response from DeepSeek. In production, this would be replaced with actual API calls to DeepSeek's API.`,
            grok: `Grok response to: "${prompt}"\n\nThis is a simulated response from Grok. In production, this would be replaced with actual API calls to xAI's Grok API.`
          }
          resolve(mockResponses[provider])
        }, delay)
      })
    }

    // Process all providers concurrently
    const promises = selectedProviders.map(async (provider) => {
      try {
        const content = await mockApiCall(provider)
        setResponses(prev => {
          const updated = new Map(prev)
          updated.set(provider, {
            provider,
            status: 'success',
            content
          })
          return updated
        })
      } catch (error) {
        setResponses(prev => {
          const updated = new Map(prev)
          updated.set(provider, {
            provider,
            status: 'error',
            content: '',
            error: error instanceof Error ? error.message : t('errors.unknownError')
          })
          return updated
        })
      }
    })

    await Promise.all(promises)
    setIsLoading(false)
  }

  const handleRetry = (provider: AIProvider) => {
    const response = responses.get(provider)
    if (!response) return

    // For retry, we would need to store the original prompt
    // For now, just show a message
    alert('Retry functionality requires storing the original prompt. This will be implemented in the next iteration.')
  }

  const renderResponses = () => {
    const responsePanels = selectedProviders.map(provider => {
      const response = responses.get(provider) || {
        provider,
        status: 'idle' as const,
        content: ''
      }

      return (
        <ResponsePanel
          key={provider}
          provider={response.provider}
          status={response.status}
          content={response.content}
          error={response.error}
          onRetry={() => handleRetry(provider)}
        />
      )
    })

    if (viewMode === 'grid') {
      return <GridView>{responsePanels}</GridView>
    } else {
      const tabs = selectedProviders.map(provider => {
        const response = responses.get(provider) || {
          provider,
          status: 'idle' as const,
          content: ''
        }

        return {
          label: t(`providers.${provider}`),
          content: (
            <ResponsePanel
              provider={response.provider}
              status={response.status}
              content={response.content}
              error={response.error}
              onRetry={() => handleRetry(provider)}
            />
          )
        }
      })

      return <TabView tabs={tabs} />
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {t('title')}
          </h1>
          <Button
            onClick={() => setConfigOpen(true)}
            variant="secondary"
            size="sm"
            className="flex items-center gap-2"
          >
            <Settings size={16} />
            {t('buttons.configure')}
          </Button>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          {t('description')}
        </p>
      </div>

      <div className="space-y-4">
        <ProviderSelector
          selectedProviders={selectedProviders}
          onChange={setSelectedProviders}
        />

        <PromptInput
          onSend={handleSend}
          disabled={isLoading}
        />

        {selectedProviders.length > 0 && (
          <div className="flex justify-end">
            <ViewModeToggle
              currentMode={viewMode}
              onChange={setViewMode}
            />
          </div>
        )}

        {selectedProviders.length > 0 && renderResponses()}
      </div>

      <ApiKeyConfig
        isOpen={configOpen}
        onClose={() => setConfigOpen(false)}
      />
    </div>
  )
}

export default AiChatHub
