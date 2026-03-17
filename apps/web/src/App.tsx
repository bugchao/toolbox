import React, { Suspense, lazy } from 'react'
import { useTranslation } from 'react-i18next'
import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Favorites from './pages/Favorites'
import HotNews from './pages/HotNews'
import ZipCode from './pages/ZipCode'
import Weather from './pages/Weather'
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
          <Route path="/weather" element={<Weather />} />
          <Route path="/json" element={<JsonFormatter />} />
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
        </Routes>
      </Suspense>
    </Layout>
  )
}

export default App
