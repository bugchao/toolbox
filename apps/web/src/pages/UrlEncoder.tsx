import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Copy, RefreshCw, Check } from 'lucide-react'
import { PageHero } from '@toolbox/ui-kit'

const UrlEncoder: React.FC = () => {
  const { t } = useTranslation('nav')
  const { t: tHome } = useTranslation('home')
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  const convert = () => {
    try {
      setError('')
      if (!input.trim()) {
        setError('请输入内容')
        return
      }

      if (mode === 'encode') {
        const encoded = encodeURIComponent(input)
        setOutput(encoded)
      } else {
        const decoded = decodeURIComponent(input)
        setOutput(decoded)
      }
    } catch (e) {
      setError(`转换失败: ${(e as Error).message}`)
      setOutput('')
    }
  }

  const copyToClipboard = async () => {
    if (!output) return
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const clearAll = () => {
    setInput('')
    setOutput('')
    setError('')
  }

  return (
    <div className="max-w-4xl mx-auto">
      <PageHero title={t('tools.url')} description={tHome('toolDesc.url')} className="mb-8" />

      <div className="space-y-6">
        {/* 操作栏 */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-md">
            <button
              onClick={() => setMode('encode')}
              className={`px-4 py-2 rounded-md transition-colors ${
                mode === 'encode' ? 'bg-indigo-600 text-white' : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              编码
            </button>
            <button
              onClick={() => setMode('decode')}
              className={`px-4 py-2 rounded-md transition-colors ${
                mode === 'decode' ? 'bg-indigo-600 text-white' : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              解码
            </button>
          </div>

          <button
            onClick={convert}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            转换
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
            onClick={clearAll}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            清空
          </button>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
            {error}
          </div>
        )}

        {/* 输入框 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {mode === 'encode' ? '输入要编码的URL或参数' : '输入要解码的URL或参数'}
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === 'encode' ? '例如: https://example.com?name=工具盒子' : '例如: https%3A%2F%2Fexample.com%3Fname%3D%E5%B7%A5%E5%85%B7%E7%9B%92%E5%AD%90'}
            className="w-full h-48 p-4 border border-gray-300 rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* 输出框 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">输出结果</label>
          <textarea
            value={output}
            readOnly
            placeholder="转换结果会显示在这里"
            className="w-full h-48 p-4 border border-gray-300 rounded-md font-mono text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* 说明 */}
        <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
          <h3 className="text-sm font-medium text-blue-800 mb-2">使用说明</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• URL编码（Percent-encoding）是一种浏览器用来打包表单输入的格式</li>
            <li>• 会将非ASCII字符、特殊字符转换为%XX的格式</li>
            <li>• 常用于处理URL参数、表单提交、爬虫等场景</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default UrlEncoder
