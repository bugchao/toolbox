import React, { useCallback, useMemo, useState } from 'react'
import {
  Globe,
  Image as ImageIcon,
  Twitter,
  Search,
  Copy,
  Check,
  Download,
  RotateCcw,
  ChevronDown,
  Code2,
} from 'lucide-react'
import { PageHero } from '@toolbox/ui-kit'
import { useToolStorage } from '@toolbox/storage'
import { useTranslation } from 'react-i18next'

const NAMESPACE = 'toolMetaTagGen'

type RobotsValue = 'index,follow' | 'noindex,follow' | 'index,nofollow' | 'noindex,nofollow'
type OgType = 'website' | 'article' | 'product' | 'profile'
type TwitterCardType = 'summary' | 'summary_large_image' | 'app' | 'player'
type PreviewTab = 'google' | 'twitter' | 'facebook'

interface MetaState {
  // 基础 SEO
  title: string
  description: string
  keywords: string
  author: string
  canonical: string
  robots: RobotsValue
  viewport: string
  themeColor: string
  // Open Graph
  ogTitle: string
  ogDescription: string
  ogType: OgType
  ogUrl: string
  ogImage: string
  ogSiteName: string
  ogLocale: string
  // Twitter
  twitterCard: TwitterCardType
  twitterSite: string
  twitterCreator: string
  // toggles
  includeOg: boolean
  includeTwitter: boolean
}

const DEFAULT_STATE: MetaState = {
  title: 'My Awesome Site - Build amazing things',
  description:
    'My Awesome Site helps creators build, ship and share polished web experiences in minutes — fast, accessible and SEO-friendly.',
  keywords: 'web, design, seo, open graph, share card',
  author: 'Awesome Team',
  canonical: 'https://example.com/',
  robots: 'index,follow',
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#4f46e5',
  ogTitle: '',
  ogDescription: '',
  ogType: 'website',
  ogUrl: '',
  ogImage: 'https://picsum.photos/seed/awesome/1200/630',
  ogSiteName: 'My Awesome Site',
  ogLocale: 'zh_CN',
  twitterCard: 'summary_large_image',
  twitterSite: '@awesome',
  twitterCreator: '@awesome_team',
  includeOg: true,
  includeTwitter: true,
}

// Google 推荐字符上限
const TITLE_MAX = 60
const DESC_MAX = 160

// ---------- helpers ----------
function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function truncate(s: string, max: number): string {
  if (!s) return ''
  if (s.length <= max) return s
  // 末尾省略号
  return s.slice(0, Math.max(0, max - 1)).trimEnd() + '…'
}

function safeHostname(url: string, fallback: string): string {
  if (!url) return fallback
  try {
    const u = new URL(url)
    return u.hostname || fallback
  } catch {
    return fallback
  }
}

function buildHtml(s: MetaState): string {
  const lines: string[] = []
  const push = (line: string) => lines.push('  ' + line)

  // charset / viewport 强制输出
  push('<meta charset="UTF-8" />')
  const viewport = s.viewport.trim() || 'width=device-width, initial-scale=1'
  push(`<meta name="viewport" content="${escapeHtml(viewport)}" />`)

  if (s.title.trim()) push(`<title>${escapeHtml(s.title)}</title>`)
  if (s.description.trim())
    push(`<meta name="description" content="${escapeHtml(s.description)}" />`)
  if (s.keywords.trim())
    push(`<meta name="keywords" content="${escapeHtml(s.keywords)}" />`)
  if (s.canonical.trim())
    push(`<link rel="canonical" href="${escapeHtml(s.canonical)}" />`)
  push(`<meta name="robots" content="${escapeHtml(s.robots)}" />`)
  if (s.author.trim())
    push(`<meta name="author" content="${escapeHtml(s.author)}" />`)
  if (s.themeColor.trim())
    push(`<meta name="theme-color" content="${escapeHtml(s.themeColor)}" />`)

  if (s.includeOg) {
    const ogTitle = s.ogTitle.trim() || s.title
    const ogDescription = s.ogDescription.trim() || s.description
    const ogUrl = s.ogUrl.trim() || s.canonical
    if (ogTitle) push(`<meta property="og:title" content="${escapeHtml(ogTitle)}" />`)
    if (ogDescription)
      push(`<meta property="og:description" content="${escapeHtml(ogDescription)}" />`)
    push(`<meta property="og:type" content="${escapeHtml(s.ogType)}" />`)
    if (ogUrl) push(`<meta property="og:url" content="${escapeHtml(ogUrl)}" />`)
    if (s.ogImage.trim())
      push(`<meta property="og:image" content="${escapeHtml(s.ogImage)}" />`)
    if (s.ogSiteName.trim())
      push(`<meta property="og:site_name" content="${escapeHtml(s.ogSiteName)}" />`)
    if (s.ogLocale.trim())
      push(`<meta property="og:locale" content="${escapeHtml(s.ogLocale)}" />`)
  }

  if (s.includeTwitter) {
    push(`<meta name="twitter:card" content="${escapeHtml(s.twitterCard)}" />`)
    if (s.twitterSite.trim())
      push(`<meta name="twitter:site" content="${escapeHtml(s.twitterSite)}" />`)
    if (s.twitterCreator.trim())
      push(`<meta name="twitter:creator" content="${escapeHtml(s.twitterCreator)}" />`)
    // Twitter 也建议使用 og:image / og:title / og:description 作 fallback；
    // 当未启用 OG 时，输出 twitter 专用字段。
    if (!s.includeOg) {
      const tTitle = s.ogTitle.trim() || s.title
      const tDesc = s.ogDescription.trim() || s.description
      if (tTitle)
        push(`<meta name="twitter:title" content="${escapeHtml(tTitle)}" />`)
      if (tDesc)
        push(`<meta name="twitter:description" content="${escapeHtml(tDesc)}" />`)
      if (s.ogImage.trim())
        push(`<meta name="twitter:image" content="${escapeHtml(s.ogImage)}" />`)
    }
  }

  return lines.join('\n')
}

// ---------- main component ----------
const MetaTagGen: React.FC = () => {
  const { t } = useTranslation(NAMESPACE)
  const { data, save, loading } = useToolStorage<MetaState>(
    'meta-tag-gen',
    'state',
    DEFAULT_STATE,
  )

  const [previewTab, setPreviewTab] = useState<PreviewTab>('google')
  const [copied, setCopied] = useState(false)
  const [openSeo, setOpenSeo] = useState(true)
  const [openOg, setOpenOg] = useState(true)
  const [openTwitter, setOpenTwitter] = useState(true)

  const update = useCallback(
    <K extends keyof MetaState>(key: K, value: MetaState[K]) => {
      void save({ ...data, [key]: value })
    },
    [data, save],
  )

  const html = useMemo(() => buildHtml(data), [data])

  const previewTitle = data.ogTitle.trim() || data.title
  const previewDesc = data.ogDescription.trim() || data.description
  const previewUrl = data.ogUrl.trim() || data.canonical
  const previewDomain = safeHostname(previewUrl, t('preview.domain'))

  const copyHtml = useCallback(async () => {
    if (!html) return
    try {
      await navigator.clipboard.writeText(html)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* ignore */
    }
  }, [html])

  const downloadHtml = useCallback(() => {
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'meta.html'
    a.click()
    URL.revokeObjectURL(url)
  }, [html])

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
        {/* ============ Left: form ============ */}
        <div className="space-y-4">
          {/* SEO */}
          <Collapsible
            open={openSeo}
            onToggle={() => setOpenSeo((v) => !v)}
            icon={<Search className="w-4 h-4" />}
            title={t('section.seo')}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FieldText
                label={t('field.title')}
                value={data.title}
                onChange={(v) => update('title', v)}
                counter={{ n: data.title.length, max: TITLE_MAX, t }}
                className="sm:col-span-2"
              />
              <FieldTextarea
                label={t('field.description')}
                value={data.description}
                onChange={(v) => update('description', v)}
                counter={{ n: data.description.length, max: DESC_MAX, t }}
                className="sm:col-span-2"
              />
              <FieldText
                label={t('field.keywords')}
                value={data.keywords}
                onChange={(v) => update('keywords', v)}
              />
              <FieldText
                label={t('field.author')}
                value={data.author}
                onChange={(v) => update('author', v)}
              />
              <FieldText
                label={t('field.canonical')}
                value={data.canonical}
                onChange={(v) => update('canonical', v)}
                placeholder="https://example.com/page"
                className="sm:col-span-2"
              />
              <label className="block text-sm">
                <span className="block text-xs text-gray-500 mb-0.5">{t('field.robots')}</span>
                <select
                  value={data.robots}
                  onChange={(e) => update('robots', e.target.value as RobotsValue)}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="index,follow">index, follow</option>
                  <option value="noindex,follow">noindex, follow</option>
                  <option value="index,nofollow">index, nofollow</option>
                  <option value="noindex,nofollow">noindex, nofollow</option>
                </select>
              </label>
              <FieldText
                label={t('field.viewport')}
                value={data.viewport}
                onChange={(v) => update('viewport', v)}
              />
              <label className="block text-sm sm:col-span-2">
                <span className="block text-xs text-gray-500 mb-0.5">
                  {t('field.themeColor')}
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={data.themeColor || '#000000'}
                    onChange={(e) => update('themeColor', e.target.value)}
                    className="w-10 h-9 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={data.themeColor}
                    onChange={(e) => update('themeColor', e.target.value)}
                    className="w-28 px-2 py-1.5 text-sm border border-gray-300 rounded-md font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    spellCheck={false}
                  />
                </div>
              </label>
            </div>
          </Collapsible>

          {/* Open Graph */}
          <Collapsible
            open={openOg}
            onToggle={() => setOpenOg((v) => !v)}
            icon={<Globe className="w-4 h-4" />}
            title={t('section.og')}
            right={
              <label className="inline-flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.includeOg}
                  onChange={(e) => update('includeOg', e.target.checked)}
                  className="rounded border-gray-300"
                />
                {t('toggle.og')}
              </label>
            }
          >
            <div
              className={`grid grid-cols-1 sm:grid-cols-2 gap-3 transition-opacity ${
                data.includeOg ? '' : 'opacity-50 pointer-events-none'
              }`}
            >
              <FieldText
                label={t('field.ogTitle')}
                value={data.ogTitle}
                onChange={(v) => update('ogTitle', v)}
                placeholder={data.title}
                className="sm:col-span-2"
              />
              <FieldTextarea
                label={t('field.ogDescription')}
                value={data.ogDescription}
                onChange={(v) => update('ogDescription', v)}
                placeholder={data.description}
                className="sm:col-span-2"
              />
              <label className="block text-sm">
                <span className="block text-xs text-gray-500 mb-0.5">{t('field.ogType')}</span>
                <select
                  value={data.ogType}
                  onChange={(e) => update('ogType', e.target.value as OgType)}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="website">website</option>
                  <option value="article">article</option>
                  <option value="product">product</option>
                  <option value="profile">profile</option>
                </select>
              </label>
              <FieldText
                label={t('field.ogUrl')}
                value={data.ogUrl}
                onChange={(v) => update('ogUrl', v)}
                placeholder={data.canonical}
              />
              <label className="block text-sm sm:col-span-2">
                <span className="block text-xs text-gray-500 mb-0.5">
                  {t('field.ogImage')}
                </span>
                <input
                  type="text"
                  value={data.ogImage}
                  onChange={(e) => update('ogImage', e.target.value)}
                  placeholder="https://...jpg"
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  spellCheck={false}
                />
                {data.ogImage.trim() ? (
                  <img
                    src={data.ogImage}
                    alt="og preview"
                    onError={(e) => {
                      ;(e.currentTarget as HTMLImageElement).style.opacity = '0.2'
                    }}
                    className="mt-1.5 w-20 h-20 object-cover rounded border border-gray-200 bg-gray-50"
                  />
                ) : null}
              </label>
              <FieldText
                label={t('field.ogSiteName')}
                value={data.ogSiteName}
                onChange={(v) => update('ogSiteName', v)}
              />
              <FieldText
                label={t('field.ogLocale')}
                value={data.ogLocale}
                onChange={(v) => update('ogLocale', v)}
              />
            </div>
          </Collapsible>

          {/* Twitter */}
          <Collapsible
            open={openTwitter}
            onToggle={() => setOpenTwitter((v) => !v)}
            icon={<Twitter className="w-4 h-4" />}
            title={t('section.twitter')}
            right={
              <label className="inline-flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.includeTwitter}
                  onChange={(e) => update('includeTwitter', e.target.checked)}
                  className="rounded border-gray-300"
                />
                {t('toggle.twitter')}
              </label>
            }
          >
            <div
              className={`grid grid-cols-1 sm:grid-cols-2 gap-3 transition-opacity ${
                data.includeTwitter ? '' : 'opacity-50 pointer-events-none'
              }`}
            >
              <label className="block text-sm sm:col-span-2">
                <span className="block text-xs text-gray-500 mb-0.5">
                  {t('field.twitterCard')}
                </span>
                <select
                  value={data.twitterCard}
                  onChange={(e) => update('twitterCard', e.target.value as TwitterCardType)}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="summary">summary</option>
                  <option value="summary_large_image">summary_large_image</option>
                  <option value="app">app</option>
                  <option value="player">player</option>
                </select>
              </label>
              <FieldText
                label={t('field.twitterSite')}
                value={data.twitterSite}
                onChange={(v) => update('twitterSite', v)}
                placeholder="@site"
              />
              <FieldText
                label={t('field.twitterCreator')}
                value={data.twitterCreator}
                onChange={(v) => update('twitterCreator', v)}
                placeholder="@author"
              />
            </div>
          </Collapsible>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => save(DEFAULT_STATE)}
              className="text-xs text-gray-500 hover:text-red-500 inline-flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> {t('reset')}
            </button>
          </div>
        </div>

        {/* ============ Right: preview ============ */}
        <div className="space-y-3">
          <div className="rounded-lg border border-gray-200 bg-white overflow-hidden sticky top-4">
            <div className="flex border-b border-gray-200 bg-gray-50">
              <PreviewTabBtn
                active={previewTab === 'google'}
                onClick={() => setPreviewTab('google')}
                label={t('preview.google')}
              />
              <PreviewTabBtn
                active={previewTab === 'twitter'}
                onClick={() => setPreviewTab('twitter')}
                label={t('preview.twitter')}
              />
              <PreviewTabBtn
                active={previewTab === 'facebook'}
                onClick={() => setPreviewTab('facebook')}
                label={t('preview.facebook')}
              />
            </div>
            <div className="p-4 bg-gray-50 min-h-[280px]">
              {previewTab === 'google' && (
                <GooglePreview
                  title={previewTitle}
                  description={previewDesc}
                  url={previewUrl}
                  domain={previewDomain}
                />
              )}
              {previewTab === 'twitter' && (
                <TwitterPreview
                  card={data.twitterCard}
                  title={previewTitle}
                  description={previewDesc}
                  image={data.ogImage}
                  domain={previewDomain}
                  noImageLabel={t('preview.noImage')}
                />
              )}
              {previewTab === 'facebook' && (
                <FacebookPreview
                  title={previewTitle}
                  description={previewDesc}
                  image={data.ogImage}
                  domain={previewDomain}
                  siteName={data.ogSiteName}
                  noImageLabel={t('preview.noImage')}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ============ Bottom: HTML output ============ */}
      <section className="rounded-lg border border-gray-200 bg-white">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <Code2 className="w-4 h-4" /> {t('section.output')}
          </h2>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={copyHtml}
              className="px-3 py-1.5 text-xs font-medium bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? t('copied') : t('copy')}
            </button>
            <button
              type="button"
              onClick={downloadHtml}
              className="px-3 py-1.5 text-xs font-medium bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> {t('download')}
            </button>
          </div>
        </div>
        <textarea
          value={html}
          readOnly
          spellCheck={false}
          className="w-full h-72 px-4 py-3 text-xs font-mono bg-gray-900 text-gray-100 rounded-b-lg resize-none border-0 focus:outline-none"
        />
      </section>
    </div>
  )
}

// ---------- subcomponents ----------
interface CollapsibleProps {
  open: boolean
  onToggle: () => void
  icon: React.ReactNode
  title: string
  right?: React.ReactNode
  children: React.ReactNode
}
const Collapsible: React.FC<CollapsibleProps> = ({ open, onToggle, icon, title, right, children }) => (
  <section className="rounded-lg border border-gray-200 bg-white">
    <div className="w-full flex items-center gap-2 px-4 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50 rounded-lg transition-colors">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex items-center gap-2 flex-1 text-left"
      >
        {icon}
        <span>{title}</span>
      </button>
      {right && <span>{right}</span>}
      <button
        type="button"
        onClick={onToggle}
        aria-label="toggle"
        className="text-gray-400"
      >
        <ChevronDown
          className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
    </div>
    {open && <div className="px-4 pb-4 border-t border-gray-100 pt-3">{children}</div>}
  </section>
)

interface CounterProps {
  n: number
  max: number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: (key: string, opts?: any) => string
}
const Counter: React.FC<CounterProps> = ({ n, max, t }) => {
  const over = n > max
  return (
    <span className={`ml-2 text-xs ${over ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
      {t('counter', { n, max })}
    </span>
  )
}

interface FieldTextProps {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  className?: string
  counter?: CounterProps
}
const FieldText: React.FC<FieldTextProps> = ({
  label,
  value,
  onChange,
  placeholder,
  className = '',
  counter,
}) => (
  <label className={`block text-sm ${className}`}>
    <span className="flex items-center text-xs text-gray-500 mb-0.5">
      <span>{label}</span>
      {counter && <Counter {...counter} />}
    </span>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
      spellCheck={false}
    />
  </label>
)

type FieldTextareaProps = FieldTextProps
const FieldTextarea: React.FC<FieldTextareaProps> = ({
  label,
  value,
  onChange,
  placeholder,
  className = '',
  counter,
}) => (
  <label className={`block text-sm ${className}`}>
    <span className="flex items-center text-xs text-gray-500 mb-0.5">
      <span>{label}</span>
      {counter && <Counter {...counter} />}
    </span>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={3}
      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
      spellCheck={false}
    />
  </label>
)

interface PreviewTabBtnProps {
  active: boolean
  onClick: () => void
  label: string
}
const PreviewTabBtn: React.FC<PreviewTabBtnProps> = ({ active, onClick, label }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
      active
        ? 'bg-white text-indigo-600 border-b-2 border-indigo-600'
        : 'text-gray-500 hover:text-gray-800'
    }`}
  >
    {label}
  </button>
)

// Google search result snippet
const GooglePreview: React.FC<{
  title: string
  description: string
  url: string
  domain: string
}> = ({ title, description, url, domain }) => {
  const displayTitle = truncate(title || '—', 60)
  const displayDesc = truncate(description || '—', 160)
  const displayUrl = url || `https://${domain}`
  return (
    <div className="bg-white rounded-md p-4 border border-gray-200">
      <div className="flex items-center gap-2 text-xs text-gray-700">
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 border border-gray-200 text-[10px] text-gray-500 font-bold">
          {domain.charAt(0).toUpperCase() || 'S'}
        </span>
        <div className="leading-tight">
          <div className="font-medium text-gray-800">{domain}</div>
          <div className="text-[11px] text-gray-500 truncate max-w-[280px]">{displayUrl}</div>
        </div>
      </div>
      <a
        href="#"
        onClick={(e) => e.preventDefault()}
        className="block mt-2 text-[18px] leading-snug text-[#1a0dab] hover:underline visited:text-[#681da8]"
      >
        {displayTitle}
      </a>
      <p className="text-sm text-gray-600 leading-snug mt-1">{displayDesc}</p>
    </div>
  )
}

// Twitter / X card
const TwitterPreview: React.FC<{
  card: TwitterCardType
  title: string
  description: string
  image: string
  domain: string
  noImageLabel: string
}> = ({ card, title, description, image, domain, noImageLabel }) => {
  const isLarge = card === 'summary_large_image' || card === 'player'
  if (isLarge) {
    return (
      <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 max-w-md">
        <div className="bg-gray-100 aspect-[1.91/1] flex items-center justify-center">
          {image ? (
            <img
              src={image}
              alt=""
              onError={(e) => {
                ;(e.currentTarget as HTMLImageElement).style.display = 'none'
              }}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-xs text-gray-400">{noImageLabel}</span>
          )}
        </div>
        <div className="px-3 py-2 border-t border-gray-100">
          <div className="text-[11px] text-gray-500">{domain}</div>
          <div className="text-sm font-medium text-gray-900 line-clamp-1">{title || '—'}</div>
          <div className="text-xs text-gray-500 line-clamp-2">{description}</div>
        </div>
      </div>
    )
  }
  // summary / app: small square thumbnail on the left
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 max-w-md flex">
      <div className="bg-gray-100 w-28 aspect-square flex items-center justify-center shrink-0">
        {image ? (
          <img
            src={image}
            alt=""
            onError={(e) => {
              ;(e.currentTarget as HTMLImageElement).style.display = 'none'
            }}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-[10px] text-gray-400">{noImageLabel}</span>
        )}
      </div>
      <div className="px-3 py-2 flex-1 min-w-0">
        <div className="text-[11px] text-gray-500">{domain}</div>
        <div className="text-sm font-medium text-gray-900 line-clamp-2">{title || '—'}</div>
        <div className="text-xs text-gray-500 line-clamp-2 mt-0.5">{description}</div>
      </div>
    </div>
  )
}

// Facebook / LinkedIn card
const FacebookPreview: React.FC<{
  title: string
  description: string
  image: string
  domain: string
  siteName: string
  noImageLabel: string
}> = ({ title, description, image, domain, siteName, noImageLabel }) => (
  <div className="bg-white border border-gray-200 max-w-md">
    <div className="bg-gray-100 aspect-[1.91/1] flex items-center justify-center">
      {image ? (
        <img
          src={image}
          alt=""
          onError={(e) => {
            ;(e.currentTarget as HTMLImageElement).style.display = 'none'
          }}
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="text-xs text-gray-400 inline-flex items-center gap-1.5">
          <ImageIcon className="w-4 h-4" />
          {noImageLabel}
        </span>
      )}
    </div>
    <div className="px-3 py-2 bg-[#f2f3f5] border-t border-gray-200">
      <div className="text-[11px] text-gray-500 uppercase tracking-wider">
        {siteName || domain}
      </div>
      <div className="text-[15px] font-semibold text-gray-900 line-clamp-2">
        {title || '—'}
      </div>
      <div className="text-xs text-gray-500 line-clamp-2 mt-0.5">{description}</div>
    </div>
  </div>
)

export default MetaTagGen
