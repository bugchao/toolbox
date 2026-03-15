import React, { useMemo, useState } from 'react'
import { ClipboardCopy, Download, FileText, History, ShieldHalf, WandSparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button, Card, InsightList, Input, MetricCard } from '@toolbox/ui-kit'
import { apiPost } from './shared/api'
import HistoryPanel from './shared/HistoryPanel'
import { ErrorCard, LoadingCard } from './shared/RequestState'
import ScoreBreakdownChart from './shared/ScoreBreakdownChart'
import SecurityWorkbench from './shared/SecurityWorkbench'
import type { SecurityReportResult } from './shared/types'
import { buildSecurityReportMarkdown, levelLabel, reportSourceLabel } from './shared/utils'
import { useLocalHistory } from './shared/history'

const I18N_NAMESPACE = 'toolSecurityReportGen'

const SecurityReportGen: React.FC = () => {
  const { t } = useTranslation(I18N_NAMESPACE)
  const [domain, setDomain] = useState('')
  const [ip, setIp] = useState('')
  const [portTarget, setPortTarget] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [result, setResult] = useState<SecurityReportResult | null>(null)
  const [viewMode, setViewMode] = useState<'query' | 'history'>('query')
  const history = useLocalHistory<{
    domain: string
    ip: string
    portTarget: string
    summary: string
    score: number
    level: SecurityReportResult['level']
  }>('toolbox-security-report-history')

  const markdown = useMemo(() => {
    if (!result) return ''
    return buildSecurityReportMarkdown(t, result, { domain, ip, portTarget })
  }, [domain, ip, portTarget, result, t])

  const runReport = async (next: { domain: string; ip: string; portTarget: string }) => {
    if (!next.domain.trim() && !next.ip.trim() && !next.portTarget.trim()) {
      setError(t('errors.empty'))
      return
    }

    setLoading(true)
    setError('')
    setCopied(false)
    try {
      const payload = await apiPost<SecurityReportResult>('/api/security/report', {
        domain: next.domain.trim(),
        ip: next.ip.trim(),
        portTarget: next.portTarget.trim(),
      })
      setResult(payload)
      history.save(
        {
          title: [next.domain.trim(), next.ip.trim(), next.portTarget.trim()].filter(Boolean).join(' · '),
          subtitle: payload.summary,
          score: payload.score,
          level: payload.level,
          payload: {
            domain: next.domain.trim(),
            ip: next.ip.trim(),
            portTarget: next.portTarget.trim(),
            summary: payload.summary,
            score: payload.score,
            level: payload.level,
          },
        },
        (entry) => `${entry.domain}|${entry.ip}|${entry.portTarget}`
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
    await runReport({ domain, ip, portTarget })
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(markdown)
    setCopied(true)
  }

  const handleDownload = () => {
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `security-report-${Date.now()}.md`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <SecurityWorkbench title={t('title')} description={t('description')}>
      <div className="flex flex-wrap justify-end gap-2">
        <Button type="button" variant={viewMode === 'query' ? 'primary' : 'ghost'} size="sm" onClick={() => setViewMode('query')}>
          <WandSparkles className="mr-2 h-4 w-4" />
          {t('view.query')}
        </Button>
        <Button type="button" variant={viewMode === 'history' ? 'primary' : 'ghost'} size="sm" onClick={() => setViewMode('history')}>
          <History className="mr-2 h-4 w-4" />
          {t('view.history')}
        </Button>
      </div>

      {viewMode === 'query' ? (
        <Card>
          <form className="grid gap-4 lg:grid-cols-3" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="security-report-domain">
                {t('form.domainLabel')}
              </label>
              <Input
                id="security-report-domain"
                size="lg"
                value={domain}
                onChange={(event) => setDomain(event.target.value)}
                placeholder={t('form.domainPlaceholder')}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="security-report-ip">
                {t('form.ipLabel')}
              </label>
              <Input
                id="security-report-ip"
                size="lg"
                value={ip}
                onChange={(event) => setIp(event.target.value)}
                placeholder={t('form.ipPlaceholder')}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="security-report-port-target">
                {t('form.portTargetLabel')}
              </label>
              <Input
                id="security-report-port-target"
                size="lg"
                value={portTarget}
                onChange={(event) => setPortTarget(event.target.value)}
                placeholder={t('form.portTargetPlaceholder')}
              />
            </div>
            <div className="lg:col-span-3 flex justify-end">
              <Button type="submit" disabled={loading}>
                <WandSparkles className="mr-2 h-4 w-4" />
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
            setIp(entry.payload.ip)
            setPortTarget(entry.payload.portTarget)
            setViewMode('query')
            void runReport(entry.payload)
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
              icon={ShieldHalf}
              level={result.level}
              levelLabel={levelLabel(t, result.level)}
            />
            <MetricCard
              title={t('cards.sections')}
              value={Object.values(result.sections).filter(Boolean).length}
              hint={t('cards.sectionsHint')}
              icon={FileText}
            />
            <MetricCard
              title={t('cards.findings')}
              value={result.findings.length}
              hint={t('cards.findingsHint')}
              icon={ShieldHalf}
            />
            <MetricCard
              title={t('cards.derivedIp')}
              value={result.derivedIp || '—'}
              hint={t('cards.derivedIpHint')}
              icon={WandSparkles}
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <Card>
              <ScoreBreakdownChart t={t} dimensions={result.dimensions} title={t('charts.dimensionScore')} />
            </Card>
            <InsightList
              title={t('insights.title')}
              items={result.findings.map((item) => ({
                ...item,
                title: `${reportSourceLabel(t, item.source)} · ${item.title}`,
              }))}
              emptyText={t('insights.empty')}
              getLevelLabel={(level) => levelLabel(t, level)}
            />
          </div>

          <Card>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('report.previewTitle')}</div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="secondary" onClick={handleCopy}>
                  <ClipboardCopy className="mr-2 h-4 w-4" />
                  {copied ? t('report.copied') : t('report.copy')}
                </Button>
                <Button type="button" onClick={handleDownload}>
                  <Download className="mr-2 h-4 w-4" />
                  {t('report.download')}
                </Button>
              </div>
            </div>
            <textarea
              className="min-h-[320px] w-full rounded-2xl border border-gray-300 bg-gray-50 px-4 py-4 font-mono text-sm leading-6 text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
              value={markdown}
              readOnly
            />
          </Card>
        </div>
      ) : null}
    </SecurityWorkbench>
  )
}

export default SecurityReportGen
