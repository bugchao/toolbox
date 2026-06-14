import React, { useMemo, useState } from 'react'
import { Button, Card, Input, NoticeCard, PageHero, ParticlesBackground, TextArea } from '@toolbox/ui-kit'
import { useTranslation } from 'react-i18next'
import { Check, ClipboardCopy, Workflow } from 'lucide-react'
import { parsePattern } from './lib/parse'
import { toIr } from './lib/ir'
import { renderSvg } from './lib/render'
import { runMatches, type MatchSpan } from './lib/match'

const SAMPLES: { id: string; label: string; pattern: string; flags: string }[] = [
  { id: 'email', label: 'Email', pattern: '[\\w.+-]+@[\\w-]+(?:\\.[\\w-]+)+', flags: 'gi' },
  { id: 'url', label: 'URL', pattern: 'https?://[\\w.-]+(?:/[\\w./?&=-]*)?', flags: 'gi' },
  { id: 'date', label: 'ISO date', pattern: '\\d{4}-\\d{2}-\\d{2}', flags: 'g' },
  { id: 'phone', label: 'CN phone', pattern: '1[3-9]\\d{9}', flags: 'g' },
  { id: 'hex', label: 'Hex color', pattern: '#(?:[0-9a-f]{3}){1,2}\\b', flags: 'gi' },
  { id: 'ipv4', label: 'IPv4', pattern: '\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b', flags: 'g' },
]

const RegexRailroad: React.FC = () => {
  const { t } = useTranslation('toolRegexRailroad')
  const [pattern, setPattern] = useState(SAMPLES[0].pattern)
  const [flags, setFlags] = useState(SAMPLES[0].flags)
  const [input, setInput] = useState('contact me at alice@example.com or bob@dev.io')
  const [copied, setCopied] = useState(false)

  const parsed = useMemo(() => parsePattern(pattern, flags), [pattern, flags])
  const svg = useMemo(() => {
    if (!parsed.ok) return ''
    try {
      return renderSvg(toIr(parsed.ast))
    } catch (e) {
      return `<text fill="red">${(e as Error).message}</text>`
    }
  }, [parsed])
  const matchResult = useMemo(() => runMatches(pattern, flags, input), [pattern, flags, input])

  const toggleFlag = (f: string) =>
    setFlags((cur) => (cur.includes(f) ? cur.replace(f, '') : cur + f))

  const onCopySvg = async () => {
    if (!svg) return
    try {
      await navigator.clipboard.writeText(svg)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1200)
    } catch { /* ignore */ }
  }

  const onSample = (s: typeof SAMPLES[0]) => {
    setPattern(s.pattern); setFlags(s.flags)
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
          icon={Workflow}
        />

        <Card>
          <div className="grid gap-3 md:grid-cols-[1fr_auto]">
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-200">
                {t('input.pattern')}
              </span>
              <Input
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                placeholder="e.g. \d{2,4}-\d{2}-\d{2}"
                spellCheck={false}
                autoComplete="off"
                className="!font-mono"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-200">
                {t('input.flags')}
              </span>
              <div className="flex flex-wrap gap-1">
                {['g', 'i', 'm', 's', 'u', 'y'].map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => toggleFlag(f)}
                    className={[
                      'rounded border px-2 py-1 text-xs font-mono transition',
                      flags.includes(f)
                        ? 'border-indigo-500 bg-indigo-500 text-white'
                        : 'border-gray-300 text-gray-600 hover:border-gray-400 dark:border-gray-700 dark:text-gray-300',
                    ].join(' ')}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </label>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-gray-500 dark:text-gray-400">{t('input.samples')}:</span>
            {SAMPLES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => onSample(s)}
                className="rounded-full border border-gray-300 px-2.5 py-0.5 text-gray-700 transition hover:border-gray-400 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                {s.label}
              </button>
            ))}
          </div>

          {!parsed.ok && (
            <div className="mt-3 rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:border-rose-700 dark:bg-rose-900/30 dark:text-rose-200">
              {parsed.message}
            </div>
          )}
        </Card>

        <Card>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t('railroad.heading')}
            </h2>
            <Button type="button" variant="ghost" onClick={onCopySvg} disabled={!svg}>
              <span className="inline-flex items-center gap-1.5">
                {copied ? <Check className="h-4 w-4" /> : <ClipboardCopy className="h-4 w-4" />}
                {copied ? t('railroad.copied') : t('railroad.copySvg')}
              </span>
            </Button>
          </div>
          {svg ? (
            <div
              className="overflow-x-auto rounded border border-gray-200 dark:border-gray-700"
              dangerouslySetInnerHTML={{ __html: svg }}
            />
          ) : (
            <div className="rounded border border-dashed border-gray-300 p-8 text-center text-sm text-gray-400 dark:border-gray-700">
              {t('railroad.empty')}
            </div>
          )}
        </Card>

        <Card>
          <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
            {t('matcher.heading')}
          </h2>
          <TextArea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={6}
            placeholder={t('matcher.placeholder')}
            spellCheck={false}
          />
          <div className="mt-3">
            {matchResult.ok ? (
              <>
                <p className="mb-2 text-xs text-gray-600 dark:text-gray-300">
                  {t('matcher.count', { n: matchResult.matches.length })}
                </p>
                <HighlightedText input={input} matches={matchResult.matches} />
                {matchResult.matches.length > 0 && (
                  <table className="mt-3 w-full text-xs">
                    <thead className="text-gray-500 dark:text-gray-400">
                      <tr>
                        <th className="text-left">#</th>
                        <th className="text-left">{t('matcher.span')}</th>
                        <th className="text-left">{t('matcher.full')}</th>
                        <th className="text-left">{t('matcher.groups')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {matchResult.matches.slice(0, 100).map((m, i) => (
                        <tr key={i} className="border-t border-gray-100 dark:border-gray-800">
                          <td className="py-1 pr-2">{i + 1}</td>
                          <td className="py-1 pr-2 tabular-nums">{m.index}–{m.index + m.length}</td>
                          <td className="py-1 pr-2 font-mono break-all">{m.full || '∅'}</td>
                          <td className="py-1 pr-2 font-mono break-all text-gray-500">
                            {m.groups.length > 0 ? m.groups.map((g) => g ?? '·').join(' / ') : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </>
            ) : (
              <div className="rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:border-rose-700 dark:bg-rose-900/30 dark:text-rose-200">
                {matchResult.message}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}

const HighlightedText: React.FC<{ input: string; matches: MatchSpan[] }> = ({ input, matches }) => {
  const parts: React.ReactNode[] = []
  let cursor = 0
  for (let i = 0; i < matches.length; i++) {
    const m = matches[i]
    if (m.index > cursor) parts.push(input.slice(cursor, m.index))
    parts.push(
      <mark key={i} className="rounded bg-yellow-200 px-0.5 text-yellow-900 dark:bg-yellow-700/40 dark:text-yellow-200">
        {input.slice(m.index, m.index + m.length) || '∅'}
      </mark>,
    )
    cursor = m.index + m.length
    // 零宽时强制前进 1 字符的视觉
    if (m.length === 0) cursor = m.index + 1
  }
  if (cursor < input.length) parts.push(input.slice(cursor))
  return (
    <pre className="whitespace-pre-wrap break-words rounded-md border border-gray-200 bg-gray-50 p-3 font-mono text-xs text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100">
      {parts}
    </pre>
  )
}

export default RegexRailroad
