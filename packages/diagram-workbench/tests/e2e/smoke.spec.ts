/**
 * 5 个 smoke 用例对应 openspec/changes/add-diagram-workbench/tasks.md Section 10。
 * 运行：`pnpm --filter @toolbox/diagram-workbench e2e`
 * 浏览器需要先装：`pnpm exec playwright install chromium`
 */
import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  // 每个用例从干净状态起步：清掉 IndexedDB
  await page.goto('/')
  await page.evaluate(() => indexedDB.deleteDatabase('diagram-workbench'))
  await page.reload()
})

test('first load creates a default Mermaid diagram', async ({ page }) => {
  await expect(page.getByText('Diagram Workbench')).toBeVisible()
  await expect(page.getByText(/Untitled Mermaid/i)).toBeVisible()
  // status bar shows 1 diagram
  await expect(page.getByText(/1 diagram\(s\)/i)).toBeVisible()
})

test('editing Mermaid source persists across reload', async ({ page }) => {
  const editor = page.locator('textarea').first()
  await editor.fill('flowchart LR\n  X --> Y')

  // 等自动保存：调用 saveNow 直接走 Ctrl+S
  await page.keyboard.press('Control+s')
  // wait for "Saved" label
  await expect(page.getByText('Saved')).toBeVisible({ timeout: 5000 })

  await page.reload()
  await expect(page.locator('textarea').first()).toHaveValue(/X --> Y/)
})

test('mark second diagram as main; reload keeps the badge', async ({ page }) => {
  // create a second PlantUML diagram
  await page.getByRole('button', { name: /^PlantUML$/i }).click()
  await expect(page.getByText('Untitled plantuml')).toBeVisible()

  // click its star toggle (the second diagram's row)
  const newRow = page.getByText('Untitled plantuml').locator('..').locator('..')
  await newRow.getByRole('button', { name: /Set as main/i }).click()

  await page.keyboard.press('Control+s')
  await expect(page.getByText('Saved')).toBeVisible({ timeout: 5000 })

  await page.reload()
  // 主图 ★ 现在落在 plantuml 行
  const plantumlRow = page.getByText('Untitled plantuml').locator('..').locator('..')
  await expect(plantumlRow.getByRole('button', { name: /Main diagram/i })).toBeVisible()
})

test('workspace JSON round trip via Export then Import', async ({ page }) => {
  // create a recognizable second diagram
  await page.getByRole('button', { name: /^PlantUML$/i }).click()
  const editor = page.locator('textarea').first()
  await editor.fill('@startuml\nAlice -> Bob\n@enduml')

  await page.keyboard.press('Control+s')
  await expect(page.getByText('Saved')).toBeVisible({ timeout: 5000 })

  // Trigger Export → Workspace JSON
  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: /^Export$/i }).click()
  await page.getByText(/Workspace JSON \(all\)/i).click()
  const download = await downloadPromise
  const path = await download.path()
  expect(path).not.toBeNull()

  // 清空 IDB，刷新，期待恢复到默认 Mermaid（验证清干净）
  await page.evaluate(() => indexedDB.deleteDatabase('diagram-workbench'))
  await page.reload()
  await expect(page.getByText('Untitled plantuml')).toHaveCount(0)

  // 重新导入下载下来的 JSON
  const fileChooserPromise = page.waitForEvent('filechooser')
  await page.getByRole('button', { name: /^Import$/i }).click()
  const chooser = await fileChooserPromise
  await chooser.setFiles(path!)
  await expect(page.getByText(/Untitled plantuml/i)).toBeVisible({ timeout: 5000 })
})

test('PlantUML render shows error banner when server unreachable', async ({ page }) => {
  await page.getByRole('button', { name: /^PlantUML$/i }).click()
  // 改 server URL 指向一个不会监听的端口，触发 fetch 失败
  const settingsServer = page.getByPlaceholder(/plantuml\/$/)
  await settingsServer.fill('http://127.0.0.1:1/plantuml/')
  // 等 350ms debounce 渲染
  await page.waitForTimeout(800)
  await expect(page.getByText(/Render failed/i)).toBeVisible({ timeout: 8000 })
})
