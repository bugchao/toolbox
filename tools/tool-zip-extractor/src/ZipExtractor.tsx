import React, { useCallback, useMemo, useRef, useState } from 'react'
import {
  Upload,
  FolderArchive,
  Folder,
  FolderOpen,
  File as FileIcon,
  Download,
  Image as ImageIcon,
  FileText,
  X,
  ChevronRight,
  ChevronDown,
  Eye,
  Loader2,
} from 'lucide-react'
import { PageHero } from '@toolbox/ui-kit'
import { useTranslation } from 'react-i18next'
import JSZip from 'jszip'

const NAMESPACE = 'toolZipExtractor'

interface FileNode {
  type: 'file'
  name: string
  path: string
  size: number
  entry: JSZip.JSZipObject
}
interface DirNode {
  type: 'dir'
  name: string
  path: string
  children: Array<DirNode | FileNode>
}
type ZipNode = DirNode | FileNode

const TEXT_EXTS = new Set([
  'txt', 'md', 'markdown', 'json', 'xml', 'yaml', 'yml', 'toml', 'ini', 'cfg',
  'csv', 'tsv', 'log',
  'js', 'jsx', 'ts', 'tsx', 'css', 'scss', 'less', 'html', 'htm', 'vue', 'svelte',
  'py', 'rb', 'go', 'rs', 'java', 'kt', 'swift', 'c', 'h', 'cpp', 'hpp', 'cs',
  'php', 'sh', 'bash', 'zsh', 'fish', 'ps1', 'bat',
  'sql', 'graphql', 'gql', 'proto',
  'env', 'gitignore', 'dockerfile', 'editorconfig',
  'svg',
])
const IMAGE_EXTS = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'ico'])

function getExt(name: string): string {
  const idx = name.lastIndexOf('.')
  return idx >= 0 ? name.slice(idx + 1).toLowerCase() : ''
}
function fmtSize(b: number): string {
  if (b < 1024) return `${b} B`
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`
  if (b < 1024 * 1024 * 1024) return `${(b / 1024 / 1024).toFixed(1)} MB`
  return `${(b / 1024 / 1024 / 1024).toFixed(2)} GB`
}

const ZipExtractor: React.FC = () => {
  const { t } = useTranslation(NAMESPACE)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [zipName, setZipName] = useState('')
  const [tree, setTree] = useState<DirNode | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set([''])) // root expanded by default
  const [preview, setPreview] = useState<
    | null
    | { kind: 'text'; name: string; content: string }
    | { kind: 'image'; name: string; dataUrl: string }
    | { kind: 'binary'; name: string; size: number }
  >(null)
  const [dragOver, setDragOver] = useState(false)

  const totalStats = useMemo(() => {
    if (!tree) return null
    let files = 0
    let dirs = 0
    let totalSize = 0
    const walk = (n: ZipNode): void => {
      if (n.type === 'dir') {
        dirs++
        n.children.forEach(walk)
      } else {
        files++
        totalSize += n.size
      }
    }
    tree.children.forEach(walk)
    return { files, dirs, totalSize }
  }, [tree])

  const loadZip = useCallback(async (file: File) => {
    setLoading(true)
    setError('')
    setTree(null)
    setPreview(null)
    setZipName(file.name)
    try {
      const zip = await JSZip.loadAsync(file)
      // Collect all file entries
      const entries: Array<{ path: string; entry: JSZip.JSZipObject }> = []
      zip.forEach((path, entry) => {
        if (entry.dir) return
        entries.push({ path, entry })
      })

      // Compute uncompressed sizes in parallel — JSZip has no public size API,
      // so we decompress to uint8array to get .length. For very large ZIPs this
      // can be slow but is the only reliable way.
      const sizes = await Promise.all(
        entries.map(async ({ entry }) => {
          try {
            const arr = await entry.async('uint8array')
            return arr.length
          } catch {
            return 0
          }
        }),
      )

      // Build tree
      const root: DirNode = { type: 'dir', name: zipName || file.name, path: '', children: [] }
      entries.forEach(({ path, entry }, i) => {
        const parts = path.split('/').filter(Boolean)
        let cur: DirNode = root
        for (let p = 0; p < parts.length - 1; p++) {
          const segName = parts[p]
          const segPath = parts.slice(0, p + 1).join('/')
          let next = cur.children.find(
            (c): c is DirNode => c.type === 'dir' && c.name === segName,
          )
          if (!next) {
            next = { type: 'dir', name: segName, path: segPath, children: [] }
            cur.children.push(next)
          }
          cur = next
        }
        cur.children.push({
          type: 'file',
          name: parts[parts.length - 1],
          path,
          size: sizes[i],
          entry,
        })
      })

      // Sort: dirs first, then alphabetic
      const sort = (node: DirNode): void => {
        node.children.sort((a, b) => {
          if (a.type !== b.type) return a.type === 'dir' ? -1 : 1
          return a.name.localeCompare(b.name)
        })
        node.children.forEach((c) => {
          if (c.type === 'dir') sort(c)
        })
      }
      sort(root)

      setTree(root)
      // Auto-expand top-level dirs if there's only one root folder
      const newExpanded = new Set<string>([''])
      if (root.children.length === 1 && root.children[0].type === 'dir') {
        newExpanded.add(root.children[0].path)
      }
      setExpandedDirs(newExpanded)
    } catch (err) {
      setError(t('error.parse', { msg: (err as Error).message }))
    } finally {
      setLoading(false)
    }
  }, [zipName, t])

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) void loadZip(f)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files?.[0]
    if (f) void loadZip(f)
  }

  const toggleDir = (path: string) => {
    setExpandedDirs((prev) => {
      const next = new Set(prev)
      if (next.has(path)) next.delete(path)
      else next.add(path)
      return next
    })
  }

  const downloadFile = async (node: FileNode) => {
    const blob = await node.entry.async('blob')
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = node.name
    a.click()
    URL.revokeObjectURL(url)
  }

  const showPreview = async (node: FileNode) => {
    const ext = getExt(node.name)
    if (IMAGE_EXTS.has(ext)) {
      const blob = await node.entry.async('blob')
      const dataUrl = await new Promise<string>((resolve) => {
        const r = new FileReader()
        r.onload = () => resolve(String(r.result))
        r.readAsDataURL(blob)
      })
      setPreview({ kind: 'image', name: node.name, dataUrl })
    } else if (TEXT_EXTS.has(ext) || node.size < 1024 * 256) {
      try {
        const text = await node.entry.async('string')
        setPreview({ kind: 'text', name: node.name, content: text })
      } catch {
        setPreview({ kind: 'binary', name: node.name, size: node.size })
      }
    } else {
      setPreview({ kind: 'binary', name: node.name, size: node.size })
    }
  }

  const reset = () => {
    setTree(null)
    setZipName('')
    setError('')
    setPreview(null)
  }

  return (
    <div className="w-full space-y-6 pb-24">
      <PageHero title={t('title')} description={t('description')} />

      {!tree && !loading && (
        <section
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={`rounded-2xl border-2 border-dashed p-12 text-center transition-colors ${
            dragOver
              ? 'border-indigo-500 bg-indigo-50'
              : 'border-gray-300 bg-white hover:border-gray-400'
          }`}
        >
          <FolderArchive className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-sm text-gray-700 mb-2">{t('drop.hint')}</p>
          <p className="text-xs text-gray-400 mb-3">{t('drop.tip')}</p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            <Upload className="w-4 h-4 inline -mt-0.5 mr-1.5" />
            {t('drop.choose')}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".zip,application/zip,application/x-zip-compressed"
            onChange={onSelectFile}
            className="hidden"
          />
        </section>
      )}

      {loading && (
        <section className="rounded-lg border border-gray-200 bg-white p-12 text-center">
          <Loader2 className="w-8 h-8 text-indigo-500 mx-auto animate-spin mb-2" />
          <p className="text-sm text-gray-600">{t('parsing', { name: zipName })}</p>
        </section>
      )}

      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {error}
        </div>
      )}

      {tree && totalStats && (
        <>
          <section className="rounded-lg border border-gray-200 bg-white p-3 flex items-center gap-3 flex-wrap">
            <FolderArchive className="w-5 h-5 text-indigo-500" />
            <span className="text-sm font-medium text-gray-800 truncate flex-1">{zipName}</span>
            <span className="text-xs text-gray-500">
              {t('stats', {
                files: totalStats.files,
                dirs: totalStats.dirs,
                size: fmtSize(totalStats.totalSize),
              })}
            </span>
            <button
              type="button"
              onClick={reset}
              className="text-xs text-gray-500 hover:text-red-600 inline-flex items-center gap-1 ml-auto"
            >
              <X className="w-3 h-3" /> {t('action.close')}
            </button>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-4">
            {/* Tree */}
            <section className="rounded-lg border border-gray-200 bg-white p-3 max-h-[600px] overflow-y-auto">
              <TreeView
                node={tree}
                level={0}
                expandedDirs={expandedDirs}
                onToggleDir={toggleDir}
                onPreview={showPreview}
                onDownload={downloadFile}
                t={t}
              />
            </section>

            {/* Preview */}
            <section className="rounded-lg border border-gray-200 bg-white p-3">
              {preview ? (
                <div className="space-y-2 h-full flex flex-col">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                    {preview.kind === 'image' ? (
                      <ImageIcon className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <FileText className="w-4 h-4 text-sky-500" />
                    )}
                    <span className="text-sm font-medium text-gray-800 flex-1 truncate">
                      {preview.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => setPreview(null)}
                      className="text-gray-400 hover:text-gray-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  {preview.kind === 'text' && (
                    <pre className="flex-1 px-2 py-1 text-xs border border-gray-200 rounded-md bg-gray-50 overflow-auto max-h-[540px] whitespace-pre-wrap break-words font-mono">
                      {preview.content || t('preview.empty')}
                    </pre>
                  )}
                  {preview.kind === 'image' && (
                    <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-md overflow-auto p-2">
                      <img
                        src={preview.dataUrl}
                        alt={preview.name}
                        className="max-w-full max-h-[540px] object-contain"
                      />
                    </div>
                  )}
                  {preview.kind === 'binary' && (
                    <div className="flex-1 flex flex-col items-center justify-center text-sm text-gray-500 gap-2 py-12">
                      <FileIcon className="w-10 h-10 text-gray-300" />
                      <span>{t('preview.binary', { size: fmtSize(preview.size) })}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-sm text-gray-400 py-12 gap-2">
                  <Eye className="w-8 h-8 text-gray-300" />
                  <span>{t('preview.hint')}</span>
                </div>
              )}
            </section>
          </div>
        </>
      )}

      <p className="text-xs text-gray-400 text-center">{t('disclaimer')}</p>
    </div>
  )
}

interface TreeViewProps {
  node: ZipNode
  level: number
  expandedDirs: Set<string>
  onToggleDir: (path: string) => void
  onPreview: (node: FileNode) => void
  onDownload: (node: FileNode) => void
  t: (k: string, opts?: Record<string, unknown>) => string
}
const TreeView: React.FC<TreeViewProps> = ({
  node,
  level,
  expandedDirs,
  onToggleDir,
  onPreview,
  onDownload,
  t,
}) => {
  if (node.type === 'file') {
    const ext = getExt(node.name)
    const canPreview = TEXT_EXTS.has(ext) || IMAGE_EXTS.has(ext)
    return (
      <div
        className="flex items-center gap-1 py-0.5 px-1 hover:bg-gray-50 rounded text-sm"
        style={{ paddingLeft: 8 + level * 16 }}
      >
        <FileIcon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
        <span className="flex-1 truncate text-gray-700">{node.name}</span>
        <span className="text-xs text-gray-400 shrink-0">{fmtSize(node.size)}</span>
        {canPreview && (
          <button
            type="button"
            onClick={() => onPreview(node)}
            className="ml-1 text-gray-400 hover:text-emerald-600"
            title={t('action.preview')}
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        )}
        <button
          type="button"
          onClick={() => onDownload(node)}
          className="ml-1 text-gray-400 hover:text-indigo-600"
          title={t('action.download')}
        >
          <Download className="w-3.5 h-3.5" />
        </button>
      </div>
    )
  }
  const isOpen = expandedDirs.has(node.path)
  return (
    <div>
      {level >= 0 && (
        <button
          type="button"
          onClick={() => onToggleDir(node.path)}
          className="w-full flex items-center gap-1 py-0.5 px-1 hover:bg-gray-50 rounded text-sm text-left"
          style={{ paddingLeft: 8 + level * 16 }}
        >
          {isOpen ? (
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          )}
          {isOpen ? (
            <FolderOpen className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          ) : (
            <Folder className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          )}
          <span className="flex-1 truncate font-medium text-gray-800">{node.name}</span>
          <span className="text-xs text-gray-400 shrink-0">{node.children.length}</span>
        </button>
      )}
      {isOpen &&
        node.children.map((child, i) => (
          <TreeView
            key={`${child.type}-${child.path}-${i}`}
            node={child}
            level={level + 1}
            expandedDirs={expandedDirs}
            onToggleDir={onToggleDir}
            onPreview={onPreview}
            onDownload={onDownload}
            t={t}
          />
        ))}
    </div>
  )
}

export default ZipExtractor
