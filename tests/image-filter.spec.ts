import { test, expect } from '@playwright/test'

test.describe('图片滤镜工具 E2E 测试', () => {
  test('页面加载', async ({ page }) => {
    await page.goto('/image-filter')
    await expect(page.getByRole('heading', { name: '图片滤镜工具' })).toBeVisible()
    await expect(page.getByText('提供 12 种预设滤镜')).toBeVisible()
  })

  test('预设滤镜显示', async ({ page }) => {
    await page.goto('/image-filter')
    
    const filters = ['原图', '鲜艳', '柔和', '复古', '黑白', '棕褐色', '冷色', '暖色', '梦幻', '胶片', '负片', '朦胧']
    for (const filter of filters) {
      await expect(page.getByRole('button', { name: filter })).toBeVisible()
    }
  })

  test('高级调整参数', async ({ page }) => {
    await page.goto('/image-filter')
    
    await expect(page.getByLabel(/亮度/)).toBeVisible()
    await expect(page.getByLabel(/对比度/)).toBeVisible()
    await expect(page.getByLabel(/饱和度/)).toBeVisible()
    await expect(page.getByLabel(/色温/)).toBeVisible()
    await expect(page.getByLabel(/灰度/)).toBeVisible()
    await expect(page.getByLabel(/模糊/)).toBeVisible()
  })

  test('选择预设滤镜', async ({ page }) => {
    await page.goto('/image-filter')
    
    // 点击黑白滤镜
    await page.getByRole('button', { name: '黑白' }).click()
    
    // 验证参数已更新
    const saturationSlider = page.getByLabel(/饱和度/)
    await expect(saturationSlider).toHaveValue('0')
  })

  test('上传图片', async ({ page }) => {
    await page.goto('/image-filter')
    
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
    
    await expect(page.getByText('test.png')).toBeVisible()
  })
})
