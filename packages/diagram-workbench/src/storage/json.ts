/** 工作区 JSON 编解码器（schema v1）。导入做最小校验。 */
import { genId, now } from '../domain/factory'
import type { DiagramDocument, DiagramEngine, DiagramWorkspace } from '../domain/types'

const VALID_ENGINES: DiagramEngine[] = ['mermaid', 'plantuml', 'drawio']

export function encodeWorkspace(ws: DiagramWorkspace): string {
  return JSON.stringify({ ...ws, schemaVersion: 1 }, null, 2)
}

export type DecodeResult =
  | { ok: true; workspace: DiagramWorkspace }
  | { ok: false; message: string }

export function decodeWorkspace(raw: string): DecodeResult {
  let v: unknown
  try {
    v = JSON.parse(raw)
  } catch (e) {
    return { ok: false, message: `Invalid JSON: ${(e as Error).message}` }
  }
  if (!v || typeof v !== 'object') return { ok: false, message: 'Root must be an object' }
  const o = v as Record<string, unknown>
  if (o.schemaVersion !== 1) return { ok: false, message: `Unsupported schemaVersion: ${String(o.schemaVersion)}` }
  if (!Array.isArray(o.documents)) return { ok: false, message: 'documents must be an array' }

  const docs: DiagramDocument[] = []
  for (const raw of o.documents) {
    if (!raw || typeof raw !== 'object') continue
    const d = raw as Record<string, unknown>
    if (typeof d.source !== 'string') continue
    if (typeof d.title !== 'string') continue
    if (!VALID_ENGINES.includes(d.engine as DiagramEngine)) continue
    docs.push({
      id: typeof d.id === 'string' ? d.id : genId('doc'),
      title: d.title,
      engine: d.engine as DiagramEngine,
      source: d.source,
      settings: (d.settings && typeof d.settings === 'object' ? d.settings : {}) as DiagramDocument['settings'],
      createdAt: typeof d.createdAt === 'number' ? d.createdAt : now(),
      updatedAt: typeof d.updatedAt === 'number' ? d.updatedAt : now(),
    })
  }

  if (docs.length === 0) return { ok: false, message: 'No valid documents' }

  const selectedId = typeof o.selectedId === 'string' && docs.some((d) => d.id === o.selectedId)
    ? o.selectedId : docs[0].id
  const mainId = typeof o.mainId === 'string' && docs.some((d) => d.id === o.mainId)
    ? o.mainId : null

  const ws: DiagramWorkspace = {
    id: typeof o.id === 'string' ? o.id : genId('ws'),
    schemaVersion: 1,
    documents: docs,
    selectedId,
    mainId,
    createdAt: typeof o.createdAt === 'number' ? o.createdAt : now(),
    updatedAt: typeof o.updatedAt === 'number' ? o.updatedAt : now(),
  }
  return { ok: true, workspace: ws }
}

/** 浏览器下载工具。 */
export function downloadAsFile(name: string, content: string | Blob, mime = 'application/json'): void {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 0)
}
