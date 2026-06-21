import React, { useMemo, useState } from 'react'
import { Button, Card, Input, NoticeCard, PageHero, ParticlesBackground, TextArea } from '@toolbox/ui-kit'
import { useTranslation } from 'react-i18next'
import { Check, ClipboardCopy, ListOrdered } from 'lucide-react'
import {
  dedupe,
  filterLines,
  fromText,
  numberLines,
  removeBlank,
  reverse,
  shuffle,
  sortLines,
  stats,
  toText,
  trimLines,
  unnumberLines,
  type SortMode,
} from './lib/lines'

const SAMPLE = `banana
apple
cherry
apple

file10
file2`

const LineTools: React.FC = () => {
  const { t } = useTranslation('toolLineTools')
  const [text, setText] = useState(SAMPLE)
  const [caseInsensitive, setCaseInsensitive] = useState(false)
  const [filter, setFilter] = useState('')
  const [filterRegex, setFilterRegex] = useState(false)
  const [filterExclude, setFilterExclude] = useState(false)
  const [copied, setCopied] = useState(false)

  const lines = useMemo(() => fromText(text), [text])
  const st = useMemo(() => stats(lines), [lines])

  const apply = (fn: (l: string[]) => string[]) => setText(toText(fn(fromText(text))))

  const onSort = (mode: SortMode) => apply((l) => sortLines(l, mode, caseInsensitive))

  const onFilter = () => apply((l) => filterLines(l, filter, { regex: filterRegex, exclude: filterExclude, caseInsensitive }))

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1200)
    } catch { /* ignore */ }
  }

  const Btn: React.FC<{ onClick: () => void; children: React.ReactNode }> = ({ onClick, children }) => (
    <button
      type="button"
      onClick={onClick}
      className="rounded border border-gray-300 px-2.5 py-1 text-xs text-gray-700 transition hover:border-indigo-400 hover:bg-indigo-50 dark:border-gray-700 dark:text-gray-200 dark:hover:border-indigo-600 dark:hover:bg-indigo-900/20"
    >
      {children}
    </button>
  )

  return (
    <div className="relative min-h-[60vh]">
      <ParticlesBackground preset="minimal" className="absolute inset-0" />
      <div className="relative z-10 space-y-6">
        <PageHero title={t('title')} description={t('description')} />

        <NoticeCard tone="info" title={t('notice.title')} description={t('notice.body')} icon={ListOrdered} />

        <Card>
          <div className="mb-3 space-y-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-semibold uppercase text-gray-400">{t('group.sort')}</span>
              <Btn onClick={() => onSort('asc')}>{t('op.sortAsc')}</Btn>
              <Btn onClick={() => onSort('desc')}>{t('op.sortDesc')}</Btn>
              <Btn onClick={() => onSort('natural')}>{t('op.sortNatural')}</Btn>
              <Btn onClick={() => onSort('length')}>{t('op.sortLength')}</Btn>
              <label className="ml-1 inline-flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400">
                <input type="checkbox" checked={caseInsensitive} onChange={(e) => setCaseInsensitive(e.target.checked)} />
                {t('op.caseInsensitive')}
              </label>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-semibold uppercase text-gray-400">{t('group.edit')}</span>
              <Btn onClick={() => apply((l) => dedupe(l, caseInsensitive))}>{t('op.dedupe')}</Btn>
              <Btn onClick={() => apply(reverse)}>{t('op.reverse')}</Btn>
              <Btn onClick={() => apply((l) => shuffle(l))}>{t('op.shuffle')}</Btn>
              <Btn onClick={() => apply(removeBlank)}>{t('op.removeBlank')}</Btn>
              <Btn onClick={() => apply(trimLines)}>{t('op.trim')}</Btn>
              <Btn onClick={() => apply((l) => numberLines(l))}>{t('op.number')}</Btn>
              <Btn onClick={() => apply(unnumberLines)}>{t('op.unnumber')}</Btn>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-semibold uppercase text-gray-400">{t('group.filter')}</span>
              <Input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder={t('op.filterPlaceholder')} className="!w-44" />
              <label className="inline-flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400">
                <input type="checkbox" checked={filterRegex} onChange={(e) => setFilterRegex(e.target.checked)} />regex
              </label>
              <label className="inline-flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400">
                <input type="checkbox" checked={filterExclude} onChange={(e) => setFilterExclude(e.target.checked)} />{t('op.exclude')}
              </label>
              <Btn onClick={onFilter}>{t('op.applyFilter')}</Btn>
            </div>
          </div>

          <div className="mb-1 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>
              {t('stats.total', { n: st.total })} · {t('stats.unique', { n: st.unique })} · {t('stats.blank', { n: st.blank })} · {t('stats.chars', { n: st.chars })}
            </span>
            <button type="button" onClick={() => void onCopy()} className="inline-flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200">
              {copied ? <Check className="h-3 w-3" /> : <ClipboardCopy className="h-3 w-3" />}
              {copied ? t('copied') : t('copy')}
            </button>
          </div>
          <TextArea value={text} onChange={(e) => setText(e.target.value)} rows={16} spellCheck={false} className="!font-mono !text-xs" />
          <div className="mt-2">
            <Button variant="ghost" onClick={() => setText('')}>{t('clear')}</Button>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default LineTools
