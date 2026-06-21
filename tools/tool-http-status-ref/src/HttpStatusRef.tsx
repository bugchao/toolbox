import React, { useMemo, useState } from 'react'
import { Card, Input, NoticeCard, PageHero, ParticlesBackground } from '@toolbox/ui-kit'
import { useTranslation } from 'react-i18next'
import { ListChecks } from 'lucide-react'
import { CLASSES, groupByClass, search, type StatusClass } from './lib/status'

const CLASS_COLOR: Record<StatusClass, string> = {
  '1xx': 'text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800',
  '2xx': 'text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  '3xx': 'text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  '4xx': 'text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800',
  '5xx': 'text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
}

const HttpStatusRef: React.FC = () => {
  const { t } = useTranslation('toolHttpStatusRef')
  const [query, setQuery] = useState('')
  const [klass, setKlass] = useState<StatusClass | 'all'>('all')

  const descLookup = (key: string) => t(`codes.${key}`, { defaultValue: '' })
  const results = useMemo(() => search(query, klass, descLookup), [query, klass])
  const grouped = useMemo(() => groupByClass(results), [results])

  return (
    <div className="relative min-h-[60vh]">
      <ParticlesBackground preset="minimal" className="absolute inset-0" />
      <div className="relative z-10 space-y-6">
        <PageHero title={t('title')} description={t('description')} />

        <NoticeCard tone="info" title={t('notice.title')} description={t('notice.body')} icon={ListChecks} />

        <Card>
          <div className="flex flex-wrap items-center gap-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('search.placeholder')}
              spellCheck={false}
              className="!w-64"
            />
            <div className="inline-flex rounded-md border border-gray-200 p-0.5 dark:border-gray-700">
              <button
                type="button"
                onClick={() => setKlass('all')}
                className={['rounded px-2.5 py-1 text-xs font-medium transition', klass === 'all' ? 'bg-indigo-500 text-white' : 'text-gray-600 dark:text-gray-300'].join(' ')}
              >
                {t('search.all')}
              </button>
              {CLASSES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setKlass(c)}
                  className={['rounded px-2.5 py-1 text-xs font-mono font-medium transition', klass === c ? 'bg-indigo-500 text-white' : 'text-gray-600 dark:text-gray-300'].join(' ')}
                >
                  {c}
                </button>
              ))}
            </div>
            <span className="text-xs text-gray-400">{t('search.count', { n: results.length })}</span>
          </div>
        </Card>

        {results.length === 0 ? (
          <Card>
            <div className="py-8 text-center text-sm text-gray-400">{t('search.none')}</div>
          </Card>
        ) : (
          CLASSES.filter((c) => grouped[c].length > 0).map((c) => (
            <Card key={c}>
              <h2 className={['mb-3 inline-block rounded border px-2 py-0.5 text-sm font-bold', CLASS_COLOR[c]].join(' ')}>
                {c} · {t(`class.${c}`)}
              </h2>
              <ul className="space-y-1.5">
                {grouped[c].map((s) => (
                  <li key={s.code} className="flex gap-3 rounded-md border border-gray-100 px-3 py-2 dark:border-gray-800">
                    <span className={['shrink-0 font-mono text-lg font-bold', CLASS_COLOR[c].split(' ').slice(0, 2).join(' ')].join(' ')}>{s.code}</span>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-gray-800 dark:text-gray-100">{s.phrase}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{t(`codes.${s.i18nKey}`, { defaultValue: '' })}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

export default HttpStatusRef
