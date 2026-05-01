import React, { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Palette, Copy, Check, Shuffle } from 'lucide-react'
import { PageHero } from '@toolbox/ui-kit'

interface ColorStop {
  id: string
  color: string
  position: number
}

type GradientType = 'linear' | 'radial' | 'conic'

const PRESETS: Record<string, ColorStop[]> = {
  preset1: [
    { id: '1', color: '#FF6B6B', position: 0 },
    { id: '2', color: '#FFD93D', position: 50 },
    { id: '3', color: '#FF8E53', position: 100 }
  ],
  preset2: [
    { id: '1', color: '#4FACFE', position: 0 },
    { id: '2', color: '#00F2FE', position: 100 }
  ],
  preset3: [
    { id: '1', color: '#11998E', position: 0 },
    { id: '2', color: '#38EF7D', position: 100 }
  ],
  preset4: [
    { id: '1', color: '#A770EF', position: 0 },
    { id: '2', color: '#CF8BF3', position: 50 },
    { id: '3', color: '#FDB99B', position: 100 }
  ],
  preset5: [
    { id: '1', color: '#F83600', position: 0 },
    { id: '2', color: '#FE8C00', position: 100 }
  ],
  preset6: [
    { id: '1', color: '#56CCF2', position: 0 },
    { id: '2', color: '#2F80ED', position: 100 }
  ],
  preset7: [
    { id: '1', color: '#FFB6C1', position: 0 },
    { id: '2', color: '#FFC0CB', position: 50 },
    { id: '3', color: '#FFE4E1', position: 100 }
  ],
  preset8: [
    { id: '1', color: '#00C9FF', position: 0 },
    { id: '2', color: '#92FE9D', position: 100 }
  ],
  preset9: [
    { id: '1', color: '#FA709A', position: 0 },
    { id: '2', color: '#FEE140', position: 100 }
  ],
  preset10: [
    { id: '1', color: '#0F2027', position: 0 },
    { id: '2', color: '#203A43', position: 50 },
    { id: '3', color: '#2C5364', position: 100 }
  ]
}

function randomColor() {
  return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')
}

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 }
}

export default function GradientGen() {
  const { t } = useTranslation('toolGradientGen')
  const [type, setType] = useState<GradientType>('linear')
  const [angle, setAngle] = useState(90)
  const [colors, setColors] = useState<ColorStop[]>([
    { id: '1', color: '#667EEA', position: 0 },
    { id: '2', color: '#764BA2', position: 100 }
  ])
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const gradientCSS = useMemo(() => {
    const stops = colors
      .sort((a, b) => a.position - b.position)
      .map(c => `${c.color} ${c.position}%`)
      .join(', ')
    
    if (type === 'linear') {
      return `linear-gradient(${angle}deg, ${stops})`
    } else if (type === 'radial') {
      return `radial-gradient(circle, ${stops})`
    } else {
      return `conic-gradient(from ${angle}deg, ${stops})`
    }
  }, [type, angle, colors])

  const svgCode = useMemo(() => {
    const stops = colors
      .sort((a, b) => a.position - b.position)
      .map((c, i) => `    <stop offset="${c.position}%" stop-color="${c.color}" />`)
      .join('\n')
    
    if (type === 'linear') {
      const rad = (angle * Math.PI) / 180
      const x2 = 50 + 50 * Math.cos(rad)
      const y2 = 50 + 50 * Math.sin(rad)
      return `<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="50%" y1="50%" x2="${x2}%" y2="${y2}%">
${stops}
    </linearGradient>
  </defs>
  <rect width="400" height="400" fill="url(#grad)" />
</svg>`
    } else if (type === 'radial') {
      return `<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="grad">
${stops}
    </radialGradient>
  </defs>
  <rect width="400" height="400" fill="url(#grad)" />
</svg>`
    } else {
      return `<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" gradientTransform="rotate(${angle})">
${stops}
    </linearGradient>
  </defs>
  <rect width="400" height="400" fill="url(#grad)" />
</svg>`
    }
  }, [type, angle, colors])

  const tailwindCode = useMemo(() => {
    const stops = colors
      .sort((a, b) => a.position - b.position)
      .map(c => {
        const rgb = hexToRgb(c.color)
        return `[${c.position}%]:rgb(${rgb.r},${rgb.g},${rgb.b})`
      })
      .join(' ')
    
    if (type === 'linear') {
      return `bg-gradient-to-r from-${stops}`
    } else if (type === 'radial') {
      return `bg-radial-gradient ${stops}`
    } else {
      return `bg-conic-gradient ${stops}`
    }
  }, [type, colors])

  const addColor = () => {
    const newId = String(Math.max(...colors.map(c => Number(c.id))) + 1)
    const newPosition = colors.length > 0 ? Math.min(100, Math.max(...colors.map(c => c.position)) + 20) : 50
    setColors([...colors, { id: newId, color: randomColor(), position: newPosition }])
  }

  const removeColor = (id: string) => {
    if (colors.length > 2) {
      setColors(colors.filter(c => c.id !== id))
    }
  }

  const updateColor = (id: string, field: 'color' | 'position', value: string | number) => {
    setColors(colors.map(c => c.id === id ? { ...c, [field]: value } : c))
  }

  const copyCode = (code: string, type: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(type)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const randomGradient = () => {
    const count = 2 + Math.floor(Math.random() * 3)
    const newColors: ColorStop[] = []
    for (let i = 0; i < count; i++) {
      newColors.push({
        id: String(i + 1),
        color: randomColor(),
        position: Math.round((100 / (count - 1)) * i)
      })
    }
    setColors(newColors)
    setAngle(Math.floor(Math.random() * 360))
  }

  const loadPreset = (presetKey: string) => {
    setColors(PRESETS[presetKey].map(c => ({ ...c })))
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHero title={t('title')} description={t('description')} icon={Palette} />
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        
        {/* 控制面板 */}
        <div className="grid lg:grid-cols-2 gap-6">
          
          {/* 左侧：参数设置 */}
          <div className="space-y-4">
            
            {/* 渐变类型 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">{t('gradientType')}</label>
              <div className="grid grid-cols-3 gap-2">
                {(['linear', 'radial', 'conic'] as GradientType[]).map(t_type => (
                  <button
                    key={t_type}
                    onClick={() => setType(t_type)}
                    className={`py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                      type === t_type
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {t(t_type)}
                  </button>
                ))}
              </div>
            </div>

            {/* 角度 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                {t('angle')}: {angle}°
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
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('colors')}</label>
                <button
                  onClick={addColor}
                  disabled={colors.length >= 5}
                  className="text-xs px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('addColor')}
                </button>
              </div>
              <div className="space-y-3">
                {colors.map(color => (
                  <div key={color.id} className="flex items-center gap-3">
                    <input
                      type="color"
                      value={color.color}
                      onChange={e => updateColor(color.id, 'color', e.target.value)}
                      className="w-12 h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={color.color}
                      onChange={e => updateColor(color.id, 'color', e.target.value)}
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={color.position}
                        onChange={e => updateColor(color.id, 'position', Number(e.target.value))}
                        className="w-16 px-2 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                      <span className="text-xs text-gray-500">%</span>
                    </div>
                    <button
                      onClick={() => removeColor(color.id)}
                      disabled={colors.length <= 2}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed"
                      title={t('removeColor')}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 快捷操作 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <button
                onClick={randomGradient}
                className="w-full py-2 px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 flex items-center justify-center gap-2"
              >
                <Shuffle className="w-4 h-4" />
                {t('randomGradient')}
              </button>
            </div>

            {/* 预设方案 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">{t('presets')}</label>
              <div className="grid grid-cols-5 gap-2">
                {Object.keys(PRESETS).map(key => (
                  <button
                    key={key}
                    onClick={() => loadPreset(key)}
                    className="aspect-square rounded-lg border-2 border-gray-200 dark:border-gray-600 hover:border-indigo-500 transition-colors"
                    style={{
                      background: `linear-gradient(135deg, ${PRESETS[key].map(c => `${c.color} ${c.position}%`).join(', ')})`
                    }}
                    title={t(key)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* 右侧：预览和代码 */}
          <div className="space-y-4">
            
            {/* 预览 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">{t('preview')}</label>
              <div
                className="w-full aspect-square rounded-xl shadow-lg"
                style={{ background: gradientCSS }}
              />
            </div>

            {/* CSS 代码 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('cssCode')}</label>
                <button
                  onClick={() => copyCode(gradientCSS, 'css')}
                  className="text-xs px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center gap-1"
                >
                  {copiedCode === 'css' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copiedCode === 'css' ? t('copied') : t('copy')}
                </button>
              </div>
              <pre className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg text-xs text-gray-800 dark:text-gray-200 overflow-x-auto">
                <code>background: {gradientCSS};</code>
              </pre>
            </div>

            {/* Tailwind CSS */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('tailwindCode')}</label>
                <button
                  onClick={() => copyCode(tailwindCode, 'tailwind')}
                  className="text-xs px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center gap-1"
                >
                  {copiedCode === 'tailwind' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copiedCode === 'tailwind' ? t('copied') : t('copy')}
                </button>
              </div>
              <pre className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg text-xs text-gray-800 dark:text-gray-200 overflow-x-auto">
                <code>{tailwindCode}</code>
              </pre>
            </div>

            {/* SVG 代码 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('svgCode')}</label>
                <button
                  onClick={() => copyCode(svgCode, 'svg')}
                  className="text-xs px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center gap-1"
                >
                  {copiedCode === 'svg' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copiedCode === 'svg' ? t('copied') : t('copy')}
                </button>
              </div>
              <pre className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg text-xs text-gray-800 dark:text-gray-200 overflow-x-auto max-h-48">
                <code>{svgCode}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
