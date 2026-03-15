import React, { useMemo, useState } from 'react'
import { History, Radar, ShieldAlert, Unplug, Workflow } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button, Card, InsightList, Input, MetricCard, RiskBadge } from '@toolbox/ui-kit'
import { apiPost } from './shared/api'
import HistoryPanel from './shared/HistoryPanel'
import { ErrorCard, LoadingCard } from './shared/RequestState'
import ScoreBreakdownChart from './shared/ScoreBreakdownChart'
import SecurityWorkbench from './shared/SecurityWorkbench'
import type { PortScanResult } from './shared/types'
import { levelLabel, statusLabel } from './shared/utils'
import { useLocalHistory } from './shared/history'

const I18N_NAMESPACE = 'toolSecurityPortScan'

const SecurityPortScan: React.FC = () => {
  const { t } = useTranslation(I18N_NAMESPACE)
  const [target, setTarget] = useState('')
  const [preset, setPreset] = useState('common')
  const [customPorts, setCustomPorts] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<PortScanResult | null>(null)
  const [viewMode, setViewMode] = useState<'query' | 'history'>('query')
  const history = useLocalHistory<{ target: string; preset: string; customPorts: string; summary: string; score: number; level: PortScanResult['level'] }>(
    'toolbox-security-port-scan-history'
  )

  const runAnalysis = async (next: { target: string; preset: string; customPorts: string }) => {
    if (!next.target.trim()) {
      setError(t('errors.empty'))
      return
    }

    setLoading(true)
    setError('')
    try {
      const payload = await apiPost<PortScanResult>('/api/security/port-scan', {
        target: next.target.trim(),
        preset: next.preset,
        ports: next.customPorts,
      })
      setResult(payload)
      history.save(
        {
          title: `${next.target.trim()} · ${t(`presets.${next.preset}`)}`,
          subtitle: payload.summary,
          score: payload.score,
          level: payload.level,
          payload: {
            target: next.target.trim(),
            preset: next.preset,
            customPorts: next.customPorts,
            summary: payload.summary,
            score: payload.score,
            level: payload.level,
          },
        },
        (entry) => `${entry.target}|${entry.preset}|${entry.customPorts}`
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
    await runAnalysis({ target, preset, customPorts })
  }

  const openResults = useMemo(
    () => result?.results.filter((item) => item.status === 'open') ?? [],
    [result]
  )

  return (
    <SecurityWorkbench title={t('title')} description={t('description')}>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant={viewMode === 'query' ? 'primary' : 'ghost'} size="sm" onClick={() => setViewMode('query')}>
          <Radar className="mr-2 h-4 w-4" />
          {t('view.query')}
        </Button>
        <Button type="button" variant={viewMode === 'history' ? 'primary' : 'ghost'} size="sm" onClick={() => setViewMode('history')}>
          <History className="mr-2 h-4 w-4" />
          {t('view.history')}
        </Button>
      </div>

      {viewMode === 'query' ? (
        <Card>
          <form className="grid gap-4 lg:grid-cols-[1.2fr_180px_1fr_auto]" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="security-port-scan-target">
                {t('form.targetLabel')}
              </label>
              <Input
                id="security-port-scan-target"
                size="lg"
                value={target}
                onChange={(event) => setTarget(event.target.value)}
                placeholder={t('form.targetPlaceholder')}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="security-port-scan-preset">
                {t('form.presetLabel')}
              </label>
              <select
                id="security-port-scan-preset"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                value={preset}
                onChange={(event) => setPreset(event.target.value)}
              >
                <option value="web">{t('presets.web')}</option>
                <option value="quick">{t('presets.quick')}</option>
                <option value="common">{t('presets.common')}</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="security-port-scan-custom">
                {t('form.customPortsLabel')}
              </label>
              <Input
                id="security-port-scan-custom"
                size="lg"
                value={customPorts}
                onChange={(event) => setCustomPorts(event.target.value)}
                placeholder={t('form.customPortsPlaceholder')}
              />
            </div>
            <div className="flex items-end">
              <Button className="w-full lg:w-auto" type="submit" disabled={loading}>
                <Radar className="mr-2 h-4 w-4" />
                {t('form.submit')}
              </Button>
            </div>
          </form>
        </Card>
      ) : (
        <HistoryPanel
          entries={history.entries}
          onSelect={(entry) => {
            setTarget(entry.payload.target)
            setPreset(entry.payload.preset)
            setCustomPorts(entry.payload.customPorts)
            setViewMode('query')
            void runAnalysis(entry.payload)
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
              title={t('cards.openPorts')}
              value={result.counts.open}
              hint={`${result.counts.total} ${t('cards.totalChecked')}`}
              icon={Workflow}
              level={result.counts.open > 0 ? 'medium' : 'low'}
            />
            <MetricCard
              title={t('cards.filteredPorts')}
              value={result.counts.filtered}
              hint={t('cards.filteredHint')}
              icon={Unplug}
            />
            <MetricCard
              title={t('cards.target')}
              value={result.target}
              hint={result.resolvedAddresses.map((item) => item.address).join(', ') || '—'}
              icon={Radar}
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

          <Card>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('ports.title')}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{result.target}</div>
            </div>
            <div className="grid gap-3 lg:grid-cols-2">
              {result.results.map((item) => (
                <div key={item.port} className="rounded-2xl border border-gray-200 px-4 py-4 dark:border-gray-700">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-gray-100">
                        {item.service} · {item.port}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{item.latencyMs} ms</div>
                    </div>
                    <RiskBadge
                      level={item.status === 'open' ? item.severity : item.status === 'filtered' ? 'medium' : 'low'}
                      label={statusLabel(t, item.status)}
                    />
                  </div>
                  <div className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-300">{item.reason}</div>
                  {item.banner ? (
                    <div className="mt-3 rounded-xl bg-gray-100 px-3 py-2 font-mono text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                      {item.banner}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </Card>

          {openResults.length ? (
            <Card>
              <div className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">{t('ports.exposureTitle')}</div>
              <div className="grid gap-3 lg:grid-cols-2">
                {openResults.map((item) => (
                  <div key={`exposure-${item.port}`} className="rounded-2xl border border-gray-200 px-4 py-4 dark:border-gray-700">
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-semibold text-gray-900 dark:text-gray-100">
                        {item.service} / {item.port}
                      </div>
                      <RiskBadge level={item.severity} label={levelLabel(t, item.severity)} />
                    </div>
                    <div className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">{item.reason}</div>
                  </div>
                ))}
              </div>
            </Card>
          ) : null}
        </div>
      ) : null}
    </SecurityWorkbench>
  )
}

export default SecurityPortScan
