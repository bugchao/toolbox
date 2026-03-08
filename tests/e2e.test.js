// E2E测试脚本
const { test, expect } = require('@playwright/test');

test.describe('工具网站功能测试', () => {
  test('首页加载正常', async ({ page }) => {
    await page.goto('http://localhost:3001/');
    await expect(page.locator('h1')).toContainText('工具盒子');
    await expect(page.locator('.card')).toHaveCount(4); // 工具卡片数量
  });

  test('导航功能正常', async ({ page }) => {
    await page.goto('http://localhost:3001/');
    
    // 测试二维码生成页面
    await page.click('text=二维码生成');
    await expect(page).toHaveURL('/qrcode/generate');
    await expect(page.locator('h1')).toContainText('二维码生成器');
    
    // 测试二维码解析页面
    await page.click('text=二维码解析');
    await expect(page).toHaveURL('/qrcode/read');
    await expect(page.locator('h1')).toContainText('二维码解析器');
    
    // 测试每日热点页面
    await page.click('text=每日热点');
    await expect(page).toHaveURL('/news');
    await expect(page.locator('h1')).toContainText('每日热点');
    
    // 测试邮编查询页面
    await page.click('text=邮编查询');
    await expect(page).toHaveURL('/zipcode');
    await expect(page.locator('h1')).toContainText('邮政编码查询');
    
    // 测试天气查询页面
    await page.click('text=天气查询');
    await expect(page).toHaveURL('/weather');
    await expect(page.locator('h1')).toContainText('天气查询');
  });

  test('二维码生成功能正常', async ({ page }) => {
    await page.goto('http://localhost:3001/qrcode/generate');
    await page.fill('textarea', 'https://openclaw.ai');
    await page.click('text=生成二维码');
    await page.waitForSelector('img[alt="生成的二维码"]', { timeout: 5000 });
    const imgSrc = await page.locator('img[alt="生成的二维码"]').getAttribute('src');
    expect(imgSrc).toContain('data:image/png;base64,');
  });

  test('响应式布局正常', async ({ page }) => {
    await page.goto('http://localhost:3001/');
    // 测试移动端视图
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('button >> text=☰')).toBeVisible();
  });
});
