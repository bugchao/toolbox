import React, { useMemo, useState } from 'react'
import { Coins, Plane, Plus, Trash2 } from 'lucide-react'
import { Button, Card, DataTable, Input, NoticeCard, PageHero } from '@toolbox/ui-kit'
import { useTranslation } from 'react-i18next'

const TravelCostCompare: React.FC = () => {
  const { t } = useTranslation('toolTravelCostCompare')
  const [rows, setRows] = useState([
    { id: 'tokyo', city: 'Tokyo', transport: 3200, hotel: 4200, food: 1800, local: 900 },
    { id: 'seoul', city: 'Seoul', transport: 2100, hotel: 3100, food: 1600, local: 700 },
    { id: 'bangkok', city: 'Bangkok', transport: 1800, hotel: 2200, food: 1100, local: 600 },
  ])
  const [days, setDays] = useState(4)

  const ranking = useMemo(() => {
    return rows
      .map((row) => ({
        ...row,
        total: row.transport + row.hotel + row.food + row.local + days * 150,
      }))
      .sort((a, b) => a.total - b.total)
  }, [rows, days])

  const cheapest = ranking[0]

  return (
    <div className="space-y-6">
      <Card className="border-violet-200/70 bg-gradient-to-br from-white via-violet-50 to-fuchsia-50/70 dark:border-violet-900/60 dark:from-slate-950 dark:via-violet-950/20 dark:to-fuchsia-950/10">
        <PageHero icon={Coins} title={t('title')} description={t('description')} />
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_380px]">
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('inputTitle')}</div>
            <Button
              variant="secondary"
              onClick={() =>
                setRows((current) => [
                  ...current,
                  { id: crypto.randomUUID(), city: `City ${current.length + 1}`, transport: 2000, hotel: 2600, food: 1200, local: 650 },
                ])
              }
            >
              <Plus className="h-4 w-4" />
              {t('addDestination')}
            </Button>
          </div>

          <label className="block space-y-2">
            <div className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('daysLabel')}</div>
            <Input type="number" min={1} max={30} value={days} onChange={(event) => setDays(Number(event.target.value) || 1)} />
          </label>

          <div className="space-y-3">
            {rows.map((row) => (
              <div key={row.id} className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900/70 md:grid-cols-[1.4fr_repeat(4,minmax(0,1fr))_44px]">
                <Input value={row.city} onChange={(event) => setRows((current) => current.map((item) => (item.id === row.id ? { ...item, city: event.target.value } : item)))} placeholder={t('cityPlaceholder')} />
                {(['transport', 'hotel', 'food', 'local'] as const).map((field) => (
                  <Input
                    key={field}
                    type="number"
                    min={0}
                    value={row[field]}
                    onChange={(event) =>
                      setRows((current) => current.map((item) => (item.id === row.id ? { ...item, [field]: Number(event.target.value) || 0 } : item)))
                    }
                    placeholder={t(`fields.${field}`)}
                  />
                ))}
                <button type="button" className="rounded-xl border border-slate-200 text-slate-500 transition hover:border-rose-300 hover:text-rose-500 dark:border-slate-700" onClick={() => setRows((current) => current.filter((item) => item.id !== row.id))} aria-label={t('remove')}>
                  <Trash2 className="mx-auto h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-6">
          {cheapest ? (
            <NoticeCard
              tone="success"
              icon={Plane}
              title={t('recommendationTitle', { city: cheapest.city })}
              description={t('recommendationDescription', { total: cheapest.total.toLocaleString(), days })}
            />
          ) : null}

          <Card className="space-y-4">
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{t('tableTitle')}</div>
            <DataTable
              rows={ranking}
              rowKey={(row) => row.id}
              columns={[
                { key: 'city', header: t('headers.city'), cell: (row) => <span className="font-semibold">{row.city}</span> },
                { key: 'daily', header: t('headers.daily'), cell: (row) => Math.round((row.hotel + row.food + row.local) / Math.max(days, 1)).toLocaleString() },
                { key: 'total', header: t('headers.total'), cell: (row) => <span className="font-semibold text-slate-900 dark:text-slate-100">{row.total.toLocaleString()}</span> },
              ]}
            />
          </Card>
        </div>
      </div>
    </div>
  )
}

export default TravelCostCompare
