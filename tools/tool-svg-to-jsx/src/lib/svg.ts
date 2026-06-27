/**
 * SVG 优化 + 转 React 组件核心逻辑。
 * 全部用轻量正则/字符串处理实现，不依赖 svgo 等第三方运行时库。
 */

export interface OptimizeOptions {
  /** 移除注释 */
  stripComments: boolean
  /** 折叠空白、移除标签间多余空白 */
  collapseWhitespace: boolean
  /** 移除 XML 声明、DOCTYPE 以及编辑器元数据（inkscape/sodipodi 命名空间与属性等） */
  stripMeta: boolean
}

export interface JsxOptions extends OptimizeOptions {
  /** 把属性转换成 JSX 形式（className、camelCase、style 对象等） */
  toJsx: boolean
  /** 包成 React 组件 */
  wrapComponent: boolean
  /** 生成 TypeScript（带类型标注） */
  typescript: boolean
  /** forwardRef + 透传 props */
  forwardRef: boolean
  /** 组件名 */
  componentName: string
}

export interface BuildResult {
  /** 最终输出代码（优化后的 SVG 或 React 组件） */
  code: string
  /** 用于实时预览的纯 SVG（始终是合法 HTML，可 dangerouslySetInnerHTML） */
  preview: string
  /** 输入为空或没有 <svg> 根 */
  error?: 'empty' | 'noSvg'
}

const SELF_CLOSING_TAGS = new Set([
  'path',
  'rect',
  'circle',
  'ellipse',
  'line',
  'polyline',
  'polygon',
  'stop',
  'use',
  'image',
  'feOffset',
  'feGaussianBlur',
  'feBlend',
  'feColorMatrix',
  'feFlood',
  'feMerge',
  'feMergeNode',
])

/** 常见 SVG 连字符 / 命名空间属性 → JSX camelCase 映射（覆盖手写难以推导的特例）。 */
const ATTR_MAP: Record<string, string> = {
  class: 'className',
  for: 'htmlFor',
  tabindex: 'tabIndex',
  'xmlns:xlink': 'xmlnsXlink',
  'xlink:href': 'xlinkHref',
  'xlink:title': 'xlinkTitle',
  'xlink:role': 'xlinkRole',
  'xlink:show': 'xlinkShow',
  'xlink:actuate': 'xlinkActuate',
  'xlink:arcrole': 'xlinkArcrole',
  'xml:space': 'xmlSpace',
  'xml:lang': 'xmlLang',
  'xml:base': 'xmlBase',
}

/** 不应被 camelCase 化的属性（保持原样，含连字符的数据/aria 属性）。 */
function isPreservedAttr(name: string): boolean {
  return name.startsWith('data-') || name.startsWith('aria-')
}

/** kebab-case → camelCase，例如 stroke-width → strokeWidth。 */
function kebabToCamel(name: string): string {
  return name.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())
}

/** 把 CSS style 字符串 "fill:red;stroke-width:2" 转成 JSX 对象字面量字符串。 */
function styleStringToObject(style: string): string {
  const entries = style
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((decl) => {
      const idx = decl.indexOf(':')
      if (idx === -1) return null
      const rawKey = decl.slice(0, idx).trim()
      const rawVal = decl.slice(idx + 1).trim()
      if (!rawKey) return null
      const key = rawKey.startsWith('--') ? rawKey : kebabToCamel(rawKey)
      const numeric = /^-?\d+(\.\d+)?$/.test(rawVal)
      const quotedKey = /^[a-zA-Z_$][\w$]*$/.test(key) ? key : JSON.stringify(key)
      const value = numeric ? rawVal : JSON.stringify(rawVal)
      return `${quotedKey}: ${value}`
    })
    .filter((x): x is string => x !== null)
  return `{{ ${entries.join(', ')} }}`
}

/** 去掉 XML 声明、DOCTYPE 与编辑器元数据。 */
function stripMetadata(svg: string): string {
  let out = svg
  // XML 声明
  out = out.replace(/<\?xml[\s\S]*?\?>/gi, '')
  // DOCTYPE
  out = out.replace(/<!DOCTYPE[\s\S]*?>/gi, '')
  // 编辑器专用元素（inkscape / sodipodi 命名空间下的元素，如 <sodipodi:namedview .../>）
  out = out.replace(/<(?:inkscape|sodipodi):[a-zA-Z-]+[\s\S]*?(?:\/>|<\/(?:inkscape|sodipodi):[a-zA-Z-]+>)/g, '')
  // <metadata>...</metadata>
  out = out.replace(/<metadata[\s\S]*?<\/metadata>/gi, '')
  // 编辑器命名空间声明与带前缀属性（xmlns:inkscape、inkscape:xxx、sodipodi:xxx 等）
  out = out.replace(/\s+xmlns:(?:inkscape|sodipodi|dc|cc|rdf)="[^"]*"/g, '')
  out = out.replace(/\s+(?:inkscape|sodipodi):[a-zA-Z-]+="[^"]*"/g, '')
  return out
}

/** 优化 SVG 源码（纯字符串处理）。 */
export function optimizeSvg(svg: string, opts: OptimizeOptions): string {
  let out = svg

  if (opts.stripMeta) {
    out = stripMetadata(out)
  }

  if (opts.stripComments) {
    out = out.replace(/<!--[\s\S]*?-->/g, '')
  }

  if (opts.collapseWhitespace) {
    // 折叠标签之间的空白
    out = out.replace(/>\s+</g, '><')
    // 折叠属性间多余空白
    out = out.replace(/\s{2,}/g, ' ')
  }

  return out.trim()
}

/** 把一段 SVG 标记里的属性转成 JSX 形式。 */
export function svgToJsxMarkup(svg: string): string {
  // 逐个标签处理，避免触碰文本节点内容
  return svg.replace(/<([a-zA-Z][\w:-]*)((?:[^<>"']|"[^"]*"|'[^']*')*?)(\/?)>/g, (match, tag: string, attrs: string, selfClose: string) => {
    // 注释或非元素直接返回
    if (tag.startsWith('!')) return match
    const convertedAttrs = convertAttributes(attrs)
    // 已写成自闭合，或属于已知 self-closing 标签 → 输出合法 JSX 自闭合
    const selfClosing = Boolean(selfClose) || SELF_CLOSING_TAGS.has(tag)
    const attrPart = convertedAttrs ? ` ${convertedAttrs}` : ''
    return selfClosing ? `<${tag}${attrPart} />` : `<${tag}${attrPart}>`
  })
}

/** 转换单个开始标签内的属性串。 */
function convertAttributes(attrs: string): string {
  const result: string[] = []
  const re = /([a-zA-Z_:][\w:.-]*)\s*=\s*("([^"]*)"|'([^']*)')|([a-zA-Z_:][\w:.-]*)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(attrs)) !== null) {
    const name = m[1] ?? m[5]
    if (!name) continue
    const hasValue = m[1] !== undefined
    const value = m[3] ?? m[4] ?? ''

    // 保留 data-*/aria-*
    if (isPreservedAttr(name)) {
      result.push(hasValue ? `${name}="${value}"` : name)
      continue
    }

    const lower = name.toLowerCase()
    let jsxName: string

    if (ATTR_MAP[lower]) {
      jsxName = ATTR_MAP[lower]
    } else if (name.includes(':')) {
      // 其它命名空间属性（如 xlink:foo）→ 去冒号 camelCase
      jsxName = kebabToCamel(name.replace(/:/g, '-'))
    } else if (name.includes('-')) {
      jsxName = kebabToCamel(lower)
    } else {
      jsxName = name
    }

    if (!hasValue) {
      result.push(jsxName)
      continue
    }

    if (jsxName === 'style') {
      result.push(`style=${styleStringToObject(value)}`)
    } else {
      result.push(`${jsxName}="${value}"`)
    }
  }
  return result.join(' ')
}

/** 把 props 透传/ref 注入到 <svg ...> 根标签的属性里。 */
function injectSvgRootProps(markup: string, spread: string): string {
  return markup.replace(/<svg\b([^>]*)>/, (full, attrs: string) => {
    return `<svg${attrs} ${spread}>`
  })
}

/** 构建最终输出：优化的 SVG 或 React 组件。 */
export function build(input: string, opts: JsxOptions): BuildResult {
  const trimmed = input.trim()
  if (!trimmed) {
    return { code: '', preview: '', error: 'empty' }
  }
  if (!/<svg[\s>]/i.test(trimmed)) {
    return { code: '', preview: '', error: 'noSvg' }
  }

  const optimized = optimizeSvg(trimmed, opts)
  // 预览始终用优化后的原生 SVG（合法 HTML）
  const preview = optimized

  // 仅优化 / 不转 JSX：直接返回优化后的 SVG
  if (!opts.toJsx && !opts.wrapComponent) {
    return { code: optimized, preview }
  }

  // 包成组件时必须转 JSX，否则 class= 等属性在组件里非法
  let markup = opts.toJsx || opts.wrapComponent ? svgToJsxMarkup(optimized) : optimized

  if (!opts.wrapComponent) {
    return { code: markup, preview }
  }

  const name = sanitizeComponentName(opts.componentName)

  if (opts.forwardRef) {
    markup = injectSvgRootProps(markup, '{...props}\n      ref={ref}')
  } else {
    markup = injectSvgRootProps(markup, '{...props}')
  }

  const indented = indent(markup, opts.forwardRef ? 6 : 4)
  const code = opts.forwardRef
    ? buildForwardRefComponent(name, indented, opts.typescript)
    : buildPlainComponent(name, indented, opts.typescript)

  return { code, preview }
}

/** 清洗组件名为合法 PascalCase 标识符。 */
export function sanitizeComponentName(raw: string): string {
  const cleaned = (raw || '').replace(/[^a-zA-Z0-9]+/g, ' ').trim()
  if (!cleaned) return 'SvgIcon'
  const pascal = cleaned
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join('')
  // 标识符不能以数字开头
  return /^[0-9]/.test(pascal) ? `Svg${pascal}` : pascal
}

function indent(text: string, spaces: number): string {
  const pad = ' '.repeat(spaces)
  return text
    .split('\n')
    .map((line) => (line.trim() ? pad + line : line))
    .join('\n')
}

function buildPlainComponent(name: string, markup: string, ts: boolean): string {
  if (ts) {
    return `import * as React from 'react'

const ${name} = (props: React.SVGProps<SVGSVGElement>) => (
${markup}
)

export default ${name}
`
  }
  return `import * as React from 'react'

const ${name} = (props) => (
${markup}
)

export default ${name}
`
}

function buildForwardRefComponent(name: string, markup: string, ts: boolean): string {
  if (ts) {
    return `import * as React from 'react'

const ${name} = React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>(
  (props, ref) => (
${markup}
  ),
)

${name}.displayName = '${name}'

export default ${name}
`
  }
  return `import * as React from 'react'

const ${name} = React.forwardRef((props, ref) => (
${markup}
))

${name}.displayName = '${name}'

export default ${name}
`
}
