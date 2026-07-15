import React, { useState } from 'react'
import { PageHero, Button, Input, Card, StatusBadge } from '@toolbox/ui-kit'
import type { StatusLevel } from '@toolbox/ui-kit'
import { ShieldCheck, Loader2, AlertCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface ModuleBase {
  ok: boolean
  error?: string
}

interface HttpsModule extends ModuleBase {
  grade: string
  reasons: string[]
  suggestions: string[]
  protocols: Record<string, boolean | null>
  negotiatedProtocol: string
  cipher: string
  cert: {
    subject: { CN?: string; O?: string }
    issuer: { CN?: string; O?: string }
    validFrom: string
    validTo: string
    daysRemaining: number
    selfSigned: boolean
    san: string[]
    chain: Array<{ subject: string; issuer: string }>
  }
}

interface Ipv6Module extends ModuleBase {
  deployed: boolean
  addresses: string[]
  httpsReachable: boolean
}

interface CdnModule extends ModuleBase {
  usesCdn: boolean
  vendor: string | null
  evidence: string | null
  cnames: string[]
}

interface MailModule extends ModuleBase {
  hasMx: boolean
  mxHost: string | null
  startTls?: boolean
  cert?: { subject: string; issuer: string; validTo: string | null } | null
}

interface GmModule extends ModuleBase {
  supported: boolean
  cipherSuite?: string
}

interface PqcModule extends ModuleBase {
  supported: boolean
  group?: string
  viaHelloRetry?: boolean
}

interface Report {
  domain: string
  port: number
  grade: string | null
  modules: {
    https: HttpsModule
    ipv6: Ipv6Module
    cdn: CdnModule
    mail: MailModule
    gm: GmModule
    pqc: PqcModule
  }
  timestamp: string
}

function gradeColor(grade: string | null): string {
  if (!grade) return 'text-gray-400'
  if (grade.startsWith('A')) return 'text-green-600 dark:text-green-400'
  if (grade === 'B' || grade === 'C') return 'text-blue-600 dark:text-blue-400'
  if (grade === 'D' || grade === 'E') return 'text-amber-600 dark:text-amber-400'
  return 'text-red-600 dark:text-red-400'
}

const ModuleCard: React.FC<{ title: string; children: React.ReactNode; error?: string }> = ({ title, children, error }) => {
  const { t } = useTranslation('toolHttpsInspector')
  return (
    <Card className="p-4 bg-gray-50 dark:bg-gray-800">
      <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">{title}</h4>
      {error ? (
        <p className="text-sm text-red-500 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {t('moduleError')}：{error}
        </p>
      ) : (
        children
      )}
    </Card>
  )
}

const Row: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="text-sm">
    <span className="text-gray-500">{label}：</span>
    <span className="font-mono break-all">{children}</span>
  </div>
)

export default function HttpsInspector() {
  const { t } = useTranslation('toolHttpsInspector')
  const [domain, setDomain] = useState('')
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState<Report | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleCheck = async () => {
    const input = domain.trim().replace(/^https?:\/\//, '').split('/')[0]
    if (!input) return
    setLoading(true)
    setError(null)
    setReport(null)
    try {
      const res = await fetch('/api/https-inspector/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: input }),
      })
      const raw = await res.text()
      let data: Report | { error?: string } | null = null
      try {
        data = raw ? JSON.parse(raw) : null
      } catch {
        throw new Error('服务返回了非 JSON 响应')
      }
      if (!res.ok) throw new Error((data && 'error' in data && data.error) || '请求失败')
      if (!data || !('modules' in data)) throw new Error('服务返回了空响应')
      setReport(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : '请求失败')
    } finally {
      setLoading(false)
    }
  }

  const m = report?.modules

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <PageHero icon={ShieldCheck} title={t('title')} description={t('description')} />

        <Card className="max-w-4xl mx-auto mt-8 p-6">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder={t('inputPlaceholder')}
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCheck()}
              className="flex-1"
              disabled={loading}
            />
            <Button onClick={handleCheck} disabled={loading || !domain.trim()} className="min-w-[100px]">
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t('checking')}</> : t('check')}
            </Button>
          </div>

          {error && (
            <div className="mt-4 flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
            </div>
          )}

          {report && m && (
            <div className="mt-6 space-y-4">
              {/* 综合评级 */}
              <div className="flex items-center justify-between p-5 rounded-lg bg-gray-50 dark:bg-gray-800">
                <div>
                  <p className="text-sm text-gray-500">{t('gradeLabel')}</p>
                  <p className="font-mono text-lg">{report.domain}</p>
                </div>
                <span className={`text-5xl font-bold ${gradeColor(report.grade)}`}>{report.grade ?? '—'}</span>
              </div>

              {/* HTTPS 评级 */}
              <ModuleCard title={t('modules.https')} error={m.https.ok ? undefined : m.https.error}>
                {m.https.ok && (
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {(['tls13', 'tls12', 'tls11', 'tls10'] as const).map((k) => (
                        <StatusBadge
                          key={k}
                          level={m.https.protocols[k] ? 'success' : 'neutral'}
                          label={`${k.replace('tls1', 'TLS 1.')} ${m.https.protocols[k] ? '✓' : '✗'}`}
                        />
                      ))}
                    </div>
                    <Row label={t('https.negotiated')}>{m.https.negotiatedProtocol}</Row>
                    <Row label={t('https.cipher')}>{m.https.cipher}</Row>
                    <Row label={t('https.cert')}>
                      {m.https.cert.subject.CN || m.https.cert.subject.O || '-'} ← {m.https.cert.issuer.CN || m.https.cert.issuer.O || '-'}
                    </Row>
                    <Row label={t('https.validity')}>
                      {new Date(m.https.cert.validTo).toLocaleDateString()}（{t('https.daysRemaining', { days: m.https.cert.daysRemaining })}）
                    </Row>
                    {m.https.cert.chain.length > 0 && (
                      <Row label={t('https.chain')}>{m.https.cert.chain.map((c) => c.subject).join(' → ')}</Row>
                    )}
                    {m.https.reasons.length > 0 && (
                      <div className="text-sm text-amber-600 dark:text-amber-400">
                        {t('https.reasons')}：{m.https.reasons.join('；')}
                      </div>
                    )}
                    {m.https.suggestions.length > 0 && (
                      <div className="text-sm text-gray-500">
                        {t('https.suggestions')}：{m.https.suggestions.join('；')}
                      </div>
                    )}
                  </div>
                )}
              </ModuleCard>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* IPv6 */}
                <ModuleCard title={t('modules.ipv6')} error={m.ipv6.ok ? undefined : m.ipv6.error}>
                  {m.ipv6.ok && (
                    <div className="space-y-2">
                      <StatusBadge level={m.ipv6.deployed ? 'success' : 'neutral'} label={m.ipv6.deployed ? t('ipv6.deployed') : t('ipv6.notDeployed')} />
                      {m.ipv6.deployed && (
                        <>
                          <StatusBadge level={m.ipv6.httpsReachable ? 'success' : 'danger'} label={m.ipv6.httpsReachable ? t('ipv6.reachable') : t('ipv6.unreachable')} />
                          <Row label={t('ipv6.addresses')}>{m.ipv6.addresses.join(', ')}</Row>
                        </>
                      )}
                    </div>
                  )}
                </ModuleCard>

                {/* CDN */}
                <ModuleCard title={t('modules.cdn')} error={m.cdn.ok ? undefined : m.cdn.error}>
                  {m.cdn.ok && (
                    <div className="space-y-2">
                      <StatusBadge level={m.cdn.usesCdn ? 'info' : 'neutral'} label={m.cdn.usesCdn ? t('cdn.uses') : t('cdn.none')} />
                      {m.cdn.vendor && <Row label={t('cdn.vendor')}>{m.cdn.vendor}</Row>}
                      {m.cdn.evidence && <Row label={t('cdn.evidence')}>{m.cdn.evidence}</Row>}
                      {m.cdn.cnames.length > 0 && <Row label={t('cdn.cname')}>{m.cdn.cnames.join(', ')}</Row>}
                      <p className="text-xs text-gray-400">{t('singleVantagePoint')}</p>
                    </div>
                  )}
                </ModuleCard>

                {/* 邮件服务器 */}
                <ModuleCard title={t('modules.mail')} error={m.mail.ok ? undefined : m.mail.error}>
                  {m.mail.ok && (
                    m.mail.hasMx ? (
                      <div className="space-y-2">
                        <Row label={t('mail.mxHost')}>{m.mail.mxHost}</Row>
                        <StatusBadge level={m.mail.startTls ? 'success' : 'warning'} label={`${t('mail.startTls')} ${m.mail.startTls ? '✓' : '✗'}`} />
                        {m.mail.cert && (
                          <Row label={t('mail.cert')}>
                            {m.mail.cert.subject} ← {m.mail.cert.issuer}
                          </Row>
                        )}
                      </div>
                    ) : (
                      <StatusBadge level="neutral" label={t('mail.noMx')} />
                    )
                  )}
                </ModuleCard>

                {/* 国密 */}
                <ModuleCard title={t('modules.gm')} error={m.gm.ok ? undefined : m.gm.error}>
                  {m.gm.ok && (
                    <div className="space-y-2">
                      <StatusBadge level={m.gm.supported ? 'success' : 'neutral'} label={m.gm.supported ? t('supported') : t('notSupported')} />
                      <p className="text-sm text-gray-500">{m.gm.supported ? t('gm.supportedDesc') : t('gm.notSupportedDesc')}</p>
                      {m.gm.cipherSuite && <Row label={t('gm.cipher')}>{m.gm.cipherSuite}</Row>}
                    </div>
                  )}
                </ModuleCard>

                {/* 后量子 */}
                <ModuleCard title={t('modules.pqc')} error={m.pqc.ok ? undefined : m.pqc.error}>
                  {m.pqc.ok && (
                    <div className="space-y-2">
                      <StatusBadge level={m.pqc.supported ? 'success' : 'neutral'} label={m.pqc.supported ? t('supported') : t('notSupported')} />
                      <p className="text-sm text-gray-500">{m.pqc.supported ? t('pqc.supportedDesc') : t('pqc.notSupportedDesc')}</p>
                      {m.pqc.group && <Row label={t('pqc.group')}>{m.pqc.group}{m.pqc.viaHelloRetry ? `（${t('pqc.viaHelloRetry')}）` : ''}</Row>}
                    </div>
                  )}
                </ModuleCard>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
