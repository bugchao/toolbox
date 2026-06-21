import React, { useRef, useState } from 'react'
import { Button, Card, NoticeCard, PageHero, ParticlesBackground, TextArea } from '@toolbox/ui-kit'
import { useTranslation } from 'react-i18next'
import { ArrowLeftRight, Check, ClipboardCopy, Eraser, FileCog } from 'lucide-react'
import { jsonToMap, mapToJson, parseEnv, toEnv } from './lib/convert'

const SAMPLE_ENV = `# app config
export APP_NAME="My App"
PORT=8080
DEBUG=false
DATABASE_URL=postgres://localhost/mydb # local
GREETING="Hello\\nWorld"`

type Direction = 'auto' | 'env-to-json' | 'json-to-env'

const EnvJson: React.FC = () => {
  const { t } = useTranslation('toolEnvJson')
  const [envText, setEnvText] = useState(SAMPLE_ENV)
  const [jsonText, setJsonText] = useState('')
  const [direction, setDirection] = useState<Direction>('auto')
  const [exportPrefix, setExportPrefix] = useState(false)
  const [envError, setEnvError] = useState<string | null>(null)
  const [jsonError, setJsonError] = useState<string | null>(null)
  const [copied, setCopied] = useState<'env' | 'json' | null>(null)
  const skipEnv = useRef(false)
  const skipJson = useRef(false)
  const lastEdited = useRef<'env' | 'json'>('env')

  const syncFromEnv = (text: string, exp = exportPrefix) => {
    const r = parseEnv(text)
    if (r.ok) {
      skipJson.current = true
      setJsonText(mapToJson(r.map))
      setEnvError(null)
      void exp
    } else {
      setEnvError(t(`error.${r.message}`, { defaultValue: r.message }))
    }
  }

  const syncFromJson = (text: string, exp = exportPrefix) => {
    const r = jsonToMap(text)
    if (r.ok) {
      skipEnv.current = true
      setEnvText(toEnv(r.map, { exportPrefix: exp }))
      setJsonError(null)
    } else {
      setJsonError(t(`error.${r.message}`, { defaultValue: r.message }))
    }
  }

  React.useEffect(() => {
    syncFromEnv(SAMPLE_ENV)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onEnvChange = (v: string) => {
    lastEdited.current = 'env'
    setEnvText(v)
    if (skipEnv.current) { skipEnv.current = false; return }
    if (direction !== 'json-to-env') syncFromEnv(v)
  }
  const onJsonChange = (v: string) => {
    lastEdited.current = 'json'
    setJsonText(v)
    if (skipJson.current) { skipJson.current = false; return }
    if (direction !== 'env-to-json') syncFromJson(v)
  }

  const onExportToggle = (next: boolean) => {
    setExportPrefix(next)
    // 重新从 JSON 生成 env，应用新前缀
    if (jsonText.trim()) syncFromJson(jsonText, next)
  }

  const onCopy = async (side: 'env' | 'json', text: string) => {
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      setCopied(side)
      window.setTimeout(() => setCopied((c) => (c === side ? null : c)), 1200)
    } catch { /* ignore */ }
  }

  const onClear = () => {
    skipEnv.current = true
    skipJson.current = true
    setEnvText(''); setJsonText(''); setEnvError(null); setJsonError(null)
  }

  return (
    <div className="relative min-h-[60vh]">
      <ParticlesBackground preset="minimal" className="absolute inset-0" />
      <div className="relative z-10 space-y-6">
        <PageHero title={t('title')} description={t('description')} />

        <NoticeCard tone="info" title={t('notice.title')} description={t('notice.body')} icon={FileCog} />

        <Card>
          <div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
            <label className="inline-flex items-center gap-1.5">
              <span className="text-gray-500 dark:text-gray-400">{t('options.direction')}</span>
              <select
                value={direction}
                onChange={(e) => setDirection(e.target.value as Direction)}
                className="rounded border border-gray-300 bg-white px-2 py-1 text-xs dark:border-gray-700 dark:bg-gray-900"
              >
                <option value="auto">{t('options.directionAuto')}</option>
                <option value="env-to-json">.env → JSON</option>
                <option value="json-to-env">JSON → .env</option>
              </select>
            </label>
            <label className="inline-flex items-center gap-1.5">
              <input type="checkbox" checked={exportPrefix} onChange={(e) => onExportToggle(e.target.checked)} />
              <span className="text-gray-600 dark:text-gray-300">{t('options.exportPrefix')}</span>
            </label>
            <span className="flex-1" />
            <Button type="button" variant="ghost" onClick={onClear}>
              <span className="inline-flex items-center gap-1.5">
                <Eraser className="h-3.5 w-3.5" />
                {t('options.clear')}
              </span>
            </Button>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="flex flex-col">
              <div className="mb-1 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>.env · {envText.length}</span>
                <button
                  type="button"
                  onClick={() => onCopy('env', envText)}
                  disabled={!envText}
                  className="inline-flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-30"
                >
                  {copied === 'env' ? <Check className="h-3 w-3" /> : <ClipboardCopy className="h-3 w-3" />}
                  {copied === 'env' ? t('copy.copied') : t('copy.copy')}
                </button>
              </div>
              <TextArea
                value={envText}
                onChange={(e) => onEnvChange(e.target.value)}
                rows={14}
                placeholder={t('placeholder.env')}
                spellCheck={false}
                className="!font-mono !text-xs"
              />
              {envError && (
                <div className="mt-1 rounded-md border border-rose-300 bg-rose-50 px-2 py-1 text-xs text-rose-700 dark:border-rose-700 dark:bg-rose-900/30 dark:text-rose-200">
                  {envError}
                </div>
              )}
            </div>

            <div className="flex flex-col">
              <div className="mb-1 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>JSON · {jsonText.length}</span>
                <button
                  type="button"
                  onClick={() => onCopy('json', jsonText)}
                  disabled={!jsonText}
                  className="inline-flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-30"
                >
                  {copied === 'json' ? <Check className="h-3 w-3" /> : <ClipboardCopy className="h-3 w-3" />}
                  {copied === 'json' ? t('copy.copied') : t('copy.copy')}
                </button>
              </div>
              <TextArea
                value={jsonText}
                onChange={(e) => onJsonChange(e.target.value)}
                rows={14}
                placeholder={t('placeholder.json')}
                spellCheck={false}
                className="!font-mono !text-xs"
              />
              {jsonError && (
                <div className="mt-1 rounded-md border border-rose-300 bg-rose-50 px-2 py-1 text-xs text-rose-700 dark:border-rose-700 dark:bg-rose-900/30 dark:text-rose-200">
                  {jsonError}
                </div>
              )}
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
            <ArrowLeftRight className="h-3 w-3" />
            <span>{t('hint.flat')}</span>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default EnvJson
