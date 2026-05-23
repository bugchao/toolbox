import React, { useCallback, useMemo, useState } from 'react'
import {
  FileCode,
  Sparkles,
  Minimize2,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Download,
  Eraser,
  ArrowLeftRight,
} from 'lucide-react'
import { PageHero } from '@toolbox/ui-kit'
import { useToolStorage } from '@toolbox/storage'
import { useTranslation } from 'react-i18next'

import { formatXml, minifyXml, parseXml } from './xmlUtils'

const NAMESPACE = 'toolXmlFormatter'

const SAMPLE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<bookstore><book id="1"><title>JavaScript The Good Parts</title><author>Douglas Crockford</author><year>2008</year></book><book id="2"><title>Clean Code</title><author>Robert C. Martin</author><year>2008</year></book></bookstore>`

interface PersistedState {
  indent: '2' | '4' | 'tab'
  keepComments: boolean
  inlineSimple: boolean
  minifyDropComments: boolean
}

const DEFAULT_STATE: PersistedState = {
  indent: '2',
  keepComments: true,
  inlineSimple: true,
  minifyDropComments: false,
}

const XmlFormatter: React.FC = () => {
  const { t } = useTranslation(NAMESPACE)
  const { data, save, loading } = useToolStorage<PersistedState>(
    'xml-formatter',
    'config',
    DEFAULT_STATE,
  )

  const [input, setInput] = useState(SAMPLE_XML)
  const [output, setOutput] = useState('')
  const [error, setError] = useState<{ message: string; line?: number; column?: number } | null>(null)
  const [validInfo, setValidInfo] = useState<{ nodes: number } | null>(null)
  const [copied, setCopied] = useState(false)

  const indentStr = useMemo(() => {
    if (data.indent === '2') return '  '
    if (data.indent === '4') return '    '
    return '\t'
  }, [data.indent])

  const doFormat = useCallback(() => {
    const r = formatXml(input, {
      indent: indentStr,
      keepComments: data.keepComments,
      inlineSimple: data.inlineSimple,
    })
    if (r.error) {
      setError(r.error)
      setOutput('')
      setValidInfo(null)
    } else {
      setError(null)
      setOutput(r.text)
      setValidInfo({ nodes: r.nodeCount })
    }
  }, [input, indentStr, data])

  const doMinify = useCallback(() => {
    const r = minifyXml(input, data.minifyDropComments)
    if (r.error) {
      setError(r.error)
      setOutput('')
      setValidInfo(null)
    } else {
      setError(null)
      setOutput(r.text)
      setValidInfo(null)
    }
  }, [input, data.minifyDropComments])

  const doValidate = useCallback(() => {
    const r = parseXml(input)
    if (r.error) {
      setError(r.error)
      setValidInfo(null)
    } else {
      setError(null)
      // 数 elements
      let n = 0
      const walk = (node: Node): void => {
        if (node.nodeType === 1) n++
        for (let i = 0; i < node.childNodes.length; i++) walk(node.childNodes[i])
      }
      if (r.doc) walk(r.doc)
      setValidInfo({ nodes: n })
    }
  }, [input])

  const copyOutput = async () => {
    if (!output) return
    try {
      await navigator.clipboard.writeText(output)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* ignore */
    }
  }
  const downloadOutput = () => {
    if (!output) return
    const blob = new Blob([output], { type: 'application/xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `formatted-${Date.now()}.xml`
    a.click()
    URL.revokeObjectURL(url)
  }
  const swap = () => {
    if (!output) return
    setInput(output)
    setOutput('')
  }
  const clearAll = () => {
    setInput('')
    setOutput('')
    setError(null)
    setValidInfo(null)
  }

  if (loading) {
    return (
      <div className="w-full space-y-6">
        <PageHero title={t('title')} description={t('description')} />
        <div className="text-center text-sm text-gray-400 py-12">{t('loading')}</div>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6 pb-24">
      <PageHero title={t('title')} description={t('description')} />

      {/* 配置 + 操作 */}
      <section className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <span className="text-gray-700">{t('config.indent')}:</span>
            <select
              value={data.indent}
              onChange={(e) => save({ ...data, indent: e.target.value as PersistedState['indent'] })}
              className="px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="2">{t('config.indent2')}</option>
              <option value="4">{t('config.indent4')}</option>
              <option value="tab">{t('config.indentTab')}</option>
            </select>
          </label>
          <label className="inline-flex items-center gap-1 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={data.keepComments}
              onChange={(e) => save({ ...data, keepComments: e.target.checked })}
              className="rounded border-gray-300"
            />
            {t('config.keepComments')}
          </label>
          <label className="inline-flex items-center gap-1 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={data.inlineSimple}
              onChange={(e) => save({ ...data, inlineSimple: e.target.checked })}
              className="rounded border-gray-300"
            />
            {t('config.inlineSimple')}
          </label>
          <label className="inline-flex items-center gap-1 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={data.minifyDropComments}
              onChange={(e) => save({ ...data, minifyDropComments: e.target.checked })}
              className="rounded border-gray-300"
            />
            {t('config.minifyDropComments')}
          </label>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={doFormat}
            className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            {t('action.format')}
          </button>
          <button
            type="button"
            onClick={doMinify}
            className="px-3 py-1.5 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center gap-1.5"
          >
            <Minimize2 className="w-4 h-4" />
            {t('action.minify')}
          </button>
          <button
            type="button"
            onClick={doValidate}
            className="px-3 py-1.5 text-sm bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            {t('action.validate')}
          </button>
          <button
            type="button"
            onClick={clearAll}
            className="ml-auto px-3 py-1.5 text-sm bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center gap-1.5"
          >
            <Eraser className="w-4 h-4" />
            {t('action.clear')}
          </button>
        </div>
      </section>

      {/* 错误 / 校验通过提示 */}
      {error && (
        <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <div className="flex-1 break-words">
            <div className="font-medium">{t('error.title')}</div>
            <div className="font-mono text-xs mt-0.5">{error.message}</div>
            {(error.line || error.column) && (
              <div className="text-xs mt-0.5">
                {t('error.location', { line: error.line ?? '-', col: error.column ?? '-' })}
              </div>
            )}
          </div>
        </div>
      )}
      {!error && validInfo && (
        <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md px-3 py-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {t('validOk', { count: validInfo.nodes })}
        </div>
      )}

      {/* 输入 + 输出 */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 block">{t('io.input')}</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('io.inputPlaceholder')}
            className="w-full h-[460px] px-3 py-2 text-xs border border-gray-300 rounded-md font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            spellCheck={false}
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">{t('io.output')}</label>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={copyOutput}
                disabled={!output}
                className="px-2 py-1 text-xs text-gray-700 hover:text-indigo-600 border border-gray-200 rounded hover:border-indigo-300 disabled:opacity-40 transition-colors flex items-center gap-1"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? t('io.copied') : t('io.copy')}
              </button>
              <button
                type="button"
                onClick={downloadOutput}
                disabled={!output}
                className="px-2 py-1 text-xs text-gray-700 hover:text-indigo-600 border border-gray-200 rounded hover:border-indigo-300 disabled:opacity-40 transition-colors flex items-center gap-1"
              >
                <Download className="w-3 h-3" />
                {t('io.download')}
              </button>
              <button
                type="button"
                onClick={swap}
                disabled={!output || output === input}
                className="px-2 py-1 text-xs text-gray-700 hover:text-indigo-600 border border-gray-200 rounded hover:border-indigo-300 disabled:opacity-40 transition-colors flex items-center gap-1"
                title={t('io.swapTitle')}
              >
                <ArrowLeftRight className="w-3 h-3" />
                {t('io.swap')}
              </button>
            </div>
          </div>
          <textarea
            value={output}
            readOnly
            placeholder={t('io.outputPlaceholder')}
            className="w-full h-[460px] px-3 py-2 text-xs border border-gray-300 rounded-md font-mono bg-gray-50 resize-none"
            spellCheck={false}
          />
        </div>
      </section>

      <p className="text-xs text-gray-400 text-center flex items-center justify-center gap-1">
        <FileCode className="w-3 h-3" /> {t('disclaimer')}
      </p>
    </div>
  )
}

export default XmlFormatter
