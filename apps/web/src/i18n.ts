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
import toolGithubInfoZh from '@toolbox/tool-github-info/src/locales/zh.json'
import toolGithubInfoEn from '@toolbox/tool-github-info/src/locales/en.json'
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
import toolDnsNxdomainZh from '@toolbox/tool-dns-nxdomain/locales/zh-CN.json'
import toolDnsNxdomainEn from '@toolbox/tool-dns-nxdomain/locales/en-US.json'
import toolDomainMxZh from '@toolbox/tool-domain-mx/locales/zh-CN.json'
import toolDomainMxEn from '@toolbox/tool-domain-mx/locales/en-US.json'
import toolDomainTxtZh from '@toolbox/tool-domain-txt/locales/zh-CN.json'
import toolHttpHeadersZh from '@toolbox/tool-http-headers/locales/zh-CN.json'
import toolHttpHeadersEn from '@toolbox/tool-http-headers/locales/en-US.json'
import toolSslCertZh from '@toolbox/tool-ssl-cert/locales/zh-CN.json'
import toolSslCertEn from '@toolbox/tool-ssl-cert/locales/en-US.json'
import toolHttpStatusZh from '@toolbox/tool-http-status/locales/zh-CN.json'
import toolHttpStatusEn from '@toolbox/tool-http-status/locales/en-US.json'
import toolTcpPortZh from '@toolbox/tool-tcp-port/locales/zh-CN.json'
import toolTcpPortEn from '@toolbox/tool-tcp-port/locales/en-US.json'
import toolPingZh from '@toolbox/tool-ping/locales/zh-CN.json'
import toolPingEn from '@toolbox/tool-ping/locales/en-US.json'
import toolDnsLatencyZh from '@toolbox/tool-dns-latency/locales/zh-CN.json'
import toolDnsLatencyEn from '@toolbox/tool-dns-latency/locales/en-US.json'
import toolDnsAuthoritativeZh from '@toolbox/tool-dns-authoritative/locales/zh-CN.json'
import toolDnsAuthoritativeEn from '@toolbox/tool-dns-authoritative/locales/en-US.json'
import toolDnsRecursiveZh from '@toolbox/tool-dns-recursive/locales/zh-CN.json'
import toolDnsRecursiveEn from '@toolbox/tool-dns-recursive/locales/en-US.json'
import toolDnsPathVizZh from '@toolbox/tool-dns-path-viz/locales/zh-CN.json'
import toolDnsPathVizEn from '@toolbox/tool-dns-path-viz/locales/en-US.json'
import toolDnsTunnelZh from '@toolbox/tool-dns-tunnel/locales/zh-CN.json'
import toolDnsTunnelEn from '@toolbox/tool-dns-tunnel/locales/en-US.json'
import toolDhcpPoolCalcZh from '@toolbox/tool-dhcp-pool-calc/locales/zh-CN.json'
import toolDhcpPoolCalcEn from '@toolbox/tool-dhcp-pool-calc/locales/en-US.json'
import toolDhcpOptionZh from '@toolbox/tool-dhcp-option/locales/zh-CN.json'
import toolDhcpOptionEn from '@toolbox/tool-dhcp-option/locales/en-US.json'
import toolDhcpMacBindingZh from '@toolbox/tool-dhcp-mac-binding/locales/zh-CN.json'
import toolDhcpMacBindingEn from '@toolbox/tool-dhcp-mac-binding/locales/en-US.json'
import toolDhcpConfigGenZh from '@toolbox/tool-dhcp-config-gen/locales/zh-CN.json'
import toolDhcpConfigGenEn from '@toolbox/tool-dhcp-config-gen/locales/en-US.json'
import toolTracerouteZh from '@toolbox/tool-traceroute/locales/zh-CN.json'
import toolTracerouteEn from '@toolbox/tool-traceroute/locales/en-US.json'
import toolDhcpUtilizationZh from '@toolbox/tool-dhcp-utilization/locales/zh-CN.json'
import toolDhcpUtilizationEn from '@toolbox/tool-dhcp-utilization/locales/en-US.json'
import toolDhcpConflictZh from '@toolbox/tool-dhcp-conflict/locales/zh-CN.json'
import toolDhcpConflictEn from '@toolbox/tool-dhcp-conflict/locales/en-US.json'
import toolGslbWeightCalcZh from '@toolbox/tool-gslb-weight-calc/locales/zh-CN.json'
import toolGslbWeightCalcEn from '@toolbox/tool-gslb-weight-calc/locales/en-US.json'
import toolWebAvailabilityZh from '@toolbox/tool-web-availability/locales/zh-CN.json'
import toolWebAvailabilityEn from '@toolbox/tool-web-availability/locales/en-US.json'
import toolSecurityDomainScoreZh from '@toolbox/tool-security-domain-score/locales/zh-CN.json'
import toolSecurityDomainScoreEn from '@toolbox/tool-security-domain-score/locales/en-US.json'
import toolGslbFailoverSimZh from '@toolbox/tool-gslb-failover-sim/locales/zh-CN.json'
import toolGslbFailoverSimEn from '@toolbox/tool-gslb-failover-sim/locales/en-US.json'
import toolGslbGeoSimZh from '@toolbox/tool-gslb-geo-sim/locales/zh-CN.json'
import toolGslbGeoSimEn from '@toolbox/tool-gslb-geo-sim/locales/en-US.json'
import toolSecurityDnssecVerifyZh from '@toolbox/tool-security-dnssec-verify/locales/zh-CN.json'
import toolSecurityDnssecVerifyEn from '@toolbox/tool-security-dnssec-verify/locales/en-US.json'
import toolSecurityDnsDdosZh from '@toolbox/tool-security-dns-ddos/locales/zh-CN.json'
import toolSecurityDnsDdosEn from '@toolbox/tool-security-dns-ddos/locales/en-US.json'
import toolCdnCheckZh from '@toolbox/tool-cdn-check/locales/zh-CN.json'
import toolCdnCheckEn from '@toolbox/tool-cdn-check/locales/en-US.json'
import toolDhcpDiscoverSimZh from '@toolbox/tool-dhcp-discover-sim/locales/zh-CN.json'
import toolDhcpDiscoverSimEn from '@toolbox/tool-dhcp-discover-sim/locales/en-US.json'
import toolIpamSubnetUtilZh from '@toolbox/tool-ipam-subnet-util/locales/zh-CN.json'
import toolIpamSubnetUtilEn from '@toolbox/tool-ipam-subnet-util/locales/en-US.json'
import toolGslbHealthSimZh from '@toolbox/tool-gslb-health-sim/locales/zh-CN.json'
import toolGslbHealthSimEn from '@toolbox/tool-gslb-health-sim/locales/en-US.json'
import toolGslbLatencySimZh from '@toolbox/tool-gslb-latency-sim/locales/zh-CN.json'
import toolGslbLatencySimEn from '@toolbox/tool-gslb-latency-sim/locales/en-US.json'
import toolServerLatencyZh from '@toolbox/tool-server-latency/locales/zh-CN.json'
import toolServerLatencyEn from '@toolbox/tool-server-latency/locales/en-US.json'
import toolDhcpLeaseAnalysisZh from '@toolbox/tool-dhcp-lease-analysis/locales/zh-CN.json'
import toolDhcpLeaseAnalysisEn from '@toolbox/tool-dhcp-lease-analysis/locales/en-US.json'
import toolIpamVisualizeZh from '@toolbox/tool-ipam-visualize/locales/zh-CN.json'
import toolIpamVisualizeEn from '@toolbox/tool-ipam-visualize/locales/en-US.json'
import toolGslbPolicySimZh from '@toolbox/tool-gslb-policy-sim/locales/zh-CN.json'
import toolGslbPolicySimEn from '@toolbox/tool-gslb-policy-sim/locales/en-US.json'
import toolGslbRuleValidateZh from '@toolbox/tool-gslb-rule-validate/locales/zh-CN.json'
import toolGslbRuleValidateEn from '@toolbox/tool-gslb-rule-validate/locales/en-US.json'
import toolApiAvailabilityZh from '@toolbox/tool-api-availability/locales/zh-CN.json'
import toolGslbIspSimZh from '@toolbox/tool-gslb-isp-sim/locales/zh-CN.json'
import toolGslbIspSimEn from '@toolbox/tool-gslb-isp-sim/locales/en-US.json'
import toolGslbTrafficPredictZh from '@toolbox/tool-gslb-traffic-predict/locales/zh-CN.json'
import toolGslbTrafficPredictEn from '@toolbox/tool-gslb-traffic-predict/locales/en-US.json'
import toolGslbHitPredictZh from '@toolbox/tool-gslb-hit-predict/locales/zh-CN.json'
import toolGslbHitPredictEn from '@toolbox/tool-gslb-hit-predict/locales/en-US.json'
import toolIpamReclaimZh from '@toolbox/tool-ipam-reclaim/locales/zh-CN.json'
import toolIpamReclaimEn from '@toolbox/tool-ipam-reclaim/locales/en-US.json'
import toolSecurityDomainHijackZh from '@toolbox/tool-security-domain-hijack/locales/zh-CN.json'
import toolDhcpLogAnalysisZh from '@toolbox/tool-dhcp-log-analysis/locales/zh-CN.json'
import toolDhcpLogAnalysisEn from '@toolbox/tool-dhcp-log-analysis/locales/en-US.json'
import toolDhcpScanZh from '@toolbox/tool-dhcp-scan/locales/zh-CN.json'
import toolDhcpScanEn from '@toolbox/tool-dhcp-scan/locales/en-US.json'
import toolIpamChangelogZh from '@toolbox/tool-ipam-changelog/locales/zh-CN.json'
import toolIpamChangelogEn from '@toolbox/tool-ipam-changelog/locales/en-US.json'
import toolIpamScanZh from '@toolbox/tool-ipam-scan/locales/zh-CN.json'
import toolPomodoroZh from '@toolbox/tool-pomodoro/locales/zh-CN.json'
import toolPomodoroEn from '@toolbox/tool-pomodoro/locales/en-US.json'
import toolHabitTrackerZh from '@toolbox/tool-habit-tracker/locales/zh-CN.json'
import toolHabitTrackerEn from '@toolbox/tool-habit-tracker/locales/en-US.json'
import toolSalaryCalcZh from '@toolbox/tool-salary-calc/locales/zh-CN.json'
import toolSalaryCalcEn from '@toolbox/tool-salary-calc/locales/en-US.json'
import toolCurrencyConverterZh from '@toolbox/tool-currency-converter/locales/zh-CN.json'
import toolCurrencyConverterEn from '@toolbox/tool-currency-converter/locales/en-US.json'
import toolJwtDecoderZh from '@toolbox/tool-jwt-decoder/locales/zh-CN.json'
import toolExpenseTrackerZh from '@toolbox/tool-expense-tracker/locales/zh-CN.json'
import toolExpenseTrackerEn from '@toolbox/tool-expense-tracker/locales/en-US.json'
import toolSubscriptionManagerZh from '@toolbox/tool-subscription-manager/locales/zh-CN.json'
import toolSubscriptionManagerEn from '@toolbox/tool-subscription-manager/locales/en-US.json'
import toolCalorieCalcZh from '@toolbox/tool-calorie-calc/locales/zh-CN.json'
import toolCalorieCalcEn from '@toolbox/tool-calorie-calc/locales/en-US.json'
import toolRandomMenuZh from '@toolbox/tool-random-menu/locales/zh-CN.json'
import toolRandomMenuEn from '@toolbox/tool-random-menu/locales/en-US.json'
import toolCurlToFetchZh from '@toolbox/tool-curl-to-fetch/locales/zh-CN.json'
import toolInstallmentCalcZh from '@toolbox/tool-installment-calc/locales/zh-CN.json'
import toolInstallmentCalcEn from '@toolbox/tool-installment-calc/locales/en-US.json'
import toolOkrPlannerZh from '@toolbox/tool-okr-planner/locales/zh-CN.json'
import toolOkrPlannerEn from '@toolbox/tool-okr-planner/locales/en-US.json'
import toolTravelChecklistZh from '@toolbox/tool-travel-checklist/locales/zh-CN.json'
import toolTravelChecklistEn from '@toolbox/tool-travel-checklist/locales/en-US.json'
import toolTravelBudgetZh from '@toolbox/tool-travel-budget/locales/zh-CN.json'
import toolTravelBudgetEn from '@toolbox/tool-travel-budget/locales/en-US.json'
import toolSplitBillZh from '@toolbox/tool-split-bill/locales/zh-CN.json'
import toolTimezoneCalcZh from '@toolbox/tool-timezone-calc/locales/zh-CN.json'
import toolTimezoneCalcEn from '@toolbox/tool-timezone-calc/locales/en-US.json'
import toolDistanceCalcZh from '@toolbox/tool-distance-calc/locales/zh-CN.json'
import toolDistanceCalcEn from '@toolbox/tool-distance-calc/locales/en-US.json'
import toolPackingListZh from '@toolbox/tool-packing-list/locales/zh-CN.json'
import toolPackingListEn from '@toolbox/tool-packing-list/locales/en-US.json'
import toolRecipeFinderZh from '@toolbox/tool-recipe-finder/locales/zh-CN.json'
import toolRecipeFinderEn from '@toolbox/tool-recipe-finder/locales/en-US.json'
import toolStudyTimerZh from '@toolbox/tool-study-timer/locales/zh-CN.json'
import toolStudyTimerEn from '@toolbox/tool-study-timer/locales/en-US.json'
import toolStudyPlannerZh from '@toolbox/tool-study-planner/locales/zh-CN.json'
import toolStudyPlannerEn from '@toolbox/tool-study-planner/locales/en-US.json'
import toolFocusModeZh from '@toolbox/tool-focus-mode/locales/zh-CN.json'
import toolFocusModeEn from '@toolbox/tool-focus-mode/locales/en-US.json'
import toolVocabTrainerZh from '@toolbox/tool-vocab-trainer/locales/zh-CN.json'
import toolVocabTrainerEn from '@toolbox/tool-vocab-trainer/locales/en-US.json'
import toolMistakeBookZh from '@toolbox/tool-mistake-book/locales/zh-CN.json'
import toolMistakeBookEn from '@toolbox/tool-mistake-book/locales/en-US.json'
import toolFridgeInventoryZh from '@toolbox/tool-fridge-inventory/locales/zh-CN.json'
import toolFridgeInventoryEn from '@toolbox/tool-fridge-inventory/locales/en-US.json'
import toolExpiryReminderZh from '@toolbox/tool-expiry-reminder/locales/zh-CN.json'
import toolExpiryReminderEn from '@toolbox/tool-expiry-reminder/locales/en-US.json'
import toolFamilyTasksZh from '@toolbox/tool-family-tasks/locales/zh-CN.json'
import toolFamilyTasksEn from '@toolbox/tool-family-tasks/locales/en-US.json'
import toolBarcodeReaderZh from '@toolbox/tool-barcode-reader/locales/zh-CN.json'
import toolBarcodeReaderEn from '@toolbox/tool-barcode-reader/locales/en-US.json'
import toolQuizGenZh from '@toolbox/tool-quiz-gen/locales/zh-CN.json'
import toolQuizGenEn from '@toolbox/tool-quiz-gen/locales/en-US.json'
import toolTripPlannerZh from '@toolbox/tool-trip-planner/locales/zh-CN.json'
import toolTripPlannerEn from '@toolbox/tool-trip-planner/locales/en-US.json'
import toolDayTripZh from '@toolbox/tool-day-trip/locales/zh-CN.json'
import toolDayTripEn from '@toolbox/tool-day-trip/locales/en-US.json'
import toolSpacedRepetitionZh from '@toolbox/tool-spaced-repetition/locales/zh-CN.json'
import toolSpacedRepetitionEn from '@toolbox/tool-spaced-repetition/locales/en-US.json'
import toolTravelTranslatorZh from '@toolbox/tool-travel-translator/locales/zh-CN.json'
import toolTravelTranslatorEn from '@toolbox/tool-travel-translator/locales/en-US.json'
import toolKnowledgeCompareZh from '@toolbox/tool-knowledge-compare/locales/zh-CN.json'
import toolKnowledgeCompareEn from '@toolbox/tool-knowledge-compare/locales/en-US.json'
import toolLoanCalcZh from '@toolbox/tool-loan-calc/locales/zh-CN.json'
import toolLoanCalcEn from '@toolbox/tool-loan-calc/locales/en-US.json'
import toolIdCardParserZh from '@toolbox/tool-id-card-parser/locales/zh-CN.json'
import toolIdCardParserEn from '@toolbox/tool-id-card-parser/locales/en-US.json'
import toolColorBlindSimZh from '@toolbox/tool-color-blind-sim/locales/zh-CN.json'
import toolColorBlindSimEn from '@toolbox/tool-color-blind-sim/locales/en-US.json'
import toolTextToSpeechZh from '@toolbox/tool-text-to-speech/locales/zh-CN.json'
import toolTextToSpeechEn from '@toolbox/tool-text-to-speech/locales/en-US.json'
import toolCurrencyHistoryZh from '@toolbox/tool-currency-history/locales/zh-CN.json'
import toolCurrencyHistoryEn from '@toolbox/tool-currency-history/locales/en-US.json'
import toolOneLinerZh from '@toolbox/tool-one-liner/locales/zh-CN.json'
import toolOneLinerEn from '@toolbox/tool-one-liner/locales/en-US.json'
import toolEli5Zh from '@toolbox/tool-eli5/locales/zh-CN.json'
import toolEli5En from '@toolbox/tool-eli5/locales/en-US.json'
import toolMultiPerspectiveZh from '@toolbox/tool-multi-perspective/locales/zh-CN.json'
import toolMultiPerspectiveEn from '@toolbox/tool-multi-perspective/locales/en-US.json'
import toolMcqGenZh from '@toolbox/tool-mcq-gen/locales/zh-CN.json'
import toolMcqGenEn from '@toolbox/tool-mcq-gen/locales/en-US.json'
import toolMorseCodeZh from '@toolbox/tool-morse-code/locales/zh-CN.json'
import toolMorseCodeEn from '@toolbox/tool-morse-code/locales/en-US.json'
import toolAsciiArtZh from '@toolbox/tool-ascii-art/locales/zh-CN.json'
import toolAsciiArtEn from '@toolbox/tool-ascii-art/locales/en-US.json'
import toolPasswordStrengthZh from '@toolbox/tool-password-strength/locales/zh-CN.json'
import toolPasswordStrengthEn from '@toolbox/tool-password-strength/locales/en-US.json'
import toolBaseConverterZh from '@toolbox/tool-base-converter/locales/zh-CN.json'
import toolBaseConverterEn from '@toolbox/tool-base-converter/locales/en-US.json'
import toolWordCountZh from '@toolbox/tool-word-count/locales/zh-CN.json'
import toolWordCountEn from '@toolbox/tool-word-count/locales/en-US.json'
import toolPomodoroProZh from '@toolbox/tool-pomodoro-pro/locales/zh-CN.json'
import toolPomodoroProEn from '@toolbox/tool-pomodoro-pro/locales/en-US.json'
import toolSplitBillEn from '@toolbox/tool-split-bill/locales/en-US.json'
import toolCurlToFetchEn from '@toolbox/tool-curl-to-fetch/locales/en-US.json'
import toolJwtDecoderEn from '@toolbox/tool-jwt-decoder/locales/en-US.json'
import toolIpamScanEn from '@toolbox/tool-ipam-scan/locales/en-US.json'
import toolSecurityDomainHijackEn from '@toolbox/tool-security-domain-hijack/locales/en-US.json'
import toolApiAvailabilityEn from '@toolbox/tool-api-availability/locales/en-US.json'
import toolDomainTxtEn from '@toolbox/tool-domain-txt/locales/en-US.json'
import { domainSuiteZh, domainSuiteEn } from '@toolbox/tool-domain-suite/src/locales'
import { ipOpsZh, ipOpsEn } from '@toolbox/tool-ip-ops-suite/src/locales'
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
import { subnetZh, subnetEn } from '@toolbox/tool-subnet-suite/src/locales'
import toolHttpDebuggerZh from '@toolbox/tool-http-debugger/locales/zh-CN.json'
import toolHttpDebuggerEn from '@toolbox/tool-http-debugger/locales/en-US.json'
import toolInvestmentSimZh from '@toolbox/tool-investment-sim/locales/zh-CN.json'
import toolInvestmentSimEn from '@toolbox/tool-investment-sim/locales/en-US.json'
import toolMultiCityRouteZh from '@toolbox/tool-multi-city-route/locales/zh-CN.json'
import toolMultiCityRouteEn from '@toolbox/tool-multi-city-route/locales/en-US.json'
import toolRunningTrackerZh from '@toolbox/tool-running-tracker/locales/zh-CN.json'
import toolRunningTrackerEn from '@toolbox/tool-running-tracker/locales/en-US.json'
import toolSedentaryReminderZh from '@toolbox/tool-sedentary-reminder/locales/zh-CN.json'
import toolSedentaryReminderEn from '@toolbox/tool-sedentary-reminder/locales/en-US.json'
import toolSleepTrackerZh from '@toolbox/tool-sleep-tracker/locales/zh-CN.json'
import toolSleepTrackerEn from '@toolbox/tool-sleep-tracker/locales/en-US.json'
import toolTimeLoggerZh from '@toolbox/tool-time-logger/locales/zh-CN.json'
import toolTimeLoggerEn from '@toolbox/tool-time-logger/locales/en-US.json'
import toolTravelCostEstimateZh from '@toolbox/tool-travel-cost-estimate/locales/zh-CN.json'
import toolTravelCostEstimateEn from '@toolbox/tool-travel-cost-estimate/locales/en-US.json'
import toolVisaInfoZh from '@toolbox/tool-visa-info/locales/zh-CN.json'
import toolVisaInfoEn from '@toolbox/tool-visa-info/locales/en-US.json'
import toolFitnessPlannerZh from '@toolbox/tool-fitness-planner/locales/zh-CN.json'
import toolFitnessPlannerEn from '@toolbox/tool-fitness-planner/locales/en-US.json'
import toolMeetingSchedulerZh from '@toolbox/tool-meeting-scheduler/locales/zh-CN.json'
import toolMeetingSchedulerEn from '@toolbox/tool-meeting-scheduler/locales/en-US.json'
import toolColorSystemZh from '@toolbox/tool-color-system/locales/zh-CN.json'
import toolColorSystemEn from '@toolbox/tool-color-system/locales/en-US.json'
import toolGraphqlBuilderZh from '@toolbox/tool-graphql-builder/locales/zh-CN.json'
import toolGraphqlBuilderEn from '@toolbox/tool-graphql-builder/locales/en-US.json'
import toolWaterReminderZh from '@toolbox/tool-water-reminder/locales/zh-CN.json'
import toolWaterReminderEn from '@toolbox/tool-water-reminder/locales/en-US.json'

const STORAGE_KEY = 'toolbox-lang'

export const defaultNS = 'common'
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
    toolJson: toolJsonZh as Record<string, string>,
    toolGithubInfo: toolGithubInfoZh as unknown as Record<string, string>,
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
    toolDnsNxdomain: toolDnsNxdomainZh as Record<string, string>,
    toolDomainMx: toolDomainMxZh as Record<string, string>,
    toolDomainTxt: toolDomainTxtZh as Record<string, string>,
    toolHttpHeaders: toolHttpHeadersZh as Record<string, string>,
    toolSslCert: toolSslCertZh as Record<string, string>,
    toolHttpStatus: toolHttpStatusZh as Record<string, string>,
    toolTcpPort: toolTcpPortZh as Record<string, string>,
    toolPing: toolPingZh as Record<string, string>,
    toolDnsLatency: toolDnsLatencyZh as Record<string, string>,
    toolDnsAuthoritative: toolDnsAuthoritativeZh as Record<string, string>,
    toolDnsRecursive: toolDnsRecursiveZh as Record<string, string>,
    toolDnsPathViz: toolDnsPathVizZh as Record<string, string>,
    toolDnsTunnel: toolDnsTunnelZh as Record<string, string>,
    toolDhcpPoolCalc: toolDhcpPoolCalcZh as Record<string, string>,
    toolDhcpOption: toolDhcpOptionZh as Record<string, string>,
    toolDhcpMacBinding: toolDhcpMacBindingZh as Record<string, string>,
    toolDhcpConfigGen: toolDhcpConfigGenZh as Record<string, string>,
    toolTraceroute: toolTracerouteZh as Record<string, string>,
    toolDhcpUtilization: toolDhcpUtilizationZh as Record<string, string>,
    toolDhcpConflict: toolDhcpConflictZh as Record<string, string>,
    toolGslbWeightCalc: toolGslbWeightCalcZh as Record<string, string>,
    toolWebAvailability: toolWebAvailabilityZh as Record<string, string>,
    toolSecurityDomainScore: toolSecurityDomainScoreZh as Record<string, string>,
    toolGslbFailoverSim: toolGslbFailoverSimZh as Record<string, string>,
    toolGslbGeoSim: toolGslbGeoSimZh as Record<string, string>,
    toolSecurityDnssecVerify: toolSecurityDnssecVerifyZh as Record<string, string>,
    toolSecurityDnsDdos: toolSecurityDnsDdosZh as Record<string, string>,
    toolCdnCheck: toolCdnCheckZh as Record<string, string>,
    toolDhcpDiscoverSim: toolDhcpDiscoverSimZh as Record<string, string>,
    toolIpamSubnetUtil: toolIpamSubnetUtilZh as Record<string, string>,
    toolGslbHealthSim: toolGslbHealthSimZh as Record<string, string>,
    toolGslbLatencySim: toolGslbLatencySimZh as Record<string, string>,
    toolServerLatency: toolServerLatencyZh as Record<string, string>,
    toolDhcpLeaseAnalysis: toolDhcpLeaseAnalysisZh as Record<string, string>,
    toolIpamVisualize: toolIpamVisualizeZh as Record<string, string>,
    toolGslbPolicySim: toolGslbPolicySimZh as Record<string, string>,
    toolGslbRuleValidate: toolGslbRuleValidateZh as Record<string, string>,
    toolApiAvailability: toolApiAvailabilityZh as Record<string, string>,
    toolGslbIspSim: toolGslbIspSimZh as Record<string, string>,
    toolGslbTrafficPredict: toolGslbTrafficPredictZh as Record<string, string>,
    toolGslbHitPredict: toolGslbHitPredictZh as Record<string, string>,
    toolIpamReclaim: toolIpamReclaimZh as Record<string, string>,
    toolSecurityDomainHijack: toolSecurityDomainHijackZh as Record<string, string>,
    toolDhcpLogAnalysis: toolDhcpLogAnalysisZh as Record<string, string>,
    toolDhcpScan: toolDhcpScanZh as Record<string, string>,
    toolIpamChangelog: toolIpamChangelogZh as Record<string, string>,
    toolIpamScan: toolIpamScanZh as Record<string, string>,
    toolPomodoro: toolPomodoroZh as Record<string, string>,
    toolHabitTracker: toolHabitTrackerZh as Record<string, string>,
    toolSalaryCalc: toolSalaryCalcZh as Record<string, string>,
    toolCurrencyConverter: toolCurrencyConverterZh as Record<string, string>,
    toolJwtDecoder: toolJwtDecoderZh as Record<string, string>,
    toolExpenseTracker: toolExpenseTrackerZh as Record<string, string>,
    toolSubscriptionManager: toolSubscriptionManagerZh as unknown as Record<string, string>,
    toolCalorieCalc: toolCalorieCalcZh as Record<string, string>,
    toolRandomMenu: toolRandomMenuZh as Record<string, string>,
    toolCurlToFetch: toolCurlToFetchZh as Record<string, string>,
    toolInstallmentCalc: toolInstallmentCalcZh as Record<string, string>,
    toolOkrPlanner: toolOkrPlannerZh as Record<string, string>,
    toolTravelChecklist: toolTravelChecklistZh as Record<string, string>,
    toolTravelBudget: toolTravelBudgetZh as Record<string, string>,
    toolSplitBill: toolSplitBillZh as Record<string, string>,
    toolTimezoneCalc: toolTimezoneCalcZh as Record<string, string>,
    toolDistanceCalc: toolDistanceCalcZh as Record<string, string>,
    toolPackingList: toolPackingListZh as Record<string, string>,
    toolRecipeFinder: toolRecipeFinderZh as Record<string, string>,
    toolStudyTimer: toolStudyTimerZh as Record<string, string>,
    toolStudyPlanner: toolStudyPlannerZh as unknown as Record<string, string>,
    toolFocusMode: toolFocusModeZh as unknown as Record<string, string>,
    toolVocabTrainer: toolVocabTrainerZh as Record<string, string>,
    toolMistakeBook: toolMistakeBookZh as Record<string, string>,
    toolFridgeInventory: toolFridgeInventoryZh as Record<string, string>,
    toolExpiryReminder: toolExpiryReminderZh as Record<string, string>,
    toolFamilyTasks: toolFamilyTasksZh as Record<string, string>,
    toolBarcodeReader: toolBarcodeReaderZh as Record<string, string>,
    toolQuizGen: toolQuizGenZh as Record<string, string>,
    toolTripPlanner: toolTripPlannerZh as Record<string, string>,
    toolDayTrip: toolDayTripZh as Record<string, string>,
    toolSpacedRepetition: toolSpacedRepetitionZh as Record<string, string>,
    toolTravelTranslator: toolTravelTranslatorZh as Record<string, string>,
    toolKnowledgeCompare: toolKnowledgeCompareZh as Record<string, string>,
    toolLoanCalc: toolLoanCalcZh as Record<string, string>,
    toolIdCardParser: toolIdCardParserZh as Record<string, string>,
    toolColorBlindSim: toolColorBlindSimZh as Record<string, string>,
    toolTextToSpeech: toolTextToSpeechZh as Record<string, string>,
    toolCurrencyHistory: toolCurrencyHistoryZh as Record<string, string>,
    toolOneLiner: toolOneLinerZh as Record<string, string>,
    toolEli5: toolEli5Zh as Record<string, string>,
    toolMultiPerspective: toolMultiPerspectiveZh as Record<string, string>,
    toolMcqGen: toolMcqGenZh as Record<string, string>,
    toolMorseCode: toolMorseCodeZh as Record<string, string>,
    toolAsciiArt: toolAsciiArtZh as Record<string, string>,
    toolPasswordStrength: toolPasswordStrengthZh as Record<string, string>,
    toolBaseConverter: toolBaseConverterZh as Record<string, string>,
    toolWordCount: toolWordCountZh as Record<string, string>,
    toolPomodoroPro: toolPomodoroProZh as Record<string, string>,
    toolTimeLogger: toolTimeLoggerZh as Record<string, string>,
    toolInvestmentSim: toolInvestmentSimZh as Record<string, string>,
    toolSleepTracker: toolSleepTrackerZh as Record<string, string>,
    toolWaterReminder: toolWaterReminderZh as Record<string, string>,
    toolRunningTracker: toolRunningTrackerZh as Record<string, string>,
    toolSedentaryReminder: toolSedentaryReminderZh as Record<string, string>,
    toolHttpDebugger: toolHttpDebuggerZh as Record<string, string>,
    toolTravelCostEstimate: toolTravelCostEstimateZh as Record<string, string>,
    toolMultiCityRoute: toolMultiCityRouteZh as Record<string, string>,
    toolVisaInfo: toolVisaInfoZh as Record<string, string>,
    toolFitnessPlanner: toolFitnessPlannerZh as Record<string, string>,
    toolMeetingScheduler: toolMeetingSchedulerZh as Record<string, string>,
    toolColorSystem: toolColorSystemZh as Record<string, string>,
    toolGraphqlBuilder: toolGraphqlBuilderZh as Record<string, string>,
    ...(domainSuiteZh as unknown as Record<string, Record<string, string>>),
    ...(ipOpsZh as unknown as Record<string, Record<string, string>>),
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
    toolJson: toolJsonEn as Record<string, string>,
    toolGithubInfo: toolGithubInfoEn as unknown as Record<string, string>,
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
    toolDnsNxdomain: toolDnsNxdomainEn as Record<string, string>,
    toolDomainMx: toolDomainMxEn as Record<string, string>,
    toolDomainTxt: toolDomainTxtEn as Record<string, string>,
    toolHttpHeaders: toolHttpHeadersEn as Record<string, string>,
    toolSslCert: toolSslCertEn as Record<string, string>,
    toolHttpStatus: toolHttpStatusEn as Record<string, string>,
    toolTcpPort: toolTcpPortEn as Record<string, string>,
    toolPing: toolPingEn as Record<string, string>,
    toolDnsLatency: toolDnsLatencyEn as Record<string, string>,
    toolDnsAuthoritative: toolDnsAuthoritativeEn as Record<string, string>,
    toolDnsRecursive: toolDnsRecursiveEn as Record<string, string>,
    toolDnsPathViz: toolDnsPathVizEn as Record<string, string>,
    toolDnsTunnel: toolDnsTunnelEn as Record<string, string>,
    toolDhcpPoolCalc: toolDhcpPoolCalcEn as Record<string, string>,
    toolDhcpOption: toolDhcpOptionEn as Record<string, string>,
    toolDhcpMacBinding: toolDhcpMacBindingEn as Record<string, string>,
    toolDhcpConfigGen: toolDhcpConfigGenEn as Record<string, string>,
    toolTraceroute: toolTracerouteEn as Record<string, string>,
    toolDhcpUtilization: toolDhcpUtilizationEn as Record<string, string>,
    toolDhcpConflict: toolDhcpConflictEn as Record<string, string>,
    toolGslbWeightCalc: toolGslbWeightCalcEn as Record<string, string>,
    toolWebAvailability: toolWebAvailabilityEn as Record<string, string>,
    toolSecurityDomainScore: toolSecurityDomainScoreEn as Record<string, string>,
    toolGslbFailoverSim: toolGslbFailoverSimEn as Record<string, string>,
    toolGslbGeoSim: toolGslbGeoSimEn as Record<string, string>,
    toolSecurityDnssecVerify: toolSecurityDnssecVerifyEn as Record<string, string>,
    toolSecurityDnsDdos: toolSecurityDnsDdosEn as Record<string, string>,
    toolCdnCheck: toolCdnCheckEn as Record<string, string>,
    toolDhcpDiscoverSim: toolDhcpDiscoverSimEn as Record<string, string>,
    toolIpamSubnetUtil: toolIpamSubnetUtilEn as Record<string, string>,
    toolGslbHealthSim: toolGslbHealthSimEn as Record<string, string>,
    toolGslbLatencySim: toolGslbLatencySimEn as Record<string, string>,
    toolServerLatency: toolServerLatencyEn as Record<string, string>,
    toolDhcpLeaseAnalysis: toolDhcpLeaseAnalysisEn as Record<string, string>,
    toolIpamVisualize: toolIpamVisualizeEn as Record<string, string>,
    toolGslbPolicySim: toolGslbPolicySimEn as Record<string, string>,
    toolGslbRuleValidate: toolGslbRuleValidateEn as Record<string, string>,
    toolApiAvailability: toolApiAvailabilityEn as Record<string, string>,
    toolGslbIspSim: toolGslbIspSimEn as Record<string, string>,
    toolGslbTrafficPredict: toolGslbTrafficPredictEn as Record<string, string>,
    toolGslbHitPredict: toolGslbHitPredictEn as Record<string, string>,
    toolIpamReclaim: toolIpamReclaimEn as Record<string, string>,
    toolSecurityDomainHijack: toolSecurityDomainHijackEn as Record<string, string>,
    toolDhcpLogAnalysis: toolDhcpLogAnalysisEn as Record<string, string>,
    toolDhcpScan: toolDhcpScanEn as Record<string, string>,
    toolIpamChangelog: toolIpamChangelogEn as Record<string, string>,
    toolIpamScan: toolIpamScanEn as Record<string, string>,
    toolPomodoro: toolPomodoroEn as Record<string, string>,
    toolHabitTracker: toolHabitTrackerEn as Record<string, string>,
    toolSalaryCalc: toolSalaryCalcEn as Record<string, string>,
    toolCurrencyConverter: toolCurrencyConverterEn as Record<string, string>,
    toolJwtDecoder: toolJwtDecoderEn as Record<string, string>,
    toolExpenseTracker: toolExpenseTrackerEn as Record<string, string>,
    toolSubscriptionManager: toolSubscriptionManagerEn as unknown as Record<string, string>,
    toolCalorieCalc: toolCalorieCalcEn as Record<string, string>,
    toolRandomMenu: toolRandomMenuEn as Record<string, string>,
    toolCurlToFetch: toolCurlToFetchEn as Record<string, string>,
    toolInstallmentCalc: toolInstallmentCalcEn as Record<string, string>,
    toolOkrPlanner: toolOkrPlannerEn as Record<string, string>,
    toolTravelChecklist: toolTravelChecklistEn as Record<string, string>,
    toolTravelBudget: toolTravelBudgetEn as Record<string, string>,
    toolSplitBill: toolSplitBillEn as Record<string, string>,
    toolTimezoneCalc: toolTimezoneCalcEn as Record<string, string>,
    toolDistanceCalc: toolDistanceCalcEn as Record<string, string>,
    toolPackingList: toolPackingListEn as Record<string, string>,
    toolRecipeFinder: toolRecipeFinderEn as Record<string, string>,
    toolStudyTimer: toolStudyTimerEn as Record<string, string>,
    toolStudyPlanner: toolStudyPlannerEn as unknown as Record<string, string>,
    toolFocusMode: toolFocusModeEn as unknown as Record<string, string>,
    toolVocabTrainer: toolVocabTrainerEn as Record<string, string>,
    toolMistakeBook: toolMistakeBookEn as Record<string, string>,
    toolFridgeInventory: toolFridgeInventoryEn as Record<string, string>,
    toolExpiryReminder: toolExpiryReminderEn as Record<string, string>,
    toolFamilyTasks: toolFamilyTasksEn as Record<string, string>,
    toolBarcodeReader: toolBarcodeReaderEn as Record<string, string>,
    toolQuizGen: toolQuizGenEn as Record<string, string>,
    toolTripPlanner: toolTripPlannerEn as Record<string, string>,
    toolDayTrip: toolDayTripEn as Record<string, string>,
    toolSpacedRepetition: toolSpacedRepetitionEn as Record<string, string>,
    toolTravelTranslator: toolTravelTranslatorEn as Record<string, string>,
    toolKnowledgeCompare: toolKnowledgeCompareEn as Record<string, string>,
    toolLoanCalc: toolLoanCalcEn as Record<string, string>,
    toolIdCardParser: toolIdCardParserEn as Record<string, string>,
    toolColorBlindSim: toolColorBlindSimEn as Record<string, string>,
    toolTextToSpeech: toolTextToSpeechEn as Record<string, string>,
    toolCurrencyHistory: toolCurrencyHistoryEn as Record<string, string>,
    toolOneLiner: toolOneLinerEn as Record<string, string>,
    toolEli5: toolEli5En as Record<string, string>,
    toolMultiPerspective: toolMultiPerspectiveEn as Record<string, string>,
    toolMcqGen: toolMcqGenEn as Record<string, string>,
    toolMorseCode: toolMorseCodeEn as Record<string, string>,
    toolAsciiArt: toolAsciiArtEn as Record<string, string>,
    toolPasswordStrength: toolPasswordStrengthEn as Record<string, string>,
    toolBaseConverter: toolBaseConverterEn as Record<string, string>,
    toolWordCount: toolWordCountEn as Record<string, string>,
    toolPomodoroPro: toolPomodoroProEn as Record<string, string>,
    toolTimeLogger: toolTimeLoggerEn as Record<string, string>,
    toolInvestmentSim: toolInvestmentSimEn as Record<string, string>,
    toolSleepTracker: toolSleepTrackerEn as Record<string, string>,
    toolWaterReminder: toolWaterReminderEn as Record<string, string>,
    toolRunningTracker: toolRunningTrackerEn as Record<string, string>,
    toolSedentaryReminder: toolSedentaryReminderEn as Record<string, string>,
    toolHttpDebugger: toolHttpDebuggerEn as Record<string, string>,
    toolTravelCostEstimate: toolTravelCostEstimateEn as Record<string, string>,
    toolMultiCityRoute: toolMultiCityRouteEn as Record<string, string>,
    toolVisaInfo: toolVisaInfoEn as Record<string, string>,
    toolFitnessPlanner: toolFitnessPlannerEn as Record<string, string>,
    toolMeetingScheduler: toolMeetingSchedulerEn as Record<string, string>,
    toolColorSystem: toolColorSystemEn as Record<string, string>,
    toolGraphqlBuilder: toolGraphqlBuilderEn as Record<string, string>,
    ...(domainSuiteEn as unknown as Record<string, Record<string, string>>),
    ...(ipOpsEn as unknown as Record<string, Record<string, string>>),
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
    ...(subnetEn as unknown as Record<string, Record<string, string>>),
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
