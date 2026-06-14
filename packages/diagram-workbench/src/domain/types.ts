/** Diagram Workbench 核心域类型。 */

export type DiagramEngine = 'mermaid' | 'plantuml' | 'drawio'

export type ExportFormat = 'source' | 'svg' | 'png' | 'workspace-json'

export type DiagramSettings = {
  /** 主题名（mermaid: default/dark/forest/neutral；drawio: 内置 / dark） */
  theme?: string
  /** 预览背景色；空 = 透明 */
  background?: string
  /** 预览缩放（1 = 100%） */
  previewScale?: number
  /** PlantUML 服务器 URL（带末尾 /） */
  plantumlServerUrl?: string
  /** draw.io embed URL */
  drawioUrl?: string
}

export const DEFAULT_SETTINGS: Required<Pick<DiagramSettings, 'theme' | 'previewScale' | 'plantumlServerUrl' | 'drawioUrl'>> = {
  theme: 'default',
  previewScale: 1,
  plantumlServerUrl: 'http://localhost:8080/plantuml/',
  drawioUrl: 'https://embed.diagrams.net/',
}

export type DiagramDocument = {
  id: string
  title: string
  engine: DiagramEngine
  /** 当前源代码（drawio 为 XML） */
  source: string
  settings: DiagramSettings
  /** ms epoch */
  createdAt: number
  updatedAt: number
}

export type DiagramWorkspace = {
  /** 永久 ID；导入时刷新避免冲突 */
  id: string
  /** schema 版本，用于 JSON 导入兼容 */
  schemaVersion: 1
  documents: DiagramDocument[]
  /** 当前选中的 doc id */
  selectedId: string | null
  /** 标记为主图谱的 doc id（一个 workspace 只能有 0 或 1 个） */
  mainId: string | null
  createdAt: number
  updatedAt: number
}

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'
