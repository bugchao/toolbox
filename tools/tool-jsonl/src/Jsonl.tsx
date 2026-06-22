import React, { useMemo, useState } from 'react'
import { Button, Card, NoticeCard, PageHero, ParticlesBackground, TextArea } from '@toolbox/ui-kit'
import { useTranslation } from 'react-i18next'
import { AlignJustify, ArrowLeftRight, Check, ClipboardCopy } from 'lucide-react'
import { arrayToJsonl, jsonlToArray, minifyJsonl, stats } from './lib/jsonl'

type Mode = 'toArray' | 'toJsonl'

const SAMPLE_JSONL = `{"id":1,"name":"Ada","active":true}
{"id":2,"name":"Linus","active":false}
{"id":3,"name":"Grace","tags":["a","b"]}`

const Jsonl: React.FC = () => {
  const { t } = useTranslation('toolJsonl')
  const [mode, setMode] = useState<Mode>('toArray')
  const [input, setInput] = useState(SAMPLE_JSONL)
  const [copied, setCopied] = useState(false)

  const st = useMemo(() => (mode === 'toArray' ? stats(input) : null), [input, mode])

  const result = useMemo(() => {
    if (mode === 'toArray') return jsonlToArray(input)
    return arrayToJsonl(input)
  }, [input, mode])

  const output = useMemo(() => {
    if (mode === 'toArray') return result.ok ? (result as { json: string }).json : ''
    return result.ok ? (result as { jsonl: string }).jsonl : ''
  }, [result, mode])

  const swap = () => {
    // 把输出搬到输入并切换方向（若当前有合法输出）
    if (output) setInput(output)
    setMode((m) => (m === 'toArray' ? 'toJsonl' : 'toArray'))
  }

  const onMinify = () => {
    if (mode !== 'toArray') return
    setInput(minifyJsonl(input).text)
  }

  const onCopy = async () => {
    if (!output) return
    try {
      await navigator.clipboard.writeText(output)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1200)
    } catch { /* ignore */ }
  }

  return (
    <div className="relative min-h-[60vh]">
      <ParticlesBackground preset="minimal" className="absolute inset-0" />
      <div className="relative z-10 space-y-6">
        <PageHero title={t('title')} description={t('description')} />

        <NoticeCard tone="info" title={t('notice.title')} description={t('notice.body')} icon={AlignJustify} />

        <Card>
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-md border border-gray-200 p-0.5 dark:border-gray-700">
              {(['toArray', 'toJsonl'] as Mode[]).map((m) => (
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
            <Button variant="ghost" onClick={swap}><span className="inline-flex items-center gap-1.5"><ArrowLeftRight className="h-4 w-4" />{t('swap')}</span></Button>
            {mode === 'toArray' && <Button variant="ghost" onClick={onMinify}>{t('minify')}</Button>}
            {st && (
              <span className="text-xs text-gray-400">
                {t('stats.records', { n: st.records })} · {t('stats.errors', { n: st.errors })} · {t('stats.blank', { n: st.blank })}
              </span>
            )}
          </div>
        </Card>

        <div className="grid gap-3 md:grid-cols-2">
          <Card>
            <h2 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200">{mode === 'toArray' ? t('io.jsonlInput') : t('io.arrayInput')}</h2>
            <TextArea value={input} onChange={(e) => setInput(e.target.value)} rows={18} spellCheck={false} className="!font-mono !text-xs" />
          </Card>
          <Card>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">{mode === 'toArray' ? t('io.arrayOutput') : t('io.jsonlOutput')}</h2>
              <button type="button" onClick={() => void onCopy()} disabled={!output} className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-30">
                {copied ? <Check className="h-3 w-3" /> : <ClipboardCopy className="h-3 w-3" />}
                {copied ? t('io.copied') : t('io.copy')}
              </button>
            </div>
            {result.ok ? (
              <TextArea value={output} readOnly rows={18} spellCheck={false} className="!font-mono !text-xs" />
            ) : mode === 'toArray' ? (
              <div className="space-y-1 rounded-md border border-rose-300 bg-rose-50 p-3 text-xs dark:border-rose-700 dark:bg-rose-900/20">
                <p className="font-medium text-rose-700 dark:text-rose-300">{t('error.lineErrors')}</p>
                <ul className="space-y-0.5 font-mono text-rose-600 dark:text-rose-300">
                  {(result as { errors: { line: number; message: string }[] }).errors.map((e, i) => (
                    <li key={i}>L{e.line}: {e.message}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="rounded-md border border-rose-300 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-700 dark:bg-rose-900/20 dark:text-rose-300">
                {t('error.parse')}: {(result as { message: string }).message}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Jsonl
