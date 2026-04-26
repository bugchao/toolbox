import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, Switch } from '@toolbox/ui-kit'
import { AlertCircle, CheckCircle } from 'lucide-react'
import type { AIProvider } from '../types'
import { getApiKey } from '../utils/storage'

interface ProviderSelectorProps {
  selectedProviders: AIProvider[]
  onChange: (providers: AIProvider[]) => void
}

const PROVIDERS: AIProvider[] = ['chatgpt', 'gemini', 'deepseek', 'grok']

const ProviderSelector: React.FC<ProviderSelectorProps> = ({ selectedProviders, onChange }) => {
  const { t } = useTranslation('toolAiChatHub')

  const providerConfigs = useMemo(() => {
    return PROVIDERS.map(provider => ({
      provider,
      name: t(`providers.${provider}`),
      configured: !!getApiKey(provider)
    }))
  }, [t])

  const handleToggle = (provider: AIProvider, checked: boolean) => {
    if (checked) {
      onChange([...selectedProviders, provider])
    } else {
      onChange(selectedProviders.filter(p => p !== provider))
    }
  }

  return (
    <Card>
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
        {t('providers.selectProvider')}
      </h3>
      <div className="space-y-3">
        {providerConfigs.map(({ provider, name, configured }) => {
          const isSelected = selectedProviders.includes(provider)

          return (
            <div
              key={provider}
              className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <Switch
                checked={isSelected}
                onChange={(checked) => handleToggle(provider, checked)}
                label={name}
              />

              <div className="flex items-center gap-2">
                {configured ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <span className="text-xs text-green-600 dark:text-green-400">
                      {t('providers.configured')}
                    </span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span className="text-xs text-amber-600 dark:text-amber-400">
                      {t('providers.notConfigured')}
                    </span>
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

export default ProviderSelector
