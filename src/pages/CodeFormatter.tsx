import React, { useState } from 'react'
import { Copy, Download, RefreshCw, Check } from 'lucide-react'

const CodeFormatter: React.FC = () => {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [language, setLanguage] = useState('json')
  const [indentSize, setIndentSize] = useState(2)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  const languages = [
    { value: 'json', label: 'JSON', ext: 'json' },
    { value: 'javascript', label: 'JavaScript', ext: 'js' },
    { value: 'typescript', label: 'TypeScript', ext: 'ts' },
    { value: 'html', label: 'HTML', ext: 'html' },
    { value: 'css', label: 'CSS', ext: 'css' },
    { value: 'scss', label: 'SCSS', ext: 'scss' },
    { value: 'yaml', label: 'YAML', ext: 'yaml' },
    { value: 'markdown', label: 'Markdown', ext: 'md' },
    { value: 'sql', label: 'SQL', ext: 'sql' },
  ]

  // 简单的JSON格式化
  const formatJson = (code: string) => {
    try {
      const parsed = JSON.parse(code)
      return JSON.stringify(parsed, null, indentSize)
    } catch (e) {
      throw new Error(`JSON格式错误: ${(e as Error).message}`)
    }
  }

  // 简单的XML/HTML格式化
  const formatXml = (code: string) => {
    let formatted = ''
    let indent = 0
    const indentStr = ' '.repeat(indentSize)
    
    code = code.replace(/>\s*</g, '><').trim()
    
    for (let i = 0; i < code.length; i++) {
      let char = code[i]
      
      if (char === '<') {
        if (code[i + 1] === '/') {
          indent--
          formatted += '\n' + indentStr.repeat(indent)
        } else {
          formatted += '\n' + indentStr.repeat(indent)
          indent++
        }
      }
      
      formatted += char
      
      if (char === '>') {
        if (code[i - 1] === '/') {
          indent--
        }
      }
    }
    
    return formatted.trim()
  }

  const formatCode = () => {
    try {
      setError('')
      if (!input.trim()) {
        setError('请输入代码内容')
        return
      }

      let formatted = input

      if (language === 'json') {
        formatted = formatJson(input)
      } else if (language === 'html' || language === 'xml') {
        formatted = formatXml(input)
      } else {
        // 其他语言简单处理，按缩进格式化
        const lines = input.split('\n')
        let indentLevel = 0
        formatted = lines.map(line => {
          const trimmed = line.trim()
          if (trimmed.endsWith('}') || trimmed.endsWith(')') || trimmed.endsWith(']')) {
            indentLevel = Math.max(0, indentLevel - 1)
          }
          const result = ' '.repeat(indentLevel * indentSize) + trimmed
          if (trimmed.endsWith('{') || trimmed.endsWith('(') || trimmed.endsWith('[')) {
            indentLevel++
          }
          return result
        }).join('\n')
      }

      setOutput(formatted)
    } catch (e) {
      setError(`格式化失败: ${(e as Error).message}`)
      setOutput('')
    }
  }

  const copyToClipboard = async () => {
    if (!output) return
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadCode = () => {
    if (!output) return
    const langConfig = languages.find(lang => lang.value === language)
    const blob = new Blob([output], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `formatted.${langConfig?.ext || 'txt'}`
    a.click()
    URL.revokeObjectURL(url)
  }

  const clearAll = () => {
    setInput('')
    setOutput('')
    setError('')
  }

  // 示例代码
  const loadExample = () => {
    const examples: Record<string, string> = {
      json: '{"name":"工具盒子","features":["JSON格式化","Base64编解码","时间戳转换"],"version":"1.0.0","author":"Dyck"}',
      javascript: 'function hello(name){return `Hello, ${name}!`}const user={name:"超哥",age:25,skills:["React","TypeScript","Node.js"]}',
      html: '<!DOCTYPE html><html><head><title>工具盒子</title></head><body><h1>欢迎使用工具盒子</h1><p>这是一个多功能在线工具集</p></body></html>',
      css: 'body{font-family:Arial,sans-serif;margin:0;padding:0;background-color:#f5f5f5}.container{max-width:1200px;margin:0 auto;padding:20px}',
      yaml: 'name: 工具盒子\nversion: 1.0.0\nfeatures:\n  - JSON格式化\n  - Base64编解码\n  - 时间戳转换\nauthor: Dyck',
    }

    setInput(examples[language] || '// 输入你的代码在这里')
    setOutput('')
    setError('')
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">代码美化工具</h2>
        <p className="text-gray-600">支持JSON、HTML、CSS、JS、TS等多种代码的格式化美化</p>
      </div>

      <div className="space-y-6">
        {/* 操作栏 */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">语言:</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {languages.map(lang => (
                <option key={lang.value} value={lang.value}>{lang.label}</option>
              ))}
            </select>
          </div>

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
            onClick={formatCode}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            格式化
          </button>

          <button
            onClick={loadExample}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            加载示例
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
            onClick={downloadCode}
            disabled={!output}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            下载文件
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
          <label className="block text-sm font-medium text-gray-700 mb-2">输入代码</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="输入要格式化的代码..."
            className="w-full h-64 p-4 border border-gray-300 rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* 输出框 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">格式化结果</label>
          <textarea
            value={output}
            readOnly
            placeholder="格式化后的代码会显示在这里"
            className="w-full h-64 p-4 border border-gray-300 rounded-md font-mono text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* 说明 */}
        <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
          <h3 className="text-sm font-medium text-blue-800 mb-2">支持的语言</h3>
          <ul className="text-sm text-blue-700 space-y-1 grid grid-cols-2 md:grid-cols-3">
            <li>• JSON / JSON5</li>
            <li>• JavaScript / ES6+</li>
            <li>• TypeScript</li>
            <li>• HTML / XML</li>
            <li>• CSS / SCSS / Less</li>
            <li>• YAML</li>
            <li>• Markdown</li>
            <li>• SQL</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default CodeFormatter
