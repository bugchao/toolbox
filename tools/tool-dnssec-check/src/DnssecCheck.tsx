import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PageHero } from '@toolbox/ui-kit'
import { ShieldCheck, Loader2, ShieldAlert, CheckCircle } from 'lucide-react'

const GOOGLE_DOH = 'https://dns.google/resolve'

async function queryDoh(domain: string, type: string): Promise<{ Status: number; AD?: boolean; Answer?: { name: string; type: number; TTL: number; data: string }[] }> {
  const res = await fetch(`${GOOGLE_DOH}?name=${encodeURIComponent(domain)}&type=${type}`)
  if (!res.ok) throw new Error('Network error')
  return res.json()
}

const DnssecCheck: React.FC = () => {
  const { t } = useTranslation('toolDnssecCheck')
  const [domain, setDomain] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    validated: boolean | null
    dnskeys: string[]
    ds: string[]
    error?: string
  } | null>(null)

  const handleCheck = async () => {
    const d = domain.trim().toLowerCase()
    if (!d) {
      setResult({ validated: null, dnskeys: [], ds: [], error: t('error_empty') })
      return
    }
    setLoading(true)
    setResult(null)
    try {
      const [aRes, dnskeyRes, dsRes] = await Promise.all([
        queryDoh(d, 'A'),
        queryDoh(d, 'DNSKEY').catch(() => ({ Status: 1, Answer: [] })),
        queryDoh(d, 'DS').catch(() => ({ Status: 1, Answer: [] })),
      ])
      const validated = aRes.AD === true
      const dnskeys = (dnskeyRes.Answer || []).map((r) => r.data).filter(Boolean)
      const ds = (dsRes.Answer || []).map((r) => r.data).filter(Boolean)
      setResult({
        validated: aRes.Status === 0 ? validated : null,
        dnskeys,
        ds,
        error: aRes.Status !== 0 ? t('error_resolution_fail') : undefined,
      })
    } catch (e) {
      setResult({ validated: null, dnskeys: [], ds: [], error: (e as Error).message || t('error_resolution_fail') })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <PageHero title={t('title')} description={t('description')} className="mb-8" />

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('domain_label')}</label>
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder={t('domain_placeholder')}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 outline-none"
              onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
            />
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={handleCheck}
              disabled={loading}
              className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg font-medium flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
              {loading ? t('loading') : t('check_btn')}
            </button>
          </div>
        </div>
      </div>

      {result && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">{t('status')}</h3>
            {result.error ? (
              <p className="text-red-600 dark:text-red-400 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5" /> {result.error}
              </p>
            ) : result.validated === true ? (
              <p className="text-green-600 dark:text-green-400 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" /> {t('signed')} · {t('validated')}
              </p>
            ) : result.validated === false ? (
              <p className="text-amber-600 dark:text-amber-400 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5" /> {t('not_signed')} / {t('validation_fail')}
              </p>
            ) : (
              <p className="text-gray-600 dark:text-gray-400">{t('validation_fail')}</p>
            )}
          </div>
          {(result.dnskeys.length > 0 || result.ds.length > 0) && (
            <div className="grid sm:grid-cols-2 gap-4">
              {result.dnskeys.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('dnskeys')}</h4>
                  <pre className="text-xs font-mono text-gray-600 dark:text-gray-400 break-all whitespace-pre-wrap">
                    {result.dnskeys.slice(0, 3).join('\n')}
                  </pre>
                </div>
              )}
              {result.ds.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('ds_records')}</h4>
                  <pre className="text-xs font-mono text-gray-600 dark:text-gray-400 break-all whitespace-pre-wrap">
                    {result.ds.slice(0, 3).join('\n')}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default DnssecCheck
