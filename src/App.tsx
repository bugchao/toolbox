import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import QrCodeGenerator from './pages/QrCodeGenerator'
import QrCodeReader from './pages/QrCodeReader'
import HotNews from './pages/HotNews'
import ZipCode from './pages/ZipCode'
import Weather from './pages/Weather'
import AiChat from './pages/AiChat'
import JsonFormatter from './pages/JsonFormatter'
import Base64 from './pages/Base64'
import Timestamp from './pages/Timestamp'
import UrlEncoder from './pages/UrlEncoder'
import RegexTester from './pages/RegexTester'
import CronGenerator from './pages/CronGenerator'
import PasswordGenerator from './pages/PasswordGenerator'
import HashGenerator from './pages/HashGenerator'
import CodeFormatter from './pages/CodeFormatter'
import UuidGenerator from './pages/UuidGenerator'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/qrcode/generate" element={<QrCodeGenerator />} />
        <Route path="/qrcode/read" element={<QrCodeReader />} />
        <Route path="/news" element={<HotNews />} />
        <Route path="/zipcode" element={<ZipCode />} />
        <Route path="/weather" element={<Weather />} />
        <Route path="/ai" element={<AiChat />} />
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
      </Routes>
    </Layout>
  )
}

export default App
