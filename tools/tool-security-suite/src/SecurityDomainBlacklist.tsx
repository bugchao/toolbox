import React, { useState } from 'react'
import { History, ListChecks, Mail, ShieldBan, Globe } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button, Card, InsightList, Input, MetricCard, RiskBadge } from '@toolbox/ui-kit'
import { apiGet } from './shared/api'
import HistoryPanel from './shared/HistoryPanel'
import { ErrorCard, LoadingCard } from './shared/RequestState'
import RecordListCard from './shared/RecordListCard'
import ScoreBreakdownChart from './shared/ScoreBreakdownChart'
import SecurityWorkbench from './shared/SecurityWorkbench'
import type { DomainBlacklistResult } from './shared/types'
import { formatDate, levelLabel, statusLabel } from './shared/utils'
import { useLocalHistory } from './shared/history'

const I18N_NAMESPACE = 'toolSecurityDomainBlacklist'

const SecurityDomainBlacklist: React.FC = () => {
  const { t, i18n } = useTranslation(I18N_NAMESPACE)
  const [domain, setDomain] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<DomainBlacklistResult | null>(null)
  const [viewMode, setViewMode] = useState<'query' | 'history'>('query')
  const history = useLocalHistory<{ domain: string; summary: string; score: number; level: DomainBlacklistResult['level'] }>(
    'toolbox-security-domain-blacklist-history'
  )

  const runAnalysis = async (nextDomain: string) => {
    if (!nextDomain.trim()) {
      setError(t('errors.empty'))
      return
    }

    setLoading(true)
    setError('')
    try {
      const payload = await apiGet<DomainBlacklistResult>(
        `/api/security/domain-blacklist?domain=${encodeURIComponent(nextDomain.trim())}`
      )
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
          <ShieldBan className="mr-2 h-4 w-4" />
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
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="security-domain-blacklist">
                {t('form.domainLabel')}
              </label>
              <Input
                id="security-domain-blacklist"
                size="lg"
                value={domain}
                onChange={(event) => setDomain(event.target.value)}
                placeholder={t('form.domainPlaceholder')}
              />
            </div>
            <div className="flex items-end">
              <Button className="w-full md:w-auto" type="submit" disabled={loading}>
                <ShieldBan className="mr-2 h-4 w-4" />
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
              icon={ShieldBan}
              level={result.level}
              levelLabel={levelLabel(t, result.level)}
            />
            <MetricCard
              title={t('cards.blacklistHits')}
              value={result.blacklists.filter((item) => item.status === 'listed').length}
              hint={t('cards.blacklistHitsHint')}
              icon={ListChecks}
              level={result.blacklists.some((item) => item.status === 'listed') ? 'high' : 'low'}
            />
            <MetricCard
              title={t('cards.age')}
              value={result.profile.ageDays == null ? '—' : `${result.profile.ageDays}d`}
              hint={formatDate(result.profile.createdDate, i18n.language === 'zh' ? 'zh-CN' : 'en-US')}
              icon={Globe}
            />
            <MetricCard
              title={t('cards.mailAuth')}
              value={`${result.profile.spfRecords.length}/${result.profile.dmarcRecords.length}`}
              hint={t('cards.mailAuthHint')}
              icon={Mail}
              level={!result.profile.spfRecords.length || !result.profile.dmarcRecords.length ? 'medium' : 'low'}
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
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

          <Card>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('blacklists.title')}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{result.target}</div>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              {result.blacklists.map((item) => (
                <div key={item.name} className="rounded-2xl border border-gray-200 px-4 py-4 dark:border-gray-700">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-gray-100">{item.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{item.zone}</div>
                    </div>
                    <RiskBadge level={item.status === 'listed' ? 'critical' : item.status === 'unavailable' ? 'medium' : 'low'} label={statusLabel(t, item.status)} />
                  </div>
                  <div className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-300">{item.description}</div>
                  {item.codes.length ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {item.codes.map((code) => (
                        <span key={code} className="rounded-full bg-gray-100 px-2.5 py-1 font-mono text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                          {code}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </Card>

          <div className="grid gap-4 lg:grid-cols-3">
            <RecordListCard
              title={t('records.spf')}
              items={result.profile.spfRecords}
              emptyText={t('records.empty')}
            />
            <RecordListCard
              title={t('records.dmarc')}
              items={result.profile.dmarcRecords}
              emptyText={t('records.empty')}
            />
            <RecordListCard
              title={t('records.addresses')}
              items={[...result.profile.addresses.a, ...result.profile.addresses.aaaa]}
              emptyText={t('records.empty')}
            />
          </div>
        </div>
      ) : null}
    </SecurityWorkbench>
  )
}

export default SecurityDomainBlacklist
