import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { I18nextProvider } from 'react-i18next'
import i18n from 'i18next'
import ResponsePanel from './ResponsePanel'
import type { AIProvider, ResponseStatus } from '../types'

// Mock i18n
i18n.init({
  lng: 'en',
  resources: {
    en: {
      translation: {
        providers: {
          chatgpt: 'ChatGPT',
          gemini: 'Gemini',
          deepseek: 'DeepSeek',
          grok: 'Grok',
        },
        messages: {
          noResponse: 'No response yet',
          thinking: 'Thinking...',
        },
        buttons: {
          retry: 'Retry',
        },
        errors: {
          unknownError: 'Unknown error occurred',
        },
      },
    },
  },
})

const renderWithI18n = (component: React.ReactElement) => {
  return render(<I18nextProvider i18n={i18n}>{component}</I18nextProvider>)
}

describe('ResponsePanel', () => {
  const mockProvider: AIProvider = 'chatgpt'

  describe('idle state', () => {
    it('should render placeholder when status is idle', () => {
      renderWithI18n(
        <ResponsePanel
          provider={mockProvider}
          status="idle"
          content=""
        />
      )

      expect(screen.getByText(/no response yet/i)).toBeInTheDocument()
    })

    it('should display provider name', () => {
      renderWithI18n(
        <ResponsePanel
          provider={mockProvider}
          status="idle"
          content=""
        />
      )

      expect(screen.getByText('ChatGPT')).toBeInTheDocument()
    })
  })

  describe('loading state', () => {
    it('should show loading animation when status is loading', () => {
      renderWithI18n(
        <ResponsePanel
          provider={mockProvider}
          status="loading"
          content=""
        />
      )

      expect(screen.getByText(/thinking/i)).toBeInTheDocument()
      expect(screen.getByTestId('loading-icon')).toBeInTheDocument()
    })
  })

  describe('success state', () => {
    it('should render content when status is success', () => {
      const content = 'This is the AI response'
      renderWithI18n(
        <ResponsePanel
          provider={mockProvider}
          status="success"
          content={content}
        />
      )

      expect(screen.getByText(content)).toBeInTheDocument()
    })

    it('should show success icon', () => {
      renderWithI18n(
        <ResponsePanel
          provider={mockProvider}
          status="success"
          content="Response"
        />
      )

      expect(screen.getByTestId('success-icon')).toBeInTheDocument()
    })

    it('should render markdown-style content with proper formatting', () => {
      const content = 'Hello **bold** text'
      renderWithI18n(
        <ResponsePanel
          provider={mockProvider}
          status="success"
          content={content}
        />
      )

      // Content should be rendered (we'll use pre-wrap for simple formatting)
      expect(screen.getByText(/Hello/)).toBeInTheDocument()
    })
  })

  describe('error state', () => {
    it('should display error message when status is error', () => {
      const errorMessage = 'API key is invalid'
      renderWithI18n(
        <ResponsePanel
          provider={mockProvider}
          status="error"
          content=""
          error={errorMessage}
        />
      )

      expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })

    it('should show error icon', () => {
      renderWithI18n(
        <ResponsePanel
          provider={mockProvider}
          status="error"
          content=""
          error="Error occurred"
        />
      )

      expect(screen.getByTestId('error-icon')).toBeInTheDocument()
    })

    it('should render retry button when onRetry is provided', () => {
      const onRetry = vi.fn()
      renderWithI18n(
        <ResponsePanel
          provider={mockProvider}
          status="error"
          content=""
          error="Error"
          onRetry={onRetry}
        />
      )

      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
    })

    it('should call onRetry when retry button is clicked', async () => {
      const onRetry = vi.fn()
      renderWithI18n(
        <ResponsePanel
          provider={mockProvider}
          status="error"
          content=""
          error="Error"
          onRetry={onRetry}
        />
      )

      const retryButton = screen.getByRole('button', { name: /retry/i })
      fireEvent.click(retryButton)

      expect(onRetry).toHaveBeenCalledTimes(1)
    })

    it('should not render retry button when onRetry is not provided', () => {
      renderWithI18n(
        <ResponsePanel
          provider={mockProvider}
          status="error"
          content=""
          error="Error"
        />
      )

      expect(screen.queryByRole('button', { name: /retry/i })).not.toBeInTheDocument()
    })
  })

  describe('auto-scroll behavior', () => {
    it('should auto-scroll when content updates', () => {
      const scrollIntoViewMock = vi.fn()
      Element.prototype.scrollIntoView = scrollIntoViewMock

      const { rerender } = renderWithI18n(
        <ResponsePanel
          provider={mockProvider}
          status="success"
          content="Initial content"
        />
      )

      rerender(
        <I18nextProvider i18n={i18n}>
          <ResponsePanel
            provider={mockProvider}
            status="success"
            content="Initial content\nNew line added"
          />
        </I18nextProvider>
      )

      expect(scrollIntoViewMock).toHaveBeenCalled()
    })
  })

  describe('different providers', () => {
    it('should render correct name for gemini', () => {
      renderWithI18n(
        <ResponsePanel
          provider="gemini"
          status="idle"
          content=""
        />
      )

      expect(screen.getByText('Gemini')).toBeInTheDocument()
    })

    it('should render correct name for deepseek', () => {
      renderWithI18n(
        <ResponsePanel
          provider="deepseek"
          status="idle"
          content=""
        />
      )

      expect(screen.getByText('DeepSeek')).toBeInTheDocument()
    })

    it('should render correct name for grok', () => {
      renderWithI18n(
        <ResponsePanel
          provider="grok"
          status="idle"
          content=""
        />
      )

      expect(screen.getByText('Grok')).toBeInTheDocument()
    })
  })
})
