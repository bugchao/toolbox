import React, { useState, useCallback } from 'react'
import { PageHero, ParticlesBackground } from '@toolbox/ui-kit'
import { useTranslation } from 'react-i18next'
import { Upload, Copy, Check, Loader2, X, Languages } from 'lucide-react'
import { createWorker, PSM } from 'tesseract.js'

interface RecognitionResult {
  id: string
  imageUrl: string
  text: string
  language: string
  confidence: number
  status: 'processing' | 'completed' | 'error'
  progress: number
  error?: string
}

type LanguageOption = 'auto' | 'chi_sim' | 'eng' | 'chi_sim+eng'

const OcrText: React.FC = () => {
  const { t } = useTranslation('toolOcrText')
  const [results, setResults] = useState<RecognitionResult[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageOption>('auto')

  const languageOptions: { value: LanguageOption; label: string }[] = [
    { value: 'auto', label: t('language.auto') },
    { value: 'chi_sim', label: t('language.chinese') },
    { value: 'eng', label: t('language.english') },
    { value: 'chi_sim+eng', label: t('language.both') },
  ]

  const processImage = useCallback(
    async (file: File) => {
      const id = `${Date.now()}-${Math.random()}`
      const imageUrl = URL.createObjectURL(file)

      const newResult: RecognitionResult = {
        id,
        imageUrl,
        text: '',
        language: selectedLanguage,
        confidence: 0,
        status: 'processing',
        progress: 0,
      }

      setResults((prev) => [newResult, ...prev])

      try {
        const worker = await createWorker(selectedLanguage === 'auto' ? 'chi_sim+eng' : selectedLanguage, 1, {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              setResults((prev) =>
                prev.map((r) =>
                  r.id === id
                    ? { ...r, progress: Math.round(m.progress * 100) }
                    : r
                )
              )
            }
          },
        })

        await worker.setParameters({
          tessedit_pageseg_mode: PSM.AUTO,
        })

        const {
          data: { text, confidence },
        } = await worker.recognize(file)

        await worker.terminate()

        setResults((prev) =>
          prev.map((r) =>
            r.id === id
              ? {
                  ...r,
                  text: text.trim(),
                  confidence: Math.round(confidence),
                  status: 'completed',
                  progress: 100,
                }
              : r
          )
        )
      } catch (error) {
        setResults((prev) =>
          prev.map((r) =>
            r.id === id
              ? {
                  ...r,
                  status: 'error',
                  error: error instanceof Error ? error.message : t('error.unknown'),
                }
              : r
          )
        )
      }
    },
    [selectedLanguage, t]
  )

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return

      const imageFiles = Array.from(files).filter((file) =>
        file.type.startsWith('image/')
      )

      if (imageFiles.length === 0) {
        alert(t('error.invalidFile'))
        return
      }

      imageFiles.forEach((file) => processImage(file))
    },
    [processImage, t]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      handleFiles(e.dataTransfer.files)
    },
    [handleFiles]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFiles(e.target.files)
      e.target.value = ''
    },
    [handleFiles]
  )

  const copyText = useCallback(
    async (id: string, text: string) => {
      try {
        await navigator.clipboard.writeText(text)
        setCopiedId(id)
        setTimeout(() => setCopiedId(null), 2000)
      } catch (error) {
        console.error('Failed to copy:', error)
      }
    },
    []
  )

  const removeResult = useCallback((id: string) => {
    setResults((prev) => {
      const result = prev.find((r) => r.id === id)
      if (result?.imageUrl) {
        URL.revokeObjectURL(result.imageUrl)
      }
      return prev.filter((r) => r.id !== id)
    })
  }, [])

  return (
    <div className="relative min-h-[60vh]">
      <ParticlesBackground preset="minimal" className="absolute inset-0" />
      <div className="relative z-10 space-y-6">
        <PageHero title={t('title')} description={t('description')} />

        {/* Language Selection */}
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
            <div className="flex items-center gap-3">
              <Languages className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('language.label')}
              </label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value as LanguageOption)}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {languageOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Upload Area */}
        <div className="max-w-4xl mx-auto px-4">
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`
              relative border-2 border-dashed rounded-lg p-12 text-center transition-colors
              ${
                isDragging
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
              }
            `}
          >
            <input
              type="file"
              id="file-input"
              multiple
              accept="image/*"
              onChange={handleFileInput}
              className="hidden"
            />
            <label
              htmlFor="file-input"
              className="cursor-pointer flex flex-col items-center gap-4"
            >
              <Upload className="w-12 h-12 text-gray-400" />
              <div>
                <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                  {t('upload.title')}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {t('upload.subtitle')}
                </p>
              </div>
              <button
                type="button"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t('upload.button')}
              </button>
            </label>
          </div>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="max-w-4xl mx-auto px-4 space-y-4">
            {results.map((result) => (
              <div
                key={result.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden"
              >
                <div className="grid md:grid-cols-2 gap-4 p-4">
                  {/* Image Preview */}
                  <div className="relative">
                    <img
                      src={result.imageUrl}
                      alt="OCR"
                      className="w-full h-48 object-contain bg-gray-100 dark:bg-gray-700 rounded-lg"
                    />
                    <button
                      onClick={() => removeResult(result.id)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Result */}
                  <div className="flex flex-col">
                    {result.status === 'processing' && (
                      <div className="flex-1 flex flex-col items-center justify-center gap-3">
                        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                        <div className="w-full max-w-xs">
                          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-600 transition-all duration-300"
                              style={{ width: `${result.progress}%` }}
                            />
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 text-center">
                            {t('processing')} {result.progress}%
                          </p>
                        </div>
                      </div>
                    )}

                    {result.status === 'completed' && (
                      <>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {t('confidence')}: {result.confidence}%
                          </span>
                          <button
                            onClick={() => copyText(result.id, result.text)}
                            className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                          >
                            {copiedId === result.id ? (
                              <>
                                <Check className="w-4 h-4" />
                                {t('copied')}
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4" />
                                {t('copy')}
                              </>
                            )}
                          </button>
                        </div>
                        <div className="flex-1 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg overflow-auto">
                          <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap font-mono">
                            {result.text || t('noText')}
                          </pre>
                        </div>
                      </>
                    )}

                    {result.status === 'error' && (
                      <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                          <p className="text-red-600 dark:text-red-400 font-medium">
                            {t('error.title')}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {result.error}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default OcrText
