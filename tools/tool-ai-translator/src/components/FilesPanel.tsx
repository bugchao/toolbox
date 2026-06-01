import React, { useCallback, useRef, useState } from 'react'
import { Button } from '@toolbox/ui-kit'
import { useTranslation } from 'react-i18next'
import {
  Archive,
  Download,
  FileText,
  Loader2,
  Square,
  Trash2,
  Upload,
} from 'lucide-react'
import { runBatch, type FileJob, type FileResult, type FileStatus } from '../lib/batch'

type Props = {
  /** 父组件提供的翻译入口：内部已绑定 provider / 模型 / 语种 / WebLLM 初始化 */
  translateChunk: (text: string, signal?: AbortSignal) => Promise<string>
}

const ACCEPT = '.txt,.md,.markdown,.mdx,text/plain,text/markdown'
const MAX_BYTES = 2 * 1024 * 1024 // 单文件 2 MB 上限

type UiFile = FileJob & {
  status: FileStatus
  progress: { done: number; total: number }
  translatedContent?: string
  failedChunks: number
  error?: string
}

function fmtSize(n: number): string {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / 1024 / 1024).toFixed(2)} MB`
}

function genId(): string {
  return `f${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}

function deriveOutputName(name: string): string {
  // foo.md -> foo.translated.md ；无扩展则 foo.translated.txt
  const m = name.match(/^(.+?)(\.[^./\\]+)$/)
  if (!m) return `${name}.translated.txt`
  return `${m[1]}.translated${m[2]}`
}

function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 0)
}

const FilesPanel: React.FC<Props> = ({ translateChunk }) => {
  const { t } = useTranslation('toolAiTranslator')
  const [files, setFiles] = useState<UiFile[]>([])
  const [busy, setBusy] = useState(false)
  const [skipped, setSkipped] = useState<string[]>([])
  const abortRef = useRef<AbortController | null>(null)

  const handleFiles = useCallback(async (list: FileList | null) => {
    if (!list) return
    const skip: string[] = []
    const accepted: File[] = []
    for (const f of Array.from(list)) {
      const lower = f.name.toLowerCase()
      const okExt = /\.(txt|md|markdown|mdx)$/i.test(lower)
      const okType = !f.type || f.type.startsWith('text/')
      if (!okExt && !okType) {
        skip.push(f.name)
        continue
      }
      if (f.size > MAX_BYTES) {
        skip.push(`${f.name} (>2MB)`)
        continue
      }
      accepted.push(f)
    }
    setSkipped(skip)
    if (accepted.length === 0) return

    const next: UiFile[] = []
    for (const f of accepted) {
      try {
        const content = await f.text()
        next.push({
          id: genId(),
          name: f.name,
          size: f.size,
          content,
          status: 'pending',
          progress: { done: 0, total: 0 },
          failedChunks: 0,
        })
      } catch {
        skip.push(`${f.name} (read failed)`)
      }
    }
    setFiles((cur) => [...cur, ...next])
    if (skip.length > 0) setSkipped((cur) => [...cur, ...skip])
  }, [])

  const onRemove = (id: string) => {
    setFiles((cur) => cur.filter((f) => f.id !== id))
  }

  const onClear = () => {
    setFiles([])
    setSkipped([])
  }

  const onStop = () => {
    abortRef.current?.abort()
    abortRef.current = null
    setBusy(false)
  }

  const onTranslateAll = async () => {
    const pending = files.filter((f) => f.status === 'pending' || f.status === 'failed' || f.status === 'canceled')
    if (pending.length === 0) return
    setBusy(true)
    const ctrl = new AbortController()
    abortRef.current = ctrl

    // 把要处理的标 running
    setFiles((cur) => cur.map((f) => (pending.find((p) => p.id === f.id) ? { ...f, status: 'running' as const, progress: { done: 0, total: 0 }, failedChunks: 0 } : f)))

    try {
      const result = await runBatch({
        files: pending.map((p) => ({ id: p.id, name: p.name, size: p.size, content: p.content })),
        translateChunk,
        signal: ctrl.signal,
        events: {
          onFileStart: (id) => {
            setFiles((cur) => cur.map((f) => (f.id === id ? { ...f, status: 'running' } : f)))
          },
          onFileProgress: (id, done, total) => {
            setFiles((cur) => cur.map((f) => (f.id === id ? { ...f, progress: { done, total } } : f)))
          },
          onFileDone: (id, r: FileResult) => {
            setFiles((cur) => cur.map((f) => (f.id === id ? { ...f, ...r } : f)))
          },
        },
      })
      // 兜底：合并 result（事件已经覆盖了大多数）
      setFiles((cur) => cur.map((f) => (result[f.id] ? { ...f, ...result[f.id] } : f)))
    } finally {
      if (abortRef.current === ctrl) abortRef.current = null
      setBusy(false)
    }
  }

  const downloadOne = (f: UiFile) => {
    if (!f.translatedContent) return
    downloadBlob(new Blob([f.translatedContent], { type: 'text/plain;charset=utf-8' }), deriveOutputName(f.name))
  }

  const downloadAll = async () => {
    const done = files.filter((f) => f.translatedContent)
    if (done.length === 0) return
    const { default: JSZip } = await import('jszip')
    const zip = new JSZip()
    for (const f of done) {
      zip.file(deriveOutputName(f.name), f.translatedContent ?? '')
    }
    const blob = await zip.generateAsync({ type: 'blob' })
    downloadBlob(blob, 'translations.zip')
  }

  const someDone = files.some((f) => f.translatedContent)
  const allDone = files.length > 0 && files.every((f) => f.status === 'done' || f.status === 'failed')

  return (
    <div className="space-y-4">
      <DropZone onFiles={(list) => handleFiles(list)} />

      {skipped.length > 0 && (
        <div className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
          {t('files.skipped', { n: skipped.length })}: {skipped.join(', ')}
        </div>
      )}

      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((f) => (
            <li key={f.id} className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="truncate text-sm font-medium text-gray-800 dark:text-gray-100">{f.name}</span>
                    <span className="text-[11px] text-gray-500 dark:text-gray-400">{fmtSize(f.size)}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
                    <StatusBadge status={f.status} failedChunks={f.failedChunks} />
                    {f.progress.total > 0 && (
                      <span>
                        {f.progress.done} / {f.progress.total}
                      </span>
                    )}
                  </div>
                  {f.progress.total > 0 && (
                    <div className="mt-1 h-1 w-full overflow-hidden rounded bg-gray-200 dark:bg-gray-700">
                      <div
                        className={[
                          'h-full transition-[width] duration-150',
                          f.status === 'failed' ? 'bg-rose-500' : f.status === 'canceled' ? 'bg-amber-500' : 'bg-indigo-500',
                        ].join(' ')}
                        style={{ width: `${Math.round((f.progress.done / Math.max(1, f.progress.total)) * 100)}%` }}
                      />
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {f.translatedContent && (
                    <button
                      type="button"
                      onClick={() => downloadOne(f)}
                      title={t('files.downloadOne')}
                      className="rounded p-1.5 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onRemove(f.id)}
                    disabled={busy && f.status === 'running'}
                    title={t('files.remove')}
                    className="rounded p-1.5 text-rose-600 hover:bg-rose-50 disabled:opacity-30 dark:text-rose-400 dark:hover:bg-rose-900/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {!busy ? (
          <Button onClick={onTranslateAll} disabled={files.length === 0}>
            <span className="inline-flex items-center gap-1.5">
              <Upload className="h-4 w-4" />
              {t('files.translateAll')}
            </span>
          </Button>
        ) : (
          <Button onClick={onStop} variant="secondary">
            <span className="inline-flex items-center gap-1.5">
              <Square className="h-4 w-4" />
              {t('files.stop')}
            </span>
          </Button>
        )}
        <Button onClick={downloadAll} variant="ghost" disabled={!someDone}>
          <span className="inline-flex items-center gap-1.5">
            <Archive className="h-4 w-4" />
            {t('files.downloadZip')}
          </span>
        </Button>
        <Button onClick={onClear} variant="ghost" disabled={files.length === 0 || busy}>
          <span className="inline-flex items-center gap-1.5">
            <Trash2 className="h-4 w-4" />
            {t('files.clear')}
          </span>
        </Button>
        {busy && (
          <span className="inline-flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            {t('files.translating')}
          </span>
        )}
        {allDone && !busy && (
          <span className="text-xs text-emerald-600 dark:text-emerald-400">{t('files.allDone')}</span>
        )}
      </div>
    </div>
  )
}

const StatusBadge: React.FC<{ status: FileStatus; failedChunks: number }> = ({ status, failedChunks }) => {
  const { t } = useTranslation('toolAiTranslator')
  const map: Record<FileStatus, string> = {
    pending: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    running: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
    done: failedChunks > 0
      ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
    failed: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
    canceled: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  }
  const label = status === 'done' && failedChunks > 0
    ? t('files.status.donePartial', { n: failedChunks })
    : t(`files.status.${status}`)
  return <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${map[status]}`}>{label}</span>
}

const DropZone: React.FC<{ onFiles: (l: FileList | null) => void }> = ({ onFiles }) => {
  const { t } = useTranslation('toolAiTranslator')
  return (
    <label
      htmlFor="ai-translator-file-input"
      onDrop={(e) => {
        e.preventDefault()
        onFiles(e.dataTransfer.files)
      }}
      onDragOver={(e) => e.preventDefault()}
      className="flex h-36 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-indigo-300 bg-indigo-50/50 text-center transition-colors hover:border-indigo-400 hover:bg-indigo-50 dark:border-indigo-700 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/30"
    >
      <Upload className="mb-2 h-7 w-7 text-indigo-500" />
      <span className="font-medium text-indigo-700 dark:text-indigo-200">{t('files.dropCta')}</span>
      <span className="mt-1 text-xs text-indigo-500/80 dark:text-indigo-300/80">{t('files.dropHint')}</span>
      <input
        id="ai-translator-file-input"
        type="file"
        accept={ACCEPT}
        multiple
        className="hidden"
        onChange={(e) => onFiles(e.target.files)}
      />
    </label>
  )
}

export default FilesPanel
