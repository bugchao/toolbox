import React, { useMemo, useState } from 'react'
import { AlertCircle, Building2, Clock3, Database, Search, ServerCrash } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button, Card, Input, NoticeCard, PageHero, PropertyGrid, TextArea } from '@toolbox/ui-kit'

interface WhoisParsedResult {
  queryType: 'domain' | 'ip'
  registrar?: string
  registrant?: string
  organization?: string
  country?: string
  creationDate?: string
  expirationDate?: string
  updatedDate?: string
  nameservers: string[]
  statuses: string[]
  cidr?: string
  handle?: string
  abuseEmail?: string
}

interface WhoisLookupResult {
  query: string
  source: string
  parsed: WhoisParsedResult
  rawText: string
  timestamp: string
}

export default function WhoisLookup() {
  const { t } = useTranslation('toolWhoisLookup')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<WhoisLookupResult | null>(null)

  const summaryItems = useMemo(() => {
    if (!result) return []

    return [
      { label: t('summary.queryType'), value: t(`queryTypes.${result.parsed.queryType}`), tone: 'primary' as const },
      { label: t('summary.source'), value: result.source },
      { label: t('summary.nameserverCount'), value: result.parsed.nameservers.length, tone: 'success' as const },
      { label: t('summary.statusCount'), value: result.parsed.statuses.length },
    ]
  }, [result, t])

  const handleLookup = async () => {
    const normalized = query.trim()
    if (!normalized) return

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/whois/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: normalized }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.error || t('errors.requestFailed'))
      }

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
      <Card className="border-amber-200/70 bg-gradient-to-br from-white via-amber-50 to-orange-50 dark:border-amber-900/50 dark:from-slate-950 dark:via-slate-900 dark:to-amber-950/20">
        <PageHero
          icon={Search}
          titleKey="title"
          descriptionKey="description"
          i18nNamespace="toolWhoisLookup"
        />
      </Card>

      <div className="space-y-6">
        <Card className="space-y-4">
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('fields.query')}</div>
            <div className="flex flex-col gap-3 md:flex-row">
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    handleLookup()
                  }
                }}
                placeholder={t('placeholders.query')}
                className="flex-1"
              />
              <Button onClick={handleLookup} disabled={loading || !query.trim()} className="whitespace-nowrap">
                {loading ? t('actions.loading') : t('actions.lookup')}
              </Button>
            </div>
          </div>

          <NoticeCard
            title={t('notes.title')}
            description={t('notes.description')}
            tone="info"
            icon={Database}
          />

          {error ? (
            <NoticeCard title={t('errors.title')} description={error} tone="danger" icon={AlertCircle} />
          ) : null}

          <div className="rounded-3xl border border-dashed border-amber-300/80 bg-amber-50/80 p-4 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/20 dark:text-amber-100">
            <div className="font-semibold">{t('examples.title')}</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {['example.com', 'cloudflare.com', '8.8.8.8', '1.1.1.1'].map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => setQuery(example)}
                  className="rounded-full border border-amber-300 px-3 py-1 text-xs font-medium transition hover:bg-amber-100 dark:border-amber-700 dark:hover:bg-amber-900/50"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {result ? (
          <div className="space-y-6">
            <Card className="space-y-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200">
                    {result.parsed.queryType === 'domain' ? <Building2 className="h-6 w-6" /> : <ServerCrash className="h-6 w-6" />}
                  </span>
                  <div>
                    <div className="text-xs uppercase tracking-[0.22em] text-amber-700/80 dark:text-amber-300/80">{t(`queryTypes.${result.parsed.queryType}`)}</div>
                    <div className="break-all text-2xl font-semibold text-gray-900 dark:text-gray-100">{result.query}</div>
                  </div>
                </div>
              </div>
              <PropertyGrid items={summaryItems} className="xl:grid-cols-4" />
            </Card>

            <Card className="space-y-4">
              <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">{t('sections.parsed')}</div>
              {result.parsed.queryType === 'domain' ? (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  <InfoRow label={t('domain.registrar')} value={result.parsed.registrar} />
                  <InfoRow label={t('domain.registrant')} value={result.parsed.registrant} />
                  <InfoRow label={t('domain.country')} value={result.parsed.country} />
                  <InfoRow label={t('domain.creationDate')} value={result.parsed.creationDate} />
                  <InfoRow label={t('domain.updatedDate')} value={result.parsed.updatedDate} />
                  <InfoRow label={t('domain.expirationDate')} value={result.parsed.expirationDate} />
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  <InfoRow label={t('ip.organization')} value={result.parsed.organization} />
                  <InfoRow label={t('ip.country')} value={result.parsed.country} />
                  <InfoRow label={t('ip.cidr')} value={result.parsed.cidr} />
                  <InfoRow label={t('ip.handle')} value={result.parsed.handle} />
                  <InfoRow label={t('ip.abuseEmail')} value={result.parsed.abuseEmail} />
                </div>
              )}

              <div className="grid gap-4 xl:grid-cols-2">
                <TokenPanel title={t('sections.nameservers')} values={result.parsed.nameservers} emptyLabel={t('states.empty')} />
                <TokenPanel title={t('sections.statuses')} values={result.parsed.statuses} emptyLabel={t('states.empty')} tone="slate" />
              </div>
            </Card>

            <Card className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-100">
                <Clock3 className="h-4 w-4" />
                {t('sections.raw')}
              </div>
              <TextArea
                value={result.rawText}
                readOnly
                rows={24}
                className="min-h-[520px] font-mono text-xs leading-6"
              />
            </Card>
          </div>
        ) : (
          <Card className="flex min-h-[420px] items-center justify-center border-dashed">
            <div className="max-w-sm text-center text-sm text-gray-500 dark:text-gray-400">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                <Search className="h-7 w-7" />
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

function InfoRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 dark:border-slate-700 dark:bg-slate-900/70">
      <div className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{label}</div>
      <div className="mt-2 break-words text-sm font-semibold text-slate-900 dark:text-slate-100">{value || '—'}</div>
    </div>
  )
}

function TokenPanel({
  title,
  values,
  emptyLabel,
  tone = 'amber',
}: {
  title: string
  values: string[]
  emptyLabel: string
  tone?: 'amber' | 'slate'
}) {
  const toneClass =
    tone === 'amber'
      ? 'border-amber-200 bg-amber-50 dark:border-amber-900/60 dark:bg-amber-950/20'
      : 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900/70'

  return (
    <div className={`rounded-3xl border p-4 ${toneClass}`}>
      <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">{title}</div>
      <div className="mt-3 flex flex-wrap gap-2">
        {values.length ? (
          values.map((value) => (
            <span
              key={value}
              className="rounded-full border border-white/70 bg-white/80 px-3 py-1 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-200"
            >
              {value}
            </span>
          ))
        ) : (
          <span className="text-sm text-gray-500 dark:text-gray-400">{emptyLabel}</span>
        )}
      </div>
    </div>
  )
}
