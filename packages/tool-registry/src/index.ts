import type { ComponentType } from 'react'

export type ToolMode = 'client' | 'server' | 'hybrid'
export type ToolLocaleCode = 'zh' | 'en'
export type ToolMessages = Record<string, unknown>
export type ToolMessagesModule = ToolMessages | { default: ToolMessages }

export interface ToolManifestMeta {
  title: string
  description: string
  shortTitle?: string
}

export interface ToolManifest {
  id: string
  path: string
  namespace: string
  mode?: ToolMode
  categoryKey?: string
  icon?: ComponentType
  keywords?: string[]
  meta: Record<ToolLocaleCode, ToolManifestMeta>
  loadComponent: () => Promise<{ default: ComponentType }>
  loadMessages: Record<ToolLocaleCode, () => Promise<ToolMessagesModule>>
}

export function defineToolManifest<const T extends ToolManifest>(manifest: T): T {
  return manifest
}

export function normalizeToolLocale(language?: string): ToolLocaleCode {
  return language?.toLowerCase().startsWith('en') ? 'en' : 'zh'
}

export function getToolManifestMeta(manifest: ToolManifest, language?: string): ToolManifestMeta {
  return manifest.meta[normalizeToolLocale(language)] ?? manifest.meta.zh
}
