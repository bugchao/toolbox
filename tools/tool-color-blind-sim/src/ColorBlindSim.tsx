import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Eye } from 'lucide-react'
import { PageHero } from '@toolbox/ui-kit'

type SimType = 'normal' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia'

// 色盲矩阵变换
const MATRICES: Record<SimType, number[]> = {
  normal:        [1,0,0, 0,1,0, 0,0,1],
  protanopia:    [0.567,0.433,0, 0.558,0.442,0, 0,0.242,0.758],
  deuteranopia:  [0.625,0.375,0, 0.7,0.3,0, 0,0.3,0.7],
  tritanopia:    [0.95,0.05,0, 0,0.433,0.567, 0,0.475,0.525],
  achromatopsia: [0.299,0.587,0.114, 0.299,0.587,0.114, 0.299,0.587,0.114],
}

function applyMatrix(data: Uint8ClampedArray, m: number[]) {
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i+1], b = data[i+2]
    data[i]   = Math.min(255, r*m[0] + g*m[1] + b*m[2])
    data[i+1] = Math.min(255, r*m[3] + g*m[4] + b*m[5])
    data[i+2] = Math.min(255, r*m[6] + g*m[7] + b*m[8])
  }
}

export default function ColorBlindSim() {
  const { t } = useTranslation('toolColorBlindSim')
  const [simType, setSimType] = useState<SimType>('protanopia')
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const origCanvasRef = useRef<HTMLCanvasElement>(null)
  const simCanvasRef = useRef<HTMLCanvasElement>(null)

  const SIM_TYPES: SimType[] = ['normal','protanopia','deuteranopia','tritanopia','achromatopsia']

  const renderSim = useCallback((src: string, type: SimType) => {
    const img = new Image()
    img.onload = () => {
      const w = img.naturalWidth
      const h = img.naturalHeight
      const scale = Math.min(1, 600 / Math.max(w, h))
      const sw = Math.round(w * scale)
      const sh = Math.round(h * scale)

      // 原图
      if (origCanvasRef.current) {
        const ctx = origCanvasRef.current.getContext('2d')!
        origCanvasRef.current.width = sw
        origCanvasRef.current.height = sh
        ctx.drawImage(img, 0, 0, sw, sh)
      }
      // 模拟
      if (simCanvasRef.current) {
        const ctx = simCanvasRef.current.getContext('2d')!
        simCanvasRef.current.width = sw
        simCanvasRef.current.height = sh
        ctx.drawImage(img, 0, 0, sw, sh)
        if (type !== 'normal') {
          const imageData = ctx.getImageData(0, 0, sw, sh)
          applyMatrix(imageData.data, MATRICES[type])
          ctx.putImageData(imageData, 0, 0)
        }
      }
    }
    img.src = src
  }, [])

  useEffect(() => {
    if (imageSrc) renderSim(imageSrc, simType)
  }, [imageSrc, simType, renderSim])

  const loadFile = (file: File) => {
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = e => setImageSrc(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) loadFile(file)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHero title={t('title')} description={t('description')} icon={Eye} />
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">

        {/* 上传 */}
        {!imageSrc && (
          <div
            onClick={() => fileRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={`cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition-colors ${
              dragging ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400'
            }`}>
            <Eye className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm text-gray-500">{t('uploadHint')}</p>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) loadFile(f) }} />
          </div>
        )}

        {/* 类型选择 */}
        {imageSrc && (
          <div className="flex gap-2 flex-wrap">
            {SIM_TYPES.map(type => (
              <button key={type} onClick={() => setSimType(type)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  simType === type ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                }`}>{t(type)}</button>
            ))}
            <button onClick={() => setImageSrc(null)}
              className="ml-auto px-3 py-2 text-xs text-gray-400 border border-gray-200 dark:border-gray-600 rounded-lg hover:text-red-400">重新上传</button>
          </div>
        )}

        {/* 对比展示 */}
        {imageSrc && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm font-medium text-center text-gray-600 dark:text-gray-400">{t('original')}</div>
              <canvas ref={origCanvasRef} className="w-full rounded-xl border border-gray-200 dark:border-gray-700" />
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-center text-indigo-600">{t('simulated')}: {t(simType)}</div>
              <canvas ref={simCanvasRef} className="w-full rounded-xl border border-indigo-200 dark:border-indigo-700" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
