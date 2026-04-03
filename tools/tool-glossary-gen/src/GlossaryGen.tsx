import React, { useMemo, useState } from 'react'
import { BookA, Sparkles } from 'lucide-react'
import { Card, DataTable, NoticeCard, PageHero } from '@toolbox/ui-kit'
import { useTranslation } from 'react-i18next'

const GlossaryGen: React.FC = () => {
  const { t } = useTranslation('toolGlossaryGen')
  const [text, setText] = useState('A design system keeps tokens, components, and patterns aligned. Tokens help teams encode color, spacing, and typography decisions. Components turn tokens into reusable UI building blocks.')

  const rows = useMemo(() => {
    const normalized = text.replace(/[^\w\s-]/g, ' ')
    const words = normalized.split(/\s+/).map((item) => item.trim()).filter((item) => item.length > 4)
    const counts = new Map<string, number>()
    words.forEach((word) => counts.set(word.toLowerCase(), (counts.get(word.toLowerCase()) ?? 0) + 1))
    return [...counts.entries()]
      .filter(([, count]) => count >= 1)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([term, count]) => ({
        term,
        count,
        definition: t('definitionTemplate', { term }),
      }))
  }, [text, t])

  return (
    <div className="space-y-6">
      <Card className="border-emerald-200/70 bg-gradient-to-br from-white via-emerald-50 to-lime-50/70 dark:border-emerald-900/60 dark:from-slate-950 dark:via-emerald-950/20 dark:to-lime-950/10">
        <PageHero icon={BookA} title={t('title')} description={t('description')} />
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_420px]">
        <Card className="space-y-3">
          <div className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('inputTitle')}</div>
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={16}
            placeholder={t('placeholder')}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm leading-6 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
        </Card>

        <div className="space-y-6">
          <NoticeCard tone="success" icon={Sparkles} title={t('noticeTitle')} description={t('noticeDescription', { count: rows.length })} />
          <Card>
            <DataTable
              rows={rows}
              rowKey={(row) => row.term}
              columns={[
                { key: 'term', header: t('headers.term'), cell: (row) => <span className="font-semibold">{row.term}</span> },
                { key: 'count', header: t('headers.count'), cell: (row) => row.count },
                { key: 'definition', header: t('headers.definition'), cell: (row) => row.definition },
              ]}
            />
          </Card>
        </div>
      </div>
    </div>
  )
}

export default GlossaryGen
