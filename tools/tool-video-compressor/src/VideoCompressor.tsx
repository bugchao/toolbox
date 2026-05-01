import React, { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Video, Upload, Download, X, AlertCircle, Loader2 } from 'lucide-react'
import { PageHero } from '@toolbox/ui-kit'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'

type CompressionQuality = 'high' | 'medium' | 'low'

interface VideoInfo {
  file: File
  url: string
  size: number
  duration?: number
}

export default function VideoCompressor() {
  const { t } = useTranslation('toolVideoCompressor')
  const [ffmpeg] = useState(() => new FFmpeg())
  const [loaded, setLoaded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [originalVideo, setOriginalVideo] = useState<VideoInfo | null>(null)
  const [compressedVideo, setCompressedVideo] = useState<VideoInfo | null>(null)
  const [quality, setQuality] = useState<CompressionQuality>('medium')
  const [targetSize, setTargetSize] = useState('')
  const [compressing, setCompressing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dragCounter = useRef(0)
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    loadFFmpeg()
  }, [])

  const loadFFmpeg = async () => {
    try {
      setLoading(true)
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd'
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      })
      
      ffmpeg.on('progress', ({ progress: p, time }) => {
        setProgress(Math.round(p * 100))
        if (p > 0 && time > 0) {
          const estimated = (time / p) - time
          setEstimatedTime(Math.round(estimated / 1000000))
        }
      })
      
      setLoaded(true)
    } catch (err) {
      console.error('Failed to load FFmpeg:', err)
      setError(t('errorMessage'))
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (file: File) => {
    if (file.size > 500 * 1024 * 1024) {
      setError(t('videoTooLarge'))
      return
    }

    const supportedFormats = ['video/mp4', 'video/x-msvideo', 'video/quicktime', 'video/x-matroska', 'video/webm']
    if (!supportedFormats.includes(file.type) && !file.name.match(/\.(mp4|avi|mov|mkv|webm)$/i)) {
      setError(t('unsupportedFormat'))
      return
    }

    setError(null)
    setCompressedVideo(null)
    setProgress(0)
    setEstimatedTime(null)

    const url = URL.createObjectURL(file)
    setOriginalVideo({
      file,
      url,
      size: file.size,
    })
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    dragCounter.current = 0

    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current++
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current--
    if (dragCounter.current === 0) {
      setIsDragging(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const getQualityParams = (quality: CompressionQuality): string[] => {
    switch (quality) {
      case 'high':
        return ['-crf', '23', '-preset', 'slow']
      case 'medium':
        return ['-crf', '28', '-preset', 'medium']
      case 'low':
        return ['-crf', '35', '-preset', 'fast']
    }
  }

  const compressVideo = async () => {
    if (!originalVideo || !loaded) return

    try {
      setCompressing(true)
      setError(null)
      setProgress(0)
      setEstimatedTime(null)

      const inputName = 'input' + originalVideo.file.name.substring(originalVideo.file.name.lastIndexOf('.'))
      const outputName = 'output.mp4'

      await ffmpeg.writeFile(inputName, await fetchFile(originalVideo.file))

      const args = [
        '-i', inputName,
        ...getQualityParams(quality),
        '-movflags', '+faststart',
      ]

      if (targetSize) {
        const targetBytes = parseFloat(targetSize) * 1024 * 1024
        const bitrate = Math.floor((targetBytes * 8) / 60)
        args.push('-b:v', `${bitrate}`)
      }

      args.push(outputName)

      await ffmpeg.exec(args)

      const data = await ffmpeg.readFile(outputName)
      const blob = new Blob([data], { type: 'video/mp4' })
      const url = URL.createObjectURL(blob)

      setCompressedVideo({
        file: new File([blob], 'compressed.mp4', { type: 'video/mp4' }),
        url,
        size: blob.size,
      })

      await ffmpeg.deleteFile(inputName)
      await ffmpeg.deleteFile(outputName)
    } catch (err) {
      console.error('Compression error:', err)
      setError(t('errorMessage'))
    } finally {
      setCompressing(false)
      setProgress(0)
      setEstimatedTime(null)
    }
  }

  const cancelCompression = () => {
    setCompressing(false)
    setProgress(0)
    setEstimatedTime(null)
  }

  const downloadVideo = () => {
    if (!compressedVideo) return
    const a = document.createElement('a')
    a.href = compressedVideo.url
    a.download = `compressed-${Date.now()}.mp4`
    a.click()
  }

  const reset = () => {
    if (originalVideo) {
      URL.revokeObjectURL(originalVideo.url)
    }
    if (compressedVideo) {
      URL.revokeObjectURL(compressedVideo.url)
    }
    setOriginalVideo(null)
    setCompressedVideo(null)
    setProgress(0)
    setError(null)
    setEstimatedTime(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds} ${t('seconds')}`
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins} ${t('minutes')} ${secs} ${t('seconds')}`
  }

  const compressionRatio = originalVideo && compressedVideo
    ? ((1 - compressedVideo.size / originalVideo.size) * 100).toFixed(1)
    : null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHero title={t('title')} description={t('description')} icon={Video} />
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">

        {/* Loading State */}
        {loading && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
            <Loader2 className="w-12 h-12 mx-auto mb-4 text-indigo-600 animate-spin" />
            <p className="text-gray-600 dark:text-gray-400">{t('loadingFFmpeg')}</p>
          </div>
        )}

        {/* Upload Area */}
        {!loading && !originalVideo && (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            className={`bg-white dark:bg-gray-800 rounded-xl border-2 border-dashed p-12 text-center transition-colors ${
              isDragging
                ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400'
            }`}
          >
            <Upload className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('uploadArea')}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              {t('supportedFormats')}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {t('maxSize')}
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
            >
              {t('uploadArea')}
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800 dark:text-red-200">{t('error')}</p>
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-red-600 dark:text-red-400 hover:text-red-800">
              <X size={18} />
            </button>
          </div>
        )}

        {/* Compression Settings */}
        {originalVideo && !compressing && !compressedVideo && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-5">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t('compressionQuality')}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {(['high', 'medium', 'low'] as CompressionQuality[]).map((q) => (
                <button
                  key={q}
                  onClick={() => setQuality(q)}
                  className={`p-4 rounded-lg border-2 text-left transition-colors ${
                    quality === q
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300'
                  }`}
                >
                  <p className="font-medium text-gray-900 dark:text-gray-100">{t(q)}</p>
                </button>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('targetSize')}
              </label>
              <input
                type="number"
                value={targetSize}
                onChange={(e) => setTargetSize(e.target.value)}
                placeholder={t('targetSizePlaceholder')}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={compressVideo}
                disabled={!loaded}
                className="flex-1 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('startCompress')}
              </button>
              <button
                onClick={reset}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium"
              >
                {t('reset')}
              </button>
            </div>
          </div>
        )}

        {/* Compression Progress */}
        {compressing && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {t('compressing')}
              </h3>
              <button
                onClick={cancelCompression}
                className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                {t('cancel')}
              </button>
            </div>
            
            <div>
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                <span>{t('progress')}: {progress}%</span>
                {estimatedTime !== null && (
                  <span>{t('estimatedTime')}: {formatTime(estimatedTime)}</span>
                )}
              </div>
              <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Video Comparison */}
        {originalVideo && compressedVideo && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Original Video */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">{t('originalVideo')}</h3>
                <video
                  src={originalVideo.url}
                  controls
                  className="w-full rounded-lg bg-black"
                />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('fileSize')}: <span className="font-medium">{formatFileSize(originalVideo.size)}</span>
                </p>
              </div>

              {/* Compressed Video */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">{t('compressedVideo')}</h3>
                <video
                  src={compressedVideo.url}
                  controls
                  className="w-full rounded-lg bg-black"
                />
                <div className="space-y-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('fileSize')}: <span className="font-medium">{formatFileSize(compressedVideo.size)}</span>
                  </p>
                  {compressionRatio && (
                    <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                      {t('compressionRatio')}: {compressionRatio}%
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={downloadVideo}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
              >
                <Download size={20} />
                {t('download')}
              </button>
              <button
                onClick={reset}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium"
              >
                {t('reset')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
