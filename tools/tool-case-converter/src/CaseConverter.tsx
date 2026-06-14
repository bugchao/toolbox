import React, { useMemo, useState } from 'react'
import { Card, NoticeCard, PageHero, ParticlesBackground, TextArea } from '@toolbox/ui-kit'
import { useTranslation } from 'react-i18next'
import { CaseSensitive, Check, Copy } from 'lucide-react'
import { CASE_DEFS, convertLines, tokenize, type CaseId } from './lib/cases'

const CaseConverter: React.FC = () => {
  const { t } = useTranslation('toolCaseConverter')
  const [input, setInput] = useState('parseHTTPResponse v2')
  const [copied, setCopied] = useState<CaseId | null>(null)

  const tokens = useMemo(() => tokenize(input.split('\n')[0] ?? ''), [input])
  const results = useMemo(
    () => CASE_DEFS.map((d) => ({ id: d.id, value: convertLines(input, d.id) })),
    [input],
  )

  const onCopy = async (id: CaseId, value: string) => {
    if (!value) return
    try {
      await navigator.clipboard.writeText(value)
      setCopied(id)
      window.setTimeout(() => setCopied((c) => (c === id ? null : c)), 1200)
    } catch { /* ignore */ }
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
          icon={CaseSensitive}
        />

        <Card>
          <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-200">
            {t('input.label')}
          </label>
          <TextArea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={4}
            placeholder={t('input.placeholder')}
            spellCheck={false}
            className="!font-mono !text-sm"
          />
          {tokens.length > 0 && (
            <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-gray-500 dark:text-gray-400">{t('input.tokens')}:</span>
              {tokens.map((w, i) => (
                <span key={i} className="rounded bg-indigo-50 px-1.5 py-0.5 font-mono text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                  {w}
                </span>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
            {t('output.heading')}
          </h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {results.map(({ id, value }) => (
              <button
                key={id}
                type="button"
                onClick={() => void onCopy(id, value)}
                disabled={!value}
                className="group flex items-center gap-3 rounded-md border border-gray-200 px-3 py-2 text-left transition hover:border-indigo-300 disabled:opacity-50 dark:border-gray-700 dark:hover:border-indigo-700"
              >
                <span className="w-24 shrink-0 text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  {t(`cases.${id}`)}
                </span>
                <code className="flex-1 truncate whitespace-pre font-mono text-sm text-gray-800 dark:text-gray-100">
                  {value || '—'}
                </code>
                <span className="shrink-0 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200">
                  {copied === id ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                </span>
              </button>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-gray-500 dark:text-gray-400">{t('output.hint')}</p>
        </Card>
      </div>
    </div>
  )
}

export default CaseConverter
