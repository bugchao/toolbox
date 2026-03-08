import { test, expect } from '@playwright/test';

test.describe('每日热点功能测试', () => {
  test('页面加载正常', async ({ page }) => {
    await page.goto('/news');
    await expect(page.getByRole('heading', { name: '每日热点' })).toBeVisible();
  });

  test('新闻分类正常', async ({ page }) => {
    await page.goto('/news');
    
    // 验证所有分类标签存在
    const categories = ['全部', '科技', '体育', 'AI', 'OpenClaw', 'MCP', '国际'];
    for (const category of categories) {
      await expect(page.getByRole('button', { name: category })).toBeVisible();
    }
  });

  test('刷新新闻功能', async ({ page }) => {
    await page.goto('/news');
    
    // 点击刷新按钮
    await page.getByRole('button', { name: '刷新' }).click();
    
    // 验证加载状态
    await expect(page.getByText('刷新中...')).toBeVisible();
    
    // 验证新闻列表显示
    await expect(page.locator('a').first()).toBeVisible({ timeout: 10000 });
  });

  test('分类筛选功能', async ({ page }) => {
    await page.goto('/news');
    
    // 点击科技分类
    await page.getByRole('button', { name: '科技' }).click();
    
    // 验证分类被选中
    await expect(page.getByRole('button', { name: '科技' })).toHaveClass(/bg-indigo-600/);
  });
});
