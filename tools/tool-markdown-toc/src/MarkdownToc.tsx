import React, { useMemo, useState } from 'react'
import { Card, NoticeCard, PageHero, ParticlesBackground, TextArea } from '@toolbox/ui-kit'
import { useTranslation } from 'react-i18next'
import { Check, ClipboardCopy, ListTree } from 'lucide-react'
import { buildToc, extractHeadings } from './lib/toc'

const SAMPLE = `# Getting Started

## Installation

### Requirements

### Setup

## Usage

### Basic

### Advanced

# API Reference

## Methods
`

const MarkdownToc: React.FC = () => {
  const { t } = useTranslation('toolMarkdownToc')
  const [input, setInput] = useState(SAMPLE)
  const [minLevel, setMinLevel] = useState(1)
  const [maxLevel, setMaxLevel] = useState(6)
  const [ordered, setOrdered] = useState(false)
  const [links, setLinks] = useState(true)
  const [copied, setCopied] = useState(false)

  const headings = useMemo(() => extractHeadings(input), [input])
  const toc = useMemo(
    () => buildToc(headings, { minLevel, maxLevel, ordered, links }),
    [headings, minLevel, maxLevel, ordered, links],
  )

  const onCopy = async () => {
    if (!toc) return
    try {
      await navigator.clipboard.writeText(toc)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1200)
    } catch { /* ignore */ }
  }

  return (
    <div className="relative min-h-[60vh]">
      <ParticlesBackground preset="minimal" className="absolute inset-0" />
      <div className="relative z-10 space-y-6">
        <PageHero title={t('title')} description={t('description')} />

        <NoticeCard tone="info" title={t('notice.title')} description={t('notice.body')} icon={ListTree} />

        <Card>
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <label className="inline-flex items-center gap-1.5">
              <span className="text-gray-500 dark:text-gray-400">{t('opts.minLevel')}</span>
              <select value={minLevel} onChange={(e) => setMinLevel(Number(e.target.value))} className="rounded border border-gray-300 bg-white px-2 py-1 dark:border-gray-700 dark:bg-gray-900">
                {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>H{n}</option>)}
              </select>
            </label>
            <label className="inline-flex items-center gap-1.5">
              <span className="text-gray-500 dark:text-gray-400">{t('opts.maxLevel')}</span>
              <select value={maxLevel} onChange={(e) => setMaxLevel(Number(e.target.value))} className="rounded border border-gray-300 bg-white px-2 py-1 dark:border-gray-700 dark:bg-gray-900">
                {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>H{n}</option>)}
              </select>
            </label>
            <label className="inline-flex items-center gap-1.5">
              <input type="checkbox" checked={ordered} onChange={(e) => setOrdered(e.target.checked)} />
              <span className="text-gray-600 dark:text-gray-300">{t('opts.ordered')}</span>
            </label>
            <label className="inline-flex items-center gap-1.5">
              <input type="checkbox" checked={links} onChange={(e) => setLinks(e.target.checked)} />
              <span className="text-gray-600 dark:text-gray-300">{t('opts.links')}</span>
            </label>
            <span className="text-gray-400">{t('opts.headingCount', { n: headings.length })}</span>
          </div>
        </Card>

        <div className="grid gap-3 md:grid-cols-2">
          <Card>
            <h2 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200">{t('io.input')}</h2>
            <TextArea value={input} onChange={(e) => setInput(e.target.value)} rows={18} spellCheck={false} className="!font-mono !text-xs" />
          </Card>
          <Card>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">{t('io.toc')}</h2>
              <button type="button" onClick={() => void onCopy()} disabled={!toc} className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-30">
                {copied ? <Check className="h-3 w-3" /> : <ClipboardCopy className="h-3 w-3" />}
                {copied ? t('io.copied') : t('io.copy')}
              </button>
            </div>
            {toc ? (
              <TextArea value={toc} readOnly rows={18} spellCheck={false} className="!font-mono !text-xs" />
            ) : (
              <div className="rounded-md border border-dashed border-gray-300 p-8 text-center text-xs text-gray-400 dark:border-gray-700">{t('io.empty')}</div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}

export default MarkdownToc
