import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const PREF_KEY = 'toolbox-lang-pref'
const LANG_KEY = 'toolbox-lang'

/** navigator.languages 在 jsdom 里是只读的，得改描述符 */
function stubLanguages(langs: string[]) {
  Object.defineProperty(navigator, 'languages', { value: langs, configurable: true })
  Object.defineProperty(navigator, 'language', { value: langs[0] ?? 'zh-CN', configurable: true })
}

/** i18n.ts 在模块顶层就读了存储和浏览器语言，所以每次都要重新加载 */
async function loadI18n() {
  vi.resetModules()
  return import('./i18n')
}

describe('语言偏好', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    vi.resetModules()
  })

  it('没存过偏好时跟随浏览器语言', async () => {
    stubLanguages(['en-US', 'en'])
    const mod = await loadI18n()
    expect(mod.getLocalePreference()).toBe('system')
    expect(mod.systemLocale()).toBe('en')
    expect(mod.default.language).toBe('en')
  })

  it('浏览器语言不在支持列表里时退回中文', async () => {
    stubLanguages(['fr-FR', 'de'])
    const mod = await loadI18n()
    expect(mod.systemLocale()).toBe('zh')
    expect(mod.default.language).toBe('zh')
  })

  it('多个浏览器语言时取第一个受支持的', async () => {
    stubLanguages(['fr-FR', 'en-GB', 'zh-CN'])
    const mod = await loadI18n()
    expect(mod.systemLocale()).toBe('en')
  })

  it('存进去的是偏好而不是解析后的语言——否则跟随系统会被自己覆盖掉', async () => {
    stubLanguages(['en-US'])
    const mod = await loadI18n()

    mod.setLocalePreference('system')
    // 这里如果写成 'en'，下次启动就变成固定英文了
    expect(localStorage.getItem(PREF_KEY)).toBe('system')
    expect(mod.default.language).toBe('en')
  })

  it('明确选了语言就脱离跟随系统', async () => {
    stubLanguages(['en-US'])
    const mod = await loadI18n()

    mod.setLocalePreference('zh')
    expect(localStorage.getItem(PREF_KEY)).toBe('zh')
    expect(mod.default.language).toBe('zh')

    // 重新加载后仍然是中文，不会被英文系统拉回去
    const reloaded = await loadI18n()
    expect(reloaded.getLocalePreference()).toBe('zh')
    expect(reloaded.default.language).toBe('zh')
  })

  it('老数据只有 toolbox-lang 时当作用户明确选过的语言', async () => {
    stubLanguages(['en-US'])
    localStorage.setItem(LANG_KEY, 'zh')
    const mod = await loadI18n()
    expect(mod.getLocalePreference()).toBe('zh')
    expect(mod.default.language).toBe('zh')
  })

  it('跟随系统时，浏览器语言变了要实时跟上', async () => {
    stubLanguages(['zh-CN'])
    const mod = await loadI18n()
    mod.setLocalePreference('system')
    expect(mod.default.language).toBe('zh')

    stubLanguages(['en-US'])
    window.dispatchEvent(new Event('languagechange'))
    await vi.waitFor(() => expect(mod.default.language).toBe('en'))

    // 跟随过程中偏好不能被改写
    expect(localStorage.getItem(PREF_KEY)).toBe('system')
  })

  it('固定语言时不受浏览器语言变化影响', async () => {
    stubLanguages(['zh-CN'])
    const mod = await loadI18n()
    mod.setLocalePreference('zh')

    stubLanguages(['en-US'])
    window.dispatchEvent(new Event('languagechange'))
    expect(mod.default.language).toBe('zh')
  })
})
