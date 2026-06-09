/** 工作区 / 文档 / ID / 时间戳 工厂。 */
import type { DiagramDocument, DiagramEngine, DiagramWorkspace } from './types'

export function now(): number {
  return Date.now()
}

export function genId(prefix = 'd'): string {
  return `${prefix}_${now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

/** Mermaid 默认模板 */
export const MERMAID_TEMPLATE = `flowchart LR
  A[Start] --> B{Decision}
  B -->|Yes| C[Process]
  B -->|No| D[End]
  C --> D
`

export const PLANTUML_TEMPLATE = `@startuml
Alice -> Bob: Hello
Bob --> Alice: Hi
@enduml
`

export const DRAWIO_TEMPLATE = `<mxfile><diagram id="default" name="Page-1"><mxGraphModel><root><mxCell id="0"/><mxCell id="1" parent="0"/></root></mxGraphModel></diagram></mxfile>`

export function templateFor(engine: DiagramEngine): string {
  if (engine === 'mermaid') return MERMAID_TEMPLATE
  if (engine === 'plantuml') return PLANTUML_TEMPLATE
  return DRAWIO_TEMPLATE
}

export function createDocument(
  engine: DiagramEngine,
  title: string,
  source?: string,
): DiagramDocument {
  const t = now()
  return {
    id: genId('doc'),
    title,
    engine,
    source: source ?? templateFor(engine),
    settings: {},
    createdAt: t,
    updatedAt: t,
  }
}

/** 默认工作区：1 张 Mermaid 主图。 */
export function createDefaultWorkspace(): DiagramWorkspace {
  const t = now()
  const doc = createDocument('mermaid', 'Untitled Mermaid')
  return {
    id: genId('ws'),
    schemaVersion: 1,
    documents: [doc],
    selectedId: doc.id,
    mainId: doc.id,
    createdAt: t,
    updatedAt: t,
  }
}
