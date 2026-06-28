// 预览交互：把渲染图上的元素映射回源码。
// click → 定位源码标签；dblclick → 就地改名（仅文本↔源码可无歧义映射的图）。

/** 取源码首词判断图类型（graph 归一为 flowchart）。 */
export function diagramType(src: string): string {
  const head = src.trim().split(/[\s\n]+/)[0]?.toLowerCase() ?? ''
  return head === 'graph' ? 'flowchart' : head
}

// 标签文本↔源码映射清晰、可安全改名的图类型
export const RENAME_TYPES = ['flowchart', 'pie', 'gantt'] as const

export function canRename(src: string): boolean {
  return (RENAME_TYPES as readonly string[]).includes(diagramType(src))
}

export interface LabelHit {
  text: string
  rect: DOMRect
}

/** 从点击目标向上找最近的标签文本（SVG <text> 或 htmlLabels 的 .nodeLabel/.edgeLabel）。 */
export function labelFromTarget(target: EventTarget | null): LabelHit | null {
  let el = target as Element | null
  for (let i = 0; el && i < 6; i++, el = el.parentElement) {
    const isLabel =
      el instanceof SVGTextElement ||
      el.classList?.contains('nodeLabel') ||
      el.classList?.contains('edgeLabel')
    if (isLabel) {
      const text = el.textContent?.trim()
      if (text) return { text, rect: el.getBoundingClientRect() }
    }
  }
  // 兜底：直接命中的最深元素自身文本（短、单行才认为是标签）
  const direct = target as Element | null
  const text = direct?.textContent?.trim()
  if (direct && text && text.length <= 80 && !text.includes('\n')) {
    return { text, rect: direct.getBoundingClientRect() }
  }
  return null
}

/** 替换源码中 from 的首次出现（避免改掉同名的其它 token）。 */
export function replaceFirst(src: string, from: string, to: string): string {
  if (from === to) return src
  const i = src.indexOf(from)
  // ponytail: 仅替换首次出现；同名标签可能改错，靠实时预览 + 编辑器撤销兜底
  return i < 0 ? src : src.slice(0, i) + to + src.slice(i + from.length)
}

/** 返回 from 首次出现的 [起, 止] 偏移，用于在编辑器中选中定位；找不到返回 null。 */
export function rangeOf(src: string, text: string): [number, number] | null {
  const i = src.indexOf(text)
  return i < 0 ? null : [i, i + text.length]
}
