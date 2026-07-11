import React, { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import { Button, Card, PageHero, ParticlesBackground } from '@toolbox/ui-kit'
import {
  ArrowDown,
  ArrowUp,
  Download,
  Eye,
  EyeOff,
  FileDown,
  FileUp,
  ImagePlus,
  Redo2,
  Save,
  Trash2,
  Undo2,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { EFFECTS, EFFECT_TYPES } from './lib/effects'
import { initialHistory, pipelineReducer } from './lib/pipeline'
import { applyPipeline } from './lib/render'
import { deletePipeline, listPipelines, parsePipelineJson, savePipeline, serializePipeline, type SavedPipeline } from './lib/storage'
import type { EffectType } from './lib/types'

const ImagePipelineLab: React.FC = () => {
  const { t } = useTranslation('toolImagePipelineLab')
  const [history, dispatch] = useReducer(pipelineReducer, initialHistory)
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [fileName, setFileName] = useState('')
  const [saved, setSaved] = useState<SavedPipeline[]>(() => listPipelines())
  const [saveName, setSaveName] = useState('')
  const [error, setError] = useState('')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const importInputRef = useRef<HTMLInputElement>(null)

  const steps = history.present

  const loadFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) {
        setError(t('errors.notImage'))
        return
      }
      const reader = new FileReader()
      reader.onload = () => {
        const img = new Image()
        img.onload = () => {
          setImage(img)
          setFileName(file.name)
          setError('')
        }
        img.src = reader.result as string
      }
      reader.readAsDataURL(file)
    },
    [t],
  )

  useEffect(() => {
    if (image && canvasRef.current) applyPipeline(image, steps, canvasRef.current)
  }, [image, steps])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== 'z') return
      e.preventDefault()
      dispatch({ type: e.shiftKey ? 'redo' : 'undo' })
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const exportPng = () => {
    canvasRef.current?.toBlob((blob) => {
      if (!blob) return
      downloadBlob(blob, `pipeline_${fileName.replace(/\.[^.]+$/, '') || 'image'}.png`)
    }, 'image/png')
  }

  const exportJson = () => {
    downloadBlob(new Blob([serializePipeline(steps)], { type: 'application/json' }), 'image-pipeline.json')
  }

  const importJson = (file: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        dispatch({ type: 'replace', steps: parsePipelineJson(reader.result as string) })
        setError('')
      } catch {
        setError(t('errors.invalidJson'))
      }
    }
    reader.readAsText(file)
  }

  const handleSave = () => {
    const name = saveName.trim()
    if (!name) return
    savePipeline(name, steps)
    setSaved(listPipelines())
    setSaveName('')
  }

  const handleDelete = (name: string) => {
    deletePipeline(name)
    setSaved(listPipelines())
  }

  return (
    <div className="relative min-h-[60vh]">
      {/* 粒子背景，受应用层 BackgroundVisibilityProvider 全局开关控制 */}
      <ParticlesBackground preset="minimal" className="absolute inset-0" />
      <div className="relative z-10 space-y-6">
        <PageHero title={t('title')} description={t('description')} />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
          {/* 左：图像加载 + 预览 */}
          <Card>
            <div className="space-y-4">
              <div
                className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 p-6 text-gray-500 transition-colors hover:border-indigo-400 dark:border-gray-600 dark:text-gray-400"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault()
                  const file = e.dataTransfer.files[0]
                  if (file) loadFile(file)
                }}
              >
                <ImagePlus className="h-8 w-8" />
                <span>{t('upload.hint')}</span>
                {image && (
                  <span className="text-sm">
                    {fileName} · {image.naturalWidth}×{image.naturalHeight}
                  </span>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) loadFile(file)
                  e.target.value = ''
                }}
              />
              {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
              {image ? (
                <canvas ref={canvasRef} className="h-auto max-w-full rounded-lg border border-gray-200 dark:border-gray-700" />
              ) : (
                <p className="text-center text-sm text-gray-400">{t('upload.empty')}</p>
              )}
            </div>
          </Card>

          {/* 右：管线面板 + 流程保存 */}
          <div className="space-y-6">
            <Card>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-gray-800 dark:text-gray-100">{t('steps.title')}</h2>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" disabled={history.past.length === 0} onClick={() => dispatch({ type: 'undo' })}>
                      <Undo2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" disabled={history.future.length === 0} onClick={() => dispatch({ type: 'redo' })}>
                      <Redo2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <select
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                  value=""
                  onChange={(e) => {
                    if (e.target.value) dispatch({ type: 'add', effect: e.target.value as EffectType })
                  }}
                >
                  <option value="">{t('steps.add')}</option>
                  {EFFECT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {t(`effects.${type}`)}
                    </option>
                  ))}
                </select>

                {steps.length === 0 && <p className="text-sm text-gray-400">{t('steps.empty')}</p>}

                <ul className="space-y-3">
                  {steps.map((step, i) => {
                    const def = EFFECTS[step.type]
                    return (
                      <li key={step.id} className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-sm font-medium ${step.enabled ? 'text-gray-800 dark:text-gray-100' : 'text-gray-400 line-through'}`}>
                            {i + 1}. {t(`effects.${step.type}`)}
                          </span>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" onClick={() => dispatch({ type: 'toggle', id: step.id })}>
                              {step.enabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                            </Button>
                            <Button variant="ghost" size="sm" disabled={i === 0} onClick={() => dispatch({ type: 'move', id: step.id, dir: -1 })}>
                              <ArrowUp className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" disabled={i === steps.length - 1} onClick={() => dispatch({ type: 'move', id: step.id, dir: 1 })}>
                              <ArrowDown className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => dispatch({ type: 'remove', id: step.id })}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <input
                            type="range"
                            className="w-full accent-indigo-600"
                            min={def.min}
                            max={def.max}
                            step={def.step}
                            value={step.value}
                            onChange={(e) => dispatch({ type: 'setValue', id: step.id, value: Number(e.target.value) })}
                          />
                          <span className="w-12 text-right text-xs tabular-nums text-gray-500 dark:text-gray-400">{step.value}</span>
                        </div>
                      </li>
                    )
                  })}
                </ul>

                <div className="flex flex-wrap gap-2 border-t border-gray-200 pt-4 dark:border-gray-700">
                  <Button size="sm" disabled={!image} onClick={exportPng}>
                    <span className="flex items-center gap-1">
                      <Download className="h-4 w-4" />
                      {t('toolbar.exportPng')}
                    </span>
                  </Button>
                  <Button variant="secondary" size="sm" disabled={steps.length === 0} onClick={exportJson}>
                    <span className="flex items-center gap-1">
                      <FileDown className="h-4 w-4" />
                      {t('toolbar.exportJson')}
                    </span>
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => importInputRef.current?.click()}>
                    <span className="flex items-center gap-1">
                      <FileUp className="h-4 w-4" />
                      {t('toolbar.importJson')}
                    </span>
                  </Button>
                  <input
                    ref={importInputRef}
                    type="file"
                    accept="application/json,.json"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) importJson(file)
                      e.target.value = ''
                    }}
                  />
                </div>
              </div>
            </Card>

            <Card>
              <div className="space-y-3">
                <h2 className="font-semibold text-gray-800 dark:text-gray-100">{t('saved.title')}</h2>
                <div className="flex gap-2">
                  <input
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                    placeholder={t('saved.namePlaceholder')}
                    value={saveName}
                    onChange={(e) => setSaveName(e.target.value)}
                  />
                  <Button size="sm" disabled={!saveName.trim() || steps.length === 0} onClick={handleSave}>
                    <span className="flex items-center gap-1">
                      <Save className="h-4 w-4" />
                      {t('saved.save')}
                    </span>
                  </Button>
                </div>
                {saved.length === 0 && <p className="text-sm text-gray-400">{t('saved.empty')}</p>}
                <ul className="space-y-2">
                  {saved.map((p) => (
                    <li key={p.name} className="flex items-center justify-between gap-2 text-sm">
                      <span className="truncate text-gray-700 dark:text-gray-300">
                        {p.name}
                        <span className="ml-1 text-xs text-gray-400">({p.steps.length})</span>
                      </span>
                      <div className="flex shrink-0 gap-1">
                        <Button variant="ghost" size="sm" onClick={() => dispatch({ type: 'replace', steps: p.steps })}>
                          {t('saved.load')}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(p.name)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

function downloadBlob(blob: Blob, name: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  URL.revokeObjectURL(url)
}

export default ImagePipelineLab
