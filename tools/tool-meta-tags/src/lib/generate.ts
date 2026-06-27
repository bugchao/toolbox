/**
 * Meta / Open Graph / Twitter Card 标签生成纯函数。
 * 所有输出为 HTML 标签字符串（数据，不参与 i18n）。
 */

export type TwitterCardType = 'summary' | 'summary_large_image'

export interface MetaTagsForm {
  title: string
  description: string
  url: string
  siteName: string
  author: string
  image: string
  twitterCard: TwitterCardType
  twitterHandle: string
  locale: string
  themeColor: string
}

export const emptyForm: MetaTagsForm = {
  title: '',
  description: '',
  url: '',
  siteName: '',
  author: '',
  image: '',
  twitterCard: 'summary_large_image',
  twitterHandle: '',
  locale: '',
  themeColor: '',
}

/** 转义 HTML 属性值，防止生成的标签被破坏。 */
export function escapeAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** 规范化 Twitter handle：去掉多余空白并确保以 @ 开头。 */
export function normalizeHandle(handle: string): string {
  const trimmed = handle.trim()
  if (!trimmed) return ''
  const bare = trimmed.replace(/^@+/, '')
  return bare ? `@${bare}` : ''
}

/** 从 URL 提取可读域名，用于预览卡片；失败时回退到原始字符串。 */
export function extractDomain(url: string): string {
  const trimmed = url.trim()
  if (!trimmed) return ''
  try {
    const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
    return new URL(withProtocol).hostname.replace(/^www\./, '')
  } catch {
    return trimmed.replace(/^https?:\/\//i, '').replace(/^www\./, '').split('/')[0]
  }
}

interface TagLine {
  /** 标签字符串 */
  tag: string
}

/** 生成完整的 <head> 标签字符串，空字段对应的标签会被省略。 */
export function generateTags(form: MetaTagsForm): string {
  const title = form.title.trim()
  const description = form.description.trim()
  const url = form.url.trim()
  const siteName = form.siteName.trim()
  const author = form.author.trim()
  const image = form.image.trim()
  const locale = form.locale.trim()
  const themeColor = form.themeColor.trim()
  const handle = normalizeHandle(form.twitterHandle)

  const lines: TagLine[] = []
  const meta = (name: string, content: string) => {
    if (content) lines.push({ tag: `<meta name="${name}" content="${escapeAttr(content)}" />` })
  }
  const property = (prop: string, content: string) => {
    if (content) lines.push({ tag: `<meta property="${prop}" content="${escapeAttr(content)}" />` })
  }
  const comment = (text: string) => lines.push({ tag: `<!-- ${text} -->` })

  // 基础 SEO
  comment('Primary / SEO')
  if (title) lines.push({ tag: `<title>${escapeAttr(title)}</title>` })
  meta('description', description)
  meta('author', author)
  meta('theme-color', themeColor)
  if (url) lines.push({ tag: `<link rel="canonical" href="${escapeAttr(url)}" />` })

  // Open Graph
  comment('Open Graph / Facebook')
  property('og:type', title || description || url || image ? 'website' : '')
  property('og:title', title)
  property('og:description', description)
  property('og:url', url)
  property('og:image', image)
  property('og:site_name', siteName)
  property('og:locale', locale)

  // Twitter Card
  comment('Twitter')
  meta('twitter:card', title || description || image ? form.twitterCard : '')
  meta('twitter:title', title)
  meta('twitter:description', description)
  meta('twitter:image', image)
  meta('twitter:site', handle)

  // 去掉没有任何实体标签的孤立注释
  const cleaned: TagLine[] = []
  for (let i = 0; i < lines.length; i++) {
    const cur = lines[i]
    const isComment = cur.tag.startsWith('<!--')
    if (isComment) {
      const next = lines[i + 1]
      if (!next || next.tag.startsWith('<!--')) continue
      if (cleaned.length > 0) cleaned.push({ tag: '' })
    }
    cleaned.push(cur)
  }

  return cleaned.map((l) => l.tag).join('\n')
}
