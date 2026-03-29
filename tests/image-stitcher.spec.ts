import { test, expect } from '@playwright/test'

test.describe('图片拼接工具 E2E 测试', () => {
  test('页面加载', async ({ page }) => {
    await page.goto('/image-stitcher')
    await expect(page.getByRole('heading', { name: '图片拼接工具' })).toBeVisible()
    await expect(page.getByText('将多张图片横向或纵向拼接')).toBeVisible()
  })

  test('拼接方向选择', async ({ page }) => {
    await page.goto('/image-stitcher')
    
    await expect(page.getByRole('button', { name: '横向' })).toBeVisible()
    await expect(page.getByRole('button', { name: '纵向' })).toBeVisible()
  })

  test('间距设置', async ({ page }) => {
    await page.goto('/image-stitcher')
    
    const gapSlider = page.getByLabel(/间距/)
    await expect(gapSlider).toBeVisible()
    await expect(gapSlider).toHaveValue('0')
  })

  test('背景色选择', async ({ page }) => {
    await page.goto('/image-stitcher')
    
    await expect(page.locator('input[type="color"]')).toBeVisible()
    await expect(page.locator('input[type="text"][value="#ffffff"]')).toBeVisible()
  })

  test('上传多张图片', async ({ page }) => {
    await page.goto('/image-stitcher')
    
    const testImage = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    )
    
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles([
      { name: 'test1.png', mimeType: 'image/png', buffer: testImage },
      { name: 'test2.png', mimeType: 'image/png', buffer: testImage }
    ])
    
    await expect(page.getByText('test1.png')).toBeVisible()
    await expect(page.getByText('test2.png')).toBeVisible()
    await expect(page.getByText('图片列表 (2 张)')).toBeVisible()
  })

  test('开始拼接按钮', async ({ page }) => {
    await page.goto('/image-stitcher')
    
    const testImage = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    )
    
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles([
      { name: 'test1.png', mimeType: 'image/png', buffer: testImage },
      { name: 'test2.png', mimeType: 'image/png', buffer: testImage }
    ])
    
    await expect(page.getByRole('button', { name: '开始拼接' })).toBeVisible()
  })
})
