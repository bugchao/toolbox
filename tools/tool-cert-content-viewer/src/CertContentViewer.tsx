import React, { useMemo, useState } from 'react'
import { AlertCircle, Fingerprint, ShieldCheck, Upload } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button, Card, NoticeCard, PageHero, PropertyGrid, TextArea } from '@toolbox/ui-kit'
import { readCertificateUpload } from '../../tool-cert-suite-shared/client/browser-utils'

interface CertInspectResult {
  subject: string
  issuer: string
  serialNumber: string
  notBefore: string
  notAfter: string
  sha256Fingerprint: string
  publicKeyAlgorithm: string
  publicKeyBits: string
  signatureAlgorithm: string
  subjectAlternativeNames: string[]
  keyUsage: string[]
  extendedKeyUsage: string[]
  basicConstraints: string[]
  blockTypes: string[]
  blockCount: number
  rawText: string
}

export default function CertContentViewer() {
  const { t } = useTranslation('toolCertContentViewer')
  const [content, setContent] = useState('')
  const [encoding, setEncoding] = useState<'text' | 'base64'>('text')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<CertInspectResult | null>(null)

  const summaryItems = useMemo(() => {
    if (!result) return []
    return [
      { label: t('summary.fingerprint'), value: result.sha256Fingerprint || '—', tone: 'primary' as const },
      { label: t('summary.algorithm'), value: result.publicKeyAlgorithm || '—' },
      { label: t('summary.keySize'), value: result.publicKeyBits || '—', tone: 'success' as const },
      { label: t('summary.blocks'), value: `${result.blockCount} · ${result.blockTypes.join(', ')}` },
    ]
  }, [result, t])

  const handleInspect = async () => {
    if (!content.trim()) return

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/cert-tools/cert-inspect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, encoding }),
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
      <Card className="border-emerald-200/70 bg-gradient-to-br from-white via-emerald-50 to-teal-50 dark:border-emerald-900/40 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950/20">
        <PageHero icon={ShieldCheck} titleKey="title" descriptionKey="description" i18nNamespace="toolCertContentViewer" />
      </Card>

      <div className="space-y-6">
        <Card className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">{t('fields.content')}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{t('fields.help')}</div>
            </div>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-900 transition hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-100 dark:hover:bg-emerald-900/40">
              <Upload className="h-4 w-4" />
              {t('actions.upload')}
              <input
                type="file"
                accept=".crt,.cer,.pem,.der,.txt"
                className="hidden"
                onChange={async (event) => {
                  const file = event.target.files?.[0]
                  if (!file) return
                  const payload = await readCertificateUpload(file)
                  setContent(payload.content)
                  setEncoding(payload.encoding)
                }}
              />
            </label>
          </div>
          <TextArea
            rows={18}
            value={content}
            onChange={(event) => {
              setContent(event.target.value)
              setEncoding('text')
            }}
            placeholder={t('placeholders.content')}
            className="font-mono text-xs leading-6"
          />
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleInspect} disabled={loading || !content.trim()} className="whitespace-nowrap">
              {loading ? t('actions.loading') : t('actions.inspect')}
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setContent('')
                setEncoding('text')
                setResult(null)
                setError('')
              }}
            >
              {t('actions.clear')}
            </Button>
          </div>

          <NoticeCard title={t('notes.title')} description={t('notes.description')} tone="info" icon={Fingerprint} />
          {error ? <NoticeCard title={t('errors.title')} description={error} tone="danger" icon={AlertCircle} /> : null}
        </Card>

        {result ? (
          <>
            <Card className="space-y-4">
              <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">{t('sections.overview')}</div>
              <PropertyGrid items={summaryItems} className="xl:grid-cols-2" />
              <div className="grid gap-3">
                <InfoRow label={t('detail.subject')} value={result.subject} />
                <InfoRow label={t('detail.issuer')} value={result.issuer} />
              </div>
            </Card>

            <Card className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <InfoRow label={t('detail.serialNumber')} value={result.serialNumber} />
                <InfoRow label={t('detail.signatureAlgorithm')} value={result.signatureAlgorithm} />
                <InfoRow label={t('detail.notBefore')} value={result.notBefore} />
                <InfoRow label={t('detail.notAfter')} value={result.notAfter} />
              </div>
              <TokenList title={t('detail.san')} values={result.subjectAlternativeNames} emptyLabel={t('states.empty')} />
              <div className="grid gap-4 lg:grid-cols-2">
                <TokenList title={t('detail.keyUsage')} values={result.keyUsage} emptyLabel={t('states.empty')} tone="slate" />
                <TokenList title={t('detail.extendedKeyUsage')} values={result.extendedKeyUsage} emptyLabel={t('states.empty')} tone="slate" />
              </div>
              <TokenList title={t('detail.basicConstraints')} values={result.basicConstraints} emptyLabel={t('states.empty')} tone="slate" />
            </Card>

            <Card className="space-y-3">
              <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">{t('sections.raw')}</div>
              <TextArea value={result.rawText} readOnly rows={18} className="font-mono text-xs leading-6" />
            </Card>
          </>
        ) : (
          <Card className="flex min-h-[420px] items-center justify-center border-dashed">
            <div className="max-w-sm text-center text-sm text-gray-500 dark:text-gray-400">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                <ShieldCheck className="h-7 w-7" />
              </div>
              <div className="font-semibold text-gray-700 dark:text-gray-200">{t('empty.title')}</div>
              <div className="mt-2">{t('empty.description')}</div>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
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
  tone = 'emerald',
}: {
  title: string
  values: string[]
  emptyLabel: string
  tone?: 'emerald' | 'slate'
}) {
  const toneClass =
    tone === 'emerald'
      ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-900/60 dark:bg-emerald-950/20'
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
