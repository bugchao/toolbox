import { test, expect } from '@playwright/test'

test.describe('DNS 服务器性能测试', () => {
  test('页面加载正常', async ({ page }) => {
    await page.goto('/dns-performance')
    await expect(page.getByRole('heading', { name: 'DNS 服务器性能测试' })).toBeVisible()
    await expect(page.getByPlaceholder('google.com')).toBeVisible()
    await expect(page.getByRole('button', { name: '开始测试' })).toBeVisible()
  })

  test('关于 53 端口说明存在', async ({ page }) => {
    await page.goto('/dns-performance')
    const main = page.locator('main')
    await expect(main.getByText('关于 53 端口')).toBeVisible()
  })

  test('输入域名后可开始测试', async ({ page }) => {
    await page.goto('/dns-performance')
    await page.getByPlaceholder('google.com').fill('cloudflare.com')
    await page.getByRole('button', { name: '开始测试' }).click()
    await expect(page.getByRole('button', { name: '测试中…' })).toBeVisible({ timeout: 5000 })
  })
})
