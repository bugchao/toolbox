import React, { useState, useEffect, useRef } from 'react'
import { Copy, Check, Download, RefreshCw, Upload, Shuffle, Palette, Lock, Unlock, Eye, Sliders, Sun, Moon, ChevronDown, Save, FileCode, Code } from 'lucide-react'
import chroma from 'chroma-js'

interface Color {
  hex: string
  locked: boolean
}

interface SavedPalette {
  id: string
  name: string
  colors: string[]
  createdAt: string
}

const ColorGenerator: React.FC = () => {
  const [colors, setColors] = useState<Color[]>([])
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [colorMode, setColorMode] = useState<'hex' | 'rgb' | 'hsl'>('hex')
  const [paletteType, setPaletteType] = useState<'random' | 'analogous' | 'monochromatic' | 'complementary' | 'triadic' | 'split-complementary'>('random')
  const [baseColor, setBaseColor] = useState('#3b82f6')
  const [colorCount, setColorCount] = useState(5)
  const [contrastCheck, setContrastCheck] = useState(false)
  const [savedPalettes, setSavedPalettes] = useState<SavedPalette[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 初始化生成配色
  useEffect(() => {
    generatePalette()
    // 加载本地保存的配色
    const saved = localStorage.getItem('savedPalettes')
    if (saved) {
      setSavedPalettes(JSON.parse(saved))
    }
  }, [])

  // 保存配色到本地
  useEffect(() => {
    localStorage.setItem('savedPalettes', JSON.stringify(savedPalettes))
  }, [savedPalettes])

  // 生成配色方案
  const generatePalette = () => {
    let newColors: string[] = []

    switch (paletteType) {
      case 'analogous':
        newColors = chroma.scale([baseColor, chroma(baseColor).set('hsl.h', '+30'), chroma(baseColor).set('hsl.h', '-30')])
          .colors(colorCount)
        break
      
      case 'monochromatic':
        newColors = chroma.scale([chroma(baseColor).brighten(2), chroma(baseColor).darken(2)])
          .mode('lab')
          .colors(colorCount)
        break
      
      case 'complementary':
        const complement = chroma(baseColor).set('hsl.h', '+180')
        newColors = chroma.scale([baseColor, complement])
          .colors(colorCount)
        break
      
      case 'triadic':
        const c1 = chroma(baseColor).set('hsl.h', '+120')
        const c2 = chroma(baseColor).set('hsl.h', '-120')
        newColors = [baseColor, c1.hex(), c2.hex()]
        if (colorCount > 3) {
          newColors = newColors.concat(chroma.scale([baseColor, c1]).colors(colorCount - 2).slice(1))
        }
        break
      
      case 'split-complementary':
        const sc1 = chroma(baseColor).set('hsl.h', '+150')
        const sc2 = chroma(baseColor).set('hsl.h', '-150')
        newColors = [baseColor, sc1.hex(), sc2.hex()]
        if (colorCount > 3) {
          newColors = newColors.concat(chroma.scale([sc1, sc2]).colors(colorCount - 2).slice(1))
        }
        break
      
      default: // random
        newColors = Array.from({ length: colorCount }, () => chroma.random().hex())
    }

    // 确保颜色数量正确
    while (newColors.length < colorCount) {
      newColors.push(chroma.random().hex())
    }
    newColors = newColors.slice(0, colorCount)

    setColors(prev => 
      newColors.map((color, index) => ({
        hex: color,
        locked: prev[index]?.locked || false
      }))
    )
  }

  // 切换锁定状态
  const toggleLock = (index: number) => {
    setColors(prev => 
      prev.map((color, i) => 
        i === index ? { ...color, locked: !color.locked } : color
      )
    )
  }

  // 复制颜色值
  const copyColor = async (color: string, index: number) => {
    let value = color
    if (colorMode === 'rgb') {
      const rgb = chroma(color).rgb()
      value = `rgb(${Math.round(rgb[0])}, ${Math.round(rgb[1])}, ${Math.round(rgb[2])})`
    } else if (colorMode === 'hsl') {
      const hsl = chroma(color).hsl()
      value = `hsl(${Math.round(hsl[0])}, ${Math.round(hsl[1] * 100)}%, ${Math.round(hsl[2] * 100)}%)`
    }

    await navigator.clipboard.writeText(value)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  // 从图片提取配色
  const extractFromImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const pixels = imageData.data
        const colorMap = new Map<string, number>()

        // 采样像素
        for (let i = 0; i < pixels.length; i += 4 * 100) { // 每100个像素采样一个
          const r = pixels[i]
          const g = pixels[i + 1]
          const b = pixels[i + 2]
          const hex = chroma(r, g, b).hex()
          colorMap.set(hex, (colorMap.get(hex) || 0) + 1)
        }

        // 取出现频率最高的颜色
        const sortedColors = Array.from(colorMap.entries())
          .sort((a, b) => b[1] - a[1])
          .map(entry => entry[0])
          .slice(0, colorCount)

        setColors(sortedColors.map(color => ({ hex: color, locked: false })))
      }
      img.src = event.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  // 保存当前配色
  const savePalette = () => {
    const name = prompt('请输入配色方案名称：', `配色方案 ${savedPalettes.length + 1}`)
    if (!name) return

    const newPalette: SavedPalette = {
      id: Date.now().toString(),
      name,
      colors: colors.map(c => c.hex),
      createdAt: new Date().toISOString()
    }

    setSavedPalettes(prev => [newPalette, ...prev])
  }

  // 导出配色
  const exportPalette = () => {
    const data = {
      colors: colors.map(c => c.hex),
      mode: colorMode,
      type: paletteType,
      exportedAt: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `color-palette-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  // 导出为CSS变量
  const exportAsCSS = () => {
    const css = colors.map((color, index) => `--color-${index + 1}: ${color.hex};`).join('\n')
    const blob = new Blob([css], { type: 'text/css' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'colors.css'
    a.click()
    URL.revokeObjectURL(url)
  }

  // 导出为Tailwind配置
  const exportAsTailwind = () => {
    const config = `module.exports = {
  theme: {
    extend: {
      colors: {
        ${colors.map((color, index) => `'palette-${index + 1}': '${color.hex}',`).join('\n        ')}
      }
    }
  }
}`
    const blob = new Blob([config], { type: 'text/javascript' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'tailwind.colors.js'
    a.click()
    URL.revokeObjectURL(url)
  }

  // 计算对比度
  const getContrastRatio = (color1: string, color2: string) => {
    return chroma.contrast(color1, color2).toFixed(2)
  }

  // 获取文本颜色（根据背景色自动选择黑白）
  const getTextColor = (bgColor: string) => {
    return chroma(bgColor).luminance() > 0.5 ? '#000000' : '#ffffff'
  }

  const formatColorValue = (hex: string) => {
    if (colorMode === 'rgb') {
      const rgb = chroma(hex).rgb()
      return `rgb(${Math.round(rgb[0])}, ${Math.round(rgb[1])}, ${Math.round(rgb[2])})`
    } else if (colorMode === 'hsl') {
      const hsl = chroma(hex).hsl()
      return `hsl(${Math.round(hsl[0])}, ${Math.round(hsl[1] * 100)}%, ${Math.round(hsl[2] * 100)}%)`
    }
    return hex
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">AI配色生成器</h1>
        <p className="text-white opacity-80">智能生成专业配色方案，支持多种配色模式，一键导出使用</p>
      </div>

      {/* 控制面板 */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">配色模式</label>
            <select
              value={paletteType}
              onChange={(e) => setPaletteType(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="random">随机配色</option>
              <option value="analogous">类似色</option>
              <option value="monochromatic">单色渐变</option>
              <option value="complementary">互补色</option>
              <option value="triadic">三角色</option>
              <option value="split-complementary">分裂互补色</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">基准颜色</label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={baseColor}
                onChange={(e) => setBaseColor(e.target.value)}
                className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={baseColor}
                onChange={(e) => setBaseColor(e.target.value)}
                placeholder="#3b82f6"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">颜色数量</label>
            <input
              type="range"
              min="3"
              max="10"
              value={colorCount}
              onChange={(e) => setColorCount(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="text-center text-sm text-gray-600 mt-1">
              {colorCount} 种颜色
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">显示格式</label>
            <div className="flex space-x-2">
              <button
                onClick={() => setColorMode('hex')}
                className={`flex-1 px-3 py-2 rounded-lg font-medium ${
                  colorMode === 'hex' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                HEX
              </button>
              <button
                onClick={() => setColorMode('rgb')}
                className={`flex-1 px-3 py-2 rounded-lg font-medium ${
                  colorMode === 'rgb' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                RGB
              </button>
              <button
                onClick={() => setColorMode('hsl')}
                className={`flex-1 px-3 py-2 rounded-lg font-medium ${
                  colorMode === 'hsl' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                HSL
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 mt-6">
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={contrastCheck}
                onChange={(e) => setContrastCheck(e.target.checked)}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700">显示对比度</span>
            </label>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Upload className="w-4 h-4 mr-2" />
              从图片提取
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={extractFromImage}
            />
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={generatePalette}
              className="flex items-center px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Shuffle className="w-4 h-4 mr-2" />
              重新生成
            </button>

            <div className="relative group">
              <button
                className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                导出
                <ChevronDown className="w-4 h-4 ml-1" />
              </button>
              <div className="absolute right-0 z-10 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <div className="py-1">
                  <button
                    onClick={savePalette}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <Palette className="w-4 h-4 mr-2" />
                    保存到我的配色
                  </button>
                  <button
                    onClick={exportPalette}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    导出JSON
                  </button>
                  <button
                    onClick={exportAsCSS}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <FileCode className="w-4 h-4 mr-2" />
                    导出CSS变量
                  </button>
                  <button
                    onClick={exportAsTailwind}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <Code className="w-4 h-4 mr-2" />
                    导出Tailwind配置
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 配色展示 */}
      <div className="grid grid-cols-1 gap-4">
        {colors.map((color, index) => (
          <div
            key={index}
            className="rounded-lg shadow-lg overflow-hidden group relative"
            style={{ backgroundColor: color.hex }}
          >
            <div className="flex items-center justify-between p-6">
              <div 
                className="flex-1"
                style={{ color: getTextColor(color.hex) }}
              >
                <div className="text-2xl font-mono font-bold mb-2">
                  {formatColorValue(color.hex)}
                </div>
                {contrastCheck && (
                  <div className="flex space-x-4 text-sm opacity-80">
                    <span>与白色对比度: {getContrastRatio(color.hex, '#ffffff')}:1</span>
                    <span>与黑色对比度: {getContrastRatio(color.hex, '#000000')}:1</span>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => toggleLock(index)}
                  className={`p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors`}
                  style={{ color: getTextColor(color.hex) }}
                  title={color.locked ? '解锁' : '锁定'}
                >
                  {color.locked ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
                </button>
                <button
                  onClick={() => copyColor(color.hex, index)}
                  className={`p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex items-center`}
                  style={{ color: getTextColor(color.hex) }}
                  title="复制颜色"
                >
                  {copiedIndex === index ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* 悬停时显示更多信息 */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity p-4 flex items-center justify-between">
              <div className="text-white space-y-2">
                <div className="text-sm">
                  HEX: {color.hex.toUpperCase()}
                </div>
                <div className="text-sm">
                  RGB: {chroma(color.hex).rgb().map(v => Math.round(v)).join(', ')}
                </div>
                <div className="text-sm">
                  HSL: {chroma(color.hex).hsl().map((v, i) => i === 0 ? Math.round(v) : `${Math.round(v * 100)}%`).join(', ')}
                </div>
              </div>
              <div className="flex flex-col space-y-2">
                <button
                  onClick={() => copyColor(color.hex, index)}
                  className="px-4 py-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors flex items-center"
                >
                  {copiedIndex === index ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                  {copiedIndex === index ? '已复制' : '复制'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 渐变色预览 */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Palette className="w-5 h-5 mr-2 text-indigo-600" />
          渐变色预览
        </h3>
        <div className="grid grid-cols-1 gap-4">
          <div 
            className="h-24 rounded-lg overflow-hidden"
            style={{
              background: `linear-gradient(to right, ${colors.map(c => c.hex).join(', ')})`
            }}
          />
          <div 
            className="h-24 rounded-lg overflow-hidden"
            style={{
              background: `linear-gradient(to bottom, ${colors.map(c => c.hex).join(', ')})`
            }}
          />
          <div 
            className="h-24 rounded-lg overflow-hidden"
            style={{
              background: `conic-gradient(${colors.map((c, i) => `${c.hex} ${i * (360 / colors.length)}deg ${(i + 1) * (360 / colors.length)}deg`).join(', ')})`
            }}
          />
        </div>
      </div>

      {/* 已保存的配色 */}
      {savedPalettes.length > 0 && (
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Save className="w-5 h-5 mr-2 text-indigo-600" />
              我的收藏
            </h3>
            <button
              onClick={() => {
                if (confirm('确定要清空所有保存的配色吗？')) {
                  setSavedPalettes([])
                }
              }}
              className="text-sm text-red-600 hover:text-red-800"
            >
              清空
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedPalettes.map((palette) => (
              <div key={palette.id} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="flex h-16">
                  {palette.colors.map((color, i) => (
                    <div
                      key={i}
                      className="flex-1"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <div className="p-3">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-gray-900">{palette.name}</h4>
                  <div className="text-xs text-gray-500">
                    {new Date(palette.createdAt).toLocaleDateString('zh-CN')}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setColors(palette.colors.map(hex => ({ hex, locked: false })))
                      setBaseColor(palette.colors[0])
                    }}
                    className="flex-1 text-xs bg-indigo-600 text-white px-2 py-1 rounded hover:bg-indigo-700 transition-colors"
                  >
                    使用
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('确定要删除这个配色吗？')) {
                        setSavedPalettes(prev => prev.filter(p => p.id !== palette.id))
                      }
                    }}
                    className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded hover:bg-red-200 transition-colors"
                  >
                    删除
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ColorGenerator
