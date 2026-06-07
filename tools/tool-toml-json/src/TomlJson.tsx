import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Button, Card, NoticeCard, PageHero, ParticlesBackground, TextArea } from '@toolbox/ui-kit'
import { useTranslation } from 'react-i18next'
import { ArrowLeftRight, Check, ClipboardCopy, Eraser, FileCode2 } from 'lucide-react'
import { jsonToToml, tomlToJson, type ConvertResult, type JsonIndent } from './lib/convert'
import { SAMPLES } from './lib/samples'

type Direction = 'auto' | 'toml-to-json' | 'json-to-toml'

const TomlJson: React.FC = () => {
  const { t } = useTranslation('toolTomlJson')
  const [toml, setToml] = useState(SAMPLES[0].toml)
  const [json, setJson] = useState('')
  const [direction, setDirection] = useState<Direction>('auto')
  const [indent, setIndent] = useState<JsonIndent>(2)
  const [tomlError, setTomlError] = useState<{ message: string; line?: number } | null>(null)
  const [jsonError, setJsonError] = useState<{ message: string; line?: number } | null>(null)
  const [copied, setCopied] = useState<'toml' | 'json' | null>(null)
  const skipTomlSync = useRef(false)
  const skipJsonSync = useRef(false)
  const lastEditedRef = useRef<'toml' | 'json' | null>('toml')

  useEffect(() => {
    const r = tomlToJson(toml, indent)
    if (r.ok) {
      skipJsonSync.current = true
      setJson(r.text)
      setTomlError(null)
    } else {
      setTomlError({ message: r.message, line: r.line })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (skipTomlSync.current) { skipTomlSync.current = false; return }
    if (direction === 'json-to-toml') return
    if (lastEditedRef.current !== 'toml' && direction === 'auto') return
    const r: ConvertResult = tomlToJson(toml, indent)
    if (r.ok) {
      skipJsonSync.current = true
      setJson(r.text)
      setTomlError(null)
    } else {
      setTomlError({ message: r.message, line: r.line })
    }
  }, [toml, indent, direction])

  useEffect(() => {
    if (skipJsonSync.current) { skipJsonSync.current = false; return }
    if (direction === 'toml-to-json') return
    if (lastEditedRef.current !== 'json' && direction === 'auto') return
    const r: ConvertResult = jsonToToml(json)
    if (r.ok) {
      skipTomlSync.current = true
      setToml(r.text)
      setJsonError(null)
    } else {
      setJsonError({ message: r.message, line: r.line })
    }
  }, [json, direction])

  const onCopy = async (side: 'toml' | 'json', text: string) => {
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      setCopied(side)
      window.setTimeout(() => setCopied((cur) => (cur === side ? null : cur)), 1200)
    } catch { /* ignore */ }
  }

  const onTomlChange = (v: string) => { lastEditedRef.current = 'toml'; setToml(v) }
  const onJsonChange = (v: string) => { lastEditedRef.current = 'json'; setJson(v) }

  const onClear = () => {
    skipTomlSync.current = true
    skipJsonSync.current = true
    setToml(''); setJson(''); setTomlError(null); setJsonError(null)
  }

  const sample = useMemo(() => SAMPLES, [])

  return (
    <div className="relative min-h-[60vh]">
      <ParticlesBackground preset="minimal" className="absolute inset-0" />
      <div className="relative z-10 space-y-6">
        <PageHero title={t('title')} description={t('description')} />

        <NoticeCard
          tone="info"
          title={t('notice.title')}
          description={t('notice.body')}
          icon={FileCode2}
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
                <option value="toml-to-json">TOML → JSON</option>
                <option value="json-to-toml">JSON → TOML</option>
              </select>
            </label>
            <label className="inline-flex items-center gap-1.5">
              <span className="text-gray-500 dark:text-gray-400">{t('options.jsonIndent')}</span>
              <select
                value={String(indent)}
                onChange={(e) => setIndent(e.target.value === '\\t' ? '\t' : (Number(e.target.value) as JsonIndent))}
                className="rounded border border-gray-300 bg-white px-2 py-1 text-xs dark:border-gray-700 dark:bg-gray-900"
              >
                <option value="2">2</option>
                <option value="4">4</option>
                <option value="\\t">Tab</option>
              </select>
            </label>
            <span className="flex-1" />
            <label className="inline-flex items-center gap-1.5">
              <span className="text-gray-500 dark:text-gray-400">{t('options.samples')}</span>
              <select
                onChange={(e) => {
                  const s = sample.find((x) => x.id === e.target.value)
                  if (s) { lastEditedRef.current = 'toml'; setToml(s.toml) }
                }}
                className="rounded border border-gray-300 bg-white px-2 py-1 text-xs dark:border-gray-700 dark:bg-gray-900"
                defaultValue=""
              >
                <option value="" disabled>{t('options.samplesPick')}</option>
                {sample.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </label>
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
                <span>TOML · {toml.length}</span>
                <button
                  type="button"
                  onClick={() => onCopy('toml', toml)}
                  disabled={!toml}
                  className="inline-flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-30"
                >
                  {copied === 'toml' ? <Check className="h-3 w-3" /> : <ClipboardCopy className="h-3 w-3" />}
                  {copied === 'toml' ? t('copy.copied') : t('copy.copy')}
                </button>
              </div>
              <TextArea
                value={toml}
                onChange={(e) => onTomlChange(e.target.value)}
                placeholder={t('placeholder.toml')}
                rows={18}
                spellCheck={false}
                className="!font-mono !text-xs"
              />
              {tomlError && (
                <div className="mt-1 rounded-md border border-rose-300 bg-rose-50 px-2 py-1 text-xs text-rose-700 dark:border-rose-700 dark:bg-rose-900/30 dark:text-rose-200">
                  {tomlError.line != null
                    ? t('error.tomlWithLine', { line: tomlError.line, msg: tomlError.message })
                    : t('error.toml', { msg: tomlError.message })}
                </div>
              )}
            </div>

            <div className="flex flex-col">
              <div className="mb-1 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>JSON · {json.length}</span>
                <button
                  type="button"
                  onClick={() => onCopy('json', json)}
                  disabled={!json}
                  className="inline-flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-30"
                >
                  {copied === 'json' ? <Check className="h-3 w-3" /> : <ClipboardCopy className="h-3 w-3" />}
                  {copied === 'json' ? t('copy.copied') : t('copy.copy')}
                </button>
              </div>
              <TextArea
                value={json}
                onChange={(e) => onJsonChange(e.target.value)}
                placeholder={t('placeholder.json')}
                rows={18}
                spellCheck={false}
                className="!font-mono !text-xs"
              />
              {jsonError && (
                <div className="mt-1 rounded-md border border-rose-300 bg-rose-50 px-2 py-1 text-xs text-rose-700 dark:border-rose-700 dark:bg-rose-900/30 dark:text-rose-200">
                  {jsonError.line != null
                    ? t('error.jsonWithLine', { line: jsonError.line, msg: jsonError.message })
                    : t('error.json', { msg: jsonError.message })}
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

export default TomlJson
