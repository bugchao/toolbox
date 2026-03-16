import React, { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
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
import { detectConflicts, parseCidr } from './shared/ipMath'
import { useIpamInventoryStore } from './shared/useIpamInventoryStore'
import type { ConflictInputRow } from './shared/types'

const I18N_NAMESPACE = 'toolIpamConflict'

function parseManualRows(text: string) {
  return text
    .split('\n')
    .map((line, index) => {
      const [label, cidr] = line.split(',').map((part) => part.trim())
      if (!cidr && !label) return null
      return {
        id: `${index}-${cidr ?? label}`,
        label: cidr ? label : `row-${index + 1}`,
        cidr: cidr || label,
        source: 'manual' as const,
      }
    })
    .filter(Boolean) as ConflictInputRow[]
}

const IpamConflict: React.FC = () => {
  const { t } = useTranslation(I18N_NAMESPACE)
  const inventory = useIpamInventoryStore()
  const history = useQueryHistory<{ raw: string; includeInventory: boolean }>('ipam-conflict')
  const [raw, setRaw] = useState('corp-lan,10.0.0.0/24\nbranch-lan,10.0.0.128/25')
  const [includeInventory, setIncludeInventory] = useState(false)

  const analysis = useMemo(() => {
    try {
      const manual = parseManualRows(raw)
      manual.forEach((row) => parseCidr(row.cidr))
      const rows = includeInventory
        ? [
            ...manual,
            ...inventory.items.map((item) => ({
              id: item.id,
              label: item.name,
              cidr: item.cidr,
              source: 'inventory' as const,
            })),
          ]
        : manual
      return {
        rows,
        conflicts: detectConflicts(rows),
        error: '',
      }
    } catch (nextError) {
      return {
        rows: [],
        conflicts: [],
        error: nextError instanceof Error ? nextError.message : t('errors.invalid'),
      }
    }
  }, [includeInventory, inventory.items, raw, t])
  const error = analysis.error

  return (
    <IpamWorkbench title={t('title')} description={t('description')}>
      <ToolTabView
        queryLabel={t('tabs.query')}
        historyLabel={t('tabs.history')}
        queryPanel={
          <div className="space-y-6">
            <Card>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('form.input')}</label>
              <textarea
                className="min-h-[180px] w-full rounded-2xl border border-gray-300 bg-white px-4 py-4 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                value={raw}
                onChange={(event) => setRaw(event.target.value)}
              />
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <label className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <input type="checkbox" checked={includeInventory} onChange={(event) => setIncludeInventory(event.target.checked)} />
                  {t('form.includeInventory')}
                </label>
                <Button type="button" variant="secondary" onClick={() => history.saveQuery({ raw, includeInventory })}>
                  <Search className="mr-2 h-4 w-4" />
                  {t('form.saveHistory')}
                </Button>
              </div>
              {error ? <div className="mt-3 text-sm text-rose-600 dark:text-rose-400">{error}</div> : null}
            </Card>

            {!error ? (
              <>
                <div className="grid gap-4 md:grid-cols-3">
                  <MetricCard title={t('stats.inputs')} value={analysis.rows.length} hint={t('stats.inputsHint')} />
                  <MetricCard title={t('stats.conflicts')} value={analysis.conflicts.length} hint={t('stats.conflictsHint')} />
                  <MetricCard title={t('stats.inventory')} value={includeInventory ? inventory.items.length : 0} hint={t('stats.inventoryHint')} />
                </div>
                <Card>
                  <div className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">{t('results.title')}</div>
                  <DataTable
                    rows={analysis.conflicts}
                    emptyText={t('results.empty')}
                    columns={[
                      { key: 'left', header: t('results.left'), cell: (row) => `${row.left.label} · ${row.left.cidr}` },
                      { key: 'right', header: t('results.right'), cell: (row) => `${row.right.label} · ${row.right.cidr}` },
                      { key: 'relation', header: t('results.relation'), cell: (row) => t(`relations.${row.relation}`) },
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
              setRaw(record.queryInfo.raw)
              setIncludeInventory(record.queryInfo.includeInventory)
            }}
            renderItem={(queryInfo) => (
              <div className="flex flex-col">
                <span>{queryInfo.includeInventory ? t('history.withInventory') : t('history.manualOnly')}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{queryInfo.raw.split('\n').filter(Boolean).length} {t('history.lines')}</span>
              </div>
            )}
          />
        }
      />
    </IpamWorkbench>
  )
}

export default IpamConflict
