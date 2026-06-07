import React, { useMemo, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Button,
  Card,
  DataTable,
  NoticeCard,
  PageHero,
  ParticlesBackground,
  PropertyGrid,
  TextArea,
} from '@toolbox/ui-kit'
import type { DataTableColumn, PropertyGridItem } from '@toolbox/ui-kit'
import {
  Cookie,
  Copy,
  Check,
  ShieldCheck,
  ShieldOff,
  ShieldAlert,
  Info as InfoIcon,
} from 'lucide-react'
import { parseCookieHeader } from './lib/parseCookie'
import type { CookieItem } from './lib/parseCookie'
import { parseSetCookieHeader, formatRelative } from './lib/parseSetCookie'
import type { SetCookieItem, SetCookieWarning } from './lib/parseSetCookie'

type Mode = 'cookie' | 'setCookie'

const COOKIE_SAMPLES = [
  'sessionid=abc123; theme=dark; lang=zh-CN',
  '_ga=GA1.2.987654321.1700000000; _gid=GA1.2.123456789.1700000000; token=eyJhbGciOiJIUzI1NiJ9=padding',
]

const SET_COOKIE_SAMPLES = [
  [
    'sid=abc123; Path=/; Domain=example.com; Expires=Wed, 09 Jun 2099 10:18:14 GMT; Max-Age=31536000; Secure; HttpOnly; SameSite=Strict',
    'theme=dark; Path=/; Max-Age=2592000; SameSite=Lax',
  ].join('\n'),
  [
    'authToken=eyJ...; Path=/; SameSite=None',
    'tracker=qwerty; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT',
  ].join('\n'),
]

function useCopy(): [string | null, (key: string, text: string) => void] {
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const copy = useCallback((key: string, text: string) => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) return
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopiedKey(key)
        window.setTimeout(() => setCopiedKey((cur) => (cur === key ? null : cur)), 1500)
      })
      .catch(() => {
        /* noop */
      })
  }, [])
  return [copiedKey, copy]
}

function relativeLabel(
  rel: ReturnType<typeof formatRelative>,
  t: (key: string, opts?: Record<string, unknown>) => string,
): string {
  const unitKey = `unit.${rel.unit}`
  const unit = t(unitKey)
  const tpl = rel.past ? 'relative.past' : 'relative.future'
  return t(tpl, { amount: rel.amount, unit })
}

const ModeTab: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({
  active,
  onClick,
  children,
}) => (
  <button
    type="button"
    onClick={onClick}
    className={[
      'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
      active
        ? 'bg-indigo-600 text-white shadow-sm'
        : 'bg-white dark:bg-gray-800 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 border border-gray-200 dark:border-gray-700',
    ].join(' ')}
  >
    {children}
  </button>
)

const warningStyles: Record<SetCookieWarning['level'], string> = {
  info: 'border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-800 dark:bg-sky-950/30 dark:text-sky-100',
  warning:
    'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100',
  danger:
    'border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-100',
}

const warningIcons: Record<SetCookieWarning['level'], React.ComponentType<{ className?: string }>> = {
  info: InfoIcon,
  warning: ShieldAlert,
  danger: ShieldOff,
}

const CookieParser: React.FC = () => {
  const { t } = useTranslation('toolCookieParser')
  const [mode, setMode] = useState<Mode>('cookie')
  const [cookieInput, setCookieInputValue] = useState('')
  const [setCookieRaw, setSetCookieRaw] = useState('')
  const [copiedKey, copy] = useCopy()

  const cookieResult = useMemo(() => parseCookieHeader(cookieInput), [cookieInput])
  const setCookieResult = useMemo(() => parseSetCookieHeader(setCookieRaw), [setCookieRaw])

  const cookieItems: CookieItem[] = cookieResult.ok ? cookieResult.items : []
  const setCookieItems: SetCookieItem[] = setCookieResult.ok ? setCookieResult.items : []

  const cookieColumns: DataTableColumn<CookieItem & { _i: number }>[] = [
    {
      key: 'name',
      header: t('cookieTable.name'),
      className: 'font-mono text-gray-900 dark:text-gray-100',
      cell: (row) => row.name,
    },
    {
      key: 'value',
      header: t('cookieTable.value'),
      className: 'font-mono break-all',
      cell: (row) => row.value || <span className="text-gray-400">(empty)</span>,
    },
    {
      key: 'length',
      header: t('cookieTable.length'),
      className: 'tabular-nums text-gray-500 dark:text-gray-400',
      cell: (row) => row.value.length,
    },
    {
      key: 'op',
      header: t('cookieTable.action'),
      cell: (row) => {
        const key = `cookie-${row._i}`
        const text = `${row.name}=${row.value}`
        return (
          <Button size="sm" variant="ghost" onClick={() => copy(key, text)}>
            {copiedKey === key ? (
              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <Check className="h-4 w-4" /> {t('copied')}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1">
                <Copy className="h-4 w-4" /> {t('copy')}
              </span>
            )}
          </Button>
        )
      },
    },
  ]

  const currentInput = mode === 'cookie' ? cookieInput : setCookieRaw
  const currentSamples = mode === 'cookie' ? COOKIE_SAMPLES : SET_COOKIE_SAMPLES

  return (
    <div className="relative min-h-[60vh]">
      <ParticlesBackground preset="minimal" className="absolute inset-0" />
      <div className="relative z-10 mx-auto max-w-5xl space-y-6 px-4 py-6">
        <PageHero icon={Cookie} title={t('title')} description={t('description')} />

        <NoticeCard
          tone="info"
          icon={ShieldCheck}
          title={t('localOnly.title')}
          description={t('localOnly.description')}
        />

        {/* Mode tabs */}
        <div className="flex flex-wrap gap-2">
          <ModeTab active={mode === 'cookie'} onClick={() => setMode('cookie')}>
            {t('modes.cookie')}
          </ModeTab>
          <ModeTab active={mode === 'setCookie'} onClick={() => setMode('setCookie')}>
            {t('modes.setCookie')}
          </ModeTab>
        </div>

        {/* Input card */}
        <Card>
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {mode === 'cookie' ? t('input.cookieLabel') : t('input.setCookieLabel')}
              </label>
              <span className="text-xs text-gray-500 dark:text-gray-400 tabular-nums">
                {t('input.charCount', { n: currentInput.length })}
              </span>
            </div>
            <TextArea
              rows={mode === 'cookie' ? 4 : 8}
              value={currentInput}
              onChange={(e) =>
                mode === 'cookie' ? setCookieInputValue(e.target.value) : setSetCookieRaw(e.target.value)
              }
              placeholder={mode === 'cookie' ? t('input.cookiePlaceholder') : t('input.setCookiePlaceholder')}
              className="font-mono text-sm"
            />
            <div className="flex flex-wrap gap-2">
              {currentSamples.map((sample, idx) => (
                <Button
                  key={idx}
                  size="sm"
                  variant="secondary"
                  onClick={() =>
                    mode === 'cookie' ? setCookieInputValue(sample) : setSetCookieRaw(sample)
                  }
                >
                  {t('input.sample', { n: idx + 1 })}
                </Button>
              ))}
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  mode === 'cookie' ? setCookieInputValue('') : setSetCookieRaw('')
                }
                disabled={!currentInput}
              >
                {t('input.clear')}
              </Button>
              <span aria-hidden className="hidden">{String(setCurrentInput)}</span>
            </div>
          </div>
        </Card>

        {/* Results */}
        {mode === 'cookie' ? (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              {t('results.cookieTitle', { n: cookieItems.length })}
            </h2>
            <DataTable
              columns={cookieColumns}
              rows={cookieItems.map((item, i) => ({ ...item, _i: i }))}
              rowKey={(row) => `cookie-${row._i}`}
              emptyText={t('results.empty')}
            />
            {cookieResult.ok && cookieResult.skipped > 0 ? (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t('results.skipped', { n: cookieResult.skipped })}
              </p>
            ) : null}
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              {t('results.setCookieTitle', { n: setCookieItems.length })}
            </h2>
            {setCookieItems.length === 0 ? (
              <Card>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('results.empty')}</p>
              </Card>
            ) : (
              setCookieItems.map((item, idx) => {
                const key = `set-${idx}`
                const propItems: PropertyGridItem[] = [
                  {
                    label: t('attrs.domain'),
                    value: item.attrs.domain || t('attrs.notSet'),
                  },
                  {
                    label: t('attrs.path'),
                    value: item.attrs.path || t('attrs.notSet'),
                  },
                  {
                    label: t('attrs.expires'),
                    value:
                      typeof item.attrs.expiresDate === 'number'
                        ? (
                            <div>
                              <div className="font-mono text-xs break-all">
                                {new Date(item.attrs.expiresDate).toISOString()}
                              </div>
                              <div className="mt-1 text-xs opacity-70">
                                {relativeLabel(formatRelative(item.attrs.expiresDate), t)}
                              </div>
                            </div>
                          )
                        : item.attrs.expires || t('attrs.notSet'),
                    tone:
                      typeof item.attrs.expiresDate === 'number' && item.attrs.expiresDate < Date.now()
                        ? 'warning'
                        : 'default',
                  },
                  {
                    label: t('attrs.maxAge'),
                    value:
                      typeof item.attrs.maxAge === 'number'
                        ? (
                            <div>
                              <div className="font-mono">{item.attrs.maxAge}s</div>
                              <div className="mt-1 text-xs opacity-70">
                                {relativeLabel(formatRelative(Date.now() + item.attrs.maxAge * 1000), t)}
                              </div>
                            </div>
                          )
                        : t('attrs.notSet'),
                  },
                  {
                    label: t('attrs.secure'),
                    value: item.attrs.secure ? '✓' : '—',
                    tone: item.attrs.secure ? 'success' : 'default',
                  },
                  {
                    label: t('attrs.httpOnly'),
                    value: item.attrs.httpOnly ? '✓' : '—',
                    tone: item.attrs.httpOnly ? 'success' : 'default',
                  },
                  {
                    label: t('attrs.sameSite'),
                    value: item.attrs.sameSite || t('attrs.notSet'),
                    tone:
                      item.attrs.sameSite === 'None' && !item.attrs.secure
                        ? 'danger'
                        : item.attrs.sameSite
                          ? 'primary'
                          : 'default',
                  },
                  {
                    label: t('attrs.priority'),
                    value: item.attrs.priority || t('attrs.notSet'),
                  },
                  {
                    label: t('attrs.partitioned'),
                    value: item.attrs.partitioned ? '✓' : '—',
                  },
                ]

                return (
                  <Card key={key}>
                    <div className="space-y-4">
                      {/* name + value */}
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-medium uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
                            {t('cookieTable.name')}
                          </div>
                          <div className="mt-1 font-mono text-lg font-semibold text-gray-900 dark:text-gray-100 break-all">
                            {item.name}
                          </div>
                          <div className="mt-3 text-xs font-medium uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
                            {t('cookieTable.value')}
                          </div>
                          <div className="mt-1 font-mono text-base text-gray-800 dark:text-gray-200 break-all">
                            {item.value || <span className="text-gray-400">(empty)</span>}
                          </div>
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => copy(key, `${item.name}=${item.value}`)}>
                          {copiedKey === key ? (
                            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                              <Check className="h-4 w-4" /> {t('copied')}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1">
                              <Copy className="h-4 w-4" /> {t('copy')}
                            </span>
                          )}
                        </Button>
                      </div>

                      {/* attrs */}
                      <PropertyGrid items={propItems} />

                      {/* warnings */}
                      {item.warnings.length > 0 ? (
                        <div className="space-y-2">
                          {item.warnings.map((w, wi) => {
                            const Icon = warningIcons[w.level]
                            return (
                              <div
                                key={`${key}-w-${wi}`}
                                className={[
                                  'flex items-start gap-2 rounded-xl border px-3 py-2 text-sm',
                                  warningStyles[w.level],
                                ].join(' ')}
                              >
                                <Icon className="mt-0.5 h-4 w-4 flex-shrink-0" />
                                <span>{t(`warnings.${w.key}`)}</span>
                              </div>
                            )
                          })}
                        </div>
                      ) : null}
                    </div>
                  </Card>
                )
              })
            )}
            {setCookieResult.ok && setCookieResult.skipped > 0 ? (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t('results.skipped', { n: setCookieResult.skipped })}
              </p>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}

export default CookieParser
