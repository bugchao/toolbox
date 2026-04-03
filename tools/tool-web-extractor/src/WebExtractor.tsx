import React, { useMemo, useState } from 'react'
import { FileSearch, ScanText } from 'lucide-react'
import { Card, NoticeCard, PageHero, PropertyGrid } from '@toolbox/ui-kit'
import { useTranslation } from 'react-i18next'

const WebExtractor: React.FC = () => {
  const { t } = useTranslation('toolWebExtractor')
  const [source, setSource] = useState('<title>Design Systems</title>\n<h1>Design Systems for Product Teams</h1>\n<h2>Why teams need them</h2>\n<p>Shared components reduce inconsistency and speed up delivery.</p>\n<p>Documentation matters as much as tokens and components.</p>')

  const parsed = useMemo(() => {
    const titleMatch = source.match(/<title>(.*?)<\/title>/i) || source.match(/<h1[^>]*>(.*?)<\/h1>/i)
    const title = titleMatch?.[1]?.replace(/<[^>]+>/g, '').trim() || source.split('\n').find(Boolean)?.trim() || '—'
    const headings = Array.from(source.matchAll(/<h[12][^>]*>(.*?)<\/h[12]>/gi)).map((match) => match[1].replace(/<[^>]+>/g, '').trim())
    const stripped = source.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    const sentences = stripped.split(/(?<=[.!?。！？])\s+/).map((item) => item.trim()).filter(Boolean)
    return {
      title,
      headings,
      excerpt: sentences.slice(0, 3),
      length: stripped.length,
    }
  }, [source])

  return (
    <div className="space-y-6">
      <Card className="border-blue-200/70 bg-gradient-to-br from-white via-blue-50 to-cyan-50/70 dark:border-blue-900/60 dark:from-slate-950 dark:via-blue-950/20 dark:to-cyan-950/10">
        <PageHero icon={FileSearch} title={t('title')} description={t('description')} />
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_420px]">
        <Card className="space-y-3">
          <div className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('inputTitle')}</div>
          <textarea
            value={source}
            onChange={(event) => setSource(event.target.value)}
            rows={16}
            placeholder={t('placeholder')}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm leading-6 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
        </Card>

        <div className="space-y-6">
          <NoticeCard tone="info" icon={ScanText} title={parsed.title} description={t('notice')} />
          <Card>
            <PropertyGrid
              items={[
                { label: t('stats.headings'), value: parsed.headings.length, tone: 'primary' },
                { label: t('stats.sentences'), value: parsed.excerpt.length, tone: 'success' },
                { label: t('stats.characters'), value: parsed.length, tone: 'warning' },
              ]}
              className="xl:grid-cols-1"
            />
          </Card>
          <Card className="space-y-3">
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{t('sections.headings')}</div>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
              {parsed.headings.length ? parsed.headings.map((item) => <li key={item}>• {item}</li>) : <li>{t('empty')}</li>}
            </ul>
          </Card>
          <Card className="space-y-3">
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{t('sections.excerpt')}</div>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
              {parsed.excerpt.length ? parsed.excerpt.map((item) => <li key={item}>• {item}</li>) : <li>{t('empty')}</li>}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default WebExtractor
