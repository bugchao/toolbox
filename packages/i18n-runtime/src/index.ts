import type { i18n as I18nInstance } from 'i18next'
import {
  normalizeToolLocale,
  type ToolManifest,
  type ToolMessages,
  type ToolMessagesModule,
} from '@toolbox/tool-registry'

const namespaceLoadCache = new Map<string, Promise<void>>()

function unwrapMessages(module: ToolMessagesModule): ToolMessages {
  if (
    typeof module === 'object' &&
    module !== null &&
    'default' in module &&
    typeof module.default === 'object' &&
    module.default !== null
  ) {
    return module.default as ToolMessages
  }
  return module
}

export async function ensureToolNamespace(
  i18n: I18nInstance,
  manifest: ToolManifest,
  language = i18n.resolvedLanguage || i18n.language
) {
  const locale = normalizeToolLocale(language)
  if (i18n.hasResourceBundle(locale, manifest.namespace)) return

  const cacheKey = `${manifest.id}:${locale}:${manifest.namespace}`
  const cached = namespaceLoadCache.get(cacheKey)
  if (cached) {
    await cached
    return
  }

  const pending = manifest
    .loadMessages[locale]()
    .then(unwrapMessages)
    .then((messages) => {
      i18n.addResourceBundle(locale, manifest.namespace, messages, true, true)
    })
    .finally(() => {
      namespaceLoadCache.delete(cacheKey)
    })

  namespaceLoadCache.set(cacheKey, pending)
  await pending
}
