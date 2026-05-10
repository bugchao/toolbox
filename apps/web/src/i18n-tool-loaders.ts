/**
 * 工具命名空间懒加载注册表
 *
 * 由 i18next-resources-to-backend 在 useTranslation('toolXxx') 时按需触发。
 * 替代之前 i18n.ts 中 138 个工具 namespace 的 eager import。
 *
 * 新增工具：在 tool.manifest.ts 中通过 loadMessages 配置；
 * 仅老工具（无 manifest 但有 i18n）需在此注册。
 */

type LocaleLoader = () => Promise<{ default: Record<string, unknown> } | Record<string, unknown>>

export const TOOL_NAMESPACE_LOADERS: Record<string, { zh: LocaleLoader; en: LocaleLoader }> = {
  toolJson: {
    zh: () => import('@toolbox/tool-json/src/locales/zh.json'),
    en: () => import('@toolbox/tool-json/src/locales/en.json'),
  },
  toolGithubInfo: {
    zh: () => import('@toolbox/tool-github-info/src/locales/zh.json'),
    en: () => import('@toolbox/tool-github-info/src/locales/en.json'),
  },
  toolIpQuery: {
    zh: () => import('@toolbox/tool-ip-query/src/locales/zh.json'),
    en: () => import('@toolbox/tool-ip-query/src/locales/en.json'),
  },
  toolIpAsn: {
    zh: () => import('@toolbox/tool-ip-asn/src/locales/zh.json'),
    en: () => import('@toolbox/tool-ip-asn/src/locales/en.json'),
  },
  toolDnsTrace: {
    zh: () => import('@toolbox/tool-dns-trace/src/locales/zh.json'),
    en: () => import('@toolbox/tool-dns-trace/src/locales/en.json'),
  },
  toolDnsPropagation: {
    zh: () => import('@toolbox/tool-dns-propagation/src/locales/zh.json'),
    en: () => import('@toolbox/tool-dns-propagation/src/locales/en.json'),
  },
  toolPptGenerator: {
    zh: () => import('@toolbox/tool-ppt-generator/src/locales/zh.json'),
    en: () => import('@toolbox/tool-ppt-generator/src/locales/en.json'),
  },
  toolDnsGlobalCheck: {
    zh: () => import('@toolbox/tool-dns-global-check/src/locales/zh.json'),
    en: () => import('@toolbox/tool-dns-global-check/src/locales/en.json'),
  },
  toolDnssecCheck: {
    zh: () => import('@toolbox/tool-dnssec-check/src/locales/zh.json'),
    en: () => import('@toolbox/tool-dnssec-check/src/locales/en.json'),
  },
  toolDnsPerformance: {
    zh: () => import('@toolbox/tool-dns-performance/src/locales/zh.json'),
    en: () => import('@toolbox/tool-dns-performance/src/locales/en.json'),
  },
  toolDnsTtl: {
    zh: () => import('@toolbox/tool-dns-ttl/src/locales/zh.json'),
    en: () => import('@toolbox/tool-dns-ttl/src/locales/en.json'),
  },
  toolDnsSoa: {
    zh: () => import('@toolbox/tool-dns-soa/src/locales/zh/toolDnsSoa.json'),
    en: () => import('@toolbox/tool-dns-soa/src/locales/en/toolDnsSoa.json'),
  },
  toolDnsDiagnose: {
    zh: () => import('@toolbox/tool-dns-diagnose/src/locales/zh/toolDnsDiagnose.json'),
    en: () => import('@toolbox/tool-dns-diagnose/src/locales/en/toolDnsDiagnose.json'),
  },
  toolDnsPollutionCheck: {
    zh: () => import('@toolbox/tool-dns-pollution-check/src/locales/zh/toolDnsPollutionCheck.json'),
    en: () => import('@toolbox/tool-dns-pollution-check/src/locales/en/toolDnsPollutionCheck.json'),
  },
  toolDnsHijackCheck: {
    zh: () => import('@toolbox/tool-dns-hijack-check/src/locales/zh/toolDnsHijackCheck.json'),
    en: () => import('@toolbox/tool-dns-hijack-check/src/locales/en/toolDnsHijackCheck.json'),
  },
  toolDnsCacheCheck: {
    zh: () => import('@toolbox/tool-dns-cache-check/src/locales/zh/toolDnsCacheCheck.json'),
    en: () => import('@toolbox/tool-dns-cache-check/src/locales/en/toolDnsCacheCheck.json'),
  },
  toolDnsLoopCheck: {
    zh: () => import('@toolbox/tool-dns-loop-check/src/locales/zh/toolDnsLoopCheck.json'),
    en: () => import('@toolbox/tool-dns-loop-check/src/locales/en/toolDnsLoopCheck.json'),
  },
  toolDnsNs: {
    zh: () => import('@toolbox/tool-dns-ns/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-dns-ns/locales/en-US.json'),
  },
  toolDnsCnameChain: {
    zh: () => import('@toolbox/tool-dns-cname-chain/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-dns-cname-chain/locales/en-US.json'),
  },
  toolDnsNxdomain: {
    zh: () => import('@toolbox/tool-dns-nxdomain/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-dns-nxdomain/locales/en-US.json'),
  },
  toolDomainMx: {
    zh: () => import('@toolbox/tool-domain-mx/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-domain-mx/locales/en-US.json'),
  },
  toolDomainTxt: {
    zh: () => import('@toolbox/tool-domain-txt/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-http-headers/locales/en-US.json'),
  },
  toolHttpHeaders: {
    zh: () => import('@toolbox/tool-http-headers/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-ssl-cert/locales/en-US.json'),
  },
  toolSslCert: {
    zh: () => import('@toolbox/tool-ssl-cert/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-http-status/locales/en-US.json'),
  },
  toolHttpStatus: {
    zh: () => import('@toolbox/tool-http-status/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-tcp-port/locales/en-US.json'),
  },
  toolTcpPort: {
    zh: () => import('@toolbox/tool-tcp-port/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-ping/locales/en-US.json'),
  },
  toolPing: {
    zh: () => import('@toolbox/tool-ping/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-dns-latency/locales/en-US.json'),
  },
  toolDnsLatency: {
    zh: () => import('@toolbox/tool-dns-latency/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-dns-authoritative/locales/en-US.json'),
  },
  toolDnsAuthoritative: {
    zh: () => import('@toolbox/tool-dns-authoritative/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-dns-recursive/locales/en-US.json'),
  },
  toolDnsRecursive: {
    zh: () => import('@toolbox/tool-dns-recursive/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-dns-path-viz/locales/en-US.json'),
  },
  toolDnsPathViz: {
    zh: () => import('@toolbox/tool-dns-path-viz/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-dns-tunnel/locales/en-US.json'),
  },
  toolDnsTunnel: {
    zh: () => import('@toolbox/tool-dns-tunnel/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-dhcp-pool-calc/locales/en-US.json'),
  },
  toolDhcpPoolCalc: {
    zh: () => import('@toolbox/tool-dhcp-pool-calc/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-dhcp-option/locales/en-US.json'),
  },
  toolDhcpOption: {
    zh: () => import('@toolbox/tool-dhcp-option/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-dhcp-mac-binding/locales/en-US.json'),
  },
  toolDhcpMacBinding: {
    zh: () => import('@toolbox/tool-dhcp-mac-binding/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-dhcp-config-gen/locales/en-US.json'),
  },
  toolDhcpConfigGen: {
    zh: () => import('@toolbox/tool-dhcp-config-gen/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-traceroute/locales/en-US.json'),
  },
  toolTraceroute: {
    zh: () => import('@toolbox/tool-traceroute/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-dhcp-utilization/locales/en-US.json'),
  },
  toolDhcpUtilization: {
    zh: () => import('@toolbox/tool-dhcp-utilization/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-dhcp-conflict/locales/en-US.json'),
  },
  toolDhcpConflict: {
    zh: () => import('@toolbox/tool-dhcp-conflict/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-gslb-weight-calc/locales/en-US.json'),
  },
  toolGslbWeightCalc: {
    zh: () => import('@toolbox/tool-gslb-weight-calc/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-web-availability/locales/en-US.json'),
  },
  toolWebAvailability: {
    zh: () => import('@toolbox/tool-web-availability/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-security-domain-score/locales/en-US.json'),
  },
  toolSecurityDomainScore: {
    zh: () => import('@toolbox/tool-security-domain-score/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-gslb-failover-sim/locales/en-US.json'),
  },
  toolGslbFailoverSim: {
    zh: () => import('@toolbox/tool-gslb-failover-sim/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-gslb-geo-sim/locales/en-US.json'),
  },
  toolGslbGeoSim: {
    zh: () => import('@toolbox/tool-gslb-geo-sim/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-security-dnssec-verify/locales/en-US.json'),
  },
  toolSecurityDnssecVerify: {
    zh: () => import('@toolbox/tool-security-dnssec-verify/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-security-dns-ddos/locales/en-US.json'),
  },
  toolSecurityDnsDdos: {
    zh: () => import('@toolbox/tool-security-dns-ddos/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-cdn-check/locales/en-US.json'),
  },
  toolCdnCheck: {
    zh: () => import('@toolbox/tool-cdn-check/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-dhcp-discover-sim/locales/en-US.json'),
  },
  toolDhcpDiscoverSim: {
    zh: () => import('@toolbox/tool-dhcp-discover-sim/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-ipam-subnet-util/locales/en-US.json'),
  },
  toolIpamSubnetUtil: {
    zh: () => import('@toolbox/tool-ipam-subnet-util/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-gslb-health-sim/locales/en-US.json'),
  },
  toolGslbHealthSim: {
    zh: () => import('@toolbox/tool-gslb-health-sim/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-gslb-latency-sim/locales/en-US.json'),
  },
  toolGslbLatencySim: {
    zh: () => import('@toolbox/tool-gslb-latency-sim/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-server-latency/locales/en-US.json'),
  },
  toolServerLatency: {
    zh: () => import('@toolbox/tool-server-latency/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-dhcp-lease-analysis/locales/en-US.json'),
  },
  toolDhcpLeaseAnalysis: {
    zh: () => import('@toolbox/tool-dhcp-lease-analysis/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-ipam-visualize/locales/en-US.json'),
  },
  toolIpamVisualize: {
    zh: () => import('@toolbox/tool-ipam-visualize/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-gslb-policy-sim/locales/en-US.json'),
  },
  toolGslbPolicySim: {
    zh: () => import('@toolbox/tool-gslb-policy-sim/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-gslb-rule-validate/locales/en-US.json'),
  },
  toolGslbRuleValidate: {
    zh: () => import('@toolbox/tool-gslb-rule-validate/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-gslb-isp-sim/locales/en-US.json'),
  },
  toolApiAvailability: {
    zh: () => import('@toolbox/tool-api-availability/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-gslb-traffic-predict/locales/en-US.json'),
  },
  toolGslbIspSim: {
    zh: () => import('@toolbox/tool-gslb-isp-sim/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-gslb-hit-predict/locales/en-US.json'),
  },
  toolGslbTrafficPredict: {
    zh: () => import('@toolbox/tool-gslb-traffic-predict/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-ipam-reclaim/locales/en-US.json'),
  },
  toolGslbHitPredict: {
    zh: () => import('@toolbox/tool-gslb-hit-predict/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-dhcp-log-analysis/locales/en-US.json'),
  },
  toolIpamReclaim: {
    zh: () => import('@toolbox/tool-ipam-reclaim/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-dhcp-scan/locales/en-US.json'),
  },
  toolSecurityDomainHijack: {
    zh: () => import('@toolbox/tool-security-domain-hijack/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-ipam-changelog/locales/en-US.json'),
  },
  toolDhcpLogAnalysis: {
    zh: () => import('@toolbox/tool-dhcp-log-analysis/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-pomodoro/locales/en-US.json'),
  },
  toolDhcpScan: {
    zh: () => import('@toolbox/tool-dhcp-scan/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-salary-calc/locales/en-US.json'),
  },
  toolIpamChangelog: {
    zh: () => import('@toolbox/tool-ipam-changelog/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-currency-converter/locales/en-US.json'),
  },
  toolIpamScan: {
    zh: () => import('@toolbox/tool-ipam-scan/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-expense-tracker/locales/en-US.json'),
  },
  toolPomodoro: {
    zh: () => import('@toolbox/tool-pomodoro/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-subscription-manager/locales/en-US.json'),
  },
  toolSalaryCalc: {
    zh: () => import('@toolbox/tool-salary-calc/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-calorie-calc/locales/en-US.json'),
  },
  toolCurrencyConverter: {
    zh: () => import('@toolbox/tool-currency-converter/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-random-menu/locales/en-US.json'),
  },
  toolJwtDecoder: {
    zh: () => import('@toolbox/tool-jwt-decoder/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-installment-calc/locales/en-US.json'),
  },
  toolExpenseTracker: {
    zh: () => import('@toolbox/tool-expense-tracker/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-okr-planner/locales/en-US.json'),
  },
  toolSubscriptionManager: {
    zh: () => import('@toolbox/tool-subscription-manager/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-travel-checklist/locales/en-US.json'),
  },
  toolCalorieCalc: {
    zh: () => import('@toolbox/tool-calorie-calc/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-travel-budget/locales/en-US.json'),
  },
  toolRandomMenu: {
    zh: () => import('@toolbox/tool-random-menu/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-timezone-calc/locales/en-US.json'),
  },
  toolCurlToFetch: {
    zh: () => import('@toolbox/tool-curl-to-fetch/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-distance-calc/locales/en-US.json'),
  },
  toolInstallmentCalc: {
    zh: () => import('@toolbox/tool-installment-calc/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-packing-list/locales/en-US.json'),
  },
  toolOkrPlanner: {
    zh: () => import('@toolbox/tool-okr-planner/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-recipe-finder/locales/en-US.json'),
  },
  toolTravelChecklist: {
    zh: () => import('@toolbox/tool-travel-checklist/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-study-timer/locales/en-US.json'),
  },
  toolTravelBudget: {
    zh: () => import('@toolbox/tool-travel-budget/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-study-planner/locales/en-US.json'),
  },
  toolSplitBill: {
    zh: () => import('@toolbox/tool-split-bill/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-focus-mode/locales/en-US.json'),
  },
  toolTimezoneCalc: {
    zh: () => import('@toolbox/tool-timezone-calc/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-vocab-trainer/locales/en-US.json'),
  },
  toolDistanceCalc: {
    zh: () => import('@toolbox/tool-distance-calc/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-mistake-book/locales/en-US.json'),
  },
  toolPackingList: {
    zh: () => import('@toolbox/tool-packing-list/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-fridge-inventory/locales/en-US.json'),
  },
  toolRecipeFinder: {
    zh: () => import('@toolbox/tool-recipe-finder/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-expiry-reminder/locales/en-US.json'),
  },
  toolStudyTimer: {
    zh: () => import('@toolbox/tool-study-timer/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-family-tasks/locales/en-US.json'),
  },
  toolStudyPlanner: {
    zh: () => import('@toolbox/tool-study-planner/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-barcode-reader/locales/en-US.json'),
  },
  toolFocusMode: {
    zh: () => import('@toolbox/tool-focus-mode/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-quiz-gen/locales/en-US.json'),
  },
  toolVocabTrainer: {
    zh: () => import('@toolbox/tool-vocab-trainer/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-trip-planner/locales/en-US.json'),
  },
  toolMistakeBook: {
    zh: () => import('@toolbox/tool-mistake-book/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-day-trip/locales/en-US.json'),
  },
  toolFridgeInventory: {
    zh: () => import('@toolbox/tool-fridge-inventory/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-spaced-repetition/locales/en-US.json'),
  },
  toolExpiryReminder: {
    zh: () => import('@toolbox/tool-expiry-reminder/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-travel-translator/locales/en-US.json'),
  },
  toolFamilyTasks: {
    zh: () => import('@toolbox/tool-family-tasks/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-knowledge-compare/locales/en-US.json'),
  },
  toolBarcodeReader: {
    zh: () => import('@toolbox/tool-barcode-reader/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-loan-calc/locales/en-US.json'),
  },
  toolQuizGen: {
    zh: () => import('@toolbox/tool-quiz-gen/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-id-card-parser/locales/en-US.json'),
  },
  toolTripPlanner: {
    zh: () => import('@toolbox/tool-trip-planner/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-color-blind-sim/locales/en-US.json'),
  },
  toolDayTrip: {
    zh: () => import('@toolbox/tool-day-trip/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-text-to-speech/locales/en-US.json'),
  },
  toolSpacedRepetition: {
    zh: () => import('@toolbox/tool-spaced-repetition/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-currency-history/locales/en-US.json'),
  },
  toolTravelTranslator: {
    zh: () => import('@toolbox/tool-travel-translator/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-one-liner/locales/en-US.json'),
  },
  toolKnowledgeCompare: {
    zh: () => import('@toolbox/tool-knowledge-compare/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-eli5/locales/en-US.json'),
  },
  toolLoanCalc: {
    zh: () => import('@toolbox/tool-loan-calc/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-multi-perspective/locales/en-US.json'),
  },
  toolIdCardParser: {
    zh: () => import('@toolbox/tool-id-card-parser/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-mcq-gen/locales/en-US.json'),
  },
  toolColorBlindSim: {
    zh: () => import('@toolbox/tool-color-blind-sim/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-morse-code/locales/en-US.json'),
  },
  toolTextToSpeech: {
    zh: () => import('@toolbox/tool-text-to-speech/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-ascii-art/locales/en-US.json'),
  },
  toolCurrencyHistory: {
    zh: () => import('@toolbox/tool-currency-history/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-password-strength/locales/en-US.json'),
  },
  toolOneLiner: {
    zh: () => import('@toolbox/tool-one-liner/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-base-converter/locales/en-US.json'),
  },
  toolEli5: {
    zh: () => import('@toolbox/tool-eli5/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-word-count/locales/en-US.json'),
  },
  toolMultiPerspective: {
    zh: () => import('@toolbox/tool-multi-perspective/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-pomodoro-pro/locales/en-US.json'),
  },
  toolMcqGen: {
    zh: () => import('@toolbox/tool-mcq-gen/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-split-bill/locales/en-US.json'),
  },
  toolMorseCode: {
    zh: () => import('@toolbox/tool-morse-code/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-curl-to-fetch/locales/en-US.json'),
  },
  toolAsciiArt: {
    zh: () => import('@toolbox/tool-ascii-art/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-jwt-decoder/locales/en-US.json'),
  },
  toolPasswordStrength: {
    zh: () => import('@toolbox/tool-password-strength/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-ipam-scan/locales/en-US.json'),
  },
  toolBaseConverter: {
    zh: () => import('@toolbox/tool-base-converter/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-security-domain-hijack/locales/en-US.json'),
  },
  toolWordCount: {
    zh: () => import('@toolbox/tool-word-count/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-api-availability/locales/en-US.json'),
  },
  toolPomodoroPro: {
    zh: () => import('@toolbox/tool-pomodoro-pro/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-domain-txt/locales/en-US.json'),
  },
  toolSecurityIpScore: {
    zh: () => import('@toolbox/tool-security-suite/src/locales/securityIpScore.zh.json'),
    en: () => import('@toolbox/tool-security-suite/src/locales/securityIpScore.en.json'),
  },
  toolSecurityDomainBlacklist: {
    zh: () => import('@toolbox/tool-security-suite/src/locales/securityDomainBlacklist.zh.json'),
    en: () => import('@toolbox/tool-security-suite/src/locales/securityDomainBlacklist.en.json'),
  },
  toolSecurityPortScan: {
    zh: () => import('@toolbox/tool-security-suite/src/locales/securityPortScan.zh.json'),
    en: () => import('@toolbox/tool-security-suite/src/locales/securityPortScan.en.json'),
  },
  toolSecurityDnsVuln: {
    zh: () => import('@toolbox/tool-security-suite/src/locales/securityDnsVuln.zh.json'),
    en: () => import('@toolbox/tool-security-suite/src/locales/securityDnsVuln.en.json'),
  },
  toolSecurityReportGen: {
    zh: () => import('@toolbox/tool-security-suite/src/locales/securityReportGen.zh.json'),
    en: () => import('@toolbox/tool-security-suite/src/locales/securityReportGen.en.json'),
  },
  toolIpamPlan: {
    zh: () => import('@toolbox/tool-ipam-suite/src/locales/ipamPlan.zh.json'),
    en: () => import('@toolbox/tool-ipam-suite/src/locales/ipamPlan.en.json'),
  },
  toolIpamInventory: {
    zh: () => import('@toolbox/tool-ipam-suite/src/locales/ipamInventory.zh.json'),
    en: () => import('@toolbox/tool-ipam-suite/src/locales/ipamInventory.en.json'),
  },
  toolIpamUsage: {
    zh: () => import('@toolbox/tool-ipam-suite/src/locales/ipamUsage.zh.json'),
    en: () => import('@toolbox/tool-ipam-suite/src/locales/ipamUsage.en.json'),
  },
  toolIpamConflict: {
    zh: () => import('@toolbox/tool-ipam-suite/src/locales/ipamConflict.zh.json'),
    en: () => import('@toolbox/tool-ipam-suite/src/locales/ipamConflict.en.json'),
  },
  toolIpamAllocationSim: {
    zh: () => import('@toolbox/tool-ipam-suite/src/locales/ipamAllocationSim.zh.json'),
    en: () => import('@toolbox/tool-ipam-suite/src/locales/ipamAllocationSim.en.json'),
  },
  toolHttpDebugger: {
    zh: () => import('@toolbox/tool-http-debugger/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-http-debugger/locales/en-US.json'),
  },
  toolInvestmentSim: {
    zh: () => import('@toolbox/tool-investment-sim/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-investment-sim/locales/en-US.json'),
  },
  toolMultiCityRoute: {
    zh: () => import('@toolbox/tool-multi-city-route/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-multi-city-route/locales/en-US.json'),
  },
  toolRunningTracker: {
    zh: () => import('@toolbox/tool-running-tracker/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-running-tracker/locales/en-US.json'),
  },
  toolSedentaryReminder: {
    zh: () => import('@toolbox/tool-sedentary-reminder/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-sedentary-reminder/locales/en-US.json'),
  },
  toolSleepTracker: {
    zh: () => import('@toolbox/tool-sleep-tracker/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-sleep-tracker/locales/en-US.json'),
  },
  toolTimeLogger: {
    zh: () => import('@toolbox/tool-time-logger/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-time-logger/locales/en-US.json'),
  },
  toolTravelCostEstimate: {
    zh: () => import('@toolbox/tool-travel-cost-estimate/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-travel-cost-estimate/locales/en-US.json'),
  },
  toolVisaInfo: {
    zh: () => import('@toolbox/tool-visa-info/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-visa-info/locales/en-US.json'),
  },
  toolFitnessPlanner: {
    zh: () => import('@toolbox/tool-fitness-planner/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-fitness-planner/locales/en-US.json'),
  },
  toolMeetingScheduler: {
    zh: () => import('@toolbox/tool-meeting-scheduler/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-meeting-scheduler/locales/en-US.json'),
  },
  toolColorSystem: {
    zh: () => import('@toolbox/tool-color-system/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-color-system/locales/en-US.json'),
  },
  toolGraphqlBuilder: {
    zh: () => import('@toolbox/tool-graphql-builder/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-graphql-builder/locales/en-US.json'),
  },
  toolWaterReminder: {
    zh: () => import('@toolbox/tool-water-reminder/locales/zh-CN.json'),
    en: () => import('@toolbox/tool-water-reminder/locales/en-US.json'),
  },
}
