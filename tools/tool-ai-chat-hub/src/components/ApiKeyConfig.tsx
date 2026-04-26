import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Card } from '@toolbox/ui-kit'
import { Eye, EyeOff, X } from 'lucide-react'
import type { AIProvider } from '../types'
import { saveApiKey, getApiKey, deleteApiKey } from '../utils/storage'

interface ApiKeyConfigProps {
  isOpen: boolean
  onClose: () => void
}

const PROVIDERS: AIProvider[] = ['chatgpt', 'gemini', 'deepseek', 'grok']

const ApiKeyConfig: React.FC<ApiKeyConfigProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation('toolAiChatHub')
  const [apiKeys, setApiKeys] = useState<Record<AIProvider, string>>({
    chatgpt: '',
    gemini: '',
    deepseek: '',
    grok: ''
  })
  const [showPassword, setShowPassword] = useState<Record<AIProvider, boolean>>({
    chatgpt: false,
    gemini: false,
    deepseek: false,
    grok: false
  })
  const [successMessage, setSuccessMessage] = useState<string>('')

  useEffect(() => {
    if (isOpen) {
      loadApiKeys()
    }
  }, [isOpen])

  const loadApiKeys = () => {
    const keys: Record<AIProvider, string> = {
      chatgpt: '',
      gemini: '',
      deepseek: '',
      grok: ''
    }

    PROVIDERS.forEach(provider => {
      const key = getApiKey(provider)
      if (key) {
        keys[provider] = maskApiKey(key)
      }
    })

    setApiKeys(keys)
  }

  const maskApiKey = (key: string): string => {
    if (key.length <= 6) return key
    const prefix = key.substring(0, 3)
    const suffix = key.substring(key.length - 3)
    return `${prefix}***...${suffix}`
  }

  const handleSave = (provider: AIProvider) => {
    const key = apiKeys[provider]
    if (!key || key.includes('***')) return

    saveApiKey(provider, key)
    setApiKeys(prev => ({ ...prev, [provider]: maskApiKey(key) }))
    showSuccessMessage(t('config.saveSuccess'))
  }

  const handleDelete = (provider: AIProvider) => {
    const confirmed = window.confirm(t('config.deleteConfirm'))
    if (!confirmed) return

    deleteApiKey(provider)
    setApiKeys(prev => ({ ...prev, [provider]: '' }))
    showSuccessMessage(t('config.deleteSuccess'))
  }

  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message)
    setTimeout(() => {
      setSuccessMessage('')
    }, 3000)
  }

  const togglePasswordVisibility = (provider: AIProvider) => {
    setShowPassword(prev => ({ ...prev, [provider]: !prev[provider] }))
  }

  const handleInputChange = (provider: AIProvider, value: string) => {
    setApiKeys(prev => ({ ...prev, [provider]: value }))
  }

  const isConfigured = (provider: AIProvider): boolean => {
    return !!getApiKey(provider)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        <Card className="relative">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {t('config.title')}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {successMessage && (
            <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-lg">
              {successMessage}
            </div>
          )}

          <div className="space-y-6">
            {PROVIDERS.map(provider => {
              const configured = isConfigured(provider)
              const inputValue = apiKeys[provider]
              const showPass = showPassword[provider]

              return (
                <div key={provider} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-b-0">
                  <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
                    {t(`providers.${provider}`)}
                  </h3>

                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <input
                          type={showPass ? 'text' : 'password'}
                          value={inputValue}
                          onChange={(e) => handleInputChange(provider, e.target.value)}
                          placeholder={t('config.apiKeyPlaceholder')}
                          className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility(provider)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                          aria-label="toggle password visibility"
                        >
                          {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleSave(provider)}
                        variant="primary"
                        size="sm"
                        disabled={!inputValue || inputValue.includes('***')}
                      >
                        {t('buttons.save')}
                      </Button>

                      {configured && (
                        <Button
                          onClick={() => handleDelete(provider)}
                          variant="danger"
                          size="sm"
                        >
                          {t('buttons.delete')}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={onClose} variant="secondary">
              {t('buttons.cancel')}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default ApiKeyConfig
