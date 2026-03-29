import React, { Suspense, lazy } from 'react'
import { useTranslation } from 'react-i18next'
import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import { ManifestToolRoute } from './tooling/ManifestToolRoute'
import weatherToolManifest from '@toolbox/tool-weather/tool.manifest'
import todoListToolManifest from '@toolbox/tool-todo-list/tool.manifest'
import Home from './pages/Home'
import Favorites from './pages/Favorites'
import HotNews from './pages/HotNews'
import ZipCode from './pages/ZipCode'
import Base64 from './pages/Base64'
import Timestamp from './pages/Timestamp'
import UrlEncoder from './pages/UrlEncoder'
import RegexTester from './pages/RegexTester'
import CronGenerator from './pages/CronGenerator'
import PasswordGenerator from './pages/PasswordGenerator'
import HashGenerator from './pages/HashGenerator'
import CodeFormatter from './pages/CodeFormatter'
import UuidGenerator from './pages/UuidGenerator'
import ImageCompressor from './pages/ImageCompressor'
import MarkdownConverter from './pages/MarkdownConverter'
import BMICalculator from './pages/BMICalculator'
import ColorPicker from './pages/ColorPicker'
import ImageBackgroundRemover from './pages/ImageBackgroundRemover'
const ImageWatermark = lazy(() => import('@toolbox/tool-image-watermark'))
const ImageCropper = lazy(() => import('@toolbox/tool-image-cropper'))
const ImageRotator = lazy(() => import('@toolbox/tool-image-rotator'))
const ImageFilter = lazy(() => import('@toolbox/tool-image-filter'))
const ImageStitcher = lazy(() => import('@toolbox/tool-image-stitcher'))
const ImageWatermarkRemover = lazy(() => import('@toolbox/tool-image-watermark-remover'))
import UnitConverter from './pages/UnitConverter'
import TextComparator from './pages/TextComparator'
import DnsQuery from './pages/DnsQuery'
import SheetEditor from './pages/SheetEditor'
import FormatConverter from './pages/FormatConverter'
import ShortLinkGenerator from './pages/ShortLinkGenerator'
import ShortLinkRedirect from './pages/ShortLinkRedirect'
import ColorGenerator from './pages/ColorGenerator'
import MemeGenerator from './pages/MemeGenerator'
import CopywritingGenerator from './pages/CopywritingGenerator'
import ElectronicWoodenFish from './pages/ElectronicWoodenFish'
import LifeProgressBar from './pages/LifeProgressBar'
import MeetingMinutes from './pages/MeetingMinutes'
import UIGenerator from './pages/UIGenerator'
const VocabTrainer = lazy(() => import('@toolbox/tool-vocab-trainer'))
const MistakeBook = lazy(() => import('@toolbox/tool-mistake-book'))
const DailyPlanner = lazy(() => import('@toolbox/tool-daily-planner'))
const FridgeInventory = lazy(() => import('@toolbox/tool-fridge-inventory'))
const ExpiryReminder = lazy(() => import('@toolbox/tool-expiry-reminder'))
const FamilyTasks = lazy(() => import('@toolbox/tool-family-tasks'))
const BarcodeReader = lazy(() => import('@toolbox/tool-barcode-reader'))
const QuizGen = lazy(() => import('@toolbox/tool-quiz-gen'))
const TripPlanner = lazy(() => import('@toolbox/tool-trip-planner'))
const DayTrip = lazy(() => import('@toolbox/tool-day-trip'))
const SpacedRepetition = lazy(() => import('@toolbox/tool-spaced-repetition'))
const TravelTranslator = lazy(() => import('@toolbox/tool-travel-translator'))
const ProjectScaffold = lazy(() => import('@toolbox/tool-project-scaffold'))
const KnowledgeCompare = lazy(() => import('@toolbox/tool-knowledge-compare'))
const LoanCalc = lazy(() => import('@toolbox/tool-loan-calc'))
const IdCardParser = lazy(() => import('@toolbox/tool-id-card-parser'))
const ColorBlindSim = lazy(() => import('@toolbox/tool-color-blind-sim'))
const TextToSpeech = lazy(() => import('@toolbox/tool-text-to-speech'))
const CurrencyHistory = lazy(() => import('@toolbox/tool-currency-history'))
const OneLiner = lazy(() => import('@toolbox/tool-one-liner'))
const Eli5 = lazy(() => import('@toolbox/tool-eli5'))
const MultiPerspective = lazy(() => import('@toolbox/tool-multi-perspective'))
const McqGen = lazy(() => import('@toolbox/tool-mcq-gen'))
const MorseCode = lazy(() => import('@toolbox/tool-morse-code'))
const AsciiArt = lazy(() => import('@toolbox/tool-ascii-art'))
const PasswordStrength = lazy(() => import('@toolbox/tool-password-strength'))
const BaseConverter = lazy(() => import('@toolbox/tool-base-converter'))
const WordCount = lazy(() => import('@toolbox/tool-word-count'))
const PomodoroPro = lazy(() => import('@toolbox/tool-pomodoro-pro'))
const TimeLogger = lazy(() => import('@toolbox/tool-time-logger'))
const InvestmentSim = lazy(() => import('@toolbox/tool-investment-sim'))
const SleepTracker = lazy(() => import('@toolbox/tool-sleep-tracker'))
const WaterReminder = lazy(() => import('@toolbox/tool-water-reminder'))
const RunningTracker = lazy(() => import('@toolbox/tool-running-tracker'))
const SedentaryReminder = lazy(() => import('@toolbox/tool-sedentary-reminder'))
const HttpDebugger = lazy(() => import('@toolbox/tool-http-debugger'))
const TravelCostEstimate = lazy(() => import('@toolbox/tool-travel-cost-estimate'))
const MultiCityRoute = lazy(() => import('@toolbox/tool-multi-city-route'))
const VisaInfo = lazy(() => import('@toolbox/tool-visa-info'))
const FitnessPlanner = lazy(() => import('@toolbox/tool-fitness-planner'))
const MeetingScheduler = lazy(() => import('@toolbox/tool-meeting-scheduler'))
const ColorSystem = lazy(() => import('@toolbox/tool-color-system'))
const GraphqlBuilder = lazy(() => import('@toolbox/tool-graphql-builder'))
const HabitTracker = lazy(() => import('@toolbox/tool-habit-tracker'))

function RouteLoading() {
  const { t } = useTranslation('common')
  return (
    <div className="flex min-h-[200px] items-center justify-center text-gray-500 dark:text-gray-300">
      {t('loading')}
    </div>
  )
}

const QrCodeGenerator = lazy(() =>
  import('@toolbox/tool-qrcode').then((m) => ({ default: m.QrCodeGenerator }))
)
const QrCodeReader = lazy(() =>
  import('@toolbox/tool-qrcode').then((m) => ({ default: m.QrCodeReader }))
)
const QrCodeBeautifier = lazy(() =>
  import('@toolbox/tool-qrcode').then((m) => ({ default: m.QrCodeBeautifier }))
)
const PdfTools = lazy(() => import('@toolbox/tool-pdf'))
const ResumeGenerator = lazy(() => import('@toolbox/tool-resume'))
const JsonFormatter = lazy(() =>
  import('@toolbox/tool-json').then((m) => ({ default: m.JsonFormatter }))
)
const GithubInfo = lazy(() => import('@toolbox/tool-github-info'))
const IpQuery = lazy(() =>
  import('@toolbox/tool-ip-query').then((m) => ({ default: m.IpQuery }))
)
const IpAsn = lazy(() =>
  import('@toolbox/tool-ip-asn').then((m) => ({ default: m.IpAsn }))
)
const DnsTrace = lazy(() =>
  import('@toolbox/tool-dns-trace').then((m) => ({ default: m.DnsTrace }))
)
const DnsPropagation = lazy(() =>
  import('@toolbox/tool-dns-propagation').then((m) => ({ default: m.DnsPropagation }))
)
const PptGenerator = lazy(() =>
  import('@toolbox/tool-ppt-generator').then((m) => ({ default: m.PptGenerator }))
)
const DnsGlobalCheck = lazy(() =>
  import('@toolbox/tool-dns-global-check').then((m) => ({ default: m.DnsGlobalCheck }))
)
const DnssecCheck = lazy(() =>
  import('@toolbox/tool-dnssec-check').then((m) => ({ default: m.DnssecCheck }))
)
const DnsPerformance = lazy(() =>
  import('@toolbox/tool-dns-performance').then((m) => ({ default: m.DnsPerformance }))
)
const DnsTtl = lazy(() =>
  import('@toolbox/tool-dns-ttl').then((m) => ({ default: m.DnsTtl }))
)
const DnsSoa = lazy(() =>
  import('@toolbox/tool-dns-soa').then((m) => ({ default: m.DnsSoa }))
)
const DnsDiagnose = lazy(() =>
  import('@toolbox/tool-dns-diagnose').then((m) => ({ default: m.DnsDiagnose }))
)
const DnsPollutionCheck = lazy(() =>
  import('@toolbox/tool-dns-pollution-check').then((m) => ({ default: m.DnsPollutionCheck }))
)
const DnsHijackCheck = lazy(() =>
  import('@toolbox/tool-dns-hijack-check').then((m) => ({ default: m.DnsHijackCheck }))
)
const DnsCacheCheck = lazy(() =>
  import('@toolbox/tool-dns-cache-check').then((m) => ({ default: m.DnsCacheCheck }))
)
const DnsLoopCheck = lazy(() =>
  import('@toolbox/tool-dns-loop-check').then((m) => ({ default: m.DnsLoopCheck }))
)
const DnsNs = lazy(() =>
  import('@toolbox/tool-dns-ns').then((m) => ({ default: m.default }))
)
const DnsCnameChain = lazy(() =>
  import('@toolbox/tool-dns-cname-chain').then((m) => ({ default: m.default }))
)
const DnsNxdomain = lazy(() =>
  import('@toolbox/tool-dns-nxdomain').then((m) => ({ default: m.default }))
)
const DomainMx = lazy(() =>
  import('@toolbox/tool-domain-mx').then((m) => ({ default: m.default }))
)
const DomainTxt = lazy(() =>
  import('@toolbox/tool-domain-txt').then((m) => ({ default: m.default }))
)
const HttpHeaders = lazy(() => import('@toolbox/tool-http-headers').then((m) => ({ default: m.default })))
const SslCert = lazy(() => import('@toolbox/tool-ssl-cert').then((m) => ({ default: m.default })))
const HttpStatus = lazy(() => import('@toolbox/tool-http-status').then((m) => ({ default: m.default })))
const TcpPort = lazy(() => import('@toolbox/tool-tcp-port').then((m) => ({ default: m.default })))
const Ping = lazy(() => import('@toolbox/tool-ping').then((m) => ({ default: m.default })))
const DnsLatency = lazy(() => import('@toolbox/tool-dns-latency').then((m) => ({ default: m.default })))
const DnsAuthoritative = lazy(() => import('@toolbox/tool-dns-authoritative').then((m) => ({ default: m.default })))
const DnsRecursive = lazy(() => import('@toolbox/tool-dns-recursive').then((m) => ({ default: m.default })))
const DnsPathViz = lazy(() => import('@toolbox/tool-dns-path-viz').then((m) => ({ default: m.default })))
const DnsTunnel = lazy(() => import('@toolbox/tool-dns-tunnel').then((m) => ({ default: m.default })))
const DhcpPoolCalc = lazy(() => import('@toolbox/tool-dhcp-pool-calc').then((m) => ({ default: m.default })))
const DhcpOption = lazy(() => import('@toolbox/tool-dhcp-option').then((m) => ({ default: m.default })))
const DhcpMacBinding = lazy(() => import('@toolbox/tool-dhcp-mac-binding').then((m) => ({ default: m.default })))
const DhcpConfigGen = lazy(() => import('@toolbox/tool-dhcp-config-gen').then((m) => ({ default: m.default })))
const Traceroute = lazy(() => import('@toolbox/tool-traceroute').then((m) => ({ default: m.default })))
const DhcpUtilization = lazy(() => import('@toolbox/tool-dhcp-utilization').then((m) => ({ default: m.default })))
const DhcpConflict = lazy(() => import('@toolbox/tool-dhcp-conflict').then((m) => ({ default: m.default })))
const GslbWeightCalc = lazy(() => import('@toolbox/tool-gslb-weight-calc').then((m) => ({ default: m.default })))
const WebAvailability = lazy(() => import('@toolbox/tool-web-availability').then((m) => ({ default: m.default })))
const SecurityDomainScore = lazy(() => import('@toolbox/tool-security-domain-score').then((m) => ({ default: m.default })))
const GslbFailoverSim = lazy(() => import('@toolbox/tool-gslb-failover-sim').then((m) => ({ default: m.default })))
const GslbGeoSim = lazy(() => import('@toolbox/tool-gslb-geo-sim').then((m) => ({ default: m.default })))
const SecurityDnssecVerify = lazy(() => import('@toolbox/tool-security-dnssec-verify').then((m) => ({ default: m.default })))
const SecurityDnsDdos = lazy(() => import('@toolbox/tool-security-dns-ddos').then((m) => ({ default: m.default })))
const CdnCheck = lazy(() => import('@toolbox/tool-cdn-check').then((m) => ({ default: m.default })))
const DhcpDiscoverSim = lazy(() => import('@toolbox/tool-dhcp-discover-sim').then((m) => ({ default: m.default })))
const IpamSubnetUtil = lazy(() => import('@toolbox/tool-ipam-subnet-util').then((m) => ({ default: m.default })))
const GslbHealthSim = lazy(() => import('@toolbox/tool-gslb-health-sim').then((m) => ({ default: m.default })))
const GslbLatencySim = lazy(() => import('@toolbox/tool-gslb-latency-sim').then((m) => ({ default: m.default })))
const ServerLatency = lazy(() => import('@toolbox/tool-server-latency').then((m) => ({ default: m.default })))
const DhcpLeaseAnalysis = lazy(() => import('@toolbox/tool-dhcp-lease-analysis').then((m) => ({ default: m.default })))
const IpamVisualize = lazy(() => import('@toolbox/tool-ipam-visualize').then((m) => ({ default: m.default })))
const GslbPolicySim = lazy(() => import('@toolbox/tool-gslb-policy-sim').then((m) => ({ default: m.default })))
const GslbRuleValidate = lazy(() => import('@toolbox/tool-gslb-rule-validate').then((m) => ({ default: m.default })))
const ApiAvailability = lazy(() => import('@toolbox/tool-api-availability').then((m) => ({ default: m.default })))
const GslbIspSim = lazy(() => import('@toolbox/tool-gslb-isp-sim').then((m) => ({ default: m.default })))
const GslbTrafficPredict = lazy(() => import('@toolbox/tool-gslb-traffic-predict').then((m) => ({ default: m.default })))
const GslbHitPredict = lazy(() => import('@toolbox/tool-gslb-hit-predict').then((m) => ({ default: m.default })))
const IpamReclaim = lazy(() => import('@toolbox/tool-ipam-reclaim').then((m) => ({ default: m.default })))
const SecurityDomainHijack = lazy(() => import('@toolbox/tool-security-domain-hijack').then((m) => ({ default: m.default })))
const DhcpLogAnalysis = lazy(() => import('@toolbox/tool-dhcp-log-analysis').then((m) => ({ default: m.default })))
const DhcpScan = lazy(() => import('@toolbox/tool-dhcp-scan').then((m) => ({ default: m.default })))
const IpamChangelog = lazy(() => import('@toolbox/tool-ipam-changelog').then((m) => ({ default: m.default })))
const IpamScan = lazy(() => import('@toolbox/tool-ipam-scan').then((m) => ({ default: m.default })))
const Pomodoro = lazy(() => import('@toolbox/tool-pomodoro').then((m) => ({ default: m.default })))
const SalaryCalc = lazy(() => import('@toolbox/tool-salary-calc').then((m) => ({ default: m.default })))
const CurrencyConverter = lazy(() => import('@toolbox/tool-currency-converter').then((m) => ({ default: m.default })))
const JwtDecoder = lazy(() => import('@toolbox/tool-jwt-decoder').then((m) => ({ default: m.default })))
const ExpenseTracker = lazy(() => import('@toolbox/tool-expense-tracker').then((m) => ({ default: m.default })))
const SubscriptionManager = lazy(() => import('@toolbox/tool-subscription-manager').then((m) => ({ default: m.default })))
const CalorieCalc = lazy(() => import('@toolbox/tool-calorie-calc').then((m) => ({ default: m.default })))
const RandomMenu = lazy(() => import('@toolbox/tool-random-menu').then((m) => ({ default: m.default })))
const CurlToFetch = lazy(() => import('@toolbox/tool-curl-to-fetch').then((m) => ({ default: m.default })))
const InstallmentCalc = lazy(() => import('@toolbox/tool-installment-calc').then((m) => ({ default: m.default })))
const OkrPlanner = lazy(() => import('@toolbox/tool-okr-planner').then((m) => ({ default: m.default })))
const TravelChecklist = lazy(() => import('@toolbox/tool-travel-checklist').then((m) => ({ default: m.default })))
const TravelBudget = lazy(() => import('@toolbox/tool-travel-budget').then((m) => ({ default: m.default })))
const SplitBill = lazy(() => import('@toolbox/tool-split-bill').then((m) => ({ default: m.default })))
const TimezoneCalc = lazy(() => import('@toolbox/tool-timezone-calc').then((m) => ({ default: m.default })))
const DistanceCalc = lazy(() => import('@toolbox/tool-distance-calc').then((m) => ({ default: m.default })))
const PackingList = lazy(() => import('@toolbox/tool-packing-list').then((m) => ({ default: m.default })))
const RecipeFinder = lazy(() => import('@toolbox/tool-recipe-finder').then((m) => ({ default: m.default })))
const StudyTimer = lazy(() => import('@toolbox/tool-study-timer').then((m) => ({ default: m.default })))
const StudyPlanner = lazy(() => import('@toolbox/tool-study-planner').then((m) => ({ default: m.default })))
const FocusMode = lazy(() => import('@toolbox/tool-focus-mode').then((m) => ({ default: m.default })))
const DomainSpf = lazy(() =>
  import('@toolbox/tool-domain-suite').then((m) => ({ default: m.DomainSpf }))
)
const DomainDkim = lazy(() =>
  import('@toolbox/tool-domain-suite').then((m) => ({ default: m.DomainDkim }))
)
const DomainDmarc = lazy(() =>
  import('@toolbox/tool-domain-suite').then((m) => ({ default: m.DomainDmarc }))
)
const DomainTtlAdvice = lazy(() =>
  import('@toolbox/tool-domain-suite').then((m) => ({ default: m.DomainTtlAdvice }))
)
const DomainNsCheck = lazy(() =>
  import('@toolbox/tool-domain-suite').then((m) => ({ default: m.DomainNsCheck }))
)
const DomainSubdomainScan = lazy(() =>
  import('@toolbox/tool-domain-suite').then((m) => ({ default: m.DomainSubdomainScan }))
)
const DomainWildcard = lazy(() =>
  import('@toolbox/tool-domain-suite').then((m) => ({ default: m.DomainWildcard }))
)
const DomainHealthScore = lazy(() =>
  import('@toolbox/tool-domain-suite').then((m) => ({ default: m.DomainHealthScore }))
)
const IpGeo = lazy(() =>
  import('@toolbox/tool-ip-ops-suite').then((m) => ({ default: m.IpGeo }))
)
const IpPtr = lazy(() =>
  import('@toolbox/tool-ip-ops-suite').then((m) => ({ default: m.IpPtr }))
)
const IpV4ToV6 = lazy(() =>
  import('@toolbox/tool-ip-ops-suite').then((m) => ({ default: m.IpV4ToV6 }))
)
const IpBinaryHex = lazy(() =>
  import('@toolbox/tool-ip-ops-suite').then((m) => ({ default: m.IpBinaryHex }))
)
const IpClass = lazy(() =>
  import('@toolbox/tool-ip-ops-suite').then((m) => ({ default: m.IpClass }))
)
const IpPublic = lazy(() =>
  import('@toolbox/tool-ip-ops-suite').then((m) => ({ default: m.IpPublic }))
)
const IpCdnCheck = lazy(() =>
  import('@toolbox/tool-ip-ops-suite').then((m) => ({ default: m.IpCdnCheck }))
)
const IpBlacklist = lazy(() =>
  import('@toolbox/tool-ip-ops-suite').then((m) => ({ default: m.IpBlacklist }))
)
const SecurityIpScore = lazy(() =>
  import('@toolbox/tool-security-suite').then((m) => ({ default: m.SecurityIpScore }))
)
const SecurityDomainBlacklist = lazy(() =>
  import('@toolbox/tool-security-suite').then((m) => ({ default: m.SecurityDomainBlacklist }))
)
const SecurityPortScan = lazy(() =>
  import('@toolbox/tool-security-suite').then((m) => ({ default: m.SecurityPortScan }))
)
const SecurityDnsVuln = lazy(() =>
  import('@toolbox/tool-security-suite').then((m) => ({ default: m.SecurityDnsVuln }))
)
const SecurityReportGen = lazy(() =>
  import('@toolbox/tool-security-suite').then((m) => ({ default: m.SecurityReportGen }))
)
const IpamPlan = lazy(() =>
  import('@toolbox/tool-ipam-suite').then((m) => ({ default: m.IpamPlan }))
)
const IpamInventory = lazy(() =>
  import('@toolbox/tool-ipam-suite').then((m) => ({ default: m.IpamInventory }))
)
const IpamUsage = lazy(() =>
  import('@toolbox/tool-ipam-suite').then((m) => ({ default: m.IpamUsage }))
)
const IpamConflict = lazy(() =>
  import('@toolbox/tool-ipam-suite').then((m) => ({ default: m.IpamConflict }))
)
const IpamAllocationSim = lazy(() =>
  import('@toolbox/tool-ipam-suite').then((m) => ({ default: m.IpamAllocationSim }))
)
const CidrCalculator = lazy(() =>
  import('@toolbox/tool-subnet-suite').then((m) => ({ default: m.CidrCalculator }))
)
const SubnetDivide = lazy(() =>
  import('@toolbox/tool-subnet-suite').then((m) => ({ default: m.SubnetDivide }))
)
const SubnetNetworkAddr = lazy(() =>
  import('@toolbox/tool-subnet-suite').then((m) => ({ default: m.SubnetNetworkAddr }))
)
const SubnetBroadcast = lazy(() =>
  import('@toolbox/tool-subnet-suite').then((m) => ({ default: m.SubnetBroadcast }))
)
const SubnetMask = lazy(() =>
  import('@toolbox/tool-subnet-suite').then((m) => ({ default: m.SubnetMask }))
)
const IpRange = lazy(() =>
  import('@toolbox/tool-subnet-suite').then((m) => ({ default: m.IpRange }))
)
const SubnetCapacity = lazy(() =>
  import('@toolbox/tool-subnet-suite').then((m) => ({ default: m.SubnetCapacity }))
)
const Ipv6Cidr = lazy(() =>
  import('@toolbox/tool-subnet-suite').then((m) => ({ default: m.Ipv6Cidr }))
)
const Vlsm = lazy(() =>
  import('@toolbox/tool-subnet-suite').then((m) => ({ default: m.Vlsm }))
)
const NetworkPlanner = lazy(() =>
  import('@toolbox/tool-subnet-suite').then((m) => ({ default: m.NetworkPlanner }))
)

function App() {
  return (
    <Layout>
      <Suspense fallback={<RouteLoading />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/qrcode/generate" element={<QrCodeGenerator />} />
          <Route path="/qrcode/read" element={<QrCodeReader />} />
          <Route path="/qrcode/beautifier" element={<QrCodeBeautifier />} />
          <Route path="/news" element={<HotNews />} />
          <Route path="/zipcode" element={<ZipCode />} />
          <Route path="/weather" element={<ManifestToolRoute manifest={weatherToolManifest} />} />
          <Route path="/todo-list" element={<ManifestToolRoute manifest={todoListToolManifest} />} />
          <Route path="/json" element={<JsonFormatter />} />
          <Route path="/github-info" element={<GithubInfo />} />
          <Route path="/base64" element={<Base64 />} />
          <Route path="/timestamp" element={<Timestamp />} />
          <Route path="/url" element={<UrlEncoder />} />
          <Route path="/regex" element={<RegexTester />} />
          <Route path="/cron" element={<CronGenerator />} />
          <Route path="/password" element={<PasswordGenerator />} />
          <Route path="/hash" element={<HashGenerator />} />
          <Route path="/code" element={<CodeFormatter />} />
          <Route path="/uuid" element={<UuidGenerator />} />
          <Route path="/image-compressor" element={<ImageCompressor />} />
          <Route path="/image-watermark" element={<ImageWatermark />} />
          <Route path="/image-cropper" element={<ImageCropper />} />
          <Route path="/image-rotator" element={<ImageRotator />} />
          <Route path="/image-filter" element={<ImageFilter />} />
          <Route path="/image-stitcher" element={<ImageStitcher />} />
          <Route path="/image-watermark-remover" element={<ImageWatermarkRemover />} />
          <Route path="/markdown" element={<MarkdownConverter />} />
          <Route path="/bmi" element={<BMICalculator />} />
          <Route path="/color-picker" element={<ColorPicker />} />
          <Route path="/image-background-remover" element={<ImageBackgroundRemover />} />
          <Route path="/unit-converter" element={<UnitConverter />} />
          <Route path="/sheet-editor" element={<SheetEditor />} />
          <Route path="/text-comparator" element={<TextComparator />} />
          <Route path="/ip-query" element={<IpQuery />} />
          <Route path="/ip-asn" element={<IpAsn />} />
          <Route path="/dns-query" element={<DnsQuery />} />
          <Route path="/dns-trace" element={<DnsTrace />} />
          <Route path="/dns-propagation" element={<DnsPropagation />} />
          <Route path="/dns-global-check" element={<DnsGlobalCheck />} />
          <Route path="/dnssec-check" element={<DnssecCheck />} />
          <Route path="/dns-performance" element={<DnsPerformance />} />
          <Route path="/dns-ttl" element={<DnsTtl />} />
          <Route path="/dns-soa" element={<DnsSoa />} />
          <Route path="/dns-diagnose" element={<DnsDiagnose />} />
          <Route path="/dns-pollution-check" element={<DnsPollutionCheck />} />
          <Route path="/dns-hijack-check" element={<DnsHijackCheck />} />
          <Route path="/dns-cache-check" element={<DnsCacheCheck />} />
          <Route path="/dns-loop-check" element={<DnsLoopCheck />} />
          <Route path="/dns-ns" element={<DnsNs />} />
          <Route path="/dns-cname-chain" element={<DnsCnameChain />} />
          <Route path="/dns-nxdomain" element={<DnsNxdomain />} />
          <Route path="/domain-mx" element={<DomainMx />} />
          <Route path="/domain-txt" element={<DomainTxt />} />
          <Route path="/http-headers" element={<HttpHeaders />} />
          <Route path="/ssl-cert" element={<SslCert />} />
          <Route path="/http-status" element={<HttpStatus />} />
          <Route path="/tcp-port-check" element={<TcpPort />} />
          <Route path="/ping" element={<Ping />} />
          <Route path="/dns-latency" element={<DnsLatency />} />
          <Route path="/dns-authoritative" element={<DnsAuthoritative />} />
          <Route path="/dns-recursive" element={<DnsRecursive />} />
          <Route path="/dns-path-viz" element={<DnsPathViz />} />
          <Route path="/dns-tunnel" element={<DnsTunnel />} />
          <Route path="/dhcp-pool-calc" element={<DhcpPoolCalc />} />
          <Route path="/dhcp-option" element={<DhcpOption />} />
          <Route path="/dhcp-mac-binding" element={<DhcpMacBinding />} />
          <Route path="/dhcp-config-gen" element={<DhcpConfigGen />} />
          <Route path="/traceroute" element={<Traceroute />} />
          <Route path="/dhcp-utilization" element={<DhcpUtilization />} />
          <Route path="/dhcp-conflict" element={<DhcpConflict />} />
          <Route path="/gslb-weight-calc" element={<GslbWeightCalc />} />
          <Route path="/web-availability" element={<WebAvailability />} />
          <Route path="/security-domain-score" element={<SecurityDomainScore />} />
          <Route path="/gslb-failover-sim" element={<GslbFailoverSim />} />
          <Route path="/gslb-geo-sim" element={<GslbGeoSim />} />
          <Route path="/security-dnssec-verify" element={<SecurityDnssecVerify />} />
          <Route path="/security-dns-ddos" element={<SecurityDnsDdos />} />
          <Route path="/cdn-check" element={<CdnCheck />} />
          <Route path="/dhcp-discover-sim" element={<DhcpDiscoverSim />} />
          <Route path="/ipam-subnet-util" element={<IpamSubnetUtil />} />
          <Route path="/gslb-health-sim" element={<GslbHealthSim />} />
          <Route path="/gslb-latency-sim" element={<GslbLatencySim />} />
          <Route path="/server-latency" element={<ServerLatency />} />
          <Route path="/dhcp-lease-analysis" element={<DhcpLeaseAnalysis />} />
          <Route path="/ipam-visualize" element={<IpamVisualize />} />
          <Route path="/gslb-policy-sim" element={<GslbPolicySim />} />
          <Route path="/gslb-rule-validate" element={<GslbRuleValidate />} />
          <Route path="/api-availability" element={<ApiAvailability />} />
          <Route path="/gslb-isp-sim" element={<GslbIspSim />} />
          <Route path="/gslb-traffic-predict" element={<GslbTrafficPredict />} />
          <Route path="/gslb-hit-predict" element={<GslbHitPredict />} />
          <Route path="/ipam-reclaim" element={<IpamReclaim />} />
          <Route path="/security-domain-hijack" element={<SecurityDomainHijack />} />
          <Route path="/dhcp-log-analysis" element={<DhcpLogAnalysis />} />
          <Route path="/dhcp-scan" element={<DhcpScan />} />
          <Route path="/ipam-changelog" element={<IpamChangelog />} />
          <Route path="/ipam-scan" element={<IpamScan />} />
          <Route path="/pomodoro" element={<Pomodoro />} />
          <Route path="/habit-tracker" element={<HabitTracker />} />
          <Route path="/salary-calc" element={<SalaryCalc />} />
          <Route path="/currency-converter" element={<CurrencyConverter />} />
          <Route path="/jwt-decoder" element={<JwtDecoder />} />
          <Route path="/expense-tracker" element={<ExpenseTracker />} />
          <Route path="/subscription-manager" element={<SubscriptionManager />} />
          <Route path="/calorie-calc" element={<CalorieCalc />} />
          <Route path="/random-menu" element={<RandomMenu />} />
          <Route path="/curl-to-fetch" element={<CurlToFetch />} />
          <Route path="/installment-calc" element={<InstallmentCalc />} />
          <Route path="/okr-planner" element={<OkrPlanner />} />
          <Route path="/travel-checklist" element={<TravelChecklist />} />
          <Route path="/travel-budget" element={<TravelBudget />} />
          <Route path="/split-bill" element={<SplitBill />} />
          <Route path="/timezone-calc" element={<TimezoneCalc />} />
          <Route path="/distance-calc" element={<DistanceCalc />} />
          <Route path="/packing-list" element={<PackingList />} />
          <Route path="/recipe-finder" element={<RecipeFinder />} />
          <Route path="/study-timer" element={<StudyTimer />} />
          <Route path="/study-planner" element={<StudyPlanner />} />
          <Route path="/focus-mode" element={<FocusMode />} />
          <Route path="/domain-spf" element={<DomainSpf />} />
          <Route path="/domain-dkim" element={<DomainDkim />} />
          <Route path="/domain-dmarc" element={<DomainDmarc />} />
          <Route path="/domain-ttl-advice" element={<DomainTtlAdvice />} />
          <Route path="/domain-ns-check" element={<DomainNsCheck />} />
          <Route path="/domain-subdomain-scan" element={<DomainSubdomainScan />} />
          <Route path="/domain-wildcard" element={<DomainWildcard />} />
          <Route path="/domain-health-score" element={<DomainHealthScore />} />
          <Route path="/ip-geo" element={<IpGeo />} />
          <Route path="/ip-ptr" element={<IpPtr />} />
          <Route path="/ip-v4-to-v6" element={<IpV4ToV6 />} />
          <Route path="/ip-binary-hex" element={<IpBinaryHex />} />
          <Route path="/ip-class" element={<IpClass />} />
          <Route path="/ip-public" element={<IpPublic />} />
          <Route path="/ip-cdn-check" element={<IpCdnCheck />} />
          <Route path="/ip-blacklist" element={<IpBlacklist />} />
          <Route path="/security-ip-score" element={<SecurityIpScore />} />
          <Route path="/security-domain-blacklist" element={<SecurityDomainBlacklist />} />
          <Route path="/security-port-scan" element={<SecurityPortScan />} />
          <Route path="/security-dns-vuln" element={<SecurityDnsVuln />} />
          <Route path="/security-report-gen" element={<SecurityReportGen />} />
          <Route path="/ipam-plan" element={<IpamPlan />} />
          <Route path="/ipam-inventory" element={<IpamInventory />} />
          <Route path="/ipam-usage" element={<IpamUsage />} />
          <Route path="/ipam-conflict" element={<IpamConflict />} />
          <Route path="/ipam-allocation-sim" element={<IpamAllocationSim />} />
          <Route path="/cidr-calculator" element={<CidrCalculator />} />
          <Route path="/subnet-divide" element={<SubnetDivide />} />
          <Route path="/subnet-network-addr" element={<SubnetNetworkAddr />} />
          <Route path="/subnet-broadcast" element={<SubnetBroadcast />} />
          <Route path="/subnet-mask" element={<SubnetMask />} />
          <Route path="/ip-range" element={<IpRange />} />
          <Route path="/subnet-capacity" element={<SubnetCapacity />} />
          <Route path="/ipv6-cidr" element={<Ipv6Cidr />} />
          <Route path="/vlsm" element={<Vlsm />} />
          <Route path="/network-planner" element={<NetworkPlanner />} />
          <Route path="/format-converter" element={<FormatConverter />} />
          <Route path="/pdf-tools" element={<PdfTools />} />
          <Route path="/short-link" element={<ShortLinkGenerator />} />
          <Route path="/s/:code" element={<ShortLinkRedirect />} />
          <Route path="/resume-generator" element={<ResumeGenerator />} />
          <Route path="/color-generator" element={<ColorGenerator />} />
          <Route path="/meme-generator" element={<MemeGenerator />} />
          <Route path="/copywriting-generator" element={<CopywritingGenerator />} />
          <Route path="/wooden-fish" element={<ElectronicWoodenFish />} />
          <Route path="/life-progress" element={<LifeProgressBar />} />
          <Route path="/meeting-minutes" element={<MeetingMinutes />} />
          <Route path="/ui-generator" element={<UIGenerator />} />
          <Route path="/ppt-generator" element={<PptGenerator />} />
          <Route path="/vocab-trainer" element={<VocabTrainer />} />
          <Route path="/mistake-book" element={<MistakeBook />} />
          <Route path="/daily-planner" element={<DailyPlanner />} />
          <Route path="/fridge-inventory" element={<FridgeInventory />} />
          <Route path="/expiry-reminder" element={<ExpiryReminder />} />
          <Route path="/family-tasks" element={<FamilyTasks />} />
          <Route path="/barcode-reader" element={<BarcodeReader />} />
          <Route path="/quiz-gen" element={<QuizGen />} />
          <Route path="/trip-planner" element={<TripPlanner />} />
          <Route path="/day-trip" element={<DayTrip />} />
          <Route path="/spaced-repetition" element={<SpacedRepetition />} />
          <Route path="/travel-translator" element={<TravelTranslator />} />
          <Route path="/project-scaffold" element={<ProjectScaffold />} />
          <Route path="/knowledge-compare" element={<KnowledgeCompare />} />
          <Route path="/loan-calc" element={<LoanCalc />} />
          <Route path="/id-card-parser" element={<IdCardParser />} />
          <Route path="/color-blind-sim" element={<ColorBlindSim />} />
          <Route path="/text-to-speech" element={<TextToSpeech />} />
          <Route path="/currency-history" element={<CurrencyHistory />} />
          <Route path="/one-liner" element={<OneLiner />} />
          <Route path="/eli5" element={<Eli5 />} />
          <Route path="/multi-perspective" element={<MultiPerspective />} />
          <Route path="/mcq-gen" element={<McqGen />} />
          <Route path="/morse-code" element={<MorseCode />} />
          <Route path="/ascii-art" element={<AsciiArt />} />
          <Route path="/password-strength" element={<PasswordStrength />} />
          <Route path="/base-converter" element={<BaseConverter />} />
          <Route path="/word-count" element={<WordCount />} />
          <Route path="/pomodoro-pro" element={<PomodoroPro />} />
          <Route path="/time-logger" element={<TimeLogger />} />
          <Route path="/investment-sim" element={<InvestmentSim />} />
          <Route path="/sleep-tracker" element={<SleepTracker />} />
          <Route path="/water-reminder" element={<WaterReminder />} />
          <Route path="/running-tracker" element={<RunningTracker />} />
          <Route path="/sedentary-reminder" element={<SedentaryReminder />} />
          <Route path="/http-debugger" element={<HttpDebugger />} />
          <Route path="/travel-cost-estimate" element={<TravelCostEstimate />} />
          <Route path="/multi-city-route" element={<MultiCityRoute />} />
          <Route path="/visa-info" element={<VisaInfo />} />
          <Route path="/fitness-planner" element={<FitnessPlanner />} />
          <Route path="/meeting-scheduler" element={<MeetingScheduler />} />
          <Route path="/color-system" element={<ColorSystem />} />
          <Route path="/graphql-builder" element={<GraphqlBuilder />} />
        </Routes>
      </Suspense>
    </Layout>
  )
}

export default App
