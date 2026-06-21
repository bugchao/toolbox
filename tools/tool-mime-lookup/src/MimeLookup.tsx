import React, { useMemo, useState } from 'react'
import { Card, Input, NoticeCard, PageHero, ParticlesBackground } from '@toolbox/ui-kit'
import { useTranslation } from 'react-i18next'
import { ArrowRight, FileType2 } from 'lucide-react'
import { CATEGORIES, extToMime, mimeToExt, search } from './lib/mime'

const MimeLookup: React.FC = () => {
  const { t } = useTranslation('toolMimeLookup')
  const [extInput, setExtInput] = useState('archive.tar.gz')
  const [mimeInput, setMimeInput] = useState('text/html; charset=utf-8')
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<typeof CATEGORIES[number] | 'all'>('all')

  const extResult = useMemo(() => (extInput.trim() ? extToMime(extInput) : null), [extInput])
  const mimeResult = useMemo(() => (mimeInput.trim() ? mimeToExt(mimeInput) : null), [mimeInput])
  const results = useMemo(() => search(query, category), [query, category])

  const copy = (s: string) => { void navigator.clipboard?.writeText(s).catch(() => undefined) }

  return (
    <div className="relative min-h-[60vh]">
      <ParticlesBackground preset="minimal" className="absolute inset-0" />
      <div className="relative z-10 space-y-6">
        <PageHero title={t('title')} description={t('description')} />

        <NoticeCard tone="info" title={t('notice.title')} description={t('notice.body')} icon={FileType2} />

        <div className="grid gap-3 md:grid-cols-2">
          <Card>
            <h2 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200">{t('ext.heading')}</h2>
            <Input value={extInput} onChange={(e) => setExtInput(e.target.value)} placeholder="png / photo.jpg / a.tar.gz" spellCheck={false} className="!font-mono" />
            {extResult && (
              <div className="mt-2 flex items-center gap-2 text-sm">
                <ArrowRight className="h-4 w-4 text-gray-400" />
                <button type="button" onClick={() => copy(extResult.mime)} className="font-mono font-semibold text-indigo-700 dark:text-indigo-300">{extResult.mime}</button>
                {!extResult.known && <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">{t('ext.unknown')}</span>}
              </div>
            )}
          </Card>
          <Card>
            <h2 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200">{t('mime.heading')}</h2>
            <Input value={mimeInput} onChange={(e) => setMimeInput(e.target.value)} placeholder="application/json" spellCheck={false} className="!font-mono" />
            {mimeResult && (
              <div className="mt-2 flex items-center gap-2 text-sm">
                <ArrowRight className="h-4 w-4 text-gray-400" />
                {mimeResult.length > 0 ? (
                  <span className="flex flex-wrap gap-1.5">
                    {mimeResult.map((x) => (
                      <button key={x} type="button" onClick={() => copy(x)} className="rounded bg-indigo-50 px-2 py-0.5 font-mono text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">.{x}</button>
                    ))}
                  </span>
                ) : (
                  <span className="text-rose-500">{t('mime.unknown')}</span>
                )}
              </div>
            )}
          </Card>
        </div>

        <Card>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('table.search')} spellCheck={false} className="!w-56" />
            <div className="inline-flex flex-wrap rounded-md border border-gray-200 p-0.5 dark:border-gray-700">
              <button type="button" onClick={() => setCategory('all')} className={['rounded px-2 py-1 text-xs font-medium transition', category === 'all' ? 'bg-indigo-500 text-white' : 'text-gray-600 dark:text-gray-300'].join(' ')}>{t('table.all')}</button>
              {CATEGORIES.map((c) => (
                <button key={c} type="button" onClick={() => setCategory(c)} className={['rounded px-2 py-1 text-xs font-medium transition', category === c ? 'bg-indigo-500 text-white' : 'text-gray-600 dark:text-gray-300'].join(' ')}>{t(`cat.${c}`)}</button>
              ))}
            </div>
            <span className="text-xs text-gray-400">{t('table.count', { n: results.length })}</span>
          </div>
          {results.length === 0 ? (
            <div className="py-6 text-center text-sm text-gray-400">{t('table.none')}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="text-gray-500 dark:text-gray-400">
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="px-2 py-1 text-left">{t('table.mime')}</th>
                    <th className="px-2 py-1 text-left">{t('table.ext')}</th>
                    <th className="px-2 py-1 text-left">{t('table.category')}</th>
                  </tr>
                </thead>
                <tbody className="font-mono">
                  {results.map((e) => (
                    <tr key={e.mime} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="px-2 py-1">
                        <button type="button" onClick={() => copy(e.mime)} className="text-gray-800 hover:text-indigo-600 dark:text-gray-100 dark:hover:text-indigo-400">{e.mime}</button>
                      </td>
                      <td className="px-2 py-1 text-gray-600 dark:text-gray-300">{e.ext.map((x) => '.' + x).join(' ')}</td>
                      <td className="px-2 py-1 font-sans text-gray-400">{t(`cat.${e.category}`)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

export default MimeLookup
