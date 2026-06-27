import React, { useMemo, useState } from 'react'
import {
  Button,
  Card,
  Input,
  NoticeCard,
  PageHero,
  ParticlesBackground,
  TextArea,
  cn,
} from '@toolbox/ui-kit'
import { useTranslation } from 'react-i18next'
import { Check, ClipboardCopy, ImageOff, Tags } from 'lucide-react'
import {
  emptyForm,
  extractDomain,
  generateTags,
  type MetaTagsForm,
  type TwitterCardType,
} from './lib/generate'

const TITLE_MAX = 60
const DESC_MAX = 160

const MetaTags: React.FC = () => {
  const { t } = useTranslation('toolMetaTags')
  const [form, setForm] = useState<MetaTagsForm>(emptyForm)
  const [copied, setCopied] = useState(false)
  const [imgBroken, setImgBroken] = useState(false)

  const update = <K extends keyof MetaTagsForm>(key: K, value: MetaTagsForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (key === 'image') setImgBroken(false)
  }

  const output = useMemo(() => generateTags(form), [form])
  const domain = useMemo(() => extractDomain(form.url), [form.url])

  const titleLen = form.title.trim().length
  const descLen = form.description.trim().length
  const titleTooLong = titleLen > TITLE_MAX
  const descTooLong = descLen > DESC_MAX

  const onCopy = async () => {
    if (!output) return
    try {
      await navigator.clipboard.writeText(output)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1400)
    } catch {
      /* ignore */
    }
  }

  const onReset = () => {
    setForm(emptyForm)
    setImgBroken(false)
  }

  const hasImage = form.image.trim().length > 0 && !imgBroken
  const previewTitle = form.title.trim()
  const previewDesc = form.description.trim()
  const previewSite = form.siteName.trim() || domain

  return (
    <div className="relative min-h-[60vh]">
      <ParticlesBackground preset="minimal" className="absolute inset-0" />
      <div className="relative z-10 space-y-6">
        <PageHero title={t('title')} description={t('description')} />

        <NoticeCard tone="info" title={t('notice.title')} description={t('notice.body')} icon={Tags} />

        <div className="grid gap-6 lg:grid-cols-2">
          {/* 左：表单 */}
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {t('form.heading')}
              </h2>
              <Button variant="ghost" size="sm" onClick={onReset}>
                {t('form.reset')}
              </Button>
            </div>

            <div className="space-y-4">
              <Field
                label={t('fields.title.label')}
                hint={t('fields.title.hint')}
                counter={t('counter', { count: titleLen, max: TITLE_MAX })}
                counterWarn={titleTooLong}
              >
                <Input
                  value={form.title}
                  onChange={(e) => update('title', e.target.value)}
                  placeholder={t('fields.title.placeholder')}
                />
              </Field>

              <Field
                label={t('fields.description.label')}
                hint={t('fields.description.hint')}
                counter={t('counter', { count: descLen, max: DESC_MAX })}
                counterWarn={descTooLong}
              >
                <TextArea
                  size="sm"
                  rows={3}
                  value={form.description}
                  onChange={(e) => update('description', e.target.value)}
                  placeholder={t('fields.description.placeholder')}
                />
              </Field>

              <Field label={t('fields.url.label')}>
                <Input
                  value={form.url}
                  onChange={(e) => update('url', e.target.value)}
                  placeholder={t('fields.url.placeholder')}
                  spellCheck={false}
                  autoComplete="off"
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={t('fields.siteName.label')}>
                  <Input
                    value={form.siteName}
                    onChange={(e) => update('siteName', e.target.value)}
                    placeholder={t('fields.siteName.placeholder')}
                  />
                </Field>
                <Field label={t('fields.author.label')}>
                  <Input
                    value={form.author}
                    onChange={(e) => update('author', e.target.value)}
                    placeholder={t('fields.author.placeholder')}
                  />
                </Field>
              </div>

              <Field label={t('fields.image.label')} hint={t('fields.image.hint')}>
                <Input
                  value={form.image}
                  onChange={(e) => update('image', e.target.value)}
                  placeholder={t('fields.image.placeholder')}
                  spellCheck={false}
                  autoComplete="off"
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={t('fields.twitterCard.label')}>
                  <div className="flex rounded-lg border border-gray-300 p-0.5 dark:border-gray-600">
                    {(['summary_large_image', 'summary'] as TwitterCardType[]).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => update('twitterCard', type)}
                        className={cn(
                          'flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors',
                          form.twitterCard === type
                            ? 'bg-indigo-600 text-white dark:bg-indigo-500'
                            : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                        )}
                      >
                        {t(`fields.twitterCard.options.${type}`)}
                      </button>
                    ))}
                  </div>
                </Field>
                <Field label={t('fields.twitterHandle.label')}>
                  <Input
                    value={form.twitterHandle}
                    onChange={(e) => update('twitterHandle', e.target.value)}
                    placeholder={t('fields.twitterHandle.placeholder')}
                    spellCheck={false}
                    autoComplete="off"
                  />
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={t('fields.locale.label')} hint={t('fields.locale.hint')}>
                  <Input
                    value={form.locale}
                    onChange={(e) => update('locale', e.target.value)}
                    placeholder={t('fields.locale.placeholder')}
                    spellCheck={false}
                    autoComplete="off"
                  />
                </Field>
                <Field label={t('fields.themeColor.label')} hint={t('fields.themeColor.hint')}>
                  <div className="flex gap-2">
                    <Input
                      value={form.themeColor}
                      onChange={(e) => update('themeColor', e.target.value)}
                      placeholder={t('fields.themeColor.placeholder')}
                      spellCheck={false}
                      autoComplete="off"
                    />
                    <input
                      type="color"
                      aria-label={t('fields.themeColor.label')}
                      value={/^#[0-9a-fA-F]{6}$/.test(form.themeColor) ? form.themeColor : '#6366f1'}
                      onChange={(e) => update('themeColor', e.target.value)}
                      className="h-9 w-11 shrink-0 cursor-pointer rounded-lg border border-gray-300 dark:border-gray-600"
                    />
                  </div>
                </Field>
              </div>
            </div>
          </Card>

          {/* 右：预览 */}
          <div className="space-y-6">
            <Card>
              <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
                {t('preview.heading')}
              </h2>

              {/* Open Graph 风格卡片 */}
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                {t('preview.og')}
              </p>
              <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                <PreviewImage hasImage={hasImage} src={form.image} onError={() => setImgBroken(true)} t={t} />
                <div className="space-y-1 bg-gray-50 p-3 dark:bg-gray-900/40">
                  {previewSite && (
                    <p className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      {previewSite}
                    </p>
                  )}
                  <p className="line-clamp-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {previewTitle || t('preview.placeholderTitle')}
                  </p>
                  <p className="line-clamp-2 text-xs text-gray-600 dark:text-gray-300">
                    {previewDesc || t('preview.placeholderDesc')}
                  </p>
                </div>
              </div>

              {/* Twitter 风格卡片 */}
              <p className="mb-1.5 mt-4 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                {t('preview.twitter')}
              </p>
              {form.twitterCard === 'summary' ? (
                <div className="flex overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700">
                  <div className="h-[88px] w-[88px] shrink-0">
                    <PreviewImage hasImage={hasImage} src={form.image} onError={() => setImgBroken(true)} t={t} compact />
                  </div>
                  <div className="flex flex-col justify-center space-y-0.5 p-3">
                    <p className="line-clamp-1 text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {previewTitle || t('preview.placeholderTitle')}
                    </p>
                    <p className="line-clamp-2 text-xs text-gray-600 dark:text-gray-300">
                      {previewDesc || t('preview.placeholderDesc')}
                    </p>
                    {domain && <p className="text-[11px] text-gray-500 dark:text-gray-400">{domain}</p>}
                  </div>
                </div>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700">
                  <PreviewImage hasImage={hasImage} src={form.image} onError={() => setImgBroken(true)} t={t} />
                  <div className="space-y-0.5 p-3">
                    <p className="line-clamp-1 text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {previewTitle || t('preview.placeholderTitle')}
                    </p>
                    <p className="line-clamp-2 text-xs text-gray-600 dark:text-gray-300">
                      {previewDesc || t('preview.placeholderDesc')}
                    </p>
                    {domain && <p className="text-[11px] text-gray-500 dark:text-gray-400">{domain}</p>}
                  </div>
                </div>
              )}
            </Card>

            {(titleTooLong || descTooLong) && (
              <NoticeCard
                tone="warning"
                title={t('warnings.title')}
                description={
                  <ul className="ml-4 list-disc space-y-0.5">
                    {titleTooLong && <li>{t('warnings.titleLong', { max: TITLE_MAX, count: titleLen })}</li>}
                    {descTooLong && <li>{t('warnings.descLong', { max: DESC_MAX, count: descLen })}</li>}
                  </ul>
                }
              />
            )}
          </div>
        </div>

        {/* 输出 */}
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t('output.heading')}
            </h2>
            <Button variant="primary" size="sm" onClick={onCopy} disabled={!output}>
              <span className="inline-flex items-center gap-1.5">
                {copied ? <Check className="h-4 w-4" /> : <ClipboardCopy className="h-4 w-4" />}
                {copied ? t('output.copied') : t('output.copy')}
              </span>
            </Button>
          </div>
          {output ? (
            <TextArea
              readOnly
              value={output}
              rows={Math.min(20, output.split('\n').length + 1)}
              spellCheck={false}
              className="font-mono text-xs"
            />
          ) : (
            <p className="rounded-2xl border border-dashed border-gray-300 px-4 py-8 text-center text-sm text-gray-500 dark:border-gray-600 dark:text-gray-400">
              {t('output.empty')}
            </p>
          )}
        </Card>
      </div>
    </div>
  )
}

const Field: React.FC<{
  label: string
  hint?: string
  counter?: string
  counterWarn?: boolean
  children: React.ReactNode
}> = ({ label, hint, counter, counterWarn, children }) => (
  <div>
    <div className="mb-1 flex items-baseline justify-between gap-2">
      <label className="text-xs font-medium text-gray-700 dark:text-gray-200">{label}</label>
      {counter && (
        <span
          className={cn(
            'text-[10px] tabular-nums',
            counterWarn ? 'font-semibold text-amber-600 dark:text-amber-400' : 'text-gray-400 dark:text-gray-500'
          )}
        >
          {counter}
        </span>
      )}
    </div>
    {children}
    {hint && <p className="mt-1 text-[11px] text-gray-400 dark:text-gray-500">{hint}</p>}
  </div>
)

const PreviewImage: React.FC<{
  hasImage: boolean
  src: string
  compact?: boolean
  onError: () => void
  t: (key: string) => string
}> = ({ hasImage, src, compact, onError, t }) =>
  hasImage ? (
    <img
      src={src}
      alt={t('preview.imageAlt')}
      onError={onError}
      className={cn('w-full bg-gray-100 object-cover dark:bg-gray-800', compact ? 'h-full' : 'aspect-[1.91/1]')}
    />
  ) : (
    <div
      className={cn(
        'flex w-full items-center justify-center bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500',
        compact ? 'h-full' : 'aspect-[1.91/1]'
      )}
    >
      <ImageOff className={compact ? 'h-5 w-5' : 'h-8 w-8'} />
    </div>
  )

export default MetaTags
