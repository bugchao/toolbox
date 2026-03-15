import React, { useState } from 'react'
import { History, Search, ShieldAlert, MapPinned, Network, ScanLine } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button, Card, InsightList, Input, MetricCard } from '@toolbox/ui-kit'
import { apiGet } from './shared/api'
import HistoryPanel from './shared/HistoryPanel'
import { ErrorCard, LoadingCard } from './shared/RequestState'
import ScoreBreakdownChart from './shared/ScoreBreakdownChart'
import SecurityWorkbench from './shared/SecurityWorkbench'
import type { IpRiskResult } from './shared/types'
import { levelLabel } from './shared/utils'
import { useLocalHistory } from './shared/history'

const I18N_NAMESPACE = 'toolSecurityIpScore'

const SecurityIpScore: React.FC = () => {
  const { t, i18n } = useTranslation(I18N_NAMESPACE)
  const [ip, setIp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<IpRiskResult | null>(null)
  const [viewMode, setViewMode] = useState<'query' | 'history'>('query')
  const history = useLocalHistory<{ ip: string; summary: string; score: number; level: IpRiskResult['level'] }>(
    'toolbox-security-ip-score-history'
  )

  const runAnalysis = async (nextIp: string) => {
    if (!nextIp.trim()) {
      setError(t('errors.empty'))
      return
    }

    setLoading(true)
    setError('')
    try {
      const payload = await apiGet<IpRiskResult>(`/api/security/ip-score?ip=${encodeURIComponent(nextIp.trim())}`)
      setResult(payload)
      history.save(
        {
          title: nextIp.trim(),
          subtitle: payload.summary,
          score: payload.score,
          level: payload.level,
          payload: {
            ip: nextIp.trim(),
            summary: payload.summary,
            score: payload.score,
            level: payload.level,
          },
        },
        (entry) => entry.ip
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
    await runAnalysis(ip)
  }

  return (
    <SecurityWorkbench title={t('title')} description={t('description')}>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant={viewMode === 'query' ? 'primary' : 'ghost'} size="sm" onClick={() => setViewMode('query')}>
          <Search className="mr-2 h-4 w-4" />
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
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="security-ip-score">
                {t('form.ipLabel')}
              </label>
              <Input
                id="security-ip-score"
                size="lg"
                value={ip}
                onChange={(event) => setIp(event.target.value)}
                placeholder={t('form.ipPlaceholder')}
              />
            </div>
            <div className="flex items-end">
              <Button className="w-full md:w-auto" type="submit" disabled={loading}>
                <Search className="mr-2 h-4 w-4" />
                {t('form.submit')}
              </Button>
            </div>
          </form>
        </Card>
      ) : (
        <HistoryPanel
          entries={history.entries}
          onSelect={(entry) => {
            setIp(entry.payload.ip)
            setViewMode('query')
            void runAnalysis(entry.payload.ip)
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
              icon={ShieldAlert}
              level={result.level}
              levelLabel={levelLabel(t, result.level)}
            />
            <MetricCard
              title={t('cards.networkOwner')}
              value={result.context.org || '—'}
              hint={result.context.asn || '—'}
              icon={Network}
              level={result.level}
            />
            <MetricCard
              title={t('cards.location')}
              value={result.context.country || '—'}
              hint={[result.context.region, result.context.city].filter(Boolean).join(' / ') || '—'}
              icon={MapPinned}
            />
            <MetricCard
              title={t('cards.reputation')}
              value={t(`reputation.${result.context.reputation.status}`)}
              hint={result.context.reputation.description}
              icon={ScanLine}
              level={result.context.reputation.status === 'listed' ? 'critical' : result.context.reputation.status === 'unavailable' ? 'medium' : 'low'}
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

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <div className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">{t('details.registryTitle')}</div>
              <dl className="grid gap-3 text-sm">
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-gray-500 dark:text-gray-400">{t('details.asn')}</dt>
                  <dd className="font-medium text-gray-900 dark:text-gray-100">{result.context.asn || '—'}</dd>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-gray-500 dark:text-gray-400">{t('details.rdapHandle')}</dt>
                  <dd className="font-medium text-gray-900 dark:text-gray-100">{result.context.rdapHandle || '—'}</dd>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-gray-500 dark:text-gray-400">{t('details.timezone')}</dt>
                  <dd className="font-medium text-gray-900 dark:text-gray-100">{result.context.timezone || '—'}</dd>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-gray-500 dark:text-gray-400">{t('details.abuseContacts')}</dt>
                  <dd className="max-w-[60%] text-right font-medium text-gray-900 dark:text-gray-100">
                    {result.context.abuseContacts.length ? result.context.abuseContacts.join(', ') : '—'}
                  </dd>
                </div>
              </dl>
            </Card>

            <Card>
              <div className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">{t('details.traceabilityTitle')}</div>
              <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">{t('details.ptrRecords')}</span>
                  <div className="mt-2 space-y-2">
                    {result.context.ptrRecords.length ? (
                      result.context.ptrRecords.map((item) => (
                        <div key={item} className="rounded-2xl border border-gray-200 px-3 py-2 dark:border-gray-700">
                          {item}
                        </div>
                      ))
                    ) : (
                      <div className="rounded-2xl border border-dashed border-gray-200 px-3 py-4 text-gray-500 dark:border-gray-700 dark:text-gray-400">
                        {t('details.ptrEmpty')}
                      </div>
                    )}
                  </div>
                </div>
                <div className="pt-2 text-xs text-gray-500 dark:text-gray-400">
                  {t('details.note', { locale: i18n.language })}
                </div>
              </div>
            </Card>
          </div>
        </div>
      ) : null}
    </SecurityWorkbench>
  )
}

export default SecurityIpScore
