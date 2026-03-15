import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, Loader2, Globe, Building2, Wifi, MapPin } from 'lucide-react'
import { PageHero } from '@toolbox/ui-kit'

export const I18N_NAMESPACE = 'toolIpAsn'

interface AsnInfo {
  query: string
  as: string
  org: string
  isp: string
  country: string
  countryCode: string
  regionName: string
  city: string
  status: string
  message?: string
}

const IpAsn: React.FC = () => {
  const { t } = useTranslation(I18N_NAMESPACE)
  const [ip, setIp] = useState('')
  const [info, setInfo] = useState<AsnInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const queryAsn = async (e?: React.FormEvent, useMyIp = false) => {
    e?.preventDefault()
    if (!useMyIp && !ip.trim()) {
      setError(t('errorEmpty'))
      return
    }
    if (!useMyIp) {
      const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
      if (!ipRegex.test(ip.trim())) {
        setError(t('errorInvalid'))
        return
      }
    }

    setLoading(true)
    setError('')
    setInfo(null)
    try {
      const url = useMyIp ? 'http://ip-api.com/json/' : `http://ip-api.com/json/${encodeURIComponent(ip.trim())}`
      const res = await fetch(url)
      const data = await res.json()
      if (data.status === 'success') {
        setInfo(data)
        if (useMyIp) setIp(data.query)
      } else {
        setError(data.message || t('errorQuery'))
      }
    } catch {
      setError(t('errorNetwork'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHero title={t('title')} description={t('description')} />

      <div className="card">
        <form onSubmit={(e) => queryAsn(e, false)} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="ip-asn" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('ipLabel')}</label>
              <div className="relative">
                <input
                  type="text"
                  id="ip-asn"
                  value={ip}
                  onChange={(e) => setIp(e.target.value)}
                  placeholder={t('ipPlaceholder')}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-gray-100"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              </div>
            </div>
            <div className="flex items-end gap-2">
              <button
                type="button"
                onClick={() => queryAsn(undefined, true)}
                className="px-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 font-medium"
              >
                {t('queryMyIp')}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 font-medium disabled:opacity-50 flex items-center"
              >
                {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Search className="w-5 h-5 mr-2" />}
                {t('query')}
              </button>
            </div>
          </div>
          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
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

      {info && !loading && (
        <div className="card bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200 dark:border-indigo-800">
          <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-100 mb-4">ASN / 归属</h3>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-white/60 dark:bg-gray-800/40">
              <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <dt className="text-sm text-gray-500 dark:text-gray-400">{t('asn')}</dt>
                <dd className="font-mono font-medium text-gray-900 dark:text-gray-100">{info.as || '—'}</dd>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-white/60 dark:bg-gray-800/40">
              <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <dt className="text-sm text-gray-500 dark:text-gray-400">{t('org')}</dt>
                <dd className="font-medium text-gray-900 dark:text-gray-100 break-words">{info.org || '—'}</dd>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-white/60 dark:bg-gray-800/40">
              <Wifi className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <dt className="text-sm text-gray-500 dark:text-gray-400">{t('isp')}</dt>
                <dd className="font-medium text-gray-900 dark:text-gray-100">{info.isp || '—'}</dd>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-white/60 dark:bg-gray-800/40">
              <Globe className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <dt className="text-sm text-gray-500 dark:text-gray-400">{t('country')}</dt>
                <dd className="font-medium text-gray-900 dark:text-gray-100">{info.country} ({info.countryCode})</dd>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-white/60 dark:bg-gray-800/40 sm:col-span-2">
              <MapPin className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <dt className="text-sm text-gray-500 dark:text-gray-400">{t('region')} / {t('city')}</dt>
                <dd className="font-medium text-gray-900 dark:text-gray-100">{info.regionName} · {info.city || '—'}</dd>
              </div>
            </div>
          </dl>
        </div>
      )}

      <div className="card bg-gray-50 dark:bg-gray-800/50">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">{t('usageTitle')}</h3>
        <ul className="space-y-2 text-gray-600 dark:text-gray-300 text-sm">
          <li className="flex items-start"><span className="text-indigo-600 dark:text-indigo-400 mr-2">•</span>{t('usage1')}</li>
          <li className="flex items-start"><span className="text-indigo-600 dark:text-indigo-400 mr-2">•</span>{t('usage2')}</li>
        </ul>
      </div>
    </div>
  )
}

export default IpAsn
