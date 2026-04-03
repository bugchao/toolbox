import React, { useMemo, useState } from 'react'
import { DatabaseZap, LayoutTemplate } from 'lucide-react'
import { Card, DataTable, NoticeCard, PageHero, PropertyGrid, Timeline } from '@toolbox/ui-kit'
import { useTranslation } from 'react-i18next'

const SystemDesign: React.FC = () => {
  const { t } = useTranslation('toolSystemDesign')
  const [scenario, setScenario] = useState('feed')
  const [scale, setScale] = useState('regional')
  const [priority, setPriority] = useState('latency')

  const design = useMemo(() => {
    const modules = [0, 1, 2, 3].map((index) => ({
      id: `${scenario}-${scale}-${index}`,
      module: t(`modules.${scenario}.${index}.title`),
      role: t(`modules.${scenario}.${index}.role`),
      tradeoff: t(`modules.${priority}.${index}`),
    }))
    const phases = [0, 1, 2, 3].map((index) => ({
      time: t(`phaseTimes.${index}`),
      title: t(`phases.${index}.title`),
      description: t(`phases.${index}.description`, { scale: t(`options.${scale}`) }),
    }))
    return { modules, phases }
  }, [priority, scale, scenario, t])

  return (
    <div className="space-y-6">
      <Card className="border-amber-200/70 bg-gradient-to-br from-white via-amber-50 to-orange-50/70 dark:border-amber-900/60 dark:from-slate-950 dark:via-amber-950/20 dark:to-orange-950/10">
        <PageHero icon={LayoutTemplate} title={t('title')} description={t('description')} />
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_440px]">
        <Card className="space-y-5">
          <div className="space-y-2">
            <div className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('fields.scenario')}</div>
            <div className="grid gap-2 sm:grid-cols-3">
              {['feed', 'chat', 'analytics'].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setScenario(value)}
                  className={[
                    'rounded-xl border px-3 py-2 text-sm font-semibold transition',
                    scenario === value
                      ? 'border-amber-500 bg-amber-600 text-white'
                      : 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300',
                  ].join(' ')}
                >
                  {t(`options.${value}`)}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('fields.scale')}</div>
            <div className="grid gap-2 sm:grid-cols-3">
              {['regional', 'national', 'global'].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setScale(value)}
                  className={[
                    'rounded-xl border px-3 py-2 text-sm font-semibold transition',
                    scale === value
                      ? 'border-amber-500 bg-amber-600 text-white'
                      : 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300',
                  ].join(' ')}
                >
                  {t(`options.${value}`)}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('fields.priority')}</div>
            <div className="grid gap-2 sm:grid-cols-3">
              {['latency', 'consistency', 'cost'].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setPriority(value)}
                  className={[
                    'rounded-xl border px-3 py-2 text-sm font-semibold transition',
                    priority === value
                      ? 'border-amber-500 bg-amber-600 text-white'
                      : 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300',
                  ].join(' ')}
                >
                  {t(`options.${value}`)}
                </button>
              ))}
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          <NoticeCard
            tone="warning"
            icon={DatabaseZap}
            title={t('noticeTitle')}
            description={t('noticeDescription', {
              scenario: t(`options.${scenario}`),
              scale: t(`options.${scale}`),
              priority: t(`options.${priority}`),
            })}
          />
          <Card>
            <PropertyGrid
              items={[
                { label: t('stats.modules'), value: design.modules.length, tone: 'primary' },
                { label: t('stats.scale'), value: t(`options.${scale}`), tone: 'warning' },
                { label: t('stats.priority'), value: t(`options.${priority}`), tone: 'success' },
              ]}
              className="xl:grid-cols-1"
            />
          </Card>
          <Card className="space-y-4">
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{t('timelineTitle')}</div>
            <Timeline items={design.phases} />
          </Card>
          <Card>
            <DataTable
              rows={design.modules}
              rowKey={(row) => row.id}
              columns={[
                { key: 'module', header: t('headers.module'), cell: (row) => <span className="font-semibold">{row.module}</span> },
                { key: 'role', header: t('headers.role'), cell: (row) => row.role },
                { key: 'tradeoff', header: t('headers.tradeoff'), cell: (row) => row.tradeoff },
              ]}
            />
          </Card>
        </div>
      </div>
    </div>
  )
}

export default SystemDesign
