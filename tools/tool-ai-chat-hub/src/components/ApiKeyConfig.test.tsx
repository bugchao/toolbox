import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { I18nextProvider } from 'react-i18next'
import i18n from 'i18next'
import ApiKeyConfig from './ApiKeyConfig'
import * as storage from '../utils/storage'
import enTranslations from '../locales/en.json'
import zhTranslations from '../locales/zh.json'

i18n.init({
  lng: 'en',
  fallbackLng: 'en',
  resources: {
    en: { translation: enTranslations },
    zh: { translation: zhTranslations }
  }
})

vi.mock('../utils/storage', () => ({
  saveApiKey: vi.fn(),
  getApiKey: vi.fn(),
  deleteApiKey: vi.fn()
}))

describe('ApiKeyConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const renderComponent = (props = {}) => {
    return render(
      <I18nextProvider i18n={i18n}>
        <ApiKeyConfig isOpen={true} onClose={vi.fn()} {...props} />
      </I18nextProvider>
    )
  }

  it('should render modal when isOpen is true', () => {
    renderComponent()
    expect(screen.getByText(/API Key Configuration|API 密钥配置/i)).toBeInTheDocument()
  })

  it('should not render modal when isOpen is false', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <ApiKeyConfig isOpen={false} onClose={vi.fn()} />
      </I18nextProvider>
    )
    expect(screen.queryByText(/API Key Configuration|API 密钥配置/i)).not.toBeInTheDocument()
  })

  it('should display all AI providers', () => {
    renderComponent()
    expect(screen.getByText('ChatGPT')).toBeInTheDocument()
    expect(screen.getByText('Gemini')).toBeInTheDocument()
    expect(screen.getByText('DeepSeek')).toBeInTheDocument()
    expect(screen.getByText('Grok')).toBeInTheDocument()
  })

  it('should allow entering and saving API key', async () => {
    const mockSaveApiKey = vi.mocked(storage.saveApiKey)
    const mockGetApiKey = vi.mocked(storage.getApiKey)
    mockGetApiKey.mockReturnValue(null)

    renderComponent()

    const inputs = screen.getAllByPlaceholderText(/Enter your API key|请输入您的 API 密钥/i)
    const chatgptInput = inputs[0]

    fireEvent.change(chatgptInput, { target: { value: 'sk-test-key-123' } })
    expect(chatgptInput).toHaveValue('sk-test-key-123')

    const saveButtons = screen.getAllByText(/Save|保存/)
    fireEvent.click(saveButtons[0])

    await waitFor(() => {
      expect(mockSaveApiKey).toHaveBeenCalledWith('chatgpt', 'sk-test-key-123')
    })
  })

  it('should display masked API key for configured providers', () => {
    const mockGetApiKey = vi.mocked(storage.getApiKey)
    mockGetApiKey.mockImplementation((provider) => {
      if (provider === 'chatgpt') return 'sk-1234567890abcdef'
      return null
    })

    renderComponent()

    const inputs = screen.getAllByPlaceholderText(/Enter your API key|请输入您的 API 密钥/i)
    const chatgptInput = inputs[0]

    expect(chatgptInput).toHaveValue('sk-***...def')
  })

  it('should toggle password visibility', () => {
    const mockGetApiKey = vi.mocked(storage.getApiKey)
    mockGetApiKey.mockReturnValue(null)

    renderComponent()

    const inputs = screen.getAllByPlaceholderText(/Enter your API key|请输入您的 API 密钥/i)
    const chatgptInput = inputs[0]

    expect(chatgptInput).toHaveAttribute('type', 'password')

    const eyeButtons = screen.getAllByRole('button', { name: /toggle/i })
    fireEvent.click(eyeButtons[0])

    expect(chatgptInput).toHaveAttribute('type', 'text')
  })

  it('should show delete button for configured providers', () => {
    const mockGetApiKey = vi.mocked(storage.getApiKey)
    mockGetApiKey.mockImplementation((provider) => {
      if (provider === 'chatgpt') return 'sk-1234567890abcdef'
      return null
    })

    renderComponent()

    const deleteButtons = screen.getAllByText(/Delete|删除/)
    expect(deleteButtons.length).toBeGreaterThan(0)
  })

  it('should confirm before deleting API key', async () => {
    const mockGetApiKey = vi.mocked(storage.getApiKey)
    const mockDeleteApiKey = vi.mocked(storage.deleteApiKey)
    mockGetApiKey.mockImplementation((provider) => {
      if (provider === 'chatgpt') return 'sk-1234567890abcdef'
      return null
    })

    // Mock window.confirm
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)

    renderComponent()

    const deleteButtons = screen.getAllByText(/Delete|删除/)
    fireEvent.click(deleteButtons[0])

    await waitFor(() => {
      expect(confirmSpy).toHaveBeenCalled()
      expect(mockDeleteApiKey).toHaveBeenCalledWith('chatgpt')
    })

    confirmSpy.mockRestore()
  })

  it('should not delete API key if user cancels confirmation', async () => {
    const mockGetApiKey = vi.mocked(storage.getApiKey)
    const mockDeleteApiKey = vi.mocked(storage.deleteApiKey)
    mockGetApiKey.mockImplementation((provider) => {
      if (provider === 'chatgpt') return 'sk-1234567890abcdef'
      return null
    })

    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false)

    renderComponent()

    const deleteButtons = screen.getAllByText(/Delete|删除/)
    fireEvent.click(deleteButtons[0])

    await waitFor(() => {
      expect(confirmSpy).toHaveBeenCalled()
      expect(mockDeleteApiKey).not.toHaveBeenCalled()
    })

    confirmSpy.mockRestore()
  })

  it('should call onClose when close button is clicked', () => {
    const mockOnClose = vi.fn()
    renderComponent({ onClose: mockOnClose })

    const closeButton = screen.getByText(/Cancel|取消/)
    fireEvent.click(closeButton)

    expect(mockOnClose).toHaveBeenCalled()
  })

  it('should display success message after saving', async () => {
    const mockSaveApiKey = vi.mocked(storage.saveApiKey)
    const mockGetApiKey = vi.mocked(storage.getApiKey)
    mockGetApiKey.mockReturnValue(null)

    renderComponent()

    const inputs = screen.getAllByPlaceholderText(/Enter your API key|请输入您的 API 密钥/i)
    fireEvent.change(inputs[0], { target: { value: 'sk-test-key' } })

    const saveButtons = screen.getAllByText(/Save|保存/)
    fireEvent.click(saveButtons[0])

    await waitFor(() => {
      expect(mockSaveApiKey).toHaveBeenCalled()
      expect(screen.getByText(/saved successfully|保存成功/i)).toBeInTheDocument()
    })
  })
})
