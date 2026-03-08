import { test, expect } from '@playwright/test';

test.describe('天气查询功能测试', () => {
  test('页面加载正常', async ({ page }) => {
    await page.goto('/weather');
    await expect(page.getByRole('heading', { name: '天气查询' })).toBeVisible();
  });

  test('查询城市天气', async ({ page }) => {
    await page.goto('/weather');
    
    // 输入城市
    await page.getByPlaceholder('例如：北京、上海、广州、深圳').fill('北京');
    
    // 点击查询
    await page.getByRole('button', { name: '查询' }).click();
    
    // 验证结果显示
    await expect(page.getByText('北京')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('°C')).toBeVisible();
  });

  test('7天预报显示正常', async ({ page }) => {
    await page.goto('/weather');
    await page.getByPlaceholder('例如：北京、上海、广州、深圳').fill('上海');
    await page.getByRole('button', { name: '查询' }).click();
    
    // 验证7天预报卡片
    await expect(page.getByText('未来7天预报')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.grid > div')).toHaveCount(7);
  });
});
