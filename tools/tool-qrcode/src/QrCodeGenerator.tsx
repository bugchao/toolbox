import React, { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Download, Copy } from 'lucide-react'
import QRCode from 'qrcode'

const I18N_NAMESPACE = 'toolQrcodeGenerate'

const QrCodeGenerator: React.FC = () => {
  const { t } = useTranslation(I18N_NAMESPACE)
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
      alert(t('copiedAlert'))
    } catch (err) {
      console.error('复制失败:', err)
      alert(t('copyFailedAlert'))
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">{t('title')}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('contentLabel')}
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={t('contentPlaceholder')}
                className="input h-32 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('sizeLabel')}
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('fgColorLabel')}
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('bgColorLabel')}
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
              {loading ? t('generating') : t('generate')}
            </button>
          </div>

          <div className="flex flex-col items-center justify-center">
            {qrCodeUrl ? (
              <div className="text-center space-y-4">
                <div className="p-4 bg-white dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm">
                  <img
                    src={qrCodeUrl}
                    alt={t('qrImageAlt')}
                    className="max-w-full mx-auto"
                  />
                </div>
                <div className="flex space-x-4 justify-center">
                  <button
                    onClick={downloadQrCode}
                    className="btn bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-500 flex items-center"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {t('download')}
                  </button>
                  <button
                    onClick={copyToClipboard}
                    className="btn bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-500 flex items-center"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    {t('copy')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-full aspect-square border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center text-gray-400 dark:text-gray-500">
                <div className="text-center">
                  <div className="text-6xl mb-4">📱</div>
                  <p>{t('emptyHint')}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">{t('usageTitle')}</h2>
        <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-300">
          <li>{t('usage1')}</li>
          <li>{t('usage2')}</li>
          <li>{t('usage3')}</li>
          <li>{t('usage4')}</li>
        </ul>
      </div>
    </div>
  )
}

export default QrCodeGenerator
