import React from 'react'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import i18n from '../i18n'
import {
  buildFeedbackLinks,
  FEEDBACK_EMAIL,
  FEEDBACK_GITHUB_URL,
  FeedbackDialog,
} from './FeedbackDialog'

describe('buildFeedbackLinks', () => {
  it('builds email and GitHub URLs with page context', () => {
    const links = buildFeedbackLinks({
      subject: '[Bug 潮] 问题反馈：JSON 工具',
      prompt: '请描述问题：',
      pageTitle: 'JSON 工具',
      route: '/json',
      pageUrl: 'https://example.com/json',
      pageLabel: '页面',
      routeLabel: '路径',
      urlLabel: '链接',
    })

    expect(links.email).toContain(`mailto:${FEEDBACK_EMAIL}`)
    expect(decodeURIComponent(links.email)).toContain('问题反馈：JSON 工具')
    expect(decodeURIComponent(links.email)).toContain('路径: /json')

    const githubUrl = new URL(links.github)
    expect(`${githubUrl.origin}${githubUrl.pathname}`).toBe(FEEDBACK_GITHUB_URL)
    expect(githubUrl.searchParams.get('title')).toBe(
      '[Bug 潮] 问题反馈：JSON 工具',
    )
    expect(githubUrl.searchParams.get('body')).toContain(
      'https://example.com/json',
    )
  })
})

describe('FeedbackDialog', () => {
  afterEach(async () => {
    await act(async () => {
      await i18n.changeLanguage('zh')
    })
  })

  it('switches intent and exposes both external channels', async () => {
    await act(async () => {
      await i18n.changeLanguage('zh')
    })
    const onClose = vi.fn()
    render(
      <FeedbackDialog
        open
        onClose={onClose}
        pageTitle="JSON 工具"
        route="/json"
        pageUrl="https://example.com/json"
      />,
    )

    expect(
      screen.getByRole('dialog', { name: '反馈与建议' }),
    ).toBeInTheDocument()
    const githubLink = screen.getByRole('link', { name: /GitHub Issue/ })
    expect(githubLink).toHaveAttribute('target', '_blank')
    expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer')

    fireEvent.click(screen.getByRole('button', { name: /工具建议/ }))
    const emailLink = screen.getByRole('link', { name: /发送邮件/ })
    expect(decodeURIComponent(emailLink.getAttribute('href') || '')).toContain(
      '工具建议：JSON 工具',
    )
  })

  it('moves focus into the dialog, closes with Escape, and returns focus', async () => {
    await act(async () => {
      await i18n.changeLanguage('en')
    })
    const onClose = vi.fn()
    const trigger = document.createElement('button')
    trigger.textContent = 'Open'
    document.body.appendChild(trigger)
    trigger.focus()

    const { rerender } = render(
      <FeedbackDialog
        open
        onClose={onClose}
        pageTitle="JSON"
        route="/json"
        pageUrl="https://example.com/json"
      />,
    )

    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: /Report a problem/ }),
      ).toHaveFocus(),
    )
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)

    rerender(
      <FeedbackDialog
        open={false}
        onClose={onClose}
        pageTitle="JSON"
        route="/json"
        pageUrl="https://example.com/json"
      />,
    )
    expect(trigger).toHaveFocus()
    trigger.remove()
  })
})
