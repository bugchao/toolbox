import React, { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Upload, Download, Copy, Check, Shuffle, Type, Image as ImageIcon, Trash2, Move, Maximize2, DownloadCloud } from 'lucide-react'
import { PageHero } from '@toolbox/ui-kit'

interface TextElement {
  id: string
  text: string
  x: number
  y: number
  fontSize: number
  color: string
  fontFamily: string
  fontWeight: 'normal' | 'bold'
  strokeColor: string
  strokeWidth: number
}

interface MemeTemplate {
  id: string
  name: string
  url: string
  category: string
}

const MemeGenerator: React.FC = () => {
  const { t } = useTranslation('nav')
  const { t: tHome } = useTranslation('home')
  const [originalImage, setOriginalImage] = useState<string | null>(null)
  const [textElements, setTextElements] = useState<TextElement[]>([])
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null)
  const [templates, setTemplates] = useState<MemeTemplate[]>([])
  const [activeTab, setActiveTab] = useState<'upload' | 'template'>('upload')
  const [draggingText, setDraggingText] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [copied, setCopied] = useState(false)
  const [exporting, setExporting] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 热门表情包模板
  useEffect(() => {
    // 内置热门模板
    const defaultTemplates: MemeTemplate[] = [
      { id: '1', name: '黑人问号', url: 'https://picsum.photos/seed/meme1/600/400', category: '热门' },
      { id: '2', name: '姚明笑', url: 'https://picsum.photos/seed/meme2/600/400', category: '热门' },
      { id: '3', name: '真香警告', url: 'https://picsum.photos/seed/meme3/600/400', category: '热门' },
      { id: '4', name: '我太南了', url: 'https://picsum.photos/seed/meme4/600/400', category: '流行' },
      { id: '5', name: '打工人', url: 'https://picsum.photos/seed/meme5/600/400', category: '流行' },
      { id: '6', name: '锦鲤', url: 'https://picsum.photos/seed/meme6/600/400', category: '吉祥' },
    ]
    setTemplates(defaultTemplates)
  }, [])

  // 上传图片
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        setOriginalImage(event.target?.result as string)
        setTextElements([])
      }
      img.src = event.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  // 使用模板
  const useTemplate = (template: MemeTemplate) => {
    setOriginalImage(template.url)
    setTextElements([])
  }

  // 添加文字
  const addText = () => {
    const newText: TextElement = {
      id: Date.now().toString(),
      text: '输入文字',
      x: 50,
      y: 50,
      fontSize: 32,
      color: '#ffffff',
      fontFamily: 'Impact, sans-serif',
      fontWeight: 'bold',
      strokeColor: '#000000',
      strokeWidth: 2,
    }
    setTextElements(prev => [...prev, newText])
    setSelectedTextId(newText.id)
  }

  // 更新文字属性
  const updateText = (id: string, field: keyof TextElement, value: any) => {
    setTextElements(prev => 
      prev.map(text => 
        text.id === id ? { ...text, [field]: value } : text
      )
    )
  }

  // 删除文字
  const deleteText = (id: string) => {
    setTextElements(prev => prev.filter(text => text.id !== id))
    if (selectedTextId === id) {
      setSelectedTextId(null)
    }
  }

  // 鼠标按下开始拖拽
  const handleMouseDown = (e: React.MouseEvent, text: TextElement) => {
    e.stopPropagation()
    setSelectedTextId(text.id)
    setDraggingText(text.id)
    
    const rect = canvasRef.current?.getBoundingClientRect()
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left - text.x,
        y: e.clientY - rect.top - text.y,
      })
    }
  }

  // 鼠标移动拖拽
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingText || !canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left - dragOffset.x
    const y = e.clientY - rect.top - dragOffset.y

    // 限制在画布范围内
    const maxX = rect.width - 100
    const maxY = rect.height - 50
    const boundedX = Math.max(0, Math.min(x, maxX))
    const boundedY = Math.max(0, Math.min(y, maxY))

    setTextElements(prev =>
      prev.map(text =>
        text.id === draggingText ? { ...text, x: boundedX, y: boundedY } : text
      )
    )
  }

  // 鼠标释放结束拖拽
  const handleMouseUp = () => {
    setDraggingText(null)
  }

  // 绘制画布
  useEffect(() => {
    if (!originalImage || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      // 设置画布尺寸
      const maxWidth = 600
      const maxHeight = 600
      let width = img.width
      let height = img.height

      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }
      if (height > maxHeight) {
        width = (width * maxHeight) / height
        height = maxHeight
      }

      canvas.width = width
      canvas.height = height

      // 绘制图片
      ctx.drawImage(img, 0, 0, width, height)

      // 绘制文字
      textElements.forEach(text => {
        ctx.font = `${text.fontWeight} ${text.fontSize}px ${text.fontFamily}`
        ctx.textBaseline = 'top'

        // 描边
        if (text.strokeWidth > 0) {
          ctx.strokeStyle = text.strokeColor
          ctx.lineWidth = text.strokeWidth
          ctx.lineJoin = 'round'
          ctx.strokeText(text.text, text.x, text.y)
        }

        // 填充
        ctx.fillStyle = text.color
        ctx.fillText(text.text, text.x, text.y)

        // 选中的文字显示边框
        if (selectedTextId === text.id) {
          const metrics = ctx.measureText(text.text)
          ctx.strokeStyle = '#3b82f6'
          ctx.lineWidth = 1
          ctx.setLineDash([5, 5])
          ctx.strokeRect(
            text.x - 2,
            text.y - 2,
            metrics.width + 4,
            text.fontSize + 4
          )
          ctx.setLineDash([])
        }
      })
    }
    img.src = originalImage
  }, [originalImage, textElements, selectedTextId])

  // 导出图片
  const exportImage = async () => {
    if (!canvasRef.current) return

    setExporting(true)
    try {
      // 导出为PNG
      canvasRef.current.toBlob((blob) => {
        if (!blob) return
        
        // 下载
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `meme-${Date.now()}.png`
        a.click()
        URL.revokeObjectURL(url)
      }, 'image/png', 1.0)
    } catch (error) {
      console.error('导出失败:', error)
      alert('导出失败，请重试')
    } finally {
      setExporting(false)
    }
  }

  // 复制到剪贴板
  const copyToClipboard = async () => {
    if (!canvasRef.current) return

    try {
      canvasRef.current.toBlob(async (blob) => {
        if (!blob) return
        
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ])
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
    } catch (error) {
      alert('复制失败，请重试')
    }
  }

  // 随机文字
  const randomText = () => {
    const texts = [
      '绝了',
      '我太难了',
      '妙啊',
      '还有这种操作？',
      '你说的对',
      '笑死',
      'EMO了',
      '打工人打工魂',
      '安排',
      '收到',
    ]
    const randomText = texts[Math.floor(Math.random() * texts.length)]
    
    if (selectedTextId) {
      updateText(selectedTextId, 'text', randomText)
    } else {
      const newText: TextElement = {
        id: Date.now().toString(),
        text: randomText,
        x: 50,
        y: 50,
        fontSize: 32,
        color: '#ffffff',
        fontFamily: 'Impact, sans-serif',
        fontWeight: 'bold',
        strokeColor: '#000000',
        strokeWidth: 2,
      }
      setTextElements(prev => [...prev, newText])
      setSelectedTextId(newText.id)
    }
  }

  // 清空画布
  const clearAll = () => {
    if (confirm('确定要清空所有内容吗？')) {
      setOriginalImage(null)
      setTextElements([])
      setSelectedTextId(null)
    }
  }

  const selectedText = textElements.find(t => t.id === selectedTextId)

  return (
    <div className="space-y-6">
      <PageHero
        title={t('tools.meme_generator')}
        description={tHome('toolDesc.meme_generator')}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧操作区 */}
        <div className="lg:col-span-1 space-y-6">
          {/* 图片来源选择 */}
          <div className="card">
            <div className="flex space-x-2 mb-4">
              <button
                onClick={() => setActiveTab('upload')}
                className={`flex-1 px-4 py-2 rounded-lg font-medium ${
                  activeTab === 'upload'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Upload className="w-4 h-4 inline mr-2" />
                上传图片
              </button>
              <button
                onClick={() => setActiveTab('template')}
                className={`flex-1 px-4 py-2 rounded-lg font-medium ${
                  activeTab === 'template'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <ImageIcon className="w-4 h-4 inline mr-2" />
                模板库
              </button>
            </div>

            {activeTab === 'upload' && (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-500 transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">点击或拖拽上传图片</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  选择图片
                </button>
              </div>
            )}

            {activeTab === 'template' && (
              <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => useTemplate(template)}
                    className="border border-gray-200 rounded-lg overflow-hidden hover:border-indigo-500 transition-colors group"
                  >
                    <img
                      src={template.url}
                      alt={template.name}
                      className="w-full h-24 object-cover group-hover:scale-105 transition-transform"
                    />
                    <p className="p-2 text-sm text-gray-700 truncate">{template.name}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 文字编辑 */}
          {originalImage && (
            <div className="card">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">文字编辑</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={addText}
                    className="bg-indigo-600 text-white px-3 py-1 rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                    title="添加文字"
                  >
                    <Type className="w-4 h-4 inline mr-1" />
                    添加
                  </button>
                  <button
                    onClick={randomText}
                    className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition-colors text-sm"
                    title="随机文字"
                  >
                    <Shuffle className="w-4 h-4 inline mr-1" />
                    随机
                  </button>
                </div>
              </div>

              {selectedText ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">文字内容</label>
                    <input
                      type="text"
                      value={selectedText.text}
                      onChange={(e) => updateText(selectedText.id, 'text', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">字体大小</label>
                      <input
                        type="number"
                        value={selectedText.fontSize}
                        onChange={(e) => updateText(selectedText.id, 'fontSize', Number(e.target.value))}
                        min="12"
                        max="120"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">字体粗细</label>
                      <select
                        value={selectedText.fontWeight}
                        onChange={(e) => updateText(selectedText.id, 'fontWeight', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="normal">正常</option>
                        <option value="bold">粗体</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">文字颜色</label>
                      <div className="flex">
                        <input
                          type="color"
                          value={selectedText.color}
                          onChange={(e) => updateText(selectedText.id, 'color', e.target.value)}
                          className="w-10 h-10 border-0 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={selectedText.color}
                          onChange={(e) => updateText(selectedText.id, 'color', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">描边颜色</label>
                      <div className="flex">
                        <input
                          type="color"
                          value={selectedText.strokeColor}
                          onChange={(e) => updateText(selectedText.id, 'strokeColor', e.target.value)}
                          className="w-10 h-10 border-0 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={selectedText.strokeColor}
                          onChange={(e) => updateText(selectedText.id, 'strokeColor', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">描边宽度</label>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={selectedText.strokeWidth}
                      onChange={(e) => updateText(selectedText.id, 'strokeWidth', Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="text-center text-sm text-gray-600 mt-1">
                      {selectedText.strokeWidth}px
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">字体</label>
                    <select
                      value={selectedText.fontFamily}
                      onChange={(e) => updateText(selectedText.id, 'fontFamily', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="Impact, sans-serif">Impact (经典)</option>
                      <option value="'Microsoft YaHei', sans-serif">微软雅黑</option>
                      <option value="'SimHei', sans-serif">黑体</option>
                      <option value="'KaiTi', serif">楷体</option>
                      <option value="'Arial', sans-serif">Arial</option>
                      <option value="'Comic Sans MS', cursive">Comic Sans</option>
                    </select>
                  </div>

                  <button
                    onClick={() => deleteText(selectedText.id)}
                    className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    删除文字
                  </button>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Type className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>点击"添加文字"按钮开始制作表情包</p>
                </div>
              )}
            </div>
          )}

          {/* 导出操作 */}
          {originalImage && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">导出操作</h3>
              <div className="space-y-3">
                <button
                  onClick={exportImage}
                  disabled={exporting}
                  className="w-full bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center disabled:opacity-50"
                >
                  {exporting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      导出中...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5 mr-2" />
                      下载PNG
                    </>
                  )}
                </button>

                <button
                  onClick={copyToClipboard}
                  className="w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  {copied ? (
                    <>
                      <Check className="w-5 h-5 mr-2" />
                      已复制到剪贴板
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5 mr-2" />
                      复制到剪贴板
                    </>
                  )}
                </button>

                <button
                  onClick={clearAll}
                  className="w-full bg-gray-200 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center"
                >
                  <Trash2 className="w-5 h-5 mr-2" />
                  清空内容
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 右侧预览区 */}
        <div className="lg:col-span-2">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Maximize2 className="w-5 h-5 mr-2 text-indigo-600" />
              预览区域
            </h3>

            {originalImage ? (
              <div 
                className="relative bg-gray-100 rounded-lg overflow-hidden flex justify-center"
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <canvas
                  ref={canvasRef}
                  className="max-w-full cursor-move"
                />
              </div>
            ) : (
              <div className="h-96 flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-lg">
                <ImageIcon className="w-24 h-24 mb-4 opacity-30" />
                <p className="text-lg">上传图片或选择模板开始制作表情包</p>
              </div>
            )}

            {originalImage && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start">
                  <Move className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">操作提示</p>
                    <ul className="space-y-1 list-disc pl-4">
                      <li>点击文字可以选中并编辑样式</li>
                      <li>拖拽文字可以调整位置</li>
                      <li>支持添加多个文字，制作多字幕表情包</li>
                      <li>所有操作均在本地完成，不会上传图片</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 使用说明 */}
      <div className="card bg-gray-50">
        <h3 className="text-lg font-bold text-gray-900 mb-3">使用说明</h3>
        <ul className="space-y-2 text-gray-600">
          <li className="flex items-start">
            <span className="text-indigo-600 mr-2">•</span>
            支持上传本地图片或选择内置模板制作表情包
          </li>
          <li className="flex items-start">
            <span className="text-indigo-600 mr-2">•</span>
            可添加多个文字，自定义字体、大小、颜色、描边效果
          </li>
          <li className="flex items-start">
            <span className="text-indigo-600 mr-2">•</span>
            所有图片和操作均在浏览器本地处理，不会上传到服务器，保护隐私
          </li>
          <li className="flex items-start">
            <span className="text-indigo-600 mr-2">•</span>
            支持导出高清PNG格式，或一键复制到剪贴板直接粘贴使用
          </li>
          <li className="flex items-start">
            <span className="text-indigo-600 mr-2">•</span>
            内置大量热门模板，持续更新中
          </li>
        </ul>
      </div>
    </div>
  )
}

export default MemeGenerator
