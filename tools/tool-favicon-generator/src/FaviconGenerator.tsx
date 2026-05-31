import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Button, Card, NoticeCard, PageHero, ParticlesBackground, Switch } from '@toolbox/ui-kit'
import { useTranslation } from 'react-i18next'
import { Check, Copy, Download, ImagePlus, RefreshCw } from 'lucide-react'
import JSZip from 'jszip'
import { encodeIco } from './lib/ico'
import { canvasToPngBytes, createOutputCanvas, resizeOnto } from './lib/resize'
import { buildHtmlSnippet, buildWebManifestJson } from './lib/snippets'

type LoadedImage = {
  element: HTMLImageElement
  width: number
  height: number
  isSvg: boolean
  fileName: string
}

const ICO_SIZES = [16, 32, 48] as const
const PREVIEW_SIZES = [16, 32, 48, 180] as const
const MAX_BYTES = 10 * 1024 * 1024

function readFileAsImage(file: File): Promise<LoadedImage> {
  return new Promise((resolve, reject) => {
    if (file.size > MAX_BYTES) {
      reject(new Error('TOO_LARGE'))
      return
    }
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('INVALID'))
    reader.onload = () => {
      const dataUrl = reader.result as string
      const img = new Image()
      img.onload = () => {
        resolve({
          element: img,
          width: img.naturalWidth || img.width,
          height: img.naturalHeight || img.height,
          isSvg: file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg'),
          fileName: file.name,
        })
      }
      img.onerror = () => reject(new Error('INVALID'))
      img.src = dataUrl
    }
    reader.readAsDataURL(file)
  })
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

const FaviconGenerator: React.FC = () => {
  const { t } = useTranslation('toolFaviconGenerator')
  const inputRef = useRef<HTMLInputElement | null>(null)

  const [image, setImage] = useState<LoadedImage | null>(null)
  const [transparent, setTransparent] = useState(true)
  const [background, setBackground] = useState('#ffffff')
  const [maskable, setMaskable] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [copied, setCopied] = useState<'html' | 'manifest' | null>(null)

  const htmlSnippet = useMemo(() => buildHtmlSnippet({ themeColor: background }), [background])
  const manifestJson = useMemo(
    () => buildWebManifestJson({ maskable, themeColor: background, backgroundColor: background }),
    [maskable, background],
  )

  const bgForCanvas = transparent ? null : background
  const padding = maskable && image?.isSvg ? 0.1 : 0

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return
      const file = files[0]
      setError(null)
      try {
        const loaded = await readFileAsImage(file)
        setImage(loaded)
      } catch (e) {
        const code = (e as Error).message
        if (code === 'TOO_LARGE') setError(t('upload.tooLarge'))
        else setError(t('upload.invalid'))
      }
    },
    [t],
  )

  const onPickClick = () => inputRef.current?.click()

  const onDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault()
    void handleFiles(e.dataTransfer.files)
  }

  const onDragOver: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault()
  }

  const buildAllPngs = useCallback(
    async (img: LoadedImage) => {
      const sizes = [16, 32, 48, 96, 180, 192, 512]
      const result = new Map<number, Uint8Array>()
      for (const size of sizes) {
        const canvas = createOutputCanvas(size)
        resizeOnto(canvas, img.element, { size, background: bgForCanvas, padding })
        const bytes = await canvasToPngBytes(canvas)
        result.set(size, bytes)
      }
      return result
    },
    [bgForCanvas, padding],
  )

  const handleDownloadZip = async () => {
    if (!image) return
    setBusy(true)
    try {
      const pngs = await buildAllPngs(image)
      const icoEntries = ICO_SIZES.map((size) => ({ size, png: pngs.get(size)! }))
      const icoBytes = encodeIco(icoEntries)

      const zip = new JSZip()
      zip.file('favicon.ico', icoBytes)
      zip.file('favicon-16.png', pngs.get(16)!)
      zip.file('favicon-32.png', pngs.get(32)!)
      zip.file('favicon-48.png', pngs.get(48)!)
      zip.file('favicon-96.png', pngs.get(96)!)
      zip.file('apple-touch-icon-180.png', pngs.get(180)!)
      zip.file('android-chrome-192.png', pngs.get(192)!)
      zip.file('android-chrome-512.png', pngs.get(512)!)
      zip.file('site.webmanifest', manifestJson)
      zip.file('head-snippet.html', htmlSnippet)

      const blob = await zip.generateAsync({ type: 'blob' })
      downloadBlob(blob, 'favicon-bundle.zip')
    } finally {
      setBusy(false)
    }
  }

  const copy = async (text: string, which: 'html' | 'manifest') => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(which)
      setTimeout(() => setCopied((c) => (c === which ? null : c)), 1800)
    } catch {
      setError(t('output.failed'))
    }
  }

  return (
    <div className="relative min-h-[60vh]">
      <ParticlesBackground preset="minimal" className="absolute inset-0" />
      <div className="relative z-10 space-y-6">
        <PageHero title={t('title')} description={t('description')} />

        <NoticeCard tone="info" title={t('notice.title')} description={t('notice.description')} />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <Card>
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t('upload.heading')}
            </h2>
            <div
              onDrop={onDrop}
              onDragOver={onDragOver}
              onClick={onPickClick}
              className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 px-6 py-10 text-center transition-colors hover:border-sky-400 hover:bg-sky-50/40 dark:hover:bg-sky-950/20"
            >
              <ImagePlus className="h-8 w-8 text-sky-500" />
              <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                {t('upload.drop')}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{t('upload.hint')}</div>
              {image ? (
                <div className="mt-3 inline-flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300">
                  <RefreshCw className="h-3 w-3" />
                  <span>
                    {image.fileName} ({image.width}x{image.height})
                  </span>
                </div>
              ) : null}
              <input
                ref={inputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                className="hidden"
                onChange={(e) => void handleFiles(e.target.files)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            {error ? (
              <div className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</div>
            ) : null}

            <div className="mt-6 space-y-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {t('options.heading')}
              </h3>
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-gray-700 dark:text-gray-300">{t('options.background')}</span>
                <span className="flex items-center gap-2">
                  <Switch checked={transparent} onChange={setTransparent} label={t('options.transparent')} />
                  {!transparent ? (
                    <input
                      type="color"
                      value={background}
                      onChange={(e) => setBackground(e.target.value)}
                      className="h-9 w-12 cursor-pointer rounded border border-gray-300 dark:border-gray-600"
                      aria-label={t('options.background')}
                    />
                  ) : null}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t('options.backgroundHint')}</p>
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-gray-700 dark:text-gray-300">{t('options.maskable')}</span>
                <Switch checked={maskable} onChange={setMaskable} />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t('options.maskableHint')}</p>
            </div>
          </Card>

          <Card>
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t('preview.heading')}
            </h2>
            {image ? (
              <div className="flex flex-wrap items-end gap-6">
                {PREVIEW_SIZES.map((size) => (
                  <PreviewTile key={size} img={image} size={size} background={bgForCanvas} padding={padding} />
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-700 p-6 text-center text-sm text-gray-500 dark:text-gray-400">
                {t('preview.empty')}
              </div>
            )}
          </Card>
        </div>

        <Card>
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
            {t('output.heading')}
          </h2>
          {!image ? (
            <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-700 p-6 text-center text-sm text-gray-500 dark:text-gray-400">
              {t('output.waiting')}
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex flex-wrap gap-2">
                <Button onClick={handleDownloadZip} disabled={busy}>
                  <span className="inline-flex items-center gap-1.5">
                    <Download className="h-4 w-4" />
                    {t('output.downloadZip')}
                  </span>
                </Button>
                <Button variant="secondary" onClick={() => copy(htmlSnippet, 'html')}>
                  <span className="inline-flex items-center gap-1.5">
                    {copied === 'html' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {t('output.copyHtml')}
                  </span>
                </Button>
                <Button variant="secondary" onClick={() => copy(manifestJson, 'manifest')}>
                  <span className="inline-flex items-center gap-1.5">
                    {copied === 'manifest' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {t('output.copyManifest')}
                  </span>
                </Button>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t('output.htmlHeading')}
                  </h3>
                  <pre className="max-h-72 overflow-auto rounded-lg bg-gray-900 p-3 text-xs leading-5 text-gray-100">
                    {htmlSnippet}
                  </pre>
                </div>
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t('output.manifestHeading')}
                  </h3>
                  <pre className="max-h-72 overflow-auto rounded-lg bg-gray-900 p-3 text-xs leading-5 text-gray-100">
                    {manifestJson}
                  </pre>
                </div>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {t('output.filesHeading')}
                </h3>
                <ul className="grid grid-cols-1 gap-1 text-sm text-gray-700 dark:text-gray-300 sm:grid-cols-2">
                  <li>- {t('files.ico')}</li>
                  <li>- {t('files.png16')}</li>
                  <li>- {t('files.png32')}</li>
                  <li>- {t('files.png48')}</li>
                  <li>- {t('files.png96')}</li>
                  <li>- {t('files.apple')}</li>
                  <li>- {t('files.android192')}</li>
                  <li>- {t('files.android512')}</li>
                  <li>- {t('files.manifest')}</li>
                  <li>- {t('files.html')}</li>
                </ul>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

type PreviewTileProps = {
  img: LoadedImage
  size: number
  background: string | null | undefined
  padding: number
}

const PreviewTile: React.FC<PreviewTileProps> = ({ img, size, background, padding }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = size
    canvas.height = size
    try {
      resizeOnto(canvas, img.element, { size, background: background ?? null, padding })
    } catch {
      // ignore - canvas may be unavailable in some environments
    }
  }, [img, size, background, padding])

  return (
    <div className="flex flex-col items-center gap-1">
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="rounded border border-gray-200 dark:border-gray-700"
        style={{ width: Math.max(size, 32), height: Math.max(size, 32) }}
      />
      <span className="text-xs text-gray-500 dark:text-gray-400">{size}x{size}</span>
    </div>
  )
}

export default FaviconGenerator
