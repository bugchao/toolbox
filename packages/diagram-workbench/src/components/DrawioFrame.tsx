import React, { useEffect, useRef } from 'react'
import {
  DEFAULT_ALLOWED_ORIGINS,
  DrawioMessageBus,
  type DrawioMessage,
} from '../adapters/drawio'

export type DrawioFrameProps = {
  /** 当前 XML 源码；变化时会经 postMessage 推给 iframe */
  xml: string
  /** embed URL，例如 https://embed.diagrams.net/?embed=1&proto=json&ui=atlas */
  embedUrl?: string
  /** 自定义 origin allowlist（覆盖默认 embed/app.diagrams.net） */
  allowedOrigins?: readonly string[]
  /** XML 变化时回调（来自 iframe 的 save / autosave 事件） */
  onXmlChange: (xml: string) => void
}

const DEFAULT_EMBED = 'https://embed.diagrams.net/?embed=1&proto=json&spin=1&ui=atlas&saveAndExit=0'

/**
 * 把 draw.io 包成 React 组件。
 *
 * 协议要点（diagrams.net JSON embed mode）：
 *   - 收到 {event:'init'} → 回 {action:'load', xml}
 *   - 收到 {event:'load' | 'save' | 'autosave', xml} → 上抛 onXmlChange
 *
 * 安全：postMessage 进站由 DrawioMessageBus 的 origin allowlist 守门；
 *       出站 postMessage 用 targetOrigin = iframe 当前 origin。
 */
export const DrawioFrame: React.FC<DrawioFrameProps> = ({
  xml,
  embedUrl = DEFAULT_EMBED,
  allowedOrigins = DEFAULT_ALLOWED_ORIGINS,
  onXmlChange,
}) => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const xmlRef = useRef(xml)
  xmlRef.current = xml

  useEffect(() => {
    const handleMessage = (msg: DrawioMessage) => {
      if (msg.event === 'init') {
        const frame = iframeRef.current
        if (frame?.contentWindow) {
          const targetOrigin = new URL(embedUrl).origin
          frame.contentWindow.postMessage(
            JSON.stringify({ action: 'load', xml: xmlRef.current }),
            targetOrigin,
          )
        }
        return
      }
      if (msg.event === 'save' || msg.event === 'autosave' || msg.event === 'load') {
        if ('xml' in msg && typeof msg.xml === 'string') {
          onXmlChange(msg.xml)
        }
      }
    }
    const bus = new DrawioMessageBus(window, { allowedOrigins, onMessage: handleMessage })
    return () => bus.dispose()
  }, [embedUrl, allowedOrigins, onXmlChange])

  return (
    <iframe
      ref={iframeRef}
      src={embedUrl}
      title="draw.io"
      style={{ flex: 1, border: 'none', minHeight: 480, width: '100%', background: '#fff' }}
    />
  )
}
