import React, { useMemo, useState } from 'react'
import {
  Button,
  Card,
  Input,
  NoticeCard,
  PageHero,
  ParticlesBackground,
  Switch,
  cn,
} from '@toolbox/ui-kit'
import { useTranslation } from 'react-i18next'
import { Check, ClipboardCopy, MoveHorizontal } from 'lucide-react'
import {
  buildClamp,
  resolvePx,
  validateInput,
  type ClampInput,
  type LengthUnit,
  type WarningKey,
} from './lib/clamp'

interface Preset {
  key: 'heading' | 'body' | 'spacing'
  value: ClampInput
}

const PRESETS: Preset[] = [
  {
    key: 'heading',
    value: { minVw: 320, maxVw: 1280, minSize: 1.75, maxSize: 3, rootFontSize: 16, unit: 'rem' },
  },
  {
    key: 'body',
    value: { minVw: 320, maxVw: 1280, minSize: 1, maxSize: 1.25, rootFontSize: 16, unit: 'rem' },
  },
  {
    key: 'spacing',
    value: { minVw: 320, maxVw: 1280, minSize: 1, maxSize: 2.5, rootFontSize: 16, unit: 'rem' },
  },
]

const PREVIEW_MIN = 280
const PREVIEW_MAX = 1920

const CssClamp: React.FC = () => {
  const { t } = useTranslation('toolCssClamp')

  const [input, setInput] = useState<ClampInput>(PRESETS[0].value)
  const [previewVw, setPreviewVw] = useState<number>(768)
  const [copied, setCopied] = useState(false)

  const warnings = useMemo<WarningKey[]>(() => validateInput(input), [input])
  const result = useMemo(() => buildClamp(input), [input])
  const resolvedPx = useMemo(() => resolvePx(input, previewVw), [input, previewVw])

  const setField = (field: keyof ClampInput, raw: string) => {
    const num = Number(raw)
    setInput((cur) => ({ ...cur, [field]: Number.isNaN(num) ? 0 : num }))
  }

  const applyPreset = (preset: Preset) => {
    setInput(preset.value)
  }

  const onCopy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1200)
    } catch {
      /* 剪贴板不可用时静默忽略 */
    }
  }

  const cssRule = `font-size: ${result.css};`

  return (
    <div className="relative min-h-[60vh]">
      {/* 粒子背景，受应用层 BackgroundVisibilityProvider 全局开关控制 */}
      <ParticlesBackground preset="minimal" className="absolute inset-0" />
      <div className="relative z-10 space-y-6">
        <PageHero title={t('title')} description={t('description')} />

        <NoticeCard
          tone="info"
          title={t('notice.title')}
          description={t('notice.body')}
          icon={MoveHorizontal}
        />

        {/* 预设 */}
        <Card>
          <h2 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-200">
            {t('presetsHeading')}
          </h2>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((preset) => (
              <Button
                key={preset.key}
                variant="secondary"
                size="sm"
                onClick={() => applyPreset(preset)}
              >
                {t(`presets.${preset.key}`)}
              </Button>
            ))}
          </div>
        </Card>

        {/* 边界提示 */}
        {warnings.map((w) => (
          <NoticeCard
            key={w}
            tone={w === 'size' ? 'warning' : w === 'root' ? 'info' : 'danger'}
            title={t(`warnings.${w}`)}
          />
        ))}

        <div className="grid gap-6 lg:grid-cols-2">
          {/* 参数 */}
          <Card>
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t('config.heading')}
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <Field label={t('config.minVw')} unit="px">
                <Input
                  type="number"
                  value={String(input.minVw)}
                  onChange={(e) => setField('minVw', e.target.value)}
                />
              </Field>
              <Field label={t('config.maxVw')} unit="px">
                <Input
                  type="number"
                  value={String(input.maxVw)}
                  onChange={(e) => setField('maxVw', e.target.value)}
                />
              </Field>
              <Field label={t('config.minSize')} unit={input.unit}>
                <Input
                  type="number"
                  step="0.01"
                  value={String(input.minSize)}
                  onChange={(e) => setField('minSize', e.target.value)}
                />
              </Field>
              <Field label={t('config.maxSize')} unit={input.unit}>
                <Input
                  type="number"
                  step="0.01"
                  value={String(input.maxSize)}
                  onChange={(e) => setField('maxSize', e.target.value)}
                />
              </Field>
              <Field label={t('config.rootFontSize')} unit="px">
                <Input
                  type="number"
                  value={String(input.rootFontSize)}
                  onChange={(e) => setField('rootFontSize', e.target.value)}
                />
              </Field>
              <div className="flex items-end pb-2">
                <Switch
                  checked={input.unit === 'rem'}
                  onChange={(checked) =>
                    setInput((cur) => ({ ...cur, unit: (checked ? 'rem' : 'px') as LengthUnit }))
                  }
                  label={`${t('config.unit')}: ${input.unit}`}
                />
              </div>
            </div>
          </Card>

          {/* 结果 */}
          <Card>
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t('result.heading')}
            </h2>

            <div className="space-y-3">
              <div className="rounded-md border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900/40">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    {t('result.fullLabel')}
                  </span>
                  <button
                    type="button"
                    onClick={() => onCopy(result.css)}
                    className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                  >
                    {copied ? <Check className="h-3.5 w-3.5" /> : <ClipboardCopy className="h-3.5 w-3.5" />}
                    {copied ? t('result.copied') : t('result.copy')}
                  </button>
                </div>
                <code className="block break-all font-mono text-sm text-gray-900 dark:text-gray-100">
                  {result.css}
                </code>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <Part label={t('result.minLabel')} value={result.minBound} />
                <Part label={t('result.preferredLabel')} value={result.preferred} />
                <Part label={t('result.maxLabel')} value={result.maxBound} />
              </div>

              <div className="rounded-md border border-gray-200 p-3 dark:border-gray-700">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  {t('result.cssLabel')}
                </span>
                <code className="block break-all font-mono text-xs text-gray-700 dark:text-gray-200">
                  {cssRule}
                </code>
              </div>
            </div>
          </Card>
        </div>

        {/* 预览 */}
        <Card>
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
            {t('preview.heading')}
          </h2>

          <label className="mb-1.5 flex items-center gap-3 text-xs">
            <span className="shrink-0 text-gray-600 dark:text-gray-300">
              {t('preview.viewportWidth')}
            </span>
            <input
              type="range"
              min={PREVIEW_MIN}
              max={PREVIEW_MAX}
              step={1}
              value={previewVw}
              onChange={(e) => setPreviewVw(Number(e.target.value))}
              className="flex-1"
            />
            <span className="w-20 text-right font-mono text-gray-800 dark:text-gray-100">
              {previewVw}px
            </span>
          </label>

          <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">{t('preview.hint')}</p>

          <div className="space-y-4 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
            <p
              className="break-words leading-snug text-gray-900 dark:text-gray-100"
              style={{ fontSize: `${resolvedPx}px` }}
            >
              {t('preview.sampleText')}
            </p>

            <div className="flex items-center gap-3">
              <div
                className="shrink-0 rounded bg-indigo-500/80 dark:bg-indigo-400/80"
                style={{ width: `${resolvedPx}px`, height: `${resolvedPx}px` }}
                aria-label={t('preview.boxLabel')}
              />
              <span className="text-xs text-gray-500 dark:text-gray-400">{t('preview.boxLabel')}</span>
            </div>
          </div>

          <div
            className={cn(
              'mt-3 inline-flex items-center gap-2 rounded-md bg-gray-100 px-3 py-1.5 text-sm dark:bg-gray-800',
            )}
          >
            <span className="text-gray-500 dark:text-gray-400">{t('preview.resolved')}</span>
            <span className="font-mono font-semibold text-gray-900 dark:text-gray-100">
              {resolvedPx.toFixed(2)}px
            </span>
          </div>
        </Card>
      </div>
    </div>
  )
}

const Field: React.FC<{ label: string; unit: string; children: React.ReactNode }> = ({
  label,
  unit,
  children,
}) => (
  <div>
    <label className="mb-1 flex items-center justify-between text-xs font-medium text-gray-700 dark:text-gray-200">
      <span>{label}</span>
      <span className="font-mono text-[10px] text-gray-400">{unit}</span>
    </label>
    {children}
  </div>
)

const Part: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="rounded-md border border-gray-200 p-2 dark:border-gray-700">
    <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
      {label}
    </div>
    <code className="mt-0.5 block break-all font-mono text-xs text-gray-800 dark:text-gray-100">
      {value}
    </code>
  </div>
)

export default CssClamp
