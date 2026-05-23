import React, { useMemo, useRef, useState } from 'react'
import {
  SplitSquareHorizontal,
  Combine,
  Upload,
  Download,
  X,
  ArrowUp,
  ArrowDown,
  Loader2,
  FileIcon,
  Info,
  Package,
} from 'lucide-react'
import { PageHero } from '@toolbox/ui-kit'
import { useTranslation } from 'react-i18next'
import JSZip from 'jszip'

const NAMESPACE = 'toolFileSplitter'

type Mode = 'split' | 'merge'
type SplitMode = 'size' | 'count'
type SizeUnit = 'KB' | 'MB' | 'GB'

const UNIT_BYTES: Record<SizeUnit, number> = {
  KB: 1024,
  MB: 1024 * 1024,
  GB: 1024 * 1024 * 1024,
}

function fmtSize(b: number): string {
  if (b < 1024) return `${b} B`
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`
  if (b < 1024 * 1024 * 1024) return `${(b / 1024 / 1024).toFixed(1)} MB`
  return `${(b / 1024 / 1024 / 1024).toFixed(2)} GB`
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

const FileSplitter: React.FC = () => {
  const { t } = useTranslation(NAMESPACE)
  const [mode, setMode] = useState<Mode>('split')

  return (
    <div className="w-full space-y-6 pb-24">
      <PageHero title={t('title')} description={t('description')} />

      <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2 flex items-start gap-2">
        <Info className="w-4 h-4 mt-0.5 shrink-0" />
        <span>{t('disclaimer')}</span>
      </div>

      {/* Mode tabs */}
      <div className="grid grid-cols-2 border border-gray-300 rounded-md overflow-hidden">
        <button
          type="button"
          onClick={() => setMode('split')}
          className={`px-4 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
            mode === 'split'
              ? 'bg-indigo-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          <SplitSquareHorizontal className="w-4 h-4" />
          {t('tab.split')}
        </button>
        <button
          type="button"
          onClick={() => setMode('merge')}
          className={`px-4 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
            mode === 'merge'
              ? 'bg-emerald-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Combine className="w-4 h-4" />
          {t('tab.merge')}
        </button>
      </div>

      {mode === 'split' ? <SplitPanel t={t} /> : <MergePanel t={t} />}
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// 分割面板
// ─────────────────────────────────────────────────────────
const SplitPanel: React.FC<{ t: (k: string, opts?: Record<string, unknown>) => string }> = ({
  t,
}) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [splitMode, setSplitMode] = useState<SplitMode>('size')
  const [size, setSize] = useState<number>(10)
  const [unit, setUnit] = useState<SizeUnit>('MB')
  const [count, setCount] = useState<number>(5)
  const [busy, setBusy] = useState(false)

  const partSize = useMemo(() => {
    if (!file) return 0
    if (splitMode === 'size') return Math.max(1, Math.floor(size * UNIT_BYTES[unit]))
    return Math.ceil(file.size / Math.max(1, count))
  }, [file, splitMode, size, unit, count])

  const numParts = useMemo(() => {
    if (!file || partSize <= 0) return 0
    return Math.ceil(file.size / partSize)
  }, [file, partSize])

  const partPreview = useMemo(() => {
    if (!file || numParts === 0) return []
    const pad = Math.max(3, String(numParts).length)
    const items: { name: string; size: number }[] = []
    for (let i = 0; i < numParts; i++) {
      const start = i * partSize
      const end = Math.min(start + partSize, file.size)
      items.push({
        name: `${file.name}.${String(i + 1).padStart(pad, '0')}`,
        size: end - start,
      })
    }
    return items
  }, [file, numParts, partSize])

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) setFile(f)
    if (inputRef.current) inputRef.current.value = ''
  }

  const performSplit = async (packZip: boolean) => {
    if (!file || numParts === 0) return
    setBusy(true)
    try {
      const pad = Math.max(3, String(numParts).length)
      if (packZip) {
        const zip = new JSZip()
        for (let i = 0; i < numParts; i++) {
          const start = i * partSize
          const end = Math.min(start + partSize, file.size)
          const slice = file.slice(start, end)
          zip.file(`${file.name}.${String(i + 1).padStart(pad, '0')}`, slice)
        }
        const blob = await zip.generateAsync({ type: 'blob' })
        downloadBlob(blob, `${file.name}.parts.zip`)
      } else {
        // 逐个下载（浏览器可能弹多次"允许下载"提示）
        for (let i = 0; i < numParts; i++) {
          const start = i * partSize
          const end = Math.min(start + partSize, file.size)
          const slice = file.slice(start, end)
          downloadBlob(slice, `${file.name}.${String(i + 1).padStart(pad, '0')}`)
          // 给浏览器些喘息时间
          await new Promise((r) => setTimeout(r, 80))
        }
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="space-y-4">
      {!file ? (
        <div
          onClick={() => inputRef.current?.click()}
          className="rounded-2xl border-2 border-dashed border-gray-300 bg-white p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
        >
          <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-700">{t('split.choose')}</p>
          <input ref={inputRef} type="file" onChange={onSelectFile} className="hidden" />
        </div>
      ) : (
        <>
          <div className="rounded-lg border border-gray-200 bg-white p-3 flex items-center gap-2">
            <FileIcon className="w-4 h-4 text-indigo-500 shrink-0" />
            <span className="text-sm font-medium text-gray-800 truncate flex-1" title={file.name}>
              {file.name}
            </span>
            <span className="text-xs text-gray-400">{fmtSize(file.size)}</span>
            <button
              type="button"
              onClick={() => setFile(null)}
              className="text-gray-400 hover:text-red-500"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-700">{t('split.modeLabel')}:</span>
              <label className="inline-flex items-center gap-1 text-sm">
                <input
                  type="radio"
                  checked={splitMode === 'size'}
                  onChange={() => setSplitMode('size')}
                />
                {t('split.bySize')}
              </label>
              <label className="inline-flex items-center gap-1 text-sm">
                <input
                  type="radio"
                  checked={splitMode === 'count'}
                  onChange={() => setSplitMode('count')}
                />
                {t('split.byCount')}
              </label>
            </div>

            {splitMode === 'size' ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">{t('split.partSize')}:</span>
                <input
                  type="number"
                  min={1}
                  value={size}
                  onChange={(e) => setSize(Math.max(1, Number(e.target.value) || 1))}
                  className="w-24 px-2 py-1.5 text-sm border border-gray-300 rounded-md font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value as SizeUnit)}
                  className="px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="KB">KB</option>
                  <option value="MB">MB</option>
                  <option value="GB">GB</option>
                </select>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">{t('split.partCount')}:</span>
                <input
                  type="number"
                  min={2}
                  max={1000}
                  value={count}
                  onChange={(e) => setCount(Math.max(2, Math.min(1000, Number(e.target.value) || 2)))}
                  className="w-24 px-2 py-1.5 text-sm border border-gray-300 rounded-md font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}

            <div className="text-xs text-gray-500">
              {t('split.preview', {
                count: numParts,
                each: fmtSize(partSize),
                last: numParts > 1 ? fmtSize(file.size - partSize * (numParts - 1)) : '',
              })}
            </div>
          </div>

          {/* Parts preview */}
          {partPreview.length > 0 && (
            <div className="rounded-lg border border-gray-200 bg-white p-3 max-h-48 overflow-y-auto">
              <div className="text-xs text-gray-500 mb-2">{t('split.partsList')}:</div>
              <ul className="space-y-0.5 text-xs font-mono">
                {partPreview.slice(0, 30).map((p, i) => (
                  <li key={i} className="flex items-center gap-2 text-gray-700">
                    <span className="flex-1 truncate">{p.name}</span>
                    <span className="text-gray-400 shrink-0">{fmtSize(p.size)}</span>
                  </li>
                ))}
                {partPreview.length > 30 && (
                  <li className="text-gray-400 italic">
                    … {t('split.morePartsHidden', { n: partPreview.length - 30 })}
                  </li>
                )}
              </ul>
            </div>
          )}

          <div className="flex gap-2 justify-center">
            <button
              type="button"
              onClick={() => performSplit(true)}
              disabled={busy || numParts === 0}
              className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-300 transition-colors flex items-center gap-2"
            >
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Package className="w-4 h-4" />}
              {t('split.downloadZip')}
            </button>
            <button
              type="button"
              onClick={() => performSplit(false)}
              disabled={busy || numParts === 0}
              className="px-4 py-2 text-sm font-medium bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              {t('split.downloadEach')}
            </button>
          </div>
        </>
      )}
    </section>
  )
}

// ─────────────────────────────────────────────────────────
// 合并面板
// ─────────────────────────────────────────────────────────
const MergePanel: React.FC<{ t: (k: string, opts?: Record<string, unknown>) => string }> = ({
  t,
}) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState<File[]>([])
  const [outputName, setOutputName] = useState('')
  const [busy, setBusy] = useState(false)

  const onSelectFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const arr = Array.from(e.target.files ?? [])
    if (arr.length === 0) return
    // 自动按文件名排序
    arr.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
    setFiles((prev) => {
      const next = [...prev, ...arr]
      next.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
      return next
    })
    // 自动猜测输出名：去掉 .NNN 或 .partNN 后缀
    if (!outputName && arr.length > 0) {
      const m = arr[0].name.match(/^(.*?)\.\d+$/) || arr[0].name.match(/^(.*?)\.part\d+$/i)
      if (m) setOutputName(m[1])
      else setOutputName(arr[0].name + '.merged')
    }
    if (inputRef.current) inputRef.current.value = ''
  }

  const move = (idx: number, dir: -1 | 1) => {
    const target = idx + dir
    if (target < 0 || target >= files.length) return
    const next = [...files]
    ;[next[idx], next[target]] = [next[target], next[idx]]
    setFiles(next)
  }
  const remove = (idx: number) => setFiles((prev) => prev.filter((_, i) => i !== idx))

  const totalSize = useMemo(() => files.reduce((s, f) => s + f.size, 0), [files])

  const performMerge = () => {
    if (files.length === 0) return
    setBusy(true)
    try {
      const blob = new Blob(files, { type: 'application/octet-stream' })
      downloadBlob(blob, outputName || 'merged')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="space-y-4">
      <div
        onClick={() => inputRef.current?.click()}
        className="rounded-2xl border-2 border-dashed border-gray-300 bg-white p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
      >
        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-700">{t('merge.choose')}</p>
        <p className="text-xs text-gray-400 mt-1">{t('merge.tip')}</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          onChange={onSelectFiles}
          className="hidden"
        />
      </div>

      {files.length > 0 && (
        <>
          <div className="rounded-lg border border-gray-200 bg-white p-3 space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{t('merge.partsTitle', { count: files.length, size: fmtSize(totalSize) })}</span>
              <button
                type="button"
                onClick={() => setFiles([])}
                className="text-gray-500 hover:text-red-600"
              >
                {t('merge.clearAll')}
              </button>
            </div>
            <ul className="divide-y divide-gray-100">
              {files.map((f, i) => (
                <li key={`${f.name}-${i}`} className="py-1.5 flex items-center gap-2 text-sm">
                  <span className="text-xs text-gray-400 w-8 shrink-0">#{i + 1}</span>
                  <span className="flex-1 truncate font-mono text-xs" title={f.name}>
                    {f.name}
                  </span>
                  <span className="text-xs text-gray-400 shrink-0">{fmtSize(f.size)}</span>
                  <button
                    type="button"
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    className="p-0.5 text-gray-400 hover:text-gray-700 disabled:opacity-30"
                  >
                    <ArrowUp className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, 1)}
                    disabled={i === files.length - 1}
                    className="p-0.5 text-gray-400 hover:text-gray-700 disabled:opacity-30"
                  >
                    <ArrowDown className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    className="p-0.5 text-gray-400 hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-3 space-y-2">
            <label className="text-xs text-gray-500 block">{t('merge.outputName')}</label>
            <input
              type="text"
              value={outputName}
              onChange={(e) => setOutputName(e.target.value)}
              placeholder="merged-file.ext"
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={performMerge}
              disabled={busy || files.length === 0 || !outputName.trim()}
              className="px-5 py-2.5 text-sm font-medium bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:bg-gray-300 transition-colors flex items-center gap-2"
            >
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Combine className="w-4 h-4" />}
              {t('merge.run')}
            </button>
          </div>
        </>
      )}
    </section>
  )
}

export default FileSplitter
