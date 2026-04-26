import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import AiChatHub from './AiChatHub'

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'title': 'AI Chat Hub',
        'description': 'Chat with multiple AIs',
        'buttons.configure': 'Configure',
        'buttons.send': 'Send',
        'messages.selectAI': 'Please select at least one AI provider',
        'messages.configureKey': 'Please configure API key',
        'messages.enterPrompt': 'Enter your message...',
        'providers.chatgpt': 'ChatGPT',
        'providers.gemini': 'Gemini',
        'providers.deepseek': 'DeepSeek',
        'providers.grok': 'Grok',
        'providers.selectProvider': 'Select AI Provider',
        'providers.configured': 'Configured',
        'providers.notConfigured': 'Not Configured',
        'viewModes.grid': 'Grid View',
        'viewModes.tab': 'Tab View'
      }
      return translations[key] || key
    }
  })
}))

// Mock storage
vi.mock('./utils/storage', () => ({
  getApiKey: vi.fn(() => null),
  saveApiKey: vi.fn(),
  deleteApiKey: vi.fn()
}))

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Settings: () => <div data-testid="settings-icon" />,
  LayoutGrid: () => <div data-testid="grid-icon" />,
  Columns: () => <div data-testid="tab-icon" />,
  CheckCircle: () => <div data-testid="check-icon" />,
  AlertCircle: () => <div data-testid="alert-icon" />,
  Loader: () => <div data-testid="loader-icon" />,
  Eye: () => <div data-testid="eye-icon" />,
  EyeOff: () => <div data-testid="eye-off-icon" />,
  X: () => <div data-testid="x-icon" />
}))

describe('AiChatHub', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the main title and description', () => {
    render(<AiChatHub />)
    expect(screen.getByText('AI Chat Hub')).toBeInTheDocument()
    expect(screen.getByText('Chat with multiple AIs')).toBeInTheDocument()
  })

  it('renders the configure button', () => {
    render(<AiChatHub />)
    expect(screen.getByText('Configure')).toBeInTheDocument()
  })

  it('renders provider selector', () => {
    render(<AiChatHub />)
    expect(screen.getByText('Select AI Provider')).toBeInTheDocument()
  })

  it('renders prompt input', () => {
    render(<AiChatHub />)
    expect(screen.getByPlaceholderText('Enter your message...')).toBeInTheDocument()
  })

  it('shows alert when sending without selecting providers', () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
    render(<AiChatHub />)

    const sendButton = screen.getByText('Send')
    fireEvent.click(sendButton)

    expect(alertSpy).toHaveBeenCalledWith('Please select at least one AI provider')
    alertSpy.mockRestore()
  })

  it('does not show view mode toggle when no providers selected', () => {
    render(<AiChatHub />)
    expect(screen.queryByText('Grid View')).not.toBeInTheDocument()
  })

  it('opens config modal when configure button is clicked', () => {
    render(<AiChatHub />)

    const configButton = screen.getByText('Configure')
    fireEvent.click(configButton)

    // ApiKeyConfig modal should be rendered
    expect(screen.getByText('API Key Configuration')).toBeInTheDocument()
  })
})
