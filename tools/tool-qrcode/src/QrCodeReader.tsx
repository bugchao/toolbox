import React, { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Upload, Camera } from 'lucide-react'
import { CopyButton } from '@toolbox/ui-kit'
import jsQR from 'jsqr'

const I18N_NAMESPACE = 'toolQrcodeRead'

const QrCodeReader: React.FC = () => {
  const { t } = useTranslation(I18N_NAMESPACE)
  const [result, setResult] = useState('')
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError('')
    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const code = jsQR(imageData.data, imageData.width, imageData.height)

        if (code) {
          setResult(code.data)
        } else {
          setError(t('errDecodeFailed'))
        }
      }
      img.src = event.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  const startCamera = async () => {
    try {
      setError('')
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        setIsCameraActive(true)
        scanFrame()
      }
    } catch (err) {
      setError(t('errCameraAccess'))
      console.error('摄像头访问失败:', err)
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setIsCameraActive(false)
  }

  const scanFrame = () => {
    if (!isCameraActive || !videoRef.current || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const code = jsQR(imageData.data, imageData.width, imageData.height)

    if (code) {
      setResult(code.data)
      stopCamera()
      return
    }

    requestAnimationFrame(scanFrame)
  }


  return (
    <div className="max-w-4xl mx-auto">
      <div className="card">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">{t('title')}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="flex flex-col space-y-4">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="btn bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-500 flex items-center justify-center"
              >
                <Upload className="w-4 h-4 mr-2" />
                {t('uploadButton')}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              {!isCameraActive ? (
                <button
                  onClick={startCamera}
                  className="btn bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-500 flex items-center justify-center"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  {t('cameraStart')}
                </button>
              ) : (
                <button
                  onClick={stopCamera}
                  className="btn bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/60 flex items-center justify-center"
                >
                  {t('cameraStop')}
                </button>
              )}
            </div>

            {isCameraActive && (
              <div className="relative rounded-lg overflow-hidden bg-black aspect-video">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  autoPlay
                  playsInline
                />
                <canvas ref={canvasRef} className="hidden" />
                <div className="absolute inset-0 border-4 border-indigo-500 opacity-50">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-64 h-64 border-2 border-white opacity-70"></div>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
                {error}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('resultLabel')}
            </label>
            <div className="relative">
              <textarea
                value={result}
                readOnly
                placeholder={t('resultPlaceholder')}
                className="input h-64 resize-none font-mono text-sm"
              />
              {result && (
                <CopyButton
                  value={result}
                  className="absolute top-2 right-2 !p-2 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 !rounded-lg !text-gray-700 dark:!text-gray-200"
                />
              )}
            </div>
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

export default QrCodeReader
