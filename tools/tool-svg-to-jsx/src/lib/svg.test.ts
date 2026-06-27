import { describe, it, expect } from 'vitest'
import { build, optimizeSvg, sanitizeComponentName, svgToJsxMarkup } from './svg'

const baseOpts = {
  stripComments: true,
  collapseWhitespace: true,
  stripMeta: true,
  toJsx: true,
  wrapComponent: false,
  typescript: false,
  forwardRef: false,
  componentName: 'SvgIcon',
}

describe('optimizeSvg', () => {
  it('removes comments, xml declaration and doctype', () => {
    const src = `<?xml version="1.0"?>\n<!DOCTYPE svg>\n<!-- hello --><svg><path d="M0 0"/></svg>`
    const out = optimizeSvg(src, { stripComments: true, collapseWhitespace: true, stripMeta: true })
    expect(out).not.toContain('<?xml')
    expect(out).not.toContain('DOCTYPE')
    expect(out).not.toContain('hello')
    expect(out.startsWith('<svg>')).toBe(true)
  })

  it('strips inkscape/sodipodi metadata', () => {
    const src = `<svg xmlns:inkscape="x" inkscape:version="1.0" sodipodi:docname="a.svg"><sodipodi:namedview id="n"/><path d="M0 0"/></svg>`
    const out = optimizeSvg(src, { stripComments: false, collapseWhitespace: true, stripMeta: true })
    expect(out).not.toContain('inkscape')
    expect(out).not.toContain('sodipodi')
    expect(out).toContain('<path')
  })

  it('collapses whitespace between tags', () => {
    const out = optimizeSvg('<svg>\n  <path d="M0 0" />\n</svg>', { stripComments: false, collapseWhitespace: true, stripMeta: false })
    expect(out).toBe('<svg><path d="M0 0" /></svg>')
  })
})

describe('svgToJsxMarkup', () => {
  it('converts class to className', () => {
    expect(svgToJsxMarkup('<svg class="a"><path/></svg>')).toContain('className="a"')
  })

  it('camelCases hyphenated attributes', () => {
    const out = svgToJsxMarkup('<path stroke-width="2" stroke-linecap="round" fill-rule="evenodd" clip-rule="evenodd"/>')
    expect(out).toContain('strokeWidth="2"')
    expect(out).toContain('strokeLinecap="round"')
    expect(out).toContain('fillRule="evenodd"')
    expect(out).toContain('clipRule="evenodd"')
  })

  it('maps namespaced attributes', () => {
    const out = svgToJsxMarkup('<svg xmlns:xlink="x"><use xlink:href="#a"/></svg>')
    expect(out).toContain('xmlnsXlink="x"')
    expect(out).toContain('xlinkHref="#a"')
  })

  it('converts style string to object', () => {
    const out = svgToJsxMarkup('<rect style="fill:red;stroke-width:2"/>')
    expect(out).toContain('style={{ fill: "red", strokeWidth: 2 }}')
  })

  it('keeps data-/aria- attributes untouched', () => {
    const out = svgToJsxMarkup('<svg data-foo-bar="1" aria-hidden="true"><path/></svg>')
    expect(out).toContain('data-foo-bar="1"')
    expect(out).toContain('aria-hidden="true"')
  })

  it('makes known void tags self-closing', () => {
    expect(svgToJsxMarkup('<path d="M0 0">')).toBe('<path d="M0 0" />')
  })
})

describe('sanitizeComponentName', () => {
  it('pascal-cases and falls back', () => {
    expect(sanitizeComponentName('my icon')).toBe('MyIcon')
    expect(sanitizeComponentName('')).toBe('SvgIcon')
    expect(sanitizeComponentName('123')).toBe('Svg123')
    expect(sanitizeComponentName('arrow-left')).toBe('ArrowLeft')
  })
})

describe('build', () => {
  it('errors on empty input', () => {
    expect(build('', baseOpts).error).toBe('empty')
  })

  it('errors when no svg root', () => {
    expect(build('<div>x</div>', baseOpts).error).toBe('noSvg')
  })

  it('returns optimized svg when neither jsx nor component', () => {
    const r = build('<svg> <path class="a"/> </svg>', { ...baseOpts, toJsx: false, wrapComponent: false })
    expect(r.code).toContain('class="a"')
    expect(r.error).toBeUndefined()
  })

  it('wraps into a plain component', () => {
    const r = build('<svg class="a"><path/></svg>', { ...baseOpts, wrapComponent: true })
    expect(r.code).toContain('const SvgIcon = (props) => (')
    expect(r.code).toContain('{...props}')
    expect(r.code).toContain('className="a"')
    expect(r.code).toContain('export default SvgIcon')
  })

  it('wraps into a typescript forwardRef component', () => {
    const r = build('<svg><path/></svg>', { ...baseOpts, wrapComponent: true, typescript: true, forwardRef: true, componentName: 'MyIcon' })
    expect(r.code).toContain('React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>')
    expect(r.code).toContain('ref={ref}')
    expect(r.code).toContain("MyIcon.displayName = 'MyIcon'")
  })

  it('always exposes a legal svg preview', () => {
    const r = build('<svg class="a"><path stroke-width="2"/></svg>', { ...baseOpts, wrapComponent: true })
    expect(r.preview).toContain('<svg')
    expect(r.preview).not.toContain('className')
  })
})
