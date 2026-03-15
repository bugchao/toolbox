import { test, expect } from '@playwright/test'

test.describe('DNSSEC 检测', () => {
  test('页面加载正常', async ({ page }) => {
    await page.goto('/dnssec-check')
    await expect(page.getByRole('heading', { name: 'DNSSEC 检测' })).toBeVisible()
    await expect(page.getByPlaceholder('example.com')).toBeVisible()
    await expect(page.getByRole('button', { name: '检测 DNSSEC' })).toBeVisible()
  })

  test('未填域名点击会提示', async ({ page }) => {
    await page.goto('/dnssec-check')
    await page.getByRole('button', { name: '检测 DNSSEC' }).click()
    await expect(page.getByText('请输入域名')).toBeVisible()
  })

  test('输入域名后可点击检测', async ({ page }) => {
    await page.goto('/dnssec-check')
    await page.getByPlaceholder('example.com').fill('dns.google')
    await page.getByRole('button', { name: '检测 DNSSEC' }).click()
    await expect(page.getByRole('button', { name: '检测中…' })).toBeVisible({ timeout: 5000 })
  })
})
