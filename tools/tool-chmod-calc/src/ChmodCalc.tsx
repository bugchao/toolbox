import React, { useCallback, useMemo, useState } from 'react'
import {
  Card,
  Input,
  NoticeCard,
  PageHero,
  ParticlesBackground,
  cn,
} from '@toolbox/ui-kit'
import { useTranslation } from 'react-i18next'
import { Check, Copy, FileLock2 } from 'lucide-react'
import {
  CLASS_IDS,
  PERM_IDS,
  PERM_VALUE,
  SPECIAL_IDS,
  createDefaultState,
  fromOctal,
  toOctal,
  toSymbolic,
  type ChmodState,
  type ClassId,
  type PermId,
  type SpecialId,
} from './lib/chmod'

type OutputId = 'octal' | 'symbolic' | 'command'

const ChmodCalc: React.FC = () => {
  const { t } = useTranslation('toolChmodCalc')

  const [state, setState] = useState<ChmodState>(() => createDefaultState())
  const [octalInput, setOctalInput] = useState<string>(() => toOctal(createDefaultState()))
  const [octalError, setOctalError] = useState(false)
  const [filename, setFilename] = useState('filename')
  const [copied, setCopied] = useState<OutputId | null>(null)

  const octal = useMemo(() => toOctal(state), [state])
  const symbolic = useMemo(() => toSymbolic(state), [state])
  const command = useMemo(
    () => `chmod ${octal} ${filename.trim() || 'filename'}`,
    [octal, filename],
  )

  // 矩阵/特殊位变化时，同步状态并刷新八进制输入框
  const applyState = useCallback((next: ChmodState) => {
    setState(next)
    setOctalInput(toOctal(next))
    setOctalError(false)
  }, [])

  const togglePerm = useCallback(
    (cls: ClassId, perm: PermId) => {
      applyState({
        ...state,
        [cls]: { ...state[cls], [perm]: !state[cls][perm] },
      })
    },
    [applyState, state],
  )

  const toggleSpecial = useCallback(
    (bit: SpecialId) => {
      applyState({ ...state, [bit]: !state[bit] })
    },
    [applyState, state],
  )

  // 反向联动：输入八进制 → 勾选矩阵
  const onOctalChange = useCallback((raw: string) => {
    setOctalInput(raw)
    if (raw.trim() === '') {
      setOctalError(true)
      return
    }
    const parsed = fromOctal(raw)
    if (parsed) {
      setState(parsed)
      setOctalError(false)
    } else {
      setOctalError(true)
    }
  }, [])

  const onCopy = useCallback(async (id: OutputId, value: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(id)
      window.setTimeout(() => setCopied((c) => (c === id ? null : c)), 1200)
    } catch {
      /* ignore */
    }
  }, [])

  const outputs: { id: OutputId; label: string; value: string }[] = [
    { id: 'octal', label: t('output.octal'), value: octal },
    { id: 'symbolic', label: t('output.symbolic'), value: symbolic },
    { id: 'command', label: t('output.command'), value: command },
  ]

  return (
    <div className="relative min-h-[60vh]">
      <ParticlesBackground preset="minimal" className="absolute inset-0" />
      <div className="relative z-10 space-y-6">
        <PageHero title={t('title')} description={t('description')} />

        <NoticeCard
          tone="info"
          title={t('notice.title')}
          description={t('notice.body')}
          icon={FileLock2}
        />

        {/* 权限矩阵 */}
        <Card>
          <h2 className="mb-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
            {t('matrix.heading')}
          </h2>
          <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">{t('matrix.hint')}</p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px] border-collapse text-sm">
              <thead>
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400" />
                  {PERM_IDS.map((perm) => (
                    <th
                      key={perm}
                      className="px-3 py-2 text-center font-medium text-gray-700 dark:text-gray-200"
                    >
                      {t(`matrix.perm.${perm}`)}
                      <span className="ml-1 font-mono text-xs text-indigo-500 dark:text-indigo-400">
                        ({PERM_VALUE[perm]})
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CLASS_IDS.map((cls) => (
                  <tr
                    key={cls}
                    className="border-t border-gray-100 dark:border-gray-700/60"
                  >
                    <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-gray-200">
                      {t(`matrix.class.${cls}`)}
                    </th>
                    {PERM_IDS.map((perm) => {
                      const checked = state[cls][perm]
                      return (
                        <td key={perm} className="px-3 py-2 text-center">
                          <label className="inline-flex cursor-pointer items-center justify-center">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => togglePerm(cls, perm)}
                              aria-label={`${t(`matrix.class.${cls}`)} ${t(`matrix.perm.${perm}`)}`}
                              className="h-5 w-5 cursor-pointer rounded border-gray-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700"
                            />
                          </label>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* 特殊权限位 */}
        <Card>
          <h2 className="mb-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
            {t('special.heading')}
          </h2>
          <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">{t('special.hint')}</p>
          <div className="grid gap-2 sm:grid-cols-3">
            {SPECIAL_IDS.map((bit) => {
              const checked = state[bit]
              return (
                <label
                  key={bit}
                  className={cn(
                    'flex cursor-pointer flex-col gap-1 rounded-md border px-3 py-2 transition',
                    checked
                      ? 'border-indigo-300 bg-indigo-50 dark:border-indigo-700 dark:bg-indigo-900/20'
                      : 'border-gray-200 hover:border-indigo-300 dark:border-gray-700 dark:hover:border-indigo-700',
                  )}
                >
                  <span className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleSpecial(bit)}
                      className="h-4 w-4 cursor-pointer rounded border-gray-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700"
                    />
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
                      {t(`special.${bit}.label`)}
                    </span>
                  </span>
                  <span className="pl-6 text-[11px] leading-snug text-gray-500 dark:text-gray-400">
                    {t(`special.${bit}.desc`)}
                  </span>
                </label>
              )
            })}
          </div>
        </Card>

        {/* 反向输入 */}
        <Card>
          <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
            {t('input.heading')}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-200">
                {t('input.label')}
              </label>
              <Input
                value={octalInput}
                onChange={(e) => onOctalChange(e.target.value)}
                placeholder={t('input.placeholder')}
                error={octalError}
                inputMode="numeric"
                maxLength={4}
                spellCheck={false}
                className="!font-mono"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-200">
                {t('input.filenameLabel')}
              </label>
              <Input
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                placeholder={t('input.filenamePlaceholder')}
                spellCheck={false}
                className="!font-mono"
              />
            </div>
          </div>
          {octalError && (
            <div className="mt-3">
              <NoticeCard tone="warning" title={t('input.error')} />
            </div>
          )}
        </Card>

        {/* 输出结果 */}
        <Card>
          <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
            {t('output.heading')}
          </h2>
          <div className="space-y-2">
            {outputs.map(({ id, label, value }) => (
              <button
                key={id}
                type="button"
                onClick={() => void onCopy(id, value)}
                title={copied === id ? t('output.copied') : t('output.copy')}
                className="group flex w-full items-center gap-3 rounded-md border border-gray-200 px-3 py-2.5 text-left transition hover:border-indigo-300 dark:border-gray-700 dark:hover:border-indigo-700"
              >
                <span className="w-24 shrink-0 text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  {label}
                </span>
                <code className="flex-1 truncate font-mono text-sm text-gray-800 dark:text-gray-100">
                  {value}
                </code>
                <span className="shrink-0 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200">
                  {copied === id ? (
                    <Check className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </span>
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

export default ChmodCalc
