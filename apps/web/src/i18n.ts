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
import toolDnsSoaZh from '@toolbox/tool-dns-soa/src/locales/zh/toolDnsSoa.json'
import toolDnsSoaEn from '@toolbox/tool-dns-soa/src/locales/en/toolDnsSoa.json'
import toolDnsDiagnoseZh from '@toolbox/tool-dns-diagnose/src/locales/zh/toolDnsDiagnose.json'
import toolDnsDiagnoseEn from '@toolbox/tool-dns-diagnose/src/locales/en/toolDnsDiagnose.json'
import toolDnsPollutionCheckZh from '@toolbox/tool-dns-pollution-check/src/locales/zh/toolDnsPollutionCheck.json'
import toolDnsPollutionCheckEn from '@toolbox/tool-dns-pollution-check/src/locales/en/toolDnsPollutionCheck.json'
import toolDnsHijackCheckZh from '@toolbox/tool-dns-hijack-check/src/locales/zh/toolDnsHijackCheck.json'
import toolDnsHijackCheckEn from '@toolbox/tool-dns-hijack-check/src/locales/en/toolDnsHijackCheck.json'
import toolDnsCacheCheckZh from '@toolbox/tool-dns-cache-check/src/locales/zh/toolDnsCacheCheck.json'
import toolDnsCacheCheckEn from '@toolbox/tool-dns-cache-check/src/locales/en/toolDnsCacheCheck.json'
import toolDnsLoopCheckZh from '@toolbox/tool-dns-loop-check/src/locales/zh/toolDnsLoopCheck.json'
import toolDnsLoopCheckEn from '@toolbox/tool-dns-loop-check/src/locales/en/toolDnsLoopCheck.json'
import toolDnsNsZh from '@toolbox/tool-dns-ns/locales/zh-CN.json'
import toolDnsNsEn from '@toolbox/tool-dns-ns/locales/en-US.json'
import toolDnsCnameChainZh from '@toolbox/tool-dns-cname-chain/locales/zh-CN.json'
import toolDnsCnameChainEn from '@toolbox/tool-dns-cname-chain/locales/en-US.json'
import toolSecurityIpScoreZh from '@toolbox/tool-security-suite/src/locales/securityIpScore.zh.json'
import toolSecurityIpScoreEn from '@toolbox/tool-security-suite/src/locales/securityIpScore.en.json'
import toolSecurityDomainBlacklistZh from '@toolbox/tool-security-suite/src/locales/securityDomainBlacklist.zh.json'
import toolSecurityDomainBlacklistEn from '@toolbox/tool-security-suite/src/locales/securityDomainBlacklist.en.json'
import toolSecurityPortScanZh from '@toolbox/tool-security-suite/src/locales/securityPortScan.zh.json'
import toolSecurityPortScanEn from '@toolbox/tool-security-suite/src/locales/securityPortScan.en.json'
import toolSecurityDnsVulnZh from '@toolbox/tool-security-suite/src/locales/securityDnsVuln.zh.json'
import toolSecurityDnsVulnEn from '@toolbox/tool-security-suite/src/locales/securityDnsVuln.en.json'
import toolSecurityReportGenZh from '@toolbox/tool-security-suite/src/locales/securityReportGen.zh.json'
import toolSecurityReportGenEn from '@toolbox/tool-security-suite/src/locales/securityReportGen.en.json'
import toolIpamPlanZh from '@toolbox/tool-ipam-suite/src/locales/ipamPlan.zh.json'
import toolIpamPlanEn from '@toolbox/tool-ipam-suite/src/locales/ipamPlan.en.json'
import toolIpamInventoryZh from '@toolbox/tool-ipam-suite/src/locales/ipamInventory.zh.json'
import toolIpamInventoryEn from '@toolbox/tool-ipam-suite/src/locales/ipamInventory.en.json'
import toolIpamUsageZh from '@toolbox/tool-ipam-suite/src/locales/ipamUsage.zh.json'
import toolIpamUsageEn from '@toolbox/tool-ipam-suite/src/locales/ipamUsage.en.json'
import toolIpamConflictZh from '@toolbox/tool-ipam-suite/src/locales/ipamConflict.zh.json'
import toolIpamConflictEn from '@toolbox/tool-ipam-suite/src/locales/ipamConflict.en.json'
import toolIpamAllocationSimZh from '@toolbox/tool-ipam-suite/src/locales/ipamAllocationSim.zh.json'
import toolIpamAllocationSimEn from '@toolbox/tool-ipam-suite/src/locales/ipamAllocationSim.en.json'

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
    toolDnsSoa: toolDnsSoaZh as Record<string, string>,
    toolDnsDiagnose: toolDnsDiagnoseZh as Record<string, string>,
    toolDnsPollutionCheck: toolDnsPollutionCheckZh as Record<string, string>,
    toolDnsHijackCheck: toolDnsHijackCheckZh as Record<string, string>,
    toolDnsCacheCheck: toolDnsCacheCheckZh as Record<string, string>,
    toolDnsLoopCheck: toolDnsLoopCheckZh as Record<string, string>,
    toolDnsNs: toolDnsNsZh as Record<string, string>,
    toolDnsCnameChain: toolDnsCnameChainZh as Record<string, string>,
    toolSecurityIpScore: toolSecurityIpScoreZh as unknown as Record<string, string>,
    toolSecurityDomainBlacklist: toolSecurityDomainBlacklistZh as unknown as Record<string, string>,
    toolSecurityPortScan: toolSecurityPortScanZh as unknown as Record<string, string>,
    toolSecurityDnsVuln: toolSecurityDnsVulnZh as unknown as Record<string, string>,
    toolSecurityReportGen: toolSecurityReportGenZh as unknown as Record<string, string>,
    toolIpamPlan: toolIpamPlanZh as unknown as Record<string, string>,
    toolIpamInventory: toolIpamInventoryZh as unknown as Record<string, string>,
    toolIpamUsage: toolIpamUsageZh as unknown as Record<string, string>,
    toolIpamConflict: toolIpamConflictZh as unknown as Record<string, string>,
    toolIpamAllocationSim: toolIpamAllocationSimZh as unknown as Record<string, string>,
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
    toolDnsSoa: toolDnsSoaEn as Record<string, string>,
    toolDnsDiagnose: toolDnsDiagnoseEn as Record<string, string>,
    toolDnsPollutionCheck: toolDnsPollutionCheckEn as Record<string, string>,
    toolDnsHijackCheck: toolDnsHijackCheckEn as Record<string, string>,
    toolDnsCacheCheck: toolDnsCacheCheckEn as Record<string, string>,
    toolDnsLoopCheck: toolDnsLoopCheckEn as Record<string, string>,
    toolDnsNs: toolDnsNsEn as Record<string, string>,
    toolDnsCnameChain: toolDnsCnameChainEn as Record<string, string>,
    toolSecurityIpScore: toolSecurityIpScoreEn as unknown as Record<string, string>,
    toolSecurityDomainBlacklist: toolSecurityDomainBlacklistEn as unknown as Record<string, string>,
    toolSecurityPortScan: toolSecurityPortScanEn as unknown as Record<string, string>,
    toolSecurityDnsVuln: toolSecurityDnsVulnEn as unknown as Record<string, string>,
    toolSecurityReportGen: toolSecurityReportGenEn as unknown as Record<string, string>,
    toolIpamPlan: toolIpamPlanEn as unknown as Record<string, string>,
    toolIpamInventory: toolIpamInventoryEn as unknown as Record<string, string>,
    toolIpamUsage: toolIpamUsageEn as unknown as Record<string, string>,
    toolIpamConflict: toolIpamConflictEn as unknown as Record<string, string>,
    toolIpamAllocationSim: toolIpamAllocationSimEn as unknown as Record<string, string>,
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
