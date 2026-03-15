import { test, expect } from '@playwright/test'

test.describe('二维码功能测试', () => {
  test('二维码生成页面加载', async ({ page }) => {
    await page.goto('/qrcode/generate')
    await expect(page.getByRole('heading', { name: '二维码生成器' })).toBeVisible()
    await expect(page.getByPlaceholder('输入要生成二维码的内容')).toBeVisible()
  })

  test('生成二维码', async ({ page }) => {
    await page.goto('/qrcode/generate')
    await page.getByPlaceholder('输入要生成二维码的内容').fill('https://example.com')
    await page.getByRole('button', { name: '生成二维码' }).click()
    await expect(page.getByAltText('生成的二维码')).toBeVisible({ timeout: 5000 })
  })

  test('二维码解析页面加载', async ({ page }) => {
    await page.goto('/qrcode/read')
    await expect(page.getByRole('button', { name: '上传二维码图片' })).toBeVisible()
    await expect(page.getByRole('button', { name: '摄像头扫描' })).toBeVisible()
    await expect(page.getByPlaceholder('二维码内容将显示在这里')).toBeVisible()
  })
})
