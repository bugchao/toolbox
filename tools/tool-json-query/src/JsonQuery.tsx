import React, { useMemo, useState } from 'react'
import { Card, Input, NoticeCard, PageHero, ParticlesBackground, TextArea } from '@toolbox/ui-kit'
import { useTranslation } from 'react-i18next'
import { Check, ClipboardCopy, Search } from 'lucide-react'
import { queryJson } from './lib/jsonpath'

const SAMPLE = JSON.stringify({
  store: {
    name: 'Demo',
    books: [
      { title: 'Refactoring', price: 45, tags: ['dev', 'classic'] },
      { title: 'Clean Code', price: 38, tags: ['dev'] },
      { title: 'The Pragmatic Programmer', price: 50, tags: ['dev', 'classic'] },
    ],
  },
}, null, 2)

const EXAMPLES = [
  'store.books[*].title',
  'store.books[0]',
  'store.books[-1].price',
  'store.books[*].tags[*]',
  'store.books[0:2].title',
]

const JsonQuery: React.FC = () => {
  const { t } = useTranslation('toolJsonQuery')
  const [json, setJson] = useState(SAMPLE)
  const [path, setPath] = useState('store.books[*].title')
  const [copied, setCopied] = useState(false)

  const result = useMemo(() => queryJson(json, path), [json, path])

  const outputText = useMemo(() => {
    if (!result.ok) return ''
    if (result.matches.length === 1) return JSON.stringify(result.matches[0], null, 2)
    return JSON.stringify(result.matches, null, 2)
  }, [result])

  const onCopy = async () => {
    if (!outputText) return
    try {
      await navigator.clipboard.writeText(outputText)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1200)
    } catch { /* ignore */ }
  }

  return (
    <div className="relative min-h-[60vh]">
      <ParticlesBackground preset="minimal" className="absolute inset-0" />
      <div className="relative z-10 space-y-6">
        <PageHero title={t('title')} description={t('description')} />

        <NoticeCard tone="info" title={t('notice.title')} description={t('notice.body')} icon={Search} />

        <Card>
          <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-200">{t('path.label')}</label>
          <Input value={path} onChange={(e) => setPath(e.target.value)} placeholder="store.books[*].title" spellCheck={false} className="!font-mono" />
          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-gray-500 dark:text-gray-400">{t('path.examples')}:</span>
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => setPath(ex)}
                className="rounded-full border border-gray-300 px-2 py-0.5 font-mono text-gray-700 transition hover:border-indigo-400 hover:bg-indigo-50 dark:border-gray-700 dark:text-gray-200 dark:hover:border-indigo-600 dark:hover:bg-indigo-900/20"
              >
                {ex}
              </button>
            ))}
          </div>
          {!result.ok && (
            <div className="mt-2 rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:border-rose-700 dark:bg-rose-900/30 dark:text-rose-200">
              {result.message.startsWith('bad_json') ? t('error.badJson') : t('error.badPath', { msg: result.message })}
            </div>
          )}
          {result.ok && (
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{t('path.matchCount', { n: result.matches.length })}</p>
          )}
        </Card>

        <div className="grid gap-3 md:grid-cols-2">
          <Card>
            <h2 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200">{t('io.json')}</h2>
            <TextArea value={json} onChange={(e) => setJson(e.target.value)} rows={18} spellCheck={false} className="!font-mono !text-xs" />
          </Card>
          <Card>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">{t('io.result')}</h2>
              <button type="button" onClick={() => void onCopy()} disabled={!outputText} className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-30">
                {copied ? <Check className="h-3 w-3" /> : <ClipboardCopy className="h-3 w-3" />}
                {copied ? t('io.copied') : t('io.copy')}
              </button>
            </div>
            {result.ok && result.matches.length === 0 ? (
              <div className="rounded-md border border-dashed border-gray-300 p-8 text-center text-xs text-gray-400 dark:border-gray-700">{t('io.noMatch')}</div>
            ) : (
              <TextArea value={outputText} readOnly rows={18} spellCheck={false} className="!font-mono !text-xs" />
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}

export default JsonQuery
