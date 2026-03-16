import React, { useMemo, useState } from 'react'
import { Download, Network, Plus, Save, SplitSquareVertical } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  Button,
  Card,
  DataTable,
  Input,
  MetricCard,
  ToolTabView,
  QueryHistory,
  useQueryHistory,
} from '@toolbox/ui-kit'
import IpamWorkbench from './shared/IpamWorkbench'
import { getMinimalPrefixForHosts, planSubnets } from './shared/ipMath'
import { useIpamInventoryStore } from './shared/useIpamInventoryStore'
import type { PlanRequest } from './shared/types'

const I18N_NAMESPACE = 'toolIpamPlan'

const createRequest = (): PlanRequest => ({
  id: crypto.randomUUID(),
  name: '',
  hosts: 32,
})

const IpamPlan: React.FC = () => {
  const { t } = useTranslation(I18N_NAMESPACE)
  const inventory = useIpamInventoryStore()
  const history = useQueryHistory<{ baseCidr: string; requests: PlanRequest[] }>('ipam-plan')
  const [baseCidr, setBaseCidr] = useState('10.0.0.0/24')
  const [site, setSite] = useState('DC-1')
  const [requests, setRequests] = useState<PlanRequest[]>([
    { id: crypto.randomUUID(), name: 'prod-app', hosts: 60 },
    { id: crypto.randomUUID(), name: 'prod-db', hosts: 28 },
    { id: crypto.randomUUID(), name: 'monitoring', hosts: 12 },
  ])
  const [savedCount, setSavedCount] = useState(0)

  const analysis = useMemo(() => {
    try {
      return {
        result: planSubnets(baseCidr, requests),
        error: '',
      }
    } catch (nextError) {
      return {
        result: null,
        error: nextError instanceof Error ? nextError.message : t('errors.invalidBase'),
      }
    }
  }, [baseCidr, requests, t])
  const { result, error } = analysis

  const validRequests = requests.filter((item) => item.name.trim() && item.hosts > 0)

  const saveHistory = () => {
    history.saveQuery({ baseCidr, requests: validRequests })
  }

  const saveToInventory = () => {
    if (!result || result.allocations.length === 0) return
    inventory.importPools(
      result.allocations.map((item) => ({
        name: item.name,
        cidr: item.cidr,
        site,
        purpose: t('inventoryPurpose'),
        status: 'planned',
        allocated: 0,
        reserved: 0,
        notes: `${baseCidr} / ${t('generatedByPlanner')}`,
      }))
    )
    setSavedCount(result.allocations.length)
  }

  return (
    <IpamWorkbench title={t('title')} description={t('description')}>
      <ToolTabView
        queryLabel={t('tabs.query')}
        historyLabel={t('tabs.history')}
        queryPanel={
          <div className="space-y-6">
            <Card>
              <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('form.baseCidr')}</label>
                  <Input value={baseCidr} onChange={(event) => setBaseCidr(event.target.value)} placeholder="10.0.0.0/24" size="lg" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('form.site')}</label>
                  <Input value={site} onChange={(event) => setSite(event.target.value)} placeholder="DC-1" size="lg" />
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <Button type="button" onClick={() => setRequests((prev) => [...prev, createRequest()])}>
                  <Plus className="mr-2 h-4 w-4" />
                  {t('form.addSegment')}
                </Button>
                <Button type="button" variant="secondary" onClick={saveHistory}>
                  <Download className="mr-2 h-4 w-4" />
                  {t('form.saveHistory')}
                </Button>
                <Button type="button" variant="secondary" onClick={saveToInventory} disabled={!result?.allocations.length}>
                  <Save className="mr-2 h-4 w-4" />
                  {t('form.saveInventory')}
                </Button>
              </div>
              {savedCount > 0 ? (
                <div className="mt-3 text-sm text-emerald-600 dark:text-emerald-400">
                  {t('messages.saved', { count: savedCount })}
                </div>
              ) : null}
              {error ? (
                <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/20 dark:text-rose-300">
                  {error}
                </div>
              ) : null}
            </Card>

            <Card>
              <div className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">{t('requests.title')}</div>
              <div className="space-y-3">
                {requests.map((item, index) => (
                  <div key={item.id} className="grid gap-3 rounded-2xl border border-gray-200 p-4 dark:border-gray-700 md:grid-cols-[1fr_180px_auto]">
                    <Input
                      value={item.name}
                      onChange={(event) =>
                        setRequests((prev) =>
                          prev.map((request) =>
                            request.id === item.id ? { ...request, name: event.target.value } : request
                          )
                        )
                      }
                      placeholder={t('requests.namePlaceholder', { index: index + 1 })}
                    />
                    <Input
                      type="number"
                      min={1}
                      value={item.hosts}
                      onChange={(event) =>
                        setRequests((prev) =>
                          prev.map((request) =>
                            request.id === item.id ? { ...request, hosts: Number(event.target.value) || 0 } : request
                          )
                        )
                      }
                    />
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        /{getMinimalPrefixForHosts(Math.max(item.hosts, 1))}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setRequests((prev) => prev.filter((request) => request.id !== item.id))}
                        disabled={requests.length === 1}
                      >
                        {t('requests.remove')}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {result ? (
              <>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <MetricCard title={t('stats.base')} value={result.base.cidr} hint={result.base.mask} icon={Network} />
                  <MetricCard title={t('stats.segments')} value={result.allocations.length} hint={t('stats.segmentsHint')} icon={SplitSquareVertical} />
                  <MetricCard title={t('stats.used')} value={result.usedAddresses} hint={t('stats.usedHint')} />
                  <MetricCard title={t('stats.remaining')} value={result.remainingAddresses} hint={t('stats.remainingHint')} />
                </div>
                <Card>
                  <div className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">{t('results.title')}</div>
                  <DataTable
                    rows={result.allocations}
                    emptyText={t('results.empty')}
                    rowKey={(row) => row.requestId}
                    columns={[
                      { key: 'name', header: t('results.columns.name'), cell: (row) => row.name },
                      { key: 'cidr', header: t('results.columns.cidr'), cell: (row) => row.cidr },
                      { key: 'hosts', header: t('results.columns.hosts'), cell: (row) => `${row.requestedHosts} / ${row.capacity}` },
                      { key: 'range', header: t('results.columns.range'), cell: (row) => `${row.firstUsable} - ${row.lastUsable}` },
                    ]}
                  />
                </Card>
                {result.unallocated.length ? (
                  <Card>
                    <div className="mb-4 text-lg font-semibold text-amber-700 dark:text-amber-300">{t('results.unallocatedTitle')}</div>
                    <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                      {result.unallocated.map((item) => (
                        <div key={item.id} className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900 dark:bg-amber-950/20">
                          {item.name} · {item.hosts} {t('requests.hosts')}
                        </div>
                      ))}
                    </div>
                  </Card>
                ) : null}
              </>
            ) : null}
          </div>
        }
        historyPanel={
          <QueryHistory
            history={history.history}
            title={t('history.title')}
            emptyMessage={t('history.empty')}
            onDelete={history.deleteQuery}
            onClear={history.clearHistory}
            onRestore={(record) => {
              setBaseCidr(record.queryInfo.baseCidr)
              setRequests(record.queryInfo.requests)
            }}
            renderItem={(queryInfo) => (
              <div className="flex flex-col">
                <span>{queryInfo.baseCidr}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{queryInfo.requests.length} {t('history.items')}</span>
              </div>
            )}
          />
        }
      />
    </IpamWorkbench>
  )
}

export default IpamPlan
