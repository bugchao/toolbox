import React, { useCallback, useMemo, useRef, useState } from 'react'
import {
  FileCheck2,
  Upload,
  Copy,
  Check,
  X,
  Loader2,
  ShieldCheck,
  ShieldX,
  Trash2,
  Download,
  Info,
} from 'lucide-react'
import { PageHero } from '@toolbox/ui-kit'
import { useTranslation } from 'react-i18next'

import {
  ALGOS,
  computeHashes,
  detectAlgo,
  formatSize,
  type HashAlgo,
} from './hashUtils'

const NAMESPACE = 'toolFileHashCheck'

interface FileEntry {
  id: string
  name: string
  size: number
  status: 'pending' | 'hashing' | 'done' | 'error'
  hashes?: Record<HashAlgo, string>
  error?: string
}

const FileHashCheck: React.FC = () => {
  const { t } = useTranslation(NAMESPACE)

  const [entries, setEntries] = useState<FileEntry[]>([])
  const [expected, setExpected] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const expectedNormalized = useMemo(() => expected.trim().toLowerCase(), [expected])
  const expectedAlgo = useMemo(() => detectAlgo(expectedNormalized), [expectedNormalized])

  const processFiles = useCallback(async (files: File[]) => {
    const newEntries: FileEntry[] = files.map((f) => ({
      id: `f-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: f.name,
      size: f.size,
      status: 'hashing',
    }))
    setEntries((prev) => [...newEntries, ...prev])

    // 串行处理（避免大文件并发 OOM）
    for (let i = 0; i < files.length; i++) {
      const entry = newEntries[i]
      const file = files[i]
      try {
        const buf = await file.arrayBuffer()
        const hashes = await computeHashes(buf)
        setEntries((prev) =>
          prev.map((e) => (e.id === entry.id ? { ...e, status: 'done', hashes } : e)),
        )
      } catch (err) {
        setEntries((prev) =>
          prev.map((e) =>
            e.id === entry.id
              ? { ...e, status: 'error', error: (err as Error).message || 'Failed' }
              : e,
          ),
        )
      }
    }
  }, [])

  const onSelectFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (files.length > 0) void processFiles(files)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(false)
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) void processFiles(files)
  }

  const removeEntry = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id))
  }
  const clearAll = () => setEntries([])

  const copyHash = async (id: string, algo: HashAlgo, hash: string) => {
    try {
      await navigator.clipboard.writeText(hash)
      setCopiedId(`${id}:${algo}`)
      setTimeout(() => setCopiedId(null), 1500)
    } catch {
      /* ignore */
    }
  }

  const downloadAll = () => {
    if (entries.length === 0) return
    const lines: string[] = []
    for (const e of entries) {
      if (e.status !== 'done' || !e.hashes) continue
      lines.push(`# ${e.name}  (${formatSize(e.size)})`)
      for (const a of ALGOS) lines.push(`${a.padEnd(8)} ${e.hashes[a]}`)
      lines.push('')
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `file-hashes-${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="w-full space-y-6 pb-24">
      <PageHero title={t('title')} description={t('description')} />

      <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2 flex items-start gap-2">
        <Info className="w-4 h-4 mt-0.5 shrink-0" />
        <span>{t('disclaimer')}</span>
      </div>

      {/* Drop zone */}
      <section
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${
          dragOver
            ? 'border-indigo-500 bg-indigo-50'
            : 'border-gray-300 bg-white hover:border-gray-400'
        }`}
      >
        <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-700 mb-2">{t('drop.hint')}</p>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          {t('drop.choose')}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={onSelectFiles}
          className="hidden"
        />
      </section>

      {/* Expected hash compare */}
      <section className="rounded-lg border border-gray-200 bg-white p-4 space-y-2">
        <label className="text-sm font-medium text-gray-700 block">
          {t('compare.label')}
          <span className="ml-2 text-xs text-gray-400">{t('compare.hint')}</span>
        </label>
        <input
          type="text"
          value={expected}
          onChange={(e) => setExpected(e.target.value)}
          placeholder={t('compare.placeholder')}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
          spellCheck={false}
        />
        {expected.trim() && (
          <div className="text-xs text-gray-500">
            {expectedAlgo ? (
              <span className="text-emerald-700">
                {t('compare.detected', { algo: expectedAlgo })}
              </span>
            ) : (
              <span className="text-amber-700">{t('compare.unknown')}</span>
            )}
          </div>
        )}
      </section>

      {/* File entries */}
      {entries.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-800">
              {t('entries.title')} ({entries.length})
            </h3>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={downloadAll}
                disabled={!entries.some((e) => e.status === 'done')}
                className="px-2 py-1 text-xs text-gray-700 hover:text-indigo-600 border border-gray-200 rounded hover:border-indigo-300 disabled:opacity-40 transition-colors flex items-center gap-1"
              >
                <Download className="w-3 h-3" />
                {t('entries.downloadAll')}
              </button>
              <button
                type="button"
                onClick={clearAll}
                className="px-2 py-1 text-xs text-gray-500 hover:text-red-600 border border-gray-200 rounded hover:border-red-300 transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                {t('entries.clearAll')}
              </button>
            </div>
          </div>
          <div className="space-y-3">
            {entries.map((e) => (
              <FileRow
                key={e.id}
                entry={e}
                expectedHash={expectedNormalized}
                expectedAlgo={expectedAlgo}
                onCopy={copyHash}
                onRemove={() => removeEntry(e.id)}
                copiedKey={copiedId}
                t={t}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

interface FileRowProps {
  entry: FileEntry
  expectedHash: string
  expectedAlgo: HashAlgo | null
  onCopy: (id: string, algo: HashAlgo, hash: string) => void
  onRemove: () => void
  copiedKey: string | null
  t: (k: string, opts?: Record<string, unknown>) => string
}
const FileRow: React.FC<FileRowProps> = ({
  entry,
  expectedHash,
  expectedAlgo,
  onCopy,
  onRemove,
  copiedKey,
  t,
}) => {
  // 命中状态：若提供了 expectedHash 且该行的算法 hash 相符
  const matchedAlgo: HashAlgo | null = useMemo(() => {
    if (!expectedHash || !expectedAlgo || !entry.hashes) return null
    return entry.hashes[expectedAlgo]?.toLowerCase() === expectedHash ? expectedAlgo : null
  }, [expectedHash, expectedAlgo, entry.hashes])

  const mismatchAlgo: HashAlgo | null = useMemo(() => {
    if (!expectedHash || !expectedAlgo || !entry.hashes) return null
    return entry.hashes[expectedAlgo]?.toLowerCase() !== expectedHash ? expectedAlgo : null
  }, [expectedHash, expectedAlgo, entry.hashes])

  return (
    <div
      className={`rounded-lg border bg-white p-3 ${
        matchedAlgo
          ? 'border-emerald-300 bg-emerald-50/40'
          : mismatchAlgo
            ? 'border-red-300 bg-red-50/40'
            : 'border-gray-200'
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        <FileCheck2 className="w-4 h-4 text-indigo-500 shrink-0" />
        <span className="text-sm font-medium text-gray-800 truncate flex-1" title={entry.name}>
          {entry.name}
        </span>
        <span className="text-xs text-gray-400 shrink-0">{formatSize(entry.size)}</span>
        {entry.status === 'hashing' && (
          <Loader2 className="w-4 h-4 text-gray-400 animate-spin shrink-0" />
        )}
        {matchedAlgo && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-emerald-100 text-emerald-700 border border-emerald-300">
            <ShieldCheck className="w-3 h-3" />
            {t('row.matched', { algo: matchedAlgo })}
          </span>
        )}
        {mismatchAlgo && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-700 border border-red-300">
            <ShieldX className="w-3 h-3" />
            {t('row.mismatch', { algo: mismatchAlgo })}
          </span>
        )}
        <button
          type="button"
          onClick={onRemove}
          className="text-gray-400 hover:text-red-500 shrink-0"
          title={t('row.remove')}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {entry.status === 'error' && (
        <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded px-2 py-1">
          {entry.error}
        </div>
      )}

      {entry.status === 'done' && entry.hashes && (
        <div className="grid grid-cols-1 gap-1 font-mono text-xs">
          {ALGOS.map((a) => {
            const hash = entry.hashes![a]
            const isMatched = matchedAlgo === a
            const isMismatched = mismatchAlgo === a
            const copyKey = `${entry.id}:${a}`
            return (
              <div
                key={a}
                className={`flex items-center gap-2 px-2 py-1 rounded ${
                  isMatched
                    ? 'bg-emerald-100/60'
                    : isMismatched
                      ? 'bg-red-100/60'
                      : 'hover:bg-gray-50'
                }`}
              >
                <span className="text-gray-500 w-16 shrink-0">{a}</span>
                <span className="flex-1 break-all text-gray-800">{hash}</span>
                <button
                  type="button"
                  onClick={() => onCopy(entry.id, a, hash)}
                  className="text-gray-400 hover:text-indigo-600 shrink-0"
                  title={t('row.copy')}
                >
                  {copiedKey === copyKey ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default FileHashCheck
