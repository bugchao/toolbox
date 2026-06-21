import React, { useState } from 'react'
import { Button, Card, Input, NoticeCard, PageHero, ParticlesBackground, TextArea } from '@toolbox/ui-kit'
import { useTranslation } from 'react-i18next'
import { Check, ClipboardCopy, Fingerprint, RefreshCw } from 'lucide-react'
import { generateMany, type IdKind } from './lib/ids'

const KINDS: { id: IdKind; len: string }[] = [
  { id: 'uuidv4', len: '36' },
  { id: 'uuidv7', len: '36' },
  { id: 'ulid', len: '26' },
  { id: 'nanoid', len: '21' },
]

const IdGenerator: React.FC = () => {
  const { t } = useTranslation('toolIdGenerator')
  const [kind, setKind] = useState<IdKind>('uuidv4')
  const [count, setCount] = useState(5)
  const [nanoSize, setNanoSize] = useState(21)
  const [ids, setIds] = useState<string[]>(() => generateMany('uuidv4', 5))
  const [copied, setCopied] = useState(false)

  const regen = (k: IdKind = kind, c: number = count, n: number = nanoSize) => {
    setIds(generateMany(k, c, n))
  }

  const onKind = (k: IdKind) => { setKind(k); regen(k) }

  const copyAll = async () => {
    if (ids.length === 0) return
    try {
      await navigator.clipboard.writeText(ids.join('\n'))
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1200)
    } catch { /* ignore */ }
  }

  const copyOne = (s: string) => { void navigator.clipboard?.writeText(s).catch(() => undefined) }

  return (
    <div className="relative min-h-[60vh]">
      <ParticlesBackground preset="minimal" className="absolute inset-0" />
      <div className="relative z-10 space-y-6">
        <PageHero title={t('title')} description={t('description')} />

        <NoticeCard tone="info" title={t('notice.title')} description={t('notice.body')} icon={Fingerprint} />

        <Card>
          <div className="mb-4 flex flex-wrap items-end gap-3">
            <div>
              <span className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-200">{t('opts.kind')}</span>
              <div className="inline-flex rounded-md border border-gray-200 p-0.5 dark:border-gray-700">
                {KINDS.map(({ id }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => onKind(id)}
                    className={['rounded px-3 py-1 text-xs font-medium transition', kind === id ? 'bg-indigo-500 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'].join(' ')}
                  >
                    {t(`kind.${id}`)}
                  </button>
                ))}
              </div>
            </div>

            <label className="inline-flex items-center gap-1.5 text-xs">
              <span className="text-gray-500 dark:text-gray-400">{t('opts.count')}</span>
              <input
                type="number" min={1} max={1000} value={count}
                onChange={(e) => { const c = Math.max(1, Math.min(1000, Number(e.target.value) || 1)); setCount(c); regen(kind, c) }}
                className="w-20 rounded border border-gray-300 bg-white px-2 py-1 dark:border-gray-700 dark:bg-gray-900"
              />
            </label>

            {kind === 'nanoid' && (
              <label className="inline-flex items-center gap-1.5 text-xs">
                <span className="text-gray-500 dark:text-gray-400">{t('opts.nanoSize')}</span>
                <input
                  type="number" min={2} max={64} value={nanoSize}
                  onChange={(e) => { const n = Math.max(2, Math.min(64, Number(e.target.value) || 21)); setNanoSize(n); regen(kind, count, n) }}
                  className="w-16 rounded border border-gray-300 bg-white px-2 py-1 dark:border-gray-700 dark:bg-gray-900"
                />
              </label>
            )}

            <span className="flex-1" />
            <Button onClick={() => regen()}>
              <span className="inline-flex items-center gap-1.5"><RefreshCw className="h-4 w-4" />{t('opts.regenerate')}</span>
            </Button>
            <Button variant="ghost" onClick={() => void copyAll()}>
              <span className="inline-flex items-center gap-1.5">
                {copied ? <Check className="h-4 w-4" /> : <ClipboardCopy className="h-4 w-4" />}
                {copied ? t('opts.copied') : t('opts.copyAll')}
              </span>
            </Button>
          </div>

          <ul className="divide-y divide-gray-100 rounded-md border border-gray-200 dark:divide-gray-800 dark:border-gray-700">
            {ids.map((id, i) => (
              <li key={i} className="group flex items-center gap-3 px-3 py-1.5">
                <span className="w-8 shrink-0 text-right text-[10px] text-gray-400">{i + 1}</span>
                <code className="flex-1 truncate font-mono text-sm text-gray-800 dark:text-gray-100">{id}</code>
                <button
                  type="button"
                  onClick={() => copyOne(id)}
                  className="shrink-0 text-gray-400 opacity-0 transition group-hover:opacity-100 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <ClipboardCopy className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>

          <details className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            <summary className="cursor-pointer">{t('plain.summary')}</summary>
            <TextArea value={ids.join('\n')} readOnly rows={Math.min(10, ids.length)} className="mt-2 !font-mono !text-xs" />
          </details>
        </Card>
      </div>
    </div>
  )
}

export default IdGenerator
