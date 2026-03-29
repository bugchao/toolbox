import { test, expect } from '@playwright/test'

test.describe('图片水印工具 E2E 测试', () => {
  test('页面加载', async ({ page }) => {
    await page.goto('/image-watermark')
    await expect(page.getByRole('heading', { name: '图片水印工具' })).toBeVisible()
    await expect(page.getByText('为图片添加文字或 Logo 水印')).toBeVisible()
  })

  test('文字水印设置', async ({ page }) => {
    await page.goto('/image-watermark')
    
    // 切换到文字水印
    await page.getByRole('button', { name: '文字水印' }).click()
    await expect(page.getByLabel('水印文字')).toBeVisible()
    await expect(page.getByLabel('字体大小')).toBeVisible()
    await expect(page.getByLabel('文字颜色')).toBeVisible()
    await expect(page.getByLabel('透明度')).toBeVisible()
  })

  test('Logo 水印设置', async ({ page }) => {
    await page.goto('/image-watermark')
    
    // 切换到 Logo 水印
    await page.getByRole('button', { name: 'Logo 水印' }).click()
    await expect(page.getByText('上传 Logo')).toBeVisible()
    await expect(page.getByLabel('Logo 大小')).toBeVisible()
  })

  test('上传图片', async ({ page }) => {
    await page.goto('/image-watermark')
    
    // 创建测试图片
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
    
    // 验证图片已上传
    await expect(page.getByText('test.png')).toBeVisible()
  })

  test('位置选择', async ({ page }) => {
    await page.goto('/image-watermark')
    
    // 测试位置按钮
    const positions = ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center']
    for (const pos of positions) {
      await page.getByRole('button', { name: new RegExp(pos) }).click()
    }
  })
})
