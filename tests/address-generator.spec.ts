import { expect, test } from '@playwright/test'

test.describe('多国家地址生成器', () => {
  test('生成可复现地址并切换 JSON 视图', async ({ page }) => {
    await page.goto('/address-generator')
    await expect(page.getByRole('heading', { name: '多国家地址生成器' })).toBeVisible()
    await expect(page.getByText('59 个国家 / 地区格式')).toBeVisible()

    const layoutMain = await page.locator('main').first().boundingBox()
    const atlas = await page.getByTestId('address-atlas').boundingBox()
    expect(layoutMain).not.toBeNull()
    expect(atlas).not.toBeNull()
    expect(atlas!.x).toBeGreaterThanOrEqual(layoutMain!.x)
    expect(atlas!.x + atlas!.width).toBeLessThanOrEqual(layoutMain!.x + layoutMain!.width + 1)

    await page.getByLabel('生成数量').fill('2')
    await page.getByLabel('Seed（可选）').fill('checkout-regression-001')
    await page.getByRole('button', { name: '生成地址' }).click()

    await expect(page.getByTestId('address-formatted')).toHaveCount(2)
    const firstBatch = await page.getByTestId('address-formatted').allTextContents()
    expect(firstBatch).toHaveLength(2)

    await page.getByRole('button', { name: 'JSON', exact: true }).click()
    await expect(page.getByTestId('json-output')).toContainText('countryCode')

    await page.reload()
    await page.getByLabel('生成数量').fill('2')
    await page.getByLabel('Seed（可选）').fill('checkout-regression-001')
    await page.getByRole('button', { name: '生成地址' }).click()
    await expect(page.getByTestId('address-formatted')).toHaveCount(2)
    expect(await page.getByTestId('address-formatted').allTextContents()).toEqual(firstBatch)
  })

  test('移动端可生成且页面无横向溢出', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/address-generator')
    await page.getByRole('button', { name: '生成地址' }).click()
    await expect(page.getByTestId('address-formatted')).toHaveCount(3)

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
    expect(overflow).toBeLessThanOrEqual(1)
  })

  test('英文界面默认美国且暗色邮政主题生效', async ({ page }) => {
    await page.goto('/address-generator')
    await page.getByTitle('Language').click()
    await page.getByRole('button', { name: 'English' }).click()
    await page.reload()

    await expect(page.getByRole('heading', { name: 'Global Address Generator' })).toBeVisible()
    await expect(page.getByRole('combobox', { name: 'Country or region' })).toHaveValue('US')

    await page.evaluate(() => document.documentElement.classList.add('dark'))
    const paperColor = await page.getByTestId('address-atlas').evaluate((element) =>
      getComputedStyle(element).getPropertyValue('--atlas-paper').trim(),
    )
    expect(paperColor).toBe('#101d22')
  })
})
