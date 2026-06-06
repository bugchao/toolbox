import React, { useEffect, useMemo, useState } from 'react'
import { Button, Card, Input, NoticeCard, PageHero, ParticlesBackground } from '@toolbox/ui-kit'
import { useTranslation } from 'react-i18next'
import { AlertTriangle, Check, ClipboardCopy, Palette } from 'lucide-react'
import {
  contrastHints,
  formatAll,
  fromHsl,
  isInP3Gamut,
  isInSrgbGamut,
  parseColor,
  toHex,
  toHsl,
  tryNamedColor,
  type ColorFormat as Fmt,
} from './lib/color'
import type { Color } from 'culori'

const STORAGE_KEY = 'tool-color-format.v1.last'
const HISTORY_KEY = 'tool-color-format.v1.history'
const HISTORY_CAP = 12

const SAMPLES: string[] = [
  '#3366cc',
  'oklch(0.7 0.18 250)',
  'hsl(160 75% 45%)',
  '#ff5722',
  'lab(60 35 -45)',
  '#000000',
  '#ffffff',
  'rgba(255, 87, 51, 0.6)',
]

function readLast(): string {
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? '#3366cc'
  } catch {
    return '#3366cc'
  }
}

function writeLast(s: string) {
  try { window.localStorage.setItem(STORAGE_KEY, s) } catch { /* ignore */ }
}

function readHistory(): string[] {
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : []
  } catch {
    return []
  }
}

function writeHistory(arr: string[]) {
  try { window.localStorage.setItem(HISTORY_KEY, JSON.stringify(arr)) } catch { /* ignore */ }
}

const FORMAT_ORDER: Exclude<Fmt, 'named'>[] = ['hex', 'rgb', 'hsl', 'hwb', 'lab', 'lch', 'oklch', 'oklab']

const ColorFormat: React.FC = () => {
  const { t } = useTranslation('toolColorFormat')
  const [input, setInput] = useState<string>(readLast)
  const [history, setHistory] = useState<string[]>(readHistory)
  const [copied, setCopied] = useState<string | null>(null)

  const parsed = useMemo(() => parseColor(input), [input])
  const color: Color | null = parsed.ok ? parsed.color : null

  // 滑块状态：和 input 双向同步
  const [hsl, setHslState] = useState({ h: 220, s: 0.6, l: 0.5, a: 1 })

  useEffect(() => {
    if (color) {
      writeLast(input)
      // 从 color 反推 HSL 给滑块
      try {
        const hslStr = toHsl(color)
        // 简单解析 hsl(h s% l% / a)
        const m = hslStr.match(/hsl\(([\d.]+) ([\d.]+)% ([\d.]+)%(?: \/ ([\d.]+))?\)/)
        if (m) {
          setHslState({
            h: Number(m[1]),
            s: Number(m[2]) / 100,
            l: Number(m[3]) / 100,
            a: m[4] ? Number(m[4]) : 1,
          })
        }
      } catch { /* ignore */ }
    }
  }, [color, input])

  const allFormats = useMemo(() => (color ? formatAll(color) : null), [color])
  const hints = useMemo(() => (color ? contrastHints(color) : null), [color])
  const named = useMemo(() => (color ? tryNamedColor(color) : null), [color])
  const inSrgb = useMemo(() => (color ? isInSrgbGamut(color) : true), [color])
  const inP3 = useMemo(() => (color ? isInP3Gamut(color) : true), [color])
  const hexPreview = useMemo(() => (color ? toHex(color) : '#000000'), [color])

  const setHsl = (next: typeof hsl) => {
    setHslState(next)
    const c = fromHsl(next.h, next.s, next.l, next.a)
    setInput(toHsl(c))
  }

  const onCopy = async (fmt: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(fmt)
      window.setTimeout(() => setCopied((cur) => (cur === fmt ? null : cur)), 1200)
    } catch { /* ignore */ }
  }

  const pushHistory = (val: string) => {
    setHistory((cur) => {
      const next = [val, ...cur.filter((x) => x !== val)].slice(0, HISTORY_CAP)
      writeHistory(next)
      return next
    })
  }

  const onSelectSample = (s: string) => {
    setInput(s)
    pushHistory(s)
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
          icon={Palette}
        />

        <Card>
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
            {/* 左：输入 + 滑块 */}
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-200">
                  {t('input.label')}
                </label>
                <div className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onBlur={() => parsed.ok && pushHistory(input)}
                    placeholder={t('input.placeholder')}
                    spellCheck={false}
                    autoComplete="off"
                  />
                  <input
                    type="color"
                    value={hexPreview.slice(0, 7)}
                    onChange={(e) => { setInput(e.target.value); pushHistory(e.target.value) }}
                    className="h-10 w-12 cursor-pointer rounded border border-gray-300 dark:border-gray-700"
                  />
                </div>
                {!parsed.ok && input.trim() && (
                  <p className="mt-1 text-xs text-rose-600 dark:text-rose-300">
                    {t('input.parseError', { msg: parsed.message })}
                  </p>
                )}
              </div>

              <div className="rounded-md border border-gray-200 p-3 dark:border-gray-700">
                <h3 className="mb-2 text-xs font-semibold text-gray-700 dark:text-gray-200">
                  {t('hsl.heading')}
                </h3>
                <Slider label="H" value={hsl.h} min={0} max={360} step={1} unit="°"
                  onChange={(v) => setHsl({ ...hsl, h: v })} />
                <Slider label="S" value={Math.round(hsl.s * 100)} min={0} max={100} step={1} unit="%"
                  onChange={(v) => setHsl({ ...hsl, s: v / 100 })} />
                <Slider label="L" value={Math.round(hsl.l * 100)} min={0} max={100} step={1} unit="%"
                  onChange={(v) => setHsl({ ...hsl, l: v / 100 })} />
                <Slider label="α" value={Math.round(hsl.a * 100)} min={0} max={100} step={1} unit="%"
                  onChange={(v) => setHsl({ ...hsl, a: v / 100 })} />
              </div>

              <div>
                <h3 className="mb-2 text-xs font-semibold text-gray-700 dark:text-gray-200">
                  {t('samples.heading')}
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {SAMPLES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => onSelectSample(s)}
                      title={s}
                      className="h-6 w-6 rounded border border-gray-200 transition hover:scale-110 dark:border-gray-700"
                      style={{ background: s }}
                    />
                  ))}
                </div>
              </div>

              {history.length > 0 && (
                <div>
                  <h3 className="mb-2 flex items-center justify-between text-xs font-semibold text-gray-700 dark:text-gray-200">
                    <span>{t('history.heading')}</span>
                    <button
                      type="button"
                      onClick={() => { writeHistory([]); setHistory([]) }}
                      className="text-[10px] font-normal text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      {t('history.clear')}
                    </button>
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {history.map((h) => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => setInput(h)}
                        title={h}
                        className="h-6 w-6 rounded border border-gray-200 transition hover:scale-110 dark:border-gray-700"
                        style={{ background: h }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 右：大色块预览 + badge */}
            <div className="space-y-2">
              <div
                className="aspect-square rounded-lg border-2 border-gray-200 shadow-inner dark:border-gray-700"
                style={{ background: parsed.ok ? hexPreview : 'transparent' }}
              />
              <div className="flex flex-wrap gap-1.5 text-[11px]">
                {named && (
                  <Badge color="emerald">{t('badge.named', { name: named })}</Badge>
                )}
                {!inSrgb && (
                  <Badge color="amber" icon={<AlertTriangle className="h-3 w-3" />}>
                    {t('badge.outOfSrgb')}
                  </Badge>
                )}
                {inSrgb && (
                  <Badge color="indigo">sRGB ✓</Badge>
                )}
                {inP3 && !inSrgb && (
                  <Badge color="violet">P3 ✓</Badge>
                )}
                {!inP3 && (
                  <Badge color="rose" icon={<AlertTriangle className="h-3 w-3" />}>
                    {t('badge.outOfP3')}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* 格式卡片 */}
        {allFormats && (
          <Card>
            <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t('formats.heading')}
            </h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {FORMAT_ORDER.map((fmt) => {
                const value = allFormats[fmt]
                const isCopied = copied === fmt
                return (
                  <div
                    key={fmt}
                    className="flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 dark:border-gray-700"
                  >
                    <span className="w-14 shrink-0 text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      {fmt}
                    </span>
                    <code className="flex-1 truncate font-mono text-sm text-gray-800 dark:text-gray-100">
                      {value}
                    </code>
                    <button
                      type="button"
                      onClick={() => onCopy(fmt, value)}
                      className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                    >
                      {isCopied ? <Check className="h-3.5 w-3.5" /> : <ClipboardCopy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                )
              })}
            </div>
          </Card>
        )}

        {/* WCAG */}
        {hints && (
          <Card>
            <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t('wcag.heading')}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <ContrastBlock
                bg="#ffffff"
                fg={hexPreview}
                label={t('wcag.vsWhite')}
                ratio={hints.vsWhite.ratio}
                verdict={hints.vsWhite.verdict}
              />
              <ContrastBlock
                bg="#000000"
                fg={hexPreview}
                label={t('wcag.vsBlack')}
                ratio={hints.vsBlack.ratio}
                verdict={hints.vsBlack.verdict}
              />
            </div>
            <p className="mt-3 text-[11px] text-gray-500 dark:text-gray-400">
              {t('wcag.legend')}
            </p>
          </Card>
        )}
      </div>
    </div>
  )
}

const Slider: React.FC<{
  label: string
  value: number
  min: number
  max: number
  step: number
  unit?: string
  onChange: (v: number) => void
}> = ({ label, value, min, max, step, unit, onChange }) => (
  <label className="mb-1.5 flex items-center gap-2 text-xs">
    <span className="w-4 font-mono text-gray-500 dark:text-gray-400">{label}</span>
    <input
      type="range"
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={(e) => onChange(Number(e.target.value))}
      className="flex-1"
    />
    <span className="w-12 text-right text-gray-700 dark:text-gray-200">{value}{unit ?? ''}</span>
  </label>
)

const Badge: React.FC<{
  color: 'emerald' | 'amber' | 'indigo' | 'violet' | 'rose'
  icon?: React.ReactNode
  children: React.ReactNode
}> = ({ color, icon, children }) => {
  const map: Record<string, string> = {
    emerald: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
    amber: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    indigo: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
    violet: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300',
    rose: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300',
  }
  return (
    <span className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 ${map[color]}`}>
      {icon}
      {children}
    </span>
  )
}

const ContrastBlock: React.FC<{
  bg: string
  fg: string
  label: string
  ratio: number
  verdict: 'AAA' | 'AA' | 'AA-large' | 'fail'
}> = ({ bg, fg, label, ratio, verdict }) => {
  const verdictClass =
    verdict === 'AAA' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' :
      verdict === 'AA' ? 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300' :
        verdict === 'AA-large' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' :
          'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300'
  return (
    <div className="rounded-md border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-center rounded-t-md px-3 py-4 text-2xl font-semibold"
        style={{ background: bg, color: fg }}>
        Aa
      </div>
      <div className="flex items-center justify-between px-3 py-2 text-xs">
        <span className="text-gray-600 dark:text-gray-300">{label}</span>
        <span className="inline-flex items-center gap-1.5">
          <span className="font-mono">{ratio.toFixed(2)}</span>
          <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${verdictClass}`}>
            {verdict.toUpperCase()}
          </span>
        </span>
      </div>
    </div>
  )
}

export default ColorFormat
