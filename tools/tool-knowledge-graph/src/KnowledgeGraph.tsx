import React, { useMemo, useState } from 'react'
import { GitBranchPlus, Network } from 'lucide-react'
import { Card, DataTable, NoticeCard, PageHero, PropertyGrid } from '@toolbox/ui-kit'
import { useTranslation } from 'react-i18next'

const KnowledgeGraph: React.FC = () => {
  const { t } = useTranslation('toolKnowledgeGraph')
  const [text, setText] = useState('Problem -> Cause : identifies\nCause -> Experiment : validates\nExperiment -> Insight : produces\nInsight -> Action : informs')

  const graph = useMemo(() => {
    const edges = text
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [leftRight, relationRaw] = line.split(':')
        const [from, to] = leftRight.split('->').map((item) => item.trim())
        return { from, to, relation: relationRaw?.trim() || t('defaultRelation') }
      })
      .filter((item) => item.from && item.to)
    const nodes = Array.from(new Set(edges.flatMap((edge) => [edge.from, edge.to])))
    return { edges, nodes }
  }, [text, t])

  return (
    <div className="space-y-6">
      <Card className="border-sky-200/70 bg-gradient-to-br from-white via-sky-50 to-cyan-50/70 dark:border-sky-900/60 dark:from-slate-950 dark:via-sky-950/20 dark:to-cyan-950/10">
        <PageHero icon={Network} title={t('title')} description={t('description')} />
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_420px]">
        <Card className="space-y-3">
          <div className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('inputTitle')}</div>
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={14}
            placeholder={t('placeholder')}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm leading-6 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
        </Card>

        <div className="space-y-6">
          <NoticeCard tone="info" icon={GitBranchPlus} title={t('noticeTitle')} description={t('noticeDescription', { nodes: graph.nodes.length, edges: graph.edges.length })} />
          <Card>
            <PropertyGrid
              items={[
                { label: t('stats.nodes'), value: graph.nodes.length, tone: 'primary' },
                { label: t('stats.edges'), value: graph.edges.length, tone: 'success' },
              ]}
              className="xl:grid-cols-1"
            />
          </Card>
          <Card>
            <DataTable
              rows={graph.edges}
              rowKey={(row, index) => `${row.from}-${row.to}-${index}`}
              columns={[
                { key: 'from', header: t('headers.from'), cell: (row) => row.from },
                { key: 'relation', header: t('headers.relation'), cell: (row) => row.relation },
                { key: 'to', header: t('headers.to'), cell: (row) => row.to },
              ]}
            />
          </Card>
        </div>
      </div>
    </div>
  )
}

export default KnowledgeGraph
