import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Button, Card, NoticeCard, PageHero, ParticlesBackground } from '@toolbox/ui-kit'
import { useTranslation } from 'react-i18next'
import CodeMirror from '@uiw/react-codemirror'
import { EditorView } from '@codemirror/view'
import { vsCodeDark } from '@fsegurai/codemirror-theme-vscode-dark'
import { vsCodeLight } from '@fsegurai/codemirror-theme-vscode-light'
import '@fontsource-variable/recursive'
import {
  Download,
  GitBranch,
  History,
  Loader2,
  Maximize2,
  Minimize2,
  Play,
  RotateCcw,
  Save,
  Trash2,
  X,
} from 'lucide-react'
import { SAMPLES } from './lib/samples'
import { deriveSvgFilename, derivePngFilename, sanitizeSvgForExport, svgToBlob } from './lib/export'
import { addEntry, loadHistory, renameEntry, saveHistory, type HistoryEntry } from './lib/history'
import { LAYOUTS, renderMermaid, type MermaidLayout, type MermaidTheme } from './lib/runtime'
import { toRoughSvg } from './lib/rough'
import { useIsDark } from './lib/useIsDark'
import { canRename, labelFromTarget, rangeOf, replaceFirst, type LabelHit } from './lib/preview-edit'
import Splitter from './Splitter'

const RENDER_DEBOUNCE_MS = 400
const SELECT_CLS =
  'rounded border border-gray-300 bg-white px-2 py-1 text-xs dark:border-gray-700 dark:bg-gray-900'

// Recursive 可变字体（编程模式 MONO=1），统一编辑器字形
const editorFont = EditorView.theme({
  '&': {
    fontFamily: "'Recursive Variable', ui-monospace, SFMono-Regular, monospace",
    fontVariationSettings: "'MONO' 1, 'CASL' 0, 'slnt' 0",
    height: '100%',
  },
  '.cm-content, .cm-gutters': { fontFamily: 'inherit' },
  '.cm-scroller': { fontSize: '12px' },
})

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

const Mermaid: React.FC = () => {
  const { t } = useTranslation('toolMermaid')
  const isDark = useIsDark()
  const [source, setSource] = useState(SAMPLES[0].src)
  const [theme, setTheme] = useState<MermaidTheme>('default')
  const [customColor, setCustomColor] = useState<string | null>(null)
  const [layout, setLayout] = useState<MermaidLayout>('dagre')
  const [sketch, setSketch] = useState(false)
  const [live, setLive] = useState(true)
  const [svg, setSvg] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [rendering, setRendering] = useState(false)
  const [ratio, setRatio] = useState(0.5)
  const [fullscreen, setFullscreen] = useState(false)
  const [history, setHistory] = useState<HistoryEntry[]>(() => loadHistory())
  // 预览就地改名的浮层输入：视口坐标 + 原文本
  const [editing, setEditing] = useState<(LabelHit & { value: string }) | null>(null)
  const timer = useRef<number | null>(null)
  const editorView = useRef<EditorView | null>(null)
  const renameable = canRename(source)

  const cmExtensions = useMemo(() => [EditorView.lineWrapping, editorFont], [])

  // 点击预览元素 → 在编辑器中选中对应源码（所有图都支持）
  const onPreviewClick = useCallback(
    (e: React.MouseEvent) => {
      const hit = labelFromTarget(e.target)
      const view = editorView.current
      if (!hit || !view) return
      const range = rangeOf(view.state.doc.toString(), hit.text)
      if (!range) return
      view.dispatch({ selection: { anchor: range[0], head: range[1] }, scrollIntoView: true })
      view.focus()
    },
    [],
  )

  // 双击标签 → 就地改名（仅 flowchart / pie / gantt）
  const onPreviewDblClick = useCallback(
    (e: React.MouseEvent) => {
      if (!renameable) return
      const hit = labelFromTarget(e.target)
      if (!hit) return
      e.preventDefault()
      setEditing({ ...hit, value: hit.text })
    },
    [renameable],
  )

  const commitRename = useCallback(() => {
    setEditing((cur) => {
      if (cur && cur.value.trim() && cur.value !== cur.text) {
        setSource((s) => replaceFirst(s, cur.text, cur.value))
      }
      return null
    })
  }, [])

  const updateHistory = useCallback((next: HistoryEntry[]) => {
    setHistory(next)
    saveHistory(next)
  }, [])

  const renderNow = useCallback(
    async (src: string, th: MermaidTheme, lay: MermaidLayout, sk: boolean, color: string | null) => {
      if (!src.trim()) {
        setSvg('')
        setError(null)
        return
      }
      setRendering(true)
      try {
        const raw = await renderMermaid(src, th, lay, color ?? undefined)
        setSvg(sk ? await toRoughSvg(raw) : raw)
        setError(null)
      } catch (e) {
        // 渲染失败保留上一次成功的图，避免闪烁清空
        setError((e as Error).message ?? String(e))
      } finally {
        setRendering(false)
      }
    },
    [],
  )

  // 实时渲染（debounce）
  useEffect(() => {
    if (!live) return
    if (timer.current != null) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => {
      void renderNow(source, theme, layout, sketch, customColor)
    }, RENDER_DEBOUNCE_MS)
    return () => {
      if (timer.current != null) window.clearTimeout(timer.current)
    }
  }, [source, theme, layout, sketch, customColor, live, renderNow])

  // ESC 退出全屏
  useEffect(() => {
    if (!fullscreen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFullscreen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [fullscreen])

  const rerender = () => void renderNow(source, theme, layout, sketch, customColor)

  const onExportSvg = () => {
    if (!svg) return
    downloadBlob(svgToBlob(sanitizeSvgForExport(svg)), deriveSvgFilename())
  }

  const onExportPng = async () => {
    if (!svg) return
    const clean = sanitizeSvgForExport(svg)
    const img = new Image()
    const svgUrl = URL.createObjectURL(svgToBlob(clean))
    try {
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve()
        img.onerror = () => reject(new Error('SVG decode failed'))
        img.src = svgUrl
      })
      const scale = 2
      const canvas = document.createElement('canvas')
      canvas.width = (img.naturalWidth || 800) * scale
      canvas.height = (img.naturalHeight || 600) * scale
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('canvas 2d unavailable')
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.scale(scale, scale)
      ctx.drawImage(img, 0, 0)
      canvas.toBlob((blob) => {
        if (blob) downloadBlob(blob, derivePngFilename())
      }, 'image/png')
    } catch (e) {
      setError((e as Error).message ?? String(e))
    } finally {
      URL.revokeObjectURL(svgUrl)
    }
  }

  const previewHeader = (
    <div className="mb-1 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
      <span>{t('preview.heading')}</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onExportSvg}
          disabled={!svg}
          className="inline-flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-30"
        >
          <Download className="h-3 w-3" /> SVG
        </button>
        <button
          type="button"
          onClick={() => void onExportPng()}
          disabled={!svg}
          className="inline-flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-30"
        >
          <Download className="h-3 w-3" /> PNG
        </button>
        <button
          type="button"
          onClick={() => setFullscreen((v) => !v)}
          className="inline-flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200"
          aria-label={t(fullscreen ? 'preview.exitFullscreen' : 'preview.fullscreen')}
        >
          {fullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
        </button>
      </div>
    </div>
  )

  const previewBody = (
    <>
      {error && (
        <div className="mb-2 rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:border-rose-700 dark:bg-rose-900/30 dark:text-rose-200">
          {error}
        </div>
      )}
      <div className="min-h-0 flex-1 overflow-auto rounded-md border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-950">
        {svg ? (
          <div
            onClick={onPreviewClick}
            onDoubleClick={onPreviewDblClick}
            className="cursor-pointer [&_*]:cursor-pointer"
            title={t(renameable ? 'preview.editHintRename' : 'preview.editHint')}
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">
            {t('preview.empty')}
          </div>
        )}
      </div>
    </>
  )

  return (
    <div className="relative min-h-[60vh]">
      <ParticlesBackground preset="minimal" className="absolute inset-0" />
      <div className="relative z-10 space-y-6">
        <PageHero title={t('title')} description={t('description')} />

        <NoticeCard tone="info" title={t('notice.title')} description={t('notice.body')} icon={GitBranch} />

        <Card>
          <div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
            <label className="inline-flex items-center gap-1.5">
              <span className="text-gray-500 dark:text-gray-400">{t('toolbar.theme')}</span>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as MermaidTheme)}
                disabled={customColor != null}
                className={`${SELECT_CLS} disabled:opacity-50`}
              >
                <option value="default">default</option>
                <option value="dark">dark</option>
                <option value="forest">forest</option>
                <option value="neutral">neutral</option>
                <option value="base">base</option>
              </select>
            </label>
            <label className="inline-flex items-center gap-1.5">
              <input
                type="checkbox"
                checked={customColor != null}
                onChange={(e) => setCustomColor(e.target.checked ? '#6366f1' : null)}
              />
              <span className="text-gray-600 dark:text-gray-300">{t('toolbar.customColor')}</span>
              {customColor != null && (
                <input
                  type="color"
                  value={customColor}
                  onChange={(e) => setCustomColor(e.target.value)}
                  className="h-6 w-8 cursor-pointer rounded border border-gray-300 bg-white p-0 dark:border-gray-700"
                  aria-label={t('toolbar.customColor')}
                />
              )}
            </label>
            <label className="inline-flex items-center gap-1.5">
              <span className="text-gray-500 dark:text-gray-400">{t('toolbar.layout')}</span>
              <select
                value={layout}
                onChange={(e) => setLayout(e.target.value as MermaidLayout)}
                className={SELECT_CLS}
              >
                {LAYOUTS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </label>
            <label className="inline-flex items-center gap-1.5">
              <span className="text-gray-500 dark:text-gray-400">{t('toolbar.samples')}</span>
              <select
                defaultValue=""
                onChange={(e) => {
                  const s = SAMPLES.find((x) => x.id === e.target.value)
                  if (s) setSource(s.src)
                }}
                className={SELECT_CLS}
              >
                <option value="" disabled>
                  {t('toolbar.samplesPick')}
                </option>
                {SAMPLES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {t(`samples.${s.id}`)}
                  </option>
                ))}
              </select>
            </label>
            <label className="inline-flex items-center gap-1.5">
              <input type="checkbox" checked={sketch} onChange={(e) => setSketch(e.target.checked)} />
              <span className="text-gray-600 dark:text-gray-300">{t('toolbar.sketch')}</span>
            </label>
            <label className="inline-flex items-center gap-1.5">
              <input type="checkbox" checked={live} onChange={(e) => setLive(e.target.checked)} />
              <span className="text-gray-600 dark:text-gray-300">{t('toolbar.live')}</span>
            </label>
            {!live && (
              <Button type="button" variant="ghost" onClick={rerender}>
                <span className="inline-flex items-center gap-1.5">
                  <Play className="h-3.5 w-3.5" />
                  {t('toolbar.render')}
                </span>
              </Button>
            )}
            <span className="flex-1" />
            <Button type="button" variant="ghost" onClick={() => updateHistory(addEntry(history, source))}>
              <span className="inline-flex items-center gap-1.5">
                <Save className="h-3.5 w-3.5" />
                {t('toolbar.save')}
              </span>
            </Button>
            <Button type="button" variant="ghost" onClick={rerender}>
              <span className="inline-flex items-center gap-1.5">
                <RotateCcw className="h-3.5 w-3.5" />
                {t('toolbar.rerender')}
              </span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setSource('')
                setSvg('')
                setError(null)
              }}
            >
              <span className="inline-flex items-center gap-1.5">
                <Trash2 className="h-3.5 w-3.5" />
                {t('toolbar.clear')}
              </span>
            </Button>
          </div>

          {/* 左右等高，中间分割条可拖动；md 以下上下堆叠 */}
          <div
            className="flex flex-col gap-3 md:flex-row"
            style={{ height: '70vh', minHeight: 420, maxHeight: 820 }}
          >
            <div
              className="flex min-h-0 min-w-0 flex-col"
              style={{ flexBasis: `${ratio * 100}%`, flexGrow: 0, flexShrink: 0 }}
            >
              <div className="mb-1 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>
                  {t('editor.heading')} · {source.length}
                </span>
                {rendering && (
                  <span className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    {t('editor.rendering')}
                  </span>
                )}
              </div>
              <div className="min-h-0 flex-1 overflow-hidden rounded-md border border-gray-200 dark:border-gray-700">
                <CodeMirror
                  value={source}
                  height="100%"
                  theme={isDark ? vsCodeDark : vsCodeLight}
                  extensions={cmExtensions}
                  onChange={setSource}
                  onCreateEditor={(view) => (editorView.current = view)}
                  basicSetup={{ lineNumbers: true, foldGutter: false, highlightActiveLine: true }}
                  placeholder={t('editor.placeholder')}
                  className="h-full"
                />
              </div>
            </div>

            <Splitter className="hidden md:flex" ratio={ratio} onChange={setRatio} />

            <div className="flex min-h-0 min-w-0 flex-1 flex-col">
              {previewHeader}
              {previewBody}
            </div>
          </div>

          {history.length > 0 && (
            <div className="mt-4 border-t border-gray-200 pt-3 dark:border-gray-700">
              <div className="mb-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span className="inline-flex items-center gap-1.5">
                  <History className="h-3.5 w-3.5" />
                  {t('history.heading')} · {history.length}
                </span>
                <button
                  type="button"
                  onClick={() => updateHistory([])}
                  className="hover:text-gray-700 dark:hover:text-gray-200"
                >
                  {t('history.clear')}
                </button>
              </div>
              <ul className="space-y-1">
                {history.map((h) => (
                  <li
                    key={h.id}
                    className="flex items-center gap-2 rounded border border-gray-200 px-2 py-1 text-xs dark:border-gray-700"
                  >
                    <input
                      value={h.name}
                      onChange={(e) => updateHistory(renameEntry(history, h.id, e.target.value))}
                      title={h.src.trim().split('\n')[0]}
                      aria-label={t('history.name')}
                      className="min-w-0 flex-1 truncate rounded border border-transparent bg-transparent px-1 py-0.5 text-gray-700 hover:border-gray-300 focus:border-indigo-400 focus:outline-none dark:text-gray-200 dark:hover:border-gray-600"
                    />
                    <span className="shrink-0 text-gray-400">{new Date(h.ts).toLocaleString()}</span>
                    <button
                      type="button"
                      onClick={() => setSource(h.src)}
                      className="shrink-0 text-indigo-600 hover:underline dark:text-indigo-400"
                    >
                      {t('history.restore')}
                    </button>
                    <button
                      type="button"
                      onClick={() => updateHistory(history.filter((x) => x.id !== h.id))}
                      className="shrink-0 text-gray-400 hover:text-rose-500"
                      aria-label={t('history.delete')}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      </div>

      {fullscreen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white p-4 dark:bg-gray-950">
          {previewHeader}
          {previewBody}
        </div>
      )}

      {editing && (
        <input
          autoFocus
          value={editing.value}
          onChange={(e) => setEditing((cur) => (cur ? { ...cur, value: e.target.value } : cur))}
          onBlur={commitRename}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commitRename()
            else if (e.key === 'Escape') setEditing(null)
          }}
          style={{
            position: 'fixed',
            top: editing.rect.top,
            left: editing.rect.left,
            minWidth: Math.max(editing.rect.width + 24, 80),
            height: Math.max(editing.rect.height, 24),
          }}
          className="z-[60] rounded border-2 border-indigo-500 bg-white px-1 text-xs text-gray-900 shadow-lg outline-none dark:bg-gray-900 dark:text-gray-100"
        />
      )}
    </div>
  )
}

export default Mermaid
