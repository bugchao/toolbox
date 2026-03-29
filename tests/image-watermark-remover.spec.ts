import { test, expect } from '@playwright/test'

test.describe('图片去水印工具 E2E 测试', () => {
  test('页面加载', async ({ page }) => {
    await page.goto('/image-watermark-remover')
    await expect(page.getByRole('heading', { name: '图片去水印工具' })).toBeVisible()
    await expect(page.getByText('智能识别并涂抹水印区域')).toBeVisible()
  })

  test'使用说明显示', async ({ page }) => {
    await page.goto('/image-watermark-remover')
    
    await expect(page.getByText('使用说明')).toBeVisible()
    await expect(page.getByText('使用红色画笔涂抹水印区域')).toBeVisible()
  })

  test('画笔大小调节', async ({ page }) => {
    await page.goto('/image-watermark-remover')
    
    const brushSlider = page.getByLabel(/画笔大小/)
    await expect(brushSlider).toBeVisible()
    await expect(brushSlider).toHaveValue('30')
  })

  test('工具按钮', async ({ page }) => {
    await page.goto('/image-watermark-remover')
    
    await expect(page.getByRole('button', { name: '清除标记' })).toBeVisible()
    await expect(page.getByRole('button', { name: '去除水印' })).toBeVisible()
  })

  test('上传图片', async ({ page }) => {
    await page.goto('/image-watermark-remover')
    
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

  test('画布显示', async ({ page }) => {
    await page.goto('/image-watermark-remover')
    
    const canvas = page.locator('canvas')
    await expect(canvas).toBeVisible()
  })
})
