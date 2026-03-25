import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Copy, Check, ArrowLeftRight } from 'lucide-react'
import { PageHero } from '@toolbox/ui-kit'

type Base = 2 | 8 | 10 | 16

interface Field { base: Base; label: string; prefix: string; placeholder: string }

const FIELDS: Field[] = [
  { base: 10, label: '十进制', prefix: '', placeholder: '255' },
  { base: 2, label: '二进制', prefix: '0b', placeholder: '11111111' },
  { base: 8, label: '八进制', prefix: '0o', placeholder: '377' },
  { base: 16, label: '十六进制', prefix: '0x', placeholder: 'FF' },
]

function isValid(val: string, base: Base): boolean {
  if (!val) return true
  const patterns: Record<Base, RegExp> = {
    2: /^[01]+$/,
    8: /^[0-7]+$/,
    10: /^[0-9]+$/,
    16: /^[0-9a-fA-F]+$/,
  }
  return patterns[base].test(val)
}

export default function BaseConverter() {
  const { t } = useTranslation('toolBaseConverter')
  const [source, setSource] = useState<{ base: Base; value: string }>({ base: 10, value: '' })
  const [copied, setCopied] = useState<Base | null>(null)

  const decimal = source.value && isValid(source.value, source.base)
    ? parseInt(source.value, source.base)
    : null

  const convert = (base: Base): string => {
    if (decimal === null || isNaN(decimal)) return ''
    switch (base) {
      case 2: return decimal.toString(2)
      case 8: return decimal.toString(8)
      case 10: return decimal.toString(10)
      case 16: return decimal.toString(16).toUpperCase()
    }
  }

  const copy = (base: Base) => {
    navigator.clipboard.writeText(convert(base))
    setCopied(base)
    setTimeout(() => setCopied(null), 1500)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHero title={t('title')} description={t('description')} icon={ArrowLeftRight} />
      <div className="max-w-md mx-auto px-4 py-6 space-y-3">
        {FIELDS.map(f => {
          const isActive = source.base === f.base
          const val = isActive ? source.value : convert(f.base)
          const invalid = isActive && source.value && !isValid(source.value, f.base)
          return (
            <div key={f.base}
              className={`bg-white dark:bg-gray-800 rounded-xl border-2 p-4 transition-colors ${
                isActive ? 'border-indigo-500' : invalid ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'
              }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-500">
                  {t(`${f.base === 2 ? 'binary' : f.base === 8 ? 'octal' : f.base === 10 ? 'decimal' : 'hex'}`)}
                  <span className="ml-1 text-gray-300">({f.prefix || '无前缀'})</span>
                </span>
                <button onClick={() => copy(f.base)} className="text-gray-300 hover:text-indigo-500 transition-colors">
                  {copied === f.base ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <input
                value={val}
                onChange={e => setSource({ base: f.base, value: e.target.value })}
                onFocus={() => setSource({ base: f.base, value: convert(f.base) })}
                placeholder={f.placeholder}
                className={`w-full text-lg font-mono bg-transparent focus:outline-none ${
                  invalid ? 'text-red-500' : 'text-gray-900 dark:text-gray-100'
                }`}
              />
              {invalid && <p className="text-xs text-red-400 mt-1">{t('invalid')}</p>}
            </div>
          )
        })}
        {decimal !== null && !isNaN(decimal) && (
          <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800 p-3 text-center">
            <span className="text-xs text-indigo-400">十进制值 </span>
            <span className="text-lg font-bold text-indigo-600">{decimal}</span>
            {decimal <= 127 && decimal >= 32 && (
              <span className="ml-2 text-xs text-indigo-400">ASCII: <strong>{String.fromCharCode(decimal)}</strong></span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
