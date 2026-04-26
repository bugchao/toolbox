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
  deleteApiKey: vi.fn(),
  getBaseURL: vi.fn(() => null),
  saveBaseURL: vi.fn(),
  deleteBaseURL: vi.fn()
}))

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Settings: () => <div data-testid="settings-icon" />,
  LayoutGrid: () => <div data-testid="grid-icon" />,
  Columns: () => <div data-testid="tab-icon" />,
  CheckCircle: () => <div data-testid="check-icon" />,
  CheckCircle2: () => <div data-testid="check-circle2-icon" />,
  AlertCircle: () => <div data-testid="alert-icon" />,
  Loader: () => <div data-testid="loader-icon" />,
  Eye: () => <div data-testid="eye-icon" />,
  EyeOff: () => <div data-testid="eye-off-icon" />,
  X: () => <div data-testid="x-icon" />,
  Info: () => <div data-testid="info-icon" />,
  AlertTriangle: () => <div data-testid="alert-triangle-icon" />,
  TriangleAlert: () => <div data-testid="triangle-alert-icon" />,
  XCircle: () => <div data-testid="x-circle-icon" />
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

  it('shows error message when sending without selecting providers', () => {
    render(<AiChatHub />)

    const textarea = screen.getByPlaceholderText('Enter your message...')
    fireEvent.change(textarea, { target: { value: 'Test message' } })

    const sendButton = screen.getByText('Send')
    fireEvent.click(sendButton)

    expect(screen.getByText('Please select at least one AI provider')).toBeInTheDocument()
  })

  it('does not show view mode toggle when no providers selected', () => {
    render(<AiChatHub />)
    expect(screen.queryByText('Grid View')).not.toBeInTheDocument()
  })

  it('opens config modal when configure button is clicked', async () => {
    render(<AiChatHub />)

    const configButton = screen.getByText('Configure')
    fireEvent.click(configButton)

    // ApiKeyConfig modal should be rendered - check for multiple provider names
    await waitFor(() => {
      const chatgptElements = screen.getAllByText('ChatGPT')
      expect(chatgptElements.length).toBeGreaterThan(1) // Should appear in both selector and modal
    })
  })
})
