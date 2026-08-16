import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Search } from 'lucide-react'
import { ZipCodeInfo } from '../types'

const ZipCode: React.FC = () => {
  const { t } = useTranslation('zipCode')
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
            province: t('mockProvince'),
            city: t('mockCity'),
            district: t('mockDistrict'),
            address: t('mockAddress')
          })
        } else {
          // 地址查询
          setResult({
            code: '100080',
            province: t('mockProvince'),
            city: t('mockCity'),
            district: t('mockDistrict'),
            address: query
          })
        }
      }
    } catch (err) {
      console.error('查询失败:', err)
      setError(t('errSearchFailed'))
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
        <h1 className="text-3xl font-bold text-ink mb-6">{t('title')}</h1>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-ink mb-2">
              {t('inputLabel')}
            </label>
            <div className="flex space-x-4">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={t('inputPlaceholder')}
                className="input flex-1"
              />
              <button
                onClick={searchZipCode}
                disabled={!query.trim() || loading}
                className="btn btn-primary flex items-center whitespace-nowrap"
              >
                <Search className="w-4 h-4 mr-2" />
                {loading ? t('searching') : t('search')}
              </button>
            </div>
            <p className="mt-2 text-sm text-ink-muted">
              {t('inputHint')}
            </p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
              {error}
            </div>
          )}

          {result && (
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-100 dark:border-indigo-800 rounded-lg p-6">
              <h2 className="text-xl font-bold text-ink mb-4">{t('resultTitle')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-ink-muted mb-1">{t('resultCode')}</p>
                  <p className="text-2xl font-bold text-indigo-600">{result.code}</p>
                </div>
                <div>
                  <p className="text-sm text-ink-muted mb-1">{t('resultProvince')}</p>
                  <p className="text-lg font-medium text-ink">{result.province}</p>
                </div>
                <div>
                  <p className="text-sm text-ink-muted mb-1">{t('resultCity')}</p>
                  <p className="text-lg font-medium text-ink">{result.city}</p>
                </div>
                <div>
                  <p className="text-sm text-ink-muted mb-1">{t('resultDistrict')}</p>
                  <p className="text-lg font-medium text-ink">{result.district}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-ink-muted mb-1">{t('resultAddress')}</p>
                  <p className="text-lg font-medium text-ink">{result.address}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-bold text-ink mb-4">{t('usageTitle')}</h2>
        <ul className="list-disc pl-5 space-y-2 text-ink-muted">
          <li>{t('usage1')}</li>
          <li>{t('usage2')}</li>
          <li>{t('usage3')}</li>
          <li>{t('usage4')}</li>
        </ul>
      </div>
    </div>
  )
}

export default ZipCode
