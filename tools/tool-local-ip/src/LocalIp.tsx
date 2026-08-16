import React, { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Router, Wifi, Cloud, RefreshCw } from 'lucide-react'
import { PageHero, ParticlesBackground, Card, Button, NoticeCard, PropertyGrid, CopyButton, Spinner } from '@toolbox/ui-kit'
import { detectLocalIps } from './lib/webrtcLocalIp'

interface PublicIpResult {
  ip: string
  classification?: { label: string }
}

async function getJson(path: string): Promise<PublicIpResult> {
  const response = await fetch(path)
  const data = await response.json()
  if (!response.ok) throw new Error(data.error || 'Request failed')
  return data
}

const LocalIp: React.FC = () => {
  const { t } = useTranslation('toolLocalIp')

  const [lanLoading, setLanLoading] = useState(false)
  const [lanIps, setLanIps] = useState<string[] | null>(null)
  const [mdnsBlocked, setMdnsBlocked] = useState(false)
  const [lanError, setLanError] = useState<string | null>(null)

  const [publicLoading, setPublicLoading] = useState(false)
  const [publicResult, setPublicResult] = useState<PublicIpResult | null>(null)
  const [publicError, setPublicError] = useState<string | null>(null)

  const runLanDetect = useCallback(async () => {
    setLanLoading(true)
    setLanError(null)
    setMdnsBlocked(false)
    try {
      const { ips, mdnsBlocked: blocked } = await detectLocalIps()
      setLanIps(ips)
      setMdnsBlocked(blocked)
      if (ips.length === 0 && !blocked) setLanError(t('lan.noResult'))
    } catch (error) {
      setLanError(error instanceof Error ? error.message : t('lan.noResult'))
    } finally {
      setLanLoading(false)
    }
  }, [t])

  const runPublicDetect = useCallback(async () => {
    setPublicLoading(true)
    setPublicError(null)
    try {
      const result = await getJson('/api/ip-ops/public')
      setPublicResult(result)
    } catch (error) {
      setPublicError(error instanceof Error ? error.message : t('public.error'))
    } finally {
      setPublicLoading(false)
    }
  }, [t])

  return (
    <div className="relative min-h-[60vh]">
      <ParticlesBackground preset="minimal" className="absolute inset-0" />
      <div className="relative z-10 max-w-3xl mx-auto space-y-6">
        <PageHero title={t('title')} description={t('description')} icon={Router} />

        <Card>
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <Wifi className="w-5 h-5 text-ink-muted" />
              <h2 className="text-sm font-semibold text-ink">{t('lan.title')}</h2>
            </div>
            <Button onClick={() => void runLanDetect()} disabled={lanLoading} size="sm">
              {lanLoading ? <Spinner size="sm" /> : <RefreshCw className="w-3.5 h-3.5" />}
              <span className="ml-1.5">{lanLoading ? t('lan.detecting') : t('lan.detect')}</span>
            </Button>
          </div>
          <p className="text-sm text-ink-subtle mb-4">{t('lan.description')}</p>

          {mdnsBlocked && (
            <div className="mb-4">
              <NoticeCard tone="warning" title={t('lan.mdnsTitle')} description={t('lan.mdnsDescription')} />
            </div>
          )}

          {lanError && !mdnsBlocked && (
            <div className="mb-4">
              <NoticeCard tone="danger" title={t('lan.errorTitle')} description={lanError} />
            </div>
          )}

          {lanIps && lanIps.length > 0 && (
            <PropertyGrid
              items={lanIps.map((ip) => ({
                label: t('lan.candidateLabel'),
                value: (
                  <span className="inline-flex items-center gap-2">
                    <span className="font-mono">{ip}</span>
                    <CopyButton value={ip} size="sm" label={t('copy')} copiedLabel={t('copied')} />
                  </span>
                ),
                tone: 'primary' as const,
              }))}
            />
          )}
        </Card>

        <Card>
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <Cloud className="w-5 h-5 text-ink-muted" />
              <h2 className="text-sm font-semibold text-ink">{t('public.title')}</h2>
            </div>
            <Button onClick={() => void runPublicDetect()} disabled={publicLoading} size="sm">
              {publicLoading ? <Spinner size="sm" /> : <RefreshCw className="w-3.5 h-3.5" />}
              <span className="ml-1.5">{publicLoading ? t('public.detecting') : t('public.detect')}</span>
            </Button>
          </div>
          <p className="text-sm text-ink-subtle mb-4">{t('public.description')}</p>

          {publicError && (
            <div className="mb-4">
              <NoticeCard tone="danger" title={t('public.errorTitle')} description={publicError} />
            </div>
          )}

          {publicResult?.ip && (
            <PropertyGrid
              items={[
                {
                  label: t('public.ipLabel'),
                  value: (
                    <span className="inline-flex items-center gap-2">
                      <span className="font-mono">{publicResult.ip}</span>
                      <CopyButton value={publicResult.ip} size="sm" label={t('copy')} copiedLabel={t('copied')} />
                    </span>
                  ),
                  tone: 'primary' as const,
                },
                {
                  label: t('public.classificationLabel'),
                  value: publicResult.classification?.label || '—',
                },
              ]}
            />
          )}
        </Card>
      </div>
    </div>
  )
}

export default LocalIp
