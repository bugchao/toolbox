import React, { useCallback, useMemo, useState } from 'react'
import { Button, Card, NoticeCard, PageHero, ParticlesBackground, TextArea } from '@toolbox/ui-kit'
import { useTranslation } from 'react-i18next'
import { Check, ClipboardPaste, Code2, Copy, Eraser, ArrowLeftRight } from 'lucide-react'
import { decodeHtml, encodeHtml, type EncodeMode } from './lib/entities'

type Mode = 'encode' | 'decode'

const ENCODE_MODES: ReadonlyArray<{ id: EncodeMode; i18nKey: string }> = [
  { id: 'minimal', i18nKey: 'encodeMode.minimal' },
  { id: 'named-extended', i18nKey: 'encodeMode.namedExtended' },
  { id: 'non-ascii-decimal', i18nKey: 'encodeMode.nonAsciiDecimal' },
  { id: 'non-ascii-hex', i18nKey: 'encodeMode.nonAsciiHex' },
  { id: 'all-non-ascii-named', i18nKey: 'encodeMode.allNonAsciiNamed' },
]

const SAMPLE_ENCODE = '<div class="card">Hello © 中文 — "world"</div>'
const SAMPLE_DECODE = '&lt;div class=&quot;card&quot;&gt;Hello &copy; &#20013;&#25991;&lt;/div&gt;'

const HtmlEntities: React.FC = () => {
  const { t } = useTranslation('toolHtmlEntities')
  const [mode, setMode] = useState<Mode>('encode')
  const [encodeMode, setEncodeMode] = useState<EncodeMode>('minimal')
  const [input, setInput] = useState('')
  const [copied, setCopied] = useState(false)

  // 输出：编码模式下做 encode，解码模式下做 decode。每次输入或选项变化都实时同步。
  const output = useMemo(() => {
    if (!input) return ''
    return mode === 'encode' ? encodeHtml(input, encodeMode) : decodeHtml(input)
  }, [input, mode, encodeMode])

  const inputChars = input.length
  const outputChars = output.length

  const onSwapMode = useCallback(() => {
    // 切换模式时把输出迁回输入，便于回滚验证
    setMode((m) => (m === 'encode' ? 'decode' : 'encode'))
    setInput(output)
  }, [output])

  const onClear = useCallback(() => setInput(''), [])

  const onPasteSample = useCallback(() => {
    setInput(mode === 'encode' ? SAMPLE_ENCODE : SAMPLE_DECODE)
  }, [mode])

  const onCopy = useCallback(async () => {
    if (!output) return
    try {
      await navigator.clipboard.writeText(output)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1200)
    } catch {
      /* 剪贴板 API 在某些上下文不可用，静默失败 */
    }
  }, [output])

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

        {/* 顶部工具栏：模式 + 编码强度 */}
        <Card>
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {t('mode.label')}
              </span>
              <div
                role="tablist"
                aria-label={t('mode.label')}
                className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1 dark:border-gray-700 dark:bg-gray-800"
              >
                <ModeTab
                  active={mode === 'encode'}
                  onClick={() => setMode('encode')}
                  label={t('mode.encode')}
                />
                <ModeTab
                  active={mode === 'decode'}
                  onClick={() => setMode('decode')}
                  label={t('mode.decode')}
                />
              </div>

              <Button variant="ghost" size="sm" onClick={onSwapMode}>
                <span className="inline-flex items-center gap-1.5 text-xs">
                  <ArrowLeftRight className="h-4 w-4" />
                  {t('mode.swap')}
                </span>
              </Button>
            </div>

            {mode === 'encode' && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  {t('encodeMode.label')}
                </span>
                <div
                  role="radiogroup"
                  aria-label={t('encodeMode.label')}
                  className="flex flex-wrap gap-1.5"
                >
                  {ENCODE_MODES.map((m) => (
                    <ToggleChip
                      key={m.id}
                      selected={encodeMode === m.id}
                      onClick={() => setEncodeMode(m.id)}
                      label={t(m.i18nKey)}
                    />
                  ))}
                </div>
              </div>
            )}

            {mode === 'decode' && (
              <p className="text-xs text-gray-500 dark:text-gray-400">{t('decode.hint')}</p>
            )}
          </div>
        </Card>

        {/* 双栏：输入 / 输出 */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* 左：输入 */}
          <Card>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {mode === 'encode' ? t('input.encodeHeading') : t('input.decodeHeading')}
              </h2>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {t('chars', { count: inputChars })}
              </span>
            </div>
            <TextArea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={12}
              placeholder={
                mode === 'encode' ? t('input.encodePlaceholder') : t('input.decodePlaceholder')
              }
              className="font-mono text-sm"
              aria-label={t('input.encodeHeading')}
            />
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Button variant="ghost" size="sm" onClick={onPasteSample}>
                <span className="inline-flex items-center gap-1.5 text-xs">
                  <ClipboardPaste className="h-4 w-4" />
                  {t('actions.pasteSample')}
                </span>
              </Button>
              <Button variant="ghost" size="sm" onClick={onClear}>
                <span className="inline-flex items-center gap-1.5 text-xs">
                  <Eraser className="h-4 w-4" />
                  {t('actions.clear')}
                </span>
              </Button>
            </div>
          </Card>

          {/* 右：输出 */}
          <Card>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {mode === 'encode' ? t('output.encodeHeading') : t('output.decodeHeading')}
              </h2>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {t('chars', { count: outputChars })}
              </span>
            </div>
            <TextArea
              value={output}
              readOnly
              rows={12}
              placeholder={t('output.placeholder')}
              className="font-mono text-sm"
              aria-label={mode === 'encode' ? t('output.encodeHeading') : t('output.decodeHeading')}
            />
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Button variant="ghost" size="sm" onClick={onCopy} disabled={!output}>
                <span className="inline-flex items-center gap-1.5 text-xs">
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? t('actions.copied') : t('actions.copy')}
                </span>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

/* -------------------- 子组件：模式 Tab -------------------- */

const ModeTab: React.FC<{ active: boolean; onClick: () => void; label: string }> = ({
  active,
  onClick,
  label,
}) => (
  <button
    type="button"
    role="tab"
    aria-selected={active}
    onClick={onClick}
    className={[
      'rounded-md px-3 py-1 text-xs transition',
      active
        ? 'bg-white text-indigo-700 shadow-sm dark:bg-gray-900 dark:text-indigo-300'
        : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100',
    ].join(' ')}
  >
    {label}
  </button>
)

/* -------------------- 子组件：单选 Chip -------------------- */

const ToggleChip: React.FC<{ selected: boolean; onClick: () => void; label: string }> = ({
  selected,
  onClick,
  label,
}) => (
  <button
    type="button"
    role="radio"
    aria-checked={selected}
    onClick={onClick}
    className={[
      'rounded-full border px-3 py-1 text-xs transition',
      selected
        ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-950/40 dark:text-indigo-200'
        : 'border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:border-gray-500 dark:hover:bg-gray-800',
    ].join(' ')}
  >
    {label}
  </button>
)

export default HtmlEntities
