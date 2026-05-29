import React, { useMemo, useState } from 'react'
import { Card, PageHero, Button, Input, ParticlesBackground } from '@toolbox/ui-kit'
import { useTranslation } from 'react-i18next'
import { ArrowLeftRight, Check, Copy, Wand2, X } from 'lucide-react'
import {
  adjustForegroundToRatio,
  contrastRatio,
  gradeContrast,
  parseHex,
  toHex,
} from './lib/contrast'

type Channel = 'foreground' | 'background'

const DEFAULT_FG = '#1f2937'
const DEFAULT_BG = '#ffffff'

const ContrastChecker: React.FC = () => {
  const { t } = useTranslation('toolContrastChecker')

  const [fgHex, setFgHex] = useState(DEFAULT_FG)
  const [bgHex, setBgHex] = useState(DEFAULT_BG)

  const fgRgb = useMemo(() => parseHex(fgHex), [fgHex])
  const bgRgb = useMemo(() => parseHex(bgHex), [bgHex])

  const ratio = useMemo(
    () => (fgRgb && bgRgb ? contrastRatio(fgRgb, bgRgb) : null),
    [fgRgb, bgRgb],
  )
  const grades = useMemo(() => (ratio !== null ? gradeContrast(ratio) : null), [ratio])

  const swap = () => {
    setFgHex(bgHex)
    setBgHex(fgHex)
  }

  const autoFix = (targetRatio: number) => {
    if (!fgRgb || !bgRgb) return
    const next = adjustForegroundToRatio(fgRgb, bgRgb, targetRatio)
    setFgHex(toHex(next))
  }

  const copy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value)
    } catch {
      // ignore
    }
  }

  return (
    <div className="relative min-h-[60vh]">
      <ParticlesBackground preset="minimal" className="absolute inset-0" />
      <div className="relative z-10 space-y-6">
        <PageHero title={t('title')} description={t('description')} />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          <Card>
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t('inputs.heading')}
            </h2>

            <div className="space-y-4">
              <ColorRow
                label={t('inputs.foreground')}
                hex={fgHex}
                valid={fgRgb !== null}
                onChange={setFgHex}
                onCopy={copy}
                channel="foreground"
              />
              <ColorRow
                label={t('inputs.background')}
                hex={bgHex}
                valid={bgRgb !== null}
                onChange={setBgHex}
                onCopy={copy}
                channel="background"
              />

              <div className="flex flex-wrap gap-2 pt-2">
                <Button variant="secondary" size="sm" onClick={swap}>
                  <span className="inline-flex items-center gap-1.5">
                    <ArrowLeftRight className="h-4 w-4" />
                    {t('actions.swap')}
                  </span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => autoFix(4.5)}
                  disabled={!fgRgb || !bgRgb}
                >
                  <span className="inline-flex items-center gap-1.5">
                    <Wand2 className="h-4 w-4" />
                    {t('actions.fixAA')}
                  </span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => autoFix(7)}
                  disabled={!fgRgb || !bgRgb}
                >
                  <span className="inline-flex items-center gap-1.5">
                    <Wand2 className="h-4 w-4" />
                    {t('actions.fixAAA')}
                  </span>
                </Button>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t('result.heading')}
            </h2>

            {ratio !== null && grades ? (
              <>
                <div className="mb-6 flex items-baseline gap-3">
                  <span className="text-5xl font-bold text-gray-900 dark:text-gray-100 tabular-nums">
                    {ratio.toFixed(2)}
                  </span>
                  <span className="text-2xl text-gray-500 dark:text-gray-400">:1</span>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-6">
                  <GradeBadge label={t('result.aaNormal')} pass={grades.aaNormal} threshold="4.5" />
                  <GradeBadge label={t('result.aaLarge')} pass={grades.aaLarge} threshold="3.0" />
                  <GradeBadge label={t('result.aaaNormal')} pass={grades.aaaNormal} threshold="7.0" />
                  <GradeBadge label={t('result.aaaLarge')} pass={grades.aaaLarge} threshold="4.5" />
                </div>

                <Preview fgHex={fgHex} bgHex={bgHex} t={t} />
              </>
            ) : (
              <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-700 p-6 text-center text-sm text-gray-500 dark:text-gray-400">
                {t('result.invalid')}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}

type ColorRowProps = {
  label: string
  hex: string
  valid: boolean
  channel: Channel
  onChange: (v: string) => void
  onCopy: (v: string) => void
}

const ColorRow: React.FC<ColorRowProps> = ({ label, hex, valid, onChange, onCopy }) => {
  // 颜色选择器需要严格的 #rrggbb 形式
  const pickerValue = valid ? normalizeHex(hex) : '#000000'
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <div className="flex items-stretch gap-2">
        <label className="relative inline-flex h-10 w-12 cursor-pointer overflow-hidden rounded-lg border border-gray-300 dark:border-gray-600">
          <input
            type="color"
            value={pickerValue}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            aria-label={label}
          />
          <span
            className="block h-full w-full"
            style={{ backgroundColor: pickerValue }}
          />
        </label>
        <Input
          value={hex}
          onChange={(e) => onChange(e.target.value)}
          error={!valid}
          spellCheck={false}
          className="font-mono uppercase"
        />
        <Button variant="ghost" size="sm" onClick={() => onCopy(hex)}>
          <Copy className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

type GradeBadgeProps = { label: string; pass: boolean; threshold: string }

const GradeBadge: React.FC<GradeBadgeProps> = ({ label, pass, threshold }) => (
  <div
    className={[
      'flex items-center justify-between rounded-lg border px-3 py-2 text-sm',
      pass
        ? 'border-green-300 bg-green-50 text-green-800 dark:border-green-700 dark:bg-green-900/30 dark:text-green-300'
        : 'border-red-300 bg-red-50 text-red-800 dark:border-red-700 dark:bg-red-900/30 dark:text-red-300',
    ].join(' ')}
  >
    <span className="font-medium">{label}</span>
    <span className="inline-flex items-center gap-1 text-xs">
      <span className="tabular-nums opacity-70">≥ {threshold}</span>
      {pass ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
    </span>
  </div>
)

const Preview: React.FC<{
  fgHex: string
  bgHex: string
  t: (key: string) => string
}> = ({ fgHex, bgHex, t }) => (
  <div
    className="rounded-lg p-5 transition-colors"
    style={{ backgroundColor: bgHex, color: fgHex }}
  >
    <div className="text-2xl font-bold leading-tight">{t('preview.large')}</div>
    <div className="mt-2 text-base">{t('preview.normal')}</div>
    <div className="mt-2 text-sm opacity-90">{t('preview.small')}</div>
  </div>
)

function normalizeHex(input: string): string {
  const rgb = parseHex(input)
  return rgb ? toHex(rgb) : '#000000'
}

export default ContrastChecker
