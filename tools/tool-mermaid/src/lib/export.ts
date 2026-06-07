/**
 * 纯函数导出工具，不依赖 DOM —— 便于在 vitest 下直接断言。
 */

const SVG_XMLNS = 'http://www.w3.org/2000/svg'

/**
 * 给一段 SVG 字符串补齐 xmlns 属性。
 * - 没有 xmlns 时插入 `xmlns="http://www.w3.org/2000/svg"`
 * - 已经有 xmlns 时原样返回，避免重复
 */
export function sanitizeSvgForExport(svg: string): string {
  if (typeof svg !== 'string' || svg.length === 0) return svg
  // 只处理首个 <svg ...> 标签
  return svg.replace(/<svg\b([^>]*)>/, (full, attrs: string) => {
    if (/\sxmlns\s*=/.test(attrs)) return full
    // attrs 可能以空格开头/结尾，统一插入到 <svg 之后
    const trimmed = attrs.replace(/^\s+/, '')
    const prefix = attrs.startsWith(' ') ? ' ' : ' '
    return `<svg${prefix}xmlns="${SVG_XMLNS}"${trimmed ? ' ' + trimmed : ''}>`
  })
}

/**
 * 把 SVG 字符串包装成 image/svg+xml 的 Blob，可直接拿去触发下载。
 */
export function svgToBlob(svg: string): Blob {
  return new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
}

/**
 * 给导出文件取文件名。
 *
 * - 输入空 / undefined → `mermaid-<timestamp>.png`
 * - 输入已有扩展名 → 把扩展名替换为 `.png`
 * - 输入纯名字 → 直接 `<name>.png`
 */
export function derivePngFilename(srcFilename?: string | null): string {
  const fallback = `mermaid-${Date.now()}.png`
  if (!srcFilename || !srcFilename.trim()) return fallback
  const name = srcFilename.trim()
  if (/\.[a-z0-9]{1,6}$/i.test(name)) {
    return name.replace(/\.[a-z0-9]{1,6}$/i, '.png')
  }
  return `${name}.png`
}

/** SVG 文件名同理 */
export function deriveSvgFilename(srcFilename?: string | null): string {
  const fallback = `mermaid-${Date.now()}.svg`
  if (!srcFilename || !srcFilename.trim()) return fallback
  const name = srcFilename.trim()
  if (/\.[a-z0-9]{1,6}$/i.test(name)) {
    return name.replace(/\.[a-z0-9]{1,6}$/i, '.svg')
  }
  return `${name}.svg`
}
