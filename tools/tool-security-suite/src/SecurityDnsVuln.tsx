import React, { useState } from 'react'
import { History, MailCheck, ShieldCheck, ShieldQuestion, Waypoints } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button, Card, InsightList, Input, MetricCard } from '@toolbox/ui-kit'
import { apiGet } from './shared/api'
import HistoryPanel from './shared/HistoryPanel'
import { ErrorCard, LoadingCard } from './shared/RequestState'
import RecordListCard from './shared/RecordListCard'
import ScoreBreakdownChart from './shared/ScoreBreakdownChart'
import SecurityWorkbench from './shared/SecurityWorkbench'
import type { DnsVulnResult } from './shared/types'
import { levelLabel } from './shared/utils'
import { useLocalHistory } from './shared/history'

const I18N_NAMESPACE = 'toolSecurityDnsVuln'

const SecurityDnsVuln: React.FC = () => {
  const { t } = useTranslation(I18N_NAMESPACE)
  const [domain, setDomain] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<DnsVulnResult | null>(null)
  const [viewMode, setViewMode] = useState<'query' | 'history'>('query')
  const history = useLocalHistory<{ domain: string; summary: string; score: number; level: DnsVulnResult['level'] }>(
    'toolbox-security-dns-vuln-history'
  )

  const runAnalysis = async (nextDomain: string) => {
    if (!nextDomain.trim()) {
      setError(t('errors.empty'))
      return
    }

    setLoading(true)
    setError('')
    try {
      const payload = await apiGet<DnsVulnResult>(`/api/security/dns-vuln?domain=${encodeURIComponent(nextDomain.trim())}`)
      setResult(payload)
      history.save(
        {
          title: nextDomain.trim(),
          subtitle: payload.summary,
          score: payload.score,
          level: payload.level,
          payload: {
            domain: nextDomain.trim(),
            summary: payload.summary,
            score: payload.score,
            level: payload.level,
          },
        },
        (entry) => entry.domain
      )
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : t('errors.request'))
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    await runAnalysis(domain)
  }

  return (
    <SecurityWorkbench title={t('title')} description={t('description')}>
      <div className="flex flex-wrap justify-end gap-2">
        <Button type="button" variant={viewMode === 'query' ? 'primary' : 'ghost'} size="sm" onClick={() => setViewMode('query')}>
          <ShieldCheck className="mr-2 h-4 w-4" />
          {t('view.query')}
        </Button>
        <Button type="button" variant={viewMode === 'history' ? 'primary' : 'ghost'} size="sm" onClick={() => setViewMode('history')}>
          <History className="mr-2 h-4 w-4" />
          {t('view.history')}
        </Button>
      </div>

      {viewMode === 'query' ? (
        <Card>
          <form className="grid gap-4 md:grid-cols-[1fr_auto]" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="security-dns-vuln">
                {t('form.domainLabel')}
              </label>
              <Input
                id="security-dns-vuln"
                size="lg"
                value={domain}
                onChange={(event) => setDomain(event.target.value)}
                placeholder={t('form.domainPlaceholder')}
              />
            </div>
            <div className="flex items-end">
              <Button className="w-full md:w-auto" type="submit" disabled={loading}>
                <ShieldCheck className="mr-2 h-4 w-4" />
                {t('form.submit')}
              </Button>
            </div>
          </form>
        </Card>
      ) : (
        <HistoryPanel
          entries={history.entries}
          onSelect={(entry) => {
            setDomain(entry.payload.domain)
            setViewMode('query')
            void runAnalysis(entry.payload.domain)
          }}
          onRemove={history.remove}
          onClear={history.clear}
          getLevelLabel={(level) => levelLabel(t, level)}
          labels={{
            title: t('history.title'),
            empty: t('history.empty'),
            rerun: t('history.rerun'),
            remove: t('history.remove'),
            clear: t('history.clear'),
          }}
        />
      )}

      {error ? <ErrorCard text={error} /> : null}
      {loading ? <LoadingCard text={t('loading')} /> : null}

      {result ? (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              title={t('cards.overallScore')}
              value={`${result.score}/100`}
              hint={result.summary}
              icon={ShieldCheck}
              level={result.level}
              levelLabel={levelLabel(t, result.level)}
            />
            <MetricCard
              title={t('cards.delegation')}
              value={result.records.ns.length}
              hint={t('cards.delegationHint')}
              icon={Waypoints}
              level={result.records.ns.length < 2 ? 'medium' : 'low'}
            />
            <MetricCard
              title={t('cards.mailAuth')}
              value={`${result.records.spfRecords.length}/${result.records.dmarc.length}`}
              hint={t('cards.mailAuthHint')}
              icon={MailCheck}
              level={!result.records.spfRecords.length || !result.records.dmarc.length ? 'medium' : 'low'}
            />
            <MetricCard
              title={t('cards.dnssec')}
              value={result.records.dnssecEnabled ? t('cards.enabled') : t('cards.disabled')}
              hint={result.records.wildcardEnabled ? t('cards.wildcardHint') : t('cards.noWildcardHint')}
              icon={result.records.dnssecEnabled ? ShieldCheck : ShieldQuestion}
              level={result.records.dnssecEnabled ? 'low' : 'medium'}
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <Card>
              <ScoreBreakdownChart t={t} dimensions={result.dimensions} title={t('charts.dimensionScore')} />
            </Card>
            <InsightList
              title={t('insights.title')}
              items={result.findings}
              emptyText={t('insights.empty')}
              getLevelLabel={(level) => levelLabel(t, level)}
            />
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <RecordListCard
              title={t('records.spf')}
              items={result.records.spfRecords}
              emptyText={t('records.empty')}
            />
            <RecordListCard
              title={t('records.dmarc')}
              items={result.records.dmarc}
              emptyText={t('records.empty')}
            />
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            <RecordListCard
              title={t('records.ns')}
              items={result.records.ns}
              emptyText={t('records.empty')}
            />
            <RecordListCard
              title={t('records.a')}
              items={[...result.records.a, ...result.records.aaaa]}
              emptyText={t('records.empty')}
            />
            <RecordListCard
              title={t('records.caa')}
              items={result.records.caa.map((item) => `${item.tag ?? 'caa'}: ${item.value ?? item.issue ?? '—'}`)}
              emptyText={t('records.empty')}
            />
          </div>

          <Card>
            <div className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">{t('records.nsAddressChecks')}</div>
            <div className="grid gap-3 lg:grid-cols-2">
              {result.records.nsAddressChecks.map((item) => (
                <div key={item.server} className="rounded-2xl border border-gray-200 px-4 py-4 dark:border-gray-700">
                  <div className="font-semibold text-gray-900 dark:text-gray-100">{item.server}</div>
                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                    {[...item.addresses.a, ...item.addresses.aaaa].join(', ') || t('records.empty')}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      ) : null}
    </SecurityWorkbench>
  )
}

export default SecurityDnsVuln
