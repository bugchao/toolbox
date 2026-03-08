import { test, expect } from '@playwright/test';

test.describe('二维码功能测试', () => {
  test('二维码生成功能正常', async ({ page }) => {
    await page.goto('/qrcode/generate');
    
    // 输入内容
    await page.getByPlaceholder('输入要生成二维码的内容').fill('https://openclaw.ai');
    
    // 点击生成
    await page.getByRole('button', { name: '生成二维码' }).click();
    
    // 验证二维码生成
    await expect(page.getByAltText('生成的二维码')).toBeVisible({ timeout: 5000 });
    
    // 验证下载按钮可用
    await expect(page.getByRole('button', { name: '下载' })).toBeEnabled();
  });

  test('二维码解析页面功能正常', async ({ page }) => {
    await page.goto('/qrcode/read');
    
    // 验证上传按钮存在
    await expect(page.getByRole('button', { name: '上传二维码图片' })).toBeVisible();
    
    // 验证摄像头按钮存在
    await expect(page.getByRole('button', { name: '摄像头扫描' })).toBeVisible();
    
    // 验证结果区域存在
    await expect(page.getByPlaceholder('二维码内容将显示在这里')).toBeVisible();
  });

  test('自定义二维码参数', async ({ page }) => {
    await page.goto('/qrcode/generate');
    
    // 修改大小
    await page.getByLabel('二维码大小 (px)').fill('512');
    
    // 修改前景色
    await page.getByLabel('前景颜色').fill('#ff0000');
    
    // 生成二维码
    await page.getByPlaceholder('输入要生成二维码的内容').fill('测试内容');
    await page.getByRole('button', { name: '生成二维码' }).click();
    
    await expect(page.getByAltText('生成的二维码')).toBeVisible();
  });
});
