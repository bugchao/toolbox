// 手绘风格：用 svg2roughjs 把已渲染的 SVG 转成 sketch SVG。
// svg2roughjs 依赖真实 DOM（getBBox/computedStyle），故临时挂到屏外容器后再读取结果。
export async function toRoughSvg(svg: string): Promise<string> {
  const { Svg2Roughjs, OutputType } = await import('svg2roughjs')
  const host = document.createElement('div')
  host.style.cssText = 'position:fixed;left:-99999px;top:0;opacity:0;pointer-events:none'
  const srcWrap = document.createElement('div')
  srcWrap.innerHTML = svg
  const srcSvg = srcWrap.querySelector('svg')
  if (!srcSvg) return svg
  const out = document.createElement('div')
  host.append(srcWrap, out)
  document.body.append(host)
  try {
    const s = new Svg2Roughjs(out, OutputType.SVG)
    s.svg = srcSvg as SVGSVGElement
    await s.sketch()
    return out.querySelector('svg')?.outerHTML ?? svg
  } catch {
    return svg // ponytail: 手绘失败回退原图，不打断预览
  } finally {
    host.remove()
  }
}
