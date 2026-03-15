/**
 * 国际化配置（架构层）
 * 所有文案通过 namespace 管理，便于按模块扩展。
 * 独立工具包可提供自己的 namespace（如 toolJson），在此注册后由全局语言切换控制。
 */
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import zh from './locales/zh.json'
import en from './locales/en.json'
import toolJsonZh from '@toolbox/tool-json/src/locales/zh.json'
import toolJsonEn from '@toolbox/tool-json/src/locales/en.json'

const STORAGE_KEY = 'toolbox-lang'

export const defaultNS = 'common'
export const resources = {
  zh: {
    common: zh.common,
    nav: zh.nav,
    footer: zh.footer,
    commandPalette: zh.commandPalette,
    favorites: zh.favorites,
    home: zh.home,
    colorPicker: zh.colorPicker,
    toolJson: toolJsonZh as Record<string, string>,
  },
  en: {
    common: en.common,
    nav: en.nav,
    footer: en.footer,
    commandPalette: en.commandPalette,
    favorites: en.favorites,
    home: en.home,
    colorPicker: en.colorPicker,
    toolJson: toolJsonEn as Record<string, string>,
  },
} as const

export type Locale = keyof typeof resources

const saved = (typeof localStorage !== 'undefined' && localStorage.getItem(STORAGE_KEY)) as Locale | null
const fallbackLng: Locale = saved && resources[saved] ? saved : 'zh'

i18n.use(initReactI18next).init({
  resources,
  defaultNS,
  fallbackLng: 'zh',
  lng: fallbackLng,
  interpolation: { escapeValue: false },
  react: { useSuspense: true },
})

i18n.on('languageChanged', (lng) => {
  try {
    localStorage.setItem(STORAGE_KEY, lng)
  } catch (_) {}
})

export function setLocale(lng: Locale) {
  i18n.changeLanguage(lng)
}

export default i18n
