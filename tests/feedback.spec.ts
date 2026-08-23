import { test, expect } from '@playwright/test'

test.describe('全局反馈入口', () => {
  test('桌面端可选择反馈类型和渠道', async ({ page }) => {
    await page.goto('/json')
    await page.getByRole('button', { name: '反馈与建议' }).first().click()

    await expect(page.getByRole('dialog', { name: '反馈与建议' })).toBeVisible()
    await page.getByRole('button', { name: /工具建议/ }).click()

    const githubLink = page.getByRole('link', { name: /GitHub Issue/ })
    await expect(githubLink).toHaveAttribute(
      'href',
      /github\.com\/bugchao\/toolbox\/issues\/new/,
    )
    await expect(githubLink).toHaveAttribute('href', /title=/)

    const emailLink = page.getByRole('link', { name: /发送邮件/ })
    await expect(emailLink).toHaveAttribute(
      'href',
      /^mailto:lookdyc@gmail\.com/,
    )
  })

  test('移动端无需打开侧栏即可反馈', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    const trigger = page.getByRole('button', { name: '反馈与建议' }).first()
    await expect(trigger).toBeVisible()
    await trigger.click()
    await expect(page.getByRole('dialog', { name: '反馈与建议' })).toBeVisible()
  })

  test('独立工具窗口不显示全局入口', async ({ page }) => {
    await page.goto('/json?standalone=true')
    await expect(page.getByRole('button', { name: '反馈与建议' })).toHaveCount(
      0,
    )
    await expect(page.getByRole('contentinfo')).toHaveCount(0)
  })
})
