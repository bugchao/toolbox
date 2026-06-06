import React, { useMemo, useState } from 'react'
import { Button, Card, Input, NoticeCard, PageHero, ParticlesBackground, TextArea } from '@toolbox/ui-kit'
import { useTranslation } from 'react-i18next'
import { Check, ClipboardCopy, FileText, Link2, Plus, Trash2, Type } from 'lucide-react'
import {
  DEFAULT_OPTIONS,
  slugify,
  slugifyBatch,
  type CaseStrategy,
  type ChineseStrategy,
  type SlugOptions,
} from './lib/slug'

const SAMPLE_SINGLE = 'Hello World — 你好世界'
const SAMPLE_BATCH = [
  'iPhone 15 Pro Max',
  '我爱 React 框架',
  '快速开始：5 分钟搭起一个网站',
  'café déjà vu',
].join('\n')

const SlugGenerator: React.FC = () => {
  const { t } = useTranslation('toolSlugGenerator')
  const [mode, setMode] = useState<'single' | 'batch'>('single')
  const [single, setSingle] = useState(SAMPLE_SINGLE)
  const [batch, setBatch] = useState(SAMPLE_BATCH)
  const [opts, setOpts] = useState<SlugOptions>(DEFAULT_OPTIONS)
  const [maxLengthInput, setMaxLengthInput] = useState('')
  const [replaceFrom, setReplaceFrom] = useState('')
  const [replaceTo, setReplaceTo] = useState('')
  const [copied, setCopied] = useState(false)

  const effectiveOpts: SlugOptions = useMemo(() => {
    const max = parseInt(maxLengthInput, 10)
    return { ...opts, maxLength: Number.isFinite(max) && max > 0 ? max : undefined }
  }, [opts, maxLengthInput])

  const singleOutput = useMemo(() => slugify(single, effectiveOpts), [single, effectiveOpts])
  const batchOutput = useMemo(() => slugifyBatch(batch, effectiveOpts), [batch, effectiveOpts])

  const onCopy = async (text: string) => {
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1200)
    } catch { /* ignore */ }
  }

  const addReplacement = () => {
    if (!replaceFrom) return
    setOpts((cur) => ({
      ...cur,
      customReplacements: { ...cur.customReplacements, [replaceFrom]: replaceTo },
    }))
    setReplaceFrom('')
    setReplaceTo('')
  }
  const removeReplacement = (key: string) => {
    setOpts((cur) => {
      const next = { ...cur.customReplacements }
      delete next[key]
      return { ...cur, customReplacements: next }
    })
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
          icon={Link2}
        />

        <Card>
          {/* 单条 / 批量 Tab */}
          <div className="mb-4 inline-flex rounded-md border border-gray-200 p-0.5 dark:border-gray-700">
            <button
              type="button"
              onClick={() => setMode('single')}
              className={[
                'inline-flex items-center gap-1.5 rounded px-3 py-1 text-xs font-medium transition',
                mode === 'single'
                  ? 'bg-indigo-500 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800',
              ].join(' ')}
            >
              <Type className="h-3.5 w-3.5" />
              {t('mode.single')}
            </button>
            <button
              type="button"
              onClick={() => setMode('batch')}
              className={[
                'inline-flex items-center gap-1.5 rounded px-3 py-1 text-xs font-medium transition',
                mode === 'batch'
                  ? 'bg-indigo-500 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800',
              ].join(' ')}
            >
              <FileText className="h-3.5 w-3.5" />
              {t('mode.batch')}
            </button>
          </div>

          {mode === 'single' ? (
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-200">
                  {t('input.single')}
                </label>
                <Input
                  value={single}
                  onChange={(e) => setSingle(e.target.value)}
                  placeholder={t('input.singlePlaceholder')}
                  spellCheck={false}
                />
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-medium text-gray-700 dark:text-gray-200">{t('output.label')}</span>
                  <button
                    type="button"
                    onClick={() => onCopy(singleOutput)}
                    disabled={!singleOutput}
                    className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-30"
                  >
                    {copied ? <Check className="h-3 w-3" /> : <ClipboardCopy className="h-3 w-3" />}
                    {copied ? t('output.copied') : t('output.copy')}
                  </button>
                </div>
                <code className="block w-full break-all rounded-md border border-gray-200 bg-gray-50 px-3 py-2 font-mono text-sm text-indigo-700 dark:border-gray-700 dark:bg-gray-900 dark:text-indigo-300">
                  {singleOutput || <span className="text-gray-400 italic">{t('output.empty')}</span>}
                </code>
                {effectiveOpts.maxLength && singleOutput && (
                  <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                    {t('output.length', { n: singleOutput.length, max: effectiveOpts.maxLength })}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-200">
                  {t('input.batch')}
                </label>
                <TextArea
                  value={batch}
                  onChange={(e) => setBatch(e.target.value)}
                  placeholder={t('input.batchPlaceholder')}
                  rows={10}
                  spellCheck={false}
                />
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-medium text-gray-700 dark:text-gray-200">{t('output.label')}</span>
                  <button
                    type="button"
                    onClick={() => onCopy(batchOutput)}
                    disabled={!batchOutput.trim()}
                    className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-30"
                  >
                    {copied ? <Check className="h-3 w-3" /> : <ClipboardCopy className="h-3 w-3" />}
                    {copied ? t('output.copied') : t('output.copy')}
                  </button>
                </div>
                <TextArea value={batchOutput} readOnly rows={10} placeholder={t('output.empty')} />
              </div>
            </div>
          )}
        </Card>

        <Card>
          <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
            {t('options.heading')}
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label={t('options.separator')}>
              <select
                value={opts.separator}
                onChange={(e) => setOpts((o) => ({ ...o, separator: e.target.value }))}
                className="w-full rounded border border-gray-300 bg-white px-2 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-900"
              >
                <option value="-">{'- (hyphen)'}</option>
                <option value="_">{'_ (underscore)'}</option>
                <option value=".">{'. (dot)'}</option>
                <option value="">{t('options.separatorNone')}</option>
              </select>
            </Field>

            <Field label={t('options.case')}>
              <select
                value={opts.case}
                onChange={(e) => setOpts((o) => ({ ...o, case: e.target.value as CaseStrategy }))}
                className="w-full rounded border border-gray-300 bg-white px-2 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-900"
              >
                <option value="lower">{t('options.caseLower')}</option>
                <option value="upper">{t('options.caseUpper')}</option>
                <option value="preserve">{t('options.casePreserve')}</option>
              </select>
            </Field>

            <Field label={t('options.chinese')}>
              <select
                value={opts.chineseStrategy}
                onChange={(e) => setOpts((o) => ({ ...o, chineseStrategy: e.target.value as ChineseStrategy }))}
                className="w-full rounded border border-gray-300 bg-white px-2 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-900"
              >
                <option value="pinyin-full">{t('options.chinesePinyinFull')}</option>
                <option value="pinyin-initials">{t('options.chinesePinyinInitials')}</option>
                <option value="skip">{t('options.chineseSkip')}</option>
                <option value="keep">{t('options.chineseKeep')}</option>
              </select>
            </Field>

            <Field label={t('options.maxLength')}>
              <Input
                type="number"
                min={0}
                value={maxLengthInput}
                onChange={(e) => setMaxLengthInput(e.target.value)}
                placeholder={t('options.maxLengthPlaceholder')}
              />
            </Field>

            <Field label={t('options.allowedExtras')}>
              <Input
                value={opts.allowedExtras}
                onChange={(e) => setOpts((o) => ({ ...o, allowedExtras: e.target.value }))}
                placeholder={'.~$'}
                spellCheck={false}
              />
            </Field>

            <div className="space-y-2 text-sm">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={opts.stripDiacritics}
                  onChange={(e) => setOpts((o) => ({ ...o, stripDiacritics: e.target.checked }))}
                />
                <span>{t('options.stripDiacritics')}</span>
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={opts.stripStopwords}
                  onChange={(e) => setOpts((o) => ({ ...o, stripStopwords: e.target.checked }))}
                />
                <span>{t('options.stripStopwords')}</span>
              </label>
            </div>
          </div>

          {/* 自定义替换 */}
          <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
            <h3 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
              {t('options.replacementsHeading')}
            </h3>
            <p className="mb-2 text-[11px] text-gray-500 dark:text-gray-400">
              {t('options.replacementsHint')}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Input
                value={replaceFrom}
                onChange={(e) => setReplaceFrom(e.target.value)}
                placeholder={t('options.replaceFromPlaceholder')}
                className="!w-32"
                spellCheck={false}
              />
              <span className="text-gray-500">→</span>
              <Input
                value={replaceTo}
                onChange={(e) => setReplaceTo(e.target.value)}
                placeholder={t('options.replaceToPlaceholder')}
                className="!w-32"
                spellCheck={false}
              />
              <Button type="button" variant="ghost" onClick={addReplacement} disabled={!replaceFrom}>
                <span className="inline-flex items-center gap-1">
                  <Plus className="h-3.5 w-3.5" />
                  {t('options.replaceAdd')}
                </span>
              </Button>
            </div>
            {Object.keys(opts.customReplacements).length > 0 && (
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {Object.entries(opts.customReplacements).map(([k, v]) => (
                  <li
                    key={k}
                    className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-xs text-indigo-800 dark:border-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-200"
                  >
                    <code className="font-mono">{k}</code>
                    <span>→</span>
                    <code className="font-mono">{v || '(empty)'}</code>
                    <button
                      type="button"
                      onClick={() => removeReplacement(k)}
                      className="ml-1 rounded p-0.5 hover:bg-indigo-100 dark:hover:bg-indigo-800"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
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

export default SlugGenerator
