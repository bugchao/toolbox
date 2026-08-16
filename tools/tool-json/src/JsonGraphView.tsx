import React, { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { JSONCrack, type JSONCrackRef, type LayoutDirection } from 'jsoncrack-react'
import 'jsoncrack-react/style.css'
import { AlertCircle, Maximize2, Minus, Plus } from 'lucide-react'

import { I18N_NAMESPACE } from './namespace'

class GraphErrorBoundary extends React.Component<
  { fallback: (err: Error) => React.ReactNode; children: React.ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null }
  static getDerivedStateFromError(error: Error) {
    return { error }
  }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[JsonGraphView] render error:', error, info)
  }
  render() {
    if (this.state.error) return this.props.fallback(this.state.error)
    return this.props.children
  }
}

interface Props {
  json: unknown
  layoutDirection: LayoutDirection
  theme: 'light' | 'dark'
}

const JsonGraphView: React.FC<Props> = ({ json, layoutDirection, theme }) => {
  const { t } = useTranslation(I18N_NAMESPACE)
  const ref = useRef<JSONCrackRef>(null)

  if (json === null || json === undefined) {
    return (
      <div className="h-[600px] flex items-center justify-center text-ink-subtle border border-edge rounded-md bg-surface-muted">
        {t('graphEmpty')}
      </div>
    )
  }

  return (
    <div className="relative h-[600px] border border-edge rounded-md overflow-hidden bg-surface">
      <GraphErrorBoundary
        fallback={(err) => (
          <div className="h-full flex flex-col items-center justify-center gap-2 px-6 text-center">
            <AlertCircle className="w-6 h-6 text-red-500 dark:text-red-400" />
            <div className="text-sm font-medium text-red-600 dark:text-red-400">{t('graphError')}</div>
            <code className="max-w-full overflow-auto text-xs text-ink-muted whitespace-pre-wrap">
              {err.message}
            </code>
          </div>
        )}
      >
        <JSONCrack
          ref={ref}
          json={json as object}
          theme={theme}
          layoutDirection={layoutDirection}
          showControls={false}
          showGrid
          centerOnLayout
          maxRenderableNodes={1500}
          onParseError={(err) => console.error('[jsoncrack] parse error:', err)}
          renderNodeLimitExceeded={(count, max) => (
            <div className="h-full flex items-center justify-center px-6 text-center text-sm text-ink-muted">
              {t('graphTooLarge', { count, max })}
            </div>
          )}
        />
      </GraphErrorBoundary>
      <div className="absolute top-2 right-2 flex gap-1 bg-surface/90 backdrop-blur rounded-md shadow border border-edge p-1">
        <button
          type="button"
          onClick={() => ref.current?.zoomIn()}
          className="p-1.5 text-ink hover:bg-surface-inset rounded"
          title={t('zoomIn')}
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => ref.current?.zoomOut()}
          className="p-1.5 text-ink hover:bg-surface-inset rounded"
          title={t('zoomOut')}
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => ref.current?.centerView()}
          className="p-1.5 text-ink hover:bg-surface-inset rounded"
          title={t('centerView')}
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default JsonGraphView
