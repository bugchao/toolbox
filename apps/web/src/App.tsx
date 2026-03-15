import React, { Suspense, lazy } from 'react'
import { useTranslation } from 'react-i18next'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'

function RouteLoading() {
  const { t } = useTranslation('common')
  return (
    <div className="flex items-center justify-center min-h-[200px] text-gray-500 dark:text-gray-300">
      {t('loading')}
    </div>
  )
}
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

// 工具包懒加载（独立依赖，按需注入）
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
        </Routes>
      </Suspense>
    </Layout>
  )
}

export default App
