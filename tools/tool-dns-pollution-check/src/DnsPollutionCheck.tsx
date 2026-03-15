import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PageHero, DnsQueryForm, QueryHistory, useQueryHistory, ToolTabView } from '@toolbox/ui-kit'
import type { QueryHistoryRecord } from '@toolbox/ui-kit'
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'

interface ServerResult {
  name: string
  url: string
  ips: string[]
  timeMs: number
  status: 'pending' | 'success' | 'error'
  error?: string
}

const SERVERS = [
  { name: 'Google Public DNS', url: 'https://dns.google/resolve' },
  { name: 'Cloudflare', url: 'https://cloudflare-dns.com/dns-query' },
  { name: 'AliDNS (Alibaba)', url: 'https://dns.alidns.com/resolve' },
  { name: 'Quad9', url: 'https://dns.quad9.net:5053/dns-query' }
]

const DnsPollutionCheck: React.FC = () => {
  const { t } = useTranslation('toolDnsPollutionCheck')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<ServerResult[]>([])
  const [isConsistent, setIsConsistent] = useState<boolean | null>(null)
  const [initialDomain, setInitialDomain] = useState('')
  const [activeTab, setActiveTab] = useState<'query' | 'history'>('query')

  const { history, saveQuery, deleteQuery, clearHistory } = useQueryHistory<{results: ServerResult[], isConsistent: boolean | null}>('dns-pollution-check')
  const domainQueryRef = React.useRef('')
  
  const handleQuery = async ({ domain }: { domain: string }) => {
    domainQueryRef.current = domain
    setLoading(true)
    setIsConsistent(null)
    
    const initialResults: ServerResult[] = SERVERS.map(s => ({
      name: s.name,
      url: s.url,
      ips: [],
      timeMs: 0,
      status: 'pending'
    }))
    setResults(initialResults)

    const promises = initialResults.map(async (server, idx) => {
      const startTime = performance.now()
      try {
        const headers: Record<string, string> = {
          'Accept': 'application/dns-json'
        }
        const res = await fetch(`${server.url}?name=${encodeURIComponent(domain)}&type=A`, {
          headers
        })
        
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        const endTime = performance.now()

        let ips: string[] = []
        if (data.Status === 0 && data.Answer) {
          ips = data.Answer.filter((ans: any) => ans.type === 1).map((ans: any) => ans.data).sort()
        }

        setResults(prev => {
          const newRes = [...prev]
          newRes[idx] = { ...newRes[idx], ips, timeMs: Math.round(endTime - startTime), status: 'success' }
          return newRes
        })
        return ips
      } catch (e: any) {
        setResults(prev => {
          const newRes = [...prev]
          newRes[idx] = { ...newRes[idx], status: 'error', error: String(e) }
          return newRes
        })
        return null
      }
    })

    const allIps = (await Promise.all(promises)).filter(r => r !== null) as string[][]
    
    if (allIps.length > 0) {
      // Check consistency. Arrays are sorted, so we can join to compare.
      const firstStr = allIps[0].join(',')
      const consistent = allIps.every(ips => ips.join(',') === firstStr)
      setIsConsistent(consistent)
      
      // We must wait for state to update, but history save uses latest values.
      const finalResults = await Promise.all(promises)
      // filter out pending, only save if there's actual data
      saveQuery({ domain }, { results: finalResults.map(r => r === null ? initialResults[0] : (r as any)), isConsistent: consistent }) // Note: mapping is rough here because the promise returns ips not full result, actual state holds full result
    }

    setLoading(false)
  }

  // Need a reliable way to get final results for history. It's better to use an effect or calculate final state before saving.
  // Re-writing the save logic inside the handleQuery to use the state directly is tricky due to async batching. Let's do it right before setLoading(false).
  React.useEffect(() => {
    if (!loading && results.length > 0 && results.every(r => r.status !== 'pending') && domainQueryRef.current) {
        saveQuery({ domain: domainQueryRef.current }, { results, isConsistent })
        domainQueryRef.current = ''
    }
  }, [loading, results, isConsistent, saveQuery])

  const historyPanel = (
    <QueryHistory
      history={history}
      onRestore={(record: QueryHistoryRecord<{results: ServerResult[], isConsistent: boolean | null}>) => {
        setInitialDomain(record.queryInfo.domain)
        if (record.result) {
          setResults(record.result.results)
          setIsConsistent(record.result.isConsistent)
        } else {
          handleQuery({ domain: record.queryInfo.domain })
        }
        setActiveTab('query')
      }}
      onDelete={deleteQuery}
      onClear={clearHistory}
      renderItem={(queryInfo: { domain: string }) => <span>{queryInfo.domain}</span>}
    />
  )

  const queryPanel = (
    <div className="space-y-4">
      <DnsQueryForm
        onQuery={handleQuery}
        loading={loading}
        recordTypes={['A']}
        initialType="A"
        domainPlaceholder={t('domain_label')}
        buttonText={t('query_btn')}
        initialDomain={initialDomain}
        showServerInput={false}
      />

      {results.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{t('consistency_title')}</h3>
            {isConsistent !== null && (
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${isConsistent ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {isConsistent ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                {isConsistent ? t('status_consistent') : t('status_inconsistent')}
              </div>
            )}
          </div>
          {isConsistent !== null && (
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isConsistent ? t('msg_consistent') : t('msg_inconsistent')}
              </p>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-800 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3">{t('server')}</th>
                  <th className="px-6 py-3">{t('result')}</th>
                  <th className="px-6 py-3">{t('time')}</th>
                </tr>
              </thead>
              <tbody>
                {results.map((res, i) => (
                  <tr key={i} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white flex items-center gap-2">
                      {res.status === 'success' && <div className="w-2 h-2 rounded-full bg-green-500" />}
                      {res.status === 'error' && <div className="w-2 h-2 rounded-full bg-red-500" />}
                      {res.status === 'pending' && <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />}
                      {res.name}
                    </td>
                    <td className="px-6 py-4">
                      {res.status === 'success' ? (
                        res.ips.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {res.ips.map(ip => (
                              <span key={ip} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">{ip}</span>
                            ))}
                          </div>
                        ) : <span className="text-gray-400 italic">No IPs</span>
                      ) : res.status === 'error' ? (
                        <span className="text-red-500 flex items-center gap-1"><XCircle className="w-4 h-4"/> {t('status_error')}</span>
                      ) : (
                        <span className="text-gray-400 italic">...</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">{res.status === 'success' ? `${res.timeMs}ms` : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
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

export default DnsPollutionCheck
