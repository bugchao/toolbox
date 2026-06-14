import React, { useMemo, useState } from 'react'
import { Button, Card, Input, NoticeCard, PageHero, ParticlesBackground, TextArea } from '@toolbox/ui-kit'
import { useTranslation } from 'react-i18next'
import { Check, ClipboardCopy, Dice5, Pilcrow, Sparkles } from 'lucide-react'
import { generate, type Flavor, type Unit } from './lib/generator'
import { formatParagraphs, type Format } from './lib/format'

const LoremIpsum: React.FC = () => {
  const { t } = useTranslation('toolLoremIpsum')
  const [flavor, setFlavor] = useState<Flavor>('latin')
  const [unit, setUnit] = useState<Unit>('paragraphs')
  const [count, setCount] = useState(3)
  const [startWithClassic, setStartWithClassic] = useState(true)
  const [format, setFormat] = useState<Format>('plain')
  const [headingEvery, setHeadingEvery] = useState(0)
  const [htmlParagraphs, setHtmlParagraphs] = useState(true)
  const [seedInput, setSeedInput] = useState('')
  const [tick, setTick] = useState(0) // 无 seed 时点「重新生成」换内容
  const [copied, setCopied] = useState(false)

  const seed = seedInput.trim() === '' ? undefined : Number(seedInput.trim())
  const seedLocked = seed != null && Number.isFinite(seed)

  const output = useMemo(() => {
    const paragraphs = generate({
      flavor,
      unit,
      count: Math.max(1, Math.min(50, count)),
      startWithClassic,
      seed: seedLocked ? seed : tick,
    })
    return formatParagraphs(paragraphs, format, flavor, {
      markdownHeadingEvery: headingEvery,
      htmlParagraphs,
    })
  }, [flavor, unit, count, startWithClassic, format, headingEvery, htmlParagraphs, seed, seedLocked, tick])

  const onCopy = async () => {
    if (!output) return
    try {
      await navigator.clipboard.writeText(output)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1200)
    } catch { /* ignore */ }
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
          icon={Pilcrow}
        />

        <Card>
          <div className="grid gap-4 md:grid-cols-3">
            <Field label={t('options.flavor')}>
              <SegmentedToggle
                value={flavor}
                onChange={(v) => setFlavor(v as Flavor)}
                options={[
                  { value: 'latin', label: t('options.flavorLatin') },
                  { value: 'chinese', label: t('options.flavorChinese') },
                ]}
              />
            </Field>

            <Field label={t('options.unit')}>
              <SegmentedToggle
                value={unit}
                onChange={(v) => setUnit(v as Unit)}
                options={[
                  { value: 'paragraphs', label: t('options.unitParagraphs') },
                  { value: 'sentences', label: t('options.unitSentences') },
                  { value: 'words', label: t('options.unitWords') },
                ]}
              />
            </Field>

            <Field label={t('options.count')}>
              <Input
                type="number"
                min={1}
                max={50}
                value={count}
                onChange={(e) => setCount(Math.max(1, Math.min(50, Number(e.target.value) || 1)))}
              />
            </Field>

            <Field label={t('options.format')}>
              <SegmentedToggle
                value={format}
                onChange={(v) => setFormat(v as Format)}
                options={[
                  { value: 'plain', label: 'Plain' },
                  { value: 'markdown', label: 'Markdown' },
                  { value: 'html', label: 'HTML' },
                ]}
              />
            </Field>

            {format === 'markdown' && (
              <Field label={t('options.headingEvery')}>
                <Input
                  type="number"
                  min={0}
                  max={20}
                  value={headingEvery}
                  onChange={(e) => setHeadingEvery(Math.max(0, Math.min(20, Number(e.target.value) || 0)))}
                />
                <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                  {t('options.headingEveryHint')}
                </p>
              </Field>
            )}

            {format === 'html' && (
              <Field label={t('options.htmlMode')}>
                <SegmentedToggle
                  value={htmlParagraphs ? 'p' : 'br'}
                  onChange={(v) => setHtmlParagraphs(v === 'p')}
                  options={[
                    { value: 'p', label: '<p>' },
                    { value: 'br', label: '<br>' },
                  ]}
                />
              </Field>
            )}

            <Field label={t('options.seed')}>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={seedInput}
                  onChange={(e) => setSeedInput(e.target.value)}
                  placeholder={t('options.seedPlaceholder')}
                />
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setSeedInput(String(Math.floor(Math.random() * 100000)))}
                  title={t('options.seedRandom')}
                >
                  <Dice5 className="h-4 w-4" />
                </Button>
              </div>
            </Field>

            <Field label={t('options.classic')}>
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={startWithClassic}
                  onChange={(e) => setStartWithClassic(e.target.checked)}
                />
                <span>{t('options.classicLabel')}</span>
              </label>
            </Field>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-gray-200 pt-3 dark:border-gray-700">
            <Button onClick={() => setTick((v) => v + 1)} disabled={seedLocked}>
              <span className="inline-flex items-center gap-1.5">
                <Sparkles className="h-4 w-4" />
                {t('actions.regenerate')}
              </span>
            </Button>
            <Button variant="ghost" onClick={onCopy} disabled={!output}>
              <span className="inline-flex items-center gap-1.5">
                {copied ? <Check className="h-4 w-4" /> : <ClipboardCopy className="h-4 w-4" />}
                {copied ? t('actions.copied') : t('actions.copy')}
              </span>
            </Button>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {t('actions.charCount', { n: output.length })}
            </span>
          </div>
        </Card>

        <Card>
          <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
            {t('output.heading')}
          </h2>
          <TextArea value={output} readOnly rows={14} spellCheck={false} />
        </Card>
      </div>
    </div>
  )
}

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <label className="block">
    <span className="mb-1 block text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
      {label}
    </span>
    {children}
  </label>
)

const SegmentedToggle: React.FC<{
  value: string
  options: { value: string; label: string }[]
  onChange: (v: string) => void
}> = ({ value, options, onChange }) => (
  <div className="inline-flex w-full rounded-md border border-gray-200 p-0.5 dark:border-gray-700">
    {options.map((o) => (
      <button
        key={o.value}
        type="button"
        onClick={() => onChange(o.value)}
        className={[
          'flex-1 rounded px-2 py-1 text-xs font-medium transition',
          value === o.value
            ? 'bg-indigo-500 text-white shadow-sm'
            : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800',
        ].join(' ')}
      >
        {o.label}
      </button>
    ))}
  </div>
)

export default LoremIpsum
