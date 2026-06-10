import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Button, Card, NoticeCard, PageHero, ParticlesBackground, TextArea } from '@toolbox/ui-kit'
import { useTranslation } from 'react-i18next'
import { Download, GitBranch, Loader2, Play, RotateCcw, Trash2 } from 'lucide-react'
import { SAMPLES } from './lib/samples'
import { deriveSvgFilename, derivePngFilename, sanitizeSvgForExport, svgToBlob } from './lib/export'

type MermaidTheme = 'default' | 'dark' | 'forest' | 'neutral'

const RENDER_DEBOUNCE_MS = 400
let renderSeq = 0

/** mermaid 单例：双层动态 import 防 bundle 爆。 */
async function getMermaid(theme: MermaidTheme) {
  const mod = await import('mermaid')
  mod.default.initialize({ startOnLoad: false, securityLevel: 'strict', theme })
  return mod.default
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

const Mermaid: React.FC = () => {
  const { t } = useTranslation('toolMermaid')
  const [source, setSource] = useState(SAMPLES[0].src)
  const [theme, setTheme] = useState<MermaidTheme>('default')
  const [live, setLive] = useState(true)
  const [svg, setSvg] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [rendering, setRendering] = useState(false)
  const timer = useRef<number | null>(null)

  const renderNow = useCallback(async (src: string, th: MermaidTheme) => {
    if (!src.trim()) { setSvg(''); setError(null); return }
    setRendering(true)
    try {
      const m = await getMermaid(th)
      await m.parse(src)
      renderSeq += 1
      const { svg: out } = await m.render(`mermaid-tool-${renderSeq}`, src)
      setSvg(out)
      setError(null)
    } catch (e) {
      // 渲染失败保留上一次成功的图，避免闪烁清空
      setError((e as Error).message ?? String(e))
    } finally {
      setRendering(false)
    }
  }, [])

  // 实时渲染（debounce）
  useEffect(() => {
    if (!live) return
    if (timer.current != null) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => { void renderNow(source, theme) }, RENDER_DEBOUNCE_MS)
    return () => {
      if (timer.current != null) window.clearTimeout(timer.current)
    }
  }, [source, theme, live, renderNow])

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
      // 2x 分辨率防锯齿
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

  return (
    <div className="relative min-h-[60vh]">
      <ParticlesBackground preset="minimal" className="absolute inset-0" />
      <div className="relative z-10 space-y-6">
        <PageHero title={t('title')} description={t('description')} />

        <NoticeCard
          tone="info"
          title={t('notice.title')}
          description={t('notice.body')}
          icon={GitBranch}
        />

        <Card>
          <div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
            <label className="inline-flex items-center gap-1.5">
              <span className="text-gray-500 dark:text-gray-400">{t('toolbar.theme')}</span>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as MermaidTheme)}
                className="rounded border border-gray-300 bg-white px-2 py-1 text-xs dark:border-gray-700 dark:bg-gray-900"
              >
                <option value="default">default</option>
                <option value="dark">dark</option>
                <option value="forest">forest</option>
                <option value="neutral">neutral</option>
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
                className="rounded border border-gray-300 bg-white px-2 py-1 text-xs dark:border-gray-700 dark:bg-gray-900"
              >
                <option value="" disabled>{t('toolbar.samplesPick')}</option>
                {SAMPLES.map((s) => (
                  <option key={s.id} value={s.id}>{t(`samples.${s.id}`)}</option>
                ))}
              </select>
            </label>
            <label className="inline-flex items-center gap-1.5">
              <input
                type="checkbox"
                checked={live}
                onChange={(e) => setLive(e.target.checked)}
              />
              <span className="text-gray-600 dark:text-gray-300">{t('toolbar.live')}</span>
            </label>
            {!live && (
              <Button type="button" variant="ghost" onClick={() => void renderNow(source, theme)}>
                <span className="inline-flex items-center gap-1.5">
                  <Play className="h-3.5 w-3.5" />
                  {t('toolbar.render')}
                </span>
              </Button>
            )}
            <span className="flex-1" />
            <Button type="button" variant="ghost" onClick={() => void renderNow(source, theme)}>
              <span className="inline-flex items-center gap-1.5">
                <RotateCcw className="h-3.5 w-3.5" />
                {t('toolbar.rerender')}
              </span>
            </Button>
            <Button type="button" variant="ghost" onClick={() => { setSource(''); setSvg(''); setError(null) }}>
              <span className="inline-flex items-center gap-1.5">
                <Trash2 className="h-3.5 w-3.5" />
                {t('toolbar.clear')}
              </span>
            </Button>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="flex flex-col">
              <div className="mb-1 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>{t('editor.heading')} · {source.length}</span>
                {rendering && (
                  <span className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    {t('editor.rendering')}
                  </span>
                )}
              </div>
              <TextArea
                value={source}
                onChange={(e) => setSource(e.target.value)}
                rows={18}
                placeholder={t('editor.placeholder')}
                spellCheck={false}
                className="!font-mono !text-xs"
              />
            </div>

            <div className="flex flex-col">
              <div className="mb-1 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>{t('preview.heading')}</span>
                <div className="flex gap-2">
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
                </div>
              </div>
              {error && (
                <div className="mb-2 rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:border-rose-700 dark:bg-rose-900/30 dark:text-rose-200">
                  {error}
                </div>
              )}
              <div
                className="flex-1 overflow-auto rounded-md border border-gray-200 bg-white p-3 dark:border-gray-700"
                style={{ minHeight: 320 }}
              >
                {svg ? (
                  <div dangerouslySetInnerHTML={{ __html: svg }} />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-gray-400">
                    {t('preview.empty')}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default Mermaid
