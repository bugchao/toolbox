import React, { useState } from 'react'
import { ImagePlus, Info, Upload } from 'lucide-react'
import { Card, NoticeCard, PageHero, PropertyGrid } from '@toolbox/ui-kit'
import { useTranslation } from 'react-i18next'

const ImageLocalPreview: React.FC = () => {
  const { t } = useTranslation('toolImageLocalPreview')
  const [preview, setPreview] = useState<string | null>(null)
  const [meta, setMeta] = useState<{ name: string; type: string; size: number; width: number; height: number; updated: string } | null>(null)

  const handleFile = (file: File | null) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const src = String(reader.result)
      const image = new Image()
      image.onload = () => {
        setPreview(src)
        setMeta({
          name: file.name,
          type: file.type || 'image/*',
          size: file.size,
          width: image.width,
          height: image.height,
          updated: new Date(file.lastModified).toLocaleString(),
        })
      }
      image.src = src
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-6">
      <Card className="border-emerald-200/70 bg-gradient-to-br from-white via-emerald-50 to-teal-50/70 dark:border-emerald-900/60 dark:from-slate-950 dark:via-emerald-950/20 dark:to-teal-950/10">
        <PageHero icon={ImagePlus} title={t('title')} description={t('description')} />
      </Card>

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <Card className="space-y-4">
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-emerald-300 bg-emerald-50/70 px-6 py-10 text-center transition hover:border-emerald-400 hover:bg-emerald-100/70 dark:border-emerald-800 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/30">
            <Upload className="mb-3 h-8 w-8 text-emerald-600 dark:text-emerald-300" />
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{t('uploadTitle')}</div>
            <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">{t('uploadDescription')}</div>
            <input type="file" accept="image/*" className="hidden" onChange={(event) => handleFile(event.target.files?.[0] ?? null)} />
          </label>

          {meta ? (
            <PropertyGrid
              items={[
                { label: t('fields.format'), value: meta.type, tone: 'primary' },
                { label: t('fields.size'), value: `${(meta.size / 1024).toFixed(1)} KB`, tone: 'success' },
                { label: t('fields.dimensions'), value: `${meta.width} × ${meta.height}`, tone: 'warning' },
                { label: t('fields.updated'), value: meta.updated },
              ]}
              className="xl:grid-cols-1"
            />
          ) : (
            <NoticeCard tone="info" icon={Info} title={t('emptyTitle')} description={t('emptyDescription')} />
          )}
        </Card>

        <Card className="space-y-4">
          {preview ? (
            <>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/70">
                <img src={preview} alt={meta?.name ?? 'preview'} className="max-h-[560px] w-full rounded-2xl object-contain" />
              </div>
              {meta ? <div className="text-sm text-slate-500 dark:text-slate-400">{meta.name}</div> : null}
            </>
          ) : (
            <div className="flex min-h-[420px] items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-400">
              {t('placeholder')}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

export default ImageLocalPreview
