import React, { forwardRef } from 'react'
import { Phone, Mail, Globe, MapPin } from 'lucide-react'

import type { CardData } from './templates'

interface Props {
  data: CardData
  qrDataUrl?: string
  // 在导出时由父组件传入更高的内部缩放（仅影响内部字号、整体外尺寸不变）
  scale?: number
}

// 标准 90mm × 54mm 名片，CSS 像素按 ~3.78 px/mm 渲染 → 340 × 204 大致接近
// 但为了在 UI 里更易读，预览放大到 420 × 252。导出时 html2canvas 的 scale 提供高分辨率。
const W = 420
const H = 252

const fontStack = `system-ui, -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif`

const CardPreview = forwardRef<HTMLDivElement, Props>(({ data, qrDataUrl }, ref) => {
  const { template, accentColor } = data

  if (template === 'minimal') {
    return (
      <div
        ref={ref}
        className="relative overflow-hidden bg-white"
        style={{
          width: W,
          height: H,
          fontFamily: fontStack,
          borderRadius: 10,
          boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
        }}
      >
        <div
          className="absolute left-0 right-0 bottom-0"
          style={{ height: 4, background: accentColor }}
        />
        <div className="p-6 h-full flex flex-col justify-between">
          <div>
            <div style={{ color: accentColor, fontSize: 22, fontWeight: 700, letterSpacing: 0.5 }}>
              {data.name || ' '}
            </div>
            <div style={{ color: '#374151', fontSize: 12, marginTop: 4 }}>
              {data.title}
              {data.title && data.company ? ' · ' : ''}
              {data.company}
            </div>
          </div>
          <div className="flex items-end justify-between gap-4">
            <ContactBlock data={data} color="#4b5563" />
            {data.showQr && qrDataUrl && (
              <img src={qrDataUrl} alt="QR" style={{ width: 64, height: 64 }} />
            )}
          </div>
        </div>
      </div>
    )
  }

  if (template === 'stripe') {
    return (
      <div
        ref={ref}
        className="relative overflow-hidden bg-white"
        style={{
          width: W,
          height: H,
          fontFamily: fontStack,
          borderRadius: 10,
          boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
          display: 'grid',
          gridTemplateColumns: '110px 1fr',
        }}
      >
        <div
          style={{
            background: accentColor,
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 12,
            textAlign: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: 1 }}>
              {(data.company || '·')[0]}
            </div>
            <div style={{ fontSize: 9, opacity: 0.85, marginTop: 6, lineHeight: 1.3 }}>
              {data.company}
            </div>
          </div>
        </div>
        <div className="p-5 h-full flex flex-col justify-between">
          <div>
            <div style={{ color: '#111827', fontSize: 20, fontWeight: 700 }}>
              {data.name || ' '}
            </div>
            <div style={{ color: accentColor, fontSize: 11, marginTop: 3, fontWeight: 600 }}>
              {data.title}
            </div>
          </div>
          <div className="flex items-end justify-between gap-3">
            <ContactBlock data={data} color="#374151" />
            {data.showQr && qrDataUrl && (
              <img src={qrDataUrl} alt="QR" style={{ width: 56, height: 56 }} />
            )}
          </div>
        </div>
      </div>
    )
  }

  // modern: gradient bg + frosted info
  return (
    <div
      ref={ref}
      className="relative overflow-hidden"
      style={{
        width: W,
        height: H,
        fontFamily: fontStack,
        borderRadius: 10,
        boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
        background: `linear-gradient(135deg, ${accentColor} 0%, ${shade(accentColor, -40)} 100%)`,
        color: 'white',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(at 30% 0%, rgba(255,255,255,0.18), transparent 60%), radial-gradient(at 100% 100%, rgba(0,0,0,0.18), transparent 50%)',
        }}
      />
      <div className="relative h-full flex flex-col justify-between" style={{ padding: 22 }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: 0.5 }}>{data.name || ' '}</div>
          <div style={{ fontSize: 12, opacity: 0.92, marginTop: 6 }}>
            {data.title}
            {data.title && data.company ? ' · ' : ''}
            {data.company}
          </div>
          {data.tagline && (
            <div style={{ fontSize: 10, opacity: 0.75, marginTop: 4, fontStyle: 'italic' }}>
              "{data.tagline}"
            </div>
          )}
        </div>
        <div className="flex items-end justify-between gap-4">
          <ContactBlock data={data} color="rgba(255,255,255,0.92)" />
          {data.showQr && qrDataUrl && (
            <div
              style={{
                padding: 4,
                background: 'white',
                borderRadius: 6,
              }}
            >
              <img src={qrDataUrl} alt="QR" style={{ width: 56, height: 56, display: 'block' }} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
})
CardPreview.displayName = 'CardPreview'

interface ContactBlockProps {
  data: CardData
  color: string
}
const ContactBlock: React.FC<ContactBlockProps> = ({ data, color }) => {
  const Row: React.FC<{ icon: React.ReactNode; text: string }> = ({ icon, text }) => {
    if (!text) return null
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10.5, color }}>
        <span style={{ display: 'inline-flex', width: 12, height: 12 }}>{icon}</span>
        <span style={{ wordBreak: 'break-all' }}>{text}</span>
      </div>
    )
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Row icon={<Phone style={{ width: 12, height: 12 }} />} text={data.phone} />
      <Row icon={<Mail style={{ width: 12, height: 12 }} />} text={data.email} />
      <Row icon={<Globe style={{ width: 12, height: 12 }} />} text={data.website} />
      <Row icon={<MapPin style={{ width: 12, height: 12 }} />} text={data.address} />
    </div>
  )
}

// 把 hex 颜色调亮/调暗
function shade(hex: string, percent: number): string {
  let h = hex.replace('#', '')
  if (h.length === 3) h = h.split('').map((c) => c + c).join('')
  const num = parseInt(h, 16)
  let r = (num >> 16) & 0xff
  let g = (num >> 8) & 0xff
  let b = num & 0xff
  r = clamp255(r + (percent / 100) * 255)
  g = clamp255(g + (percent / 100) * 255)
  b = clamp255(b + (percent / 100) * 255)
  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')}`
}
function clamp255(n: number) {
  return Math.max(0, Math.min(255, Math.round(n)))
}

export default CardPreview
