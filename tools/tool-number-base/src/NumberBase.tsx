import React, { useMemo, useState } from 'react'
import { Card, Input, NoticeCard, PageHero, ParticlesBackground } from '@toolbox/ui-kit'
import { useTranslation } from 'react-i18next'
import { Binary } from 'lucide-react'
import {
  bitwise,
  bitwiseNot,
  groupBits,
  parseInBase,
  toBase,
  twosComplement,
  type BitOp,
  type BitWidth,
} from './lib/base'

const COMMON = [
  { base: 2, key: 'bin' },
  { base: 8, key: 'oct' },
  { base: 10, key: 'dec' },
  { base: 16, key: 'hex' },
]
const WIDTHS: BitWidth[] = [8, 16, 32, 64]
const OPS: { op: BitOp | 'not'; label: string }[] = [
  { op: 'and', label: 'AND' },
  { op: 'or', label: 'OR' },
  { op: 'xor', label: 'XOR' },
  { op: 'shl', label: '<<' },
  { op: 'shr', label: '>>' },
  { op: 'not', label: 'NOT' },
]

const NumberBase: React.FC = () => {
  const { t } = useTranslation('toolNumberBase')
  const [input, setInput] = useState('255')
  const [inputBase, setInputBase] = useState(10)
  const [width, setWidth] = useState<BitWidth>(8)

  // 位运算
  const [opA, setOpA] = useState('12')
  const [opB, setOpB] = useState('10')
  const [op, setOp] = useState<BitOp | 'not'>('and')

  const parsed = useMemo(() => parseInBase(input, inputBase), [input, inputBase])
  const value = parsed.ok ? (parsed.negative ? -parsed.value : parsed.value) : null

  const tc = useMemo(() => (value != null ? twosComplement(value, width) : null), [value, width])

  const opResult = useMemo(() => {
    const a = parseInBase(opA, 10)
    const b = parseInBase(opB, 10)
    if (!a.ok) return null
    const av = a.negative ? -a.value : a.value
    if (op === 'not') return bitwiseNot(av, width)
    if (!b.ok) return null
    const bv = b.negative ? -b.value : b.value
    return bitwise(av, bv, op)
  }, [opA, opB, op, width])

  const copy = (s: string) => { void navigator.clipboard?.writeText(s).catch(() => undefined) }

  return (
    <div className="relative min-h-[60vh]">
      <ParticlesBackground preset="minimal" className="absolute inset-0" />
      <div className="relative z-10 space-y-6">
        <PageHero title={t('title')} description={t('description')} />

        <NoticeCard tone="info" title={t('notice.title')} description={t('notice.body')} icon={Binary} />

        <Card>
          <div className="mb-3 flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[200px]">
              <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-200">{t('convert.input')}</label>
              <Input value={input} onChange={(e) => setInput(e.target.value)} spellCheck={false} className="!font-mono" />
            </div>
            <label className="inline-flex items-center gap-1.5 text-xs">
              <span className="text-gray-500 dark:text-gray-400">{t('convert.inputBase')}</span>
              <input
                type="number" min={2} max={36} value={inputBase}
                onChange={(e) => setInputBase(Math.max(2, Math.min(36, Number(e.target.value) || 10)))}
                className="w-16 rounded border border-gray-300 bg-white px-2 py-1 dark:border-gray-700 dark:bg-gray-900"
              />
            </label>
          </div>

          {!parsed.ok && input.trim() && (
            <div className="rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:border-rose-700 dark:bg-rose-900/30 dark:text-rose-200">
              {t('error.parse')}
            </div>
          )}

          {value != null && (
            <div className="grid gap-2 sm:grid-cols-2">
              {COMMON.map(({ base, key }) => (
                <BaseRow key={key} label={t(`bases.${key}`)} value={toBase(value, base, true)} onCopy={copy} />
              ))}
            </div>
          )}
        </Card>

        {value != null && (
          <Card>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">{t('tc.heading')}</h2>
              <div className="inline-flex rounded-md border border-gray-200 p-0.5 dark:border-gray-700">
                {WIDTHS.map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setWidth(w)}
                    className={['rounded px-2.5 py-1 text-xs font-medium transition', width === w ? 'bg-indigo-500 text-white' : 'text-gray-600 dark:text-gray-300'].join(' ')}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>
            {tc && tc.ok ? (
              <div className="space-y-2 text-xs">
                <BaseRow label={t('tc.binary')} value={groupBits(tc.bits)} onCopy={copy} mono />
                <BaseRow label={t('tc.hex')} value={tc.hex} onCopy={copy} mono />
                <div className="flex gap-4 text-gray-600 dark:text-gray-300">
                  <span>{t('tc.unsigned')}: <b className="font-mono">{tc.unsigned.toString()}</b></span>
                  <span>{t('tc.signed')}: <b className="font-mono">{tc.signed.toString()}</b></span>
                </div>
              </div>
            ) : (
              <div className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                {t('tc.outOfRange', { width })}
              </div>
            )}
          </Card>
        )}

        <Card>
          <h2 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-200">{t('bitwise.heading')}</h2>
          <div className="flex flex-wrap items-end gap-2">
            <div className="w-28">
              <label className="mb-1 block text-[11px] text-gray-500 dark:text-gray-400">A (dec)</label>
              <Input value={opA} onChange={(e) => setOpA(e.target.value)} spellCheck={false} className="!font-mono" />
            </div>
            <div className="inline-flex flex-wrap gap-1">
              {OPS.map(({ op: o, label }) => (
                <button
                  key={o}
                  type="button"
                  onClick={() => setOp(o)}
                  className={['rounded border px-2 py-1 text-xs font-mono transition', op === o ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-gray-300 text-gray-600 dark:border-gray-700 dark:text-gray-300'].join(' ')}
                >
                  {label}
                </button>
              ))}
            </div>
            {op !== 'not' && (
              <div className="w-28">
                <label className="mb-1 block text-[11px] text-gray-500 dark:text-gray-400">B (dec)</label>
                <Input value={opB} onChange={(e) => setOpB(e.target.value)} spellCheck={false} className="!font-mono" />
              </div>
            )}
          </div>
          {opResult != null && (
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <BaseRow label="DEC" value={opResult.toString()} onCopy={copy} mono />
              <BaseRow label="HEX" value={toBase(opResult, 16, true)} onCopy={copy} mono />
              <BaseRow label="BIN" value={groupBits(toBase(opResult < 0n ? bitwiseNot(-opResult - 1n, width) : opResult, 2))} onCopy={copy} mono />
            </div>
          )}
          <p className="mt-2 text-[11px] text-gray-500 dark:text-gray-400">{t('bitwise.hint', { width })}</p>
        </Card>
      </div>
    </div>
  )
}

const BaseRow: React.FC<{ label: string; value: string; onCopy: (s: string) => void; mono?: boolean }> = ({ label, value, onCopy, mono }) => (
  <button
    type="button"
    onClick={() => onCopy(value)}
    className="group flex items-center gap-3 rounded-md border border-gray-200 px-3 py-2 text-left transition hover:border-indigo-300 dark:border-gray-700 dark:hover:border-indigo-700"
  >
    <span className="w-16 shrink-0 text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">{label}</span>
    <code className={['flex-1 truncate text-sm text-gray-800 dark:text-gray-100', mono ? 'font-mono' : ''].join(' ')}>{value}</code>
  </button>
)

export default NumberBase
