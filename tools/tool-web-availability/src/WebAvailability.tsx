import React, { useState, useCallback } from 'react'
import { Globe, CheckCircle, XCircle, AlertTriangle, Clock } from 'lucide-react'

interface CheckResult {
  url: string
  status: number | null
  statusText: string
  responseTimeMs: number | null
  available: boolean
  redirectUrl?: string
  error?: string
}

export function WebAvailability() {
  const [urls, setUrls] = useState('https://example.com\nhttps://github.com')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<CheckResult[] | null>(null)

  const check = useCallback(async () => {
    const list = urls.split('\n').map(u => u.trim()).filter(Boolean)
    if (list.length === 0) return
    setLoading(true)
    setResults(null)
    try {
      const res = await fetch('/api/web/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls: list }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || '请求失败')
      setResults(data.results)
    } catch (e: any) {
      setResults(list.map(url => ({ url, status: null, statusText: e.message, responseTimeMs: null, available: false, error: e.message })))
    } finally {
      setLoading(false)
    }
  }, [urls])

  const getStatusIcon = (r: CheckResult) => {
    if (!r.available) return <XCircle className="w-5 h-5 text-red-500 shrink-0" />
    if (r.status && r.status >= 400) return <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0" />
    return <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
  }

  const getStatusBadge = (status: number | null) => {
    if (!status) return 'bg-gray-100 dark:bg-gray-700 text-gray-500'
    if (status < 300) return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
    if (status < 400) return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
    if (status < 500) return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
    return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
  }

  const getRttColor = (ms: number | null) => {
    if (!ms) return 'text-gray-400'
    if (ms < 200) return 'text-green-500'
    if (ms < 1000) return 'text-yellow-500'
    return 'text-red-500'
  }

  const available = results?.filter(r => r.available).length ?? 0
  const total = results?.length ?? 0

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Web 服务可用性检测</h1>
      <p className="text-gray-500 dark:text-gray-400">批量检测多个 URL 的 HTTP 状态和响应时间</p>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URL 列表（每行一个）</label>
          <textarea
            value={urls}
            onChange={e => setUrls(e.target.value)}
            rows={5}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
            placeholder="https://example.com"
          />
        </div>
        <button onClick={check} disabled={loading}
          className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
          <Globe className="w-4 h-4" />
          {loading ? '检测中...' : '开始检测'}
        </button>
      </div>

      {loading && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
          <div className="inline-flex items-center gap-3 text-gray-500">
            <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            正在检测，请稍候...
          </div>
        </div>
      )}

      {results && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">检测完成：{available}/{total} 可用</span>
            <div className="flex gap-2 text-xs">
              <span className="text-green-500">● 正常</span>
              <span className="text-orange-500">● 异常</span>
              <span className="text-red-500">● 不可用</span>
            </div>
          </div>
          {results.map((r, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-start gap-3">
                {getStatusIcon(r)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-sm text-gray-900 dark:text-gray-100 truncate">{r.url}</span>
                    {r.status && (
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusBadge(r.status)}`}>
                        {r.status}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs">
                    {r.responseTimeMs !== null && (
                      <span className={`flex items-center gap-1 ${getRttColor(r.responseTimeMs)}`}>
                        <Clock className="w-3 h-3" />{r.responseTimeMs}ms
                      </span>
                    )}
                    {r.statusText && <span className="text-gray-500">{r.statusText}</span>}
                    {r.redirectUrl && <span className="text-blue-500 truncate">→ {r.redirectUrl}</span>}
                    {r.error && <span className="text-red-500">{r.error}</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
