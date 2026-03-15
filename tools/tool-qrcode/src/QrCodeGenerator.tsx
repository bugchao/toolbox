import React, { useState, useRef } from 'react'
import { Download, Copy } from 'lucide-react'
import QRCode from 'qrcode'

const QrCodeGenerator: React.FC = () => {
  const [text, setText] = useState('')
  const [size, setSize] = useState(256)
  const [color, setColor] = useState('#000000')
  const [bgColor, setBgColor] = useState('#ffffff')
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [loading, setLoading] = useState(false)

  const generateQrCode = async () => {
    if (!text.trim()) return
    
    setLoading(true)
    try {
      const url = await QRCode.toDataURL(text, {
        width: size,
        color: {
          dark: color,
          light: bgColor
        },
        margin: 1
      })
      setQrCodeUrl(url)
    } catch (err) {
      console.error('生成二维码失败:', err)
    } finally {
      setLoading(false)
    }
  }

  const downloadQrCode = () => {
    if (!qrCodeUrl) return
    const link = document.createElement('a')
    link.href = qrCodeUrl
    link.download = `qrcode-${Date.now()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const copyToClipboard = async () => {
    if (!qrCodeUrl) return
    try {
      const response = await fetch(qrCodeUrl)
      const blob = await response.blob()
      await navigator.clipboard.write([
        new ClipboardItem({
          'image/png': blob
        })
      ])
      alert('二维码已复制到剪贴板')
    } catch (err) {
      console.error('复制失败:', err)
      alert('复制失败，请重试')
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">二维码生成器</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                二维码内容
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="输入要生成二维码的内容，例如网址、文本等"
                className="input h-32 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  二维码大小 (px)
                </label>
                <input
                  type="number"
                  value={size}
                  onChange={(e) => setSize(Number(e.target.value))}
                  min="128"
                  max="1024"
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  前景颜色
                </label>
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="input h-12 p-1"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                背景颜色
              </label>
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="input h-12 p-1"
              />
            </div>

            <button
              onClick={generateQrCode}
              disabled={!text.trim() || loading}
              className="btn btn-primary w-full"
            >
              {loading ? '生成中...' : '生成二维码'}
            </button>
          </div>

          <div className="flex flex-col items-center justify-center">
            {qrCodeUrl ? (
              <div className="text-center space-y-4">
                <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                  <img
                    src={qrCodeUrl}
                    alt="生成的二维码"
                    className="max-w-full mx-auto"
                  />
                </div>
                <div className="flex space-x-4 justify-center">
                  <button
                    onClick={downloadQrCode}
                    className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    下载
                  </button>
                  <button
                    onClick={copyToClipboard}
                    className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    复制
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-full aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <div className="text-6xl mb-4">📱</div>
                  <p>生成的二维码将显示在这里</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">使用说明</h2>
        <ul className="list-disc pl-5 space-y-2 text-gray-600">
          <li>支持生成网址、文本、联系信息等各种内容的二维码</li>
          <li>可以自定义二维码的大小、前景色和背景色</li>
          <li>生成的二维码可以下载为PNG图片或复制到剪贴板</li>
          <li>建议内容不要过长，否则二维码会过于密集难以识别</li>
        </ul>
      </div>
    </div>
  )
}

export default QrCodeGenerator
