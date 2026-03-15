import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PageHero, DnsQueryForm, QueryHistory, useQueryHistory, ToolTabView } from '@toolbox/ui-kit'
import { ShieldCheck, ShieldAlert, Wifi } from 'lucide-react'

// Trusted DoH to act as Baseline
const TRUSTED_DOH = 'https://dns.google/resolve'
// Default suspected/test DoH (AliDNS is often used in China, Cloudflare globally)
const DEFAULT_TEST_SERVER = 'https://dns.alidns.com/resolve'

const DnsHijackCheck: React.FC = () => {
  const { t } = useTranslation('toolDnsHijackCheck')
  const [loading, setLoading] = useState(false)
  const [hasRun, setHasRun] = useState(false)

  const [authIps, setAuthIps] = useState<string[]>([])
  const [testIps, setTestIps] = useState<string[]>([])
  const [error, setError] = useState('')
  const [initialDomain, setInitialDomain] = useState('')
  const [initialServer, setInitialServer] = useState(DEFAULT_TEST_SERVER)

  const [activeTab, setActiveTab] = useState<'query' | 'history'>('query')

  const { history, saveQuery, deleteQuery, clearHistory } = useQueryHistory<{authIps: string[], testIps: string[]}>('dns-hijack-check')

  const handleQuery = async ({ domain, server }: { domain: string, server?: string }) => {
    setLoading(true)
    setError('')
    setHasRun(false)
    setAuthIps([])
    setTestIps([])

    const testUrl = server || DEFAULT_TEST_SERVER

    try {
      // 1. Fetch from Trusted Server (Google)
      const resTrusted = await fetch(`${TRUSTED_DOH}?name=${encodeURIComponent(domain)}&type=A`)
      if (!resTrusted.ok) throw new Error(`Trusted DNS HTTP ${resTrusted.status}`)
      const dataTrusted = await resTrusted.json()

      let trustedIps: string[] = []
      if (dataTrusted.Status === 0 && dataTrusted.Answer) {
        trustedIps = dataTrusted.Answer.filter((a: any) => a.type === 1).map((a: any) => a.data).sort()
      }

      // 2. Fetch from Test Server
      const headers: Record<string, string> = {}
      if (testUrl.includes('cloudflare')) {
        headers['Accept'] = 'application/dns-json'
      }
      
      const resTest = await fetch(`${testUrl}?name=${encodeURIComponent(domain)}&type=A`, { headers })
      if (!resTest.ok) throw new Error(`Test DNS HTTP ${resTest.status}`)
      const dataTest = await resTest.json()

      let testResolvedIps: string[] = []
      if (dataTest.Status === 0 && dataTest.Answer) {
        testResolvedIps = dataTest.Answer.filter((a: any) => a.type === 1).map((a: any) => a.data).sort()
      }

      setAuthIps(trustedIps)
      setTestIps(testResolvedIps)
      setHasRun(true)
      
      saveQuery({ domain, server }, { authIps: trustedIps, testIps: testResolvedIps })

    } catch (e: any) {
      setError(e.message || String(e))
    } finally {
      setLoading(false)
    }
  }

  const isMatch = authIps.join(',') === testIps.join(',') && authIps.length > 0
  const isCdnMismatch = !isMatch && authIps.length > 0 && testIps.length > 0

  const historyPanel = (
    <QueryHistory
      history={history}
      onRestore={(record: any) => {
        setInitialDomain(record.queryInfo.domain)
        setInitialServer(record.queryInfo.server || DEFAULT_TEST_SERVER)
        if (record.result) {
          setAuthIps(record.result.authIps)
          setTestIps(record.result.testIps)
          setHasRun(true)
          setError('')
        } else {
          handleQuery({ domain: record.queryInfo.domain, server: record.queryInfo.server })
        }
        setActiveTab('query')
      }}
      onDelete={deleteQuery}
      onClear={clearHistory}
      renderItem={(queryInfo: any) => (
        <div className="flex flex-col">
          <span>{queryInfo.domain}</span>
          {queryInfo.server && (
            <span className="text-xs text-gray-400 mt-0.5">@{queryInfo.server.replace(/^https?:\/\//, '').split('/')[0]}</span>
          )}
        </div>
      )}
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
        showServerInput={true}
        serverPlaceholder="https://dns.alidns.com/resolve"
        initialDomain={initialDomain}
        initialServer={initialServer}
      />
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-800">
          {error}
        </div>
      )}
      {hasRun && !error && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className={`px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center ${
            isMatch ? 'bg-green-50 dark:bg-green-900/20' : 'bg-orange-50 dark:bg-orange-900/20'
          }`}>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
              {isMatch ? <ShieldCheck className="w-5 h-5 text-green-600" /> : <ShieldAlert className="w-5 h-5 text-orange-600" />}
              {isMatch ? t('status_safe') : t('status_hijacked')}
            </h3>
          </div>
          <div className="p-6">
            <p className="mb-6 text-sm text-gray-600 dark:text-gray-300">
              {isMatch ? t('msg_match') : t('msg_mismatch')}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-3 text-sm font-medium text-indigo-700 dark:text-indigo-400">
                  <ShieldCheck className="w-4 h-4" />
                  {t('auth_results')} (Google / Trusted)
                </div>
                <div className="space-y-1">
                  {authIps.length > 0 ? authIps.map(ip => (
                    <div key={ip} className="font-mono text-sm dark:text-gray-200">{ip}</div>
                  )) : <div className="text-sm text-gray-500 italic">No IPs found</div>}
                </div>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-3 text-sm font-medium text-orange-700 dark:text-orange-400">
                  <Wifi className="w-4 h-4" />
                  {t('test_results')} (Tested Server)
                </div>
                <div className="space-y-1">
                  {testIps.length > 0 ? testIps.map(ip => (
                    <div key={ip} className="font-mono text-sm dark:text-gray-200">{ip}</div>
                  )) : <div className="text-sm text-gray-500 italic">No IPs found</div>}
                </div>
              </div>
            </div>
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

export default DnsHijackCheck
