import React, { useMemo, useState } from 'react'
import { AlertCircle, FileSearch, ShieldCheck, Upload } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button, Card, NoticeCard, PageHero, PropertyGrid, TextArea } from '@toolbox/ui-kit'
import { readFileAsText } from '../../tool-cert-suite-shared/client/browser-utils'

interface CsrInspectResult {
  verified: boolean
  subject: string
  subjectAlternativeNames: string[]
  publicKeyAlgorithm: string
  publicKeyBits: string
  signatureAlgorithm: string
  keyUsage: string[]
  extendedKeyUsage: string[]
  rawText: string
}

export default function CertCsrViewer() {
  const { t } = useTranslation('toolCertCsrViewer')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<CsrInspectResult | null>(null)

  const summaryItems = useMemo(() => {
    if (!result) return []
    return [
      { label: t('summary.verified'), value: result.verified ? t('states.valid') : t('states.invalid'), tone: result.verified ? 'success' as const : 'danger' as const },
      { label: t('summary.publicKeyAlgorithm'), value: result.publicKeyAlgorithm || '—' },
      { label: t('summary.publicKeyBits'), value: result.publicKeyBits || '—', tone: 'primary' as const },
      { label: t('summary.signatureAlgorithm'), value: result.signatureAlgorithm || '—' },
    ]
  }, [result, t])

  const handleAnalyze = async () => {
    if (!content.trim()) return

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/cert-tools/csr-inspect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data?.error || t('errors.requestFailed'))
      setResult(data)
    } catch (err) {
      setResult(null)
      setError(err instanceof Error ? err.message : t('errors.requestFailed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-cyan-200/70 bg-gradient-to-br from-white via-cyan-50 to-sky-50 dark:border-cyan-900/40 dark:from-slate-950 dark:via-slate-900 dark:to-cyan-950/20">
        <PageHero icon={FileSearch} titleKey="title" descriptionKey="description" i18nNamespace="toolCertCsrViewer" />
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.12fr)_minmax(320px,0.88fr)]">
        <Card className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">{t('fields.content')}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{t('fields.help')}</div>
            </div>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-cyan-300 bg-cyan-50 px-4 py-2 text-sm font-medium text-cyan-900 transition hover:bg-cyan-100 dark:border-cyan-800 dark:bg-cyan-950/30 dark:text-cyan-100 dark:hover:bg-cyan-900/40">
              <Upload className="h-4 w-4" />
              {t('actions.upload')}
              <input
                type="file"
                accept=".csr,.pem,.txt"
                className="hidden"
                onChange={async (event) => {
                  const file = event.target.files?.[0]
                  if (!file) return
                  const text = await readFileAsText(file)
                  setContent(text)
                }}
              />
            </label>
          </div>
          <TextArea
            rows={18}
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder={t('placeholders.content')}
            className="font-mono text-xs leading-6"
          />
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleAnalyze} disabled={loading || !content.trim()} className="whitespace-nowrap">
              {loading ? t('actions.loading') : t('actions.inspect')}
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setContent('')
                setResult(null)
                setError('')
              }}
            >
              {t('actions.clear')}
            </Button>
          </div>

          <NoticeCard title={t('notes.title')} description={t('notes.description')} tone="info" icon={ShieldCheck} />
          {error ? <NoticeCard title={t('errors.title')} description={error} tone="danger" icon={AlertCircle} /> : null}
        </Card>

        <div className="space-y-6">
          {result ? (
            <>
              <Card className="space-y-4">
                <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">{t('sections.overview')}</div>
                <PropertyGrid items={summaryItems} className="xl:grid-cols-2" />
                <InfoBlock label={t('detail.subject')} value={result.subject} />
              </Card>

              <Card className="space-y-4">
                <div className="grid gap-4 lg:grid-cols-2">
                  <TokenList title={t('detail.san')} values={result.subjectAlternativeNames} emptyLabel={t('states.empty')} />
                  <TokenList title={t('detail.keyUsage')} values={result.keyUsage} emptyLabel={t('states.empty')} tone="slate" />
                </div>
                <TokenList title={t('detail.extendedKeyUsage')} values={result.extendedKeyUsage} emptyLabel={t('states.empty')} tone="slate" />
              </Card>

              <Card className="space-y-3">
                <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">{t('sections.raw')}</div>
                <TextArea value={result.rawText} readOnly rows={18} className="font-mono text-xs leading-6" />
              </Card>
            </>
          ) : (
            <Card className="flex min-h-[420px] items-center justify-center border-dashed">
              <div className="max-w-sm text-center text-sm text-gray-500 dark:text-gray-400">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300">
                  <FileSearch className="h-7 w-7" />
                </div>
                <div className="font-semibold text-gray-700 dark:text-gray-200">{t('empty.title')}</div>
                <div className="mt-2">{t('empty.description')}</div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 dark:border-slate-700 dark:bg-slate-900/70">
      <div className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{label}</div>
      <div className="mt-2 break-words text-sm font-semibold text-slate-900 dark:text-slate-100">{value || '—'}</div>
    </div>
  )
}

function TokenList({
  title,
  values,
  emptyLabel,
  tone = 'cyan',
}: {
  title: string
  values: string[]
  emptyLabel: string
  tone?: 'cyan' | 'slate'
}) {
  const toneClass =
    tone === 'cyan'
      ? 'border-cyan-200 bg-cyan-50 dark:border-cyan-900/60 dark:bg-cyan-950/20'
      : 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900/70'

  return (
    <div className={`rounded-3xl border p-4 ${toneClass}`}>
      <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">{title}</div>
      <div className="mt-3 flex flex-wrap gap-2">
        {values.length ? values.map((value) => (
          <span key={value} className="rounded-full border border-white/70 bg-white/80 px-3 py-1 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-200">
            {value}
          </span>
        )) : <span className="text-sm text-gray-500 dark:text-gray-400">{emptyLabel}</span>}
      </div>
    </div>
  )
}
