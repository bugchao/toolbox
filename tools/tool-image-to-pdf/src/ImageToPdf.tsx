import React, { useCallback, useState } from 'react'
import { Button, Card, Input, NoticeCard, PageHero, ParticlesBackground } from '@toolbox/ui-kit'
import { Download, FileImage } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import DropZone from './components/DropZone'
import ImageGrid from './components/ImageGrid'
import OptionsPanel, { type Options } from './components/OptionsPanel'
import { buildPdf, type ImageItem } from './lib/buildPdf'

const DEFAULT_OPTIONS: Options = {
  paper: 'a4',
  orientation: 'portrait',
  margin: 'small',
  perPage: 1,
}

async function loadImageItem(file: File): Promise<ImageItem> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve({
        id: `${file.name}-${file.size}-${Math.random().toString(36).slice(2, 8)}`,
        file,
        rotation: 0,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
      })
    }
    img.onerror = (e) => {
      URL.revokeObjectURL(url)
      reject(e)
    }
    img.src = url
  })
}

const ImageToPdf: React.FC = () => {
  const { t } = useTranslation('toolImageToPdf')
  const [items, setItems] = useState<ImageItem[]>([])
  const [options, setOptions] = useState<Options>(DEFAULT_OPTIONS)
  const [filename, setFilename] = useState('images.pdf')
  const [skipped, setSkipped] = useState<string[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onFiles = useCallback(async (files: File[]) => {
    setError(null)
    const loaded: ImageItem[] = []
    for (const f of files) {
      try {
        loaded.push(await loadImageItem(f))
      } catch {
        // 单张失败不阻塞其他
      }
    }
    setItems((cur) => [...cur, ...loaded])
  }, [])

  const onRotate = (id: string) => {
    setItems((cur) =>
      cur.map((it) => (it.id === id ? { ...it, rotation: (it.rotation + 90) % 360 } : it)),
    )
  }

  const onRemove = (id: string) => {
    setItems((cur) => cur.filter((it) => it.id !== id))
  }

  const onExport = async () => {
    if (items.length === 0) return
    setBusy(true)
    setError(null)
    try {
      const blob = await buildPdf(items, options)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (e) {
      setError((e as Error).message ?? 'export failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="relative min-h-[60vh]">
      <ParticlesBackground preset="minimal" className="absolute inset-0" />
      <div className="relative z-10 space-y-6">
        <PageHero title={t('title')} description={t('description')} />

        <NoticeCard
          tone="info"
          title={t('notice.title')}
          description={t('notice.body')}
          icon={FileImage}
        />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-4">
            <DropZone onFiles={onFiles} onSkipped={(s) => setSkipped(s)} />
            {skipped.length > 0 && (
              <div className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                {t('drop.skipped', { n: skipped.length })}: {skipped.join(', ')}
              </div>
            )}
            <Card padded={false} className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  {t('grid.heading')}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {t('grid.count', { n: items.length })}
                </span>
              </div>
              {items.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                  {t('grid.empty')}
                </div>
              ) : (
                <ImageGrid
                  items={items}
                  onReorder={setItems}
                  onRotate={onRotate}
                  onRemove={onRemove}
                />
              )}
            </Card>
          </div>

          <Card>
            <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t('options.heading')}
            </h2>
            <OptionsPanel options={options} onChange={setOptions} />

            <div className="mt-5 space-y-2 border-t border-gray-200 pt-4 dark:border-gray-700">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('export.filename')}
              </label>
              <Input
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                spellCheck={false}
              />
              <Button
                onClick={onExport}
                disabled={items.length === 0 || busy}
                className="mt-2 w-full"
              >
                <span className="inline-flex items-center justify-center gap-1.5">
                  <Download className="h-4 w-4" />
                  {busy ? t('export.busy') : t('export.cta')}
                </span>
              </Button>
              {error && (
                <div className="mt-2 rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-700 dark:bg-rose-900/30 dark:text-rose-200">
                  {error}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default ImageToPdf
