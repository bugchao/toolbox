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

/** 当前生效的语言，仅作缓存；权威来源是下面的偏好键 */
const STORAGE_KEY = 'toolbox-lang'
/** 用户的选择：'system' | 'zh' | 'en' */
const PREF_KEY = 'toolbox-lang-pref'

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
    imageCompressor: zh.imageCompressor,
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
    imageCompressor: en.imageCompressor,
    toolTimezoneConverter: en.toolTimezoneConverter,
    ...(domainSuiteEn as unknown as Record<string, Record<string, string>>),
    ...(ipOpsEn as unknown as Record<string, Record<string, string>>),
    ...(subnetEn as unknown as Record<string, Record<string, string>>),
  },
} as const

export type Locale = keyof typeof resources
/** 'system' 表示跟随浏览器/系统语言，生效值随系统变化 */
export type LanguagePreference = 'system' | Locale

export const LANGUAGE_PREFERENCES: LanguagePreference[] = ['system', 'zh', 'en']

function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && value in resources
}

/** 浏览器语言里只要有一条是英文就用英文，否则中文 */
export function systemLocale(): Locale {
  if (typeof navigator === 'undefined') return 'zh'
  const langs = navigator.languages?.length ? navigator.languages : [navigator.language]
  for (const lang of langs) {
    if (!lang) continue
    const base = lang.toLowerCase().split('-')[0]
    if (isLocale(base)) return base
  }
  return 'zh'
}

/**
 * 存的是「偏好」而不是「生效值」。
 *
 * 存生效值会让跟随系统失效：系统是英文 → 我们切到 en → 又把 'en' 写回去，
 * 下次启动就变成固定英文了。
 *
 * 兼容老数据：以前只有 toolbox-lang，存的是用户明确选过的语言，继续当固定值。
 */
export function getLocalePreference(): LanguagePreference {
  if (typeof localStorage === 'undefined') return 'system'
  try {
    const pref = localStorage.getItem(PREF_KEY)
    if (pref === 'system' || isLocale(pref)) return pref
    const legacy = localStorage.getItem(STORAGE_KEY)
    if (isLocale(legacy)) return legacy
  } catch (_) {
    /* 隐私模式下读不到，按跟随系统处理 */
  }
  return 'system'
}

export function resolveLocale(pref: LanguagePreference): Locale {
  return pref === 'system' ? systemLocale() : pref
}

const fallbackLng: Locale = resolveLocale(getLocalePreference())

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

// 这里刻意不再把生效语言写回 STORAGE_KEY。
// 写了会和下面的老数据迁移撞车：跟随系统解析出 'en' → 写进 toolbox-lang →
// 下次启动迁移逻辑把它当成「用户明确选过英文」→ 跟随系统静默失效。
// 现在 STORAGE_KEY 只读不写，纯粹用于识别升级前的老用户。

// 跟随系统时，系统语言变了要实时跟上
if (typeof window !== 'undefined') {
  window.addEventListener('languagechange', () => {
    if (getLocalePreference() === 'system') i18n.changeLanguage(systemLocale())
  })
}

/** 设置语言偏好。传具体语言即脱离跟随系统 */
export function setLocalePreference(pref: LanguagePreference) {
  try {
    localStorage.setItem(PREF_KEY, pref)
  } catch (_) {
    /* 存不住就只在本次会话内生效 */
  }
  i18n.changeLanguage(resolveLocale(pref))
}

export default i18n
