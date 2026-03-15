import { test, expect } from '@playwright/test'

test.describe('邮政编码查询功能测试', () => {
  test('页面加载正常', async ({ page }) => {
    await page.goto('/zipcode')
    await expect(page.getByRole('heading', { name: '邮政编码查询' })).toBeVisible()
    await expect(page.getByPlaceholder('例如：北京海淀区 或 100080')).toBeVisible()
    const main = page.locator('main')
    await expect(main.getByRole('button', { name: '查询', exact: true })).toBeVisible()
  })
})
