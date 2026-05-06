import React, { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { FileText, Copy, Download, Plus, Trash2 } from 'lucide-react'
import { PageHero, ParticlesBackground } from '@toolbox/ui-kit'
import { ApiData, Parameter, Response, METHODS, PARAM_TYPES } from './types'
import { parseOpenApi, generateMarkdown, generateHtml } from './utils'

export default function ApiDocGen() {
  const { t } = useTranslation('toolApiDocGen')
  const [inputMode, setInputMode] = useState<'manual' | 'import'>('manual')
  const [apiData, setApiData] = useState<ApiData>({
    name: '', method: 'GET', url: '', description: '', parameters: [], responses: []
  })
  const [jsonInput, setJsonInput] = useState('')
  const [previewFormat, setPreviewFormat] = useState<'markdown' | 'html'>('markdown')
  const [message, setMessage] = useState('')

  const addParameter = (paramIn: 'path' | 'query' | 'header' | 'body') => {
    setApiData(prev => ({ ...prev, parameters: [...prev.parameters, { name: '', type: 'string', required: false, description: '', in: paramIn }] }))
  }

  const removeParameter = (index: number) => {
    setApiData(prev => ({ ...prev, parameters: prev.parameters.filter((_, i) => i !== index) }))
  }

  const updateParameter = (index: number, field: keyof Parameter, value: any) => {
    setApiData(prev => ({ ...prev, parameters: prev.parameters.map((p, i) => i === index ? { ...p, [field]: value } : p) }))
  }

  const addResponse = () => {
    setApiData(prev => ({ ...prev, responses: [...prev.responses, { statusCode: '200', description: '', example: '' }] }))
  }

  const removeResponse = (index: number) => {
    setApiData(prev => ({ ...prev, responses: prev.responses.filter((_, i) => i !== index) }))
  }

  const updateResponse = (index: number, field: keyof Response, value: string) => {
    setApiData(prev => ({ ...prev, responses: prev.responses.map((r, i) => i === index ? { ...r, [field]: value } : r) }))
  }

  const handleParseJson = () => {
    const parsed = parseOpenApi(jsonInput)
    if (parsed) {
      setApiData(parsed)
      setMessage(t('parseSuccess'))
      setInputMode('manual')
    } else {
      setMessage(t('parseError'))
    }
  }

  const markdown = useMemo(() => generateMarkdown(apiData, t), [apiData, t])
  const html = useMemo(() => generateHtml(markdown), [markdown])

  const output = previewFormat === 'markdown' ? markdown : html
  const inputCls = 'w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100'
  const labelCls = 'mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400'

  const handleCopy = async () => {
    if (!output) return
    await navigator.clipboard.writeText(output)
    setMessage(t('copied'))
  }

  const handleDownload = () => {
    if (!output) return
    const blob = new Blob([output], { type: previewFormat === 'markdown' ? 'text/markdown' : 'text/html' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${apiData.name || 'api-doc'}.${previewFormat === 'markdown' ? 'md' : 'html'}`
    link.click()
    URL.revokeObjectURL(url)
    setMessage(t('downloadSuccess'))
  }

  const parameterGroups: Array<{ key: 'path' | 'query' | 'header' | 'body'; title: string }> = [
    { key: 'path', title: t('pathParams') },
    { key: 'query', title: t('queryParams') },
    { key: 'header', title: t('headers') },
    { key: 'body', title: t('bodyParams') },
  ]

  return (
    <div className="relative min-h-screen bg-gray-50 dark:bg-gray-900">
      <ParticlesBackground preset="minimal" className="absolute inset-0" />
      <div className="relative z-10">
        <PageHero title={t('title')} description={t('description')} icon={FileText} />

        <div className="mx-auto grid max-w-7xl gap-6 px-4 pb-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
          <section className="space-y-5">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">{t('inputMethod')}</h2>
                <div className="flex rounded-lg border border-gray-200 bg-gray-50 p-1 dark:border-gray-700 dark:bg-gray-900">
                  {(['manual', 'import'] as const).map(mode => (
                    <button
                      key={mode}
                      onClick={() => setInputMode(mode)}
                      className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${inputMode === mode ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100'}`}
                    >
                      {t(mode)}
                    </button>
                  ))}
                </div>
              </div>

              {inputMode === 'import' ? (
                <div className="space-y-3">
                  <label className={labelCls}>{t('importJson')}</label>
                  <textarea
                    className={`${inputCls} min-h-72 font-mono`}
                    value={jsonInput}
                    onChange={e => setJsonInput(e.target.value)}
                    placeholder={t('pasteJson')}
                  />
                  <button
                    onClick={handleParseJson}
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
                  >
                    {t('parseJson')}
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <label className={labelCls}>{t('apiName')}</label>
                      <input className={inputCls} value={apiData.name} onChange={e => setApiData(prev => ({ ...prev, name: e.target.value }))} placeholder={t('apiNamePlaceholder')} />
                    </div>
                    <div>
                      <label className={labelCls}>{t('method')}</label>
                      <select className={inputCls} value={apiData.method} onChange={e => setApiData(prev => ({ ...prev, method: e.target.value }))}>
                        {METHODS.map(method => <option key={method} value={method}>{method}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>{t('url')}</label>
                    <input className={inputCls} value={apiData.url} onChange={e => setApiData(prev => ({ ...prev, url: e.target.value }))} placeholder={t('urlPlaceholder')} />
                  </div>

                  <div>
                    <label className={labelCls}>{t('description')}</label>
                    <textarea className={`${inputCls} min-h-24`} value={apiData.description} onChange={e => setApiData(prev => ({ ...prev, description: e.target.value }))} placeholder={t('descriptionPlaceholder')} />
                  </div>
                </div>
              )}
            </div>

            {inputMode === 'manual' && (
              <>
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                  <h2 className="mb-4 text-sm font-semibold text-gray-800 dark:text-gray-100">{t('parameters')}</h2>
                  <div className="space-y-5">
                    {parameterGroups.map(group => {
                      const items = apiData.parameters
                        .map((param, index) => ({ param, index }))
                        .filter(item => item.param.in === group.key)

                      return (
                        <div key={group.key} className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">{group.title}</h3>
                            <button onClick={() => addParameter(group.key)} className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700">
                              <Plus className="h-3.5 w-3.5" />
                              {t('addParam')}
                            </button>
                          </div>
                          {items.length === 0 ? (
                            <p className="rounded-lg border border-dashed border-gray-200 px-3 py-2 text-xs text-gray-400 dark:border-gray-700">{t('noData')}</p>
                          ) : (
                            <div className="space-y-2">
                              {items.map(({ param, index }) => (
                                <div key={`${group.key}-${index}`} className="grid gap-2 rounded-xl border border-gray-100 p-3 dark:border-gray-700 md:grid-cols-[1fr_120px_80px_1.4fr_32px]">
                                  <input className={inputCls} value={param.name} onChange={e => updateParameter(index, 'name', e.target.value)} placeholder={t('paramName')} />
                                  <select className={inputCls} value={param.type} onChange={e => updateParameter(index, 'type', e.target.value)}>
                                    {PARAM_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                                  </select>
                                  <label className="flex items-center gap-2 text-sm text-gray-500">
                                    <input type="checkbox" checked={param.required} onChange={e => updateParameter(index, 'required', e.target.checked)} className="h-4 w-4 rounded text-indigo-600" />
                                    {t('paramRequired')}
                                  </label>
                                  <input className={inputCls} value={param.description} onChange={e => updateParameter(index, 'description', e.target.value)} placeholder={t('paramDescription')} />
                                  <button onClick={() => removeParameter(index)} className="flex h-9 w-9 items-center justify-center rounded-lg text-red-500 hover:bg-red-50" title={t('delete')}>
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">{t('responses')}</h2>
                    <button onClick={addResponse} className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700">
                      <Plus className="h-3.5 w-3.5" />
                      {t('addResponse')}
                    </button>
                  </div>
                  <div className="space-y-3">
                    {apiData.responses.map((response, index) => (
                      <div key={index} className="space-y-2 rounded-xl border border-gray-100 p-3 dark:border-gray-700">
                        <div className="grid gap-2 md:grid-cols-[120px_1fr_32px]">
                          <input className={inputCls} value={response.statusCode} onChange={e => updateResponse(index, 'statusCode', e.target.value)} placeholder={t('statusCode')} />
                          <input className={inputCls} value={response.description} onChange={e => updateResponse(index, 'description', e.target.value)} placeholder={t('responseDescription')} />
                          <button onClick={() => removeResponse(index)} className="flex h-9 w-9 items-center justify-center rounded-lg text-red-500 hover:bg-red-50" title={t('delete')}>
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <textarea className={`${inputCls} min-h-24 font-mono`} value={response.example} onChange={e => updateResponse(index, 'example', e.target.value)} placeholder={t('responseExample')} />
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800 lg:sticky lg:top-6 lg:self-start">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">{t('preview')}</h2>
              <div className="flex items-center gap-2">
                <div className="flex rounded-lg border border-gray-200 bg-gray-50 p-1 dark:border-gray-700 dark:bg-gray-900">
                  {(['markdown', 'html'] as const).map(format => (
                    <button
                      key={format}
                      onClick={() => setPreviewFormat(format)}
                      className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${previewFormat === format ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100'}`}
                    >
                      {t(format)}
                    </button>
                  ))}
                </div>
                <button onClick={handleCopy} className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700" title={t('copy')}>
                  <Copy className="h-4 w-4" />
                </button>
                <button onClick={handleDownload} className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700" title={t('download')}>
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>

            {message && <p className="mb-3 rounded-lg bg-indigo-50 px-3 py-2 text-sm text-indigo-700 dark:bg-indigo-950 dark:text-indigo-200">{message}</p>}

            {output ? (
              <pre className="max-h-[70vh] overflow-auto rounded-xl bg-gray-950 p-4 text-sm text-gray-100"><code>{output}</code></pre>
            ) : (
              <div className="flex min-h-64 items-center justify-center rounded-xl border border-dashed border-gray-200 text-sm text-gray-400 dark:border-gray-700">
                {t('noData')}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
