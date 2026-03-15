import { test, expect } from '@playwright/test'

test.describe('每日热点功能测试', () => {
  test('页面加载正常', async ({ page }) => {
    await page.goto('/news')
    await expect(page.getByRole('heading', { name: '每日热点' })).toBeVisible()
  })

  test('新闻分类按钮存在', async ({ page }) => {
    await page.goto('/news')
    const main = page.locator('main')
    const categories = ['全部', '科技', '体育']
    for (const category of categories) {
      await expect(main.getByRole('button', { name: category, exact: true })).toBeVisible()
    }
  })

  test('刷新按钮可点击', async ({ page }) => {
    await page.goto('/news')
    const main = page.locator('main')
    await expect(main.getByRole('button', { name: '刷新' })).toBeVisible()
    await main.getByRole('button', { name: '刷新' }).click()
    await expect(main.getByText('刷新中...').or(main.getByRole('button', { name: '刷新' }))).toBeVisible({ timeout: 10000 })
  })
})
