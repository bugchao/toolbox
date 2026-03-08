import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import QrCodeGenerator from './pages/QrCodeGenerator'
import QrCodeReader from './pages/QrCodeReader'
import HotNews from './pages/HotNews'
import ZipCode from './pages/ZipCode'
import Weather from './pages/Weather'

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
      </Routes>
    </Layout>
  )
}

export default App
