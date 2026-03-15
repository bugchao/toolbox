import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, Copy, MapPin, Globe, Wifi, Calendar, Info, Check, Loader2 } from 'lucide-react'
import { PageHero } from '@toolbox/ui-kit'

interface IpInfo {
  ip: string
  country: string
  countryCode: string
  region: string
  regionName: string
  city: string
  zip: string
  lat: number
  lon: number
  timezone: string
  isp: string
  org: string
  as: string
  query: string
  status: string
  message?: string
}

const IpQuery: React.FC = () => {
  const { t } = useTranslation('nav')
  const { t: tHome } = useTranslation('home')
  const [ip, setIp] = useState('')
  const [ipInfo, setIpInfo] = useState<IpInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copiedField, setCopiedField] = useState<string | null>(null)

  // 页面加载时自动查询当前用户IP
  useEffect(() => {
    queryCurrentIp()
  }, [])

  const queryCurrentIp = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch('http://ip-api.com/json/')
      const data = await response.json()
      if (data.status === 'success') {
        setIpInfo(data)
        setIp(data.query)
      } else {
        setError(data.message || '查询失败')
      }
    } catch (err) {
      setError('网络请求失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const queryIp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!ip.trim()) {
      setError('请输入IP地址')
      return
    }

    // 简单的IP格式验证
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    if (!ipRegex.test(ip.trim())) {
      setError('请输入有效的IP地址格式')
      return
    }

    setLoading(true)
    setError('')
    try {
      const response = await fetch(`http://ip-api.com/json/${encodeURIComponent(ip.trim())}`)
      const data = await response.json()
      if (data.status === 'success') {
        setIpInfo(data)
      } else {
        setError(data.message || '查询失败，请检查IP地址是否正确')
        setIpInfo(null)
      }
    } catch (err) {
      setError('网络请求失败，请稍后重试')
      setIpInfo(null)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const InfoItem = ({ label, value, icon: Icon, copyable = false }: { label: string; value: string | number; icon: React.ElementType; copyable?: boolean }) => (
    <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
      <div className="mt-1 text-indigo-600">
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <div className="text-sm text-gray-500">{label}</div>
        <div className="text-gray-900 font-medium mt-0.5 flex items-center">
          {value}
          {copyable && (
            <button
              onClick={() => copyToClipboard(String(value), label)}
              className="ml-2 text-gray-400 hover:text-indigo-600 transition-colors"
              title="复制"
            >
              {copiedField === label ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <PageHero
        title={t('tools.ip_query')}
        description={tHome('toolDesc.ip_query')}
      />

      {/* 搜索框 */}
      <div className="card">
        <form onSubmit={queryIp} className="space-y-4">
          <div className="flex space-x-4">
            <div className="flex-1">
              <label htmlFor="ip" className="block text-sm font-medium text-gray-700 mb-2">IP地址</label>
              <div className="relative">
                <input
                  type="text"
                  id="ip"
                  value={ip}
                  onChange={(e) => setIp(e.target.value)}
                  placeholder="请输入要查询的IP地址，例如：8.8.8.8"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              </div>
            </div>
            <div className="flex items-end space-x-2">
              <button
                type="button"
                onClick={queryCurrentIp}
                className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                查本机IP
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Search className="w-5 h-5 mr-2" />}
                查询
              </button>
            </div>
          </div>
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 flex items-center">
              <Info className="w-5 h-5 mr-2" />
              {error}
            </div>
          )}
        </form>
      </div>

      {/* 查询结果 */}
      {loading && (
        <div className="card text-center py-12">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">正在查询中，请稍候...</p>
        </div>
      )}

      {ipInfo && !loading && (
        <div className="space-y-6">
          {/* 基础信息卡片 */}
          <div className="card bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-indigo-900">查询结果</h3>
              <div className="text-sm text-indigo-600 font-medium">
                查询时间：{new Date().toLocaleString('zh-CN')}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoItem label="IP地址" value={ipInfo.query} icon={Wifi} copyable />
              <InfoItem label="国家" value={ipInfo.country} icon={Globe} />
              <InfoItem label="国家代码" value={ipInfo.countryCode} icon={Globe} />
              <InfoItem label="地区" value={ipInfo.regionName} icon={MapPin} />
              <InfoItem label="城市" value={ipInfo.city} icon={MapPin} />
              <InfoItem label="邮编" value={ipInfo.zip || 'N/A'} icon={MapPin} />
              <InfoItem label="纬度" value={ipInfo.lat} icon={MapPin} />
              <InfoItem label="经度" value={ipInfo.lon} icon={MapPin} />
              <InfoItem label="时区" value={ipInfo.timezone} icon={Calendar} />
              <InfoItem label="运营商" value={ipInfo.isp} icon={Wifi} />
              <InfoItem label="组织" value={ipInfo.org || 'N/A'} icon={Info} />
              <InfoItem label="AS编号" value={ipInfo.as} icon={Info} />
            </div>
          </div>

          {/* 地图预览 */}
          <div className="card">
            <h3 className="text-lg font-bold text-gray-900 mb-4">地理位置预览</h3>
            <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
              <iframe
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                marginHeight={0}
                marginWidth={0}
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${ipInfo.lon - 0.1}%2C${ipInfo.lat - 0.1}%2C${ipInfo.lon + 0.1}%2C${ipInfo.lat + 0.1}&layer=mapnik&marker=${ipInfo.lat}%2C${ipInfo.lon}`}
                className="w-full h-full"
              />
            </div>
            <div className="mt-4 text-center">
              <a
                href={`https://www.openstreetmap.org/?mlat=${ipInfo.lat}&mlon=${ipInfo.lon}#map=12/${ipInfo.lat}/${ipInfo.lon}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center"
              >
                在 OpenStreetMap 中查看更大地图
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => copyToClipboard(JSON.stringify(ipInfo, null, 2), '全部信息')}
              className="bg-white text-indigo-600 border border-indigo-600 px-6 py-3 rounded-lg hover:bg-indigo-50 transition-colors font-medium flex items-center"
            >
              {copiedField === '全部信息' ? <Check className="w-5 h-5 mr-2" /> : <Copy className="w-5 h-5 mr-2" />}
              复制全部信息
            </button>
          </div>
        </div>
      )}

      {/* 使用说明 */}
      <div className="card bg-gray-50">
        <h3 className="text-lg font-bold text-gray-900 mb-3">使用说明</h3>
        <ul className="space-y-2 text-gray-600">
          <li className="flex items-start">
            <span className="text-indigo-600 mr-2">•</span>
            页面加载时会自动查询您当前的公网IP地址信息
          </li>
          <li className="flex items-start">
            <span className="text-indigo-600 mr-2">•</span>
            支持查询任意公网IPv4地址的详细信息，包括地理位置、运营商等
          </li>
          <li className="flex items-start">
            <span className="text-indigo-600 mr-2">•</span>
            查询结果包含经纬度信息，可在地图上直观查看IP所在位置
          </li>
          <li className="flex items-start">
            <span className="text-indigo-600 mr-2">•</span>
            所有查询均通过公开API进行，不会记录您的查询历史
          </li>
        </ul>
      </div>
    </div>
  )
}

export default IpQuery
