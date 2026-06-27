import React, { useMemo, useState } from 'react'
import {
  Card,
  Input,
  NoticeCard,
  PageHero,
  ParticlesBackground,
  Switch,
  TextArea,
  cn,
} from '@toolbox/ui-kit'
import { useTranslation } from 'react-i18next'
import { Check, Code2, Copy, FileWarning } from 'lucide-react'
import { build, type JsxOptions } from './lib/svg'

const SAMPLE = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"
  width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
  inkscape:version="1.0" class="icon">
  <!-- arrow -->
  <path d="M5 12h14" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M12 5l7 7-7 7" stroke-width="2" stroke-linecap="round" style="fill:none"/>
</svg>`

const SvgToJsx: React.FC = () => {
  const { t } = useTranslation('toolSvgToJsx')
  const [input, setInput] = useState(SAMPLE)
  const [componentName, setComponentName] = useState('SvgIcon')
  const [copied, setCopied] = useState(false)

  const [optimize, setOptimize] = useState(true)
  const [toJsx, setToJsx] = useState(true)
  const [wrapComponent, setWrapComponent] = useState(true)
  const [typescript, setTypescript] = useState(true)
  const [forwardRef, setForwardRef] = useState(false)

  const options: JsxOptions = useMemo(
    () => ({
      stripComments: optimize,
      collapseWhitespace: optimize,
      stripMeta: optimize,
      toJsx,
      wrapComponent,
      typescript,
      forwardRef,
      componentName,
    }),
    [optimize, toJsx, wrapComponent, typescript, forwardRef, componentName],
  )

  const result = useMemo(() => build(input, options), [input, options])

  const onCopy = async () => {
    if (!result.code) return
    try {
      await navigator.clipboard.writeText(result.code)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1200)
    } catch {
      /* ignore */
    }
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
          icon={Code2}
        />

        <div className="grid gap-6 lg:grid-cols-2">
          {/* 左列：输入 + 选项 */}
          <div className="space-y-6">
            <Card>
              <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-200">
                {t('input.label')}
              </label>
              <TextArea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={12}
                placeholder={t('input.placeholder')}
                spellCheck={false}
                className="!font-mono !text-xs"
              />
            </Card>

            <Card>
              <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
                {t('options.heading')}
              </h2>
              <div className="space-y-3">
                <OptionRow
                  label={t('options.optimize')}
                  hint={t('options.optimizeHint')}
                  checked={optimize}
                  onChange={setOptimize}
                />
                <OptionRow
                  label={t('options.toJsx')}
                  hint={t('options.toJsxHint')}
                  checked={toJsx}
                  onChange={setToJsx}
                  disabled={wrapComponent}
                />
                <OptionRow
                  label={t('options.wrapComponent')}
                  checked={wrapComponent}
                  onChange={setWrapComponent}
                />
                <OptionRow
                  label={t('options.typescript')}
                  checked={typescript}
                  onChange={setTypescript}
                  disabled={!wrapComponent}
                />
                <OptionRow
                  label={t('options.forwardRef')}
                  checked={forwardRef}
                  onChange={setForwardRef}
                  disabled={!wrapComponent}
                />
                {wrapComponent && (
                  <div className="pt-1">
                    <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-200">
                      {t('options.componentName')}
                    </label>
                    <Input
                      value={componentName}
                      onChange={(e) => setComponentName(e.target.value)}
                      placeholder="SvgIcon"
                      spellCheck={false}
                      autoComplete="off"
                    />
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* 右列：预览 + 输出 */}
          <div className="space-y-6">
            <Card>
              <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
                {t('preview.heading')}
              </h2>
              <div className="flex min-h-[140px] items-center justify-center rounded-md border border-gray-200 bg-[conic-gradient(#0001_90deg,transparent_90deg_180deg,#0001_180deg_270deg,transparent_270deg)] bg-[length:16px_16px] p-4 dark:border-gray-700">
                {result.preview ? (
                  <div
                    className="max-h-[240px] [&>svg]:h-auto [&>svg]:max-h-[200px] [&>svg]:w-auto [&>svg]:max-w-full"
                    // 预览始终是优化后的合法原生 SVG
                    dangerouslySetInnerHTML={{ __html: result.preview }}
                  />
                ) : (
                  <span className="text-sm text-gray-400">{t('output.empty')}</span>
                )}
              </div>
            </Card>

            <Card>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {t('output.heading')}
                </h2>
                {result.code && (
                  <button
                    type="button"
                    onClick={() => void onCopy()}
                    className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 px-2.5 py-1 text-xs text-gray-600 transition hover:border-indigo-300 hover:text-indigo-600 dark:border-gray-700 dark:text-gray-300 dark:hover:border-indigo-700"
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    {copied ? t('output.copied') : t('output.copy')}
                  </button>
                )}
              </div>

              {result.error ? (
                <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-300">
                  <FileWarning className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{t(`errors.${result.error}`)}</span>
                </div>
              ) : (
                <pre className={cn(
                  'max-h-[420px] overflow-auto rounded-md border border-gray-200 bg-gray-50 p-3',
                  'font-mono text-xs text-gray-800 dark:border-gray-700 dark:bg-gray-900/50 dark:text-gray-100',
                )}>
                  <code>{result.code}</code>
                </pre>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

const OptionRow: React.FC<{
  label: string
  hint?: string
  checked: boolean
  disabled?: boolean
  onChange: (v: boolean) => void
}> = ({ label, hint, checked, disabled, onChange }) => (
  <div className={cn('flex items-start justify-between gap-3', disabled && 'opacity-50')}>
    <div className="min-w-0">
      <div className="text-sm font-medium text-gray-800 dark:text-gray-100">{label}</div>
      {hint && <div className="text-[11px] text-gray-500 dark:text-gray-400">{hint}</div>}
    </div>
    <Switch checked={checked} onChange={onChange} disabled={disabled} />
  </div>
)

export default SvgToJsx
