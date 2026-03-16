import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Card,
  CartesianGrid,
  ChartContainer,
  DataTable,
  MetricCard,
  Tooltip,
  XAxis,
  YAxis,
} from '@toolbox/ui-kit'
import IpamWorkbench from './shared/IpamWorkbench'
import { parseCidr, summarizeUsage } from './shared/ipMath'
import { useIpamInventoryStore } from './shared/useIpamInventoryStore'

const I18N_NAMESPACE = 'toolIpamUsage'

const IpamUsage: React.FC = () => {
  const { t } = useTranslation(I18N_NAMESPACE)
  const inventory = useIpamInventoryStore()

  const rows = useMemo(
    () =>
      inventory.items.map((item) => {
        const info = parseCidr(item.cidr)
        const usage = summarizeUsage(info.usable, item.allocated, item.reserved)
        return {
          ...item,
          usable: info.usable,
          used: usage.used,
          free: usage.free,
          utilization: Number(usage.utilization.toFixed(1)),
        }
      }),
    [inventory.items]
  )

  const saturated = rows.filter((item) => item.utilization >= 80)
  const averageUtilization = rows.length
    ? rows.reduce((sum, item) => sum + item.utilization, 0) / rows.length
    : 0

  return (
    <IpamWorkbench title={t('title')} description={t('description')}>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title={t('stats.pools')} value={rows.length} hint={t('stats.poolsHint')} />
        <MetricCard title={t('stats.average')} value={`${averageUtilization.toFixed(1)}%`} hint={t('stats.averageHint')} />
        <MetricCard title={t('stats.saturated')} value={saturated.length} hint={t('stats.saturatedHint')} />
        <MetricCard title={t('stats.available')} value={rows.reduce((sum, item) => sum + item.free, 0)} hint={t('stats.availableHint')} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <ChartContainer title={t('charts.utilization')} height={320}>
            <BarChart data={rows} margin={{ top: 12, right: 12, left: 0, bottom: 24 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.18)" />
              <XAxis dataKey="name" angle={-25} textAnchor="end" height={56} tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip formatter={(value: number) => `${value}%`} />
              <Bar dataKey="utilization" fill="#2563eb" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </Card>
        <Card>
          <ChartContainer title={t('charts.capacity')} height={320}>
            <AreaChart data={rows} margin={{ top: 12, right: 12, left: 0, bottom: 24 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.18)" />
              <XAxis dataKey="name" angle={-25} textAnchor="end" height={56} tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip />
              <Area type="monotone" dataKey="used" stackId="1" stroke="#0f766e" fill="#14b8a6" />
              <Area type="monotone" dataKey="free" stackId="1" stroke="#94a3b8" fill="#cbd5e1" />
            </AreaChart>
          </ChartContainer>
        </Card>
      </div>

      <Card>
        <div className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">{t('table.title')}</div>
        <DataTable
          rows={rows}
          emptyText={t('table.empty')}
          rowKey={(row) => row.id}
          columns={[
            { key: 'name', header: t('table.name'), cell: (row) => row.name },
            { key: 'cidr', header: t('table.cidr'), cell: (row) => row.cidr },
            { key: 'used', header: t('table.used'), cell: (row) => `${row.used}/${row.usable}` },
            { key: 'free', header: t('table.free'), cell: (row) => row.free },
            { key: 'util', header: t('table.util'), cell: (row) => `${row.utilization}%` },
          ]}
        />
      </Card>
    </IpamWorkbench>
  )
}

export default IpamUsage
