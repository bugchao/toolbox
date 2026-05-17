import React, { Suspense, lazy, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  AlertCircle,
  Check,
  Code2,
  Copy,
  Download,
  Eraser,
  Minimize2,
  Network,
  RefreshCw,
} from 'lucide-react'
import { PageHero } from '@toolbox/ui-kit'
import type { LayoutDirection } from 'jsoncrack-react'

import JsonEditor from './JsonEditor'
import { I18N_NAMESPACE } from './namespace'

export { I18N_NAMESPACE }

const JsonGraphView = lazy(() => import('./JsonGraphView'))

const SAMPLE_JSON = `{
  "user": {
    "id": 1,
    "name": "Toolbox",
    "tags": ["dev", "ops"]
  },
  "active": true,
  "scores": [95, 88, 76]
}`

type ViewMode = 'text' | 'graph'

const tabBase =
  'inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md border transition-colors'
const tabActive = 'bg-indigo-600 text-white border-indigo-600'
const tabIdle = 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'

const JsonFormatter: React.FC = () => {
  const { t } = useTranslation(I18N_NAMESPACE)
  const [input, setInput] = useState<string>(SAMPLE_JSON)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [indentSize, setIndentSize] = useState(2)
  const [viewMode, setViewMode] = useState<ViewMode>('text')
  const [layoutDirection, setLayoutDirection] = useState<LayoutDirection>('RIGHT')

  const parsed = useMemo<{ ok: true; value: unknown } | { ok: false; message: string } | null>(() => {
    if (!input.trim()) return null
    try {
      return { ok: true, value: JSON.parse(input) }
    } catch (e) {
      return { ok: false, message: (e as Error).message }
    }
  }, [input])

  const formatted = useMemo(() => {
    if (!parsed || !parsed.ok) return ''
    return JSON.stringify(parsed.value, null, indentSize)
  }, [parsed, indentSize])

  // Live-clear the manual error banner once input becomes valid again.
  useEffect(() => {
    if (parsed?.ok) setError('')
  }, [parsed])

  const formatJson = () => {
    const p = parsed
    if (!p) {
      setError(t('errorEmpty'))
      return
    }
    if (p.ok === false) {
      setError(t('errorInvalid', { message: p.message }))
      return
    }
    setInput(JSON.stringify(p.value, null, indentSize))
    setError('')
  }

  const minifyJson = () => {
    const p = parsed
    if (!p) {
      setError(t('errorEmpty'))
      return
    }
    if (p.ok === false) {
      setError(t('errorInvalid', { message: p.message }))
      return
    }
    setInput(JSON.stringify(p.value))
    setError('')
  }

  const copyResult = async () => {
    if (!formatted) return
    await navigator.clipboard.writeText(formatted)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadJson = () => {
    if (!formatted) return
    const blob = new Blob([formatted], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'formatted.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const clearAll = () => {
    setInput('')
    setError('')
  }

  const validValue: unknown = parsed && parsed.ok ? parsed.value : null

  return (
    <div className="w-full">
      <PageHero title={t('title')} description={t('description')} className="mb-6" />

      <div className="flex flex-wrap gap-3 items-center mb-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">{t('indentSize')}:</label>
          <select
            value={indentSize}
            onChange={(e) => setIndentSize(Number(e.target.value))}
            className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value={2}>{t('indent2')}</option>
            <option value={4}>{t('indent4')}</option>
            <option value={8}>{t('indent8')}</option>
          </select>
        </div>

        <button
          onClick={formatJson}
          className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center gap-1.5"
        >
          <RefreshCw className="w-4 h-4" />
          {t('format')}
        </button>

        <button
          onClick={minifyJson}
          className="px-3 py-1.5 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center gap-1.5"
        >
          <Minimize2 className="w-4 h-4" />
          {t('minify')}
        </button>

        <button
          onClick={copyResult}
          disabled={!formatted}
          className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-1.5"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? t('copied') : t('copyResult')}
        </button>

        <button
          onClick={downloadJson}
          disabled={!formatted}
          className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-1.5"
        >
          <Download className="w-4 h-4" />
          {t('downloadJson')}
        </button>

        <button
          onClick={clearAll}
          className="px-3 py-1.5 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center gap-1.5"
        >
          <Eraser className="w-4 h-4" />
          {t('clear')}
        </button>
      </div>

      {error && (
        <div className="p-3 mb-4 bg-red-50 border border-red-200 rounded-md flex items-start gap-2 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span className="break-all">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">{t('inputLabel')}</label>
            <span className="text-xs text-gray-500">{t('monacoHint')}</span>
          </div>
          <JsonEditor
            value={input}
            onChange={setInput}
            tabSize={indentSize}
            ariaLabel={t('inputLabel')}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2 gap-2">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setViewMode('text')}
                className={`${tabBase} ${viewMode === 'text' ? tabActive : tabIdle}`}
              >
                <Code2 className="w-4 h-4" />
                {t('viewText')}
              </button>
              <button
                type="button"
                onClick={() => setViewMode('graph')}
                className={`${tabBase} ${viewMode === 'graph' ? tabActive : tabIdle}`}
              >
                <Network className="w-4 h-4" />
                {t('viewGraph')}
              </button>
            </div>
            {viewMode === 'graph' && (
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-600">{t('layoutDirection')}:</label>
                <select
                  value={layoutDirection}
                  onChange={(e) => setLayoutDirection(e.target.value as LayoutDirection)}
                  className="px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="RIGHT">{t('layoutRight')}</option>
                  <option value="LEFT">{t('layoutLeft')}</option>
                  <option value="DOWN">{t('layoutDown')}</option>
                  <option value="UP">{t('layoutUp')}</option>
                </select>
              </div>
            )}
          </div>

          {viewMode === 'text' ? (
            <JsonEditor
              value={formatted}
              readOnly
              tabSize={indentSize}
              ariaLabel={t('outputLabel')}
            />
          ) : (
            <Suspense
              fallback={
                <div className="h-[600px] flex items-center justify-center text-gray-400 border border-gray-200 rounded-md bg-gray-50">
                  {t('graphLoading')}
                </div>
              }
            >
              <JsonGraphView
                json={validValue}
                layoutDirection={layoutDirection}
                theme="light"
              />
            </Suspense>
          )}
        </div>
      </div>
    </div>
  )
}

export default JsonFormatter
