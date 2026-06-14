import React, { useMemo, useState } from 'react'
import { Button, Card, NoticeCard, PageHero, ParticlesBackground, TextArea } from '@toolbox/ui-kit'
import { useTranslation } from 'react-i18next'
import { Check, ClipboardCopy, FileDiff, GitCompare, Wand2 } from 'lucide-react'
import {
  applyUnifiedPatch,
  classifyPatchLines,
  makePatch,
  patchStats,
  type DiffLineKind,
} from './lib/patch'

const SAMPLE_OLD = `function greet(name) {
  console.log("Hi " + name)
  return true
}
`
const SAMPLE_NEW = `function greet(name, greeting) {
  const msg = greeting || "Hello"
  console.log(msg + ", " + name)
  return true
}
`

type Mode = 'diff' | 'apply'

const LINE_CLASS: Record<DiffLineKind, string> = {
  add: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300',
  del: 'bg-rose-50 text-rose-800 dark:bg-rose-900/20 dark:text-rose-300',
  hunk: 'bg-sky-50 text-sky-700 dark:bg-sky-900/20 dark:text-sky-300',
  meta: 'text-gray-500 dark:text-gray-400',
  context: 'text-gray-700 dark:text-gray-300',
}

const DiffPatch: React.FC = () => {
  const { t } = useTranslation('toolDiffPatch')
  const [mode, setMode] = useState<Mode>('diff')

  // diff 模式
  const [oldText, setOldText] = useState(SAMPLE_OLD)
  const [newText, setNewText] = useState(SAMPLE_NEW)
  const [context, setContext] = useState(3)

  // apply 模式
  const [source, setSource] = useState(SAMPLE_OLD)
  const [patchText, setPatchText] = useState('')

  const [copied, setCopied] = useState(false)

  const patch = useMemo(
    () => makePatch(oldText, newText, { context }),
    [oldText, newText, context],
  )
  const stats = useMemo(() => patchStats(patch), [patch])
  const classified = useMemo(() => (patch ? classifyPatchLines(patch) : []), [patch])

  const applied = useMemo(() => applyUnifiedPatch(source, patchText), [source, patchText])

  const onCopyPatch = async () => {
    if (!patch) return
    try {
      await navigator.clipboard.writeText(patch)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1200)
    } catch { /* ignore */ }
  }

  const onSendToApply = () => {
    setSource(oldText)
    setPatchText(patch)
    setMode('apply')
  }

  return (
    <div className="relative min-h-[60vh]">
      <ParticlesBackground preset="minimal" className="absolute inset-0" />
      <div className="relative z-10 space-y-6">
        <PageHero title={t('title')} description={t('description')} />

        <NoticeCard
          tone="info"
          title={t('notice.title')}
          description={t('notice.body')}
          icon={FileDiff}
        />

        <Card>
          <div className="mb-4 inline-flex rounded-md border border-gray-200 p-0.5 dark:border-gray-700">
            <button
              type="button"
              onClick={() => setMode('diff')}
              className={[
                'inline-flex items-center gap-1.5 rounded px-3 py-1 text-xs font-medium transition',
                mode === 'diff'
                  ? 'bg-indigo-500 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800',
              ].join(' ')}
            >
              <GitCompare className="h-3.5 w-3.5" />
              {t('mode.diff')}
            </button>
            <button
              type="button"
              onClick={() => setMode('apply')}
              className={[
                'inline-flex items-center gap-1.5 rounded px-3 py-1 text-xs font-medium transition',
                mode === 'apply'
                  ? 'bg-indigo-500 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800',
              ].join(' ')}
            >
              <Wand2 className="h-3.5 w-3.5" />
              {t('mode.apply')}
            </button>
          </div>

          {mode === 'diff' ? (
            <div className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="flex flex-col">
                  <span className="mb-1 text-xs font-medium text-gray-700 dark:text-gray-200">{t('diff.old')}</span>
                  <TextArea
                    value={oldText}
                    onChange={(e) => setOldText(e.target.value)}
                    rows={12}
                    spellCheck={false}
                    className="!font-mono !text-xs"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="mb-1 text-xs font-medium text-gray-700 dark:text-gray-200">{t('diff.new')}</span>
                  <TextArea
                    value={newText}
                    onChange={(e) => setNewText(e.target.value)}
                    rows={12}
                    spellCheck={false}
                    className="!font-mono !text-xs"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs">
                <label className="inline-flex items-center gap-1.5">
                  <span className="text-gray-500 dark:text-gray-400">{t('diff.context')}</span>
                  <input
                    type="number"
                    min={0}
                    max={20}
                    value={context}
                    onChange={(e) => setContext(Math.max(0, Math.min(20, Number(e.target.value) || 0)))}
                    className="w-16 rounded border border-gray-300 bg-white px-2 py-1 text-xs dark:border-gray-700 dark:bg-gray-900"
                  />
                </label>
                {stats && (
                  <span className="inline-flex items-center gap-2">
                    <span className="text-emerald-600 dark:text-emerald-400">+{stats.additions}</span>
                    <span className="text-rose-600 dark:text-rose-400">−{stats.deletions}</span>
                    <span className="text-gray-500 dark:text-gray-400">{t('diff.hunks', { n: stats.hunks })}</span>
                  </span>
                )}
                <span className="flex-1" />
                <Button type="button" variant="ghost" onClick={onSendToApply} disabled={!patch}>
                  {t('diff.sendToApply')}
                </Button>
                <button
                  type="button"
                  onClick={() => void onCopyPatch()}
                  disabled={!patch}
                  className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-30"
                >
                  {copied ? <Check className="h-3 w-3" /> : <ClipboardCopy className="h-3 w-3" />}
                  {copied ? t('copy.copied') : t('copy.copy')}
                </button>
              </div>

              {patch ? (
                <pre className="overflow-x-auto rounded-md border border-gray-200 bg-gray-50 p-3 text-xs leading-relaxed dark:border-gray-700 dark:bg-gray-900">
                  {classified.map((l, i) => (
                    <div key={i} className={`whitespace-pre font-mono ${LINE_CLASS[l.kind]}`}>{l.text || ' '}</div>
                  ))}
                </pre>
              ) : (
                <div className="rounded-md border border-dashed border-gray-300 p-8 text-center text-xs text-gray-400 dark:border-gray-700">
                  {t('diff.identical')}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="flex flex-col">
                  <span className="mb-1 text-xs font-medium text-gray-700 dark:text-gray-200">{t('apply.source')}</span>
                  <TextArea
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    rows={12}
                    spellCheck={false}
                    className="!font-mono !text-xs"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="mb-1 text-xs font-medium text-gray-700 dark:text-gray-200">{t('apply.patch')}</span>
                  <TextArea
                    value={patchText}
                    onChange={(e) => setPatchText(e.target.value)}
                    rows={12}
                    placeholder={t('apply.patchPlaceholder')}
                    spellCheck={false}
                    className="!font-mono !text-xs"
                  />
                </div>
              </div>

              <div>
                <span className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-200">{t('apply.result')}</span>
                {!patchText.trim() ? (
                  <div className="rounded-md border border-dashed border-gray-300 p-8 text-center text-xs text-gray-400 dark:border-gray-700">
                    {t('apply.empty')}
                  </div>
                ) : applied.ok ? (
                  <pre className="overflow-x-auto rounded-md border border-emerald-300 bg-emerald-50/40 p-3 font-mono text-xs leading-relaxed text-gray-800 dark:border-emerald-700 dark:bg-emerald-900/10 dark:text-gray-100">
                    {applied.text || ' '}
                  </pre>
                ) : (
                  <div className="rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:border-rose-700 dark:bg-rose-900/30 dark:text-rose-200">
                    {t(`error.${applied.message}`, { defaultValue: applied.message })}
                  </div>
                )}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

export default DiffPatch
