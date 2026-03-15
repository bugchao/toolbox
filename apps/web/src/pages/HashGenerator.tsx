import React, { useState } from 'react'
import { Copy, Check, Upload, FileText } from 'lucide-react'
import * as crypto from 'crypto-js'

const HashGenerator: React.FC = () => {
  const [input, setInput] = useState('')
  const [inputType, setInputType] = useState<'text' | 'file'>('text')
  const [hashes, setHashes] = useState<Record<string, string>>({})
  const [copied, setCopied] = useState<string | null>(null)
  const [error, setError] = useState('')

  // 计算哈希值
  const calculateHashes = (content: string | crypto.lib.WordArray) => {
    try {
      setError('')
      const results: Record<string, string> = {
        MD5: crypto.MD5(content).toString(),
        SHA1: crypto.SHA1(content).toString(),
        SHA256: crypto.SHA256(content).toString(),
        SHA512: crypto.SHA512(content).toString(),
        SHA3: crypto.SHA3(content).toString(),
        RIPEMD160: crypto.RIPEMD160(content).toString(),
      }
      setHashes(results)
    } catch (e) {
      setError(`计算失败: ${(e as Error).message}`)
      setHashes({})
    }
  }

  // 处理文本输入
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setInput(value)
    if (value.trim()) {
      calculateHashes(value)
    } else {
      setHashes({})
    }
  }

  // 处理文件上传
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const arrayBuffer = event.target?.result as ArrayBuffer
      const wordArray = crypto.lib.WordArray.create(arrayBuffer as any)
      calculateHashes(wordArray)
      setInput(`文件: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`)
    }
    reader.readAsArrayBuffer(file)
  }

  // 复制到剪贴板
  const copyToClipboard = async (hash: string, type: string) => {
    await navigator.clipboard.writeText(hash)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  const clearAll = () => {
    setInput('')
    setHashes({})
    setError('')
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">哈希计算工具</h2>
        <p className="text-gray-600">支持MD5、SHA1、SHA256等多种哈希算法，计算文件/文本哈希值</p>
      </div>

      <div className="space-y-6">
        {/* 操作栏 */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-md">
            <button
              onClick={() => {
                setInputType('text')
                clearAll()
              }}
              className={`px-4 py-2 rounded-md transition-colors ${
                inputType === 'text' ? 'bg-indigo-600 text-white' : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              文本
            </button>
            <button
              onClick={() => {
                setInputType('file')
                clearAll()
              }}
              className={`px-4 py-2 rounded-md transition-colors ${
                inputType === 'file' ? 'bg-indigo-600 text-white' : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              文件
            </button>
          </div>

          {inputType === 'file' && (
            <label className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors cursor-pointer flex items-center gap-2">
              <Upload className="w-4 h-4" />
              上传文件
              <input
                type="file"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          )}

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
        {inputType === 'text' ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">输入文本</label>
            <textarea
              value={input}
              onChange={handleTextChange}
              placeholder="输入要计算哈希的文本..."
              className="w-full h-48 p-4 border border-gray-300 rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        ) : (
          <div className="p-6 border-2 border-dashed border-gray-300 rounded-md text-center">
            {input ? (
              <div className="flex items-center justify-center gap-2 text-gray-700">
                <FileText className="w-5 h-5 text-indigo-600" />
                <span>{input}</span>
              </div>
            ) : (
              <p className="text-gray-500">点击上方按钮上传文件，支持任意文件类型</p>
            )}
          </div>
        )}

        {/* 哈希结果 */}
        {Object.keys(hashes).length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">计算结果</h3>
            <div className="space-y-3">
              {Object.entries(hashes).map(([type, hash]) => (
                <div key={type} className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{type}</span>
                    <button
                      onClick={() => copyToClipboard(hash, type)}
                      className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                    >
                      {copied === type ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                      {copied === type ? '已复制' : '复制'}
                    </button>
                  </div>
                  <div className="font-mono text-sm break-all bg-gray-50 p-3 rounded-md border border-gray-200">
                    {hash}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 说明 */}
        <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
          <h3 className="text-sm font-medium text-blue-800 mb-2">算法说明</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• MD5: 输出128位哈希值，常用于文件校验，但不推荐用于安全场景</li>
            <li>• SHA1: 输出160位哈希值，安全性高于MD5，但已被证明存在碰撞风险</li>
            <li>• SHA256/SHA512: SHA2家族算法，安全性高，推荐用于密码存储、数字签名等场景</li>
            <li>• SHA3: 最新的SHA标准，抗量子计算攻击能力更强</li>
            <li>• RIPEMD160: 输出160位哈希值，常用于比特币等加密货币领域</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default HashGenerator
