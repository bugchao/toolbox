import { test, expect } from '@playwright/test';

test.describe('首页测试', () => {
  test('页面加载正常', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/工具盒子/);
    await expect(page.getByRole('heading', { name: '欢迎使用工具盒子' })).toBeVisible();
  });

  test('工具列表显示正常', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('二维码生成')).toBeVisible();
    await expect(page.getByText('二维码解析')).toBeVisible();
    await expect(page.getByText('每日热点')).toBeVisible();
    await expect(page.getByText('邮政编码查询')).toBeVisible();
    await expect(page.getByText('天气查询')).toBeVisible();
  });

  test('导航跳转正常', async ({ page }) => {
    await page.goto('/');
    
    // 跳转到二维码生成页面
    await page.getByText('二维码生成').first().click();
    await expect(page).toHaveURL('/qrcode/generate');
    await expect(page.getByRole('heading', { name: '二维码生成器' })).toBeVisible();
    
    // 返回首页
    await page.getByText('首页').click();
    await expect(page).toHaveURL('/');
  });

  test('移动端响应式正常', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // 移动端菜单按钮可见
    await expect(page.getByRole('button', { name: '☰' })).toBeVisible();
    
    // 点击菜单展开
    await page.getByRole('button', { name: '☰' }).click();
    await expect(page.getByText('二维码生成')).toBeVisible();
  });
});
