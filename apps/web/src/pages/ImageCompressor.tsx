import React, { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Upload, Download, Settings, X, FileImage, GitCompareArrows } from 'lucide-react'
import { PageHero } from '@toolbox/ui-kit'

interface ProcessedImage {
  id: string
  originalFile: File
  originalSize: number
  processedBlob?: Blob
  processedSize?: number
  processedUrl?: string
  quality: number
  format: string
  status: 'pending' | 'processing' | 'done' | 'error'
  previewUrl: string
  error?: string
  warning?: string
}

/**
 * 在不超过 maxW/maxH 的前提下，按比例缩放 (w, h)。
 * max 为 0 / 空表示该维度不限制。返回向下取整后的目标尺寸。
 */
export function computeFit(
  w: number,
  h: number,
  maxW: number,
  maxH: number
): { width: number; height: number } {
  const scales = [1]
  if (maxW > 0) scales.push(maxW / w)
  if (maxH > 0) scales.push(maxH / h)
  const scale = Math.min(...scales)
  return {
    width: Math.max(1, Math.round(w * scale)),
    height: Math.max(1, Math.round(h * scale)),
  }
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

const compressionRate = (original: number, compressed: number): string =>
  (((original - compressed) / original) * 100).toFixed(1) + '%'

const ImageCompressor: React.FC = () => {
  const { t } = useTranslation('imageCompressor')
  const { t: tNav } = useTranslation('nav')
  const { t: tHome } = useTranslation('home')

  const [images, setImages] = useState<ProcessedImage[]>([])
  const [quality, setQuality] = useState(80)
  const [outputFormat, setOutputFormat] = useState('same')
  const [maxWidth, setMaxWidth] = useState('')
  const [maxHeight, setMaxHeight] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)
  const [compareImage, setCompareImage] = useState<ProcessedImage | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const addFiles = (files: FileList | File[]) => {
    const newImages: ProcessedImage[] = Array.from(files)
      .filter((f) => f.type.startsWith('image/'))
      .map((file) => ({
        id: Math.random().toString(36).substring(2, 9),
        originalFile: file,
        originalSize: file.size,
        quality,
        format: outputFormat === 'same' ? file.type.split('/')[1] : outputFormat,
        status: 'pending',
        previewUrl: URL.createObjectURL(file),
      }))
    if (newImages.length) setImages((prev) => [...prev, ...newImages])
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(e.target.files)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files)
  }

  const processImage = async (image: ProcessedImage): Promise<ProcessedImage> => {
    try {
      // imageOrientation: 'from-image' 让带 EXIF 朝向的手机照片在画布上保持正向
      const bitmap = await createImageBitmap(image.originalFile, {
        imageOrientation: 'from-image',
      })
      const { width, height } = computeFit(
        bitmap.width,
        bitmap.height,
        Number(maxWidth) || 0,
        Number(maxHeight) || 0
      )
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        bitmap.close()
        return { ...image, status: 'error', error: t('errCanvas') }
      }
      ctx.drawImage(bitmap, 0, 0, width, height)
      bitmap.close()

      const wantMime =
        outputFormat === 'same' ? image.originalFile.type : `image/${outputFormat}`
      const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, wantMime, quality / 100))
      if (!blob) return { ...image, status: 'error', error: t('errProcess') }

      // 浏览器不支持目标编码时 toBlob 会静默回退（通常回退到 PNG），以实际类型为准
      const actualFormat = blob.type.split('/')[1] || image.format
      const fellBack = blob.type !== wantMime
      return {
        ...image,
        processedBlob: blob,
        processedSize: blob.size,
        processedUrl: URL.createObjectURL(blob),
        format: actualFormat,
        warning: fellBack ? t('formatFallback', { format: actualFormat.toUpperCase() }) : undefined,
        status: 'done',
      }
    } catch {
      return { ...image, status: 'error', error: t('errLoad') }
    }
  }

  const processAllImages = async () => {
    const pending = images.filter((img) => img.status === 'pending')
    if (pending.length === 0) return
    setIsProcessing(true)
    setProgress(0)

    const next = [...images]
    for (let i = 0; i < pending.length; i++) {
      const idx = next.findIndex((img) => img.id === pending[i].id)
      if (idx === -1) continue
      next[idx] = { ...next[idx], status: 'processing' }
      setImages([...next])
      next[idx] = await processImage(pending[i])
      setImages([...next])
      setProgress(((i + 1) / pending.length) * 100)
    }
    setIsProcessing(false)
  }

  const downloadImage = (image: ProcessedImage) => {
    if (!image.processedBlob) return
    const url = image.processedUrl ?? URL.createObjectURL(image.processedBlob)
    const a = document.createElement('a')
    a.href = url
    const base = image.originalFile.name.replace(/\.[^.]+$/, '')
    const ext = image.format === 'same' ? image.originalFile.name.split('.').pop() : image.format
    a.download = `${base}_compressed.${ext}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const downloadAll = () => images.filter((i) => i.status === 'done').forEach(downloadImage)

  const revoke = (image: ProcessedImage) => {
    URL.revokeObjectURL(image.previewUrl)
    if (image.processedUrl) URL.revokeObjectURL(image.processedUrl)
  }

  const removeImage = (id: string) =>
    setImages((prev) => {
      const removed = prev.find((img) => img.id === id)
      if (removed) revoke(removed)
      return prev.filter((img) => img.id !== id)
    })

  const clearAll = () => {
    images.forEach(revoke)
    setImages([])
    setProgress(0)
  }

  const totalSavings = () => {
    const done = images.filter((i) => i.status === 'done' && i.processedSize)
    if (!done.length) return '0 B'
    const orig = done.reduce((s, i) => s + i.originalSize, 0)
    const proc = done.reduce((s, i) => s + (i.processedSize || 0), 0)
    return formatFileSize(orig - proc)
  }

  const qualityLabel =
    quality < 50 ? t('qHigh') : quality < 80 ? t('qBalanced') : t('qBest')
  const qualityApplies = outputFormat !== 'png'

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <PageHero
        title={tNav('tools.image_compressor')}
        description={tHome('toolDesc.image_compressor')}
        className="mb-8"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 侧边栏设置 */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Settings className="h-5 w-5" />
              {t('settings')}
            </h2>

            <div className="space-y-6">
              {/* 质量 */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">
                    {t('quality')}: {quality}%
                  </label>
                  <span className="text-sm text-gray-500">{qualityLabel}</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  disabled={isProcessing || !qualityApplies}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                />
                {!qualityApplies && (
                  <p className="text-xs text-amber-600">{t('qualityLossless')}</p>
                )}
              </div>

              {/* 格式 */}
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('outputFormat')}</label>
                <select
                  value={outputFormat}
                  onChange={(e) => setOutputFormat(e.target.value)}
                  disabled={isProcessing}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="same">{t('formatSame')}</option>
                  <option value="jpeg">JPEG</option>
                  <option value="png">PNG</option>
                  <option value="webp">WebP</option>
                  <option value="avif">AVIF</option>
                </select>
                <p className="text-xs text-gray-500">{t('formatHint')}</p>
              </div>

              {/* 尺寸限制 */}
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('resize')}</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-xs text-gray-500">{t('maxWidth')}</span>
                    <input
                      type="number"
                      min="1"
                      inputMode="numeric"
                      value={maxWidth}
                      onChange={(e) => setMaxWidth(e.target.value)}
                      disabled={isProcessing}
                      placeholder={t('resizeUnit')}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">{t('maxHeight')}</span>
                    <input
                      type="number"
                      min="1"
                      inputMode="numeric"
                      value={maxHeight}
                      onChange={(e) => setMaxHeight(e.target.value)}
                      disabled={isProcessing}
                      placeholder={t('resizeUnit')}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500">{t('resizeHint')}</p>
              </div>

              {/* 操作 */}
              <div className="space-y-3 pt-2">
                <button
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md flex items-center justify-center gap-2 disabled:opacity-50"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing}
                >
                  <Upload className="h-4 w-4" />
                  {t('selectImages')}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileSelect}
                />

                {images.length > 0 && (
                  <>
                    <button
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50"
                      onClick={processAllImages}
                      disabled={isProcessing || images.every((img) => img.status !== 'pending')}
                    >
                      {isProcessing ? t('processing') : t('start')}
                    </button>

                    {images.some((img) => img.status === 'done') && (
                      <button
                        className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md flex items-center justify-center gap-2"
                        onClick={downloadAll}
                      >
                        <Download className="h-4 w-4" />
                        {t('downloadAll')}
                      </button>
                    )}

                    <button
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md flex items-center justify-center gap-2 disabled:opacity-50"
                      onClick={clearAll}
                      disabled={isProcessing}
                    >
                      <X className="h-4 w-4" />
                      {t('clear')}
                    </button>
                  </>
                )}
              </div>

              {/* 进度 */}
              {isProcessing && (
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between text-sm">
                    <span>{t('progress')}</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* 统计 */}
              {images.length > 0 && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <div className="text-gray-500">{t('totalFiles')}</div>
                      <div className="font-medium">{images.length}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">{t('processed')}</div>
                      <div className="font-medium">
                        {images.filter((img) => img.status === 'done').length}
                      </div>
                    </div>
                    <div className="col-span-2 mt-2">
                      <div className="text-gray-500">{t('saved')}</div>
                      <div className="font-medium text-green-600">{totalSavings()}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 图片列表 */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <FileImage className="h-5 w-5" />
                {t('listTitle')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                {images.length === 0 ? t('empty') : t('countImages', { count: images.length })}
              </p>
            </div>

            <div className="p-6">
              {images.length === 0 ? (
                <div
                  onDragOver={(e) => {
                    e.preventDefault()
                    setDragActive(true)
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
                    dragActive
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                >
                  <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500 mb-2">{t('dropHint')}</p>
                  <p className="text-xs text-gray-500">{t('formatsHint')}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {images.map((image) => (
                    <div
                      key={image.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                    >
                      <div className="relative aspect-video bg-gray-100 dark:bg-gray-900">
                        <img
                          src={image.previewUrl}
                          alt={image.originalFile.name}
                          className="w-full h-full object-contain"
                        />
                        <button
                          className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 disabled:opacity-50"
                          onClick={() => removeImage(image.id)}
                          disabled={isProcessing}
                        >
                          <X className="h-3 w-3" />
                        </button>
                        {image.status === 'processing' && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <div className="text-white text-sm">{t('processing')}</div>
                          </div>
                        )}
                        {image.status === 'done' && (
                          <span className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
                            {t('done')}
                          </span>
                        )}
                        {image.status === 'error' && (
                          <span className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
                            {t('failed')}
                          </span>
                        )}
                      </div>
                      <div className="p-3 space-y-2 text-sm">
                        <div className="font-medium truncate" title={image.originalFile.name}>
                          {image.originalFile.name}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-gray-500">{t('originalSize')}:</span>
                            <br />
                            {formatFileSize(image.originalSize)}
                          </div>
                          {image.processedSize && (
                            <div>
                              <span className="text-gray-500">{t('compressedSize')}:</span>
                              <br />
                              <span className="text-green-600">
                                {formatFileSize(image.processedSize)}
                              </span>
                              <span className="ml-1">
                                (-{compressionRate(image.originalSize, image.processedSize)})
                              </span>
                            </div>
                          )}
                          <div>
                            <span className="text-gray-500">{t('format')}:</span>
                            <br />
                            {image.format.toUpperCase()}
                          </div>
                          <div>
                            <span className="text-gray-500">{t('qualityLabel')}:</span>
                            <br />
                            {image.quality}%
                          </div>
                        </div>
                        {image.status === 'done' && (
                          <div className="flex gap-2 mt-2">
                            <button
                              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm py-1 px-2 rounded flex items-center justify-center gap-1"
                              onClick={() => downloadImage(image)}
                            >
                              <Download className="h-3 w-3" />
                              {t('download')}
                            </button>
                            <button
                              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white text-sm py-1 px-2 rounded flex items-center justify-center gap-1"
                              onClick={() => setCompareImage(image)}
                            >
                              <GitCompareArrows className="h-3 w-3" />
                              {t('compare')}
                            </button>
                          </div>
                        )}
                        {image.warning && (
                          <p className="text-xs text-amber-600 mt-1">{image.warning}</p>
                        )}
                        {image.status === 'error' && (
                          <p className="text-xs text-red-500 mt-1">{image.error}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {images.length > 0 && (
                <div
                  onDragOver={(e) => {
                    e.preventDefault()
                    setDragActive(true)
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`mt-4 border-2 border-dashed rounded-lg p-4 text-center text-sm cursor-pointer transition-colors ${
                    dragActive
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950'
                      : 'border-gray-300 dark:border-gray-600 text-gray-500'
                  }`}
                >
                  {t('addMore')}
                </div>
              )}
            </div>

            {images.length > 0 && (
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-500">
                {t('localOnly')}
              </div>
            )}
          </div>
        </div>
      </div>

      {compareImage && (
        <CompareModal image={compareImage} onClose={() => setCompareImage(null)} t={t} />
      )}
    </div>
  )
}

/** 原图/压缩后 滑块对比 —— clip-path 叠层，无依赖 */
const CompareModal: React.FC<{
  image: ProcessedImage
  onClose: () => void
  t: (key: string, opts?: Record<string, unknown>) => string
}> = ({ image, onClose, t }) => {
  const [pos, setPos] = useState(50)
  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold">{t('compareTitle')}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="relative w-full bg-gray-100 dark:bg-gray-900 rounded overflow-hidden select-none">
          {/* 压缩后（底层，铺满） */}
          <img
            src={image.processedUrl}
            alt={t('after')}
            className="block w-full h-auto max-h-[60vh] object-contain"
          />
          {/* 原图（上层，按 pos 裁剪） */}
          <img
            src={image.previewUrl}
            alt={t('before')}
            className="absolute inset-0 w-full h-full object-contain"
            style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
          />
          {/* 分隔线 */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white shadow"
            style={{ left: `${pos}%` }}
          />
          <span className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
            {t('before')} · {formatFileSize(image.originalSize)}
          </span>
          <span className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
            {t('after')} · {image.processedSize ? formatFileSize(image.processedSize) : ''}
          </span>
        </div>

        <input
          type="range"
          min="0"
          max="100"
          value={pos}
          onChange={(e) => setPos(Number(e.target.value))}
          className="w-full mt-3 cursor-pointer"
        />
        <p className="text-center text-xs text-gray-500 mt-1">{t('dragToCompare')}</p>
      </div>
    </div>
  )
}

export default ImageCompressor
