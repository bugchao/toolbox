import React, { useCallback, useMemo, useRef, useState } from 'react'
import {
  Upload,
  Copy as CopyIcon,
  Loader2,
  Trash2,
  Download,
  ChevronDown,
  FileCheck2,
  Info,
  Star,
} from 'lucide-react'
import { PageHero } from '@toolbox/ui-kit'
import { useTranslation } from 'react-i18next'

const NAMESPACE = 'toolDuplicateFinder'

interface FileEntry {
  id: string
  file: File
  name: string
  size: number
  hash: string | null // null = not hashed (size-unique)
  status: 'idle' | 'hashing' | 'done' | 'error'
}

interface DupGroup {
  hash: string
  files: FileEntry[]
}

function fmtSize(b: number): string {
  if (b < 1024) return `${b} B`
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`
  if (b < 1024 * 1024 * 1024) return `${(b / 1024 / 1024).toFixed(1)} MB`
  return `${(b / 1024 / 1024 / 1024).toFixed(2)} GB`
}

function bytesToHex(buf: ArrayBuffer): string {
  const arr = new Uint8Array(buf)
  let s = ''
  for (let i = 0; i < arr.length; i++) s += arr[i].toString(16).padStart(2, '0')
  return s
}

const DuplicateFinder: React.FC = () => {
  const { t } = useTranslation(NAMESPACE)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [entries, setEntries] = useState<FileEntry[]>([])
  const [keepIds, setKeepIds] = useState<Record<string, string>>({}) // hash -> keep id
  const [uniqueOpen, setUniqueOpen] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  // ── 分组 + 派生统计 ──
  interface Analysis {
    duplicateGroups: DupGroup[]
    uniqueEntries: FileEntry[]
    hashingCount: number
    duplicateTotalSize: number
    duplicateRedundantSize: number // 每组只保留一份，剩余可释放的空间
  }
  const analysis: Analysis = useMemo(() => {
    const byHash = new Map<string, FileEntry[]>()
    const noHash: FileEntry[] = []
    let hashingCount = 0
    for (const e of entries) {
      if (e.status === 'hashing') hashingCount++
      if (e.hash) {
        const arr = byHash.get(e.hash) ?? []
        arr.push(e)
        byHash.set(e.hash, arr)
      } else {
        noHash.push(e)
      }
    }
    const duplicateGroups: DupGroup[] = []
    const hashUniqueEntries: FileEntry[] = []
    for (const [hash, files] of byHash.entries()) {
      if (files.length >= 2) {
        duplicateGroups.push({ hash, files })
      } else {
        hashUniqueEntries.push(files[0])
      }
    }
    // 按"可释放空间"降序
    duplicateGroups.sort((a, b) => {
      const wasteA = a.files[0].size * (a.files.length - 1)
      const wasteB = b.files[0].size * (b.files.length - 1)
      return wasteB - wasteA
    })

    let dupTotal = 0
    let dupRedundant = 0
    for (const g of duplicateGroups) {
      dupTotal += g.files.reduce((s, f) => s + f.size, 0)
      dupRedundant += g.files[0].size * (g.files.length - 1)
    }

    return {
      duplicateGroups,
      uniqueEntries: [...noHash, ...hashUniqueEntries],
      hashingCount,
      duplicateTotalSize: dupTotal,
      duplicateRedundantSize: dupRedundant,
    }
  }, [entries])

  // ── 添加文件 + 处理 ──
  const processFiles = useCallback(async (files: File[]) => {
    // 1) 加到 entries（status idle）
    const newEntries: FileEntry[] = files.map((f) => ({
      id: `f-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      file: f,
      name: f.webkitRelativePath || f.name,
      size: f.size,
      hash: null,
      status: 'idle',
    }))
    let acc: FileEntry[] = []
    setEntries((prev) => {
      acc = [...prev, ...newEntries]
      return acc
    })

    // 2) 按 size 分组——size 唯一的不算 hash
    // 这里基于 acc 而不是 entries（state 异步），避免重复 hash
    const sizeMap = new Map<number, FileEntry[]>()
    for (const e of acc) {
      const arr = sizeMap.get(e.size) ?? []
      arr.push(e)
      sizeMap.set(e.size, arr)
    }

    // 找需要 hash 的（同 size >=2 且当前 hash 还没算）
    const toHash: FileEntry[] = []
    for (const arr of sizeMap.values()) {
      if (arr.length >= 2) {
        for (const e of arr) {
          if (!e.hash && e.status !== 'done') toHash.push(e)
        }
      }
    }

    if (toHash.length === 0) return

    // 标记 hashing
    setEntries((prev) =>
      prev.map((e) => (toHash.some((t) => t.id === e.id) ? { ...e, status: 'hashing' } : e)),
    )

    // 并发 hash（限制并发数 6）
    const concurrency = 6
    let idx = 0
    const worker = async () => {
      while (idx < toHash.length) {
        const cur = toHash[idx++]
        try {
          const buf = await cur.file.arrayBuffer()
          const digest = await crypto.subtle.digest('SHA-256', buf)
          const hex = bytesToHex(digest)
          setEntries((prev) =>
            prev.map((e) => (e.id === cur.id ? { ...e, hash: hex, status: 'done' } : e)),
          )
        } catch (err) {
          setEntries((prev) =>
            prev.map((e) => (e.id === cur.id ? { ...e, status: 'error' } : e)),
          )
        }
      }
    }
    await Promise.all(Array.from({ length: Math.min(concurrency, toHash.length) }, worker))
  }, [])

  const onSelectFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (files.length > 0) void processFiles(files)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) void processFiles(files)
  }

  const removeEntry = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id))
  }
  const clearAll = () => {
    setEntries([])
    setKeepIds({})
  }

  const setKeep = (hash: string, id: string) => {
    setKeepIds((prev) => ({ ...prev, [hash]: id }))
  }

  const downloadFile = async (entry: FileEntry) => {
    const url = URL.createObjectURL(entry.file)
    const a = document.createElement('a')
    a.href = url
    a.download = entry.name
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportReport = () => {
    const rows: string[] = [
      ['file_name', 'size_bytes', 'sha256', 'duplicate_group', 'action'].join(','),
    ]
    let groupIndex = 0
    for (const g of analysis.duplicateGroups) {
      groupIndex++
      const keepId = keepIds[g.hash] ?? g.files[0].id
      for (const f of g.files) {
        const csv = (s: string) =>
          s.includes(',') || s.includes('"') || s.includes('\n')
            ? `"${s.replace(/"/g, '""')}"`
            : s
        rows.push(
          [
            csv(f.name),
            String(f.size),
            f.hash ?? '',
            String(groupIndex),
            f.id === keepId ? 'keep' : 'delete',
          ].join(','),
        )
      }
    }
    for (const u of analysis.uniqueEntries) {
      const csv = (s: string) =>
        s.includes(',') || s.includes('"') || s.includes('\n')
          ? `"${s.replace(/"/g, '""')}"`
          : s
      rows.push([csv(u.name), String(u.size), u.hash ?? '', '', 'keep'].join(','))
    }
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `duplicate-report-${Date.now()}.csv`
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

      {/* 拖拽区 */}
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
        <p className="text-sm text-gray-700 mb-1">{t('drop.hint')}</p>
        <p className="text-xs text-gray-400 mb-3">{t('drop.tip')}</p>
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

      {/* Stats */}
      {entries.length > 0 && (
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            label={t('stats.total')}
            value={String(entries.length)}
            color="text-gray-800"
          />
          <StatCard
            label={t('stats.dupGroups')}
            value={String(analysis.duplicateGroups.length)}
            color="text-rose-600"
          />
          <StatCard
            label={t('stats.canFree')}
            value={fmtSize(analysis.duplicateRedundantSize)}
            color="text-emerald-600"
          />
          <StatCard
            label={t('stats.hashing')}
            value={
              analysis.hashingCount > 0 ? (
                <span className="inline-flex items-center gap-1">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {analysis.hashingCount}
                </span>
              ) : (
                t('stats.done')
              )
            }
            color="text-indigo-600"
          />
        </section>
      )}

      {/* 重复组 */}
      {analysis.duplicateGroups.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-800">
              {t('groups.title')} ({analysis.duplicateGroups.length})
            </h3>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={exportReport}
                className="px-2 py-1 text-xs text-gray-700 hover:text-indigo-600 border border-gray-200 rounded hover:border-indigo-300 transition-colors flex items-center gap-1"
              >
                <Download className="w-3 h-3" />
                {t('groups.exportCsv')}
              </button>
              <button
                type="button"
                onClick={clearAll}
                className="px-2 py-1 text-xs text-gray-500 hover:text-red-600 border border-gray-200 rounded hover:border-red-300 transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                {t('groups.clearAll')}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            {analysis.duplicateGroups.map((g, idx) => {
              const keepId = keepIds[g.hash] ?? g.files[0].id
              const waste = g.files[0].size * (g.files.length - 1)
              return (
                <div
                  key={g.hash}
                  className="rounded-lg border border-rose-200 bg-rose-50/30 p-3"
                >
                  <div className="flex items-center gap-2 mb-2 text-sm">
                    <span className="text-rose-700 font-semibold">#{idx + 1}</span>
                    <span className="text-gray-600">
                      {t('groups.summary', {
                        count: g.files.length,
                        size: fmtSize(g.files[0].size),
                        waste: fmtSize(waste),
                      })}
                    </span>
                    <code className="ml-auto text-xs text-gray-400 font-mono truncate max-w-[200px]">
                      sha256: {g.hash.slice(0, 16)}…
                    </code>
                  </div>
                  <ul className="divide-y divide-rose-100">
                    {g.files.map((f) => {
                      const isKeep = f.id === keepId
                      return (
                        <li
                          key={f.id}
                          className="py-1.5 flex items-center gap-2 text-sm"
                        >
                          <input
                            type="radio"
                            name={`keep-${g.hash}`}
                            checked={isKeep}
                            onChange={() => setKeep(g.hash, f.id)}
                            className="shrink-0"
                          />
                          {isKeep ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                              <Star className="w-3 h-3" />
                              {t('groups.keep')}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] rounded-full bg-red-100 text-red-700 border border-red-200">
                              <Trash2 className="w-3 h-3" />
                              {t('groups.delete')}
                            </span>
                          )}
                          <span
                            className={`flex-1 truncate ${
                              isKeep ? 'text-gray-800' : 'text-gray-500 line-through'
                            }`}
                            title={f.name}
                          >
                            {f.name}
                          </span>
                          <span className="text-xs text-gray-400 shrink-0">
                            {fmtSize(f.size)}
                          </span>
                          <button
                            type="button"
                            onClick={() => downloadFile(f)}
                            className="text-gray-400 hover:text-indigo-600 shrink-0"
                            title={t('action.download')}
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeEntry(f.id)}
                            className="text-gray-400 hover:text-red-500 shrink-0"
                            title={t('action.remove')}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* 唯一文件折叠 */}
      {analysis.uniqueEntries.length > 0 && (
        <section className="rounded-lg border border-gray-200 bg-white">
          <button
            type="button"
            onClick={() => setUniqueOpen((v) => !v)}
            className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <FileCheck2 className="w-4 h-4 text-emerald-600" />
            {t('unique.title')} ({analysis.uniqueEntries.length})
            <ChevronDown
              className={`w-4 h-4 ml-auto text-gray-400 transition-transform ${
                uniqueOpen ? 'rotate-180' : ''
              }`}
            />
          </button>
          {uniqueOpen && (
            <ul className="px-4 pb-4 border-t border-gray-100 pt-3 divide-y divide-gray-100">
              {analysis.uniqueEntries.map((f) => (
                <li key={f.id} className="py-1.5 flex items-center gap-2 text-sm">
                  <FileCheck2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span className="flex-1 truncate text-gray-700" title={f.name}>
                    {f.name}
                  </span>
                  <span className="text-xs text-gray-400 shrink-0">{fmtSize(f.size)}</span>
                  <button
                    type="button"
                    onClick={() => removeEntry(f.id)}
                    className="text-gray-400 hover:text-red-500 shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {entries.length === 0 && (
        <p className="text-xs text-gray-400 text-center flex items-center justify-center gap-1">
          <CopyIcon className="w-3 h-3" /> {t('emptyHint')}
        </p>
      )}
    </div>
  )
}

interface StatCardProps {
  label: string
  value: React.ReactNode
  color: string
}
const StatCard: React.FC<StatCardProps> = ({ label, value, color }) => (
  <div className="rounded-lg border border-gray-200 bg-white p-3">
    <div className="text-xs text-gray-500">{label}</div>
    <div className={`text-lg font-semibold tabular-nums mt-0.5 ${color}`}>{value}</div>
  </div>
)

export default DuplicateFinder
