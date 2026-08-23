import React, { useMemo, useState } from 'react'
import {
  Braces,
  Download,
  Globe2,
  Hash,
  Laptop,
  Layers3,
  MapPinned,
  RefreshCw,
  Rows3,
  Search,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
} from 'lucide-react'
import { CopyButton } from '@toolbox/ui-kit'
import { useTranslation } from 'react-i18next'
import {
  COUNTRY_PROFILES,
  countryCodeToFlag,
  findCountryProfile,
  getCountryName,
  getDefaultCountryCode,
} from './lib/countries'
import { generateAddresses, toSingleLine } from './lib/generator'
import { exportMimeType, serializeAddresses } from './lib/serialize'
import type { ExportFormat, GeneratedAddress, ResultView, UiLanguage } from './lib/types'
import './address-generator.css'

const NAMESPACE = 'toolAddressGenerator'

function normalizeLanguage(language?: string): UiLanguage {
  return language?.toLowerCase().startsWith('en') ? 'en' : 'zh'
}

const AddressGenerator: React.FC = () => {
  const { t, i18n } = useTranslation(NAMESPACE)
  const language = normalizeLanguage(i18n.resolvedLanguage || i18n.language)
  const [countryCode, setCountryCode] = useState<string>(() => getDefaultCountryCode(i18n.resolvedLanguage || i18n.language))
  const [search, setSearch] = useState('')
  const [count, setCount] = useState(3)
  const [seed, setSeed] = useState('')
  const [randomCountry, setRandomCountry] = useState(false)
  const [view, setView] = useState<ResultView>('cards')
  const [addresses, setAddresses] = useState<GeneratedAddress[]>([])
  const [generation, setGeneration] = useState(0)
  const [generating, setGenerating] = useState(false)

  const selectedProfile = findCountryProfile(countryCode) ?? COUNTRY_PROFILES[0]
  const filteredProfiles = useMemo(() => {
    const query = search.trim().toLocaleLowerCase()
    const matches = COUNTRY_PROFILES.filter((profile) => {
      if (!query) return true
      return [profile.code, profile.nameZh, profile.nameEn, profile.nativeName, profile.locale]
        .some((value) => value.toLocaleLowerCase().includes(query))
    })
    const withSelected = matches.some((profile) => profile.code === selectedProfile.code)
      ? matches
      : [selectedProfile, ...matches]
    return [...withSelected].sort((left, right) =>
      getCountryName(left, language).localeCompare(getCountryName(right, language), language),
    )
  }, [language, search, selectedProfile])

  const copyAllValue = useMemo(
    () => addresses.map((address) => address.formatted).join('\n\n'),
    [addresses],
  )

  const generate = async () => {
    setGenerating(true)
    try {
      const next = await generateAddresses({
        countryCode,
        count,
        seed,
        randomCountry,
        language,
      })
      setAddresses(next)
      setGeneration((value) => value + 1)
    } finally {
      setGenerating(false)
    }
  }

  const download = (format: ExportFormat) => {
    if (addresses.length === 0) return
    const content = serializeAddresses(addresses, format)
    const prefix = format === 'csv' ? '\ufeff' : ''
    const blob = new Blob([prefix, content], { type: exportMimeType(format) })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `synthetic-addresses-${seed.trim() || 'batch'}.${format}`
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    URL.revokeObjectURL(url)
  }

  const resultStatus = addresses.length === 0
    ? t('results.liveEmpty')
    : t('results.liveCount', { count: addresses.length })

  return (
    <div data-testid="address-atlas" className="address-atlas relative w-full min-w-0 overflow-hidden rounded-2xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[var(--atlas-line)]" />
      <div className="relative mx-auto max-w-[1440px]">
        <header className="grid gap-8 pb-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:pb-14">
          <div className="max-w-4xl">
            <p className="mb-4 flex items-center gap-3 text-[0.68rem] font-bold uppercase tracking-[0.26em] text-[var(--atlas-accent-dark)]">
              <span className="h-px w-9 bg-[var(--atlas-accent)]" />
              {t('eyebrow')}
            </p>
            <h1 className="atlas-display max-w-4xl text-4xl font-semibold leading-[0.98] tracking-[-0.035em] text-[var(--atlas-ink)] sm:text-6xl lg:text-7xl">
              {t('title')}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-[var(--atlas-muted)] sm:text-lg">
              {t('description')}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 lg:max-w-sm lg:justify-end">
            <MetaBadge icon={Globe2} label={t('coverage', { count: COUNTRY_PROFILES.length })} />
            <MetaBadge icon={Laptop} label={t('localOnly')} />
            <MetaBadge icon={Hash} label={t('repeatable')} />
          </div>
        </header>

        <main className="grid min-w-0 gap-6 xl:grid-cols-[390px_minmax(0,1fr)]">
          <section className="atlas-panel h-fit min-w-0 rounded-[1.4rem] p-5 sm:p-6 xl:sticky xl:top-6" aria-labelledby="generator-settings-title">
            <SectionHeading
              icon={MapPinned}
              step={t('controls.step')}
              title={t('controls.title')}
              id="generator-settings-title"
            />

            <div className="mt-7 space-y-6">
              <div className="space-y-3">
                <label htmlFor="country-search" className="block text-xs font-bold uppercase tracking-[0.16em] text-[var(--atlas-muted)]">
                  {t('controls.search')}
                </label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--atlas-muted)]" />
                  <input
                    id="country-search"
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder={t('controls.searchPlaceholder')}
                    aria-label={t('controls.search')}
                    className="atlas-input w-full rounded-xl py-3 pl-10 pr-3 text-sm"
                  />
                </div>
                <select
                  value={countryCode}
                  onChange={(event) => setCountryCode(event.target.value)}
                  disabled={randomCountry}
                  aria-label={t('controls.country')}
                  className="atlas-input w-full rounded-xl px-3 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {filteredProfiles.map((profile) => (
                    <option key={profile.code} value={profile.code}>
                      {countryCodeToFlag(profile.code)} {getCountryName(profile, language)} · {profile.nativeName} · {profile.code}
                    </option>
                  ))}
                </select>
              </div>

              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[var(--atlas-line)] bg-[color-mix(in_srgb,var(--atlas-sea)_6%,transparent)] p-3.5">
                <input
                  type="checkbox"
                  checked={randomCountry}
                  onChange={(event) => setRandomCountry(event.target.checked)}
                  aria-label={t('controls.randomCountry')}
                  className="mt-0.5 h-4 w-4 rounded border-[var(--atlas-line)] accent-[var(--atlas-accent)]"
                />
                <span>
                  <span className="block text-sm font-bold text-[var(--atlas-ink)]">{t('controls.randomCountry')}</span>
                  <span className="mt-1 block text-xs leading-5 text-[var(--atlas-muted)]">{t('controls.randomCountryHint')}</span>
                </span>
              </label>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                <label className="block">
                  <span className="block text-xs font-bold uppercase tracking-[0.16em] text-[var(--atlas-muted)]">{t('controls.quantity')}</span>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={count}
                    onChange={(event) => setCount(Math.max(1, Math.min(50, Number(event.target.value) || 1)))}
                    aria-label={t('controls.quantity')}
                    className="atlas-input mt-3 w-full rounded-xl px-3 py-3 text-sm tabular-nums"
                  />
                  <span className="mt-1.5 block text-xs text-[var(--atlas-muted)]">{t('controls.quantityHint')}</span>
                </label>

                <label className="block sm:col-span-1 xl:col-span-1 2xl:col-span-1">
                  <span className="block text-xs font-bold uppercase tracking-[0.16em] text-[var(--atlas-muted)]">{t('controls.seed')}</span>
                  <input
                    type="text"
                    value={seed}
                    onChange={(event) => setSeed(event.target.value)}
                    placeholder={t('controls.seedPlaceholder')}
                    aria-label={t('controls.seed')}
                    spellCheck={false}
                    className="atlas-input mt-3 w-full rounded-xl px-3 py-3 font-mono text-sm"
                  />
                  <span className="mt-1.5 block text-xs text-[var(--atlas-muted)]">{t('controls.seedHint')}</span>
                </label>
              </div>

              <button
                type="button"
                onClick={() => void generate()}
                disabled={generating}
                className="atlas-generate mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-black uppercase tracking-[0.11em] transition disabled:cursor-wait disabled:opacity-70"
              >
                {generating ? <RefreshCw className="h-4 w-4 animate-spin" /> : addresses.length > 0 ? <RefreshCw className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                {generating ? t('controls.generating') : addresses.length > 0 ? t('controls.regenerate') : t('controls.generate')}
              </button>
            </div>
          </section>

          <section className="atlas-panel min-w-0 rounded-[1.4rem] p-4 sm:p-6" aria-labelledby="address-results-title">
            <div className="flex flex-col gap-5 border-b border-[var(--atlas-line)] pb-5 2xl:flex-row 2xl:items-end 2xl:justify-between">
              <SectionHeading
                icon={Layers3}
                step={t('results.step')}
                title={t('results.title')}
                id="address-results-title"
                detail={addresses.length > 0 ? t('results.count', { count: addresses.length }) : undefined}
              />

              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <div className="flex rounded-xl border border-[var(--atlas-line)] p-1" aria-label={t('results.title')}>
                  <ViewButton active={view === 'cards'} onClick={() => setView('cards')} icon={Layers3} label={t('results.cards')} />
                  <ViewButton active={view === 'singleLine'} onClick={() => setView('singleLine')} icon={Rows3} label={t('results.singleLine')} />
                  <ViewButton active={view === 'json'} onClick={() => setView('json')} icon={Braces} label={t('results.json')} />
                </div>
                {addresses.length > 0 ? (
                  <CopyButton
                    value={copyAllValue}
                    variant="button"
                    size="sm"
                    label={t('results.copyAll')}
                    copiedLabel={t('results.copied')}
                    className="!border-[var(--atlas-line)] !bg-transparent !text-[var(--atlas-ink)] hover:!bg-[color-mix(in_srgb,var(--atlas-sea)_10%,transparent)]"
                  />
                ) : (
                  <button
                    type="button"
                    disabled
                    className="rounded-lg border border-[var(--atlas-line)] px-3 py-1.5 text-xs font-bold text-[var(--atlas-muted)] opacity-35"
                  >
                    {t('results.copyAll')}
                  </button>
                )}
              </div>
            </div>

            <p className="sr-only" aria-live="polite">{resultStatus}</p>

            {addresses.length === 0 ? (
              <EmptyResults title={t('results.emptyTitle')} body={t('results.emptyBody')} />
            ) : (
              <div key={generation} className="atlas-results-enter min-w-0 py-6">
                {view === 'cards' && (
                  <div className="grid min-w-0 gap-4 md:grid-cols-2 2xl:grid-cols-3">
                    {addresses.map((address, index) => (
                      <AddressCard
                        key={address.id}
                        address={address}
                        index={index}
                        locale={findCountryProfile(address.countryCode)?.locale ?? address.countryCode}
                        t={t}
                      />
                    ))}
                  </div>
                )}

                {view === 'singleLine' && (
                  <ol className="space-y-2">
                    {addresses.map((address, index) => (
                      <li key={address.id} className="flex min-w-0 items-start gap-3 rounded-xl border border-[var(--atlas-line)] bg-[var(--atlas-card)] p-3.5">
                        <span className="shrink-0 font-mono text-xs text-[var(--atlas-muted)]">{String(index + 1).padStart(2, '0')}</span>
                        <code className="min-w-0 flex-1 whitespace-pre-wrap break-words text-sm leading-6 text-[var(--atlas-ink)]">{toSingleLine(address)}</code>
                        <CopyButton value={toSingleLine(address)} label={t('results.copyOne')} copiedLabel={t('results.copied')} />
                      </li>
                    ))}
                  </ol>
                )}

                {view === 'json' && (
                  <pre data-testid="json-output" className="max-h-[720px] min-w-0 overflow-auto rounded-2xl bg-[#122126] p-4 text-xs leading-6 text-[#e8eee8] sm:p-5 sm:text-sm">
                    {serializeAddresses(addresses, 'json')}
                  </pre>
                )}
              </div>
            )}

            <div className="flex flex-col gap-4 border-t border-[var(--atlas-line)] pt-5 2xl:flex-row 2xl:items-center 2xl:justify-between">
              <div className="flex max-w-2xl items-start gap-3 text-[var(--atlas-muted)]">
                <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-[var(--atlas-accent)]" />
                <div>
                  <h3 className="text-sm font-bold text-[var(--atlas-ink)]">{t('disclaimer.title')}</h3>
                  <p className="mt-1 text-xs leading-5">{t('disclaimer.body')}</p>
                </div>
              </div>

              <div className="flex shrink-0 flex-wrap gap-2">
                {(['json', 'csv', 'txt'] as ExportFormat[]).map((format) => (
                  <button
                    key={format}
                    type="button"
                    onClick={() => download(format)}
                    disabled={addresses.length === 0}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--atlas-line)] px-3 py-2 text-xs font-bold text-[var(--atlas-ink)] transition hover:border-[var(--atlas-sea)] hover:bg-[color-mix(in_srgb,var(--atlas-sea)_9%,transparent)] disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    <Download className="h-3.5 w-3.5" />
                    {t('results.download', { format: format.toUpperCase() })}
                  </button>
                ))}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}

function MetaBadge({ icon: Icon, label }: { icon: React.ComponentType<{ className?: string }>; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[var(--atlas-line)] bg-[color-mix(in_srgb,var(--atlas-card)_72%,transparent)] px-3 py-2 text-xs font-bold text-[var(--atlas-ink)]">
      <Icon className="h-3.5 w-3.5 text-[var(--atlas-sea)]" />
      {label}
    </span>
  )
}

function SectionHeading({
  icon: Icon,
  step,
  title,
  id,
  detail,
}: {
  icon: React.ComponentType<{ className?: string }>
  step: string
  title: string
  id: string
  detail?: string
}) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--atlas-sea)_13%,transparent)] text-[var(--atlas-sea)]">
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="text-[0.64rem] font-black uppercase tracking-[0.2em] text-[var(--atlas-accent-dark)]">{step}</p>
        <h2 id={id} className="atlas-display mt-1 text-2xl font-semibold leading-tight text-[var(--atlas-ink)]">{title}</h2>
        {detail && <p className="mt-1 text-xs text-[var(--atlas-muted)]">{detail}</p>}
      </div>
    </div>
  )
}

function ViewButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: React.ComponentType<{ className?: string }>
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={label}
      className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold transition sm:px-3 ${
        active
          ? 'bg-[var(--atlas-ink)] text-[var(--atlas-card)]'
          : 'text-[var(--atlas-muted)] hover:text-[var(--atlas-ink)]'
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      <span>{label}</span>
    </button>
  )
}

function EmptyResults({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex min-h-[390px] items-center justify-center py-10 text-center">
      <div className="max-w-sm">
        <div className="atlas-stamp mx-auto flex h-28 w-28 items-center justify-center rounded-full">
          <ShieldCheck className="h-10 w-10" />
        </div>
        <h3 className="atlas-display mt-7 text-2xl font-semibold text-[var(--atlas-ink)]">{title}</h3>
        <p className="mt-3 text-sm leading-6 text-[var(--atlas-muted)]">{body}</p>
      </div>
    </div>
  )
}

function AddressCard({
  address,
  index,
  locale,
  t,
}: {
  address: GeneratedAddress
  index: number
  locale: string
  t: ReturnType<typeof useTranslation>['t']
}) {
  const fields = [
    [t('fields.line1'), address.addressLine1],
    [t('fields.line2'), address.addressLine2],
    [t('fields.city'), address.city],
    [t('fields.region'), address.region],
    [t('fields.postalCode'), address.postalCode],
  ].filter((entry): entry is [string, string] => Boolean(entry[1]))

  return (
    <article className="atlas-address-card min-w-0 rounded-2xl p-4 sm:p-5">
      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="text-3xl" aria-hidden="true">{countryCodeToFlag(address.countryCode)}</span>
          <div className="min-w-0">
            <p className="truncate text-sm font-black text-[var(--atlas-ink)]">{address.countryName}</p>
            <p className="mt-0.5 font-mono text-[0.66rem] uppercase tracking-[0.13em] text-[var(--atlas-muted)]">
              {address.countryCode} · {t('results.locale', { locale })}
            </p>
          </div>
        </div>
        <span className="atlas-stamp relative z-10 shrink-0 rounded-full px-2 py-1 font-mono text-[0.62rem] font-bold uppercase">
          {t('results.record', { index: String(index + 1).padStart(2, '0') })}
        </span>
      </div>

      <pre data-testid="address-formatted" className="atlas-display relative z-10 mt-5 min-w-0 whitespace-pre-wrap break-words border-y border-dashed border-[var(--atlas-line)] py-4 text-base font-semibold leading-7 text-[var(--atlas-ink)]">
        {address.formatted}
      </pre>

      <dl className="relative z-10 mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
        {fields.map(([label, value]) => (
          <div key={label} className="min-w-0">
            <dt className="text-[0.62rem] font-black uppercase tracking-[0.12em] text-[var(--atlas-muted)]">{label}</dt>
            <dd className="mt-1 break-words text-xs leading-5 text-[var(--atlas-ink)]">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="relative z-10 mt-4 flex justify-end">
        <CopyButton
          value={address.formatted}
          variant="button"
          size="sm"
          label={t('results.copyOne')}
          copiedLabel={t('results.copied')}
          className="!border-0 !bg-transparent !px-1 !text-[var(--atlas-sea)] shadow-none hover:!text-[var(--atlas-accent-dark)]"
        />
      </div>
    </article>
  )
}

export default AddressGenerator
