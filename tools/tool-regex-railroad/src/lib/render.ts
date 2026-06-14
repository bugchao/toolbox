/**
 * IR → SVG 铁路图。
 *
 * 几何模型：每个节点报 { w, h, ay }，
 *  - w: 宽
 *  - h: 高
 *  - ay: 入口/出口 y 偏移（节点上下对称所以入口==出口）
 *
 * 布局：
 *  - Seq: 水平串接，节点之间 ARROW_LEN 长度的水平线
 *  - Choice: 垂直堆叠，左右两侧分叉/汇合曲线
 *  - Optional: Choice(inner, ε)
 *  - Star: 类似 Optional 但加 loop-back
 *  - Plus: inner 下方加 loop-back（不能跳过）
 *  - Repeat: 同 Plus 但 label 标 min/max
 */
import type { IrNode } from './ir'

const ARROW = 12       // 节点之间水平线
const PAD_X = 8        // 文本左右内边距
const TERM_H = 28      // 终端节点高
const FONT = 13
const RAIL_X = 12      // 入口 x 偏移（让左侧留弧线空间）
const VGAP = 14        // 垂直堆叠时分支间距

export type Box = { w: number; h: number; ay: number; render: (x: number, y: number) => string }

const TONE_COLOR: Record<string, string> = {
  literal: '#1d4ed8',  // blue-700
  class: '#0e7490',    // cyan-700
  anchor: '#a16207',   // amber-700
  backref: '#9333ea',  // purple-600
  meta: '#6b7280',     // gray-500
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function termBox(label: string, tone = 'literal'): Box {
  const color = TONE_COLOR[tone] ?? TONE_COLOR.literal
  // 估算字宽：等宽字体下 ~7px/char + 边距
  const charW = 7.2
  const w = Math.max(36, label.length * charW + PAD_X * 2)
  return {
    w,
    h: TERM_H,
    ay: TERM_H / 2,
    render: (x, y) => {
      const txt = escapeXml(label)
      return `
        <rect x="${x}" y="${y}" rx="6" ry="6" width="${w}" height="${TERM_H}" fill="#fff" stroke="${color}" stroke-width="1.5"/>
        <text x="${x + w / 2}" y="${y + TERM_H / 2}" fill="${color}" font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" font-size="${FONT}" text-anchor="middle" dominant-baseline="central">${txt}</text>
      `
    },
  }
}

function seqBox(items: Box[]): Box {
  if (items.length === 0) return termBox('ε', 'meta')
  const ay = Math.max(...items.map((b) => b.ay))
  const totalH = Math.max(...items.map((b) => b.h + (ay - b.ay) + (b.h - b.ay - (b.h - ay - (b.h - b.ay)))))
  // 简化：用最高节点的高度，所有节点按各自 ay 对齐到 seq 的 ay
  const h = Math.max(...items.map((b) => Math.max(ay, b.ay) + Math.max(b.h - b.ay, b.h - ay)))
  let w = 0
  for (const it of items) w += it.w
  w += ARROW * Math.max(0, items.length - 1)
  return {
    w,
    h,
    ay,
    render: (x, y) => {
      let cur = x
      const segs: string[] = []
      for (let i = 0; i < items.length; i++) {
        const b = items[i]
        const by = y + ay - b.ay
        if (i > 0) {
          segs.push(`<line x1="${cur}" y1="${y + ay}" x2="${cur + ARROW}" y2="${y + ay}" stroke="#6b7280" stroke-width="1.2"/>`)
          cur += ARROW
        }
        segs.push(b.render(cur, by))
        cur += b.w
      }
      return segs.join('')
    },
  }
}

function choiceBox(options: Box[]): Box {
  if (options.length === 0) return termBox('ε', 'meta')
  if (options.length === 1) return options[0]
  const maxW = Math.max(...options.map((b) => b.w))
  // 总宽 = 左 RAIL + maxW + 右 RAIL
  const w = RAIL_X * 2 + maxW
  // 总高 = 所有分支高 + VGAP * (n-1)
  let h = 0
  for (let i = 0; i < options.length; i++) {
    if (i > 0) h += VGAP
    h += options[i].h
  }
  // 入口 ay 落在第一个分支的入口 y
  const ay = options[0].ay
  return {
    w,
    h,
    ay,
    render: (x, y) => {
      const segs: string[] = []
      // 主轨入口 → 出口在 y + ay
      let cy = y
      const entryY = y + ay
      for (let i = 0; i < options.length; i++) {
        if (i > 0) cy += VGAP
        const b = options[i]
        const bx = x + RAIL_X + (maxW - b.w) / 2
        const by = cy
        // 分支内入口 y
        const branchY = by + b.ay
        // 左侧弧线 (entryY → branchY)
        segs.push(curveLR(x, entryY, x + RAIL_X, branchY))
        // 分支节点
        segs.push(b.render(bx, by))
        // 分支后填充直线到右轨
        const innerEnd = bx + b.w
        const rightRail = x + RAIL_X + maxW
        if (innerEnd < rightRail) {
          segs.push(`<line x1="${innerEnd}" y1="${branchY}" x2="${rightRail}" y2="${branchY}" stroke="#6b7280" stroke-width="1.2"/>`)
        }
        // 右侧弧线 (branchY → entryY)
        segs.push(curveRL(rightRail, branchY, x + RAIL_X + maxW + RAIL_X, entryY))
        cy += b.h
      }
      return segs.join('')
    },
  }
}

/** 左上→右下平滑曲线（用直线 + 弧近似 H-line 比 cubic 简单可靠） */
function curveLR(x1: number, y1: number, x2: number, y2: number): string {
  if (Math.abs(y1 - y2) < 0.5) {
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#6b7280" stroke-width="1.2"/>`
  }
  const mx = (x1 + x2) / 2
  return `<path d="M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}" stroke="#6b7280" stroke-width="1.2" fill="none"/>`
}
function curveRL(x1: number, y1: number, x2: number, y2: number): string {
  return curveLR(x1, y1, x2, y2)
}

function optionalBox(inner: Box): Box {
  // Choice 之 inner 和 ε（直通）
  return choiceBox([inner, termBox('ε', 'meta')])
}

function loopBox(inner: Box, canSkip: boolean, label?: string): Box {
  // 简化：用 Choice(inner, ε) 上面 + 一条回跳箭头注释
  const base = canSkip ? choiceBox([inner, termBox(label ?? 'ε', 'meta')]) : inner
  // 在节点下方加 "*" / "+" 提示
  const tag = label ?? (canSkip ? '*' : '+')
  return {
    w: base.w,
    h: base.h + 18,
    ay: base.ay,
    render: (x, y) => {
      const main = base.render(x, y)
      const bottomY = y + base.h + 12
      const arrow = `
        <path d="M ${x + base.w - 6} ${y + base.ay + 14} q -6 18 -${base.w - 12} 0" stroke="#9ca3af" stroke-dasharray="3,3" stroke-width="1" fill="none"/>
        <text x="${x + base.w / 2}" y="${bottomY}" fill="#6b7280" font-size="10" text-anchor="middle">${escapeXml(tag)}</text>
      `
      return main + arrow
    },
  }
}

function groupBox(inner: Box, capturing: boolean, name?: string): Box {
  const tag = name ? `(?<${name}>)` : capturing ? '(…)' : '(?:…)'
  return {
    w: inner.w + 16,
    h: inner.h + 22,
    ay: inner.ay + 11,
    render: (x, y) => {
      const ix = x + 8
      const iy = y + 11
      return `
        <rect x="${x + 2}" y="${y + 2}" rx="4" ry="4" width="${inner.w + 12}" height="${inner.h + 18}" fill="none" stroke="#94a3b8" stroke-dasharray="2,3"/>
        <text x="${x + 6}" y="${y + 12}" fill="#475569" font-size="10">${escapeXml(tag)}</text>
        ${inner.render(ix, iy)}
      `
    },
  }
}

export function buildBox(node: IrNode): Box {
  switch (node.kind) {
    case 'term':
      return termBox(node.label, node.tone)
    case 'seq':
      return seqBox(node.items.map(buildBox))
    case 'choice':
      return choiceBox(node.options.map(buildBox))
    case 'optional':
      return optionalBox(buildBox(node.inner))
    case 'star':
      return loopBox(buildBox(node.inner), true, '*')
    case 'plus':
      return loopBox(buildBox(node.inner), false, '+')
    case 'repeat':
      return loopBox(buildBox(node.inner), node.min === 0, `{${node.min},${node.max ?? ''}}`)
    case 'group':
      return groupBox(buildBox(node.inner), node.capturing, node.name)
  }
}

export type RenderOptions = {
  padding?: number
  background?: string
}

export function renderSvg(node: IrNode, options: RenderOptions = {}): string {
  const padding = options.padding ?? 16
  const bg = options.background ?? '#fafafa'
  const box = buildBox(node)
  const w = box.w + padding * 2
  const h = box.h + padding * 2
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <rect width="${w}" height="${h}" fill="${bg}"/>
    ${box.render(padding, padding)}
  </svg>`
}
