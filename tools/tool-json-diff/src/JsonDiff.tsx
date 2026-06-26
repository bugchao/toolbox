import React, { useMemo, useState } from 'react'
import { Button, Card, NoticeCard, PageHero, ParticlesBackground, TextArea } from '@toolbox/ui-kit'
import { useTranslation } from 'react-i18next'
import { ArrowLeftRight, Check, ClipboardCopy, GitCompareArrows } from 'lucide-react'
import { diffJson, parseJson, summarize, type DiffEntry, type DiffType } from './lib/jsonDiff'

const SAMPLE_LEFT = `{
  "name": "toolbox",
  "version": "1.0.0",
  "tags": ["json", "dev"],
  "config": { "minify": false, "indent": 2 }
}`

const SAMPLE_RIGHT = `{
  "name": "toolbox",
  "version": "1.1.0",
  "tags": ["json", "data"],
  "config": { "indent": 4, "sort": true }
}`

const TYPE_STYLE: Record<DiffType, string> = {
  added: 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300',
  removed: 'border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-700 dark:bg-rose-900/20 dark:text-rose-300',
  changed: 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-300',
  unchanged: 'border-gray-200 bg-gray-50 text-gray-500 dark:border-gray-700 dark:bg-gray-800/40 dark:text-gray-400',
}

function fmt(v: unknown): string {
  if (v === undefined) return ''
  return JSON.stringify(v)
}

const JsonDiff: React.FC = () => {
  const { t } = useTranslation('toolJsonDiff')
  const [left, setLeft] = useState(SAMPLE_LEFT)
  const [right, setRight] = useState(SAMPLE_RIGHT)
  const [hideUnchanged, setHideUnchanged] = useState(true)
  const [copied, setCopied] = useState(false)

  const leftParsed = useMemo(() => parseJson(left), [left])
  const rightParsed = useMemo(() => parseJson(right), [right])

  const diff = useMemo<DiffEntry[] | null>(() => {
    if (!leftParsed.ok || !rightParsed.ok) return null
    return diffJson(leftParsed.value, rightParsed.value)
  }, [leftParsed, rightParsed])

  const summary = useMemo(() => (diff ? summarize(diff) : null), [diff])

  const visible = useMemo(() => {
    if (!diff) return []
    return hideUnchanged ? diff.filter((e) => e.type !== 'unchanged') : diff
  }, [diff, hideUnchanged])

  const hasDiff = summary ? summary.added + summary.removed + summary.changed > 0 : false

  const swap = () => {
    setLeft(right)
    setRight(left)
  }

  const loadSample = () => {
    setLeft(SAMPLE_LEFT)
    setRight(SAMPLE_RIGHT)
  }

  const onCopy = async () => {
    if (!diff) return
    const text = visible
      .map((e) => {
        if (e.type === 'added') return `+ ${e.path}: ${fmt(e.right)}`
        if (e.type === 'removed') return `- ${e.path}: ${fmt(e.left)}`
        if (e.type === 'changed') return `~ ${e.path}: ${fmt(e.left)} -> ${fmt(e.right)}`
        return `  ${e.path}: ${fmt(e.left)}`
      })
      .join('\n')
    try {
      await navigator.clipboard.writeText(text)
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

        <NoticeCard tone="info" title={t('notice.title')} description={t('notice.body')} icon={GitCompareArrows} />

        <div className="grid gap-3 md:grid-cols-2">
          {([
            ['left', left, setLeft, leftParsed] as const,
            ['right', right, setRight, rightParsed] as const,
          ]).map(([side, value, setValue, parsed]) => (
            <Card key={side}>
              <h2 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200">{t(`io.${side}`)}</h2>
              <TextArea
                value={value}
                onChange={(e) => setValue(e.target.value)}
                rows={14}
                spellCheck={false}
                className="!font-mono !text-xs"
              />
              {!parsed.ok && (
                <p className="mt-2 rounded-md border border-rose-300 bg-rose-50 p-2 text-xs text-rose-700 dark:border-rose-700 dark:bg-rose-900/20 dark:text-rose-300">
                  {t('error.parse')}: {parsed.message}
                </p>
              )}
            </Card>
          ))}
        </div>

        <Card>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="ghost" onClick={swap}>
              <span className="inline-flex items-center gap-1.5">
                <ArrowLeftRight className="h-4 w-4" />
                {t('toolbar.swap')}
              </span>
            </Button>
            <Button variant="ghost" onClick={loadSample}>{t('toolbar.sample')}</Button>
            <label className="inline-flex cursor-pointer items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300">
              <input type="checkbox" checked={hideUnchanged} onChange={(e) => setHideUnchanged(e.target.checked)} />
              {t('toolbar.hideUnchanged')}
            </label>
            {diff && (
              <button
                type="button"
                onClick={() => void onCopy()}
                className="ml-auto inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                {copied ? <Check className="h-3 w-3" /> : <ClipboardCopy className="h-3 w-3" />}
                {copied ? t('toolbar.copied') : t('toolbar.copy')}
              </button>
            )}
          </div>

          {summary && (
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className={`rounded border px-2 py-0.5 ${TYPE_STYLE.added}`}>{t('summary.added', { n: summary.added })}</span>
              <span className={`rounded border px-2 py-0.5 ${TYPE_STYLE.removed}`}>{t('summary.removed', { n: summary.removed })}</span>
              <span className={`rounded border px-2 py-0.5 ${TYPE_STYLE.changed}`}>{t('summary.changed', { n: summary.changed })}</span>
              <span className={`rounded border px-2 py-0.5 ${TYPE_STYLE.unchanged}`}>{t('summary.unchanged', { n: summary.unchanged })}</span>
            </div>
          )}
        </Card>

        <Card>
          <h2 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-200">{t('result.title')}</h2>
          {!diff ? (
            <p className="text-sm text-gray-400">{t('result.waiting')}</p>
          ) : !hasDiff ? (
            <p className="inline-flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400">
              <Check className="h-4 w-4" />
              {t('result.identical')}
            </p>
          ) : (
            <ul className="space-y-1 font-mono text-xs">
              {visible.map((e, i) => (
                <li key={i} className="flex flex-wrap items-center gap-2">
                  <span className={`shrink-0 rounded border px-1.5 py-0.5 ${TYPE_STYLE[e.type]}`}>{t(`type.${e.type}`)}</span>
                  <span className="text-gray-700 dark:text-gray-200">{e.path}</span>
                  {e.type === 'changed' ? (
                    <span className="text-gray-500 dark:text-gray-400">
                      <span className="text-rose-600 dark:text-rose-300">{fmt(e.left)}</span>
                      {' → '}
                      <span className="text-emerald-600 dark:text-emerald-300">{fmt(e.right)}</span>
                    </span>
                  ) : e.type === 'added' ? (
                    <span className="text-emerald-600 dark:text-emerald-300">{fmt(e.right)}</span>
                  ) : e.type === 'removed' ? (
                    <span className="text-rose-600 dark:text-rose-300">{fmt(e.left)}</span>
                  ) : (
                    <span className="text-gray-400">{fmt(e.left)}</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  )
}

export default JsonDiff
