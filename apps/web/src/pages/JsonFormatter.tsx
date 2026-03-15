import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Copy, Download, RefreshCw, Check, AlertCircle } from 'lucide-react'
import { PageHero } from '@toolbox/ui-kit'

const JsonFormatter: React.FC = () => {
  const { t } = useTranslation('nav')
  const { t: tHome } = useTranslation('home')
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [indentSize, setIndentSize] = useState(2)

  const formatJson = () => {
    try {
      if (!input.trim()) {
        setError('请输入JSON内容')
        return
      }
      const parsed = JSON.parse(input)
      const formatted = JSON.stringify(parsed, null, indentSize)
      setOutput(formatted)
      setError('')
    } catch (e) {
      setError(`JSON格式错误: ${(e as Error).message}`)
      setOutput('')
    }
  }

  const minifyJson = () => {
    try {
      if (!input.trim()) {
        setError('请输入JSON内容')
        return
      }
      const parsed = JSON.parse(input)
      const minified = JSON.stringify(parsed)
      setOutput(minified)
      setError('')
    } catch (e) {
      setError(`JSON格式错误: ${(e as Error).message}`)
      setOutput('')
    }
  }

  const copyToClipboard = async () => {
    if (!output) return
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadJson = () => {
    if (!output) return
    const blob = new Blob([output], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'formatted.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const clearAll = () => {
    setInput('')
    setOutput('')
    setError('')
  }

  return (
    <div className="max-w-4xl mx-auto">
      <PageHero title={t('tools.json')} description={tHome('toolDesc.json')} className="mb-8" />

      <div className="space-y-6">
        {/* 操作栏 */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">缩进大小:</label>
            <select
              value={indentSize}
              onChange={(e) => setIndentSize(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value={2}>2空格</option>
              <option value={4}>4空格</option>
              <option value={8}>8空格</option>
            </select>
          </div>

          <button
            onClick={formatJson}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            格式化
          </button>

          <button
            onClick={minifyJson}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            压缩
          </button>

          <button
            onClick={copyToClipboard}
            disabled={!output}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400 flex items-center gap-2"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? '已复制' : '复制结果'}
          </button>

          <button
            onClick={downloadJson}
            disabled={!output}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            下载JSON
          </button>

          <button
            onClick={clearAll}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            清空
          </button>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-red-700">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* 输入框 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">输入JSON内容</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='{"name": "工具盒子", "features": ["JSON格式化", "Base64编解码"]}'
            className="w-full h-64 p-4 border border-gray-300 rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* 输出框 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">输出结果</label>
          <textarea
            value={output}
            readOnly
            placeholder="格式化后的JSON会显示在这里"
            className="w-full h-64 p-4 border border-gray-300 rounded-md font-mono text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>
    </div>
  )
}

export default JsonFormatter
