/** 把段落数组格式化成 plain / markdown / html。 */

export type Format = 'plain' | 'markdown' | 'html'

export type FormatOptions = {
  /** Markdown 模式下：每 N 段插一个 ## 标题（0 = 不插） */
  markdownHeadingEvery?: number
  /** HTML 模式下：用 <p> 包段（否则只用换行） */
  htmlParagraphs?: boolean
}

const FAUX_HEADINGS_LATIN = [
  'Vivamus malesuada',
  'Mauris fermentum',
  'Praesent commodo',
  'Quisque pretium',
  'Donec aliquet',
]

const FAUX_HEADINGS_CHINESE = [
  '万物之本',
  '春秋四时',
  '言语之道',
  '风雨人生',
  '山川岁月',
]

function pickHeading(flavor: 'latin' | 'chinese', idx: number): string {
  const arr = flavor === 'latin' ? FAUX_HEADINGS_LATIN : FAUX_HEADINGS_CHINESE
  return arr[idx % arr.length]
}

export function formatParagraphs(
  paragraphs: string[],
  format: Format,
  flavor: 'latin' | 'chinese',
  options: FormatOptions = {},
): string {
  if (format === 'plain') return paragraphs.join('\n\n')

  if (format === 'markdown') {
    const every = options.markdownHeadingEvery ?? 0
    const out: string[] = []
    let headingIdx = 0
    for (let i = 0; i < paragraphs.length; i++) {
      if (every > 0 && i % every === 0) {
        out.push(`## ${pickHeading(flavor, headingIdx++)}`)
      }
      out.push(paragraphs[i])
    }
    return out.join('\n\n')
  }

  // html
  const usePara = options.htmlParagraphs ?? true
  if (usePara) return paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join('\n')
  return paragraphs.map(escapeHtml).join('<br><br>')
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

export const __testing = { escapeHtml, pickHeading }
