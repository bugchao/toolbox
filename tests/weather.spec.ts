import { test, expect } from '@playwright/test'

test.describe('天气查询功能测试', () => {
  test('页面加载正常', async ({ page }) => {
    await page.goto('/weather')
    await expect(page.getByRole('heading', { name: '天气查询' })).toBeVisible()
    await expect(page.getByPlaceholder('例如：北京、上海、广州、深圳')).toBeVisible()
    const main = page.locator('main')
    await expect(main.getByRole('button', { name: '查询', exact: true })).toBeVisible()
  })
})
