import React, { useState, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Palette, Copy, Download, Plus, Trash2 } from 'lucide-react'
import { PageHero } from '@toolbox/ui-kit'

interface ColorStop {
  id: string
  color: string
  position: number
}

type GradientType = 'linear' | 'radial' | 'conic'

export default function GradientGen() {
  const { t } = useTranslation('toolGradientGen')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  const [gradientType, setGradientType] = useState<GradientType>('linear')
  const [angle, setAngle] = useState(90)
  const [colorStops, setColorStops] = useState<ColorStop[]>([
    { id: '1', color: '#667eea', position: 0 },
    { id: '2', color: '#764ba2', position: 100 }
  ])

  const addColorStop = () => {
    if (colorStops.length >= 10) return
    const newStop: ColorStop = {
      id: Date.now().toString(),
      color: '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'),
      position: 50
    }
    setColorStops([...colorStops, newStop].sort((a, b) => a.position - b.position))
  }

  const removeColorStop = (id: string) => {
    if (colorStops.length <= 2) return
    setColorStops(colorStops.filter(s => s.id !== id))
  }

  const updateColorStop = (id: string, updates: Partial<ColorStop>) => {
    setColorStops(colorStops.map(s => s.id === id ? { ...s, ...updates } : s).sort((a, b) => a.position - b.position))
  }

  const cssCode = useMemo(() => {
    const stops = colorStops.map(s => `${s.color} ${s.position}%`).join(', ')
    switch (gradientType) {
      case 'linear':
        return `background: linear-gradient(${angle}deg, ${stops});`
      case 'radial':
        return `background: radial-gradient(circle, ${stops});`
      case 'conic':
        return `background: conic-gradient(from ${angle}deg, ${stops});`
    }
  }, [gradientType, angle, colorStops])

  const copyCSS = async () => {
    try {
      await navigator.clipboard.writeText(cssCode)
      alert(t('copied') || 'CSS 已复制')
    } catch (err) {
      console.error('Copy failed:', err)
    }
  }

  const exportImage = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = 800
    canvas.height = 600

    let gradient: CanvasGradient
    switch (gradientType) {
      case 'linear': {
        const rad = (angle * Math.PI) / 180
        const x1 = 400 - Math.cos(rad) * 400
        const y1 = 300 - Math.sin(rad) * 300
        const x2 = 400 + Math.cos(rad) * 400
        const y2 = 300 + Math.sin(rad) * 300
        gradient = ctx.createLinearGradient(x1, y1, x2, y2)
        break
      }
      case 'radial':
        gradient = ctx.createRadialGradient(400, 300, 0, 400, 300, 400)
        break
      case 'conic':
        gradient = ctx.createConicGradient((angle * Math.PI) / 180, 400, 300)
        break
    }

    colorStops.forEach(stop => {
      gradient.addColorStop(stop.position / 100, stop.color)
    })

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 800, 600)

    canvas.toBlob(blob => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `gradient-${Date.now()}.png`
      a.click()
      URL.revokeObjectURL(url)
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHero title={t('title')} description={t('description')} icon={Palette} />
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">

        {/* 预览区 */}
        <div 
          className="w-full h-64 rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-lg"
          style={{ background: cssCode.replace('background: ', '') }}
        />

        {/* 控制面板 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
          
          {/* 渐变类型 */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              {t('gradientType') || '渐变类型'}
            </label>
            <div className="flex gap-2">
              {(['linear', 'radial', 'conic'] as GradientType[]).map(type => (
                <button
                  key={type}
                  onClick={() => setGradientType(type)}
                  className={`flex-1 py-2 px-4 text-sm rounded-lg font-medium transition-colors ${
                    gradientType === type
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {t(type) || type}
                </button>
              ))}
            </div>
          </div>

          {/* 角度控制 */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              {t('angle') || '角度'}: {angle}°
            </label>
            <input
              type="range"
              min="0"
              max="360"
              value={angle}
              onChange={e => setAngle(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          {/* 颜色节点 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('colorStops') || '颜色节点'} ({colorStops.length}/10)
              </label>
              <button
                onClick={addColorStop}
                disabled={colorStops.length >= 10}
                className="flex items-center gap-1 px-3 py-1 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus size={14} />
                {t('add') || '添加'}
              </button>
            </div>
            
            <div className="space-y-3">
              {colorStops.map(stop => (
                <div key={stop.id} className="flex items-center gap-3">
                  <input
                    type="color"
                    value={stop.color}
                    onChange={e => updateColorStop(stop.id, { color: e.target.value })}
                    className="w-12 h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={stop.color}
                    onChange={e => updateColorStop(stop.id, { color: e.target.value })}
                    className="w-24 px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={stop.position}
                    onChange={e => updateColorStop(stop.id, { position: Number(e.target.value) })}
                    className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <span className="w-12 text-sm text-gray-600 dark:text-gray-400 text-right">
                    {stop.position}%
                  </span>
                  <button
                    onClick={() => removeColorStop(stop.id)}
                    disabled={colorStops.length <= 2}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* CSS 代码 */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              {t('cssCode') || 'CSS 代码'}
            </label>
            <div className="relative">
              <pre className="p-3 bg-gray-100 dark:bg-gray-900 rounded-lg text-xs text-gray-800 dark:text-gray-200 overflow-x-auto">
                {cssCode}
              </pre>
              <button
                onClick={copyCSS}
                className="absolute top-2 right-2 p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <Copy size={14} />
              </button>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={copyCSS}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
            >
              <Copy size={18} />
              {t('copyCSS') || '复制 CSS'}
            </button>
            <button
              onClick={exportImage}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
            >
              <Download size={18} />
              {t('exportImage') || '导出图片'}
            </button>
          </div>
        </div>

        {/* 隐藏的 canvas 用于导出 */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  )
}
