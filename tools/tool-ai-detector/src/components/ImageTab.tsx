import React, { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Upload, X } from 'lucide-react'
import { analyzeImage, type ImageAnalysis } from '../lib/imageFeatures'
import { aggregate, type ScoreResult } from '../lib/score'
import ResultPanel from './ResultPanel'

const ImageTab: React.FC = () => {
  const { t } = useTranslation('toolAiDetector')
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<ImageAnalysis | null>(null)
  const [result, setResult] = useState<ScoreResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  // 预览 URL 生命周期
  useEffect(() => {
    if (!file) {
      setPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  // 文件变 → 重新分析
  useEffect(() => {
    if (!file) {
      setAnalysis(null)
      setResult(null)
      return
    }
    let cancelled = false
    setBusy(true)
    setError(null)
    analyzeImage(file)
      .then((a) => {
        if (cancelled) return
        setAnalysis(a)
        setResult(aggregate(a.features))
      })
      .catch((e) => {
        if (cancelled) return
        setError((e as Error).message ?? 'analysis failed')
      })
      .finally(() => {
        if (!cancelled) setBusy(false)
      })
    return () => {
      cancelled = true
    }
  }, [file])

  const accept = useCallback(
    (f: File | null) => {
      setError(null)
      if (!f) {
        setFile(null)
        return
      }
      if (!f.type.startsWith('image/')) {
        setError(t('image.notImage'))
        return
      }
      setFile(f)
    },
    [t],
  )

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      const f = e.dataTransfer.files?.[0]
      if (f) accept(f)
    },
    [accept],
  )

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-3">
        {previewUrl ? (
          <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900/40">
            <img
              src={previewUrl}
              alt="preview"
              className="max-h-[420px] w-full object-contain"
            />
            <button
              type="button"
              onClick={() => setFile(null)}
              className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white hover:bg-black"
              aria-label="remove image"
            >
              <X className="h-4 w-4" />
            </button>
            {analysis && (
              <div className="border-t border-gray-200 dark:border-gray-700 p-3 text-xs text-gray-600 dark:text-gray-300">
                {analysis.width}×{analysis.height} · {analysis.format.toUpperCase()}
                {analysis.metadataHits.length > 0 && (
                  <span className="ml-2 rounded bg-rose-100 px-1.5 py-0.5 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">
                    {t('image.metadataHit', { n: analysis.metadataHits.length })}
                  </span>
                )}
              </div>
            )}
          </div>
        ) : (
          <label
            htmlFor="ai-detector-image-input"
            onDrop={onDrop}
            onDragOver={(e) => e.preventDefault()}
            className="flex h-72 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-indigo-300 bg-indigo-50/50 text-center transition-colors hover:border-indigo-400 hover:bg-indigo-50 dark:border-indigo-700 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/30"
          >
            <Upload className="mb-2 h-8 w-8 text-indigo-500" />
            <span className="font-medium text-indigo-700 dark:text-indigo-200">
              {t('image.cta')}
            </span>
            <span className="mt-1 text-xs text-indigo-500/80 dark:text-indigo-300/80">
              {t('image.dragHint')}
            </span>
            <input
              id="ai-detector-image-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => accept(e.target.files?.[0] ?? null)}
            />
          </label>
        )}
        {error && (
          <div className="rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-700 dark:bg-rose-900/30 dark:text-rose-200">
            {error}
          </div>
        )}
      </div>

      <div>
        {result ? (
          <ResultPanel result={result} />
        ) : (
          <div className="flex h-full min-h-[200px] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
            <p className="mb-2 text-lg">🖼️</p>
            <p>{busy ? t('image.analyzing') : t('image.empty')}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ImageTab
