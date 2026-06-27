import React, { useEffect, useMemo, useState } from 'react'
import {
  Button,
  Card,
  Input,
  NoticeCard,
  PageHero,
  ParticlesBackground,
  Switch,
  cn,
} from '@toolbox/ui-kit'
import { useTranslation } from 'react-i18next'
import { Check, ClipboardCopy, Download, QrCode, Wifi } from 'lucide-react'
import QRCode from 'qrcode'
import { buildWifiString, type WifiAuth } from './lib/wifiQr'

type EcLevel = 'L' | 'M' | 'Q' | 'H'

const AUTH_OPTIONS: WifiAuth[] = ['WPA', 'WEP', 'nopass']
const EC_OPTIONS: EcLevel[] = ['L', 'M', 'Q', 'H']
const SIZE_OPTIONS = [200, 256, 320, 400]

const WifiQr: React.FC = () => {
  const { t } = useTranslation('toolWifiQr')

  const [ssid, setSsid] = useState('')
  const [password, setPassword] = useState('')
  const [auth, setAuth] = useState<WifiAuth>('WPA')
  const [hidden, setHidden] = useState(false)
  const [ecLevel, setEcLevel] = useState<EcLevel>('M')
  const [size, setSize] = useState(256)

  const [dataUrl, setDataUrl] = useState('')
  const [renderError, setRenderError] = useState(false)
  const [copied, setCopied] = useState(false)

  const wifiString = useMemo(
    () => buildWifiString({ ssid, password, auth, hidden }),
    [ssid, password, auth, hidden]
  )

  const hasSsid = ssid.trim().length > 0

  // 输入变化即实时生成二维码（SSID 为空时不渲染）
  useEffect(() => {
    if (!hasSsid) {
      setDataUrl('')
      setRenderError(false)
      return
    }

    let cancelled = false
    QRCode.toDataURL(wifiString, {
      width: size,
      margin: 2,
      errorCorrectionLevel: ecLevel,
    })
      .then((url) => {
        if (cancelled) return
        setDataUrl(url)
        setRenderError(false)
      })
      .catch(() => {
        if (cancelled) return
        setDataUrl('')
        setRenderError(true)
      })

    return () => {
      cancelled = true
    }
  }, [wifiString, size, ecLevel, hasSsid])

  const onDownload = () => {
    if (!dataUrl) return
    const link = document.createElement('a')
    link.href = dataUrl
    const safeName = ssid.trim().replace(/[^\w.-]+/g, '_') || 'wifi'
    link.download = `wifi-${safeName}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const onCopy = async () => {
    if (!wifiString) return
    try {
      await navigator.clipboard.writeText(wifiString)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1200)
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="relative min-h-[60vh]">
      <ParticlesBackground preset="minimal" className="absolute inset-0" />
      <div className="relative z-10 space-y-6">
        <PageHero title={t('title')} description={t('description')} />

        <NoticeCard tone="info" title={t('notice.title')} description={t('notice.body')} icon={Wifi} />

        <div className="grid gap-3 md:grid-cols-2">
          {/* 表单 */}
          <Card>
            <h2 className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-200">
              {t('form.title')}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-300">
                  {t('form.ssid')}
                </label>
                <Input
                  value={ssid}
                  onChange={(e) => setSsid(e.target.value)}
                  placeholder={t('form.ssidPlaceholder')}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-300">
                  {t('form.encryption')}
                </label>
                <div className="inline-flex rounded-md border border-gray-200 p-0.5 dark:border-gray-700">
                  {AUTH_OPTIONS.map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => setAuth(a)}
                      className={cn(
                        'rounded px-3 py-1 text-xs font-medium transition',
                        auth === a ? 'bg-indigo-500 text-white' : 'text-gray-600 dark:text-gray-300'
                      )}
                    >
                      {t(`auth.${a}`)}
                    </button>
                  ))}
                </div>
              </div>

              {auth !== 'nopass' && (
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-300">
                    {t('form.password')}
                  </label>
                  <Input
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('form.passwordPlaceholder')}
                  />
                </div>
              )}

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-300">
                  {t('form.errorLevel')}
                </label>
                <div className="inline-flex rounded-md border border-gray-200 p-0.5 dark:border-gray-700">
                  {EC_OPTIONS.map((lv) => (
                    <button
                      key={lv}
                      type="button"
                      onClick={() => setEcLevel(lv)}
                      className={cn(
                        'rounded px-3 py-1 text-xs font-medium transition',
                        ecLevel === lv ? 'bg-indigo-500 text-white' : 'text-gray-600 dark:text-gray-300'
                      )}
                    >
                      {t(`ecLevel.${lv}`)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-300">
                  {t('form.size')}
                </label>
                <div className="inline-flex rounded-md border border-gray-200 p-0.5 dark:border-gray-700">
                  {SIZE_OPTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSize(s)}
                      className={cn(
                        'rounded px-3 py-1 text-xs font-medium transition',
                        size === s ? 'bg-indigo-500 text-white' : 'text-gray-600 dark:text-gray-300'
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <Switch checked={hidden} onChange={setHidden} label={t('form.hidden')} />
            </div>
          </Card>

          {/* 预览 */}
          <Card>
            <h2 className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-200">
              {t('preview.title')}
            </h2>

            {!hasSsid ? (
              <NoticeCard tone="warning" title={t('preview.emptyTitle')} description={t('preview.empty')} icon={QrCode} />
            ) : renderError ? (
              <NoticeCard tone="danger" title={t('error.render')} icon={QrCode} />
            ) : (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700">
                    {dataUrl && (
                      <img src={dataUrl} alt={t('preview.title')} width={size} height={size} className="max-w-full" />
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button variant="primary" onClick={onDownload} disabled={!dataUrl}>
                    <span className="inline-flex items-center gap-1">
                      <Download className="h-4 w-4" />
                      {t('preview.download')}
                    </span>
                  </Button>
                  <Button variant="secondary" onClick={() => void onCopy()}>
                    <span className="inline-flex items-center gap-1">
                      {copied ? <Check className="h-4 w-4" /> : <ClipboardCopy className="h-4 w-4" />}
                      {copied ? t('preview.copied') : t('preview.copy')}
                    </span>
                  </Button>
                </div>

                <div>
                  <div className="mb-1 text-xs font-medium text-gray-600 dark:text-gray-300">
                    {t('preview.string')}
                  </div>
                  <pre className="overflow-x-auto rounded-md border border-gray-200 bg-gray-50 p-2 font-mono text-xs text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200">
                    {wifiString}
                  </pre>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}

export default WifiQr
