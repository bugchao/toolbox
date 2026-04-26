import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { I18nextProvider } from 'react-i18next'
import i18n from 'i18next'
import ProviderSelector from './ProviderSelector'
import type { AIProvider } from '../types'
import * as storage from '../utils/storage'

// Mock i18n
i18n.init({
  lng: 'zh',
  resources: {
    zh: {
      translation: {
        providers: {
          chatgpt: 'ChatGPT',
          gemini: 'Gemini',
          deepseek: 'DeepSeek',
          grok: 'Grok',
          configured: '已配置',
          notConfigured: '未配置'
        }
      }
    }
  }
})

vi.mock('../utils/storage')

const renderWithI18n = (component: React.ReactElement) => {
  return render(<I18nextProvider i18n={i18n}>{component}</I18nextProvider>)
}

describe('ProviderSelector', () => {
  const mockOnChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders all four AI providers', () => {
    vi.mocked(storage.getApiKey).mockReturnValue(null)

    renderWithI18n(<ProviderSelector selectedProviders={[]} onChange={mockOnChange} />)

    expect(screen.getByText('ChatGPT')).toBeInTheDocument()
    expect(screen.getByText('Gemini')).toBeInTheDocument()
    expect(screen.getByText('DeepSeek')).toBeInTheDocument()
    expect(screen.getByText('Grok')).toBeInTheDocument()
  })

  it('shows configured status for providers with API keys', () => {
    vi.mocked(storage.getApiKey).mockImplementation((provider: AIProvider) => {
      return provider === 'chatgpt' ? 'test-key' : null
    })

    renderWithI18n(<ProviderSelector selectedProviders={[]} onChange={mockOnChange} />)

    // ChatGPT should show as configured
    expect(screen.getByText('已配置')).toBeInTheDocument()

    // Others should show as not configured
    const notConfiguredElements = screen.getAllByText('未配置')
    expect(notConfiguredElements.length).toBeGreaterThan(0)
  })

  it('displays initial selected providers as checked', () => {
    vi.mocked(storage.getApiKey).mockReturnValue('test-key')

    renderWithI18n(
      <ProviderSelector
        selectedProviders={['chatgpt', 'gemini']}
        onChange={mockOnChange}
      />
    )

    const chatgptCheckbox = screen.getByRole('switch', { name: /chatgpt/i })
    const geminiCheckbox = screen.getByRole('switch', { name: /gemini/i })
    const deepseekCheckbox = screen.getByRole('switch', { name: /deepseek/i })

    expect(chatgptCheckbox).toHaveAttribute('aria-checked', 'true')
    expect(geminiCheckbox).toHaveAttribute('aria-checked', 'true')
    expect(deepseekCheckbox).toHaveAttribute('aria-checked', 'false')
  })

  it('calls onChange when a provider is selected', () => {
    vi.mocked(storage.getApiKey).mockReturnValue('test-key')

    renderWithI18n(<ProviderSelector selectedProviders={[]} onChange={mockOnChange} />)

    const chatgptCheckbox = screen.getByRole('switch', { name: /chatgpt/i })
    fireEvent.click(chatgptCheckbox)

    expect(mockOnChange).toHaveBeenCalledWith(['chatgpt'])
  })

  it('calls onChange when a provider is deselected', () => {
    vi.mocked(storage.getApiKey).mockReturnValue('test-key')

    renderWithI18n(
      <ProviderSelector
        selectedProviders={['chatgpt', 'gemini']}
        onChange={mockOnChange}
      />
    )

    const chatgptCheckbox = screen.getByRole('switch', { name: /chatgpt/i })
    fireEvent.click(chatgptCheckbox)

    expect(mockOnChange).toHaveBeenCalledWith(['gemini'])
  })

  it('allows multiple providers to be selected', () => {
    vi.mocked(storage.getApiKey).mockReturnValue('test-key')

    renderWithI18n(
      <ProviderSelector selectedProviders={['chatgpt']} onChange={mockOnChange} />
    )

    const geminiCheckbox = screen.getByRole('switch', { name: /gemini/i })
    fireEvent.click(geminiCheckbox)

    expect(mockOnChange).toHaveBeenCalledWith(['chatgpt', 'gemini'])
  })

  it('shows warning icon for unconfigured providers', () => {
    vi.mocked(storage.getApiKey).mockImplementation((provider: AIProvider) => {
      return provider === 'chatgpt' ? 'test-key' : null
    })

    renderWithI18n(<ProviderSelector selectedProviders={[]} onChange={mockOnChange} />)

    // Should have warning indicators for unconfigured providers
    const notConfiguredElements = screen.getAllByText('未配置')
    expect(notConfiguredElements.length).toBe(3) // gemini, deepseek, grok
  })
})
