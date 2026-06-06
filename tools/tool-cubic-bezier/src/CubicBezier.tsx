import React, { useCallback, useMemo, useRef, useState } from 'react'
import { Button, Card, NoticeCard, PageHero, ParticlesBackground } from '@toolbox/ui-kit'
import { useTranslation } from 'react-i18next'
import { Check, Copy, Spline } from 'lucide-react'
import {
  X_MAX,
  X_MIN,
  Y_MAX,
  Y_MIN,
  bezierAt,
  formatCss,
  sampleCurve,
  type Point,
} from './lib/bezier'
import { PRESETS, type PresetId } from './lib/presets'
import { clamp, roundTo } from './lib/clamp'

// SVG 画布参数：x ∈ [0, 1] 映射到画布 [pad, size-pad]，y 同理但 SVG y 向下，所以画图前翻转。
const SVG_SIZE = 320
const SVG_PAD = 28
const INNER = SVG_SIZE - SVG_PAD * 2

/** 数据空间 (x, y) → SVG 像素坐标（y 翻转，使 (0, 0) 在左下、(1, 1) 在右上）。 */
function toSvg(p: Point): { sx: number; sy: number } {
  return {
    sx: SVG_PAD + p.x * INNER,
    sy: SVG_PAD + (1 - p.y) * INNER,
  }
}

/** SVG 像素 → 数据 (x, y)（y 翻转）。 */
function fromSvg(sx: number, sy: number): Point {
  return {
    x: (sx - SVG_PAD) / INNER,
    y: 1 - (sy - SVG_PAD) / INNER,
  }
}

const DEFAULT_P1: Point = { x: 0.42, y: 0 }
const DEFAULT_P2: Point = { x: 0.58, y: 1 }

const CubicBezier: React.FC = () => {
  const { t } = useTranslation('toolCubicBezier')
  const [p1, setP1] = useState<Point>(DEFAULT_P1)
  const [p2, setP2] = useState<Point>(DEFAULT_P2)
  const [duration, setDuration] = useState(1.2)
  const [copied, setCopied] = useState(false)

  const cssValue = useMemo(() => formatCss(p1, p2), [p1, p2])
  const curveSamples = useMemo(() => sampleCurve(p1, p2, 64), [p1, p2])

  const polyline = useMemo(
    () =>
      curveSamples
        .map((pt) => {
          const { sx, sy } = toSvg(pt)
          return `${sx.toFixed(2)},${sy.toFixed(2)}`
        })
        .join(' '),
    [curveSamples],
  )

  const onCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(cssValue)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1200)
    } catch {
      /* ignore */
    }
  }, [cssValue])

  const applyPreset = useCallback((id: PresetId) => {
    const p = PRESETS.find((x) => x.id === id)
    if (!p) return
    const [x1, y1, x2, y2] = p.value
    setP1({ x: x1, y: y1 })
    setP2({ x: x2, y: y2 })
  }, [])

  return (
    <div className="relative min-h-[60vh]">
      <ParticlesBackground preset="minimal" className="absolute inset-0" />
      <div className="relative z-10 space-y-6">
        <PageHero title={t('title')} description={t('description')} />

        <NoticeCard
          tone="info"
          title={t('notice.title')}
          description={t('notice.body')}
          icon={Spline}
        />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          {/* 左：SVG 画布 */}
          <Card>
            <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t('editor.heading')}
            </h2>
            <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">{t('editor.hint')}</p>
            <CurveCanvas
              p1={p1}
              p2={p2}
              polyline={polyline}
              onChangeP1={setP1}
              onChangeP2={setP2}
            />
          </Card>

          {/* 右：参数 / 输出 / 预设 */}
          <Card>
            <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t('output.heading')}
            </h2>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <NumberSlider
                label={t('editor.x1')}
                value={p1.x}
                min={X_MIN}
                max={X_MAX}
                step={0.01}
                onChange={(v) => setP1((cur) => ({ ...cur, x: clamp(v, X_MIN, X_MAX) }))}
              />
              <NumberSlider
                label={t('editor.y1')}
                value={p1.y}
                min={Y_MIN}
                max={Y_MAX}
                step={0.01}
                onChange={(v) => setP1((cur) => ({ ...cur, y: clamp(v, Y_MIN, Y_MAX) }))}
              />
              <NumberSlider
                label={t('editor.x2')}
                value={p2.x}
                min={X_MIN}
                max={X_MAX}
                step={0.01}
                onChange={(v) => setP2((cur) => ({ ...cur, x: clamp(v, X_MIN, X_MAX) }))}
              />
              <NumberSlider
                label={t('editor.y2')}
                value={p2.y}
                min={Y_MIN}
                max={Y_MAX}
                step={0.01}
                onChange={(v) => setP2((cur) => ({ ...cur, y: clamp(v, Y_MIN, Y_MAX) }))}
              />
            </div>

            <div className="mt-4">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  {t('output.code')}
                </span>
                <Button type="button" variant="ghost" onClick={onCopy}>
                  <span className="inline-flex items-center gap-1.5 text-xs">
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? t('output.copied') : t('output.copy')}
                  </span>
                </Button>
              </div>
              <pre className="overflow-x-auto rounded-md border border-gray-200 bg-gray-50 p-3 text-xs text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100">
                <code>{cssValue}</code>
              </pre>
            </div>

            <div className="mt-4 border-t border-gray-200 pt-3 dark:border-gray-700">
              <label className="block text-xs">
                <span className="text-gray-600 dark:text-gray-300">
                  {t('duration.label')}：{duration.toFixed(1)} {t('duration.unit')}
                </span>
                <input
                  type="range"
                  min={0.3}
                  max={3}
                  step={0.1}
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="mt-1 w-full"
                />
              </label>
            </div>

            <div className="mt-4 border-t border-gray-200 pt-3 dark:border-gray-700">
              <h3 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
                {t('presets.heading')}
              </h3>
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => applyPreset(p.id)}
                    className="rounded-full border border-gray-300 px-3 py-1 text-xs text-gray-700 transition hover:border-gray-400 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:border-gray-500 dark:hover:bg-gray-800"
                  >
                    {t(p.i18nKey)}
                  </button>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* 底部：动画预览 */}
        <Card>
          <h2 className="mb-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
            {t('preview.heading')}
          </h2>
          <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">{t('preview.hint')}</p>
          <AnimationPreview
            cssTimingCurrent={cssValue}
            duration={duration}
            label={{ current: t('preview.current'), linear: t('preview.linear'), ease: t('preview.ease') }}
          />
        </Card>
      </div>
    </div>
  )
}

/* -------------------- SVG 画布 + 拖拽 -------------------- */

const CurveCanvas: React.FC<{
  p1: Point
  p2: Point
  polyline: string
  onChangeP1: (p: Point) => void
  onChangeP2: (p: Point) => void
}> = ({ p1, p2, polyline, onChangeP1, onChangeP2 }) => {
  const svgRef = useRef<SVGSVGElement | null>(null)
  const dragging = useRef<'p1' | 'p2' | null>(null)

  const { sx: s1x, sy: s1y } = toSvg(p1)
  const { sx: s2x, sy: s2y } = toSvg(p2)
  const { sx: p0x, sy: p0y } = toSvg({ x: 0, y: 0 })
  const { sx: p3x, sy: p3y } = toSvg({ x: 1, y: 1 })

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!dragging.current || !svgRef.current) return
    const rect = svgRef.current.getBoundingClientRect()
    const sx = ((e.clientX - rect.left) / rect.width) * SVG_SIZE
    const sy = ((e.clientY - rect.top) / rect.height) * SVG_SIZE
    const raw = fromSvg(sx, sy)
    const clamped: Point = {
      x: clamp(raw.x, X_MIN, X_MAX),
      y: clamp(raw.y, Y_MIN, Y_MAX),
    }
    if (dragging.current === 'p1') onChangeP1(clamped)
    else onChangeP2(clamped)
  }

  const startDrag = (which: 'p1' | 'p2') => (e: React.PointerEvent<SVGCircleElement>) => {
    e.preventDefault()
    dragging.current = which
    ;(e.target as Element).setPointerCapture?.(e.pointerId)
  }

  const endDrag = (e: React.PointerEvent<SVGSVGElement>) => {
    if (dragging.current) {
      // 释放 pointer capture（即便 target 已变化）
      const tgt = e.target as Element
      tgt.releasePointerCapture?.(e.pointerId)
    }
    dragging.current = null
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-2 dark:border-gray-700 dark:bg-gray-900">
      <svg
        ref={svgRef}
        width="100%"
        viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
        role="img"
        aria-label="cubic-bezier curve"
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        className="block touch-none select-none"
        style={{ aspectRatio: '1 / 1' }}
      >
        {/* 网格 */}
        <rect
          x={SVG_PAD}
          y={SVG_PAD}
          width={INNER}
          height={INNER}
          fill="transparent"
          stroke="currentColor"
          className="text-gray-300 dark:text-gray-700"
          strokeWidth={1}
        />
        {[0.25, 0.5, 0.75].map((g) => (
          <g key={g} className="text-gray-200 dark:text-gray-800">
            <line
              x1={SVG_PAD + g * INNER}
              x2={SVG_PAD + g * INNER}
              y1={SVG_PAD}
              y2={SVG_PAD + INNER}
              stroke="currentColor"
              strokeWidth={1}
            />
            <line
              x1={SVG_PAD}
              x2={SVG_PAD + INNER}
              y1={SVG_PAD + g * INNER}
              y2={SVG_PAD + g * INNER}
              stroke="currentColor"
              strokeWidth={1}
            />
          </g>
        ))}

        {/* 手柄虚线（P0→P1, P3→P2） */}
        <line
          x1={p0x}
          y1={p0y}
          x2={s1x}
          y2={s1y}
          stroke="#10b981"
          strokeWidth={1.5}
          strokeDasharray="4 3"
          opacity={0.6}
        />
        <line
          x1={p3x}
          y1={p3y}
          x2={s2x}
          y2={s2y}
          stroke="#a855f7"
          strokeWidth={1.5}
          strokeDasharray="4 3"
          opacity={0.6}
        />

        {/* 曲线 */}
        <polyline
          points={polyline}
          fill="none"
          stroke="#4f46e5"
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* 锚点 P0 / P3 */}
        <circle cx={p0x} cy={p0y} r={4} fill="#6b7280" />
        <circle cx={p3x} cy={p3y} r={4} fill="#6b7280" />

        {/* 控制点 P1 / P2（可拖） */}
        <circle
          cx={s1x}
          cy={s1y}
          r={8}
          fill="#10b981"
          stroke="white"
          strokeWidth={2}
          className="cursor-grab active:cursor-grabbing"
          onPointerDown={startDrag('p1')}
        />
        <circle
          cx={s2x}
          cy={s2y}
          r={8}
          fill="#a855f7"
          stroke="white"
          strokeWidth={2}
          className="cursor-grab active:cursor-grabbing"
          onPointerDown={startDrag('p2')}
        />
      </svg>

      {/* P1 / P2 数值标签（辅助理解） */}
      <div className="mt-2 flex items-center justify-between text-xs text-gray-600 dark:text-gray-300">
        <span>
          <span className="mr-1 inline-block h-2 w-2 rounded-full bg-emerald-500" />
          P1 ({roundTo(p1.x, 2).toFixed(2)}, {roundTo(p1.y, 2).toFixed(2)})
        </span>
        <span>
          <span className="mr-1 inline-block h-2 w-2 rounded-full bg-purple-500" />
          P2 ({roundTo(p2.x, 2).toFixed(2)}, {roundTo(p2.y, 2).toFixed(2)})
        </span>
      </div>

      {/* 移动端提示 */}
      <p className="mt-2 text-[10px] text-gray-400 dark:text-gray-500">
        P0=(0,0) · P3=(1,1)
      </p>
    </div>
  )
}

/* -------------------- 数字滑块字段 -------------------- */

const NumberSlider: React.FC<{
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (v: number) => void
}> = ({ label, value, min, max, step, onChange }) => (
  <label className="flex flex-col gap-1">
    <span className="text-gray-600 dark:text-gray-300">{label}</span>
    <div className="flex items-center gap-1.5">
      <input
        type="number"
        value={roundTo(value, 2)}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-16 rounded border border-gray-300 bg-white px-1.5 py-0.5 text-right text-xs text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
      />
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1"
      />
    </div>
  </label>
)

/* -------------------- 动画预览（3 个小球，CSS animation） -------------------- */

const AnimationPreview: React.FC<{
  cssTimingCurrent: string
  duration: number
  label: { current: string; linear: string; ease: string }
}> = ({ cssTimingCurrent, duration, label }) => {
  // 我们用一个 React key 让 animation-name / duration 改变时整段动画重启，
  // 避免 Chrome 在改 timing-function 时不重新触发的小坑。
  const animKey = `${cssTimingCurrent}|${duration.toFixed(2)}`

  const baseRowClass =
    'relative h-10 overflow-hidden rounded-md border border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 dark:border-gray-700 dark:from-gray-900 dark:to-gray-800'

  const ballStyle = (timing: string): React.CSSProperties => ({
    position: 'absolute',
    top: '50%',
    left: 0,
    width: 24,
    height: 24,
    marginTop: -12,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #6366f1, #ec4899)',
    boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
    animation: `tool-cubic-bezier-slide ${duration}s ${timing} infinite alternate`,
    willChange: 'transform',
  })

  return (
    <div className="space-y-3">
      <style>{`
        @keyframes tool-cubic-bezier-slide {
          from { transform: translateX(0); }
          to { transform: translateX(calc(100% + 0px)); }
        }
        .tool-cubic-bezier-track { padding-right: 28px; }
      `}</style>

      <PreviewRow label={`${label.current} · ${cssTimingCurrent}`}>
        <div className={`${baseRowClass} tool-cubic-bezier-track`}>
          <div key={`cur-${animKey}`} style={ballStyle(cssTimingCurrent)} />
        </div>
      </PreviewRow>

      <PreviewRow label={`${label.linear} · cubic-bezier(0, 0, 1, 1)`}>
        <div className={`${baseRowClass} tool-cubic-bezier-track`}>
          <div key={`lin-${animKey}`} style={ballStyle('cubic-bezier(0, 0, 1, 1)')} />
        </div>
      </PreviewRow>

      <PreviewRow label={`${label.ease} · cubic-bezier(0.25, 0.1, 0.25, 1)`}>
        <div className={`${baseRowClass} tool-cubic-bezier-track`}>
          <div key={`eas-${animKey}`} style={ballStyle('cubic-bezier(0.25, 0.1, 0.25, 1)')} />
        </div>
      </PreviewRow>
    </div>
  )
}

const PreviewRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <div className="mb-1 text-xs text-gray-600 dark:text-gray-300">{label}</div>
    {children}
  </div>
)

/** 用于把可能引发 transform 包尾溢出的边距以正值留出（仅在 ballStyle 内部需要的 24 + 4 padding）。 */
// 维持原排版稳定性，不再额外导出辅助函数。
// 为了避免被 lint 投诉未用导入，保留必要 utils 即可。
// （roundTo 已用于 NumberSlider 与 CurveCanvas 标签）

export default CubicBezier
