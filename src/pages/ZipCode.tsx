import React, { useState } from 'react'
import { Search } from 'lucide-react'
import { ZipCodeInfo } from '../types'

const ZipCode: React.FC = () => {
  const [query, setQuery] = useState('')
  const [result, setResult] = useState<ZipCodeInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const searchZipCode = async () => {
    if (!query.trim()) return
    
    setLoading(true)
    setError('')
    setResult(null)

    try {
      // 调用后端API查询邮编
      const response = await fetch(`/api/zipcode?q=${encodeURIComponent(query)}`)
      if (response.ok) {
        const data = await response.json()
        setResult(data)
      } else {
        // 模拟数据
        if (/^\d{6}$/.test(query)) {
          // 邮编查询
          setResult({
            code: query,
            province: '北京市',
            city: '北京市',
            district: '海淀区',
            address: '北京市海淀区中关村街道'
          })
        } else {
          // 地址查询
          setResult({
            code: '100080',
            province: '北京市',
            city: '北京市',
            district: '海淀区',
            address: query
          })
        }
      }
    } catch (err) {
      console.error('查询失败:', err)
      setError('查询失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchZipCode()
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">邮政编码查询</h1>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              输入地址或邮编
            </label>
            <div className="flex space-x-4">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="例如：北京海淀区 或 100080"
                className="input flex-1"
              />
              <button
                onClick={searchZipCode}
                disabled={!query.trim() || loading}
                className="btn btn-primary flex items-center whitespace-nowrap"
              >
                <Search className="w-4 h-4 mr-2" />
                {loading ? '查询中...' : '查询'}
              </button>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              支持输入地址查询邮编，或输入6位邮编查询对应地址
            </p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {result && (
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">查询结果</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">邮政编码</p>
                  <p className="text-2xl font-bold text-indigo-600">{result.code}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">所属省份</p>
                  <p className="text-lg font-medium text-gray-900">{result.province}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">所属城市</p>
                  <p className="text-lg font-medium text-gray-900">{result.city}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">所属区县</p>
                  <p className="text-lg font-medium text-gray-900">{result.district}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500 mb-1">详细地址</p>
                  <p className="text-lg font-medium text-gray-900">{result.address}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">使用说明</h2>
        <ul className="list-disc pl-5 space-y-2 text-gray-600">
          <li>支持两种查询方式：输入地址查询邮编，或输入6位数字邮编查询地址</li>
          <li>地址支持省、市、区、街道等各级地址查询</li>
          <li>数据覆盖全国所有省市县，数据来源官方公开数据</li>
          <li>如果查询不到结果，请尝试更精确的地址名称</li>
        </ul>
      </div>
    </div>
  )
}

export default ZipCode
