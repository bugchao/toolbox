import { test, expect } from '@playwright/test'

test.describe('Screen Recorder', () => {
  test('renders idle panel with start button', async ({ page }) => {
    await page.goto('/screen-recorder')

    // Check title
    await expect(page.getByRole('heading', { name: /screen recorder/i })).toBeVisible()

    // Check idle panel elements
    await expect(page.getByText(/recording options/i)).toBeVisible()
    await expect(page.getByText(/include system audio/i)).toBeVisible()
    await expect(page.getByText(/include microphone/i)).toBeVisible()
    await expect(page.getByText(/output format/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /start recording/i })).toBeVisible()

    // Take screenshot
    await page.screenshot({ path: 'docs/tools/screen-recorder/screenshots/idle.png', fullPage: true })
  })

  test('shows unsupported message when getDisplayMedia is unavailable', async ({ page, context }) => {
    // Mock missing API
    await context.addInitScript(() => {
      // @ts-ignore
      delete navigator.mediaDevices.getDisplayMedia
    })

    await page.goto('/screen-recorder')

    await expect(page.getByText(/does not support screen recording/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /start recording/i })).not.toBeVisible()
  })
})
