import React, { useEffect, useRef, useState } from 'react'
import { Alert, Empty, Spin } from 'antd'
import { useStore } from '../state/store'
import { adapterFor } from '../adapters/registry'

const PREVIEW_DEBOUNCE_MS = 350

/** 当前选中 diagram 的 SVG 预览。 */
export const PreviewPane: React.FC = () => {
  const { selected } = useStore()
  const [svg, setSvg] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const timer = useRef<number | null>(null)

  useEffect(() => {
    if (!selected) {
      setSvg(''); setError(null); return
    }
    if (selected.engine === 'drawio') {
      setSvg(''); setError('draw.io renders via iframe; preview will hook in Phase 4.')
      return
    }
    if (timer.current != null) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(async () => {
      setLoading(true)
      setError(null)
      const adapter = adapterFor(selected.engine)
      try {
        const r = await adapter.render(selected.source, {
          theme: selected.settings.theme,
          serverUrl: selected.settings.plantumlServerUrl,
        })
        if (r.ok) setSvg(r.svg)
        else { setError(r.message); setSvg('') }
      } catch (e) {
        setError((e as Error).message ?? String(e))
        setSvg('')
      } finally {
        setLoading(false)
      }
    }, PREVIEW_DEBOUNCE_MS)
    return () => {
      if (timer.current != null) window.clearTimeout(timer.current)
    }
  }, [selected])

  if (!selected) {
    return (
      <section style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Empty description="Pick a diagram from the sidebar" />
      </section>
    )
  }

  return (
    <section
      style={{
        flex: 1,
        background: selected.settings.background || '#fafafa',
        position: 'relative',
        overflow: 'auto',
        padding: 16,
      }}
    >
      {loading && (
        <div style={{ position: 'absolute', top: 12, right: 12 }}>
          <Spin size="small" />
        </div>
      )}
      {error && (
        <Alert type="error" showIcon message="Render failed" description={error} style={{ marginBottom: 12 }} />
      )}
      {svg && (
        <div
          style={{
            transform: `scale(${selected.settings.previewScale ?? 1})`,
            transformOrigin: '0 0',
          }}
          // 渲染来自 mermaid / plantuml 服务器；UI 控件已不在网络回路里
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      )}
    </section>
  )
}
