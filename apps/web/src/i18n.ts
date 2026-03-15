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
import toolIpQueryZh from '@toolbox/tool-ip-query/src/locales/zh.json'
import toolIpQueryEn from '@toolbox/tool-ip-query/src/locales/en.json'
import toolIpAsnZh from '@toolbox/tool-ip-asn/src/locales/zh.json'
import toolIpAsnEn from '@toolbox/tool-ip-asn/src/locales/en.json'
import toolDnsTraceZh from '@toolbox/tool-dns-trace/src/locales/zh.json'
import toolDnsTraceEn from '@toolbox/tool-dns-trace/src/locales/en.json'
import toolDnsPropagationZh from '@toolbox/tool-dns-propagation/src/locales/zh.json'
import toolDnsPropagationEn from '@toolbox/tool-dns-propagation/src/locales/en.json'
import toolPptGeneratorZh from '@toolbox/tool-ppt-generator/src/locales/zh.json'
import toolPptGeneratorEn from '@toolbox/tool-ppt-generator/src/locales/en.json'
import toolDnsGlobalCheckZh from '@toolbox/tool-dns-global-check/src/locales/zh.json'
import toolDnsGlobalCheckEn from '@toolbox/tool-dns-global-check/src/locales/en.json'
import toolDnssecCheckZh from '@toolbox/tool-dnssec-check/src/locales/zh.json'
import toolDnssecCheckEn from '@toolbox/tool-dnssec-check/src/locales/en.json'
import toolDnsPerformanceZh from '@toolbox/tool-dns-performance/src/locales/zh.json'
import toolDnsPerformanceEn from '@toolbox/tool-dns-performance/src/locales/en.json'
import toolDnsTtlZh from '@toolbox/tool-dns-ttl/src/locales/zh.json'
import toolDnsTtlEn from '@toolbox/tool-dns-ttl/src/locales/en.json'

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
    toolIpQuery: toolIpQueryZh as Record<string, string>,
    toolIpAsn: toolIpAsnZh as Record<string, string>,
    toolDnsTrace: toolDnsTraceZh as Record<string, string>,
    toolDnsPropagation: toolDnsPropagationZh as Record<string, string>,
    toolPptGenerator: toolPptGeneratorZh as Record<string, string>,
    toolDnsGlobalCheck: toolDnsGlobalCheckZh as Record<string, string>,
    toolDnssecCheck: toolDnssecCheckZh as Record<string, string>,
    toolDnsPerformance: toolDnsPerformanceZh as Record<string, string>,
    toolDnsTtl: toolDnsTtlZh as Record<string, string>,
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
    toolIpQuery: toolIpQueryEn as Record<string, string>,
    toolIpAsn: toolIpAsnEn as Record<string, string>,
    toolDnsTrace: toolDnsTraceEn as Record<string, string>,
    toolDnsPropagation: toolDnsPropagationEn as Record<string, string>,
    toolPptGenerator: toolPptGeneratorEn as Record<string, string>,
    toolDnsGlobalCheck: toolDnsGlobalCheckEn as Record<string, string>,
    toolDnssecCheck: toolDnssecCheckEn as Record<string, string>,
    toolDnsPerformance: toolDnsPerformanceEn as Record<string, string>,
    toolDnsTtl: toolDnsTtlEn as Record<string, string>,
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
  } catch (_) { }
})

export function setLocale(lng: Locale) {
  i18n.changeLanguage(lng)
}

export default i18n
