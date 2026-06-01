/**
 * Markdown 渲染：marked 解析 → DOMPurify 净化 → 返回 HTML 字符串。
 *
 * - 两个库都按需 import（首屏不打包）
 * - 失败/无浏览器环境：返回原文（前面套 <pre>），不抛
 */

let parserPromise: Promise<{
  parse: (md: string) => string
  sanitize: (html: string) => string
}> | null = null

async function loadParser() {
  if (!parserPromise) {
    parserPromise = (async () => {
      const [{ marked }, DOMPurifyMod] = await Promise.all([
        import('marked'),
        import('dompurify'),
      ])
      const DOMPurify = DOMPurifyMod.default
      // marked v15 默认开启 GFM、breaks=false；保留默认行为
      return {
        parse: (md: string) => marked.parse(md, { async: false }) as string,
        sanitize: (html: string) => DOMPurify.sanitize(html, {
          // 允许 img / a 等常见标签；剥离 script / event handler
          USE_PROFILES: { html: true },
        }),
      }
    })()
  }
  return parserPromise
}

/** 把 markdown 字符串渲染为净化后的 HTML 字符串；失败时返回 escape 后的原文。 */
export async function renderMarkdown(md: string): Promise<string> {
  if (!md) return ''
  try {
    const { parse, sanitize } = await loadParser()
    return sanitize(parse(md))
  } catch {
    return `<pre>${escapeHtml(md)}</pre>`
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export const __testing = { escapeHtml }
