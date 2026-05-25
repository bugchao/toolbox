import React, { useMemo, useState } from 'react'
import { Button, Card, Input, PageHero, ParticlesBackground, TextArea } from '@toolbox/ui-kit'
import { useTranslation } from 'react-i18next'
import { Copy, Trash2, Wand2 } from 'lucide-react'
import { jsonToTs } from './lib/jsonToTs'

const SAMPLE = `{
  "id": 1,
  "name": "Ada",
  "active": true,
  "address": {
    "city": "Paris",
    "zip": null
  },
  "tags": ["alpha", "beta"],
  "history": [
    { "ts": 1700000000, "ok": true },
    { "ts": 1700000100, "ok": false, "reason": "timeout" }
  ]
}
`

const JsonToTs: React.FC = () => {
  const { t } = useTranslation('toolJsonToTs')
  const [input, setInput] = useState(SAMPLE)
  const [rootName, setRootName] = useState('Root')
  const [style, setStyle] = useState<'interface' | 'type'>('interface')

  const result = useMemo(() => {
    if (!input.trim()) return { output: '', error: null as string | null }
    try {
      return { output: jsonToTs(input, { rootName, style }), error: null }
    } catch (e) {
      return { output: '', error: (e as Error).message }
    }
  }, [input, rootName, style])

  const formatInput = () => {
    try {
      setInput(JSON.stringify(JSON.parse(input), null, 2) + '\n')
    } catch {
      // 解析失败时不改动
    }
  }

  const copy = async (value: string) => {
    if (!value) return
    try {
      await navigator.clipboard.writeText(value)
    } catch {
      // ignore
    }
  }

  return (
    <div className="relative min-h-[60vh]">
      <ParticlesBackground preset="minimal" className="absolute inset-0" />
      <div className="relative z-10 space-y-6">
        <PageHero title={t('title')} description={t('description')} />

        <Card>
          <div className="flex flex-wrap items-end gap-4">
            <div className="min-w-[180px] flex-1">
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('options.rootName')}
              </label>
              <Input
                value={rootName}
                onChange={(e) => setRootName(e.target.value)}
                spellCheck={false}
                className="font-mono"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('options.style')}
              </label>
              <div className="inline-flex overflow-hidden rounded-lg border border-gray-300 dark:border-gray-600">
                <StyleToggle
                  active={style === 'interface'}
                  onClick={() => setStyle('interface')}
                >
                  interface
                </StyleToggle>
                <StyleToggle active={style === 'type'} onClick={() => setStyle('type')}>
                  type
                </StyleToggle>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {t('input.heading')}
              </h2>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={formatInput}>
                  <span className="inline-flex items-center gap-1.5">
                    <Wand2 className="h-4 w-4" />
                    {t('input.format')}
                  </span>
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setInput('')}>
                  <span className="inline-flex items-center gap-1.5">
                    <Trash2 className="h-4 w-4" />
                    {t('input.clear')}
                  </span>
                </Button>
              </div>
            </div>
            <TextArea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              spellCheck={false}
              className="min-h-[360px] font-mono text-sm"
              placeholder={t('input.placeholder')}
            />
            {result.error && (
              <div className="mt-2 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-700 dark:bg-red-900/30 dark:text-red-300">
                {t('input.error')}: {result.error}
              </div>
            )}
          </Card>

          <Card>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {t('output.heading')}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copy(result.output)}
                disabled={!result.output}
              >
                <span className="inline-flex items-center gap-1.5">
                  <Copy className="h-4 w-4" />
                  {t('output.copy')}
                </span>
              </Button>
            </div>
            <pre className="min-h-[360px] overflow-auto rounded-lg border border-gray-200 bg-gray-50 p-4 font-mono text-sm leading-relaxed text-gray-800 dark:border-gray-700 dark:bg-gray-900/40 dark:text-gray-100">
              <code>{result.output || t('output.empty')}</code>
            </pre>
          </Card>
        </div>
      </div>
    </div>
  )
}

const StyleToggle: React.FC<{
  active: boolean
  onClick: () => void
  children: React.ReactNode
}> = ({ active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={[
      'px-3 py-2 text-sm font-mono transition-colors',
      active
        ? 'bg-indigo-600 text-white'
        : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600',
    ].join(' ')}
  >
    {children}
  </button>
)

export default JsonToTs
