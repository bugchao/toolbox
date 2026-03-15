import { test, expect } from '@playwright/test'

test.describe('首页测试', () => {
  test('页面加载正常', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Bug 潮/)
    await expect(page.getByRole('heading', { name: '欢迎 · Bug 潮' })).toBeVisible()
  })

  test('工具列表显示正常', async ({ page }) => {
    await page.goto('/')
    const main = page.locator('main')
    await expect(main.getByRole('heading', { name: '二维码生成' })).toBeVisible()
    await expect(main.getByRole('heading', { name: '二维码解析' })).toBeVisible()
    await expect(main.getByRole('heading', { name: '每日热点' })).toBeVisible()
    await expect(main.getByRole('heading', { name: '邮编查询' })).toBeVisible()
    await expect(main.getByRole('heading', { name: '天气查询' })).toBeVisible()
  })

  test('导航跳转正常', async ({ page }) => {
    await page.goto('/')
    const main = page.locator('main')
    await main.getByText('二维码生成').first().click()
    await expect(page).toHaveURL('/qrcode/generate')
    await expect(page.getByRole('heading', { name: '二维码生成器' })).toBeVisible()
  })

  test('移动端菜单正常', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    await page.getByRole('button', { name: 'Open menu' }).click()
    await expect(page.getByText('二维码生成')).toBeVisible()
  })
})
