import React, { useRef, useState } from 'react'
import { Button, Card, NoticeCard, PageHero, ParticlesBackground, TextArea } from '@toolbox/ui-kit'
import { useTranslation } from 'react-i18next'
import { ArrowLeftRight, Check, ClipboardCopy, Eraser, FlipVertical2, Table as TableIcon } from 'lucide-react'
import {
  parseCsv,
  parseMarkdown,
  toCsv,
  toMarkdown,
  transpose,
  type Align,
  type CsvOptions,
  type Table,
} from './lib/convert'

const SAMPLE_CSV = `Name,Role,Note
Alice,Engineer,"Likes ""quotes"" and, commas"
Bob,Designer,中文备注
Carol,PM,`

type Direction = 'auto' | 'csv-to-md' | 'md-to-csv'

const CsvMarkdown: React.FC = () => {
  const { t } = useTranslation('toolCsvMarkdown')
  const [csv, setCsv] = useState(SAMPLE_CSV)
  const [md, setMd] = useState('')
  const [direction, setDirection] = useState<Direction>('auto')
  const [delimiter, setDelimiter] = useState<NonNullable<CsvOptions['delimiter']>>(',')
  const [align, setAlign] = useState<Align>('none')
  const [pretty, setPretty] = useState(true)
  const [csvError, setCsvError] = useState<string | null>(null)
  const [mdError, setMdError] = useState<string | null>(null)
  const [copied, setCopied] = useState<'csv' | 'md' | null>(null)
  const skipCsvSync = useRef(false)
  const skipMdSync = useRef(false)
  const lastEdited = useRef<'csv' | 'md'>('csv')

  const opts: CsvOptions = { delimiter }

  const syncFromCsv = (text: string, alignOverride?: Align, prettyOverride?: boolean) => {
    const r = parseCsv(text, opts)
    if (r.ok) {
      skipMdSync.current = true
      setMd(toMarkdown(r.table, { align: alignOverride ?? align, pretty: prettyOverride ?? pretty }))
      setCsvError(null)
    } else {
      setCsvError(t(`error.${r.message}`, { defaultValue: r.message }))
    }
  }

  const syncFromMd = (text: string) => {
    const r = parseMarkdown(text)
    if (r.ok) {
      skipCsvSync.current = true
      setCsv(toCsv(r.table, opts))
      setMdError(null)
    } else {
      setMdError(t(`error.${r.message}`, { defaultValue: r.message }))
    }
  }

  // 初始渲染：把样例 CSV 转一次
  React.useEffect(() => {
    syncFromCsv(SAMPLE_CSV)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onCsvChange = (v: string) => {
    lastEdited.current = 'csv'
    setCsv(v)
    if (skipCsvSync.current) { skipCsvSync.current = false; return }
    if (direction !== 'md-to-csv') syncFromCsv(v)
  }

  const onMdChange = (v: string) => {
    lastEdited.current = 'md'
    setMd(v)
    if (skipMdSync.current) { skipMdSync.current = false; return }
    if (direction !== 'csv-to-md') syncFromMd(v)
  }

  // 选项变化时按上次编辑方向重算
  const onAlignChange = (a: Align) => {
    setAlign(a)
    if (lastEdited.current === 'csv' || direction === 'csv-to-md') syncFromCsv(csv, a)
  }
  const onPrettyChange = (p: boolean) => {
    setPretty(p)
    if (lastEdited.current === 'csv' || direction === 'csv-to-md') syncFromCsv(csv, undefined, p)
  }

  const onTranspose = () => {
    const r = parseCsv(csv, opts)
    if (!r.ok) { setCsvError(t(`error.${r.message}`, { defaultValue: r.message })); return }
    const flipped: Table = transpose(r.table)
    const newCsv = toCsv(flipped, opts)
    skipCsvSync.current = false
    lastEdited.current = 'csv'
    setCsv(newCsv)
    syncFromCsv(newCsv)
  }

  const onCopy = async (side: 'csv' | 'md', text: string) => {
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      setCopied(side)
      window.setTimeout(() => setCopied((c) => (c === side ? null : c)), 1200)
    } catch { /* ignore */ }
  }

  const onClear = () => {
    skipCsvSync.current = true
    skipMdSync.current = true
    setCsv(''); setMd(''); setCsvError(null); setMdError(null)
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
          icon={TableIcon}
        />

        <Card>
          <div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
            <label className="inline-flex items-center gap-1.5">
              <span className="text-gray-500 dark:text-gray-400">{t('options.direction')}</span>
              <select
                value={direction}
                onChange={(e) => setDirection(e.target.value as Direction)}
                className="rounded border border-gray-300 bg-white px-2 py-1 text-xs dark:border-gray-700 dark:bg-gray-900"
              >
                <option value="auto">{t('options.directionAuto')}</option>
                <option value="csv-to-md">CSV → MD</option>
                <option value="md-to-csv">MD → CSV</option>
              </select>
            </label>
            <label className="inline-flex items-center gap-1.5">
              <span className="text-gray-500 dark:text-gray-400">{t('options.delimiter')}</span>
              <select
                value={delimiter === '\t' ? 'tab' : delimiter}
                onChange={(e) => setDelimiter((e.target.value === 'tab' ? '\t' : e.target.value) as typeof delimiter)}
                className="rounded border border-gray-300 bg-white px-2 py-1 text-xs dark:border-gray-700 dark:bg-gray-900"
              >
                <option value=",">,</option>
                <option value=";">;</option>
                <option value="tab">Tab</option>
              </select>
            </label>
            <label className="inline-flex items-center gap-1.5">
              <span className="text-gray-500 dark:text-gray-400">{t('options.align')}</span>
              <select
                value={align}
                onChange={(e) => onAlignChange(e.target.value as Align)}
                className="rounded border border-gray-300 bg-white px-2 py-1 text-xs dark:border-gray-700 dark:bg-gray-900"
              >
                <option value="none">{t('options.alignNone')}</option>
                <option value="left">{t('options.alignLeft')}</option>
                <option value="center">{t('options.alignCenter')}</option>
                <option value="right">{t('options.alignRight')}</option>
              </select>
            </label>
            <label className="inline-flex items-center gap-1.5">
              <input type="checkbox" checked={pretty} onChange={(e) => onPrettyChange(e.target.checked)} />
              <span className="text-gray-600 dark:text-gray-300">{t('options.pretty')}</span>
            </label>
            <span className="flex-1" />
            <Button type="button" variant="ghost" onClick={onTranspose}>
              <span className="inline-flex items-center gap-1.5">
                <FlipVertical2 className="h-3.5 w-3.5" />
                {t('options.transpose')}
              </span>
            </Button>
            <Button type="button" variant="ghost" onClick={onClear}>
              <span className="inline-flex items-center gap-1.5">
                <Eraser className="h-3.5 w-3.5" />
                {t('options.clear')}
              </span>
            </Button>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="flex flex-col">
              <div className="mb-1 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>CSV · {csv.length}</span>
                <button
                  type="button"
                  onClick={() => onCopy('csv', csv)}
                  disabled={!csv}
                  className="inline-flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-30"
                >
                  {copied === 'csv' ? <Check className="h-3 w-3" /> : <ClipboardCopy className="h-3 w-3" />}
                  {copied === 'csv' ? t('copy.copied') : t('copy.copy')}
                </button>
              </div>
              <TextArea
                value={csv}
                onChange={(e) => onCsvChange(e.target.value)}
                rows={14}
                placeholder={t('placeholder.csv')}
                spellCheck={false}
                className="!font-mono !text-xs"
              />
              {csvError && (
                <div className="mt-1 rounded-md border border-rose-300 bg-rose-50 px-2 py-1 text-xs text-rose-700 dark:border-rose-700 dark:bg-rose-900/30 dark:text-rose-200">
                  {csvError}
                </div>
              )}
            </div>

            <div className="flex flex-col">
              <div className="mb-1 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Markdown · {md.length}</span>
                <button
                  type="button"
                  onClick={() => onCopy('md', md)}
                  disabled={!md}
                  className="inline-flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-30"
                >
                  {copied === 'md' ? <Check className="h-3 w-3" /> : <ClipboardCopy className="h-3 w-3" />}
                  {copied === 'md' ? t('copy.copied') : t('copy.copy')}
                </button>
              </div>
              <TextArea
                value={md}
                onChange={(e) => onMdChange(e.target.value)}
                rows={14}
                placeholder={t('placeholder.md')}
                spellCheck={false}
                className="!font-mono !text-xs"
              />
              {mdError && (
                <div className="mt-1 rounded-md border border-rose-300 bg-rose-50 px-2 py-1 text-xs text-rose-700 dark:border-rose-700 dark:bg-rose-900/30 dark:text-rose-200">
                  {mdError}
                </div>
              )}
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
            <ArrowLeftRight className="h-3 w-3" />
            <span>{t('hint.bidirectional')}</span>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default CsvMarkdown
