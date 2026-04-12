import React, { useState } from 'react'
import { AlertCircle, Download, KeyRound, RefreshCw, Upload } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button, Card, Input, NoticeCard, PageHero, PropertyGrid, TextArea } from '@toolbox/ui-kit'
import { downloadArtifact, readFileAsBinaryPayload, readFileAsText } from '../../tool-cert-suite-shared/client/browser-utils'

type CertFormat = 'pem' | 'pkcs8' | 'pfx' | 'jks'

interface Artifact {
  name: string
  mimeType: string
  content: string
  encoding: 'text' | 'base64'
}

interface ConvertResult {
  sourceFormat: CertFormat
  targetFormat: CertFormat
  artifacts: Artifact[]
  notes: string[]
  hasCertificate: boolean
  hasPrivateKey: boolean
}

const FORMATS: CertFormat[] = ['pem', 'pkcs8', 'pfx', 'jks']

export default function CertFormatConverter() {
  const { t } = useTranslation('toolCertFormatConverter')
  const [sourceFormat, setSourceFormat] = useState<CertFormat>('pem')
  const [targetFormat, setTargetFormat] = useState<CertFormat>('pfx')
  const [bundleContent, setBundleContent] = useState('')
  const [keyContent, setKeyContent] = useState('')
  const [keyFileName, setKeyFileName] = useState('')
  const [sourceContent, setSourceContent] = useState('')
  const [sourceEncoding, setSourceEncoding] = useState<'text' | 'base64'>('text')
  const [sourcePassword, setSourcePassword] = useState('')
  const [targetPassword, setTargetPassword] = useState('')
  const [alias, setAlias] = useState('toolbox')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<ConvertResult | null>(null)

  const usesUpload = sourceFormat === 'pfx' || sourceFormat === 'jks'

  const handleConvert = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/cert-tools/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceFormat,
          targetFormat,
          sourceContent,
          sourceEncoding,
          bundleContent,
          keyContent,
          sourcePassword,
          targetPassword,
          alias,
        }),
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

  const summaryItems = result
    ? [
        { label: t('summary.source'), value: result.sourceFormat.toUpperCase(), tone: 'primary' as const },
        { label: t('summary.target'), value: result.targetFormat.toUpperCase() },
        { label: t('summary.certificate'), value: result.hasCertificate ? t('states.yes') : t('states.no'), tone: result.hasCertificate ? 'success' as const : 'warning' as const },
        { label: t('summary.privateKey'), value: result.hasPrivateKey ? t('states.yes') : t('states.no'), tone: result.hasPrivateKey ? 'success' as const : 'warning' as const },
      ]
    : []

  return (
    <div className="space-y-6">
      <Card className="border-violet-200/70 bg-gradient-to-br from-white via-violet-50 to-fuchsia-50 dark:border-violet-900/40 dark:from-slate-950 dark:via-slate-900 dark:to-violet-950/20">
        <PageHero icon={RefreshCw} titleKey="title" descriptionKey="description" i18nNamespace="toolCertFormatConverter" />
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.06fr)_minmax(340px,0.94fr)]">
        <Card className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <SelectField label={t('fields.sourceFormat')} value={sourceFormat} onChange={(value) => setSourceFormat(value as CertFormat)}>
              {FORMATS.map((format) => (
                <option key={format} value={format}>{format.toUpperCase()}</option>
              ))}
            </SelectField>
            <SelectField label={t('fields.targetFormat')} value={targetFormat} onChange={(value) => setTargetFormat(value as CertFormat)}>
              {FORMATS.map((format) => (
                <option key={format} value={format}>{format.toUpperCase()}</option>
              ))}
            </SelectField>
          </div>

          {usesUpload ? (
            <div className="space-y-3 rounded-3xl border border-dashed border-violet-300 bg-violet-50/70 p-5 dark:border-violet-800 dark:bg-violet-950/20">
              <div>
                <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">{t('fields.sourceFile')}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{t('fields.sourceFileHelp')}</div>
              </div>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-violet-300 bg-white px-4 py-2 text-sm font-medium text-violet-900 transition hover:bg-violet-100 dark:border-violet-700 dark:bg-slate-950/70 dark:text-violet-100 dark:hover:bg-violet-900/30">
                <Upload className="h-4 w-4" />
                {t('actions.upload')}
                <input
                  type="file"
                  className="hidden"
                  onChange={async (event) => {
                    const file = event.target.files?.[0]
                    if (!file) return
                    const payload = await readFileAsBinaryPayload(file)
                    setSourceContent(payload.content)
                    setSourceEncoding('base64')
                    setBundleContent('')
                    setKeyContent('')
                  }}
                />
              </label>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">{t('fields.bundleContent')}</div>
                  <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-violet-700 dark:text-violet-300">
                    <Upload className="h-3.5 w-3.5" />
                    {t('actions.upload')}
                    <input
                      type="file"
                      accept=".pem,.crt,.cer,.txt,.key"
                      className="hidden"
                      onChange={async (event) => {
                        const file = event.target.files?.[0]
                        if (!file) return
                        const text = await readFileAsText(file)
                        setBundleContent(text)
                        setSourceContent(text)
                        setSourceEncoding('text')
                      }}
                    />
                  </label>
                </div>
                <TextArea
                  rows={9}
                  value={bundleContent}
                  onChange={(event) => {
                    setBundleContent(event.target.value)
                    setSourceContent(event.target.value)
                    setSourceEncoding('text')
                  }}
                  placeholder={t('placeholders.bundleContent')}
                  className="font-mono text-xs leading-6"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">{t('fields.keyContent')}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{t('fields.keyFileHelp')}</div>
                  </div>
                  <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-violet-700 dark:text-violet-300">
                    <Upload className="h-3.5 w-3.5" />
                    {t('actions.upload')}
                    <input
                      type="file"
                      accept=".pem,.key,.pk8,.txt"
                      className="hidden"
                      onChange={async (event) => {
                        const file = event.target.files?.[0]
                        if (!file) return
                        const text = await readFileAsText(file)
                        setKeyContent(text)
                        setKeyFileName(file.name)
                      }}
                    />
                  </label>
                </div>
                <TextArea
                  rows={7}
                  value={keyContent}
                  onChange={(event) => {
                    setKeyContent(event.target.value)
                    setKeyFileName('')
                  }}
                  placeholder={t('placeholders.keyContent')}
                  className="font-mono text-xs leading-6"
                />
                {keyFileName ? (
                  <div className="text-xs text-gray-500 dark:text-gray-400">{t('states.selectedFile', { name: keyFileName })}</div>
                ) : null}
              </div>
            </>
          )}

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">{t('fields.sourcePassword')}</div>
              <Input value={sourcePassword} onChange={(event) => setSourcePassword(event.target.value)} placeholder={t('placeholders.password')} />
            </div>
            <div className="space-y-2">
              <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">{t('fields.targetPassword')}</div>
              <Input value={targetPassword} onChange={(event) => setTargetPassword(event.target.value)} placeholder={t('placeholders.password')} />
            </div>
            <div className="space-y-2">
              <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">{t('fields.alias')}</div>
              <Input value={alias} onChange={(event) => setAlias(event.target.value)} placeholder="toolbox" />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={handleConvert} disabled={loading || sourceFormat === targetFormat} className="whitespace-nowrap">
              {loading ? t('actions.loading') : t('actions.convert')}
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setBundleContent('')
                setKeyContent('')
                setKeyFileName('')
                setSourceContent('')
                setSourceEncoding('text')
                setResult(null)
                setError('')
              }}
            >
              {t('actions.clear')}
            </Button>
          </div>

          <NoticeCard title={t('notes.title')} description={t('notes.description')} tone="info" icon={KeyRound} />
          {error ? <NoticeCard title={t('errors.title')} description={error} tone="danger" icon={AlertCircle} /> : null}
        </Card>

        <div className="space-y-6">
          {result ? (
            <>
              <Card className="space-y-4">
                <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">{t('sections.summary')}</div>
                <PropertyGrid items={summaryItems} className="xl:grid-cols-2" />
                {result.notes.length ? (
                  <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4 text-sm text-violet-950 dark:border-violet-900/60 dark:bg-violet-950/20 dark:text-violet-100">
                    {result.notes.map((note) => (
                      <div key={note}>• {note}</div>
                    ))}
                  </div>
                ) : null}
              </Card>

              <Card className="space-y-4">
                <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">{t('sections.outputs')}</div>
                <div className="space-y-3">
                  {result.artifacts.map((artifact) => (
                    <div key={artifact.name} className="rounded-2xl border border-slate-200 bg-white/80 p-4 dark:border-slate-700 dark:bg-slate-900/70">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{artifact.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{artifact.mimeType}</div>
                        </div>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => downloadArtifact(artifact.name, artifact.content, artifact.encoding, artifact.mimeType)}
                        >
                          <span className="inline-flex items-center gap-2">
                            <Download className="h-4 w-4" />
                            {t('actions.download')}
                          </span>
                        </Button>
                      </div>
                      {artifact.encoding === 'text' ? (
                        <TextArea value={artifact.content} readOnly rows={8} className="mt-3 font-mono text-xs leading-6" />
                      ) : (
                        <div className="mt-3 rounded-2xl border border-dashed border-slate-300 p-4 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
                          {t('states.binaryReady')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            </>
          ) : (
            <Card className="flex min-h-[420px] items-center justify-center border-dashed">
              <div className="max-w-sm text-center text-sm text-gray-500 dark:text-gray-400">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300">
                  <RefreshCw className="h-7 w-7" />
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

function SelectField({
  label,
  value,
  onChange,
  children,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  children: React.ReactNode
}) {
  return (
    <label className="space-y-2">
      <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">{label}</div>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-gray-700 dark:bg-slate-950/80 dark:text-gray-100"
      >
        {children}
      </select>
    </label>
  )
}
