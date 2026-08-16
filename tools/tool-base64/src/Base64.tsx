import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Upload, RefreshCw } from 'lucide-react'
import { CopyButton, PageHero } from '@toolbox/ui-kit'

const Base64: React.FC = () => {
  const { t } = useTranslation('nav')
  const { t: tHome } = useTranslation('home')
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')
  const [error, setError] = useState('')

  const convert = () => {
    try {
      setError('')
      if (!input.trim()) {
        setError('请输入内容')
        return
      }

      if (mode === 'encode') {
        const encoded = btoa(unescape(encodeURIComponent(input)))
        setOutput(encoded)
      } else {
        const decoded = decodeURIComponent(escape(atob(input)))
        setOutput(decoded)
      }
    } catch (e) {
      setError(`转换失败: ${(e as Error).message}`)
      setOutput('')
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const result = event.target?.result as string
      setOutput(result)
      setInput(`文件: ${file.name}`)
    }
    reader.readAsDataURL(file)
  }

  const clearAll = () => {
    setInput('')
    setOutput('')
    setError('')
  }

  return (
    <div className="max-w-4xl mx-auto">
      <PageHero
        title={t('tools.base64')}
        description={tHome('toolDesc.base64')}
        className="mb-8"
      />

      <div className="space-y-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-md">
            <button
              onClick={() => setMode('encode')}
              className={`px-4 py-2 rounded-md transition-colors ${
                mode === 'encode' ? 'bg-indigo-600 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              编码
            </button>
            <button
              onClick={() => setMode('decode')}
              className={`px-4 py-2 rounded-md transition-colors ${
                mode === 'decode' ? 'bg-indigo-600 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
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

          <label className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors cursor-pointer flex items-center gap-2">
            <Upload className="w-4 h-4" />
            上传图片编码
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          <CopyButton
            variant="button"
            value={output}
            disabled={!output}
            label="复制结果"
            copiedLabel="已复制"
            className="!bg-green-600 !text-white hover:!bg-green-700"
          />

          <button
            onClick={clearAll}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            清空
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {mode === 'encode' ? '输入要编码的文本' : '输入要解码的Base64字符串'}
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === 'encode' ? '输入文本...' : '输入Base64字符串...'}
            className="w-full h-64 p-4 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">输出结果</label>
          {mode === 'encode' && output.startsWith('data:image/') ? (
            <div className="p-4 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700/30">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">图片预览:</p>
              <img src={output} alt="Base64 preview" className="max-h-64 max-w-full object-contain mb-4" />
              <textarea
                value={output}
                readOnly
                className="w-full h-32 p-4 border border-gray-300 dark:border-gray-600 rounded-md font-mono text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          ) : (
            <textarea
              value={output}
              readOnly
              placeholder="转换结果会显示在这里"
              className="w-full h-64 p-4 border border-gray-300 dark:border-gray-600 rounded-md font-mono text-sm bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default Base64
