import React, { useState, useRef, useEffect } from 'react'
import { Upload, Download, Copy, ArrowLeftRight, FileText, X, Check } from 'lucide-react'
import { diffChars, diffWords, diffLines } from 'diff'

type DiffType = 'chars' | 'words' | 'lines'
type CompareResult = {
  value: string
  added?: boolean
  removed?: boolean
}[]

const TextComparator: React.FC = () => {
  const [leftText, setLeftText] = useState('')
  const [rightText, setRightText] = useState('')
  const [diffType, setDiffType] = useState<DiffType>('words')
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false)
  const [ignoreCase, setIgnoreCase] = useState(false)
  const [differences, setDifferences] = useState<CompareResult>([])
  const [stats, setStats] = useState({ added: 0, removed: 0, same: 0 })
  const [showStats, setShowStats] = useState(false)
  
  const leftFileInputRef = useRef<HTMLInputElement>(null)
  const rightFileInputRef = useRef<HTMLInputElement>(null)

  const compareTexts = () => {
    let a = leftText
    let b = rightText

    if (ignoreWhitespace) {
      a = a.replace(/\s+/g, ' ')
      b = b.replace(/\s+/g, ' ')
    }

    if (ignoreCase) {
      a = a.toLowerCase()
      b = b.toLowerCase()
    }

    let diffResult: CompareResult = []
    
    switch (diffType) {
      case 'chars':
        diffResult = diffChars(a, b)
        break
      case 'words':
        diffResult = diffWords(a, b)
        break
      case 'lines':
        diffResult = diffLines(a, b)
        break
    }

    setDifferences(diffResult)
    
    // 计算统计信息
    const added = diffResult.filter(part => part.added).reduce((sum, part) => sum + part.value.length, 0)
    const removed = diffResult.filter(part => part.removed).reduce((sum, part) => sum + part.value.length, 0)
    const same = diffResult.filter(part => !part.added && !part.removed).reduce((sum, part) => sum + part.value.length, 0)
    
    setStats({ added, removed, same })
    setShowStats(true)
  }

  const handleFileUpload = (side: 'left' | 'right', file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      if (side === 'left') {
        setLeftText(content)
      } else {
        setRightText(content)
      }
    }
    reader.readAsText(file)
  }

  const swapTexts = () => {
    const temp = leftText
    setLeftText(rightText)
    setRightText(temp)
  }

  const clearTexts = () => {
    setLeftText('')
    setRightText('')
    setDifferences([])
    setShowStats(false)
  }

  const copyResult = () => {
    const result = differences.map(part => {
      if (part.added) return `+ ${part.value}`
      if (part.removed) return `- ${part.value}`
      return part.value
    }).join('')
    navigator.clipboard.writeText(result)
  }

  const downloadResult = () => {
    const result = differences.map(part => {
      if (part.added) return `+ ${part.value}`
      if (part.removed) return `- ${part.value}`
      return part.value
    }).join('')
    const blob = new Blob([result], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'diff-result.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  useEffect(() => {
    if (leftText && rightText) {
      compareTexts()
    }
  }, [diffType, ignoreWhitespace, ignoreCase])

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">文本对比工具</h1>
        <p className="text-white opacity-80">快速对比两段文本的差异，支持字符、单词、行级对比</p>
      </div>

      {/* 控制面板 */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">对比粒度</label>
            <select
              value={diffType}
              onChange={(e) => setDiffType(e.target.value as DiffType)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="chars">字符对比</option>
              <option value="words">单词对比</option>
              <option value="lines">行对比</option>
            </select>
          </div>
          
          <div className="flex items-end space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={ignoreWhitespace}
                onChange={(e) => setIgnoreWhitespace(e.target.checked)}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700">忽略空白字符</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={ignoreCase}
                onChange={(e) => setIgnoreCase(e.target.checked)}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700">忽略大小写</span>
            </label>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={compareTexts}
              className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center"
            >
              <ArrowLeftRight className="w-4 h-4 mr-2" />
              开始对比
            </button>
            <button
              onClick={swapTexts}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              title="交换文本"
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>
            <button
              onClick={clearTexts}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              title="清空"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 统计信息 */}
      {showStats && (
        <div className="card bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">+{stats.added}</div>
              <div className="text-sm text-gray-600">新增字符</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">-{stats.removed}</div>
              <div className="text-sm text-gray-600">删除字符</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{stats.same}</div>
              <div className="text-sm text-gray-600">相同字符</div>
            </div>
          </div>
          <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="flex h-full">
              <div
                className="bg-red-500 h-full"
                style={{ width: `${(stats.removed / (stats.added + stats.removed + stats.same)) * 100}%` }}
              />
              <div
                className="bg-green-500 h-full"
                style={{ width: `${(stats.added / (stats.added + stats.removed + stats.same)) * 100}%` }}
              />
              <div
                className="bg-gray-300 h-full"
                style={{ width: `${(stats.same / (stats.added + stats.removed + stats.same)) * 100}%` }}
              />
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>删除</span>
            <span>新增</span>
            <span>相同</span>
          </div>
        </div>
      )}

      {/* 文本输入区域 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-white">原始文本</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => leftFileInputRef.current?.click()}
                className="text-sm bg-white/20 text-white px-3 py-1 rounded-lg hover:bg-white/30 transition-colors flex items-center"
              >
                <Upload className="w-3 h-3 mr-1" />
                上传文件
              </button>
              <input
                ref={leftFileInputRef}
                type="file"
                accept=".txt,.md,.json,.xml,.html,.css,.js,.ts"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileUpload('left', file)
                }}
              />
            </div>
          </div>
          <textarea
            value={leftText}
            onChange={(e) => setLeftText(e.target.value)}
            placeholder="请输入或粘贴原始文本..."
            className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none font-mono text-sm"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-white">对比文本</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => rightFileInputRef.current?.click()}
                className="text-sm bg-white/20 text-white px-3 py-1 rounded-lg hover:bg-white/30 transition-colors flex items-center"
              >
                <Upload className="w-3 h-3 mr-1" />
                上传文件
              </button>
              <input
                ref={rightFileInputRef}
                type="file"
                accept=".txt,.md,.json,.xml,.html,.css,.js,.ts"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileUpload('right', file)
                }}
              />
            </div>
          </div>
          <textarea
            value={rightText}
            onChange={(e) => setRightText(e.target.value)}
            placeholder="请输入或粘贴要对比的文本..."
            className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none font-mono text-sm"
          />
        </div>
      </div>

      {/* 对比结果 */}
      {differences.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-white">对比结果</h3>
            <div className="flex space-x-2">
              <button
                onClick={copyResult}
                className="bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors flex items-center"
              >
                <Copy className="w-4 h-4 mr-2" />
                复制结果
              </button>
              <button
                onClick={downloadResult}
                className="bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                导出文件
              </button>
            </div>
          </div>
          
          <div className="card overflow-x-auto">
            <pre className="font-mono text-sm whitespace-pre-wrap">
              {differences.map((part, i) => (
                <span
                  key={i}
                  className={`${
                    part.added
                      ? 'bg-green-100 text-green-800'
                      : part.removed
                      ? 'bg-red-100 text-red-800 line-through'
                      : 'text-gray-800'
                  }`}
                >
                  {part.value}
                </span>
              ))}
            </pre>
          </div>

          {/* 图例 */}
          <div className="flex justify-center space-x-6 text-sm text-white">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-100 rounded mr-2"></div>
              <span>新增内容</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-100 rounded mr-2"></div>
              <span>删除内容</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-gray-100 rounded mr-2"></div>
              <span>相同内容</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TextComparator
