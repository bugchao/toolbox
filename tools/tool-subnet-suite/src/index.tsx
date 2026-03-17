import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Binary,
  Cable,
  ChartColumnBig,
  GitBranchPlus,
  Map,
  Network,
  Ruler,
  Workflow,
  Waypoints,
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
import SubnetWorkbench from './shared/SubnetWorkbench'
import {
  buildPlannerReport,
  divideSubnet,
  maskToPrefix,
  parseCidr,
  parseIpv6Cidr,
  planSubnets,
  prefixToMask,
  summarizeCapacity,
} from './shared/subnetMath'

type Result = Record<string, any>

function ResultPanel({ result, t, notes, overview, details }: { result: Result | null; t: (key: string) => string; notes: string[]; overview?: React.ReactNode; details?: React.ReactNode }) {
  if (!result) {
    return <Card><div className="py-10 text-center text-sm text-gray-500 dark:text-gray-400">{t('result.empty')}</div></Card>
  }
  if (result.error) return <NoticeCard tone="danger" title={result.error} />
  return (
    <Card className="space-y-6">
      <PropertyGrid items={[...(result.cidr ? [{ label: 'CIDR', value: result.cidr, tone: 'primary' as const }] : []), ...(result.timestamp ? [{ label: t('result.updated'), value: new Date(result.timestamp).toLocaleString() }] : [])]} />
      {overview}
      {details}
      <div className="space-y-3">
        <div className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">{t('result.notes')}</div>
        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          {notes.map((item) => <li key={item} className="rounded-xl bg-gray-50 px-3 py-2 dark:bg-gray-900/50">{item}</li>)}
        </ul>
      </div>
    </Card>
  )
}

function HistoryPane({ title, history, onRestore, onDelete, onClear }: { title: string; history: QueryHistoryRecord<any>[]; onRestore: (record: QueryHistoryRecord<any>) => void; onDelete: (id: string) => void; onClear: () => void }) {
  return (
    <QueryHistory
      history={history}
      onRestore={onRestore}
      onDelete={onDelete}
      onClear={onClear}
      title={title}
      emptyMessage="No saved calculations"
      renderItem={(queryInfo) => queryInfo.cidr || queryInfo.value || queryInfo.label || 'Calculation'}
    />
  )
}

function QueryShell({ title, description, icon, queryPanel, historyPanel, queryLabel, historyLabel }: { title: string; description: string; icon: any; queryPanel: React.ReactNode; historyPanel: React.ReactNode; queryLabel: string; historyLabel: string }) {
  return (
    <SubnetWorkbench title={title} description={description} icon={icon}>
      <ToolTabView queryPanel={queryPanel} historyPanel={historyPanel} queryLabel={queryLabel} historyLabel={historyLabel} />
    </SubnetWorkbench>
  )
}

function ipv4Form({ label, value, onChange, placeholder, onSubmit, submitText }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; onSubmit: () => void; submitText: string }) {
  return (
    <Card className="space-y-4">
      <label className="space-y-2">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</div>
        <Input value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      </label>
      <div className="flex justify-end">
        <Button onClick={onSubmit} disabled={!value.trim()}>{submitText}</Button>
      </div>
    </Card>
  )
}

function parseRequests(text: string) {
  return text
    .split('\n')
    .map((line, index) => {
      const [name, hosts] = line.split(',').map((item) => item.trim())
      return { id: `${index}`, name, hosts: Number(hosts) }
    })
    .filter((item) => item.name && Number.isFinite(item.hosts) && item.hosts > 0)
}

function CidrCalculatorInner() {
  const { t } = useTranslation('toolCidrCalculator')
  const notes = t('notes', { returnObjects: true }) as string[]
  const history = useQueryHistory<any>('toolCidrCalculator')
  const [cidr, setCidr] = useState('')
  const [result, setResult] = useState<Result | null>(null)
  const run = (value = cidr) => {
    try {
      const payload = { ...parseCidr(value.trim()), timestamp: new Date().toISOString() }
      setResult(payload)
      history.saveQuery({ cidr: value.trim() })
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Failed' })
    }
  }
  return <QueryShell title={t('title')} description={t('description')} icon={ChartColumnBig} queryLabel={t('tabs.query')} historyLabel={t('tabs.history')}
    queryPanel={<div className="space-y-5">{ipv4Form({ label: t('fields.cidr'), value: cidr, onChange: setCidr, placeholder: t('placeholders.cidr'), onSubmit: () => run(), submitText: t('actions.submit') })}
      <ResultPanel result={result} t={t} notes={notes} overview={result && !result.error ? <PropertyGrid items={[
        { label: 'Mask', value: result.mask, tone: 'primary' },
        { label: 'Network', value: result.network },
        { label: 'Broadcast', value: result.broadcast },
        { label: 'Usable', value: result.usable },
      ]} /> : null} /></div>}
    historyPanel={<HistoryPane title={t('history.title')} history={history.history} onRestore={(record) => { setCidr(record.queryInfo.cidr); run(record.queryInfo.cidr) }} onDelete={history.deleteQuery} onClear={history.clearHistory} />} />
}

function SubnetDivideInner() {
  const { t } = useTranslation('toolSubnetDivide')
  const notes = t('notes', { returnObjects: true }) as string[]
  const history = useQueryHistory<any>('toolSubnetDivide')
  const [cidr, setCidr] = useState('')
  const [count, setCount] = useState('4')
  const [result, setResult] = useState<Result | null>(null)
  const run = (nextCidr = cidr, nextCount = count) => {
    try {
      const subnets = divideSubnet(nextCidr.trim(), Number(nextCount))
      setResult({ cidr: nextCidr.trim(), count: Number(nextCount), timestamp: new Date().toISOString(), subnets })
      history.saveQuery({ cidr: nextCidr.trim(), count: nextCount })
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Failed' })
    }
  }
  return <QueryShell title={t('title')} description={t('description')} icon={GitBranchPlus} queryLabel={t('tabs.query')} historyLabel={t('tabs.history')}
    queryPanel={<div className="space-y-5"><Card className="grid gap-4 md:grid-cols-2">
      <label className="space-y-2"><div className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('fields.cidr')}</div><Input value={cidr} placeholder={t('placeholders.cidr')} onChange={(e) => setCidr(e.target.value)} /></label>
      <label className="space-y-2"><div className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('fields.count')}</div><Input value={count} placeholder={t('placeholders.count')} onChange={(e) => setCount(e.target.value)} /></label>
      <div className="md:col-span-2 flex justify-end"><Button onClick={() => run()} disabled={!cidr.trim() || !count.trim()}>{t('actions.submit')}</Button></div>
    </Card>
    <ResultPanel result={result} t={t} notes={notes} overview={result?.subnets ? <PropertyGrid items={[
      { label: 'Requested', value: result.count },
      { label: 'Generated', value: result.subnets.length, tone: 'primary' },
    ]} /> : null} details={result?.subnets ? <DataTable<any> rows={result.subnets as any[]} columns={[
      { key: 'cidr', header: 'CIDR', cell: (row: any) => row.cidr },
      { key: 'network', header: 'Network', cell: (row: any) => row.network },
      { key: 'usable', header: 'Usable range', cell: (row: any) => `${row.firstUsable} - ${row.lastUsable}` },
    ]} /> : null} /></div>}
    historyPanel={<HistoryPane title={t('history.title')} history={history.history} onRestore={(record) => { setCidr(record.queryInfo.cidr); setCount(record.queryInfo.count); run(record.queryInfo.cidr, record.queryInfo.count) }} onDelete={history.deleteQuery} onClear={history.clearHistory} />} />
}

function NetworkAddrInner() {
  const { t } = useTranslation('toolSubnetNetworkAddr')
  const notes = t('notes', { returnObjects: true }) as string[]
  const history = useQueryHistory<any>('toolSubnetNetworkAddr')
  const [cidr, setCidr] = useState('')
  const [result, setResult] = useState<Result | null>(null)
  const run = (value = cidr) => {
    try {
      const info = parseCidr(value.trim())
      setResult({ cidr: info.cidr, network: info.network, timestamp: new Date().toISOString() })
      history.saveQuery({ cidr: value.trim() })
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Failed' })
    }
  }
  return <QueryShell title={t('title')} description={t('description')} icon={Network} queryLabel={t('tabs.query')} historyLabel={t('tabs.history')}
    queryPanel={<div className="space-y-5">{ipv4Form({ label: t('fields.cidr'), value: cidr, onChange: setCidr, placeholder: t('placeholders.cidr'), onSubmit: () => run(), submitText: t('actions.submit') })}
      <ResultPanel result={result} t={t} notes={notes} overview={result?.network ? <PropertyGrid items={[{ label: 'Network', value: result.network, tone: 'primary' }]} /> : null} /></div>}
    historyPanel={<HistoryPane title={t('history.title')} history={history.history} onRestore={(record) => { setCidr(record.queryInfo.cidr); run(record.queryInfo.cidr) }} onDelete={history.deleteQuery} onClear={history.clearHistory} />} />
}

function BroadcastInner() {
  const { t } = useTranslation('toolSubnetBroadcast')
  const notes = t('notes', { returnObjects: true }) as string[]
  const history = useQueryHistory<any>('toolSubnetBroadcast')
  const [cidr, setCidr] = useState('')
  const [result, setResult] = useState<Result | null>(null)
  const run = (value = cidr) => {
    try {
      const info = parseCidr(value.trim())
      setResult({ cidr: info.cidr, broadcast: info.broadcast, timestamp: new Date().toISOString() })
      history.saveQuery({ cidr: value.trim() })
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Failed' })
    }
  }
  return <QueryShell title={t('title')} description={t('description')} icon={Network} queryLabel={t('tabs.query')} historyLabel={t('tabs.history')}
    queryPanel={<div className="space-y-5">{ipv4Form({ label: t('fields.cidr'), value: cidr, onChange: setCidr, placeholder: t('placeholders.cidr'), onSubmit: () => run(), submitText: t('actions.submit') })}
      <ResultPanel result={result} t={t} notes={notes} overview={result?.broadcast ? <PropertyGrid items={[{ label: 'Broadcast', value: result.broadcast, tone: 'primary' }]} /> : null} /></div>}
    historyPanel={<HistoryPane title={t('history.title')} history={history.history} onRestore={(record) => { setCidr(record.queryInfo.cidr); run(record.queryInfo.cidr) }} onDelete={history.deleteQuery} onClear={history.clearHistory} />} />
}

function SubnetMaskInner() {
  const { t } = useTranslation('toolSubnetMask')
  const notes = t('notes', { returnObjects: true }) as string[]
  const history = useQueryHistory<any>('toolSubnetMask')
  const [value, setValue] = useState('')
  const [result, setResult] = useState<Result | null>(null)
  const run = (input = value) => {
    try {
      const trimmed = input.trim()
      const prefix = /^\d+$/.test(trimmed) ? Number(trimmed) : maskToPrefix(trimmed)
      if (!Number.isInteger(prefix) || prefix < 0 || prefix > 32) throw new Error('Invalid prefix or mask')
      setResult({ value: trimmed, prefix, mask: prefixToMask(prefix), timestamp: new Date().toISOString() })
      history.saveQuery({ value: trimmed })
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Failed' })
    }
  }
  return <QueryShell title={t('title')} description={t('description')} icon={Ruler} queryLabel={t('tabs.query')} historyLabel={t('tabs.history')}
    queryPanel={<div className="space-y-5">{ipv4Form({ label: t('fields.prefixOrMask'), value, onChange: setValue, placeholder: t('placeholders.prefixOrMask'), onSubmit: () => run(), submitText: t('actions.submit') })}
      <ResultPanel result={result} t={t} notes={notes} overview={result?.mask ? <PropertyGrid items={[
        { label: 'Prefix', value: `/${result.prefix}`, tone: 'primary' },
        { label: 'Mask', value: result.mask },
      ]} /> : null} /></div>}
    historyPanel={<HistoryPane title={t('history.title')} history={history.history} onRestore={(record) => { setValue(record.queryInfo.value); run(record.queryInfo.value) }} onDelete={history.deleteQuery} onClear={history.clearHistory} />} />
}

function IpRangeInner() {
  const { t } = useTranslation('toolIpRange')
  const notes = t('notes', { returnObjects: true }) as string[]
  const history = useQueryHistory<any>('toolIpRange')
  const [cidr, setCidr] = useState('')
  const [result, setResult] = useState<Result | null>(null)
  const run = (value = cidr) => {
    try {
      const info = parseCidr(value.trim())
      setResult({ ...info, timestamp: new Date().toISOString() })
      history.saveQuery({ cidr: value.trim() })
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Failed' })
    }
  }
  return <QueryShell title={t('title')} description={t('description')} icon={Waypoints} queryLabel={t('tabs.query')} historyLabel={t('tabs.history')}
    queryPanel={<div className="space-y-5">{ipv4Form({ label: t('fields.cidr'), value: cidr, onChange: setCidr, placeholder: t('placeholders.cidr'), onSubmit: () => run(), submitText: t('actions.submit') })}
      <ResultPanel result={result} t={t} notes={notes} overview={result?.firstUsable ? <PropertyGrid items={[
        { label: 'First usable', value: result.firstUsable, tone: 'primary' },
        { label: 'Last usable', value: result.lastUsable },
      ]} /> : null} /></div>}
    historyPanel={<HistoryPane title={t('history.title')} history={history.history} onRestore={(record) => { setCidr(record.queryInfo.cidr); run(record.queryInfo.cidr) }} onDelete={history.deleteQuery} onClear={history.clearHistory} />} />
}

function CapacityInner() {
  const { t } = useTranslation('toolSubnetCapacity')
  const notes = t('notes', { returnObjects: true }) as string[]
  const history = useQueryHistory<any>('toolSubnetCapacity')
  const [cidr, setCidr] = useState('')
  const [result, setResult] = useState<Result | null>(null)
  const run = (value = cidr) => {
    try {
      const payload = { ...summarizeCapacity(value.trim()), timestamp: new Date().toISOString() }
      setResult(payload)
      history.saveQuery({ cidr: value.trim() })
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Failed' })
    }
  }
  return <QueryShell title={t('title')} description={t('description')} icon={Cable} queryLabel={t('tabs.query')} historyLabel={t('tabs.history')}
    queryPanel={<div className="space-y-5">{ipv4Form({ label: t('fields.cidr'), value: cidr, onChange: setCidr, placeholder: t('placeholders.cidr'), onSubmit: () => run(), submitText: t('actions.submit') })}
      <ResultPanel result={result} t={t} notes={notes} overview={result?.usable !== undefined ? <PropertyGrid items={[
        { label: 'Total', value: result.total, tone: 'primary' },
        { label: 'Usable', value: result.usable },
        { label: 'Reserved', value: result.reserved },
      ]} /> : null} /></div>}
    historyPanel={<HistoryPane title={t('history.title')} history={history.history} onRestore={(record) => { setCidr(record.queryInfo.cidr); run(record.queryInfo.cidr) }} onDelete={history.deleteQuery} onClear={history.clearHistory} />} />
}

function Ipv6CidrInner() {
  const { t } = useTranslation('toolIpv6Cidr')
  const notes = t('notes', { returnObjects: true }) as string[]
  const history = useQueryHistory<any>('toolIpv6Cidr')
  const [cidr, setCidr] = useState('')
  const [result, setResult] = useState<Result | null>(null)
  const run = (value = cidr) => {
    try {
      const payload = { ...parseIpv6Cidr(value.trim()), timestamp: new Date().toISOString() }
      setResult(payload)
      history.saveQuery({ cidr: value.trim() })
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Failed' })
    }
  }
  return <QueryShell title={t('title')} description={t('description')} icon={Binary} queryLabel={t('tabs.query')} historyLabel={t('tabs.history')}
    queryPanel={<div className="space-y-5">{ipv4Form({ label: t('fields.cidr'), value: cidr, onChange: setCidr, placeholder: '2001:db8::/48', onSubmit: () => run(), submitText: t('actions.submit') })}
      <ResultPanel result={result} t={t} notes={notes} overview={result?.sizeText ? <PropertyGrid items={[
        { label: 'Prefix', value: `/${result.prefix}`, tone: 'primary' },
        { label: 'Host bits', value: result.hostBits },
        { label: 'Capacity', value: result.sizeText },
        { label: 'Category', value: result.category },
      ]} /> : null} /></div>}
    historyPanel={<HistoryPane title={t('history.title')} history={history.history} onRestore={(record) => { setCidr(record.queryInfo.cidr); run(record.queryInfo.cidr) }} onDelete={history.deleteQuery} onClear={history.clearHistory} />} />
}

function VlsmInner() {
  const { t } = useTranslation('toolVlsm')
  const notes = t('notes', { returnObjects: true }) as string[]
  const history = useQueryHistory<any>('toolVlsm')
  const [cidr, setCidr] = useState('')
  const [requests, setRequests] = useState(t('placeholders.requests') as string)
  const [result, setResult] = useState<Result | null>(null)
  const run = (nextCidr = cidr, nextRequests = requests) => {
    try {
      const payload = planSubnets(nextCidr.trim(), parseRequests(nextRequests))
      setResult({ cidr: payload.base.cidr, timestamp: new Date().toISOString(), ...payload })
      history.saveQuery({ cidr: nextCidr.trim() })
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Failed' })
    }
  }
  return <QueryShell title={t('title')} description={t('description')} icon={Workflow} queryLabel={t('tabs.query')} historyLabel={t('tabs.history')}
    queryPanel={<div className="space-y-5"><Card className="space-y-4">
      <label className="space-y-2"><div className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('fields.cidr')}</div><Input value={cidr} placeholder={t('placeholders.cidr')} onChange={(e) => setCidr(e.target.value)} /></label>
      <label className="space-y-2"><div className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('fields.requests')}</div><textarea value={requests} onChange={(e) => setRequests(e.target.value)} className="min-h-[160px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100" /></label>
      <div className="flex justify-end"><Button onClick={() => run()} disabled={!cidr.trim()}>{t('actions.submit')}</Button></div>
    </Card>
    <ResultPanel result={result} t={t} notes={notes} overview={result?.allocations ? <PropertyGrid items={[
      { label: 'Allocated', value: result.allocations.length, tone: 'primary' },
      { label: 'Unallocated', value: result.unallocated.length, tone: result.unallocated.length ? 'warning' : 'success' },
      { label: 'Used addresses', value: result.usedAddresses },
    ]} /> : null} details={result?.allocations ? <DataTable<any> rows={result.allocations as any[]} columns={[
      { key: 'name', header: 'Name', cell: (row: any) => row.name },
      { key: 'cidr', header: 'CIDR', cell: (row: any) => row.cidr },
      { key: 'hosts', header: 'Demand / Capacity', cell: (row: any) => `${row.requestedHosts} / ${row.capacity}` },
      { key: 'range', header: 'Usable range', cell: (row: any) => `${row.firstUsable} - ${row.lastUsable}` },
    ]} /> : null} /></div>}
    historyPanel={<HistoryPane title={t('history.title')} history={history.history} onRestore={(record) => { setCidr(record.queryInfo.cidr); run(record.queryInfo.cidr, requests) }} onDelete={history.deleteQuery} onClear={history.clearHistory} />} />
}

function NetworkPlannerInner() {
  const { t } = useTranslation('toolNetworkPlanner')
  const notes = t('notes', { returnObjects: true }) as string[]
  const history = useQueryHistory<any>('toolNetworkPlanner')
  const [cidr, setCidr] = useState('')
  const [requests, setRequests] = useState(t('placeholders.requests') as string)
  const [result, setResult] = useState<Result | null>(null)
  const run = (nextCidr = cidr, nextRequests = requests) => {
    try {
      const payload = buildPlannerReport(nextCidr.trim(), parseRequests(nextRequests))
      setResult({ cidr: payload.base.cidr, timestamp: new Date().toISOString(), ...payload })
      history.saveQuery({ cidr: nextCidr.trim() })
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Failed' })
    }
  }
  return <QueryShell title={t('title')} description={t('description')} icon={Map} queryLabel={t('tabs.query')} historyLabel={t('tabs.history')}
    queryPanel={<div className="space-y-5"><Card className="space-y-4">
      <label className="space-y-2"><div className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('fields.cidr')}</div><Input value={cidr} placeholder={t('placeholders.cidr')} onChange={(e) => setCidr(e.target.value)} /></label>
      <label className="space-y-2"><div className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('fields.requests')}</div><textarea value={requests} onChange={(e) => setRequests(e.target.value)} className="min-h-[160px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100" /></label>
      <div className="flex justify-end"><Button onClick={() => run()} disabled={!cidr.trim()}>{t('actions.submit')}</Button></div>
    </Card>
    <ResultPanel result={result} t={t} notes={notes} overview={result?.report ? <NoticeCard tone="info" title="Planner summary" description={<pre className="whitespace-pre-wrap font-mono text-xs">{String(result.report)}</pre>} /> : null} details={result?.allocations ? <DataTable<any> rows={result.allocations as any[]} columns={[
      { key: 'name', header: 'Name', cell: (row: any) => row.name },
      { key: 'cidr', header: 'CIDR', cell: (row: any) => row.cidr },
      { key: 'hosts', header: 'Demand / Capacity', cell: (row: any) => `${row.requestedHosts} / ${row.capacity}` },
    ]} /> : null} /></div>}
    historyPanel={<HistoryPane title={t('history.title')} history={history.history} onRestore={(record) => { setCidr(record.queryInfo.cidr); run(record.queryInfo.cidr, requests) }} onDelete={history.deleteQuery} onClear={history.clearHistory} />} />
}

export const CidrCalculator = React.memo(CidrCalculatorInner)
export const SubnetDivide = React.memo(SubnetDivideInner)
export const SubnetNetworkAddr = React.memo(NetworkAddrInner)
export const SubnetBroadcast = React.memo(BroadcastInner)
export const SubnetMask = React.memo(SubnetMaskInner)
export const IpRange = React.memo(IpRangeInner)
export const SubnetCapacity = React.memo(CapacityInner)
export const Ipv6Cidr = React.memo(Ipv6CidrInner)
export const Vlsm = React.memo(VlsmInner)
export const NetworkPlanner = React.memo(NetworkPlannerInner)

export default CidrCalculator
