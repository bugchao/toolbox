import React, { useState } from 'react'
import { Copy, Check, RefreshCw } from 'lucide-react'
import { v4 as uuidv4, v1 as uuidv1, v3 as uuidv3, v5 as uuidv5 } from 'uuid'

const UuidGenerator: React.FC = () => {
  const [uuids, setUuids] = useState<string[]>([])
  const [count, setCount] = useState(1)
  const [version, setVersion] = useState<'v1' | 'v4' | 'v3' | 'v5'>('v4')
  const [namespace, setNamespace] = useState('1b671a64-40d5-491e-99b0-da01ff1f3341')
  const [name, setName] = useState('')
  const [copied, setCopied] = useState<string | null>(null)
  const [uppercase, setUppercase] = useState(false)
  const [removeHyphens, setRemoveHyphens] = useState(false)
  const [mode, setMode] = useState<'uuid' | 'random'>('uuid')
  const [randomConfig, setRandomConfig] = useState({
    length: 16,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: false,
  })

  // 生成UUID
  const generateUuids = () => {
    const results: string[] = []
    
    for (let i = 0; i < count; i++) {
      let uuid = ''
      
      switch (version) {
        case 'v1':
          uuid = uuidv1()
          break
        case 'v4':
          uuid = uuidv4()
          break
        case 'v3':
          if (namespace && name) {
            uuid = uuidv3(name, namespace)
          } else {
            uuid = '请输入命名空间和名称'
          }
          break
        case 'v5':
          if (namespace && name) {
            uuid = uuidv5(name, namespace)
          } else {
            uuid = '请输入命名空间和名称'
          }
          break
      }

      // 处理格式
      if (removeHyphens) {
        uuid = uuid.replace(/-/g, '')
      }
      if (uppercase) {
        uuid = uuid.toUpperCase()
      }

      results.push(uuid)
    }

    setUuids(results)
  }

  // 生成随机字符串
  const generateRandomStrings = () => {
    const results: string[] = []
    const { length, includeUppercase, includeLowercase, includeNumbers, includeSymbols } = randomConfig
    
    let chars = ''
    if (includeUppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    if (includeLowercase) chars += 'abcdefghijklmnopqrstuvwxyz'
    if (includeNumbers) chars += '0123456789'
    if (includeSymbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?'

    if (chars === '') {
      setUuids(['请至少选择一种字符类型'])
      return
    }

    for (let i = 0; i < count; i++) {
      let str = ''
      for (let j = 0; j < length; j++) {
        str += chars[Math.floor(Math.random() * chars.length)]
      }
      results.push(str)
    }

    setUuids(results)
  }

  // 生成
  const generate = () => {
    if (mode === 'uuid') {
      generateUuids()
    } else {
      generateRandomStrings()
    }
  }

  // 复制到剪贴板
  const copyToClipboard = async (value: string) => {
    await navigator.clipboard.writeText(value)
    setCopied(value)
    setTimeout(() => setCopied(null), 2000)
  }

  // 复制全部
  const copyAll = async () => {
    await navigator.clipboard.writeText(uuids.join('\n'))
    setCopied('all')
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">UUID/随机字符串生成器</h2>
        <p className="text-gray-600">生成UUID、随机字符串，用于测试数据、唯一ID生成等场景</p>
      </div>

      <div className="space-y-6">
        {/* 模式选择 */}
        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-md w-fit">
          <button
            onClick={() => setMode('uuid')}
            className={`px-4 py-2 rounded-md transition-colors ${
              mode === 'uuid' ? 'bg-indigo-600 text-white' : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            UUID生成
          </button>
          <button
            onClick={() => setMode('random')}
            className={`px-4 py-2 rounded-md transition-colors ${
              mode === 'random' ? 'bg-indigo-600 text-white' : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            随机字符串
          </button>
        </div>

        {/* 配置项 */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">配置选项</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">生成数量</label>
              <input
                type="number"
                min="1"
                max="20"
                value={count}
                onChange={(e) => setCount(Math.min(20, Math.max(1, Number(e.target.value))))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {mode === 'uuid' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">UUID版本</label>
                  <select
                    value={version}
                    onChange={(e) => setVersion(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="v1">v1 (基于时间戳)</option>
                    <option value="v4">v4 (随机数)</option>
                    <option value="v3">v3 (基于名称和MD5)</option>
                    <option value="v5">v5 (基于名称和SHA-1)</option>
                  </select>
                </div>

                {(version === 'v3' || version === 'v5') && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">命名空间 (Namespace)</label>
                      <input
                        type="text"
                        value={namespace}
                        onChange={(e) => setNamespace(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">名称 (Name)</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </>
                )}

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={uppercase}
                    onChange={(e) => setUppercase(e.target.checked)}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label className="text-sm text-gray-700">转为大写</label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={removeHyphens}
                    onChange={(e) => setRemoveHyphens(e.target.checked)}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label className="text-sm text-gray-700">移除横杠(-)</label>
                </div>
              </>
            )}

            {mode === 'random' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">字符串长度</label>
                  <input
                    type="number"
                    min="1"
                    max="128"
                    value={randomConfig.length}
                    onChange={(e) => setRandomConfig({
                      ...randomConfig,
                      length: Math.min(128, Math.max(1, Number(e.target.value)))
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={randomConfig.includeUppercase}
                      onChange={(e) => setRandomConfig({...randomConfig, includeUppercase: e.target.checked})}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700">包含大写字母 (A-Z)</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={randomConfig.includeLowercase}
                      onChange={(e) => setRandomConfig({...randomConfig, includeLowercase: e.target.checked})}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700">包含小写字母 (a-z)</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={randomConfig.includeNumbers}
                      onChange={(e) => setRandomConfig({...randomConfig, includeNumbers: e.target.checked})}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700">包含数字 (0-9)</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={randomConfig.includeSymbols}
                      onChange={(e) => setRandomConfig({...randomConfig, includeSymbols: e.target.checked})}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700">包含特殊字符 (!@#$...)</span>
                  </label>
                </div>
              </>
            )}
          </div>

          <button
            onClick={generate}
            className="mt-6 w-full px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            生成
          </button>
        </div>

        {/* 结果展示 */}
        {uuids.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">生成结果</h3>
              <button
                onClick={copyAll}
                className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                {copied === 'all' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied === 'all' ? '已复制全部' : '复制全部'}
              </button>
            </div>

            <div className="space-y-3">
              {uuids.map((uuid, index) => (
                <div key={index} className="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-200">
                  <span className="text-sm text-gray-500 w-8">{index + 1}.</span>
                  <code className="flex-1 font-mono text-sm break-all">{uuid}</code>
                  <button
                    onClick={() => copyToClipboard(uuid)}
                    className="text-gray-400 hover:text-indigo-600"
                  >
                    {copied === uuid ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 说明 */}
        <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
          <h3 className="text-sm font-medium text-blue-800 mb-2">UUID版本说明</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• v1: 基于MAC地址和时间戳生成，唯一性高，但包含MAC地址信息</li>
            <li>• v4: 完全随机生成，最常用的版本，无信息泄露风险</li>
            <li>• v3/v5: 基于命名空间和名称生成，相同输入会得到相同的UUID</li>
            <li>• v3使用MD5哈希，v5使用SHA-1哈希，推荐使用v5</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default UuidGenerator
