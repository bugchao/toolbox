import { test, expect } from '@playwright/test'

test.describe('AI PPT 生成器', () => {
  test('页面加载正常', async ({ page }) => {
    await page.goto('/ppt-generator')
    await expect(page.getByRole('heading', { name: 'AI PPT 生成器' })).toBeVisible()
    await expect(page.getByRole('button', { name: '生成大纲' })).toBeVisible()
    await expect(page.getByRole('button', { name: '生成并下载 PPT' })).toBeVisible()
  })

  test('未填主题点击生成大纲会提示', async ({ page }) => {
    await page.goto('/ppt-generator')
    await page.getByRole('button', { name: '生成大纲' }).click()
    await expect(page.getByText('请输入主题')).toBeVisible()
  })

  test('填写主题可生成大纲', async ({ page }) => {
    await page.goto('/ppt-generator')
    await page.getByPlaceholder('例如：产品发布会、季度总结、技术分享').fill('技术分享')
    await page.getByRole('button', { name: '生成大纲' }).click()
    await expect(page.getByText('技术分享')).toBeVisible()
  })
})
