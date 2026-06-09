/** 单文档导入 / 源 / SVG 导出工具，复用 downloadAsFile。 */
import type { DiagramDocument, DiagramEngine } from '../domain/types'
import { adapterFor, detectEngineByFilename } from '../adapters/registry'
import { downloadAsFile } from './json'
import { createDocument } from '../domain/factory'

const SOURCE_MIME: Record<DiagramEngine, string> = {
  mermaid: 'text/plain',
  plantuml: 'text/plain',
  drawio: 'application/xml',
}

/** 把单个 doc 的源码下载下来。 */
export function downloadSource(doc: DiagramDocument): void {
  const adapter = adapterFor(doc.engine)
  downloadAsFile(adapter.defaultSourceName(doc.title), doc.source, SOURCE_MIME[doc.engine])
}

/** 把 SVG 字符串下载下来（mermaid / plantuml 渲染后）。 */
export function downloadSvg(doc: DiagramDocument, svg: string): void {
  const name = adapterFor(doc.engine).defaultSourceName(doc.title).replace(/\.[^.]+$/, '.svg')
  downloadAsFile(name, svg, 'image/svg+xml')
}

/** 从单源文件读取（按扩展名识别 engine）创建一个新文档。 */
export type SourceImportResult =
  | { ok: true; document: DiagramDocument }
  | { ok: false; message: string }

/** 跨环境读文件文本：优先 file.text()，回退 FileReader，再回退 arrayBuffer。 */
async function readAsText(file: File): Promise<string> {
  if (typeof file.text === 'function') {
    try {
      const r = await file.text()
      if (typeof r === 'string') return r
    } catch { /* fallthrough */ }
  }
  if (typeof FileReader !== 'undefined') {
    return new Promise((resolve, reject) => {
      const r = new FileReader()
      r.onload = () => resolve(String(r.result ?? ''))
      r.onerror = () => reject(r.error ?? new Error('FileReader error'))
      r.readAsText(file)
    })
  }
  const buf = await file.arrayBuffer()
  return new TextDecoder().decode(buf)
}

export async function importSourceFile(file: File): Promise<SourceImportResult> {
  const engine = detectEngineByFilename(file.name)
  if (!engine) {
    return { ok: false, message: `Unrecognized extension: ${file.name}` }
  }
  let text: string
  try {
    text = await readAsText(file)
  } catch (e) {
    return { ok: false, message: (e as Error).message ?? 'Cannot read file' }
  }
  const title = file.name.replace(/\.[^.]+$/, '')
  return { ok: true, document: createDocument(engine, title, text) }
}
