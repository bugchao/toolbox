import React, { useMemo, useState } from 'react'
import { Button, Card, Input, NoticeCard, PageHero, ParticlesBackground, TextArea } from '@toolbox/ui-kit'
import { useTranslation } from 'react-i18next'
import { Check, ClipboardCopy, KeySquare, RefreshCw, ShieldCheck, ShieldX } from 'lucide-react'
import {
  buildClaimsTemplate,
  parsePayload,
  signJwt,
  verifyJwt,
  type HsAlg,
  type SecretEncoding,
} from './lib/jwt'

const ALGS: HsAlg[] = ['HS256', 'HS384', 'HS512']

const JwtBuilder: React.FC = () => {
  const { t } = useTranslation('toolJwtBuilder')
  const [alg, setAlg] = useState<HsAlg>('HS256')
  const [payloadText, setPayloadText] = useState(() => JSON.stringify(buildClaimsTemplate(), null, 2))
  const [headerExtraText, setHeaderExtraText] = useState('')
  const [secret, setSecret] = useState('your-256-bit-secret')
  const [secretEncoding, setSecretEncoding] = useState<SecretEncoding>('utf8')
  const [token, setToken] = useState('')
  const [signError, setSignError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // 验证 Tab 状态
  const [verifyToken, setVerifyToken] = useState('')
  const [verifySecret, setVerifySecret] = useState('')
  const [verifyOut, setVerifyOut] = useState<{ valid: boolean; alg: string } | { error: string } | null>(null)

  const payloadCheck = useMemo(() => parsePayload(payloadText), [payloadText])
  const headerCheck = useMemo(() => {
    if (!headerExtraText.trim()) return { ok: true as const, value: undefined }
    try {
      const v = JSON.parse(headerExtraText)
      if (v === null || typeof v !== 'object' || Array.isArray(v)) {
        return { ok: false as const, message: t('error.headerMustBeObject') }
      }
      return { ok: true as const, value: v as Record<string, unknown> }
    } catch {
      return { ok: false as const, message: t('error.headerBadJson') }
    }
  }, [headerExtraText, t])

  const onSign = async () => {
    setSignError(null)
    setToken('')
    if (!payloadCheck.ok) {
      setSignError(t(`error.${payloadCheck.message}`, { defaultValue: payloadCheck.message }))
      return
    }
    if (!headerCheck.ok) { setSignError(headerCheck.message); return }
    const r = await signJwt({
      alg,
      payload: payloadCheck.payload,
      headerExtra: headerCheck.value,
      secret,
      secretEncoding,
    })
    if (r.ok) setToken(r.token)
    else setSignError(t(`error.${r.message}`, { defaultValue: r.message }))
  }

  const onRefreshTimestamps = () => {
    if (!payloadCheck.ok) return
    const now = Math.floor(Date.now() / 1000)
    const next = { ...payloadCheck.payload }
    if ('iat' in next) next.iat = now
    if ('exp' in next) {
      const oldIat = typeof payloadCheck.payload.iat === 'number' ? payloadCheck.payload.iat : now
      const oldExp = typeof payloadCheck.payload.exp === 'number' ? payloadCheck.payload.exp : now + 3600
      next.exp = now + Math.max(60, oldExp - oldIat)
    }
    setPayloadText(JSON.stringify(next, null, 2))
  }

  const onCopy = async () => {
    if (!token) return
    try {
      await navigator.clipboard.writeText(token)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1200)
    } catch { /* ignore */ }
  }

  const onVerify = async () => {
    setVerifyOut(null)
    const r = await verifyJwt(verifyToken, verifySecret, secretEncoding)
    if (r.ok) setVerifyOut({ valid: r.valid, alg: r.alg ?? '?' })
    else setVerifyOut({ error: t(`error.${r.message}`, { defaultValue: r.message }) })
  }

  const tokenParts = token ? token.split('.') : null

  return (
    <div className="relative min-h-[60vh]">
      <ParticlesBackground preset="minimal" className="absolute inset-0" />
      <div className="relative z-10 space-y-6">
        <PageHero title={t('title')} description={t('description')} />

        <NoticeCard
          tone="warning"
          title={t('notice.title')}
          description={t('notice.body')}
          icon={KeySquare}
        />

        <Card>
          <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
            {t('sign.heading')}
          </h2>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-3">
              <div>
                <span className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-200">
                  {t('sign.alg')}
                </span>
                <div className="inline-flex rounded-md border border-gray-200 p-0.5 dark:border-gray-700">
                  {ALGS.map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => setAlg(a)}
                      className={[
                        'rounded px-3 py-1 text-xs font-mono font-medium transition',
                        alg === a
                          ? 'bg-indigo-500 text-white shadow-sm'
                          : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800',
                      ].join(' ')}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-200">
                    {t('sign.payload')}
                  </span>
                  <button
                    type="button"
                    onClick={onRefreshTimestamps}
                    className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <RefreshCw className="h-3 w-3" />
                    {t('sign.refreshTimestamps')}
                  </button>
                </div>
                <TextArea
                  value={payloadText}
                  onChange={(e) => setPayloadText(e.target.value)}
                  rows={8}
                  spellCheck={false}
                  className="!font-mono !text-xs"
                />
                {!payloadCheck.ok && payloadText.trim() && (
                  <p className="mt-1 text-xs text-rose-600 dark:text-rose-300">
                    {t(`error.${payloadCheck.message}`, { defaultValue: payloadCheck.message })}
                  </p>
                )}
              </div>

              <div>
                <span className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-200">
                  {t('sign.headerExtra')}
                </span>
                <TextArea
                  value={headerExtraText}
                  onChange={(e) => setHeaderExtraText(e.target.value)}
                  rows={3}
                  placeholder={'{"kid": "key-1"}'}
                  spellCheck={false}
                  className="!font-mono !text-xs"
                />
                {!headerCheck.ok && (
                  <p className="mt-1 text-xs text-rose-600 dark:text-rose-300">{headerCheck.message}</p>
                )}
              </div>

              <div className="grid grid-cols-[1fr_auto] gap-2">
                <div>
                  <span className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-200">
                    {t('sign.secret')}
                  </span>
                  <Input
                    type="password"
                    value={secret}
                    onChange={(e) => setSecret(e.target.value)}
                    spellCheck={false}
                    autoComplete="off"
                  />
                </div>
                <div>
                  <span className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-200">
                    {t('sign.secretEncoding')}
                  </span>
                  <select
                    value={secretEncoding}
                    onChange={(e) => setSecretEncoding(e.target.value as SecretEncoding)}
                    className="rounded border border-gray-300 bg-white px-2 py-2 text-xs dark:border-gray-700 dark:bg-gray-900"
                  >
                    <option value="utf8">UTF-8</option>
                    <option value="base64">Base64</option>
                  </select>
                </div>
              </div>

              <Button onClick={() => void onSign()} disabled={!payloadCheck.ok || !headerCheck.ok || !secret}>
                <span className="inline-flex items-center gap-1.5">
                  <KeySquare className="h-4 w-4" />
                  {t('sign.cta')}
                </span>
              </Button>
              {signError && (
                <div className="rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:border-rose-700 dark:bg-rose-900/30 dark:text-rose-200">
                  {signError}
                </div>
              )}
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-200">
                  {t('sign.output')}
                </span>
                <button
                  type="button"
                  onClick={() => void onCopy()}
                  disabled={!token}
                  className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-30"
                >
                  {copied ? <Check className="h-3 w-3" /> : <ClipboardCopy className="h-3 w-3" />}
                  {copied ? t('copy.copied') : t('copy.copy')}
                </button>
              </div>
              {tokenParts ? (
                <div className="break-all rounded-md border border-gray-200 bg-gray-50 p-3 font-mono text-xs leading-relaxed dark:border-gray-700 dark:bg-gray-900">
                  <span className="text-rose-600 dark:text-rose-400">{tokenParts[0]}</span>
                  <span className="text-gray-400">.</span>
                  <span className="text-violet-600 dark:text-violet-400">{tokenParts[1]}</span>
                  <span className="text-gray-400">.</span>
                  <span className="text-sky-600 dark:text-sky-400">{tokenParts[2]}</span>
                </div>
              ) : (
                <div className="rounded-md border border-dashed border-gray-300 p-8 text-center text-xs text-gray-400 dark:border-gray-700">
                  {t('sign.empty')}
                </div>
              )}
              {token && (
                <p className="mt-2 text-[11px] text-gray-500 dark:text-gray-400">
                  {t('sign.legend')}
                </p>
              )}
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
            {t('verify.heading')}
          </h2>
          <div className="space-y-3">
            <TextArea
              value={verifyToken}
              onChange={(e) => setVerifyToken(e.target.value)}
              rows={3}
              placeholder={t('verify.tokenPlaceholder')}
              spellCheck={false}
              className="!font-mono !text-xs"
            />
            <div className="flex flex-wrap items-end gap-2">
              <div className="min-w-[240px] flex-1">
                <span className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-200">
                  {t('verify.secret')}
                </span>
                <Input
                  type="password"
                  value={verifySecret}
                  onChange={(e) => setVerifySecret(e.target.value)}
                  spellCheck={false}
                  autoComplete="off"
                />
              </div>
              <Button onClick={() => void onVerify()} disabled={!verifyToken.trim() || !verifySecret}>
                {t('verify.cta')}
              </Button>
            </div>
            {verifyOut && 'error' in verifyOut && (
              <div className="rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:border-rose-700 dark:bg-rose-900/30 dark:text-rose-200">
                {verifyOut.error}
              </div>
            )}
            {verifyOut && 'valid' in verifyOut && (
              verifyOut.valid ? (
                <div className="inline-flex items-center gap-2 rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs text-emerald-800 dark:border-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200">
                  <ShieldCheck className="h-4 w-4" />
                  {t('verify.valid', { alg: verifyOut.alg })}
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:border-rose-700 dark:bg-rose-900/30 dark:text-rose-200">
                  <ShieldX className="h-4 w-4" />
                  {t('verify.invalid')}
                </div>
              )
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}

export default JwtBuilder
