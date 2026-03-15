import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, Copy, MapPin, Globe, Wifi, Calendar, Info, Check, Loader2 } from 'lucide-react'
import { PageHero, QueryHistory, useQueryHistory, ToolTabView } from '@toolbox/ui-kit'

export const I18N_NAMESPACE = 'toolIpQuery'

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
  const { t } = useTranslation(I18N_NAMESPACE)
  const [ip, setIp] = useState('')
  const [ipInfo, setIpInfo] = useState<IpInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const [activeTab, setActiveTab] = useState<'query' | 'history'>('query')

  const { history, saveQuery, deleteQuery, clearHistory } = useQueryHistory<IpInfo>('ip-query')

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
        setError(data.message || t('errorQuery'))
      }
    } catch {
      setError(t('errorNetwork'))
    } finally {
      setLoading(false)
    }
  }

  const queryIp = async (e?: React.FormEvent, ipToQuery?: string) => {
    if (e) e.preventDefault()
    const targetIp = ipToQuery || ip
    if (!targetIp.trim()) {
      setError(t('errorEmpty'))
      return
    }
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    if (!ipRegex.test(targetIp.trim())) {
      setError(t('errorInvalid'))
      return
    }

    setLoading(true)
    setError('')
    setIp(targetIp)
    try {
      const response = await fetch(`http://ip-api.com/json/${encodeURIComponent(targetIp.trim())}`)
      const data = await response.json()
      if (data.status === 'success') {
        setIpInfo(data)
        saveQuery({ domain: targetIp }, data)
      } else {
        setError(data.message || t('errorQuery'))
        setIpInfo(null)
      }
    } catch {
      setError(t('errorNetwork'))
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

  const InfoItem = ({ labelKey, value, icon: Icon, copyable = false }: { labelKey: string; value: string | number; icon: React.ElementType; copyable?: boolean }) => (
    <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-colors">
      <div className="mt-1 text-indigo-600 dark:text-indigo-400">
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <div className="text-sm text-gray-500 dark:text-gray-400">{t(labelKey)}</div>
        <div className="text-gray-900 dark:text-gray-100 font-medium mt-0.5 flex items-center">
          {value}
          {copyable && (
            <button
              onClick={() => copyToClipboard(String(value), labelKey)}
              className="ml-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              title={t('copy')}
            >
              {copiedField === labelKey ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>
    </div>
  )

  const historyPanel = (
    <QueryHistory
      history={history}
      onRestore={(record: any) => {
        const domain = record.queryInfo.domain
        setIp(domain)
        if (record.result) {
          setIpInfo(record.result)
          setError('')
        } else {
          queryIp(undefined, domain)
        }
        setActiveTab('query')
      }}
      onDelete={deleteQuery}
      onClear={clearHistory}
      renderItem={(queryInfo: any) => (
        <div className="flex flex-col">
          <span>{queryInfo.domain}</span>
        </div>
      )}
    />
  )

  const queryPanel = (
    <div className="space-y-6">
      <div className="card">
        <form onSubmit={queryIp} className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:space-x-4 gap-4">
            <div className="flex-1">
              <label htmlFor="ip" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('ipLabel')}</label>
              <div className="relative">
                <input
                  type="text"
                  id="ip"
                  value={ip}
                  onChange={(e) => setIp(e.target.value)}
                  placeholder={t('ipPlaceholder')}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-gray-100"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              </div>
            </div>
            <div className="flex items-end space-x-2">
              <button
                type="button"
                onClick={queryCurrentIp}
                className="bg-gray-100 dark:bg-gray-700 dark:text-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
              >
                {t('queryMyIp')}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Search className="w-5 h-5 mr-2" />}
                {t('query')}
              </button>
            </div>
          </div>
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 flex items-center">
              <Info className="w-5 h-5 mr-2 shrink-0" />
              {error}
            </div>
          )}
        </form>
      </div>

      {loading && (
        <div className="card text-center py-12">
          <Loader2 className="w-12 h-12 text-indigo-600 dark:text-indigo-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">{t('loading')}</p>
        </div>
      )}

      {ipInfo && !loading && (
        <div className="space-y-6">
          <div className="card bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200 dark:border-indigo-800">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <h3 className="text-xl font-bold text-indigo-900 dark:text-indigo-100">{t('queryResult')}</h3>
              <div className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">
                {t('queryTime')}: {new Date().toLocaleString()}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoItem labelKey="labelIp" value={ipInfo.query} icon={Wifi} copyable />
              <InfoItem labelKey="labelCountry" value={ipInfo.country} icon={Globe} />
              <InfoItem labelKey="labelCountryCode" value={ipInfo.countryCode} icon={Globe} />
              <InfoItem labelKey="labelRegion" value={ipInfo.regionName} icon={MapPin} />
              <InfoItem labelKey="labelCity" value={ipInfo.city} icon={MapPin} />
              <InfoItem labelKey="labelZip" value={ipInfo.zip || t('na')} icon={MapPin} />
              <InfoItem labelKey="labelLat" value={ipInfo.lat} icon={MapPin} />
              <InfoItem labelKey="labelLon" value={ipInfo.lon} icon={MapPin} />
              <InfoItem labelKey="labelTimezone" value={ipInfo.timezone} icon={Calendar} />
              <InfoItem labelKey="labelIsp" value={ipInfo.isp} icon={Wifi} />
              <InfoItem labelKey="labelOrg" value={ipInfo.org || t('na')} icon={Info} />
              <InfoItem labelKey="labelAs" value={ipInfo.as} icon={Info} />
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">{t('mapPreview')}</h3>
            <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
              <iframe
                width="100%"
                height="100%"
                frameBorder={0}
                scrolling="no"
                marginHeight={0}
                marginWidth={0}
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${ipInfo.lon - 0.1}%2C${ipInfo.lat - 0.1}%2C${ipInfo.lon + 0.1}%2C${ipInfo.lat + 0.1}&layer=mapnik&marker=${ipInfo.lat}%2C${ipInfo.lon}`}
                className="w-full h-full"
                title="Map"
              />
            </div>
            <div className="mt-4 text-center">
              <a
                href={`https://www.openstreetmap.org/?mlat=${ipInfo.lat}&mlon=${ipInfo.lon}#map=12/${ipInfo.lat}/${ipInfo.lon}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium inline-flex items-center"
              >
                {t('viewLargerMap')}
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={() => copyToClipboard(JSON.stringify(ipInfo, null, 2), 'copyAll')}
              className="bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 border border-indigo-600 dark:border-indigo-500 px-6 py-3 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors font-medium flex items-center"
            >
              {copiedField === 'copyAll' ? <Check className="w-5 h-5 mr-2" /> : <Copy className="w-5 h-5 mr-2" />}
              {copiedField === 'copyAll' ? t('copiedAll') : t('copyAll')}
            </button>
          </div>
        </div>
      )}

      <div className="card bg-gray-50 dark:bg-gray-800/50">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">{t('usageTitle')}</h3>
        <ul className="space-y-2 text-gray-600 dark:text-gray-300">
          <li className="flex items-start"><span className="text-indigo-600 dark:text-indigo-400 mr-2">•</span>{t('usage1')}</li>
          <li className="flex items-start"><span className="text-indigo-600 dark:text-indigo-400 mr-2">•</span>{t('usage2')}</li>
          <li className="flex items-start"><span className="text-indigo-600 dark:text-indigo-400 mr-2">•</span>{t('usage3')}</li>
          <li className="flex items-start"><span className="text-indigo-600 dark:text-indigo-400 mr-2">•</span>{t('usage4')}</li>
        </ul>
      </div>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto">
      <PageHero title={t('title')} description={t('description')} />
      <ToolTabView
        activeTab={activeTab}
        onTabChange={setActiveTab}
        queryPanel={queryPanel}
        historyPanel={historyPanel}
      />
    </div>
  )
}

export default IpQuery
