import { test, expect } from '@playwright/test'

test.describe('图片裁剪工具 E2E 测试', () => {
  test('页面加载', async ({ page }) => {
    await page.goto('/image-cropper')
    await expect(page.getByRole('heading', { name: '图片裁剪工具' })).toBeVisible()
    await expect(page.getByText('自由裁剪或按预设比例裁剪')).toBeVisible()
  })

  test('裁剪比例选择', async ({ page }) => {
    await page.goto('/image-cropper')
    
    const ratios = ['自由', '1:1', '4:3', '3:2', '16:9', '9:16', 'A4']
    const select = page.getByLabel('裁剪比例')
    await expect(select).toBeVisible()
  })

  test('旋转控制', async ({ page }) => {
    await page.goto('/image-cropper')
    
    await expect(page.getByRole('button', { name: '-90°' })).toBeVisible()
    await expect(page.getByRole('button', { name: '+90°' })).toBeVisible()
    await expect(page.getByRole('button', { name: '重置' })).toBeVisible()
  })

  test('翻转控制', async ({ page }) => {
    await page.goto('/image-cropper')
    
    await expect(page.getByRole('button', { name: '水平' })).toBeVisible()
    await expect(page.getByRole('button', { name: '垂直' })).toBeVisible()
  })

  test('上传图片', async ({ page }) => {
    await page.goto('/image-cropper')
    
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
