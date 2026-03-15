import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PageHero, DnsQueryForm, QueryHistory, useQueryHistory, ToolTabView } from '@toolbox/ui-kit'
import { RefreshCw, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react'

interface TraceStep {
  domain: string
  target: string
  type: string
}

const DnsLoopCheck: React.FC = () => {
  const { t } = useTranslation('toolDnsLoopCheck')
  const [loading, setLoading] = useState(false)
  const [steps, setSteps] = useState<TraceStep[]>([])
  const [hasLoop, setHasLoop] = useState<boolean | null>(null)
  const [error, setError] = useState('')
  const [initialDomain, setInitialDomain] = useState('')

  const [activeTab, setActiveTab] = useState<'query' | 'history'>('query')

  const { history, saveQuery, deleteQuery, clearHistory } = useQueryHistory<{steps: TraceStep[], hasLoop: boolean | null}>('dns-loop-check')

  const handleQuery = async ({ domain }: { domain: string }) => {
    setLoading(true)
    setError('')
    setSteps([])
    setHasLoop(null)

    let currentDomain = domain
    const seenDomains = new Set<string>()
    const currentSteps: TraceStep[] = []
    let detectedLoop = false

    try {
      // Loop up to 15 times to prevent infinite browser hang, though DNS limit is typically 10-20
      for (let i = 0; i < 15; i++) {
        seenDomains.add(currentDomain.toLowerCase())
        
        // Query specific CNAME first to avoid automatic resolution of A record
        const res = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(currentDomain)}&type=CNAME`)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()

        if (data.Status === 0 && data.Answer && data.Answer.length > 0) {
          // Find the CNAME record in the answers
          const cnameRecord = data.Answer.find((ans: any) => ans.type === 5)
          if (cnameRecord) {
            let target = cnameRecord.data as string
            // Google DoH returns target with trailing dot sometimes
            if (target.endsWith('.')) {
              target = target.slice(0, -1)
            }
            
            currentSteps.push({
              domain: currentDomain,
              target: target,
              type: 'CNAME'
            })
            
            setSteps([...currentSteps])

            if (seenDomains.has(target.toLowerCase())) {
              detectedLoop = true
              break
            }
            currentDomain = target
            continue // continue to next iteration of loop to follow CNAME
          }
        }
        
        // If no CNAME found, check if it resolves to an IP, signifying end of chain
        const resA = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(currentDomain)}&type=A`)
        const dataA = await resA.json()
        if (dataA.Status === 0 && dataA.Answer && dataA.Answer.length > 0) {
           const ipRecords = dataA.Answer.filter((ans: any) => ans.type === 1)
           if (ipRecords.length > 0) {
             currentSteps.push({
               domain: currentDomain,
               target: ipRecords.map((r: any) => r.data).join(', '),
               type: 'A (Resolved)'
             })
           }
        }
        
        setSteps([...currentSteps])
        break // Stop loop if no CNAME redirects
      }

      const loopDetected = detectedLoop || currentSteps.length >= 15
      setHasLoop(loopDetected)
      saveQuery({ domain }, { steps: currentSteps, hasLoop: loopDetected })

    } catch (e: any) {
      setError(e.message || String(e))
    } finally {
      setLoading(false)
    }
  }

  const historyPanel = (
    <QueryHistory
      history={history}
      onRestore={(record: any) => {
        setInitialDomain(record.queryInfo.domain)
        if (record.result) {
          setSteps(record.result.steps)
          setHasLoop(record.result.hasLoop)
          setError('')
        } else {
          handleQuery({ domain: record.queryInfo.domain })
        }
        setActiveTab('query')
      }}
      onDelete={deleteQuery}
      onClear={clearHistory}
      renderItem={(queryInfo: any) => <span>{queryInfo.domain}</span>}
    />
  )

  const queryPanel = (
    <div className="space-y-4">
      <DnsQueryForm
        onQuery={handleQuery}
        loading={loading}
        recordTypes={['CNAME/A']}
        initialType="CNAME/A"
        domainPlaceholder={t('domain_label')}
        buttonText={t('query_btn')}
        showServerInput={false}
        initialDomain={initialDomain}
      />
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-800">
          {error}
        </div>
      )}
      {steps.length > 0 && !error && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className={`px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between ${
            hasLoop === true ? 'bg-red-50 dark:bg-red-900/20' : 'bg-green-50 dark:bg-green-900/20'
          }`}>
            <h3 className="text-lg font-medium flex items-center gap-2 text-gray-900 dark:text-gray-100">
              {hasLoop === true ? <AlertTriangle className="text-red-500 w-5 h-5" /> : <CheckCircle2 className="text-green-500 w-5 h-5" />}
              {t('scan_status')}
            </h3>
          </div>
          <div className="p-6">
            <p className="text-sm mb-6 text-gray-700 dark:text-gray-300">
              {hasLoop === true ? (
                <span className="text-red-600 font-medium">{t('limit_exceeded')}</span>
              ) : (
                <span>{t('no_loops')}</span>
              )}
            </p>
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                {t('chain_detected')}
              </h4>
              {steps.map((step, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-700">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-400 flex items-center justify-center text-xs font-bold">
                    {idx + 1}
                  </div>
                  <div className="flex-1 flex flex-wrap items-center gap-2 text-sm">
                    <span className="font-mono text-gray-800 dark:text-gray-200 break-all">{step.domain}</span>
                    <span className="px-2 py-0.5 rounded text-xs bg-gray-200 text-gray-600 dark:bg-gray-600 dark:text-gray-300">
                      {step.type}
                    </span>
                    <ArrowRight className="w-4 h-4 text-gray-400 mx-1" />
                    <span className="font-mono text-indigo-600 dark:text-indigo-400 break-all font-medium">
                      {step.target}
                    </span>
                  </div>
                </div>
              ))}
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

export default DnsLoopCheck

