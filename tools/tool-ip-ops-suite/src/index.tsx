import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Binary,
  Cloud,
  Fingerprint,
  Globe2,
  LocateFixed,
  MapPinned,
  Network,
  ShieldBan,
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
} from '@toolbox/ui-kit'
import type { QueryHistoryRecord } from '@toolbox/ui-kit'
import IpWorkbench from './shared/IpWorkbench'
import {
  classifyIp,
  ipv4To6to4,
  ipv4ToBinary,
  ipv4ToHex,
  ipv4ToMappedIpv6,
  isIPv4,
  isIp,
} from './shared/ipUtils'

type GenericResult = Record<string, any>

function ResultCard({
  result,
  t,
  overview,
  details,
  notes,
}: {
  result: GenericResult | null
  t: (key: string) => string
  overview?: React.ReactNode
  details?: React.ReactNode
  notes: string[]
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
      <PropertyGrid
        items={[
          ...(result.ip ? [{ label: 'IP', value: result.ip, tone: 'primary' as const }] : []),
          ...(result.timestamp ? [{ label: t('result.updated'), value: new Date(result.timestamp).toLocaleString() }] : []),
        ]}
      />
      {overview}
      {details}
      <div className="space-y-3">
        <div className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">{t('result.notes')}</div>
        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          {notes.map((item) => (
            <li key={item} className="rounded-xl bg-gray-50 px-3 py-2 dark:bg-gray-900/50">
              {item}
            </li>
          ))}
        </ul>
      </div>
    </Card>
  )
}

function HistoryPane({
  title,
  history,
  onRestore,
  onDelete,
  onClear,
}: {
  title: string
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
      title={title}
      emptyMessage="No saved history"
      renderItem={(queryInfo) => queryInfo.ip || queryInfo.label || 'Latest lookup'}
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

async function getJson(path: string) {
  const response = await fetch(path)
  const data = await response.json()
  if (!response.ok) throw new Error(data.error || 'Request failed')
  return data
}

function QueryShell({
  title,
  description,
  icon,
  queryPanel,
  historyPanel,
  queryLabel,
  historyLabel,
}: {
  title: string
  description: string
  icon: any
  queryPanel: React.ReactNode
  historyPanel: React.ReactNode
  queryLabel: string
  historyLabel: string
}) {
  return (
    <IpWorkbench title={title} description={description} icon={icon}>
      <ToolTabView queryPanel={queryPanel} historyPanel={historyPanel} queryLabel={queryLabel} historyLabel={historyLabel} />
    </IpWorkbench>
  )
}

function standardForm({
  label,
  value,
  placeholder,
  onChange,
  onSubmit,
  loading,
  submitText,
}: {
  label: string
  value: string
  placeholder: string
  onChange: (value: string) => void
  onSubmit: () => void
  loading: boolean
  submitText: string
}) {
  return (
    <Card className="space-y-4">
      <label className="space-y-2">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</div>
        <Input value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      </label>
      <div className="flex justify-end">
        <Button onClick={onSubmit} disabled={loading || !value.trim()}>
          {submitText}
        </Button>
      </div>
    </Card>
  )
}

function IpGeoInner() {
  const { t } = useTranslation('toolIpGeo')
  const notes = t('notes', { returnObjects: true }) as string[]
  const history = useQueryHistory<any>('toolIpGeo')
  const [ip, setIp] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<GenericResult | null>(null)

  const run = async (nextIp = ip) => {
    setLoading(true)
    try {
      const payload = await postJson('/api/ip-ops/geo', { ip: nextIp.trim() })
      setResult(payload)
      history.saveQuery({ ip: nextIp.trim() })
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Request failed', ip: nextIp })
    } finally {
      setLoading(false)
    }
  }

  return (
    <QueryShell
      title={t('title')}
      description={t('description')}
      icon={MapPinned}
      queryLabel={t('tabs.query')}
      historyLabel={t('tabs.history')}
      queryPanel={
        <div className="space-y-5">
          {standardForm({ label: t('fields.ip'), value: ip, placeholder: t('placeholders.ip'), onChange: setIp, onSubmit: () => run(), loading, submitText: t('actions.submit') })}
          <ResultCard
            result={result}
            t={t}
            notes={notes}
            overview={result ? (
              <PropertyGrid
                items={[
                  { label: 'Classification', value: result.classification?.label || '—', tone: result.bogon ? 'warning' : 'success' },
                  { label: 'Country', value: result.country || '—' },
                  { label: 'Region', value: result.region || '—' },
                  { label: 'Timezone', value: result.timezone || '—' },
                ]}
              />
            ) : null}
            details={result?.connection ? (
              <DataTable
                rows={[
                  ['Org', result.connection.org],
                  ['ISP', result.connection.isp],
                  ['Type', result.connection.type],
                  ['City', result.city],
                  ['Coordinates', result.latitude && result.longitude ? `${result.latitude}, ${result.longitude}` : '—'],
                ]}
                columns={[
                  { key: 'field', header: 'Field', cell: (row) => row[0] },
                  { key: 'value', header: 'Value', cell: (row) => row[1] || '—' },
                ]}
              />
            ) : result?.message ? <NoticeCard tone="info" title={result.message} /> : null}
          />
        </div>
      }
      historyPanel={<HistoryPane title={t('history.title')} history={history.history} onRestore={(record) => { setIp(record.queryInfo.ip); run(record.queryInfo.ip) }} onDelete={history.deleteQuery} onClear={history.clearHistory} />}
    />
  )
}

function IpPtrInner() {
  const { t } = useTranslation('toolIpPtr')
  const notes = t('notes', { returnObjects: true }) as string[]
  const history = useQueryHistory<any>('toolIpPtr')
  const [ip, setIp] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<GenericResult | null>(null)

  const run = async (nextIp = ip) => {
    setLoading(true)
    try {
      const payload = await postJson('/api/ip-ops/ptr', { ip: nextIp.trim() })
      setResult(payload)
      history.saveQuery({ ip: nextIp.trim() })
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Request failed', ip: nextIp })
    } finally {
      setLoading(false)
    }
  }

  return (
    <QueryShell
      title={t('title')}
      description={t('description')}
      icon={Fingerprint}
      queryLabel={t('tabs.query')}
      historyLabel={t('tabs.history')}
      queryPanel={<div className="space-y-5">
        {standardForm({ label: t('fields.ip'), value: ip, placeholder: t('placeholders.ip'), onChange: setIp, onSubmit: () => run(), loading, submitText: t('actions.submit') })}
        <ResultCard result={result} t={t} notes={notes} overview={result ? <PropertyGrid items={[
          { label: 'PTR', value: result.hasPtr ? 'Present' : 'Missing', tone: result.hasPtr ? 'success' : 'warning' },
          { label: 'Count', value: result.hostnames?.length ?? 0 },
        ]} /> : null} details={result?.hostnames ? <DataTable<string> rows={result.hostnames as string[]} emptyText="No PTR records" columns={[{ key: 'host', header: 'Hostname', cell: (row: string) => <span className="font-mono">{row}</span> }]} /> : null} />
      </div>}
      historyPanel={<HistoryPane title={t('history.title')} history={history.history} onRestore={(record) => { setIp(record.queryInfo.ip); run(record.queryInfo.ip) }} onDelete={history.deleteQuery} onClear={history.clearHistory} />}
    />
  )
}

function IpV4ToV6Inner() {
  const { t } = useTranslation('toolIpV4ToV6')
  const notes = t('notes', { returnObjects: true }) as string[]
  const history = useQueryHistory<any>('toolIpV4ToV6')
  const [ip, setIp] = useState('')
  const [result, setResult] = useState<GenericResult | null>(null)

  const run = (nextIp = ip) => {
    try {
      if (!isIPv4(nextIp.trim())) throw new Error('IPv4 address required')
      const trimmed = nextIp.trim()
      const payload = {
        ip: trimmed,
        timestamp: new Date().toISOString(),
        mapped: ipv4ToMappedIpv6(trimmed),
        sixToFour: ipv4To6to4(trimmed),
      }
      setResult(payload)
      history.saveQuery({ ip: trimmed })
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Request failed', ip: nextIp })
    }
  }

  return (
    <QueryShell title={t('title')} description={t('description')} icon={Network} queryLabel={t('tabs.query')} historyLabel={t('tabs.history')}
      queryPanel={<div className="space-y-5">
        {standardForm({ label: t('fields.ip'), value: ip, placeholder: t('placeholders.ip'), onChange: setIp, onSubmit: () => run(), loading: false, submitText: t('actions.submit') })}
        <ResultCard result={result} t={t} notes={notes} overview={result ? <PropertyGrid items={[
          { label: 'IPv4-mapped', value: result.mapped || '—', tone: 'primary' },
          { label: '6to4', value: result.sixToFour || '—' },
        ]} /> : null} />
      </div>}
      historyPanel={<HistoryPane title={t('history.title')} history={history.history} onRestore={(record) => { setIp(record.queryInfo.ip); run(record.queryInfo.ip) }} onDelete={history.deleteQuery} onClear={history.clearHistory} />}
    />
  )
}

function IpBinaryHexInner() {
  const { t } = useTranslation('toolIpBinaryHex')
  const notes = t('notes', { returnObjects: true }) as string[]
  const history = useQueryHistory<any>('toolIpBinaryHex')
  const [ip, setIp] = useState('')
  const [result, setResult] = useState<GenericResult | null>(null)

  const run = (nextIp = ip) => {
    try {
      if (!isIPv4(nextIp.trim())) throw new Error('IPv4 address required')
      const trimmed = nextIp.trim()
      setResult({
        ip: trimmed,
        timestamp: new Date().toISOString(),
        binary: ipv4ToBinary(trimmed),
        hex: ipv4ToHex(trimmed),
      })
      history.saveQuery({ ip: trimmed })
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Request failed', ip: nextIp })
    }
  }

  return (
    <QueryShell title={t('title')} description={t('description')} icon={Binary} queryLabel={t('tabs.query')} historyLabel={t('tabs.history')}
      queryPanel={<div className="space-y-5">
        {standardForm({ label: t('fields.ip'), value: ip, placeholder: t('placeholders.ip'), onChange: setIp, onSubmit: () => run(), loading: false, submitText: t('actions.submit') })}
        <ResultCard result={result} t={t} notes={notes} overview={result ? <PropertyGrid items={[
          { label: 'Binary', value: result.binary || '—', tone: 'primary' },
          { label: 'Hex', value: result.hex || '—' },
        ]} /> : null} />
      </div>}
      historyPanel={<HistoryPane title={t('history.title')} history={history.history} onRestore={(record) => { setIp(record.queryInfo.ip); run(record.queryInfo.ip) }} onDelete={history.deleteQuery} onClear={history.clearHistory} />}
    />
  )
}

function IpClassInner() {
  const { t } = useTranslation('toolIpClass')
  const notes = t('notes', { returnObjects: true }) as string[]
  const history = useQueryHistory<any>('toolIpClass')
  const [ip, setIp] = useState('')
  const [result, setResult] = useState<GenericResult | null>(null)

  const run = (nextIp = ip) => {
    try {
      if (!isIp(nextIp.trim())) throw new Error('Valid IPv4 or IPv6 address required')
      const trimmed = nextIp.trim()
      setResult({ ip: trimmed, timestamp: new Date().toISOString(), classification: classifyIp(trimmed) })
      history.saveQuery({ ip: trimmed })
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Request failed', ip: nextIp })
    }
  }

  return (
    <QueryShell title={t('title')} description={t('description')} icon={LocateFixed} queryLabel={t('tabs.query')} historyLabel={t('tabs.history')}
      queryPanel={<div className="space-y-5">
        {standardForm({ label: t('fields.ip'), value: ip, placeholder: t('placeholders.ip'), onChange: setIp, onSubmit: () => run(), loading: false, submitText: t('actions.submit') })}
        <ResultCard result={result} t={t} notes={notes} overview={result?.classification ? <PropertyGrid items={[
          { label: 'Version', value: result.classification.version, tone: 'primary' },
          { label: 'Scope', value: result.classification.scope },
          { label: 'Classful', value: result.classification.classful },
        ]} /> : null} />
      </div>}
      historyPanel={<HistoryPane title={t('history.title')} history={history.history} onRestore={(record) => { setIp(record.queryInfo.ip); run(record.queryInfo.ip) }} onDelete={history.deleteQuery} onClear={history.clearHistory} />}
    />
  )
}

function IpPublicInner() {
  const { t } = useTranslation('toolIpPublic')
  const notes = t('notes', { returnObjects: true }) as string[]
  const history = useQueryHistory<any>('toolIpPublic')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<GenericResult | null>(null)

  const run = async () => {
    setLoading(true)
    try {
      const payload = await getJson('/api/ip-ops/public')
      setResult(payload)
      history.saveQuery({ label: payload.ip })
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Request failed' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <QueryShell title={t('title')} description={t('description')} icon={Cloud} queryLabel={t('tabs.query')} historyLabel={t('tabs.history')}
      queryPanel={<div className="space-y-5">
        <Card className="flex justify-end">
          <Button onClick={run} disabled={loading}>{loading ? t('actions.submitting') : t('actions.detect')}</Button>
        </Card>
        <ResultCard result={result} t={t} notes={notes} overview={result?.ip ? <PropertyGrid items={[
          { label: 'Public IP', value: result.ip, tone: 'primary' },
          { label: 'Classification', value: result.classification?.label || '—' },
        ]} /> : null} />
      </div>}
      historyPanel={<HistoryPane title={t('history.title')} history={history.history} onRestore={() => { void run() }} onDelete={history.deleteQuery} onClear={history.clearHistory} />}
    />
  )
}

function IpCdnCheckInner() {
  const { t } = useTranslation('toolIpCdnCheck')
  const notes = t('notes', { returnObjects: true }) as string[]
  const history = useQueryHistory<any>('toolIpCdnCheck')
  const [ip, setIp] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<GenericResult | null>(null)

  const run = async (nextIp = ip) => {
    setLoading(true)
    try {
      const payload = await postJson('/api/ip-ops/cdn', { ip: nextIp.trim() })
      setResult(payload)
      history.saveQuery({ ip: nextIp.trim() })
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Request failed', ip: nextIp })
    } finally {
      setLoading(false)
    }
  }

  return (
    <QueryShell title={t('title')} description={t('description')} icon={Globe2} queryLabel={t('tabs.query')} historyLabel={t('tabs.history')}
      queryPanel={<div className="space-y-5">
        {standardForm({ label: t('fields.ip'), value: ip, placeholder: t('placeholders.ip'), onChange: setIp, onSubmit: () => run(), loading, submitText: t('actions.submit') })}
        <ResultCard result={result} t={t} notes={notes} overview={result ? <PropertyGrid items={[
          { label: 'Detected', value: result.detected ? 'Yes' : 'No', tone: result.detected ? 'warning' : 'success' },
          { label: 'Confidence', value: `${result.confidence ?? 0}%` },
          { label: 'Org', value: result.org || '—' },
          { label: 'ISP', value: result.isp || '—' },
        ]} /> : null} details={result?.matches ? <DataTable rows={result.matches.map((match: string) => [match])} emptyText="No CDN signatures matched" columns={[{ key: 'match', header: 'Matched signal', cell: (row) => row[0] }]} /> : null} />
      </div>}
      historyPanel={<HistoryPane title={t('history.title')} history={history.history} onRestore={(record) => { setIp(record.queryInfo.ip); run(record.queryInfo.ip) }} onDelete={history.deleteQuery} onClear={history.clearHistory} />}
    />
  )
}

function IpBlacklistInner() {
  const { t } = useTranslation('toolIpBlacklist')
  const notes = t('notes', { returnObjects: true }) as string[]
  const history = useQueryHistory<any>('toolIpBlacklist')
  const [ip, setIp] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<GenericResult | null>(null)

  const run = async (nextIp = ip) => {
    setLoading(true)
    try {
      const payload = await postJson('/api/ip-ops/blacklist', { ip: nextIp.trim() })
      setResult(payload)
      history.saveQuery({ ip: nextIp.trim() })
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Request failed', ip: nextIp })
    } finally {
      setLoading(false)
    }
  }

  return (
    <QueryShell title={t('title')} description={t('description')} icon={ShieldBan} queryLabel={t('tabs.query')} historyLabel={t('tabs.history')}
      queryPanel={<div className="space-y-5">
        {standardForm({ label: t('fields.ip'), value: ip, placeholder: t('placeholders.ip'), onChange: setIp, onSubmit: () => run(), loading, submitText: t('actions.submit') })}
        <ResultCard result={result} t={t} notes={notes} overview={result ? <PropertyGrid items={[
          { label: 'IPv4 supported', value: result.supported === false ? 'No' : 'Yes', tone: result.supported === false ? 'warning' : 'success' },
          { label: 'Listed', value: result.listed?.length ?? 0, tone: (result.listed?.length ?? 0) > 0 ? 'danger' : 'success' },
        ]} /> : null} details={result?.checks ? <DataTable<any> rows={result.checks as any[]} columns={[
          { key: 'provider', header: 'Provider', cell: (row: any) => row.provider },
          { key: 'listed', header: 'Listed', cell: (row: any) => row.listed ? 'Yes' : 'No' },
          { key: 'answers', header: 'Answers', cell: (row: any) => row.answers.join(', ') || '—' },
        ]} /> : result?.message ? <NoticeCard tone="info" title={result.message} /> : null} />
      </div>}
      historyPanel={<HistoryPane title={t('history.title')} history={history.history} onRestore={(record) => { setIp(record.queryInfo.ip); run(record.queryInfo.ip) }} onDelete={history.deleteQuery} onClear={history.clearHistory} />}
    />
  )
}

export const IpGeo = React.memo(IpGeoInner)
export const IpPtr = React.memo(IpPtrInner)
export const IpV4ToV6 = React.memo(IpV4ToV6Inner)
export const IpBinaryHex = React.memo(IpBinaryHexInner)
export const IpClass = React.memo(IpClassInner)
export const IpPublic = React.memo(IpPublicInner)
export const IpCdnCheck = React.memo(IpCdnCheckInner)
export const IpBlacklist = React.memo(IpBlacklistInner)

export default IpGeo
