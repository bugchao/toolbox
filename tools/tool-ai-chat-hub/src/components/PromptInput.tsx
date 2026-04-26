import React, { useState, KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { TextArea, Button } from '@toolbox/ui-kit'

export interface PromptInputProps {
  onSend: (prompt: string) => void
  disabled?: boolean
}

const PromptInput: React.FC<PromptInputProps> = ({ onSend, disabled = false }) => {
  const { t } = useTranslation('toolAiChatHub')
  const [prompt, setPrompt] = useState('')

  const handleSend = () => {
    const trimmedPrompt = prompt.trim()
    if (trimmedPrompt && !disabled) {
      onSend(trimmedPrompt)
      setPrompt('')
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handleSend()
    }
  }

  const isSendDisabled = disabled || !prompt.trim()

  return (
    <div className="flex flex-col gap-2">
      <TextArea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={t('messages.enterPrompt')}
        rows={4}
        disabled={disabled}
      />
      <div className="flex justify-end">
        <Button
          onClick={handleSend}
          disabled={isSendDisabled}
          variant="primary"
          size="md"
        >
          {t('buttons.send')}
        </Button>
      </div>
    </div>
  )
}

export default PromptInput
