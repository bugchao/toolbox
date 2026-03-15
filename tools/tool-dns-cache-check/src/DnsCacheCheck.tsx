import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PageHero, DnsQueryForm, QueryHistory, useQueryHistory, ToolTabView } from '@toolbox/ui-kit'
import { Clock, Info } from 'lucide-react'

interface CacheNodeResult {
  nodeKey: string
  url: string
  ttl: number | null
  rawHeader: string
  status: 'pending' | 'success' | 'error'
  error?: string
}

const NODES = [
  { key: 'google_node', url: 'https://dns.google/resolve' },
  { key: 'cloudflare_node', url: 'https://cloudflare-dns.com/dns-query' },
  { key: 'ali_node', url: 'https://dns.alidns.com/resolve' }
]

const DnsCacheCheck: React.FC = () => {
  const { t } = useTranslation('toolDnsCacheCheck')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<CacheNodeResult[]>([])
  const [initialDomain, setInitialDomain] = useState('')
  const [activeTab, setActiveTab] = useState<'query' | 'history'>('query')

  const { history, saveQuery, deleteQuery, clearHistory } = useQueryHistory<{results: CacheNodeResult[]}>('dns-cache-check')
  const domainTypeQueryRef = React.useRef<{domain: string, type: string} | null>(null)

  const handleQuery = async ({ domain, type }: { domain: string, type: string }) => {
    domainTypeQueryRef.current = { domain, type }
    setLoading(true)
    
    const initialResults: CacheNodeResult[] = NODES.map(n => ({
      nodeKey: n.key,
      url: n.url,
      ttl: null,
      rawHeader: '',
      status: 'pending'
    }))
    setResults(initialResults)

    const promises = initialResults.map(async (node, idx) => {
      try {
        const headers: Record<string, string> = {}
        if (node.url.includes('cloudflare')) {
          headers['Accept'] = 'application/dns-json'
        }
        
        const res = await fetch(`${node.url}?name=${encodeURIComponent(domain)}&type=${type}`, { headers })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()

        let ttl: number | null = null
        let summaryStr = ''

        if (data.Status === 0 && data.Answer && data.Answer.length > 0) {
          // Take the TTL of the first relevant answer record (ignoring CNAMEs if they differ, though usually they give TTL for the CNAME anyway)
          ttl = data.Answer[0].TTL
          summaryStr = `Found ${data.Answer.length} records. TTL=${ttl}s`
        } else {
          summaryStr = `No records found (Status = ${data.Status})`
        }

        setResults(prev => {
          const newRes = [...prev]
          newRes[idx] = { ...newRes[idx], ttl, rawHeader: summaryStr, status: 'success' }
          return newRes
        })
      } catch (e: any) {
        setResults(prev => {
          const newRes = [...prev]
          newRes[idx] = { ...newRes[idx], status: 'error', error: String(e) }
          return newRes
        })
      }
    })

    const finalResults = await Promise.allSettled(promises)
    // We can't rely just on finalResults here because they might not return the full data,
    // they just resolve state. We use an effect below to save after state settles.
    setLoading(false)
  }

  React.useEffect(() => {
    if (!loading && results.length > 0 && results.every(r => r.status !== 'pending') && domainTypeQueryRef.current) {
        saveQuery(domainTypeQueryRef.current, { results })
        domainTypeQueryRef.current = null
    }
  }, [loading, results, saveQuery])

  const interpretTTL = (ttl: number | null) => {
    if (ttl === null) return null
    if (ttl < 60) return <span className="text-orange-600 dark:text-orange-400 font-medium">Very short (cached highly dynamically)</span>
    if (ttl < 300) return <span className="text-yellow-600 dark:text-yellow-400 font-medium">Short (common for CDNs)</span>
    if (ttl > 3600) return <span className="text-blue-600 dark:text-blue-400 font-medium">{t('msg_fresh')}</span>
    return <span className="text-green-600 dark:text-green-400 font-medium">{t('msg_caching')}</span>
  }

  const historyPanel = (
    <QueryHistory
      history={history}
      onRestore={(record: any) => {
        setInitialDomain(record.queryInfo.domain)
        if (record.result) {
          setResults(record.result.results)
        } else {
          handleQuery(record.queryInfo)
        }
        setActiveTab('query')
      }}
      onDelete={deleteQuery}
      onClear={clearHistory}
      renderItem={(queryInfo: any) => (
        <div className="flex flex-col">
          <span>{queryInfo.domain}</span>
          <span className="text-xs text-gray-400 mt-0.5 uppercase">{queryInfo.type || 'A'}</span>
        </div>
      )}
    />
  )

  const queryPanel = (
    <div className="space-y-4">
      <DnsQueryForm
        onQuery={handleQuery}
        loading={loading}
        recordTypes={['A', 'AAAA', 'CNAME', 'TXT', 'MX']}
        initialType="A"
        domainPlaceholder={t('domain_label')}
        buttonText={t('query_btn')}
        showServerInput={false}
        initialDomain={initialDomain}
      />
      {results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {results.map((res, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
              <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/80 flex items-center justify-between">
                <h4 className="font-medium text-gray-800 dark:text-gray-200">{t(res.nodeKey)}</h4>
                {res.status === 'pending' && <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />}
                {res.status === 'success' && <div className="w-2 h-2 rounded-full bg-green-500" />}
                {res.status === 'error' && <div className="w-2 h-2 rounded-full bg-red-500" />}
              </div>
              <div className="p-5 flex-1 flex flex-col items-center justify-center min-h-[160px]">
                {res.status === 'success' ? (
                  <div className="flex flex-col items-center text-center">
                    <Clock className="w-8 h-8 text-indigo-500 mb-3 opacity-80" />
                    <div className="text-4xl font-light text-gray-900 dark:text-white mb-2">
                      {res.ttl !== null ? `${res.ttl}s` : 'N/A'}
                    </div>
                    <div className="text-sm mt-1">{interpretTTL(res.ttl)}</div>
                  </div>
                ) : res.status === 'error' ? (
                  <div className="text-red-500 text-sm text-center">Error: {res.error}</div>
                ) : (
                  <div className="text-gray-400 dark:text-gray-500">Querying...</div>
                )}
              </div>
              <div className="px-5 py-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700 flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400">
                <Info className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="break-all">{res.rawHeader || '...'}</span>
              </div>
            </div>
          ))}
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

export default DnsCacheCheck
