import type { ToolManifest } from '@toolbox/tool-registry'
import { allManifests as _allManifests } from 'virtual:toolbox-manifests'

export const allManifests: ToolManifest[] = _allManifests as ToolManifest[]

export const toolManifestByPath = new Map(
  allManifests.map((manifest) => [manifest.path, manifest])
)

export function getToolManifestByPath(path: string): ToolManifest | undefined {
  return toolManifestByPath.get(path)
}

export function getToolManifestMetaByPath(
  path: string,
  language?: string
): { title: string; description: string } | null {
  const manifest = getToolManifestByPath(path)
  if (!manifest) return null
  const lang = language?.toLowerCase().startsWith('zh') ? 'zh' : 'en'
  return manifest.meta[lang] || manifest.meta.zh || manifest.meta.en || null
}
