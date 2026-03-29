import { test, expect } from '@playwright/test'

test.describe('图片旋转工具 E2E 测试', () => {
  test('页面加载', async ({ page }) => {
    await page.goto('/image-rotator')
    await expect(page.getByRole('heading', { name: '图片旋转/翻转工具' })).toBeVisible()
    await expect(page.getByText('支持 90° 倍旋转、任意角度旋转')).toBeVisible()
  })

  test('快速旋转按钮', async ({ page }) => {
    await page.goto('/image-rotator')
    
    await expect(page.getByRole('button', { name: '-90°' })).toBeVisible()
    await expect(page.getByRole('button', { name: '0°' })).toBeVisible()
    await expect(page.getByRole('button', { name: '+90°' })).toBeVisible()
    await expect(page.getByRole('button', { name: '180°' })).toBeVisible()
    await expect(page.getByRole('button', { name: '270°' })).toBeVisible()
  })

  test('自定义角度滑块', async ({ page }) => {
    await page.goto('/image-rotator')
    
    const slider = page.getByRole('slider', { name: /角度/ })
    await expect(slider).toBeVisible()
  })

  test'翻转按钮', async ({ page }) => {
    await page.goto('/image-rotator')
    
    await expect(page.getByRole('button', { name: '水平翻转' })).toBeVisible()
    await expect(page.getByRole('button', { name: '垂直翻转' })).toBeVisible()
  })

  test('上传图片并应用旋转', async ({ page }) => {
    await page.goto('/image-rotator')
    
    const testImage = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    )
    
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles({
      name: 'test.png',
      mimeType: 'image/png',
      buffer: testImage
    })
    
    // 点击旋转按钮
    await page.getByRole('button', { name: '+90°' }).click()
    await expect(page.getByText('当前：90°')).toBeVisible()
  })
})
