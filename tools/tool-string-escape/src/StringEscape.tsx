import React, { useMemo, useState } from 'react'
import { Card, NoticeCard, PageHero, ParticlesBackground, TextArea } from '@toolbox/ui-kit'
import { useTranslation } from 'react-i18next'
import { ArrowDownUp, Check, ClipboardCopy, Quote } from 'lucide-react'
import { escape, unescape, type EscapeLang } from './lib/escape'

const LANGS: EscapeLang[] = ['json', 'js', 'cstyle', 'shell', 'sql', 'regex']
type Mode = 'escape' | 'unescape'

const StringEscape: React.FC = () => {
  const { t } = useTranslation('toolStringEscape')
  const [lang, setLang] = useState<EscapeLang>('json')
  const [mode, setMode] = useState<Mode>('escape')
  const [input, setInput] = useState('Hello "World"\nTab\there\tend')
  const [copied, setCopied] = useState(false)

  const output = useMemo(() => {
    try {
      return mode === 'escape' ? escape(lang, input) : unescape(lang, input)
    } catch (e) {
      return `⚠ ${(e as Error).message}`
    }
  }, [lang, mode, input])

  const onCopy = async () => {
    if (!output) return
    try {
      await navigator.clipboard.writeText(output)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1200)
    } catch { /* ignore */ }
  }

  const swap = () => {
    setInput(output)
    setMode((m) => (m === 'escape' ? 'unescape' : 'escape'))
  }

  return (
    <div className="relative min-h-[60vh]">
      <ParticlesBackground preset="minimal" className="absolute inset-0" />
      <div className="relative z-10 space-y-6">
        <PageHero title={t('title')} description={t('description')} />

        <NoticeCard tone="info" title={t('notice.title')} description={t('notice.body')} icon={Quote} />

        <Card>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <div className="inline-flex rounded-md border border-gray-200 p-0.5 dark:border-gray-700">
              {LANGS.map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLang(l)}
                  className={[
                    'rounded px-2.5 py-1 text-xs font-medium transition',
                    lang === l
                      ? 'bg-indigo-500 text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800',
                  ].join(' ')}
                >
                  {t(`lang.${l}`)}
                </button>
              ))}
            </div>
            <span className="flex-1" />
            <div className="inline-flex rounded-md border border-gray-200 p-0.5 dark:border-gray-700">
              <button
                type="button"
                onClick={() => setMode('escape')}
                className={['rounded px-3 py-1 text-xs font-medium transition', mode === 'escape' ? 'bg-indigo-500 text-white' : 'text-gray-600 dark:text-gray-300'].join(' ')}
              >
                {t('mode.escape')}
              </button>
              <button
                type="button"
                onClick={() => setMode('unescape')}
                className={['rounded px-3 py-1 text-xs font-medium transition', mode === 'unescape' ? 'bg-indigo-500 text-white' : 'text-gray-600 dark:text-gray-300'].join(' ')}
              >
                {t('mode.unescape')}
              </button>
            </div>
          </div>

          <div className="grid items-stretch gap-3 md:grid-cols-[1fr_auto_1fr]">
            <div className="flex flex-col">
              <span className="mb-1 text-xs font-medium text-gray-700 dark:text-gray-200">{t('io.input')}</span>
              <TextArea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={12}
                spellCheck={false}
                className="!font-mono !text-xs"
              />
            </div>

            <div className="flex items-center justify-center">
              <button
                type="button"
                onClick={swap}
                title={t('io.swap')}
                className="rounded-full border border-gray-300 p-2 text-gray-500 transition hover:border-gray-400 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
              >
                <ArrowDownUp className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-col">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-200">{t('io.output')}</span>
                <button
                  type="button"
                  onClick={() => void onCopy()}
                  disabled={!output}
                  className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-30"
                >
                  {copied ? <Check className="h-3 w-3" /> : <ClipboardCopy className="h-3 w-3" />}
                  {copied ? t('io.copied') : t('io.copy')}
                </button>
              </div>
              <TextArea value={output} readOnly rows={12} spellCheck={false} className="!font-mono !text-xs" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default StringEscape
