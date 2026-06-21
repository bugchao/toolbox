import React, { useMemo, useState } from 'react'
import { Card, NoticeCard, PageHero, ParticlesBackground, TextArea } from '@toolbox/ui-kit'
import { useTranslation } from 'react-i18next'
import { Binary } from 'lucide-react'
import { inspect, textStats } from './lib/inspect'

const MAX_CHARS = 2000

const UnicodeInspector: React.FC = () => {
  const { t } = useTranslation('toolUnicodeInspector')
  const [text, setText] = useState('Hi 中文 😀 café')

  const stats = useMemo(() => textStats(text), [text])
  const chars = useMemo(() => inspect(text).slice(0, MAX_CHARS), [text])
  const truncated = stats.codePoints > MAX_CHARS

  const escapesAll = useMemo(() => ({
    js: inspect(text).map((c) => c.jsEscape).join(''),
    html: inspect(text).map((c) => c.htmlEntity).join(''),
    css: inspect(text).map((c) => c.cssEscape + ' ').join('').trim(),
  }), [text])

  const copy = (s: string) => { void navigator.clipboard?.writeText(s).catch(() => undefined) }

  return (
    <div className="relative min-h-[60vh]">
      <ParticlesBackground preset="minimal" className="absolute inset-0" />
      <div className="relative z-10 space-y-6">
        <PageHero title={t('title')} description={t('description')} />

        <NoticeCard tone="info" title={t('notice.title')} description={t('notice.body')} icon={Binary} />

        <Card>
          <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-200">{t('input.label')}</label>
          <TextArea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            placeholder={t('input.placeholder')}
            spellCheck={false}
          />
          <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-600 dark:text-gray-300">
            <Stat label={t('stats.codePoints')} value={stats.codePoints} />
            <Stat label={t('stats.utf16')} value={stats.utf16Length} />
            <Stat label={t('stats.utf8')} value={stats.utf8Bytes} />
            {stats.hasAstral && (
              <span className="rounded bg-violet-100 px-1.5 py-0.5 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
                {t('stats.hasAstral')}
              </span>
            )}
          </div>
        </Card>

        {chars.length > 0 && (
          <Card>
            <h2 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-200">{t('table.heading')}</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="text-gray-500 dark:text-gray-400">
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="px-2 py-1 text-left">{t('table.char')}</th>
                    <th className="px-2 py-1 text-left">{t('table.code')}</th>
                    <th className="px-2 py-1 text-left">{t('table.block')}</th>
                    <th className="px-2 py-1 text-left">UTF-8</th>
                    <th className="px-2 py-1 text-left">UTF-16</th>
                    <th className="px-2 py-1 text-left">JS</th>
                    <th className="px-2 py-1 text-left">HTML</th>
                  </tr>
                </thead>
                <tbody className="font-mono">
                  {chars.map((c, i) => (
                    <tr key={i} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="px-2 py-1 text-base">{c.char === ' ' ? '␠' : c.char}</td>
                      <td className="px-2 py-1">
                        {c.hex}
                        {c.isAstral && <span className="ml-1 rounded bg-violet-100 px-1 text-[9px] text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">astral</span>}
                      </td>
                      <td className="px-2 py-1 font-sans text-gray-500 dark:text-gray-400">{c.block}</td>
                      <td className="px-2 py-1 text-gray-600 dark:text-gray-300">{c.utf8}</td>
                      <td className="px-2 py-1 text-gray-600 dark:text-gray-300">{c.utf16}</td>
                      <td className="px-2 py-1 text-sky-600 dark:text-sky-400">{c.jsEscape}</td>
                      <td className="px-2 py-1 text-emerald-600 dark:text-emerald-400">{c.htmlEntity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {truncated && (
              <p className="mt-2 text-[11px] text-amber-600 dark:text-amber-400">{t('table.truncated', { n: MAX_CHARS })}</p>
            )}
          </Card>
        )}

        {chars.length > 0 && (
          <Card>
            <h2 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-200">{t('escape.heading')}</h2>
            <div className="space-y-2">
              <EscapeRow label="JavaScript" value={escapesAll.js} onCopy={copy} />
              <EscapeRow label="HTML" value={escapesAll.html} onCopy={copy} />
              <EscapeRow label="CSS" value={escapesAll.css} onCopy={copy} />
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}

const Stat: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <span>
    <span className="text-gray-400">{label}: </span>
    <span className="font-mono font-semibold text-gray-800 dark:text-gray-100">{value}</span>
  </span>
)

const EscapeRow: React.FC<{ label: string; value: string; onCopy: (s: string) => void }> = ({ label, value, onCopy }) => (
  <div>
    <div className="mb-0.5 flex items-center justify-between">
      <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">{label}</span>
      <button
        type="button"
        onClick={() => onCopy(value)}
        disabled={!value}
        className="text-[11px] text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-30"
      >
        Copy
      </button>
    </div>
    <pre className="overflow-x-auto rounded-md border border-gray-200 bg-gray-50 p-2 font-mono text-[11px] text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">
      {value || '—'}
    </pre>
  </div>
)

export default UnicodeInspector
