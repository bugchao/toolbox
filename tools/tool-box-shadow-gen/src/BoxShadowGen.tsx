import React, { useMemo, useState } from 'react'
import { Button, Card, NoticeCard, PageHero, ParticlesBackground } from '@toolbox/ui-kit'
import { useTranslation } from 'react-i18next'
import {
  ArrowDown,
  ArrowUp,
  BoxSelect,
  Check,
  Copy,
  Plus,
  Trash2,
} from 'lucide-react'
import { addLayer, createLayer, moveLayer, removeLayer, updateLayer } from './lib/layers'
import { layersToCss, layersToTailwind, type ShadowLayer } from './lib/shadow'
import { PRESETS } from './lib/presets'

type Shape = 'rectangle' | 'pill' | 'circle'

const DEFAULT_LAYERS: ShadowLayer[] = [createLayer({ id: 'init', x: 0, y: 6, blur: 16, spread: 0, color: '#000000', alpha: 0.2 })]

function useClipboard() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const copy = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedKey(key)
      window.setTimeout(() => setCopiedKey((cur) => (cur === key ? null : cur)), 1200)
    } catch {
      /* ignore */
    }
  }
  return { copiedKey, copy }
}

const BoxShadowGen: React.FC = () => {
  const { t } = useTranslation('toolBoxShadowGen')
  const [layers, setLayers] = useState<ShadowLayer[]>(DEFAULT_LAYERS)
  const [shape, setShape] = useState<Shape>('rectangle')
  const [bgColor, setBgColor] = useState('#ffffff')
  const [stageColor, setStageColor] = useState('#f3f4f6')
  const [radius, setRadius] = useState(16)

  const cssValue = useMemo(() => layersToCss(layers), [layers])
  const tailwindValue = useMemo(() => layersToTailwind(layers), [layers])
  const cssRule = `.box {\n  box-shadow: ${cssValue};\n}`
  const { copiedKey, copy } = useClipboard()

  const applyPreset = (presetId: string) => {
    const p = PRESETS.find((x) => x.id === presetId)
    if (p) setLayers(p.build())
  }

  const shapeStyle: React.CSSProperties = {
    width: shape === 'circle' ? 140 : 220,
    height: 140,
    borderRadius: shape === 'circle' ? '50%' : shape === 'pill' ? 9999 : radius,
    background: bgColor,
    boxShadow: cssValue,
    transition: 'box-shadow 80ms linear, border-radius 120ms linear',
  }

  return (
    <div className="relative min-h-[60vh]">
      <ParticlesBackground preset="minimal" className="absolute inset-0" />
      <div className="relative z-10 space-y-6">
        <PageHero title={t('title')} description={t('description')} />

        <NoticeCard
          tone="info"
          title={t('notice.title')}
          description={t('notice.body')}
          icon={BoxSelect}
        />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          {/* 左：层管理 + 预设 */}
          <Card>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {t('layers.heading')}
              </h2>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setLayers([])}
                  disabled={layers.length === 0}
                >
                  {t('layers.clear')}
                </Button>
                <Button type="button" onClick={() => setLayers((cur) => addLayer(cur))}>
                  <span className="inline-flex items-center gap-1.5">
                    <Plus className="h-4 w-4" />
                    {t('layers.add')}
                  </span>
                </Button>
              </div>
            </div>

            {layers.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                {t('layers.empty')}
              </div>
            ) : (
              <ul className="space-y-3">
                {layers.map((l, idx) => (
                  <li
                    key={l.id}
                    className="rounded-lg border border-gray-200 p-3 dark:border-gray-700"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                        {t('layers.itemTitle', { n: idx + 1 })}
                      </span>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          title={t('layers.up')}
                          disabled={idx === 0}
                          onClick={() => setLayers((cur) => moveLayer(cur, l.id, 'up'))}
                          className="rounded p-1 text-gray-600 hover:bg-gray-100 disabled:opacity-30 dark:text-gray-300 dark:hover:bg-gray-800"
                        >
                          <ArrowUp className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          title={t('layers.down')}
                          disabled={idx === layers.length - 1}
                          onClick={() => setLayers((cur) => moveLayer(cur, l.id, 'down'))}
                          className="rounded p-1 text-gray-600 hover:bg-gray-100 disabled:opacity-30 dark:text-gray-300 dark:hover:bg-gray-800"
                        >
                          <ArrowDown className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          title={t('layers.remove')}
                          onClick={() => setLayers((cur) => removeLayer(cur, l.id))}
                          className="rounded p-1 text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-900/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
                      <NumberField
                        label={t('layers.x')}
                        value={l.x}
                        min={-100}
                        max={100}
                        onChange={(v) => setLayers((cur) => updateLayer(cur, l.id, { x: v }))}
                      />
                      <NumberField
                        label={t('layers.y')}
                        value={l.y}
                        min={-100}
                        max={100}
                        onChange={(v) => setLayers((cur) => updateLayer(cur, l.id, { y: v }))}
                      />
                      <NumberField
                        label={t('layers.blur')}
                        value={l.blur}
                        min={0}
                        max={100}
                        onChange={(v) => setLayers((cur) => updateLayer(cur, l.id, { blur: v }))}
                      />
                      <NumberField
                        label={t('layers.spread')}
                        value={l.spread}
                        min={-50}
                        max={50}
                        onChange={(v) => setLayers((cur) => updateLayer(cur, l.id, { spread: v }))}
                      />
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
                      <label className="inline-flex items-center gap-2">
                        <span className="text-gray-600 dark:text-gray-300">{t('layers.color')}</span>
                        <input
                          type="color"
                          value={l.color}
                          onChange={(e) =>
                            setLayers((cur) => updateLayer(cur, l.id, { color: e.target.value }))
                          }
                          className="h-7 w-10 cursor-pointer rounded border border-gray-200 dark:border-gray-700"
                        />
                      </label>
                      <label className="inline-flex flex-1 items-center gap-2 min-w-[160px]">
                        <span className="text-gray-600 dark:text-gray-300">{t('layers.alpha')}</span>
                        <input
                          type="range"
                          min={0}
                          max={1}
                          step={0.01}
                          value={l.alpha}
                          onChange={(e) =>
                            setLayers((cur) =>
                              updateLayer(cur, l.id, { alpha: Number(e.target.value) }),
                            )
                          }
                          className="flex-1"
                        />
                        <span className="w-10 text-right text-gray-500">{l.alpha.toFixed(2)}</span>
                      </label>
                      <label className="inline-flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={l.inset}
                          onChange={(e) =>
                            setLayers((cur) => updateLayer(cur, l.id, { inset: e.target.checked }))
                          }
                        />
                        <span className="text-gray-600 dark:text-gray-300">{t('layers.inset')}</span>
                      </label>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-5 border-t border-gray-200 pt-4 dark:border-gray-700">
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

          {/* 右：预览 + 输出 */}
          <Card>
            <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t('preview.heading')}
            </h2>

            <div
              className="flex items-center justify-center rounded-lg p-10"
              style={{ background: stageColor }}
            >
              <div style={shapeStyle} />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
              <SelectField
                label={t('preview.shape')}
                value={shape}
                onChange={(v) => setShape(v as Shape)}
                options={[
                  { value: 'rectangle', label: t('preview.shapeRect') },
                  { value: 'pill', label: t('preview.shapePill') },
                  { value: 'circle', label: t('preview.shapeCircle') },
                ]}
              />
              <NumberField
                label={t('preview.radius')}
                value={radius}
                min={0}
                max={80}
                onChange={setRadius}
              />
              <label className="flex flex-col gap-1">
                <span className="text-gray-600 dark:text-gray-300">{t('preview.boxColor')}</span>
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="h-8 w-full cursor-pointer rounded border border-gray-200 dark:border-gray-700"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-gray-600 dark:text-gray-300">{t('preview.stageColor')}</span>
                <input
                  type="color"
                  value={stageColor}
                  onChange={(e) => setStageColor(e.target.value)}
                  className="h-8 w-full cursor-pointer rounded border border-gray-200 dark:border-gray-700"
                />
              </label>
            </div>

            <div className="mt-5 space-y-3 border-t border-gray-200 pt-4 dark:border-gray-700">
              <OutputBlock
                label={t('output.css')}
                value={cssRule}
                onCopy={() => copy('css', cssRule)}
                copied={copiedKey === 'css'}
              />
              <OutputBlock
                label={t('output.tailwind')}
                value={tailwindValue}
                onCopy={() => copy('tw', tailwindValue)}
                copied={copiedKey === 'tw'}
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

const NumberField: React.FC<{
  label: string
  value: number
  min: number
  max: number
  onChange: (v: number) => void
}> = ({ label, value, min, max, onChange }) => (
  <label className="flex flex-col gap-1">
    <span className="text-gray-600 dark:text-gray-300">{label}</span>
    <div className="flex items-center gap-1.5">
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-16 rounded border border-gray-300 bg-white px-1.5 py-0.5 text-right text-xs text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
      />
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1"
      />
    </div>
  </label>
)

const SelectField: React.FC<{
  label: string
  value: string
  options: { value: string; label: string }[]
  onChange: (v: string) => void
}> = ({ label, value, options, onChange }) => (
  <label className="flex flex-col gap-1">
    <span className="text-gray-600 dark:text-gray-300">{label}</span>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded border border-gray-300 bg-white px-2 py-1 text-xs text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  </label>
)

const OutputBlock: React.FC<{
  label: string
  value: string
  onCopy: () => void
  copied: boolean
}> = ({ label, value, onCopy, copied }) => (
  <div>
    <div className="mb-1.5 flex items-center justify-between">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{label}</span>
      <Button type="button" variant="ghost" onClick={onCopy}>
        <span className="inline-flex items-center gap-1.5 text-xs">
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? 'Copied' : 'Copy'}
        </span>
      </Button>
    </div>
    <pre className="overflow-x-auto rounded-md border border-gray-200 bg-gray-50 p-3 text-xs text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100">
      <code>{value}</code>
    </pre>
  </div>
)

export default BoxShadowGen
