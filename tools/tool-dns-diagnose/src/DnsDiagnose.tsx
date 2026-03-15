import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PageHero, DnsQueryForm, QueryHistory, useQueryHistory, ToolTabView } from '@toolbox/ui-kit'
import type { QueryHistoryRecord } from '@toolbox/ui-kit'
import { CheckCircle2, XCircle, AlertTriangle, Loader2 } from 'lucide-react'

interface DiagnosisStep {
  name: string
  status: 'pending' | 'success' | 'failed' | 'warning'
  message: string
}

const DnsDiagnose: React.FC = () => {
  const { t } = useTranslation('toolDnsDiagnose')
  const [loading, setLoading] = useState(false)
  const [steps, setSteps] = useState<DiagnosisStep[]>([])
  const [conclusion, setConclusion] = useState('')
  const [initialDomain, setInitialDomain] = useState('')
  const [activeTab, setActiveTab] = useState<'query' | 'history'>('query')

  const { history, saveQuery, deleteQuery, clearHistory } = useQueryHistory<{steps: DiagnosisStep[], conclusion: string}>('dns-diagnose')

  const handleQuery = async ({ domain }: { domain: string }) => {
    setLoading(true)
    setSteps([])
    setConclusion('')

    const newSteps: DiagnosisStep[] = [
      { name: t('step_soa_record'), status: 'pending', message: '...' },
      { name: t('step_ns_record'), status: 'pending', message: '...' },
      { name: t('step_a_record'), status: 'pending', message: '...' },
      { name: t('step_aaaa_record'), status: 'pending', message: '...' }
    ]
    setSteps([...newSteps])

    try {
      const fetchDns = async (type: string) => {
        const res = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=${type}`)
        return await res.json()
      }

      // 1. SOA Record check (indicates existence)
      let soaHasRecord = false
      try {
        const soaData = await fetchDns('SOA')
        if (soaData.Status === 0 && soaData.Answer && soaData.Answer.length > 0) {
          soaHasRecord = true
          newSteps[0] = { name: t('step_soa_record'), status: 'success', message: t('msg_has_soa') }
        } else {
          newSteps[0] = { name: t('step_soa_record'), status: 'failed', message: t('msg_no_soa') }
        }
      } catch (e) {
        newSteps[0] = { name: t('step_soa_record'), status: 'failed', message: String(e) }
      }
      setSteps([...newSteps])

      if (!soaHasRecord) {
        setConclusion(t('conclusion_nxdomain'))
        setLoading(false)
        return
      }

      // 2. NS Record check
      try {
        const nsData = await fetchDns('NS')
        if (nsData.Status === 0 && nsData.Answer && nsData.Answer.length > 0) {
          newSteps[1] = { name: t('step_ns_record'), status: 'success', message: t('msg_has_ns') }
        } else {
          newSteps[1] = { name: t('step_ns_record'), status: 'warning', message: t('msg_no_ns') }
        }
      } catch (e) {
        newSteps[1] = { name: t('step_ns_record'), status: 'warning', message: String(e) }
      }
      setSteps([...newSteps])

      // 3. A Record check
      let hasIpv4 = false
      try {
        const aData = await fetchDns('A')
        if (aData.Status === 0 && aData.Answer && aData.Answer.length > 0) {
          hasIpv4 = true
          newSteps[2] = { name: t('step_a_record'), status: 'success', message: t('msg_has_ipv4') }
        } else {
          newSteps[2] = { name: t('step_a_record'), status: 'warning', message: t('msg_no_ipv4') }
        }
      } catch (e) {
        newSteps[2] = { name: t('step_a_record'), status: 'failed', message: String(e) }
      }
      setSteps([...newSteps])

      // 4. AAAA Record check
      let hasIpv6 = false
      try {
        const aaaaData = await fetchDns('AAAA')
        if (aaaaData.Status === 0 && aaaaData.Answer && aaaaData.Answer.length > 0) {
          hasIpv6 = true
          newSteps[3] = { name: t('step_aaaa_record'), status: 'success', message: t('msg_has_ipv6') }
        } else {
          newSteps[3] = { name: t('step_aaaa_record'), status: 'warning', message: t('msg_no_ipv6') }
        }
      } catch (e) {
        newSteps[3] = { name: t('step_aaaa_record'), status: 'failed', message: String(e) }
      }
      setSteps([...newSteps])

      // Conclusion logic
      let finalConclusion = ''
      if (hasIpv4 || hasIpv6) {
        finalConclusion = t('conclusion_ok')
      } else {
        finalConclusion = t('conclusion_no_ips')
      }
      setConclusion(finalConclusion)
      
      saveQuery({ domain }, { steps: newSteps, conclusion: finalConclusion })

    } catch (e: any) {
      const errorMsg = t('conclusion_error')
      setConclusion(errorMsg)
      saveQuery({ domain }, { steps: newSteps, conclusion: errorMsg })
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case 'pending':
        return <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
      default:
        return null
    }
  }

  const historyPanel = (
    <QueryHistory
      history={history}
      onRestore={(record: QueryHistoryRecord<{steps: DiagnosisStep[], conclusion: string}>) => {
        setInitialDomain(record.queryInfo.domain)
        if (record.result) {
          setSteps(record.result.steps)
          setConclusion(record.result.conclusion)
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
        recordTypes={['ANY']}
        initialType="ANY"
        domainPlaceholder={t('domain_label')}
        buttonText={t('query_btn')}
        initialDomain={initialDomain}
        showServerInput={false}
      />

      {steps.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{t('diagnosis_results')}</h3>
          </div>
          <div className="p-6 space-y-4">
            {steps.map((step, idx) => (
              <div key={idx} className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-700">
                <div className="mt-0.5">{getStatusIcon(step.status)}</div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">{step.name}</h4>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{step.message}</p>
                </div>
              </div>
            ))}
            {conclusion && (
              <div className={`mt-6 p-4 rounded-lg border ${
                conclusion.includes('NXDOMAIN') || conclusion.includes('Error')
                  ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
                  : 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-400'
              }`}>
                <h4 className="text-sm font-medium mb-1">{t('conclusion')}</h4>
                <p className="text-sm">{conclusion}</p>
              </div>
            )}
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

export default DnsDiagnose
