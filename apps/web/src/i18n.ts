/**
 * 国际化配置（架构层）
 *
 * 启动包优化（2026-05-11）：
 * - 138 个工具 namespace 改为按需懒加载（i18next-resources-to-backend + TOOL_NAMESPACE_LOADERS）
 * - i18n.ts 只 eager 加载 shell 文案（nav/home/categories）+ 3 个聚合 suite locales
 * - 工具 i18n 在 useTranslation('toolXxx') 调用时，由 backend 异步拉取并注入资源
 *
 * 新增工具：在 tool.manifest.ts 中通过 loadMessages 配置；
 * 老工具未走 manifest 的，在 i18n-tool-loaders.ts 注册即可。
 */
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import resourcesToBackend from 'i18next-resources-to-backend'
import zh from './locales/zh.json'
import en from './locales/en.json'
import { domainSuiteZh, domainSuiteEn } from '@toolbox/tool-domain-suite/src/locales'
import { ipOpsZh, ipOpsEn } from '@toolbox/tool-ip-ops-suite/src/locales'
import { subnetZh, subnetEn } from '@toolbox/tool-subnet-suite/src/locales'
import { TOOL_NAMESPACE_LOADERS } from './i18n-tool-loaders'

const STORAGE_KEY = 'toolbox-lang'

export const defaultNS = 'common'

/**
 * 启动时即注入的资源：
 * - 站点 shell（zh/en.json：nav/home/footer/categories 等）
 * - 三个聚合套件（domain/ip-ops/subnet）—— 内含多个 namespace 但作为一组加载，效率可接受
 *
 * 工具自身的 namespace 不在此处注入，由 resourcesToBackend 按需懒加载。
 */
export const resources = {
  zh: {
    common: zh.common,
    nav: zh.nav,
    footer: zh.footer,
    commandPalette: zh.commandPalette,
    favorites: zh.favorites,
    changelogPage: zh.changelogPage,
    home: zh.home,
    colorPicker: zh.colorPicker,
    toolTimezoneConverter: zh.toolTimezoneConverter,
    ...(domainSuiteZh as unknown as Record<string, Record<string, string>>),
    ...(ipOpsZh as unknown as Record<string, Record<string, string>>),
    ...(subnetZh as unknown as Record<string, Record<string, string>>),
  },
  en: {
    common: en.common,
    nav: en.nav,
    footer: en.footer,
    commandPalette: en.commandPalette,
    favorites: en.favorites,
    changelogPage: en.changelogPage,
    home: en.home,
    colorPicker: en.colorPicker,
    toolTimezoneConverter: en.toolTimezoneConverter,
    ...(domainSuiteEn as unknown as Record<string, Record<string, string>>),
    ...(ipOpsEn as unknown as Record<string, Record<string, string>>),
    ...(subnetEn as unknown as Record<string, Record<string, string>>),
  },
} as const

export type Locale = keyof typeof resources

const saved = (typeof localStorage !== 'undefined' && localStorage.getItem(STORAGE_KEY)) as Locale | null
const fallbackLng: Locale = saved && resources[saved] ? saved : 'zh'

/**
 * 工具 namespace 懒加载 backend
 *
 * react-i18next 的 useTranslation('toolXxx') 触发时，若 namespace 未就绪，
 * 会调用此 backend；我们从 TOOL_NAMESPACE_LOADERS 找到对应的 dynamic import，
 * Vite 在 build 时为每个 JSON 单独切 chunk。
 */
const lazyToolBackend = resourcesToBackend(async (language: string, namespace: string) => {
  const lang = language === 'en' || language.startsWith('en') ? 'en' : 'zh'
  const entry = TOOL_NAMESPACE_LOADERS[namespace]
  if (!entry) {
    return {}
  }
  try {
    const mod = await entry[lang]()
    const data = (mod as { default?: unknown }).default ?? mod
    return data as Record<string, unknown>
  } catch (err) {
    if (typeof console !== 'undefined') {
      console.warn(`[i18n] failed to load namespace "${namespace}" (${lang})`, err)
    }
    return {}
  }
})

i18n.use(lazyToolBackend).use(initReactI18next).init({
  resources,
  defaultNS,
  fallbackLng: 'zh',
  lng: fallbackLng,
  partialBundledLanguages: true,
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
