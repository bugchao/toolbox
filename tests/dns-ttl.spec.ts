import { test, expect } from '@playwright/test'

test.describe('DNS TTL 查看工具', () => {
  test('页面加载正常', async ({ page }) => {
    await page.goto('/dns-ttl')
    await expect(page.getByRole('heading', { name: 'DNS TTL 查看工具' })).toBeVisible()
    await expect(page.getByPlaceholder('example.com')).toBeVisible()
    await expect(page.getByRole('button', { name: '查询 TTL' })).toBeVisible()
  })

  test('未填域名点击会提示', async ({ page }) => {
    await page.goto('/dns-ttl')
    await page.getByRole('button', { name: '查询 TTL' }).click()
    await expect(page.getByText('请输入域名')).toBeVisible()
  })

  test('输入域名后可查询', async ({ page }) => {
    await page.goto('/dns-ttl')
    await page.getByPlaceholder('example.com').fill('google.com')
    await page.getByRole('button', { name: '查询 TTL' }).click()
    await expect(page.getByRole('button', { name: '查询中…' })).toBeVisible({ timeout: 5000 })
  })
})
