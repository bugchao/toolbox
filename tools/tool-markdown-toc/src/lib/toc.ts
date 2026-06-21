/** 从 Markdown 提取标题并生成目录（TOC）。零依赖纯函数。 */

export type Heading = {
  level: number // 1-6
  text: string
  /** GitHub 风格锚点 slug（含同名去重后缀） */
  slug: string
}

/** GitHub 风格 slug：小写、去标点、空格转连字符、保留中文/字母数字。 */
export function githubSlug(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '') // 去标点（保留字母/数字/空白/连字符，含 CJK）
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * 提取标题。规则：
 * - ATX：`#`–`######` 开头
 * - 跳过围栏代码块 ``` / ~~~ 内的内容
 * - 同名 slug 追加 -1 -2 去重（GitHub 行为）
 */
export function extractHeadings(markdown: string): Heading[] {
  const lines = markdown.split(/\r\n|\r|\n/)
  const headings: Heading[] = []
  const slugCount = new Map<string, number>()
  let fence: string | null = null

  for (const line of lines) {
    const fenceMatch = line.match(/^\s*(```+|~~~+)/)
    if (fenceMatch) {
      const marker = fenceMatch[1][0].repeat(3)
      if (fence === null) fence = marker
      else if (marker === fence) fence = null
      continue
    }
    if (fence !== null) continue

    const m = line.match(/^(#{1,6})\s+(.+?)\s*#*\s*$/)
    if (!m) continue
    const level = m[1].length
    // 去掉行内 markdown 标记（**bold** `code` [link](url)）取纯文本
    const text = stripInline(m[2])
    let slug = githubSlug(text)
    const seen = slugCount.get(slug) ?? 0
    slugCount.set(slug, seen + 1)
    if (seen > 0) slug = `${slug}-${seen}`
    headings.push({ level, text, slug })
  }
  return headings
}

function stripInline(s: string): string {
  return s
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1') // [text](url) / ![alt](url)
    .replace(/`([^`]+)`/g, '$1')               // `code`
    .replace(/\*\*([^*]+)\*\*/g, '$1')         // **bold**
    .replace(/\*([^*]+)\*/g, '$1')             // *italic*
    .replace(/__([^_]+)__/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .trim()
}

export type TocOptions = {
  minLevel?: number // 默认 1
  maxLevel?: number // 默认 6
  /** 有序列表（1. 2.）还是无序（-） */
  ordered?: boolean
  /** 缩进单位（空格数） */
  indent?: number
  /** 生成链接还是纯文本 */
  links?: boolean
}

/**
 * 由标题生成 Markdown TOC。
 * 缩进基于「出现的最浅层级」归零，避免文档从 h2 起步时多一层空缩进。
 */
export function buildToc(headings: Heading[], options: TocOptions = {}): string {
  const min = options.minLevel ?? 1
  const max = options.maxLevel ?? 6
  const ordered = options.ordered ?? false
  const indentSize = options.indent ?? 2
  const links = options.links ?? true

  const filtered = headings.filter((h) => h.level >= min && h.level <= max)
  if (filtered.length === 0) return ''
  const base = Math.min(...filtered.map((h) => h.level))

  return filtered
    .map((h) => {
      const depth = h.level - base
      const pad = ' '.repeat(depth * indentSize)
      const bullet = ordered ? '1.' : '-'
      const label = links ? `[${h.text}](#${h.slug})` : h.text
      return `${pad}${bullet} ${label}`
    })
    .join('\n')
}
