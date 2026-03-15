import { test, expect } from '@playwright/test'

test.describe('全球 DNS 解析检测', () => {
  test('页面加载正常', async ({ page }) => {
    await page.goto('/dns-global-check')
    await expect(page.getByRole('heading', { name: '全球 DNS 解析检测' })).toBeVisible()
    await expect(page.getByPlaceholder('example.com')).toBeVisible()
    await expect(page.getByRole('button', { name: '开始检测' })).toBeVisible()
  })

  test('未填域名点击检测会提示', async ({ page }) => {
    await page.goto('/dns-global-check')
    await page.getByRole('button', { name: '开始检测' }).click()
    await expect(page.getByText('请输入域名')).toBeVisible()
  })

  test('输入域名后开始检测', async ({ page }) => {
    await page.goto('/dns-global-check')
    await page.getByPlaceholder('example.com').fill('google.com')
    await page.getByRole('button', { name: '开始检测' }).click()
    await expect(page.getByRole('button', { name: '检测中…' })).toBeVisible({ timeout: 5000 })
  })
})
