import React, { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Palette, Copy, Check, Download } from 'lucide-react'
import { PageHero } from '@toolbox/ui-kit'

function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h = 0, s = 0
  const l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)]
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100; l /= 100
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color).toString(16).padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `${r}, ${g}, ${b}`
}

function generateScale(hex: string): { step: number; hex: string }[] {
  const [h, s] = hexToHsl(hex)
  const steps = [95, 85, 75, 60, 45, 35, 25, 15, 8, 4]
  return steps.map((l, i) => ({ step: (i + 1) * 100, hex: hslToHex(h, Math.min(s, 90), l) }))
}

function shiftHue(hex: string, deg: number, lShift = 0): string {
  const [h, s, l] = hexToHsl(hex)
  return hslToHex((h + deg + 360) % 360, s, Math.max(10, Math.min(90, l + lShift)))
}

interface ColorSwatch { label: string; hex: string; cssVar: string }

export default function ColorSystem() {
  const { t } = useTranslation('toolColorSystem')
  const [primary, setPrimary] = useState('#6366f1')
  const [scale, setScale] = useState<{ step: number; hex: string }[]>([])
  const [palette, setPalette] = useState<ColorSwatch[]>([])
  const [copied, setCopied] = useState<string | null>(null)
  const [format, setFormat] = useState<'hex' | 'rgb' | 'hsl'>('hex')

  const handleGenerate = () => {
    const sc = generateScale(primary)
    setScale(sc)
    const [h, s, l] = hexToHsl(primary)
    setPalette([
      { label: t('primary'), hex: primary, cssVar: '--color-primary' },
      { label: t('secondary'), hex: shiftHue(primary, 30), cssVar: '--color-secondary' },
      { label: t('accent'), hex: shiftHue(primary, -60, 10), cssVar: '--color-accent' },
      { label: t('neutral'), hex: hslToHex(h, 10, 50), cssVar: '--color-neutral' },
      { label: t('success'), hex: hslToHex(142, 70, 40), cssVar: '--color-success' },
      { label: t('warning'), hex: hslToHex(38, 95, 50), cssVar: '--color-warning' },
      { label: t('error'), hex: hslToHex(0, 85, 55), cssVar: '--color-error' },
    ])
  }

  const formatColor = (hex: string) => {
    if (format === 'rgb') return `rgb(${hexToRgb(hex)})`
    if (format === 'hsl') { const [h,s,l] = hexToHsl(hex); return `hsl(${h}, ${s}%, ${l}%)` }
    return hex
  }

  const handleCopy = (val: string, key: string) => {
    navigator.clipboard.writeText(val)
    setCopied(key)
    setTimeout(() => setCopied(null), 1500)
  }

  const exportCSS = () => {
    const vars = palette.map(p => `  ${p.cssVar}: ${p.hex};`).join('\n')
    const scaleVars = scale.map(s => `  --color-primary-${s.step}: ${s.hex};`).join('\n')
    const css = `:root {\n${vars}\n${scaleVars}\n}`
    handleCopy(css, 'css')
  }

  const isLight = (hex: string) => hexToHsl(hex)[2] > 60

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHero icon={Palette} titleKey="title" descriptionKey="description" namespace="toolColorSystem" />
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Input */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">{t('primaryColor')}</label>
          <div className="flex items-center gap-4">
            <input type="color" value={primary} onChange={e => setPrimary(e.target.value)} className="w-14 h-14 rounded-xl border-0 cursor-pointer bg-transparent" />
            <input type="text" value={primary} onChange={e => /^#[0-9a-fA-F]{0,6}$/.test(e.target.value) && setPrimary(e.target.value)} className="flex-1 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm font-mono bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <div className="flex border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden text-xs">
              {(['hex','rgb','hsl'] as const).map(f => (
                <button key={f} onClick={() => setFormat(f)} className={`px-3 py-2 font-medium transition-colors ${format === f ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>{f.toUpperCase()}</button>
              ))}
            </div>
          </div>
          <button onClick={handleGenerate} className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-2.5 text-sm font-medium transition-colors">
            {t('generate')}
          </button>
        </div>

        {/* Color Scale */}
        {scale.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">{t('colorScale')}</h2>
            <div className="grid grid-cols-5 gap-2">
              {scale.map(s => (
                <button key={s.step} onClick={() => handleCopy(formatColor(s.hex), `scale-${s.step}`)} className="group relative rounded-xl overflow-hidden" style={{ background: s.hex, height: 72 }}>
                  <div className={`absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ${isLight(s.hex) ? 'text-gray-800' : 'text-white'}`}>
                    <span className="text-xs font-bold">{s.step}</span>
                    <span className="text-xs">{copied === `scale-${s.step}` ? '✓' : formatColor(s.hex)}</span>
                  </div>
                  <div className={`absolute bottom-1 left-0 right-0 text-center text-xs font-medium ${isLight(s.hex) ? 'text-gray-700' : 'text-white/80'}`}>{s.step}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Palette */}
        {palette.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">{t('palette')}</h2>
              <button onClick={exportCSS} className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-700 border border-indigo-200 rounded-lg px-3 py-1.5">
                {copied === 'css' ? <Check className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
                {copied === 'css' ? t('copied') : t('exportCSS')}
              </button>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {palette.map(c => (
                <div key={c.cssVar} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="w-10 h-10 rounded-lg flex-shrink-0 border border-gray-100" style={{ background: c.hex }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-200">{c.label}</div>
                    <div className="text-xs text-gray-400 font-mono">{c.cssVar}</div>
                  </div>
                  <button onClick={() => handleCopy(formatColor(c.hex), c.cssVar)} className="flex items-center gap-1 text-xs text-gray-400 hover:text-indigo-600 transition-colors">
                    {copied === c.cssVar ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span className="font-mono">{formatColor(c.hex)}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
