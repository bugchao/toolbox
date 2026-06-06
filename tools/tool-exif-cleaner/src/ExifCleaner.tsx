import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Button,
  Card,
  NoticeCard,
  PageHero,
  ParticlesBackground,
  PropertyGrid,
  formatBytes,
} from '@toolbox/ui-kit'
import type { PropertyGridItem } from '@toolbox/ui-kit'
import { useTranslation } from 'react-i18next'
import {
  ChevronDown,
  ChevronUp,
  Download,
  ImagePlus,
  MapPin,
  ShieldCheck,
  Trash2,
} from 'lucide-react'
import { parseExif, type ExifInfo } from './lib/exif'
import { pickOutputExtension, stripImageMetadata } from './lib/strip'
import { addCleanSuffix, replaceExtension } from './lib/filename'

const MAX_BYTES = 20 * 1024 * 1024
const ACCEPTED_TYPES = 'image/jpeg,image/png,image/webp,image/heic,image/heif'
const ACCEPTED_EXTENSIONS = /\.(jpe?g|png|webp|heic|heif)$/i

type ParseStatus = 'loading' | 'with-exif' | 'without-exif' | 'failed'

interface QueueItem {
  id: string
  file: File
  previewUrl: string
  status: ParseStatus
  exif: ExifInfo | null
  expanded: boolean
  downloading: boolean
}

function genId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
}

function isImageFile(file: File): boolean {
  if (file.type && file.type.startsWith('image/')) return true
  return ACCEPTED_EXTENSIONS.test(file.name)
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

function buildCleanName(originalName: string, sourceMime: string): string {
  const ext = pickOutputExtension(sourceMime, 'auto')
  const withNewExt = replaceExtension(originalName, ext)
  return addCleanSuffix(withNewExt)
}

const ExifCleaner: React.FC = () => {
  const { t, i18n } = useTranslation('toolExifCleaner')
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [items, setItems] = useState<QueueItem[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const [dragOver, setDragOver] = useState(false)
  const [batchBusy, setBatchBusy] = useState(false)

  // Track every created object URL so we can revoke them on unmount.
  const objectUrls = useRef<Set<string>>(new Set())

  useEffect(() => {
    const set = objectUrls.current
    return () => {
      for (const url of set) URL.revokeObjectURL(url)
      set.clear()
    }
  }, [])

  const registerUrl = (file: Blob): string => {
    const url = URL.createObjectURL(file)
    objectUrls.current.add(url)
    return url
  }

  const releaseUrl = (url: string) => {
    if (!url) return
    if (objectUrls.current.delete(url)) {
      URL.revokeObjectURL(url)
    }
  }

  const dateFormatter = useMemo(() => {
    try {
      return new Intl.DateTimeFormat(i18n.language === 'en' ? 'en-US' : 'zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return null
    }
  }, [i18n.language])

  const renderTakenAt = useCallback(
    (raw?: string) => {
      if (!raw) return ''
      const d = new Date(raw)
      if (Number.isNaN(d.getTime())) return raw
      return dateFormatter ? dateFormatter.format(d) : d.toLocaleString()
    },
    [dateFormatter],
  )

  const ingestFiles = useCallback(
    async (fileList: FileList | File[] | null) => {
      if (!fileList) return
      const files = Array.from(fileList)
      const accepted: QueueItem[] = []
      const newErrors: string[] = []
      for (const file of files) {
        if (!isImageFile(file)) {
          newErrors.push(t('upload.invalid', { name: file.name }))
          continue
        }
        if (file.size > MAX_BYTES) {
          newErrors.push(t('upload.tooLarge', { name: file.name }))
          continue
        }
        accepted.push({
          id: genId(),
          file,
          previewUrl: registerUrl(file),
          status: 'loading',
          exif: null,
          expanded: false,
          downloading: false,
        })
      }
      if (newErrors.length) setErrors((prev) => [...prev, ...newErrors])
      if (!accepted.length) return
      setItems((prev) => [...prev, ...accepted])

      // Parse each new item in parallel.
      await Promise.all(
        accepted.map(async (item) => {
          try {
            const info = await parseExif(item.file)
            setItems((prev) =>
              prev.map((row) =>
                row.id === item.id
                  ? { ...row, exif: info, status: info ? 'with-exif' : 'without-exif' }
                  : row,
              ),
            )
          } catch {
            setItems((prev) =>
              prev.map((row) => (row.id === item.id ? { ...row, status: 'failed' } : row)),
            )
          }
        }),
      )
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t],
  )

  const onDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault()
    setDragOver(false)
    void ingestFiles(e.dataTransfer.files)
  }

  const onDragOver: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault()
    if (!dragOver) setDragOver(true)
  }

  const onDragLeave: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault()
    setDragOver(false)
  }

  const onPickClick = () => inputRef.current?.click()

  const onPickChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    void ingestFiles(e.target.files)
    if (e.target) e.target.value = ''
  }

  const toggleDetails = (id: string) => {
    setItems((prev) => prev.map((row) => (row.id === id ? { ...row, expanded: !row.expanded } : row)))
  }

  const removeItem = (id: string) => {
    setItems((prev) => {
      const target = prev.find((row) => row.id === id)
      if (target) releaseUrl(target.previewUrl)
      return prev.filter((row) => row.id !== id)
    })
  }

  const clearAll = () => {
    setItems((prev) => {
      for (const row of prev) releaseUrl(row.previewUrl)
      return []
    })
    setErrors([])
  }

  const downloadOne = async (item: QueueItem) => {
    setItems((prev) => prev.map((row) => (row.id === item.id ? { ...row, downloading: true } : row)))
    try {
      const cleaned = await stripImageMetadata(item.file, { format: 'auto' })
      const cleanName = buildCleanName(item.file.name, item.file.type)
      downloadBlob(cleaned, cleanName)
    } catch {
      setErrors((prev) => [...prev, t('errors.stripFailed', { name: item.file.name })])
    } finally {
      setItems((prev) =>
        prev.map((row) => (row.id === item.id ? { ...row, downloading: false } : row)),
      )
    }
  }

  const downloadAll = async () => {
    if (!items.length) return
    setBatchBusy(true)
    try {
      const { default: JSZip } = await import('jszip')
      const zip = new JSZip()
      for (const row of items) {
        try {
          const cleaned = await stripImageMetadata(row.file, { format: 'auto' })
          const cleanName = buildCleanName(row.file.name, row.file.type)
          zip.file(cleanName, cleaned)
        } catch {
          setErrors((prev) => [...prev, t('errors.stripFailed', { name: row.file.name })])
        }
      }
      const blob = await zip.generateAsync({ type: 'blob' })
      downloadBlob(blob, 'exif-cleaned.zip')
    } catch {
      setErrors((prev) => [...prev, t('errors.zipFailed')])
    } finally {
      setBatchBusy(false)
    }
  }

  const buildDetailItems = useCallback(
    (exif: ExifInfo | null): PropertyGridItem[] => {
      if (!exif) return []
      const out: PropertyGridItem[] = []
      const push = (label: string, value: string | number | undefined, tone?: PropertyGridItem['tone']) => {
        if (value === undefined || value === null || value === '') return
        out.push({ label, value: String(value), tone })
      }
      push(t('details.make'), exif.make)
      push(t('details.model'), exif.model)
      push(t('details.lens'), exif.lens)
      push(t('details.iso'), exif.iso)
      push(t('details.aperture'), exif.aperture)
      push(t('details.shutter'), exif.shutter)
      push(t('details.focalLength'), exif.focalLength)
      push(t('details.takenAt'), renderTakenAt(exif.takenAt))
      push(t('details.software'), exif.software)
      push(t('details.orientation'), exif.orientation)
      if (exif.gps) {
        out.push({
          label: (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {t('details.gps')}
            </span>
          ),
          value: (
            <span>
              <span>{exif.gps.formatted}</span>
              <span className="mt-1 block text-xs font-normal opacity-80">
                {t('details.gpsWarning')}
              </span>
            </span>
          ),
          tone: 'danger',
        })
      }
      return out
    },
    [renderTakenAt, t],
  )

  const statusLabel = (status: ParseStatus): string => {
    switch (status) {
      case 'loading':
        return t('list.status.loading')
      case 'with-exif':
        return t('list.status.withExif')
      case 'without-exif':
        return t('list.status.withoutExif')
      case 'failed':
      default:
        return t('list.status.failed')
    }
  }

  const statusClass = (status: ParseStatus): string => {
    switch (status) {
      case 'with-exif':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200'
      case 'without-exif':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200'
      case 'failed':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200'
      case 'loading':
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200'
    }
  }

  return (
    <div className="relative min-h-[60vh]">
      <ParticlesBackground preset="minimal" className="absolute inset-0" />
      <div className="relative z-10 space-y-6">
        <PageHero title={t('title')} description={t('description')} />

        <NoticeCard
          tone="info"
          icon={ShieldCheck}
          title={t('notice.title')}
          description={t('notice.description')}
        />

        <Card>
          <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
            {t('upload.heading')}
          </h2>
          <div
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onClick={onPickClick}
            className={[
              'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors',
              dragOver
                ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/30'
                : 'border-gray-300 dark:border-gray-700 hover:border-sky-400 hover:bg-sky-50/40 dark:hover:bg-sky-950/20',
            ].join(' ')}
          >
            <ImagePlus className="h-8 w-8 text-sky-500" />
            <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
              {t('upload.drop')}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{t('upload.hint')}</div>
            <input
              ref={inputRef}
              type="file"
              multiple
              accept={ACCEPTED_TYPES}
              className="hidden"
              onChange={onPickChange}
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {errors.length ? (
            <ul className="mt-3 space-y-1 text-sm text-rose-600 dark:text-rose-400">
              {errors.slice(-5).map((msg, i) => (
                <li key={`${i}-${msg}`}>- {msg}</li>
              ))}
            </ul>
          ) : null}
        </Card>

        <Card>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t('list.heading')}{' '}
              <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                ({items.length})
              </span>
            </h2>
            <div className="flex flex-wrap gap-2">
              <Button onClick={downloadAll} disabled={!items.length || batchBusy}>
                <span className="inline-flex items-center gap-1.5">
                  <Download className="h-4 w-4" />
                  {batchBusy ? t('batch.preparing') : t('batch.downloadAll')}
                </span>
              </Button>
              <Button variant="secondary" onClick={clearAll} disabled={!items.length}>
                <span className="inline-flex items-center gap-1.5">
                  <Trash2 className="h-4 w-4" />
                  {t('batch.clearAll')}
                </span>
              </Button>
            </div>
          </div>

          {items.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-700 p-6 text-center text-sm text-gray-500 dark:text-gray-400">
              {t('list.empty')}
            </div>
          ) : (
            <ul className="space-y-3">
              {items.map((item) => {
                const detailItems = buildDetailItems(item.exif)
                return (
                  <li
                    key={item.id}
                    className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900/40"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <img
                        src={item.previewUrl}
                        alt={item.file.name}
                        className="h-20 w-20 flex-shrink-0 rounded-lg object-cover ring-1 ring-gray-200 dark:ring-gray-700"
                        loading="lazy"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {item.file.name}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <span>{t('list.size')}: {formatBytes(item.file.size)}</span>
                          <span
                            className={[
                              'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium',
                              statusClass(item.status),
                            ].join(' ')}
                          >
                            {statusLabel(item.status)}
                          </span>
                          {item.exif?.gps ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-medium text-rose-800 dark:bg-rose-900/40 dark:text-rose-200">
                              <MapPin className="h-3 w-3" />
                              GPS
                            </span>
                          ) : null}
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          variant="secondary"
                          onClick={() => toggleDetails(item.id)}
                          disabled={item.status === 'loading'}
                        >
                          <span className="inline-flex items-center gap-1.5">
                            {item.expanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                            {item.expanded ? t('list.actions.hideDetails') : t('list.actions.details')}
                          </span>
                        </Button>
                        <Button onClick={() => void downloadOne(item)} disabled={item.downloading}>
                          <span className="inline-flex items-center gap-1.5">
                            <Download className="h-4 w-4" />
                            {item.downloading ? t('list.actions.downloading') : t('list.actions.download')}
                          </span>
                        </Button>
                        <Button variant="secondary" onClick={() => removeItem(item.id)}>
                          <span className="inline-flex items-center gap-1.5">
                            <Trash2 className="h-4 w-4" />
                            {t('list.actions.remove')}
                          </span>
                        </Button>
                      </div>
                    </div>

                    {item.expanded ? (
                      <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
                        {detailItems.length ? (
                          <PropertyGrid items={detailItems} />
                        ) : (
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {t('details.empty')}
                          </div>
                        )}
                      </div>
                    ) : null}
                  </li>
                )
              })}
            </ul>
          )}
        </Card>
      </div>
    </div>
  )
}

export default ExifCleaner
