import { test, expect } from '@playwright/test'

test.describe('AI Chat Hub E2E Tests', () => {
  test('页面加载正常', async ({ page }) => {
    await page.goto('/ai-chat-hub')
    await expect(page.getByRole('heading', { name: 'AI 聊天中心' })).toBeVisible()
    await expect(page.getByText('同时与多个 AI（ChatGPT、Gemini、DeepSeek、Grok）对话并对比回答')).toBeVisible()
  })

  test('AI 提供商选择器显示', async ({ page }) => {
    await page.goto('/ai-chat-hub')

    // Check all provider options are visible
    await expect(page.getByText('ChatGPT')).toBeVisible()
    await expect(page.getByText('Gemini')).toBeVisible()
    await expect(page.getByText('DeepSeek')).toBeVisible()
    await expect(page.getByText('Grok')).toBeVisible()
  })

  test('配置按钮打开配置对话框', async ({ page }) => {
    await page.goto('/ai-chat-hub')

    // Click configure button
    await page.getByRole('button', { name: '配置' }).click()

    // Check if config dialog appears
    await expect(page.getByText('API 密钥配置')).toBeVisible()
  })

  test('未选择 AI 时发送显示错误提示', async ({ page }) => {
    await page.goto('/ai-chat-hub')

    // Try to send without selecting any AI
    const input = page.getByPlaceholder('输入您的消息...')
    await input.fill('Hello, AI!')
    await page.getByRole('button', { name: '发送' }).click()

    // Check error message appears
    await expect(page.getByText('请至少选择一个 AI 提供商')).toBeVisible()
  })

  test('选择 AI 提供商并配置密钥', async ({ page }) => {
    await page.goto('/ai-chat-hub')

    // Select ChatGPT provider
    const chatgptCheckbox = page.locator('input[type="checkbox"]').first()
    await chatgptCheckbox.check()

    // Open config dialog
    await page.getByRole('button', { name: '配置' }).click()

    // Configure API key (mock)
    const apiKeyInput = page.getByPlaceholder('请输入您的 API 密钥').first()
    await apiKeyInput.fill('sk-test-mock-api-key-12345')

    // Save configuration
    await page.getByRole('button', { name: '保存' }).click()

    // Verify config saved (dialog should close)
    await expect(page.getByText('API 密钥配置')).not.toBeVisible({ timeout: 2000 })
  })

  test('发送消息并验证响应区域', async ({ page }) => {
    await page.goto('/ai-chat-hub')

    // Select ChatGPT
    const chatgptCheckbox = page.locator('input[type="checkbox"]').first()
    await chatgptCheckbox.check()

    // Configure mock API key
    await page.evaluate(() => {
      localStorage.setItem('ai-chat-hub-apikey-chatgpt', 'sk-test-mock-key')
    })

    // Reload to apply storage
    await page.reload()
    await chatgptCheckbox.check()

    // Send a message
    const input = page.getByPlaceholder('输入您的消息...')
    await input.fill('What is AI?')
    await page.getByRole('button', { name: '发送' }).click()

    // Check loading state appears
    await expect(page.getByText('思考中...')).toBeVisible({ timeout: 2000 })

    // Wait for response (mock has 1-3 second delay)
    await expect(page.getByText(/ChatGPT response to/)).toBeVisible({ timeout: 5000 })
  })

  test('切换视图模式', async ({ page }) => {
    await page.goto('/ai-chat-hub')

    // Select multiple providers
    const checkboxes = page.locator('input[type="checkbox"]')
    await checkboxes.nth(0).check()
    await checkboxes.nth(1).check()

    // Configure mock API keys
    await page.evaluate(() => {
      localStorage.setItem('ai-chat-hub-apikey-chatgpt', 'sk-test-mock-key-1')
      localStorage.setItem('ai-chat-hub-apikey-gemini', 'sk-test-mock-key-2')
    })

    await page.reload()
    await checkboxes.nth(0).check()
    await checkboxes.nth(1).check()

    // View mode toggle should appear when providers are selected
    await expect(page.getByRole('button', { name: '平铺视图' })).toBeVisible()

    // Switch to tab view
    await page.getByRole('button', { name: '标签视图' }).click()

    // Verify tab view is active
    await expect(page.getByRole('button', { name: '标签视图' })).toHaveClass(/bg-blue/)
  })

  test('多个 AI 同时响应', async ({ page }) => {
    await page.goto('/ai-chat-hub')

    // Select two providers
    const checkboxes = page.locator('input[type="checkbox"]')
    await checkboxes.nth(0).check()
    await checkboxes.nth(1).check()

    // Configure mock API keys
    await page.evaluate(() => {
      localStorage.setItem('ai-chat-hub-apikey-chatgpt', 'sk-test-mock-key-1')
      localStorage.setItem('ai-chat-hub-apikey-gemini', 'sk-test-mock-key-2')
    })

    await page.reload()
    await checkboxes.nth(0).check()
    await checkboxes.nth(1).check()

    // Send message
    const input = page.getByPlaceholder('输入您的消息...')
    await input.fill('Compare your capabilities')
    await page.getByRole('button', { name: '发送' }).click()

    // Both should show loading
    const loadingStates = page.getByText('思考中...')
    await expect(loadingStates.first()).toBeVisible({ timeout: 2000 })

    // Both should eventually show responses
    await expect(page.getByText(/ChatGPT response to/)).toBeVisible({ timeout: 5000 })
    await expect(page.getByText(/Gemini response to/)).toBeVisible({ timeout: 5000 })
  })

  test('错误处理和重试功能', async ({ page }) => {
    await page.goto('/ai-chat-hub')

    // Select provider
    const chatgptCheckbox = page.locator('input[type="checkbox"]').first()
    await chatgptCheckbox.check()

    // Configure mock API key
    await page.evaluate(() => {
      localStorage.setItem('ai-chat-hub-apikey-chatgpt', 'sk-test-mock-key')
    })

    await page.reload()
    await chatgptCheckbox.check()

    // Send multiple messages to potentially trigger an error (10% chance)
    for (let i = 0; i < 3; i++) {
      const input = page.getByPlaceholder('输入您的消息...')
      await input.fill(`Test message ${i + 1}`)
      await page.getByRole('button', { name: '发送' }).click()

      // Wait for response or error
      await page.waitForTimeout(4000)

      // Check if retry button appears (error occurred)
      const retryButton = page.getByRole('button', { name: '重试' })
      if (await retryButton.isVisible()) {
        // Click retry
        await retryButton.click()

        // Verify loading state after retry
        await expect(page.getByText('思考中...')).toBeVisible({ timeout: 2000 })
        break
      }
    }
  })

  test('响应式设计 - 移动端视图', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/ai-chat-hub')

    // Page should still be accessible on mobile
    await expect(page.getByRole('heading', { name: 'AI 聊天中心' })).toBeVisible()
    await expect(page.getByText('ChatGPT')).toBeVisible()

    // Select provider
    const chatgptCheckbox = page.locator('input[type="checkbox"]').first()
    await chatgptCheckbox.check()

    // Input should be usable
    const input = page.getByPlaceholder('输入您的消息...')
    await expect(input).toBeVisible()
  })
})
