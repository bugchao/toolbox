import React, { useMemo, useState } from 'react'
import { Button, Card, NoticeCard, PageHero, ParticlesBackground, TextArea } from '@toolbox/ui-kit'
import { useTranslation } from 'react-i18next'
import { Check, ClipboardCopy, ListTree } from 'lucide-react'
import { flatten, parseJson, toCsv } from './lib/jsonFlatten'

type Mode = 'flat' | 'csv'

const SAMPLE = `[
  { "id": 1, "name": "Ada", "addr": { "city": "London" }, "tags": ["a", "b"] },
  { "id": 2, "name": "Linus", "addr": { "city": "Helsinki" }, "tags": ["c"] }
]`

const JsonFlatten: React.FC = () => {
  const { t } = useTranslation('toolJsonFlatten')
  const [mode, setMode] = useState<Mode>('flat')
  const [input, setInput] = useState(SAMPLE)
  const [copied, setCopied] = useState(false)

  const parsed = useMemo(() => parseJson(input), [input])

  const flatMap = useMemo(() => (parsed.ok ? flatten(parsed.value) : null), [parsed])

  const output = useMemo(() => {
    if (!parsed.ok) return ''
    if (mode === 'csv') return toCsv(parsed.value)
    return JSON.stringify(flatten(parsed.value), null, 2)
  }, [parsed, mode])

  const rowCount = useMemo(() => {
    if (!parsed.ok) return 0
    return Array.isArray(parsed.value) ? parsed.value.length : 1
  }, [parsed])

  const onCopy = async () => {
    if (!output) return
    try {
      await navigator.clipboard.writeText(output)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1200)
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="relative min-h-[60vh]">
      <ParticlesBackground preset="minimal" className="absolute inset-0" />
      <div className="relative z-10 space-y-6">
        <PageHero title={t('title')} description={t('description')} />

        <NoticeCard tone="info" title={t('notice.title')} description={t('notice.body')} icon={ListTree} />

        <Card>
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-md border border-gray-200 p-0.5 dark:border-gray-700">
              {(['flat', 'csv'] as Mode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={['rounded px-3 py-1 text-xs font-medium transition', mode === m ? 'bg-indigo-500 text-white' : 'text-gray-600 dark:text-gray-300'].join(' ')}
                >
                  {t(`mode.${m}`)}
                </button>
              ))}
            </div>
            <Button variant="ghost" onClick={() => setInput(SAMPLE)}>{t('toolbar.sample')}</Button>
            {flatMap && (
              <span className="text-xs text-gray-400">
                {t('stats.keys', { n: Object.keys(flatMap).length })} · {t('stats.rows', { n: rowCount })}
              </span>
            )}
          </div>
        </Card>

        <div className="grid gap-3 md:grid-cols-2">
          <Card>
            <h2 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200">{t('io.input')}</h2>
            <TextArea value={input} onChange={(e) => setInput(e.target.value)} rows={18} spellCheck={false} className="!font-mono !text-xs" />
            {!parsed.ok && (
              <p className="mt-2 rounded-md border border-rose-300 bg-rose-50 p-2 text-xs text-rose-700 dark:border-rose-700 dark:bg-rose-900/20 dark:text-rose-300">
                {t('error.parse')}: {parsed.message}
              </p>
            )}
          </Card>
          <Card>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">{t('io.output')}</h2>
              <button
                type="button"
                onClick={() => void onCopy()}
                disabled={!output}
                className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-30"
              >
                {copied ? <Check className="h-3 w-3" /> : <ClipboardCopy className="h-3 w-3" />}
                {copied ? t('toolbar.copied') : t('toolbar.copy')}
              </button>
            </div>
            <TextArea value={output} readOnly rows={18} spellCheck={false} className="!font-mono !text-xs" />
          </Card>
        </div>
      </div>
    </div>
  )
}

export default JsonFlatten
