import { getToolManifestMeta, type ToolManifest } from '@toolbox/tool-registry'
import weatherToolManifest from '@toolbox/tool-weather/tool.manifest'

const toolManifests: ToolManifest[] = [weatherToolManifest]
const toolManifestByPath = new Map(toolManifests.map((manifest) => [manifest.path, manifest]))

export function getToolManifestByPath(path: string) {
  return toolManifestByPath.get(path)
}

export function getToolManifestMetaByPath(path: string, language?: string) {
  const manifest = getToolManifestByPath(path)
  if (!manifest) return null
  return getToolManifestMeta(manifest, language)
}

