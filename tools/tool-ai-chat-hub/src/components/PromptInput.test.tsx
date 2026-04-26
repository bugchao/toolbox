import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { I18nextProvider } from 'react-i18next'
import i18n from 'i18next'
import PromptInput from './PromptInput'

// Mock i18n
i18n.init({
  lng: 'zh',
  ns: ['toolAiChatHub'],
  defaultNS: 'toolAiChatHub',
  resources: {
    zh: {
      toolAiChatHub: {
        messages: {
          enterPrompt: '输入您的消息...'
        },
        buttons: {
          send: '发送'
        }
      }
    }
  }
})

const renderWithI18n = (component: React.ReactElement) => {
  return render(<I18nextProvider i18n={i18n}>{component}</I18nextProvider>)
}

describe('PromptInput', () => {
  const mockOnSend = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders textarea and send button', () => {
    renderWithI18n(<PromptInput onSend={mockOnSend} />)

    expect(screen.getByPlaceholderText('输入您的消息...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '发送' })).toBeInTheDocument()
  })

  it('disables send button when input is empty', () => {
    renderWithI18n(<PromptInput onSend={mockOnSend} />)

    const sendButton = screen.getByRole('button', { name: '发送' })
    expect(sendButton).toBeDisabled()
  })

  it('enables send button when input has text', () => {
    renderWithI18n(<PromptInput onSend={mockOnSend} />)

    const textarea = screen.getByPlaceholderText('输入您的消息...')
    const sendButton = screen.getByRole('button', { name: '发送' })

    fireEvent.change(textarea, { target: { value: 'Hello AI' } })

    expect(sendButton).not.toBeDisabled()
  })

  it('calls onSend with prompt text when send button is clicked', () => {
    renderWithI18n(<PromptInput onSend={mockOnSend} />)

    const textarea = screen.getByPlaceholderText('输入您的消息...')
    const sendButton = screen.getByRole('button', { name: '发送' })

    fireEvent.change(textarea, { target: { value: 'Hello AI' } })
    fireEvent.click(sendButton)

    expect(mockOnSend).toHaveBeenCalledWith('Hello AI')
  })

  it('clears input after sending', () => {
    renderWithI18n(<PromptInput onSend={mockOnSend} />)

    const textarea = screen.getByPlaceholderText('输入您的消息...') as HTMLTextAreaElement
    const sendButton = screen.getByRole('button', { name: '发送' })

    fireEvent.change(textarea, { target: { value: 'Hello AI' } })
    fireEvent.click(sendButton)

    expect(textarea.value).toBe('')
  })

  it('sends message with Ctrl+Enter on Windows/Linux', () => {
    renderWithI18n(<PromptInput onSend={mockOnSend} />)

    const textarea = screen.getByPlaceholderText('输入您的消息...')

    fireEvent.change(textarea, { target: { value: 'Hello AI' } })
    fireEvent.keyDown(textarea, { key: 'Enter', ctrlKey: true })

    expect(mockOnSend).toHaveBeenCalledWith('Hello AI')
  })

  it('sends message with Cmd+Enter on Mac', () => {
    renderWithI18n(<PromptInput onSend={mockOnSend} />)

    const textarea = screen.getByPlaceholderText('输入您的消息...')

    fireEvent.change(textarea, { target: { value: 'Hello AI' } })
    fireEvent.keyDown(textarea, { key: 'Enter', metaKey: true })

    expect(mockOnSend).toHaveBeenCalledWith('Hello AI')
  })

  it('does not send message with Enter alone', () => {
    renderWithI18n(<PromptInput onSend={mockOnSend} />)

    const textarea = screen.getByPlaceholderText('输入您的消息...')

    fireEvent.change(textarea, { target: { value: 'Hello AI' } })
    fireEvent.keyDown(textarea, { key: 'Enter' })

    expect(mockOnSend).not.toHaveBeenCalled()
  })

  it('does not send empty message with keyboard shortcut', () => {
    renderWithI18n(<PromptInput onSend={mockOnSend} />)

    const textarea = screen.getByPlaceholderText('输入您的消息...')

    fireEvent.keyDown(textarea, { key: 'Enter', ctrlKey: true })

    expect(mockOnSend).not.toHaveBeenCalled()
  })

  it('trims whitespace from prompt before sending', () => {
    renderWithI18n(<PromptInput onSend={mockOnSend} />)

    const textarea = screen.getByPlaceholderText('输入您的消息...')
    const sendButton = screen.getByRole('button', { name: '发送' })

    fireEvent.change(textarea, { target: { value: '  Hello AI  ' } })
    fireEvent.click(sendButton)

    expect(mockOnSend).toHaveBeenCalledWith('Hello AI')
  })

  it('disables send button when disabled prop is true', () => {
    renderWithI18n(<PromptInput onSend={mockOnSend} disabled={true} />)

    const textarea = screen.getByPlaceholderText('输入您的消息...')
    const sendButton = screen.getByRole('button', { name: '发送' })

    fireEvent.change(textarea, { target: { value: 'Hello AI' } })

    expect(sendButton).toBeDisabled()
  })

  it('does not send when disabled prop is true', () => {
    renderWithI18n(<PromptInput onSend={mockOnSend} disabled={true} />)

    const textarea = screen.getByPlaceholderText('输入您的消息...')

    fireEvent.change(textarea, { target: { value: 'Hello AI' } })
    fireEvent.keyDown(textarea, { key: 'Enter', ctrlKey: true })

    expect(mockOnSend).not.toHaveBeenCalled()
  })

  it('treats whitespace-only input as empty', () => {
    renderWithI18n(<PromptInput onSend={mockOnSend} />)

    const textarea = screen.getByPlaceholderText('输入您的消息...')
    const sendButton = screen.getByRole('button', { name: '发送' })

    fireEvent.change(textarea, { target: { value: '   ' } })

    expect(sendButton).toBeDisabled()
  })
})
