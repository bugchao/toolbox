import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Activity,
  Clock3,
  FileSearch,
  Globe2,
  KeyRound,
  MailCheck,
  ScanSearch,
  ShieldCheck,
  ShieldEllipsis,
} from 'lucide-react'
import {
  Button,
  Card,
  DataTable,
  Input,
  NoticeCard,
  PropertyGrid,
  QueryHistory,
  ToolTabView,
  useQueryHistory,
  RiskBadge,
} from '@toolbox/ui-kit'
import type { QueryHistoryRecord } from '@toolbox/ui-kit'
import DomainWorkbench from './shared/DomainWorkbench'

type GenericResult = Record<string, any>

function levelLabel(level?: string) {
  switch (level) {
    case 'low':
      return 'Good'
    case 'info':
      return 'Stable'
    case 'medium':
      return 'Watch'
    case 'high':
      return 'Risky'
    default:
      return 'Info'
  }
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">{children}</div>
}

function formatTimestamp(value?: string) {
  return value ? new Date(value).toLocaleString() : '—'
}

function renderList(items?: string[]) {
  if (!items?.length) return null
  return (
    <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
      {items.map((item) => (
        <li key={item} className="rounded-xl bg-gray-50 px-3 py-2 dark:bg-gray-900/50">
          {item}
        </li>
      ))}
    </ul>
  )
}

function ResultFrame({
  result,
  t,
  overview,
  main,
  notes,
}: {
  result: GenericResult | null
  t: (key: string) => string
  overview?: React.ReactNode
  main?: React.ReactNode
  notes?: string[]
}) {
  if (!result) {
    return (
      <Card>
        <div className="py-10 text-center text-sm text-gray-500 dark:text-gray-400">{t('result.empty')}</div>
      </Card>
    )
  }

  if (result.error) {
    return <NoticeCard tone="danger" title={result.error} />
  }

  return (
    <Card className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SectionTitle>{t('result.overview')}</SectionTitle>
        <div className="flex items-center gap-2">
          {typeof result.score === 'number' ? (
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-200">
              {result.score}/100
            </span>
          ) : null}
          {result.level ? <RiskBadge level={result.level} label={levelLabel(result.level)} /> : null}
        </div>
      </div>
      <PropertyGrid
        items={[
          { label: 'Domain', value: result.domain ?? '—', tone: 'primary' },
          ...(result.selector ? [{ label: 'Selector', value: result.selector }] : []),
          { label: t('result.updated'), value: formatTimestamp(result.timestamp) },
        ]}
      />
      {overview}
      {main}
      {result.issues?.length ? (
        <div className="space-y-3">
          <SectionTitle>{t('result.issues')}</SectionTitle>
          {renderList(result.issues)}
        </div>
      ) : null}
      {result.suggestions?.length ? (
        <div className="space-y-3">
          <SectionTitle>{t('result.suggestions')}</SectionTitle>
          {renderList(result.suggestions)}
        </div>
      ) : null}
      {notes?.length ? (
        <div className="space-y-3">
          <SectionTitle>{t('result.notes')}</SectionTitle>
          {renderList(notes)}
        </div>
      ) : null}
    </Card>
  )
}

function HistoryPane({
  t,
  history,
  onRestore,
  onDelete,
  onClear,
}: {
  t: (key: string) => string
  history: QueryHistoryRecord<any>[]
  onRestore: (record: QueryHistoryRecord<any>) => void
  onDelete: (id: string) => void
  onClear: () => void
}) {
  return (
    <QueryHistory
      history={history}
      onRestore={onRestore}
      onDelete={onDelete}
      onClear={onClear}
      title={t('history.title')}
      emptyMessage={t('history.empty')}
      renderItem={(queryInfo) =>
        queryInfo.selector ? `${queryInfo.domain} · ${queryInfo.selector}` : queryInfo.domain
      }
    />
  )
}

async function postJson(path: string, payload: Record<string, unknown>) {
  const response = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data.error || 'Request failed')
  return data
}

function BaseQuery({
  domain,
  selector,
  setDomain,
  setSelector,
  submitLabel,
  submittingLabel,
  onSubmit,
  domainLabel,
  selectorLabel,
  domainPlaceholder,
  selectorPlaceholder,
  loading,
  children,
}: {
  domain: string
  selector?: string
  setDomain: (value: string) => void
  setSelector?: (value: string) => void
  submitLabel: string
  submittingLabel: string
  onSubmit: () => void
  domainLabel: string
  selectorLabel?: string
  domainPlaceholder: string
  selectorPlaceholder?: string
  loading: boolean
  children?: React.ReactNode
}) {
  return (
    <div className="space-y-5">
      <Card className="space-y-4">
        <div className={`grid gap-4 ${setSelector ? 'md:grid-cols-[1.2fr_0.8fr]' : ''}`}>
          <label className="space-y-2">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{domainLabel}</div>
            <Input value={domain} placeholder={domainPlaceholder} onChange={(e) => setDomain(e.target.value)} />
          </label>
          {setSelector ? (
            <label className="space-y-2">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{selectorLabel}</div>
              <Input value={selector} placeholder={selectorPlaceholder} onChange={(e) => setSelector(e.target.value)} />
            </label>
          ) : null}
        </div>
        <div className="flex justify-end">
          <Button onClick={onSubmit} disabled={loading || !domain.trim() || (setSelector ? !selector?.trim() : false)}>
            {loading ? submittingLabel : submitLabel}
          </Button>
        </div>
      </Card>
      {children}
    </div>
  )
}

function useDomainTool(namespace: string) {
  const { t } = useTranslation(namespace)
  const history = useQueryHistory<any>(namespace)
  return { t, history }
}

function DomainSpfInner() {
  const { t, history } = useDomainTool('toolDomainSpf')
  const notes = t('notes', { returnObjects: true }) as string[]
  const [domain, setDomain] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<GenericResult | null>(null)

  const run = async (nextDomain = domain) => {
    setLoading(true)
    try {
      const payload = await postJson('/api/domain-suite/spf', { domain: nextDomain.trim() })
      setResult(payload)
      history.saveQuery({ domain: nextDomain.trim() })
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Request failed', domain: nextDomain })
    } finally {
      setLoading(false)
    }
  }

  return (
    <DomainWorkbench icon={ShieldCheck} title={t('title')} description={t('description')}>
      <ToolTabView
        queryPanel={
          <BaseQuery
            domain={domain}
            setDomain={setDomain}
            submitLabel={t('actions.submit')}
            submittingLabel={t('actions.submitting')}
            onSubmit={() => run()}
            domainLabel={t('fields.domain')}
            domainPlaceholder={t('placeholders.domain')}
            loading={loading}
          >
            <ResultFrame
              result={result}
              t={t}
              notes={notes}
              overview={
                result?.record ? (
                  <NoticeCard
                    tone={result.hasRecord ? 'success' : 'warning'}
                    title={result.record}
                    description={`Lookup count: ${result.lookupCount ?? 0} · Terminal: ${result.allMechanism ?? 'missing'}`}
                  />
                ) : null
              }
              main={
                result?.includes?.length ? (
                  <DataTable<string>
                    rows={result.includes as string[]}
                    columns={[{ key: 'include', header: 'include', cell: (row: string) => <span className="font-mono">{row}</span> }]}
                  />
                ) : null
              }
            />
          </BaseQuery>
        }
        historyPanel={
          <HistoryPane
            t={t}
            history={history.history}
            onRestore={(record) => {
              setDomain(record.queryInfo.domain)
              run(record.queryInfo.domain)
            }}
            onDelete={history.deleteQuery}
            onClear={history.clearHistory}
          />
        }
        queryLabel={t('tabs.query')}
        historyLabel={t('tabs.history')}
      />
    </DomainWorkbench>
  )
}

function DomainDkimInner() {
  const { t, history } = useDomainTool('toolDomainDkim')
  const notes = t('notes', { returnObjects: true }) as string[]
  const [domain, setDomain] = useState('')
  const [selector, setSelector] = useState('default')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<GenericResult | null>(null)

  const run = async (nextDomain = domain, nextSelector = selector) => {
    setLoading(true)
    try {
      const payload = await postJson('/api/domain-suite/dkim', {
        domain: nextDomain.trim(),
        selector: nextSelector.trim(),
      })
      setResult(payload)
      history.saveQuery({ domain: nextDomain.trim(), selector: nextSelector.trim() })
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Request failed', domain: nextDomain, selector: nextSelector })
    } finally {
      setLoading(false)
    }
  }

  return (
    <DomainWorkbench icon={KeyRound} title={t('title')} description={t('description')}>
      <ToolTabView
        queryPanel={
          <BaseQuery
            domain={domain}
            selector={selector}
            setDomain={setDomain}
            setSelector={setSelector}
            submitLabel={t('actions.submit')}
            submittingLabel={t('actions.submitting')}
            onSubmit={() => run()}
            domainLabel={t('fields.domain')}
            selectorLabel={t('fields.selector')}
            domainPlaceholder={t('placeholders.domain')}
            selectorPlaceholder={t('placeholders.selector')}
            loading={loading}
          >
            <ResultFrame
              result={result}
              t={t}
              notes={notes}
              overview={
                result?.hasRecord !== undefined ? (
                  <PropertyGrid
                    items={[
                      { label: 'Record', value: result.hasRecord ? t('states.present') : t('states.missing'), tone: result.hasRecord ? 'success' : 'warning' },
                      { label: 'FQDN', value: result.fqdn ?? '—' },
                      { label: 'Key bits', value: result.keyStrength ? `~${result.keyStrength}` : '—' },
                    ]}
                  />
                ) : null
              }
              main={
                result?.tags ? (
                  <DataTable
                    rows={Object.entries(result.tags)}
                    columns={[
                      { key: 'tag', header: 'Tag', cell: (row) => <span className="font-mono">{row[0]}</span> },
                      { key: 'value', header: 'Value', cell: (row) => <span className="font-mono break-all">{row[1] as string}</span> },
                    ]}
                  />
                ) : null
              }
            />
          </BaseQuery>
        }
        historyPanel={<HistoryPane t={t} history={history.history} onRestore={(record) => {
          setDomain(record.queryInfo.domain)
          setSelector(record.queryInfo.selector)
          run(record.queryInfo.domain, record.queryInfo.selector)
        }} onDelete={history.deleteQuery} onClear={history.clearHistory} />}
        queryLabel={t('tabs.query')}
        historyLabel={t('tabs.history')}
      />
    </DomainWorkbench>
  )
}

function DomainDmarcInner() {
  const { t, history } = useDomainTool('toolDomainDmarc')
  const notes = t('notes', { returnObjects: true }) as string[]
  const [domain, setDomain] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<GenericResult | null>(null)

  const run = async (nextDomain = domain) => {
    setLoading(true)
    try {
      const payload = await postJson('/api/domain-suite/dmarc', { domain: nextDomain.trim() })
      setResult(payload)
      history.saveQuery({ domain: nextDomain.trim() })
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Request failed', domain: nextDomain })
    } finally {
      setLoading(false)
    }
  }

  return (
    <DomainWorkbench icon={MailCheck} title={t('title')} description={t('description')}>
      <ToolTabView
        queryPanel={
          <BaseQuery
            domain={domain}
            setDomain={setDomain}
            submitLabel={t('actions.submit')}
            submittingLabel={t('actions.submitting')}
            onSubmit={() => run()}
            domainLabel={t('fields.domain')}
            domainPlaceholder={t('placeholders.domain')}
            loading={loading}
          >
            <ResultFrame
              result={result}
              t={t}
              notes={notes}
              overview={
                result?.hasRecord !== undefined ? (
                  <PropertyGrid
                    items={[
                      { label: 'Policy', value: result.policy || '—', tone: result.policy === 'reject' ? 'success' : result.policy === 'quarantine' ? 'primary' : 'warning' },
                      { label: 'Coverage', value: `${result.pct ?? 100}%` },
                      { label: 'RUA', value: result.tags?.rua || '—' },
                      { label: 'RUF', value: result.tags?.ruf || '—' },
                    ]}
                  />
                ) : null
              }
              main={
                result?.tags ? (
                  <DataTable
                    rows={Object.entries(result.tags)}
                    columns={[
                      { key: 'tag', header: 'Tag', cell: (row) => <span className="font-mono">{row[0]}</span> },
                      { key: 'value', header: 'Value', cell: (row) => <span className="font-mono break-all">{row[1] as string}</span> },
                    ]}
                  />
                ) : null
              }
            />
          </BaseQuery>
        }
        historyPanel={<HistoryPane t={t} history={history.history} onRestore={(record) => {
          setDomain(record.queryInfo.domain)
          run(record.queryInfo.domain)
        }} onDelete={history.deleteQuery} onClear={history.clearHistory} />}
        queryLabel={t('tabs.query')}
        historyLabel={t('tabs.history')}
      />
    </DomainWorkbench>
  )
}

function DomainTtlAdviceInner() {
  const { t, history } = useDomainTool('toolDomainTtlAdvice')
  const notes = t('notes', { returnObjects: true }) as string[]
  const [domain, setDomain] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<GenericResult | null>(null)

  const run = async (nextDomain = domain) => {
    setLoading(true)
    try {
      const payload = await postJson('/api/domain-suite/ttl-advice', { domain: nextDomain.trim() })
      setResult(payload)
      history.saveQuery({ domain: nextDomain.trim() })
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Request failed', domain: nextDomain })
    } finally {
      setLoading(false)
    }
  }

  return (
    <DomainWorkbench icon={Clock3} title={t('title')} description={t('description')}>
      <ToolTabView
        queryPanel={
          <BaseQuery
            domain={domain}
            setDomain={setDomain}
            submitLabel={t('actions.submit')}
            submittingLabel={t('actions.submitting')}
            onSubmit={() => run()}
            domainLabel={t('fields.domain')}
            domainPlaceholder={t('placeholders.domain')}
            loading={loading}
          >
            <ResultFrame
              result={result}
              t={t}
              notes={notes}
              overview={
                result?.ttlSummary ? (
                  <PropertyGrid
                    items={[
                      { label: 'Min TTL', value: `${result.ttlSummary.min}s`, tone: result.ttlSummary.min < 300 ? 'warning' : 'success' },
                      { label: 'Avg TTL', value: `${result.ttlSummary.avg}s` },
                      { label: 'Max TTL', value: `${result.ttlSummary.max}s`, tone: result.ttlSummary.max > 86400 ? 'warning' : 'success' },
                    ]}
                  />
                ) : null
              }
              main={
                result?.records ? (
                  <DataTable<any>
                    rows={result.records as any[]}
                    columns={[
                      { key: 'type', header: 'Type', cell: (row: any) => row.type },
                      { key: 'value', header: 'Value', cell: (row: any) => <span className="font-mono">{row.value}</span> },
                      { key: 'ttl', header: 'TTL', cell: (row: any) => `${row.ttl}s` },
                    ]}
                  />
                ) : null
              }
            />
          </BaseQuery>
        }
        historyPanel={<HistoryPane t={t} history={history.history} onRestore={(record) => {
          setDomain(record.queryInfo.domain)
          run(record.queryInfo.domain)
        }} onDelete={history.deleteQuery} onClear={history.clearHistory} />}
        queryLabel={t('tabs.query')}
        historyLabel={t('tabs.history')}
      />
    </DomainWorkbench>
  )
}

function DomainNsCheckInner() {
  const { t, history } = useDomainTool('toolDomainNsCheck')
  const notes = t('notes', { returnObjects: true }) as string[]
  const [domain, setDomain] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<GenericResult | null>(null)

  const run = async (nextDomain = domain) => {
    setLoading(true)
    try {
      const payload = await postJson('/api/domain-suite/ns-check', { domain: nextDomain.trim() })
      setResult(payload)
      history.saveQuery({ domain: nextDomain.trim() })
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Request failed', domain: nextDomain })
    } finally {
      setLoading(false)
    }
  }

  return (
    <DomainWorkbench icon={Globe2} title={t('title')} description={t('description')}>
      <ToolTabView
        queryPanel={
          <BaseQuery
            domain={domain}
            setDomain={setDomain}
            submitLabel={t('actions.submit')}
            submittingLabel={t('actions.submitting')}
            onSubmit={() => run()}
            domainLabel={t('fields.domain')}
            domainPlaceholder={t('placeholders.domain')}
            loading={loading}
          >
            <ResultFrame
              result={result}
              t={t}
              notes={notes}
              overview={
                result?.records ? (
                  <PropertyGrid
                    items={[
                      { label: 'NS count', value: result.records.length, tone: result.records.length >= 2 ? 'success' : 'warning' },
                      { label: 'Provider roots', value: result.diversityRoots?.join(', ') || '—' },
                    ]}
                  />
                ) : null
              }
              main={
                result?.records ? (
                  <DataTable<any>
                    rows={result.records as any[]}
                    columns={[
                      { key: 'host', header: 'Host', cell: (row: any) => <span className="font-mono">{row.host}</span> },
                      { key: 'ipv4', header: 'IPv4', cell: (row: any) => row.ipv4.join(', ') || '—' },
                      { key: 'ipv6', header: 'IPv6', cell: (row: any) => row.ipv6.join(', ') || '—' },
                      { key: 'reachable', header: 'Reachable', cell: (row: any) => (row.reachable ? t('states.yes') : t('states.no')) },
                    ]}
                  />
                ) : null
              }
            />
          </BaseQuery>
        }
        historyPanel={<HistoryPane t={t} history={history.history} onRestore={(record) => {
          setDomain(record.queryInfo.domain)
          run(record.queryInfo.domain)
        }} onDelete={history.deleteQuery} onClear={history.clearHistory} />}
        queryLabel={t('tabs.query')}
        historyLabel={t('tabs.history')}
      />
    </DomainWorkbench>
  )
}

function DomainSubdomainScanInner() {
  const { t, history } = useDomainTool('toolDomainSubdomainScan')
  const notes = t('notes', { returnObjects: true }) as string[]
  const [domain, setDomain] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<GenericResult | null>(null)

  const run = async (nextDomain = domain) => {
    setLoading(true)
    try {
      const payload = await postJson('/api/domain-suite/subdomain-scan', { domain: nextDomain.trim() })
      setResult(payload)
      history.saveQuery({ domain: nextDomain.trim() })
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Request failed', domain: nextDomain })
    } finally {
      setLoading(false)
    }
  }

  return (
    <DomainWorkbench icon={ScanSearch} title={t('title')} description={t('description')}>
      <ToolTabView
        queryPanel={
          <BaseQuery
            domain={domain}
            setDomain={setDomain}
            submitLabel={t('actions.submit')}
            submittingLabel={t('actions.submitting')}
            onSubmit={() => run()}
            domainLabel={t('fields.domain')}
            domainPlaceholder={t('placeholders.domain')}
            loading={loading}
          >
            <ResultFrame
              result={result}
              t={t}
              notes={notes}
              overview={
                result ? (
                  <PropertyGrid
                    items={[
                      { label: 'Scanned labels', value: result.scannedCount ?? '—' },
                      { label: 'Found', value: result.found?.length ?? 0, tone: (result.found?.length ?? 0) > 0 ? 'primary' : 'success' },
                      { label: 'Wildcard', value: result.wildcardSuspected ? t('states.detected') : t('states.clear'), tone: result.wildcardSuspected ? 'warning' : 'success' },
                    ]}
                  />
                ) : null
              }
              main={
                result?.found ? (
                  <DataTable<any>
                    rows={result.found as any[]}
                    emptyText="No subdomains found"
                    columns={[
                      { key: 'label', header: 'Label', cell: (row: any) => row.label },
                      { key: 'hostname', header: 'Hostname', cell: (row: any) => <span className="font-mono">{row.hostname}</span> },
                      { key: 'types', header: 'Types', cell: (row: any) => row.types.join(', ') },
                      { key: 'values', header: 'Values', cell: (row: any) => <span className="font-mono break-all">{row.values.join(', ')}</span> },
                    ]}
                  />
                ) : null
              }
            />
          </BaseQuery>
        }
        historyPanel={<HistoryPane t={t} history={history.history} onRestore={(record) => {
          setDomain(record.queryInfo.domain)
          run(record.queryInfo.domain)
        }} onDelete={history.deleteQuery} onClear={history.clearHistory} />}
        queryLabel={t('tabs.query')}
        historyLabel={t('tabs.history')}
      />
    </DomainWorkbench>
  )
}

function DomainWildcardInner() {
  const { t, history } = useDomainTool('toolDomainWildcard')
  const notes = t('notes', { returnObjects: true }) as string[]
  const [domain, setDomain] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<GenericResult | null>(null)

  const run = async (nextDomain = domain) => {
    setLoading(true)
    try {
      const payload = await postJson('/api/domain-suite/wildcard', { domain: nextDomain.trim() })
      setResult(payload)
      history.saveQuery({ domain: nextDomain.trim() })
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Request failed', domain: nextDomain })
    } finally {
      setLoading(false)
    }
  }

  return (
    <DomainWorkbench icon={ShieldEllipsis} title={t('title')} description={t('description')}>
      <ToolTabView
        queryPanel={
          <BaseQuery
            domain={domain}
            setDomain={setDomain}
            submitLabel={t('actions.submit')}
            submittingLabel={t('actions.submitting')}
            onSubmit={() => run()}
            domainLabel={t('fields.domain')}
            domainPlaceholder={t('placeholders.domain')}
            loading={loading}
          >
            <ResultFrame
              result={result}
              t={t}
              notes={notes}
              overview={
                result ? (
                  <PropertyGrid
                    items={[
                      { label: 'Wildcard', value: result.detected ? t('states.detected') : t('states.clear'), tone: result.detected ? 'warning' : 'success' },
                      { label: 'Signature', value: result.signature ?? '—' },
                    ]}
                  />
                ) : null
              }
              main={
                result?.probes ? (
                  <DataTable<any>
                    rows={result.probes as any[]}
                    columns={[
                      { key: 'hostname', header: 'Probe', cell: (row: any) => <span className="font-mono">{row.hostname}</span> },
                      { key: 'resolved', header: 'Resolved', cell: (row: any) => (row.resolved ? t('states.yes') : t('states.no')) },
                      { key: 'values', header: 'Values', cell: (row: any) => <span className="font-mono break-all">{row.values.join(', ') || '—'}</span> },
                    ]}
                  />
                ) : null
              }
            />
          </BaseQuery>
        }
        historyPanel={<HistoryPane t={t} history={history.history} onRestore={(record) => {
          setDomain(record.queryInfo.domain)
          run(record.queryInfo.domain)
        }} onDelete={history.deleteQuery} onClear={history.clearHistory} />}
        queryLabel={t('tabs.query')}
        historyLabel={t('tabs.history')}
      />
    </DomainWorkbench>
  )
}

function DomainHealthScoreInner() {
  const { t, history } = useDomainTool('toolDomainHealthScore')
  const notes = t('notes', { returnObjects: true }) as string[]
  const [domain, setDomain] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<GenericResult | null>(null)

  const chartRows = useMemo(() => result?.dimensions ?? [], [result])

  const run = async (nextDomain = domain) => {
    setLoading(true)
    try {
      const payload = await postJson('/api/domain-suite/health', { domain: nextDomain.trim() })
      setResult(payload)
      history.saveQuery({ domain: nextDomain.trim() })
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Request failed', domain: nextDomain })
    } finally {
      setLoading(false)
    }
  }

  return (
    <DomainWorkbench icon={Activity} title={t('title')} description={t('description')}>
      <ToolTabView
        queryPanel={
          <BaseQuery
            domain={domain}
            setDomain={setDomain}
            submitLabel={t('actions.submit')}
            submittingLabel={t('actions.submitting')}
            onSubmit={() => run()}
            domainLabel={t('fields.domain')}
            domainPlaceholder={t('placeholders.domain')}
            loading={loading}
          >
            <ResultFrame
              result={result}
              t={t}
              notes={notes}
              overview={
                chartRows.length ? (
                  <PropertyGrid
                    items={chartRows.map((item: any) => ({
                      label: item.label,
                      value: `${item.score}/100`,
                      tone: item.score >= 80 ? 'success' : item.score >= 60 ? 'primary' : 'warning',
                    }))}
                  />
                ) : null
              }
              main={
                chartRows.length ? (
                  <DataTable<any>
                    rows={chartRows as any[]}
                    columns={[
                      { key: 'label', header: 'Dimension', cell: (row: any) => row.label },
                      { key: 'score', header: 'Score', cell: (row: any) => row.score },
                      { key: 'summary', header: 'Summary', cell: (row: any) => row.summary },
                    ]}
                  />
                ) : null
              }
            />
          </BaseQuery>
        }
        historyPanel={<HistoryPane t={t} history={history.history} onRestore={(record) => {
          setDomain(record.queryInfo.domain)
          run(record.queryInfo.domain)
        }} onDelete={history.deleteQuery} onClear={history.clearHistory} />}
        queryLabel={t('tabs.query')}
        historyLabel={t('tabs.history')}
      />
    </DomainWorkbench>
  )
}

export const DomainSpf = React.memo(DomainSpfInner)
export const DomainDkim = React.memo(DomainDkimInner)
export const DomainDmarc = React.memo(DomainDmarcInner)
export const DomainTtlAdvice = React.memo(DomainTtlAdviceInner)
export const DomainNsCheck = React.memo(DomainNsCheckInner)
export const DomainSubdomainScan = React.memo(DomainSubdomainScanInner)
export const DomainWildcard = React.memo(DomainWildcardInner)
export const DomainHealthScore = React.memo(DomainHealthScoreInner)

export default DomainSpf
