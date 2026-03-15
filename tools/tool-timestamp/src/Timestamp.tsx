import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Copy, Clock, Check } from 'lucide-react'
import { PageHero } from '@toolbox/ui-kit'

const Timestamp: React.FC = () => {
  const { t } = useTranslation('nav')
  const { t: tHome } = useTranslation('home')
  const [timestamp, setTimestamp] = useState('')
  const [datetime, setDatetime] = useState('')
  const [unit, setUnit] = useState<'second' | 'millisecond'>('second')
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  const getCurrentTimestamp = () => {
    const now = Date.now()
    setTimestamp(unit === 'second' ? Math.floor(now / 1000).toString() : now.toString())
    convertToDatetime(unit === 'second' ? Math.floor(now / 1000).toString() : now.toString())
  }

  const convertToDatetime = (ts?: string) => {
    try {
      setError('')
      const value = ts || timestamp
      if (!value.trim()) {
        setError('请输入时间戳')
        return
      }

      let num = Number(value)
      if (isNaN(num)) {
        setError('时间戳必须是数字')
        return
      }

      if (unit === 'second') {
        num *= 1000
      }

      const date = new Date(num)
      if (date.toString() === 'Invalid Date') {
        setError('无效的时间戳')
        return
      }

      const formatted = date.toISOString().slice(0, 19).replace('T', ' ')
      setDatetime(formatted)
    } catch (e) {
      setError(`转换失败: ${(e as Error).message}`)
    }
  }

  const convertToTimestamp = () => {
    try {
      setError('')
      if (!datetime.trim()) {
        setError('请输入日期时间')
        return
      }

      const date = new Date(datetime)
      if (date.toString() === 'Invalid Date') {
        setError('无效的日期格式')
        return
      }

      const ts = unit === 'second' ? Math.floor(date.getTime() / 1000) : date.getTime()
      setTimestamp(ts.toString())
    } catch (e) {
      setError(`转换失败: ${(e as Error).message}`)
    }
  }

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const clearAll = () => {
    setTimestamp('')
    setDatetime('')
    setError('')
  }

  useEffect(() => {
    getCurrentTimestamp()
  }, [])

  return (
    <div className="max-w-3xl mx-auto">
      <PageHero title={t('tools.timestamp')} description={tHome('toolDesc.timestamp')} className="mb-8" />

      <div className="space-y-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-md">
            <button
              onClick={() => {
                setUnit('second')
                if (timestamp) convertToDatetime()
              }}
              className={`px-4 py-2 rounded-md transition-colors ${
                unit === 'second' ? 'bg-indigo-600 text-white' : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              秒级
            </button>
            <button
              onClick={() => {
                setUnit('millisecond')
                if (timestamp) convertToDatetime()
              }}
              className={`px-4 py-2 rounded-md transition-colors ${
                unit === 'millisecond' ? 'bg-indigo-600 text-white' : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              毫秒级
            </button>
          </div>

          <button
            onClick={getCurrentTimestamp}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <Clock className="w-4 h-4" />
            获取当前时间戳
          </button>

          <button
            onClick={clearAll}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            清空
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
            {error}
          </div>
        )}

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">时间戳</label>
            {timestamp && (
              <button
                onClick={() => copyToClipboard(timestamp)}
                className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? '已复制' : '复制'}
              </button>
            )}
          </div>
          <div className="flex gap-4">
            <input
              type="text"
              value={timestamp}
              onChange={(e) => setTimestamp(e.target.value)}
              placeholder="输入时间戳"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-md font-mono text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={() => convertToDatetime()}
              className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              转 → 日期
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">日期时间</label>
            {datetime && (
              <button
                onClick={() => copyToClipboard(datetime)}
                className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? '已复制' : '复制'}
              </button>
            )}
          </div>
          <div className="flex gap-4">
            <input
              type="text"
              value={datetime}
              onChange={(e) => setDatetime(e.target.value)}
              placeholder="YYYY-MM-DD HH:mm:ss"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-md font-mono text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={convertToTimestamp}
              className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              转 → 时间戳
            </button>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
          <h3 className="text-sm font-medium text-blue-800 mb-2">小知识</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Unix时间戳是从1970年1月1日（UTC/GMT的午夜）开始所经过的秒数</li>
            <li>• 10位数字是秒级时间戳，13位数字是毫秒级时间戳</li>
            <li>• JavaScript中Date.now()返回的是13位毫秒级时间戳</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Timestamp
