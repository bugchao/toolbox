import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Send, Plus, Trash2, Terminal } from 'lucide-react'
import { PageHero } from '@toolbox/ui-kit'

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
const METHODS: Method[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
const METHOD_COLORS: Record<Method, string> = {
  GET: 'text-green-600', POST: 'text-blue-600', PUT: 'text-amber-600',
  PATCH: 'text-purple-600', DELETE: 'text-red-600'
}

interface Header { key: string; value: string }
interface Response { status: number; statusText: string; body: string; time: number; headers: Record<string, string> }

export default function HttpDebugger() {
  const { t } = useTranslation('toolHttpDebugger')
  const [method, setMethod] = useState<Method>('GET')
  const [url, setUrl] = useState('https://jsonplaceholder.typicode.com/posts/1')
  const [headers, setHeaders] = useState<Header[]>([{ key: 'Content-Type', value: 'application/json' }])
  const [body, setBody] = useState('')
  const [response, setResponse] = useState<Response | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<'headers' | 'body'>('headers')

  const send = async () => {
    if (!url.trim()) return
    setLoading(true)
    setError('')
    setResponse(null)
    const start = Date.now()
    try {
      const opts: RequestInit = { method }
      const hdrs: Record<string, string> = {}
      headers.filter(h => h.key.trim()).forEach(h => { hdrs[h.key] = h.value })
      if (Object.keys(hdrs).length) opts.headers = hdrs
      if (['POST', 'PUT', 'PATCH'].includes(method) && body.trim()) opts.body = body
      const res = await fetch(url, opts)
      const time = Date.now() - start
      const resHeaders: Record<string, string> = {}
      res.headers.forEach((v, k) => { resHeaders[k] = v })
      const text = await res.text()
      let formatted = text
      try { formatted = JSON.stringify(JSON.parse(text), null, 2) } catch {}
      setResponse({ status: res.status, statusText: res.statusText, body: formatted, time, headers: resHeaders })
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t('error'))
    } finally {
      setLoading(false)
    }
  }

  const addHeader = () => setHeaders(h => [...h, { key: '', value: '' }])
  const removeHeader = (i: number) => setHeaders(h => h.filter((_, idx) => idx !== i))
  const updateHeader = (i: number, field: 'key' | 'value', val: string) =>
    setHeaders(h => h.map((hd, idx) => idx === i ? { ...hd, [field]: val } : hd))

  const statusColor = response ? (response.status < 300 ? 'text-green-500' : response.status < 400 ? 'text-amber-500' : 'text-red-500') : ''

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHero title={t('title')} description={t('description')} icon={Terminal} />
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
          <div className="flex gap-2">
            <select value={method} onChange={e => setMethod(e.target.value as Method)}
              className={`px-3 py-2 text-sm font-bold border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:outline-none ${METHOD_COLORS[method]}`}>
              {METHODS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <input value={url} onChange={e => setUrl(e.target.value)}
              placeholder="https://api.example.com/endpoint"
              className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono" />
            <button onClick={send} disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium">
              <Send className="w-4 h-4" />{loading ? t('loading') : t('send')}
            </button>
          </div>

          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {(['headers', 'body'] as const).map(tb => (
              <button key={tb} onClick={() => setTab(tb)}
                className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                  tab === tb ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500'
                }`}>{t(tb)}</button>
            ))}
          </div>

          {tab === 'headers' && (
            <div className="space-y-2">
              {headers.map((h, i) => (
                <div key={i} className="flex gap-2">
                  <input value={h.key} onChange={e => updateHeader(i, 'key', e.target.value)}
                    placeholder={t('key')}
                    className="flex-1 px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono focus:outline-none" />
                  <input value={h.value} onChange={e => updateHeader(i, 'value', e.target.value)}
                    placeholder={t('value')}
                    className="flex-1 px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono focus:outline-none" />
                  <button onClick={() => removeHeader(i)} className="text-gray-300 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
              <button onClick={addHeader} className="flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-700">
                <Plus className="w-3.5 h-3.5" />{t('addHeader')}
              </button>
            </div>
          )}

          {tab === 'body' && (
            <textarea value={body} onChange={e => setBody(e.target.value)} rows={5}
              placeholder='{"key": "value"}'
              className="w-full px-3 py-2 text-xs font-mono border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500" />
          )}
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-xl p-3 text-sm text-red-500">
            {t('error')}: {error}
          </div>
        )}

        {response && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
            <div className="flex items-center gap-4">
              <span className={`text-lg font-bold ${statusColor}`}>{response.status} {response.statusText}</span>
              <span className="text-xs text-gray-400">{response.time}ms</span>
            </div>
            <pre className="bg-gray-900 dark:bg-gray-950 text-green-400 text-xs p-3 rounded-lg overflow-auto max-h-80 font-mono whitespace-pre-wrap">{response.body}</pre>
            <details className="text-xs">
              <summary className="text-gray-400 cursor-pointer">Response Headers ({Object.keys(response.headers).length})</summary>
              <div className="mt-2 space-y-1">
                {Object.entries(response.headers).map(([k, v]) => (
                  <div key={k} className="flex gap-2">
                    <span className="text-gray-500 shrink-0">{k}:</span>
                    <span className="text-gray-700 dark:text-gray-300 break-all">{v}</span>
                  </div>
                ))}
              </div>
            </details>
          </div>
        )}
        <p className="text-xs text-center text-gray-400">{t('corsNote')}</p>
      </div>
    </div>
  )
}
