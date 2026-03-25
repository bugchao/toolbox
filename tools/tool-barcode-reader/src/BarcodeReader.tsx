import React, { useState, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { ScanLine, Copy, Check, Clock } from 'lucide-react'
import { PageHero } from '@toolbox/ui-kit'
import { useToolStorage } from '@toolbox/storage'

interface ScanResult {
  id: string
  value: string
  format: string
  timestamp: string
  imageUrl?: string
}

interface BarcodeState { history: ScanResult[] }
const DEFAULT: BarcodeState = { history: [] }

export default function BarcodeReader() {
  const { t } = useTranslation('toolBarcodeReader')
  const { data: state, save } = useToolStorage<BarcodeState>('barcode-reader', 'data', DEFAULT)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [dragging, setDragging] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const processFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) return
    setLoading(true)
    setError('')
    setResult(null)

    try {
      // Use BarcodeDetector API if available
      if ('BarcodeDetector' in window) {
        const detector = new (window as any).BarcodeDetector()
        const img = new Image()
        const url = URL.createObjectURL(file)
        img.src = url
        await new Promise(resolve => { img.onload = resolve })
        const codes = await detector.detect(img)
        URL.revokeObjectURL(url)
        if (codes.length > 0) {
          const r: ScanResult = {
            id: Date.now().toString(),
            value: codes[0].rawValue,
            format: codes[0].format,
            timestamp: new Date().toLocaleString('zh-CN'),
          }
          setResult(r)
          save({ history: [r, ...state.history].slice(0, 20) })
          return
        }
      }
      // Fallback: try to read QR code via canvas pixel analysis hint
      setError(t('error'))
    } catch {
      setError(t('error'))
    } finally {
      setLoading(false)
    }
  }, [state, save, t])

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
    e.target.value = ''
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }

  const copy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHero title={t('title')} description={t('description')} icon={ScanLine} />
      <div className="max-w-xl mx-auto px-4 py-6 space-y-4">

        {/* 上传区 */}
        <div
          onClick={() => fileRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-colors ${
            dragging ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400 hover:bg-gray-50'
          }`}>
          <ScanLine className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm text-gray-500">{t('uploadHint')}</p>
          {loading && <p className="text-sm text-indigo-500 mt-2">识别中...</p>}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
        </div>

        {/* 错误 */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* 结果 */}
        {result && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-green-200 dark:border-green-700 p-4 space-y-2">
            <h3 className="text-sm font-semibold text-green-600">{t('result')} ✓</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">{t('type')}:</span>
              <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded font-mono">{result.format}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-xs text-gray-400 shrink-0 mt-0.5">{t('value')}:</span>
              <span className="flex-1 text-sm text-gray-800 dark:text-gray-200 break-all font-mono">{result.value}</span>
              <button onClick={() => copy(result.value)}
                className="shrink-0 flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                {copied ? t('copied') : t('copy')}
              </button>
            </div>
          </div>
        )}

        {/* 历史 */}
        {state.history.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('history')}</h3>
            </div>
            {state.history.slice(0, 10).map(r => (
              <div key={r.id} className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-50 dark:border-gray-700/50 last:border-0">
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-700 dark:text-gray-300 truncate font-mono">{r.value}</div>
                  <div className="text-xs text-gray-400">{r.format} · {r.timestamp}</div>
                </div>
                <button onClick={() => copy(r.value)} className="shrink-0 text-gray-400 hover:text-gray-600">
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-center text-gray-400">{t('autoSave')}</p>
      </div>
    </div>
  )
}
