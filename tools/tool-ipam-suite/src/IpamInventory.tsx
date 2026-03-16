import React, { useMemo, useState } from 'react'
import { Boxes, Plus, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button, Card, DataTable, Input, MetricCard, ToolTabView } from '@toolbox/ui-kit'
import IpamWorkbench from './shared/IpamWorkbench'
import { parseCidr, summarizeUsage } from './shared/ipMath'
import { PoolStatusBadge } from './shared/common'
import { useIpamInventoryStore } from './shared/useIpamInventoryStore'
import type { InventoryPool } from './shared/types'

const I18N_NAMESPACE = 'toolIpamInventory'

const defaultForm: Omit<InventoryPool, 'id' | 'createdAt' | 'updatedAt'> = {
  name: '',
  cidr: '10.0.10.0/24',
  site: '',
  purpose: '',
  status: 'active',
  allocated: 0,
  reserved: 0,
  notes: '',
}

const IpamInventory: React.FC = () => {
  const { t } = useTranslation(I18N_NAMESPACE)
  const inventory = useIpamInventoryStore()
  const [form, setForm] = useState(defaultForm)
  const [siteFilter, setSiteFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [error, setError] = useState('')

  const filtered = useMemo(
    () =>
      inventory.items.filter((item) => {
        const siteMatched = !siteFilter.trim() || item.site.toLowerCase().includes(siteFilter.trim().toLowerCase())
        const statusMatched = statusFilter === 'all' || item.status === statusFilter
        return siteMatched && statusMatched
      }),
    [inventory.items, siteFilter, statusFilter]
  )

  const totals = useMemo(() => {
    return filtered.reduce(
      (acc, item) => {
        const info = parseCidr(item.cidr)
        const usage = summarizeUsage(info.usable, item.allocated, item.reserved)
        acc.usable += info.usable
        acc.used += usage.used
        acc.free += usage.free
        return acc
      },
      { usable: 0, used: 0, free: 0 }
    )
  }, [filtered])

  const addPool = () => {
    try {
      parseCidr(form.cidr)
      inventory.addPool(form)
      setForm(defaultForm)
      setError('')
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : t('errors.invalid'))
    }
  }

  return (
    <IpamWorkbench title={t('title')} description={t('description')}>
      <ToolTabView
        queryLabel={t('tabs.add')}
        historyLabel={t('tabs.inventory')}
        historyContainerClassName="max-w-none"
        queryPanel={
          <div className="space-y-6">
            <Card>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('form.name')}</label>
                  <Input value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('form.cidr')}</label>
                  <Input value={form.cidr} onChange={(event) => setForm((prev) => ({ ...prev, cidr: event.target.value }))} />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('form.site')}</label>
                  <Input value={form.site} onChange={(event) => setForm((prev) => ({ ...prev, site: event.target.value }))} />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('form.purpose')}</label>
                  <Input value={form.purpose} onChange={(event) => setForm((prev) => ({ ...prev, purpose: event.target.value }))} />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('form.allocated')}</label>
                  <Input type="number" value={form.allocated} onChange={(event) => setForm((prev) => ({ ...prev, allocated: Number(event.target.value) || 0 }))} />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('form.reserved')}</label>
                  <Input type="number" value={form.reserved} onChange={(event) => setForm((prev) => ({ ...prev, reserved: Number(event.target.value) || 0 }))} />
                </div>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-[220px_1fr]">
                <select
                  className="rounded-lg border border-gray-300 bg-white px-3 py-3 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                  value={form.status}
                  onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value as InventoryPool['status'] }))}
                >
                  <option value="planned">{t('status.planned')}</option>
                  <option value="active">{t('status.active')}</option>
                  <option value="reserved">{t('status.reserved')}</option>
                  <option value="deprecated">{t('status.deprecated')}</option>
                </select>
                <Input value={form.notes} onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))} placeholder={t('form.notes')} />
              </div>
              {error ? <div className="mt-3 text-sm text-rose-600 dark:text-rose-400">{error}</div> : null}
              <div className="mt-4 flex flex-wrap gap-2">
                <Button type="button" onClick={addPool}>
                  <Plus className="mr-2 h-4 w-4" />
                  {t('form.add')}
                </Button>
                <Button type="button" variant="ghost" onClick={inventory.clearAll}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t('form.clearAll')}
                </Button>
              </div>
            </Card>
          </div>
        }
        historyPanel={
          <div className="max-w-none space-y-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <MetricCard title={t('stats.count')} value={filtered.length} hint={t('stats.countHint')} icon={Boxes} />
              <MetricCard title={t('stats.usable')} value={totals.usable} hint={t('stats.usableHint')} />
              <MetricCard title={t('stats.used')} value={totals.used} hint={t('stats.usedHint')} />
              <MetricCard title={t('stats.free')} value={totals.free} hint={t('stats.freeHint')} />
            </div>
            <Card>
              <div className="grid gap-4 md:grid-cols-2">
                <Input value={siteFilter} onChange={(event) => setSiteFilter(event.target.value)} placeholder={t('filters.site')} />
                <select
                  className="rounded-lg border border-gray-300 bg-white px-3 py-3 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                >
                  <option value="all">{t('filters.all')}</option>
                  <option value="planned">{t('status.planned')}</option>
                  <option value="active">{t('status.active')}</option>
                  <option value="reserved">{t('status.reserved')}</option>
                  <option value="deprecated">{t('status.deprecated')}</option>
                </select>
              </div>
            </Card>
            <Card>
              <DataTable
                rows={filtered}
                emptyText={t('table.empty')}
                rowKey={(row) => row.id}
                columns={[
                  { key: 'name', header: t('table.name'), cell: (row) => <div className="min-w-[160px] font-medium">{row.name}</div> },
                  { key: 'cidr', header: t('table.cidr'), cell: (row) => row.cidr },
                  { key: 'site', header: t('table.site'), cell: (row) => row.site || '—' },
                  { key: 'purpose', header: t('table.purpose'), cell: (row) => row.purpose || '—' },
                  { key: 'status', header: t('table.status'), cell: (row) => <PoolStatusBadge status={row.status} label={t(`status.${row.status}`)} /> },
                  {
                    key: 'usage',
                    header: t('table.usage'),
                    cell: (row) => {
                      const info = parseCidr(row.cidr)
                      const usage = summarizeUsage(info.usable, row.allocated, row.reserved)
                      return `${usage.used}/${info.usable} (${usage.utilization.toFixed(1)}%)`
                    },
                  },
                  {
                    key: 'actions',
                    header: t('table.actions'),
                    cell: (row) => (
                      <Button type="button" size="sm" variant="ghost" onClick={() => inventory.removePool(row.id)}>
                        {t('table.delete')}
                      </Button>
                    ),
                  },
                ]}
              />
            </Card>
          </div>
        }
      />
    </IpamWorkbench>
  )
}

export default IpamInventory
