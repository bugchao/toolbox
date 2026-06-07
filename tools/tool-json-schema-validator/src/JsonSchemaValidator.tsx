import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  Button,
  Card,
  NoticeCard,
  PageHero,
  ParticlesBackground,
  Switch,
  TextArea,
} from '@toolbox/ui-kit'
import { useTranslation } from 'react-i18next'
import {
  AlertTriangle,
  ArrowLeftRight,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Eraser,
  ShieldCheck,
} from 'lucide-react'

import { validate, type SchemaDraft, type ValidateResult, type NormalizedError } from './lib/validate'
import { SAMPLES, SAMPLE_ORDER, type SampleKey } from './lib/samples'

const DRAFT_OPTIONS: { value: SchemaDraft; label: string }[] = [
  { value: 'draft-2020-12', label: 'draft-2020-12' },
  { value: 'draft-2019-09', label: 'draft-2019-09' },
  { value: 'draft-07', label: 'draft-07' },
]

const DEBOUNCE_MS = 300

interface ErrorRowProps {
  err: NormalizedError
  t: (key: string, options?: Record<string, unknown>) => string
}

const ErrorRow: React.FC<ErrorRowProps> = ({ err, t }) => {
  const [open, setOpen] = useState(false)
  const instance = err.instancePath || t('error.rootPath')

  return (
    <div className="rounded-lg border border-rose-200 bg-rose-50/60 px-3 py-2 dark:border-rose-800 dark:bg-rose-950/30">
      <button
        type="button"
        className="flex w-full items-start gap-2 text-left"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? (
          <ChevronDown className="mt-0.5 h-4 w-4 flex-shrink-0 text-rose-500" />
        ) : (
          <ChevronRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-rose-500" />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-md bg-rose-200/70 px-2 py-0.5 font-mono text-xs font-medium text-rose-800 dark:bg-rose-900/60 dark:text-rose-200">
              {err.keyword || 'error'}
            </span>
            <code className="break-all font-mono text-xs text-gray-800 dark:text-gray-200">
              {instance}
            </code>
          </div>
          <div className="mt-1 text-sm text-gray-800 dark:text-gray-100">{err.message}</div>
        </div>
      </button>
      {open && (
        <div className="mt-2 space-y-1 border-t border-rose-200/60 pt-2 pl-6 text-xs dark:border-rose-800/60">
          <div className="flex gap-2">
            <span className="text-gray-500 dark:text-gray-400">{t('error.instancePath')}:</span>
            <code className="font-mono text-gray-800 dark:text-gray-200">{instance}</code>
          </div>
          <div className="flex gap-2">
            <span className="text-gray-500 dark:text-gray-400">{t('error.schemaPath')}:</span>
            <code className="break-all font-mono text-gray-800 dark:text-gray-200">
              {err.schemaPath || '(n/a)'}
            </code>
          </div>
          {Object.keys(err.params).length > 0 && (
            <pre className="overflow-auto rounded-md bg-gray-50 p-2 font-mono text-[11px] text-gray-700 dark:bg-gray-800/60 dark:text-gray-200">
              {JSON.stringify(err.params, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  )
}

const JsonSchemaValidator: React.FC = () => {
  const { t } = useTranslation('toolJsonSchemaValidator')

  const [draft, setDraft] = useState<SchemaDraft>('draft-2020-12')
  const [autoValidate, setAutoValidate] = useState(true)
  const [schemaText, setSchemaText] = useState<string>(SAMPLES.user.schema)
  const [dataText, setDataText] = useState<string>(SAMPLES.user.data)
  const [result, setResult] = useState<ValidateResult | null>(null)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 自动校验：300ms 防抖
  useEffect(() => {
    if (!autoValidate) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      if (!schemaText.trim() || !dataText.trim()) {
        setResult(null)
        return
      }
      setResult(validate({ schema: schemaText, data: dataText, draft }))
    }, DEBOUNCE_MS)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [schemaText, dataText, draft, autoValidate])

  const runValidate = () => {
    if (!schemaText.trim() || !dataText.trim()) {
      setResult(null)
      return
    }
    setResult(validate({ schema: schemaText, data: dataText, draft }))
  }

  const handleSample = (key: SampleKey | '') => {
    if (!key) return
    const pair = SAMPLES[key]
    if (!pair) return
    setSchemaText(pair.schema)
    setDataText(pair.data)
  }

  const handleClear = () => {
    setSchemaText('')
    setDataText('')
    setResult(null)
  }

  const handleSwap = () => {
    setSchemaText(dataText)
    setDataText(schemaText)
  }

  const errorCount = useMemo(() => {
    if (!result || result.ok) return 0
    if ('side' in result) return 0
    return result.errors.length
  }, [result])

  return (
    <div className="relative min-h-[60vh]">
      <ParticlesBackground preset="minimal" className="absolute inset-0" />
      <div className="relative z-10 space-y-6">
        <PageHero title={t('title')} description={t('description')} icon={ShieldCheck} />

        <NoticeCard
          tone="info"
          icon={ShieldCheck}
          title={t('notice.title')}
          description={t('notice.description')}
        />

        {/* 顶部工具栏 */}
        <Card>
          <div className="flex flex-wrap items-end gap-4">
            <div className="min-w-[200px]">
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('toolbar.draft')}
              </label>
              <select
                value={draft}
                onChange={(e) => setDraft(e.target.value as SchemaDraft)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              >
                {DRAFT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="min-w-[200px]">
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('toolbar.sample')}
              </label>
              <select
                value=""
                onChange={(e) => handleSample(e.target.value as SampleKey | '')}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              >
                <option value="">{t('toolbar.samplePlaceholder')}</option>
                {SAMPLE_ORDER.map((key) => (
                  <option key={key} value={key}>
                    {t(`sample.${key}`)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('toolbar.autoValidate')}
              </span>
              <Switch checked={autoValidate} onChange={setAutoValidate} />
            </div>

            <div className="ml-auto flex flex-wrap gap-2">
              {!autoValidate && (
                <Button size="sm" onClick={runValidate}>
                  <span className="inline-flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4" />
                    {t('toolbar.validate')}
                  </span>
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={handleSwap}>
                <span className="inline-flex items-center gap-1.5">
                  <ArrowLeftRight className="h-4 w-4" />
                  {t('toolbar.swap')}
                </span>
              </Button>
              <Button variant="ghost" size="sm" onClick={handleClear}>
                <span className="inline-flex items-center gap-1.5">
                  <Eraser className="h-4 w-4" />
                  {t('toolbar.clear')}
                </span>
              </Button>
            </div>
          </div>
        </Card>

        {/* 主体左右双栏 */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {t('schema.heading')}
              </h2>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {t('stats.chars', { count: schemaText.length })}
              </span>
            </div>
            <TextArea
              value={schemaText}
              onChange={(e) => setSchemaText(e.target.value)}
              placeholder={t('schema.placeholder')}
              spellCheck={false}
              className="min-h-[360px] font-mono text-sm"
            />
          </Card>

          <Card>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {t('data.heading')}
              </h2>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {t('stats.chars', { count: dataText.length })}
              </span>
            </div>
            <TextArea
              value={dataText}
              onChange={(e) => setDataText(e.target.value)}
              placeholder={t('data.placeholder')}
              spellCheck={false}
              className="min-h-[360px] font-mono text-sm"
            />
          </Card>
        </div>

        {/* 校验结果 */}
        <Card>
          <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
            {t('result.heading')}
          </h2>
          {!result && (
            <div className="rounded-lg border border-dashed border-gray-300 px-4 py-6 text-center text-sm text-gray-500 dark:border-gray-600 dark:text-gray-400">
              {t('result.empty')}
            </div>
          )}

          {result && result.ok && (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200">
              <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm font-medium">{t('result.pass')}</span>
            </div>
          )}

          {result && !result.ok && 'side' in result && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100">
              <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0" />
              <div className="text-sm">
                {result.side === 'schema'
                  ? t('result.parseError.schema', { message: result.message })
                  : t('result.parseError.data', { message: result.message })}
              </div>
            </div>
          )}

          {result && !result.ok && 'errors' in result && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-rose-800 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-200">
                <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm font-medium">
                  {t('result.failCount', { count: errorCount })}
                </span>
              </div>
              <div className="space-y-2">
                {result.errors.map((err, i) => (
                  <ErrorRow key={`${err.schemaPath}-${i}`} err={err} t={t} />
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

export default JsonSchemaValidator
