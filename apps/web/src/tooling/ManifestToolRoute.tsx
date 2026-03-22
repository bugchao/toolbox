import React, { Suspense, lazy, useEffect, useMemo, useState } from 'react'
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

export function ManifestToolRoute({ manifest }: ManifestToolRouteProps) {
  const { i18n } = useTranslation('common')
  const language = i18n.resolvedLanguage || i18n.language
  const locale = normalizeToolLocale(language)
  const LazyComponent = useMemo(() => lazy(manifest.loadComponent), [manifest])
  const [ready, setReady] = useState(() => i18n.hasResourceBundle(locale, manifest.namespace))

  useEffect(() => {
    let active = true

    if (i18n.hasResourceBundle(locale, manifest.namespace)) {
      setReady(true)
      return () => {
        active = false
      }
    }

    setReady(false)
    void ensureToolNamespace(i18n, manifest, language)
      .then(() => {
        if (active) setReady(true)
      })
      .catch(() => {
        if (active) setReady(true)
      })

    return () => {
      active = false
    }
  }, [i18n, language, locale, manifest])

  if (!ready) return <RouteLoading />

  return (
    <Suspense fallback={<RouteLoading />}>
      <LazyComponent />
    </Suspense>
  )
}

