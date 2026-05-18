import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Contact,
  Download,
  FileText,
  Image as ImageIcon,
  Palette,
  QrCode,
  Type as TypeIcon,
  RotateCcw,
} from 'lucide-react'
import { PageHero } from '@toolbox/ui-kit'
import { useToolStorage } from '@toolbox/storage'
import { useTranslation } from 'react-i18next'
import QRCode from 'qrcode'

import { TEMPLATES, DEFAULT_CARD, buildVCard, type CardData, type TemplateId } from './templates'
import CardPreview from './CardPreview'

const NAMESPACE = 'toolBusinessCard'

const PRESET_COLORS = [
  '#4338ca', // indigo
  '#0ea5e9', // sky
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // rose
  '#7c3aed', // violet
  '#111827', // gray-900
  '#0f766e', // teal
]

const BusinessCard: React.FC = () => {
  const { t, i18n } = useTranslation(NAMESPACE)
  const isZh = (i18n.resolvedLanguage || i18n.language || 'zh').startsWith('zh')

  const { data, save, loading } = useToolStorage<CardData>(
    'business-card',
    'state',
    DEFAULT_CARD,
  )

  const cardRef = useRef<HTMLDivElement>(null)
  const [qrDataUrl, setQrDataUrl] = useState<string | undefined>(undefined)
  const [exporting, setExporting] = useState(false)

  const update = useCallback(
    <K extends keyof CardData>(key: K, value: CardData[K]) => {
      void save({ ...data, [key]: value })
    },
    [data, save],
  )

  // Build QR payload based on selection
  const qrPayload = useMemo(() => {
    if (!data.showQr) return ''
    if (data.qrTarget === 'website') return data.website || ''
    return buildVCard(data)
  }, [data])

  // Regenerate QR data url whenever payload changes
  useEffect(() => {
    let cancelled = false
    if (!qrPayload) {
      setQrDataUrl(undefined)
      return
    }
    QRCode.toDataURL(qrPayload, {
      width: 256,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: { dark: '#111111', light: '#ffffff' },
    })
      .then((url) => {
        if (!cancelled) setQrDataUrl(url)
      })
      .catch(() => {
        if (!cancelled) setQrDataUrl(undefined)
      })
    return () => {
      cancelled = true
    }
  }, [qrPayload])

  const downloadPng = useCallback(async () => {
    if (!cardRef.current) return
    setExporting(true)
    try {
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 4,
        useCORS: true,
        logging: false,
      })
      canvas.toBlob((blob) => {
        if (!blob) return
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `business-card-${slugify(data.name || 'card')}.png`
        a.click()
        URL.revokeObjectURL(url)
      }, 'image/png')
    } finally {
      setExporting(false)
    }
  }, [data.name])

  const downloadPdf = useCallback(async () => {
    if (!cardRef.current) return
    setExporting(true)
    try {
      const html2canvas = (await import('html2canvas')).default
      const { default: JsPDF } = await import('jspdf')
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 4,
        useCORS: true,
        logging: false,
      })
      const imgData = canvas.toDataURL('image/png')
      // 标准名片 90 × 54 mm，PDF 横向
      const pdf = new JsPDF({ orientation: 'landscape', unit: 'mm', format: [90, 54] })
      pdf.addImage(imgData, 'PNG', 0, 0, 90, 54)
      pdf.save(`business-card-${slugify(data.name || 'card')}.pdf`)
    } finally {
      setExporting(false)
    }
  }, [data.name])

  if (loading) {
    return (
      <div className="w-full space-y-6">
        <PageHero title={t('title')} description={t('description')} />
        <div className="text-center text-sm text-gray-400 py-12">{t('loading')}</div>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6 pb-24">
      <PageHero title={t('title')} description={t('description')} />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_460px] gap-6">
        {/* Left: form */}
        <div className="space-y-5">
          {/* Template */}
          <section className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
            <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <Palette className="w-4 h-4" /> {t('section.template')}
            </h2>
            <div className="grid grid-cols-3 gap-2">
              {TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() =>
                    save({ ...data, template: tpl.id, accentColor: tpl.defaultColor })
                  }
                  className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                    data.template === tpl.id
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {isZh ? tpl.zh : tpl.en}
                </button>
              ))}
            </div>
          </section>

          {/* Colors */}
          <section className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
            <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <Palette className="w-4 h-4" /> {t('section.color')}
            </h2>
            <div className="flex items-center gap-3 flex-wrap">
              <input
                type="color"
                value={data.accentColor}
                onChange={(e) => update('accentColor', e.target.value)}
                className="w-10 h-9 rounded border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={data.accentColor}
                onChange={(e) => update('accentColor', e.target.value)}
                className="w-28 px-2 py-1.5 text-sm border border-gray-300 rounded-md font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                spellCheck={false}
              />
              <div className="flex gap-1.5 flex-wrap">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => update('accentColor', c)}
                    aria-label={c}
                    className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${
                      data.accentColor.toLowerCase() === c.toLowerCase()
                        ? 'border-gray-800'
                        : 'border-white shadow'
                    }`}
                    style={{ background: c }}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* Identity */}
          <section className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
            <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <TypeIcon className="w-4 h-4" /> {t('section.identity')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Field label={t('field.name')} value={data.name} onChange={(v) => update('name', v)} />
              <Field label={t('field.title')} value={data.title} onChange={(v) => update('title', v)} />
              <Field
                label={t('field.company')}
                value={data.company}
                onChange={(v) => update('company', v)}
                className="sm:col-span-2"
              />
              {data.template === 'modern' && (
                <Field
                  label={t('field.tagline')}
                  value={data.tagline}
                  onChange={(v) => update('tagline', v)}
                  className="sm:col-span-2"
                />
              )}
            </div>
          </section>

          {/* Contact */}
          <section className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
            <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <Contact className="w-4 h-4" /> {t('section.contact')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Field label={t('field.phone')} value={data.phone} onChange={(v) => update('phone', v)} />
              <Field label={t('field.email')} value={data.email} onChange={(v) => update('email', v)} />
              <Field
                label={t('field.website')}
                value={data.website}
                onChange={(v) => update('website', v)}
                className="sm:col-span-2"
              />
              <Field
                label={t('field.address')}
                value={data.address}
                onChange={(v) => update('address', v)}
                className="sm:col-span-2"
              />
            </div>
          </section>

          {/* QR */}
          <section className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
            <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <QrCode className="w-4 h-4" /> {t('section.qr')}
            </h2>
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={data.showQr}
                onChange={(e) => update('showQr', e.target.checked)}
                className="rounded border-gray-300"
              />
              {t('field.showQr')}
            </label>
            {data.showQr && (
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <span>{t('field.qrContent')}:</span>
                <label className="inline-flex items-center gap-1">
                  <input
                    type="radio"
                    checked={data.qrTarget === 'vcard'}
                    onChange={() => update('qrTarget', 'vcard')}
                  />
                  {t('field.qrVcard')}
                </label>
                <label className="inline-flex items-center gap-1">
                  <input
                    type="radio"
                    checked={data.qrTarget === 'website'}
                    onChange={() => update('qrTarget', 'website')}
                  />
                  {t('field.qrWebsite')}
                </label>
              </div>
            )}
            {data.showQr && data.qrTarget === 'website' && !data.website && (
              <p className="text-xs text-amber-600">{t('field.qrWebsiteHint')}</p>
            )}
          </section>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => save(DEFAULT_CARD)}
              className="text-xs text-gray-500 hover:text-red-500 inline-flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> {t('reset')}
            </button>
          </div>
        </div>

        {/* Right: preview + export */}
        <div className="space-y-4">
          <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 p-6 flex flex-col items-center gap-3 sticky top-4">
            <span className="text-xs text-gray-500 uppercase tracking-wide">
              {t('preview.label')}
            </span>
            <CardPreview ref={cardRef} data={data} qrDataUrl={qrDataUrl} />
            <span className="text-xs text-gray-400">{t('preview.size')}</span>
            <div className="flex gap-2 flex-wrap justify-center pt-2">
              <button
                type="button"
                onClick={downloadPng}
                disabled={exporting}
                className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-300 transition-colors flex items-center gap-1.5"
              >
                <ImageIcon className="w-4 h-4" />
                {exporting ? t('exporting') : t('exportPng')}
              </button>
              <button
                type="button"
                onClick={downloadPdf}
                disabled={exporting}
                className="px-4 py-2 text-sm font-medium bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:bg-gray-300 transition-colors flex items-center gap-1.5"
              >
                <FileText className="w-4 h-4" />
                {exporting ? t('exporting') : t('exportPdf')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface FieldProps {
  label: string
  value: string
  onChange: (v: string) => void
  className?: string
}
const Field: React.FC<FieldProps> = ({ label, value, onChange, className = '' }) => (
  <label className={`block text-sm ${className}`}>
    <span className="block text-xs text-gray-500 mb-0.5">{label}</span>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
    />
  </label>
)

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9一-龥]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 32) || 'card'
}

export default BusinessCard
