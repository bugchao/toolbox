import React, { type ComponentType, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ensureToolNamespace } from '@toolbox/i18n-runtime'
import { normalizeToolLocale, type ToolManifest } from '@toolbox/tool-registry'

function RouteLoading() {
  const { t } = useTranslation('common')
  return (
    <div className="flex min-h-[200px] items-center justify-center text-gray-500 dark:text-gray-300">
      {t('loading')}
    </div>
  )
}

interface ManifestToolRouteProps {
  manifest: ToolManifest
}

const componentCache = new Map<string, ComponentType>()

export function ManifestToolRoute({ manifest }: ManifestToolRouteProps) {
  const { i18n } = useTranslation('common')
  const language = i18n.resolvedLanguage || i18n.language
  const locale = normalizeToolLocale(language)
  const [Component, setComponent] = useState<ComponentType | null>(
    () => componentCache.get(manifest.id) || null
  )
  const [ready, setReady] = useState(() => {
    const cached = componentCache.get(manifest.id)
    return !!cached && i18n.hasResourceBundle(locale, manifest.namespace)
  })

  useEffect(() => {
    let active = true

    const nsReady = i18n.hasResourceBundle(locale, manifest.namespace)
    const cached = componentCache.get(manifest.id)

    if (nsReady && cached) {
      setComponent(() => cached)
      setReady(true)
      return () => { active = false }
    }

    const loadNs = nsReady
      ? Promise.resolve()
      : ensureToolNamespace(i18n, manifest, language).catch(() => {})

    const loadComp = cached
      ? Promise.resolve(cached)
      : manifest.loadComponent().then((m) => m.default)

    void Promise.all([loadNs, loadComp])
      .then(([, comp]) => {
        if (active && comp) {
          componentCache.set(manifest.id, comp as ComponentType)
          setComponent(() => comp as ComponentType)
          setReady(true)
        }
      })
      .catch(() => {
        if (active) setReady(true)
      })

    return () => { active = false }
  }, [i18n, language, locale, manifest])

  if (!ready || !Component) return <RouteLoading />

  return <Component />
}
