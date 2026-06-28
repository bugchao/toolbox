// mermaid 运行时：单例初始化 + 注册外部图（ZenUML）与布局引擎（ELK / tidy-tree），
// 全部动态 import，避免主 bundle 体积爆炸。
export type MermaidTheme = 'default' | 'dark' | 'forest' | 'neutral'
export type MermaidLayout = 'dagre' | 'elk' | 'tidy-tree'

export const LAYOUTS: MermaidLayout[] = ['dagre', 'elk', 'tidy-tree']

let registered = false
let renderSeq = 0

type MermaidApi = typeof import('mermaid')['default']

async function ensureRegistered(m: MermaidApi) {
  if (registered) return
  registered = true
  // 注册一次：外部图 + 布局引擎。失败时降级（不阻塞基础渲染）。
  const [zen, elk, tidy] = await Promise.all([
    import('@mermaid-js/mermaid-zenuml').then((x) => x.default).catch(() => null),
    import('@mermaid-js/layout-elk').then((x) => x.default).catch(() => null),
    import('@mermaid-js/layout-tidy-tree').then((x) => x.default).catch(() => null),
  ])
  if (zen) m.registerExternalDiagrams([zen])
  const loaders = [...(elk ?? []), ...(tidy ?? [])]
  if (loaders.length) m.registerLayoutLoaders(loaders)
}

/**
 * 渲染 mermaid 源码为 SVG 字符串；先 parse 校验再 render。
 * `primaryColor` 非空时启用 base 主题并按该色派生配色（自定义主题）。
 */
export async function renderMermaid(
  src: string,
  theme: MermaidTheme,
  layout: MermaidLayout,
  primaryColor?: string,
): Promise<string> {
  const m = (await import('mermaid')).default
  await ensureRegistered(m)
  m.initialize({ startOnLoad: false, securityLevel: 'strict', theme, layout })
  // 自定义配色用 init 指令逐次注入：theme 与 themeVariables 必须同时给，
  // base 主题才会基于 primaryColor 重新派生整套配色（仅给 themeVariables 不会重算）。
  // 指令作用于单次 parse/render，不污染全局 config，清除后自动恢复内置主题。
  const prefix = primaryColor
    ? `%%{init: ${JSON.stringify({ theme: 'base', themeVariables: { primaryColor } })}}%%\n`
    : ''
  await m.parse(prefix + src)
  renderSeq += 1
  const { svg } = await m.render(`mermaid-tool-${renderSeq}`, prefix + src)
  return svg
}
