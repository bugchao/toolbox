/** 适配器注册表：UI 层按 engine 拿到对应适配器 + 按文件扩展名识别 engine。 */
import type { DiagramAdapter } from './types'
import type { DiagramEngine } from '../domain/types'
import { mermaidAdapter, matchesMermaidExtension } from './mermaid'
import { plantumlAdapter, matchesPlantUmlExtension } from './plantuml'
import { drawioAdapter, matchesDrawioExtension } from './drawio'

export const adapters: Record<DiagramEngine, DiagramAdapter> = {
  mermaid: mermaidAdapter,
  plantuml: plantumlAdapter,
  drawio: drawioAdapter,
}

export function adapterFor(engine: DiagramEngine): DiagramAdapter {
  return adapters[engine]
}

/** 根据文件名扩展名推断 engine。无法识别返回 null。 */
export function detectEngineByFilename(filename: string): DiagramEngine | null {
  if (matchesMermaidExtension(filename)) return 'mermaid'
  if (matchesPlantUmlExtension(filename)) return 'plantuml'
  if (matchesDrawioExtension(filename)) return 'drawio'
  return null
}
