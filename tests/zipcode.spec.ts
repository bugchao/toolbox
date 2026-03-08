import { test, expect } from '@playwright/test';

test.describe('邮政编码查询功能测试', () => {
  test('页面加载正常', async ({ page }) => {
    await page.goto('/zipcode');
    await expect(page.getByRole('heading', { name: '邮政编码查询' })).toBeVisible();
  });

  test('查询邮编功能', async ({ page }) => {
    await page.goto('/zipcode');
    
    // 输入地址
    await page.getByPlaceholder('例如：北京海淀区 或 100080').fill('北京海淀区');
    
    // 点击查询
    await page.getByRole('button', { name: '查询' }).click();
    
    // 验证结果
    await expect(page.getByText('北京市')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('海淀区')).toBeVisible();
  });

  test('通过邮编查询地址', async ({ page }) => {
    await page.goto('/zipcode');
    
    // 输入邮编
    await page.getByPlaceholder('例如：北京海淀区 或 100080').fill('100080');
    
    // 点击查询
    await page.getByRole('button', { name: '查询' }).click();
    
    // 验证结果
    await expect(page.getByText('100080')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('北京市')).toBeVisible();
  });

  test('回车提交查询', async ({ page }) => {
    await page.goto('/zipcode');
    
    // 输入内容并按回车
    await page.getByPlaceholder('例如：北京海淀区 或 100080').fill('上海浦东新区');
    await page.keyboard.press('Enter');
    
    // 验证结果
    await expect(page.getByText('上海市')).toBeVisible({ timeout: 5000 });
  });
});
