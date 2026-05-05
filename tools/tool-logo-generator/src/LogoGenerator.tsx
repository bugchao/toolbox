import React, { useState, useRef, useEffect } from 'react'
import { PageHero, ParticlesBackground } from '@toolbox/ui-kit'
import { useTranslation } from 'react-i18next'
import { Download, RefreshCw, Palette } from 'lucide-react'

interface LogoConfig {
  brandName: string
  brandDescription: string
  style: 'minimal' | 'modern' | 'vintage' | 'tech' | 'playful' | 'elegant'
  colorScheme: 'blue' | 'green' | 'red' | 'purple' | 'orange' | 'gray' | 'rainbow'
  size: number
}

const colorSchemes = {
  blue: ['#1e40af', '#3b82f6', '#60a5fa'],
  green: ['#15803d', '#22c55e', '#4ade80'],
  red: ['#b91c1c', '#ef4444', '#f87171'],
  purple: ['#7e22ce', '#a855f7', '#c084fc'],
  orange: ['#c2410c', '#f97316', '#fb923c'],
  gray: ['#374151', '#6b7280', '#9ca3af'],
  rainbow: ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6']
}

const LogoGenerator: React.FC = () => {
  const { t } = useTranslation('toolLogoGenerator')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [config, setConfig] = useState<LogoConfig>({
    brandName: '',
    brandDescription: '',
    style: 'minimal',
    colorScheme: 'blue',
    size: 512
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [hasGenerated, setHasGenerated] = useState(false)

  const updateConfig = (key: keyof LogoConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }))
  }

  // 生成 Logo
  const generateLogo = () => {
    if (!config.brandName.trim()) {
      alert(t('pleaseEnterBrandName'))
      return
    }

    setIsGenerating(true)
    setTimeout(() => {
      drawLogo()
      setIsGenerating(false)
      setHasGenerated(true)
    }, 500)
  }

  // 绘制 Logo
  const drawLogo = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const size = config.size
    canvas.width = size
    canvas.height = size

    // 清空画布
    ctx.clearRect(0, 0, size, size)

    const colors = colorSchemes[config.colorScheme]
    const centerX = size / 2
    const centerY = size / 2

    // 根据风格绘制不同的 Logo
    switch (config.style) {
      case 'minimal':
        drawMinimalLogo(ctx, centerX, centerY, size, colors)
        break
      case 'modern':
        drawModernLogo(ctx, centerX, centerY, size, colors)
        break
      case 'vintage':
        drawVintageLogo(ctx, centerX, centerY, size, colors)
        break
      case 'tech':
        drawTechLogo(ctx, centerX, centerY, size, colors)
        break
      case 'playful':
        drawPlayfulLogo(ctx, centerX, centerY, size, colors)
        break
      case 'elegant':
        drawElegantLogo(ctx, centerX, centerY, size, colors)
        break
    }

    // 绘制品牌名称
    drawBrandName(ctx, centerX, centerY, size, colors)
  }

  // 简约风格
  const drawMinimalLogo = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, colors: string[]) => {
    const radius = size * 0.25
    
    // 绘制圆形
    ctx.beginPath()
    ctx.arc(x, y - size * 0.08, radius, 0, Math.PI * 2)
    ctx.fillStyle = colors[0]
    ctx.fill()

    // 绘制首字母
    const initial = config.brandName.charAt(0).toUpperCase()
    ctx.fillStyle = '#ffffff'
    ctx.font = `bold ${size * 0.25}px Arial`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(initial, x, y - size * 0.08)
  }

  // 现代风格
  const drawModernLogo = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, colors: string[]) => {
    const rectSize = size * 0.35
    
    // 绘制渐变矩形
    const gradient = ctx.createLinearGradient(x - rectSize / 2, y - rectSize / 2, x + rectSize / 2, y + rectSize / 2)
    gradient.addColorStop(0, colors[0])
    gradient.addColorStop(1, colors[1])
    
    ctx.fillStyle = gradient
    ctx.fillRect(x - rectSize / 2, y - size * 0.15 - rectSize / 2, rectSize, rectSize)

    // 绘制首字母
    const initial = config.brandName.charAt(0).toUpperCase()
    ctx.fillStyle = '#ffffff'
    ctx.font = `bold ${size * 0.22}px Arial`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(initial, x, y - size * 0.15)
  }

  // 复古风格
  const drawVintageLogo = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, colors: string[]) => {
    const radius = size * 0.28
    
    // 绘制外圈
    ctx.beginPath()
    ctx.arc(x, y - size * 0.08, radius, 0, Math.PI * 2)
    ctx.strokeStyle = colors[0]
    ctx.lineWidth = size * 0.02
    ctx.stroke()

    // 绘制内圈
    ctx.beginPath()
    ctx.arc(x, y - size * 0.08, radius * 0.85, 0, Math.PI * 2)
    ctx.strokeStyle = colors[1]
    ctx.lineWidth = size * 0.015
    ctx.stroke()

    // 绘制首字母
    const initial = config.brandName.charAt(0).toUpperCase()
    ctx.fillStyle = colors[0]
    ctx.font = `bold ${size * 0.2}px serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(initial, x, y - size * 0.08)
  }

  // 科技风格
  const drawTechLogo = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, colors: string[]) => {
    const hexSize = size * 0.25
    
    // 绘制六边形
    ctx.beginPath()
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i
      const px = x + hexSize * Math.cos(angle)
      const py = y - size * 0.08 + hexSize * Math.sin(angle)
      if (i === 0) {
        ctx.moveTo(px, py)
      } else {
        ctx.lineTo(px, py)
      }
    }
    ctx.closePath()
    ctx.fillStyle = colors[0]
    ctx.fill()

    // 绘制内部线条
    ctx.strokeStyle = colors[2]
    ctx.lineWidth = size * 0.01
    ctx.beginPath()
    ctx.moveTo(x - hexSize * 0.5, y - size * 0.08)
    ctx.lineTo(x + hexSize * 0.5, y - size * 0.08)
    ctx.stroke()

    // 绘制首字母
    const initial = config.brandName.charAt(0).toUpperCase()
    ctx.fillStyle = '#ffffff'
    ctx.font = `bold ${size * 0.18}px monospace`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(initial, x, y - size * 0.08)
  }

  // 活泼风格
  const drawPlayfulLogo = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, colors: string[]) => {
    const radius = size * 0.12
    
    // 绘制多个圆形
    const positions = [
      { x: x - radius * 1.2, y: y - size * 0.08 - radius * 1.2 },
      { x: x + radius * 1.2, y: y - size * 0.08 - radius * 1.2 },
      { x: x - radius * 1.2, y: y - size * 0.08 + radius * 1.2 },
      { x: x + radius * 1.2, y: y - size * 0.08 + radius * 1.2 },
      { x: x, y: y - size * 0.08 }
    ]

    positions.forEach((pos, i) => {
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2)
      ctx.fillStyle = colors[i % colors.length]
      ctx.fill()
    })

    // 绘制首字母
    const initial = config.brandName.charAt(0).toUpperCase()
    ctx.fillStyle = '#ffffff'
    ctx.font = `bold ${size * 0.15}px Arial`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(initial, x, y - size * 0.08)
  }

  // 优雅风格
  const drawElegantLogo = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, colors: string[]) => {
    const width = size * 0.4
    const height = size * 0.35
    
    // 绘制椭圆
    ctx.beginPath()
    ctx.ellipse(x, y - size * 0.08, width / 2, height / 2, 0, 0, Math.PI * 2)
    ctx.fillStyle = colors[0]
    ctx.fill()

    // 绘制装饰线
    ctx.strokeStyle = colors[1]
    ctx.lineWidth = size * 0.008
    ctx.beginPath()
    ctx.ellipse(x, y - size * 0.08, width / 2 * 0.7, height / 2 * 0.7, 0, 0, Math.PI * 2)
    ctx.stroke()

    // 绘制首字母
    const initial = config.brandName.charAt(0).toUpperCase()
    ctx.fillStyle = '#ffffff'
    ctx.font = `italic bold ${size * 0.2}px serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(initial, x, y - size * 0.08)
  }

  // 绘制品牌名称
  const drawBrandName = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, colors: string[]) => {
    ctx.fillStyle = colors[0]
    ctx.font = `bold ${size * 0.08}px Arial`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillText(config.brandName.toUpperCase(), x, y + size * 0.25)
  }

  // 下载 PNG
  const downloadPNG = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement('a')
    link.download = `${config.brandName}-logo.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  // 下载 SVG
  const downloadSVG = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    // 简单的 SVG 导出（将 canvas 转为 image）
    const dataUrl = canvas.toDataURL('image/png')
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${config.size}" height="${config.size}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <image width="${config.size}" height="${config.size}" xlink:href="${dataUrl}"/>
</svg>`

    const blob = new Blob([svg], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.download = `${config.brandName}-logo.svg`
    link.href = url
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="relative min-h-[60vh]">
      <ParticlesBackground preset="minimal" className="absolute inset-0" />
      <div className="relative z-10 space-y-6">
        <PageHero
          title={t('title')}
          description={t('description')}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 左侧：配置面板 */}
          <div className="card space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('brandName')}
              </label>
              <input
                type="text"
                value={config.brandName}
                onChange={(e) => updateConfig('brandName', e.target.value)}
                placeholder={t('brandNamePlaceholder')}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('brandDescription')}
              </label>
              <textarea
                value={config.brandDescription}
                onChange={(e) => updateConfig('brandDescription', e.target.value)}
                placeholder={t('brandDescriptionPlaceholder')}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                {t('logoStyle')}
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['minimal', 'modern', 'vintage', 'tech', 'playful', 'elegant'] as const).map((style) => (
                  <button
                    key={style}
                    onClick={() => updateConfig('style', style)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      config.style === style
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {t(`style${style.charAt(0).toUpperCase() + style.slice(1)}`)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                {t('colorScheme')}
              </label>
              <div className="grid grid-cols-4 gap-3">
                {(['blue', 'green', 'red', 'purple', 'orange', 'gray', 'rainbow'] as const).map((color) => (
                  <button
                    key={color}
                    onClick={() => updateConfig('colorScheme', color)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      config.colorScheme === color
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {t(`color${color.charAt(0).toUpperCase() + color.slice(1)}`)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('logoSize')}
              </label>
              <select
                value={config.size}
                onChange={(e) => updateConfig('size', Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              >
                <option value={256}>256 x 256</option>
                <option value={512}>512 x 512</option>
                <option value={1024}>1024 x 1024</option>
              </select>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={generateLogo}
                disabled={isGenerating}
                className="flex-1 flex items-center justify-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Palette className="w-5 h-5 mr-2" />
                {isGenerating ? t('generating') : hasGenerated ? t('regenerate') : t('generate')}
              </button>
            </div>
          </div>

          {/* 右侧：预览和下载 */}
          <div className="card space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('preview')}
            </h3>
            
            <div className="flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg p-8">
              <canvas
                ref={canvasRef}
                className="max-w-full h-auto border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg"
                style={{ maxHeight: '400px' }}
              />
            </div>

            {hasGenerated && (
              <div className="flex space-x-3">
                <button
                  onClick={downloadPNG}
                  className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {t('downloadPNG')}
                </button>
                <button
                  onClick={downloadSVG}
                  className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {t('downloadSVG')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default LogoGenerator
