import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PageHero, DnsQueryForm, QueryHistory, useQueryHistory, ToolTabView } from '@toolbox/ui-kit'
import type { QueryHistoryRecord } from '@toolbox/ui-kit'

interface SoaRecord {
  mname: string
  rname: string
  serial: number
  refresh: number
  retry: number
  expire: number
  minimum: number
}

const formatTime = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  return `${days}d`
}

const DnsSoa: React.FC = () => {
  const { t } = useTranslation('toolDnsSoa')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SoaRecord | null>(null)
  const [error, setError] = useState('')
  const [initialDomain, setInitialDomain] = useState('')

  const [activeTab, setActiveTab] = useState<'query' | 'history'>('query')

  const { history, saveQuery, deleteQuery, clearHistory } = useQueryHistory<SoaRecord>('dns-soa')

  const parseSoaDataStr = (dataStr: string): SoaRecord | null => {
    const parts = dataStr.trim().split(/\s+/)
    if (parts.length >= 7) {
      return {
        mname: parts[0],
        rname: parts[1].replace(/\./g, '@').replace(/^([^@]+)@/, '$1.'),
        serial: parseInt(parts[2], 10),
        refresh: parseInt(parts[3], 10),
        retry: parseInt(parts[4], 10),
        expire: parseInt(parts[5], 10),
        minimum: parseInt(parts[6], 10),
      }
    }
    return null
  }

  const handleQuery = async ({ domain }: { domain: string; type: string; server?: string }) => {
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const response = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=SOA`)
      const data = await response.json()
      if (data.Status !== 0) throw new Error(`${t('dns_error')}: Status ${data.Status}`)
      if (data.Answer && data.Answer.length > 0) {
        const soaAnswer = data.Answer.find((ans: any) => ans.type === 6)
        if (soaAnswer?.data) {
          const parsed = parseSoaDataStr(soaAnswer.data)
          if (parsed) {
            setResult(parsed)
            saveQuery({ domain }, parsed)
          } else throw new Error('Failed to parse SOA format.')
        } else setError(t('no_soa_warning'))
      } else setError(t('no_soa_warning'))
    } catch (e: any) {
      setError(e.message || String(e))
    } finally {
      setLoading(false)
    }
  }

  const queryPanel = (
    <div className="space-y-4">
      <DnsQueryForm
        onQuery={handleQuery}
        loading={loading}
        initialDomain={initialDomain}
        recordTypes={['SOA']}
        initialType="SOA"
        showServerInput={false}
        domainPlaceholder={t('domain_placeholder')}
        buttonText={t('query_button')}
      />
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-800">
          {error}
        </div>
      )}
      {result && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{t('results_title')}</h3>
          </div>
          <div className="p-6">
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              {[
                { key: 'mname', value: result.mname },
                { key: 'rname', value: result.rname },
                { key: 'serial', value: String(result.serial) },
                { key: 'refresh', value: `${result.refresh}s (${formatTime(result.refresh)})` },
                { key: 'retry', value: `${result.retry}s (${formatTime(result.retry)})` },
                { key: 'expire', value: `${result.expire}s (${formatTime(result.expire)})` },
                { key: 'minimum_ttl', value: `${result.minimum}s (${formatTime(result.minimum)})` },
              ].map(({ key, value }) => (
                <div key={key} className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{t(key)}</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 break-all font-mono">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      )}
    </div>
  )

  const historyPanel = (
    <QueryHistory
      history={history}
      onRestore={(record: QueryHistoryRecord<SoaRecord>) => {
        setInitialDomain(record.queryInfo.domain)
        if (record.result) {
          setResult(record.result)
          setError('')
        } else {
          handleQuery({ domain: record.queryInfo.domain, type: 'SOA' })
        }
        setActiveTab('query')
      }}
      onDelete={deleteQuery}
      onClear={clearHistory}
      renderItem={(queryInfo: { domain: string }) => (
        <span>{queryInfo.domain}</span>
      )}
    />
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

export default DnsSoa
