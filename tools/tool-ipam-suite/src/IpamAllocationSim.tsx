import React, { useMemo, useState } from 'react'
import { PlayCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  Button,
  Card,
  DataTable,
  Input,
  MetricCard,
  QueryHistory,
  ToolTabView,
  useQueryHistory,
} from '@toolbox/ui-kit'
import IpamWorkbench from './shared/IpamWorkbench'
import { simulateAllocation } from './shared/ipMath'
import { useIpamInventoryStore } from './shared/useIpamInventoryStore'

const I18N_NAMESPACE = 'toolIpamAllocationSim'

const IpamAllocationSim: React.FC = () => {
  const { t } = useTranslation(I18N_NAMESPACE)
  const inventory = useIpamInventoryStore()
  const history = useQueryHistory<{ cidr: string; requested: number; reserved: string }>('ipam-allocation-sim')
  const [cidr, setCidr] = useState('10.0.20.0/28')
  const [requested, setRequested] = useState(8)
  const [reserved, setReserved] = useState('10.0.20.1\n10.0.20.2')

  const simulation = useMemo(() => {
    try {
      return {
        data: simulateAllocation(
          cidr,
          requested,
          reserved.split('\n').map((item) => item.trim()).filter(Boolean)
        ),
        error: '',
      }
    } catch (nextError) {
      return {
        data: null,
        error: nextError instanceof Error ? nextError.message : t('errors.invalid'),
      }
    }
  }, [cidr, requested, reserved, t])
  const error = simulation.error

  return (
    <IpamWorkbench title={t('title')} description={t('description')}>
      <ToolTabView
        queryLabel={t('tabs.query')}
        historyLabel={t('tabs.history')}
        queryPanel={
          <div className="space-y-6">
            <Card>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('form.cidr')}</label>
                  <Input value={cidr} onChange={(event) => setCidr(event.target.value)} />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('form.requested')}</label>
                  <Input type="number" min={1} value={requested} onChange={(event) => setRequested(Number(event.target.value) || 0)} />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('form.inventoryPool')}</label>
                  <select
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                    value=""
                    onChange={(event) => {
                      const selected = inventory.items.find((item) => item.id === event.target.value)
                      if (selected) setCidr(selected.cidr)
                    }}
                  >
                    <option value="">{t('form.manual')}</option>
                    {inventory.items.map((item) => (
                      <option key={item.id} value={item.id}>{item.name} · {item.cidr}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-4">
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('form.reserved')}</label>
                <textarea
                  className="min-h-[140px] w-full rounded-2xl border border-gray-300 bg-white px-4 py-4 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                  value={reserved}
                  onChange={(event) => setReserved(event.target.value)}
                />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button type="button" variant="secondary" onClick={() => history.saveQuery({ cidr, requested, reserved })}>
                  <PlayCircle className="mr-2 h-4 w-4" />
                  {t('form.saveHistory')}
                </Button>
              </div>
              {error ? <div className="mt-3 text-sm text-rose-600 dark:text-rose-400">{error}</div> : null}
            </Card>

            {simulation.data ? (
              <>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <MetricCard title={t('stats.pool')} value={simulation.data.info.cidr} hint={simulation.data.info.firstUsable} />
                  <MetricCard title={t('stats.available')} value={simulation.data.result.availableCount} hint={t('stats.availableHint')} />
                  <MetricCard title={t('stats.allocated')} value={simulation.data.result.allocations.length} hint={t('stats.allocatedHint')} />
                  <MetricCard title={t('stats.next')} value={simulation.data.result.nextAvailable || '—'} hint={simulation.data.result.exhausted ? t('stats.exhausted') : t('stats.nextHint')} />
                </div>
                <Card>
                  <div className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">{t('results.allocations')}</div>
                  <DataTable
                    rows={simulation.data.result.allocations.map((ip, index) => ({ index: index + 1, ip }))}
                    emptyText={t('results.empty')}
                    columns={[
                      { key: 'index', header: '#', cell: (row) => row.index },
                      { key: 'ip', header: t('results.ip'), cell: (row) => row.ip },
                    ]}
                  />
                </Card>
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
              setCidr(record.queryInfo.cidr)
              setRequested(record.queryInfo.requested)
              setReserved(record.queryInfo.reserved)
            }}
            renderItem={(queryInfo) => (
              <div className="flex flex-col">
                <span>{queryInfo.cidr}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{queryInfo.requested} {t('history.addresses')}</span>
              </div>
            )}
          />
        }
      />
    </IpamWorkbench>
  )
}

export default IpamAllocationSim
