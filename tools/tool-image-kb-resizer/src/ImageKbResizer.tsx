import React, { useRef, useState } from 'react'
import { PageHero, Button, Input, Card, StatusBadge } from '@toolbox/ui-kit'
import { Maximize2, Upload, Download, AlertCircle, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { loadImage, encodeToTarget } from './lib/encode'
import type { OutputFormat } from './lib/types'

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

const FORMATS: OutputFormat[] = ['same', 'jpeg', 'png', 'webp']

export default function ImageKbResizer() {
  const { t } = useTranslation('toolImageKbResizer')
  const [file, setFile] = useState<File | null>(null)
  const [targetKb, setTargetKb] = useState('')
  const [format, setFormat] = useState<OutputFormat>('same')
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{ blob: Blob; actualSize: number; approximate: boolean } | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const pickFile = (f: File | undefined | null) => {
    if (!f || !f.type.startsWith('image/')) {
      setError(t('errorInvalidFile'))
      return
    }
    setFile(f)
    setResult(null)
    setError(null)
  }

  const handleProcess = async () => {
    if (!file) return
    const kb = Number(targetKb)
    if (!kb || kb <= 0) {
      setError(t('errorTargetTooSmall'))
      return
    }
    setProcessing(true)
    setError(null)
    setResult(null)
    try {
      const img = await loadImage(file)
      const targetBytes = Math.round(kb * 1024)
      const outcome = await encodeToTarget(img, format, file.type, targetBytes)
      setResult(outcome)
    } catch (e) {
      setError(e instanceof Error ? e.message : t('errorProcessFailed'))
    } finally {
      setProcessing(false)
    }
  }

  const handleDownload = () => {
    if (!result || !file) return
    const url = URL.createObjectURL(result.blob)
    const a = document.createElement('a')
    a.href = url
    const ext = result.blob.type.split('/')[1] || 'bin'
    const baseName = file.name.replace(/\.[^.]+$/, '')
    a.download = `${baseName}-resized.${ext}`
    a.click()
    URL.revokeObjectURL(url)
  }

  const changeRate = result && file ? (((result.actualSize - file.size) / file.size) * 100).toFixed(1) : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <PageHero icon={Maximize2} title={t('title')} description={t('description')} />

        <Card className="max-w-3xl mx-auto mt-8 p-6 space-y-5">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              dragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600'
            }`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault()
              setDragActive(true)
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDragActive(false)
              pickFile(e.dataTransfer.files?.[0])
            }}
          >
            <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-600 dark:text-gray-400">{file ? file.name : t('dropHint')}</p>
            <p className="text-xs text-gray-400 mt-1">{t('supportedFormats')}</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => pickFile(e.target.files?.[0])}
            />
          </div>

          {file && (
            <div className="text-sm text-gray-500">
              {t('originalSize')}：<span className="font-mono">{formatBytes(file.size)}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-500 mb-1 block">{t('targetSizeLabel')}</label>
              <Input
                type="number"
                min={1}
                max={10000}
                placeholder={t('targetSizePlaceholder')}
                value={targetKb}
                onChange={(e) => setTargetKb(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm text-gray-500 mb-1 block">{t('outputFormat')}</label>
              <div className="flex gap-1.5 flex-wrap">
                {FORMATS.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFormat(f)}
                    className={`px-3 py-1.5 rounded-md text-sm border ${
                      format === f
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    {t(f === 'same' ? 'formatSame' : `format${f.charAt(0).toUpperCase()}${f.slice(1)}`)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <Button onClick={handleProcess} disabled={!file || processing || !targetKb} className="w-full">
            {processing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t('processing')}
              </>
            ) : (
              t('process')
            )}
          </Button>

          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
            </div>
          )}

          {result && file && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                <div>
                  <p className="text-gray-500">{t('originalSize')}</p>
                  <p className="font-mono">{formatBytes(file.size)}</p>
                </div>
                <div>
                  <p className="text-gray-500">{t('targetSizeLabel')}</p>
                  <p className="font-mono">{formatBytes(Math.round(Number(targetKb) * 1024))}</p>
                </div>
                <div>
                  <p className="text-gray-500">{t('actualSize')}</p>
                  <p className="font-mono">{formatBytes(result.actualSize)}</p>
                </div>
                <div>
                  <p className="text-gray-500">{t('changeRate')}</p>
                  <p className="font-mono">{changeRate}%</p>
                </div>
              </div>

              {result.approximate && <StatusBadge level="warning" label={t('approximateNotice')} />}

              <Button onClick={handleDownload} className="w-full">
                <Download className="w-4 h-4 mr-2" />
                {t('download')}
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
