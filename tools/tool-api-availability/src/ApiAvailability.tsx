import React, { useState, useCallback } from 'react'
import { Plus, Trash2, Activity, RefreshCw, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

interface ApiEndpoint {
  id: string
  url: string
  method: 'GET' | 'POST' | 'HEAD'
  expectedStatus: number
}

interface ApiResult {
  url: string
  method: string
  status: number | null
  latency: number | null
  available: boolean
  error?: string
  headers?: Record<string, string>
}

function getStatusColor(status: number | null): string {
  if (status === null) return 'text-gray-400'
  if (status < 300) return 'text-green-500'
  if (status < 400) return 'text-yellow-500'
  if (status < 500) return 'text-orange-500'
  return 'text-red-500'
}

let eid = 0
const neid = () => String(++eid)

export function ApiAvailability() {
  const [endpoints, setEndpoints] = useState<ApiEndpoint[]>([
    { id: neid(), url: 'https://api.github.com', method: 'GET', expectedStatus: 200 },
    { id: neid(), url: 'https://httpbin.org/get', method: 'GET', expectedStatus: 200 },
  ])
  const [newUrl, setNewUrl] = useState('')
  const [newMethod, setNewMethod] = useState<'GET' | 'POST' | 'HEAD'>('GET')
  const [newStatus, setNewStatus] = useState(200)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<ApiResult[]>([])
  const [error, setError] = useState('')

  const add = () => {
    const url = newUrl.trim()
    if (!url) return
    setEndpoints(prev => [...prev, { id: neid(), url, method: newMethod, expectedStatus: newStatus }])
    setNewUrl('')
  }

  const remove = (id: string) => setEndpoints(prev => prev.filter(e => e.id !== id))

  const test = useCallback(async () => {
    if (!endpoints.length) return
    setLoading(true)
    setError('')
    setResults([])
    try {
      const res = await fetch('/api/network/api-availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoints: endpoints.map(e => ({ url: e.url, method: e.method, expectedStatus: e.expectedStatus })) }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || '请求失败')
      setResults(data.results || [])
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [endpoints])

  const available = results.filter(r => r.available).length
  const total = results.length

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">API 可用性测试</h1>
      <p className="text-gray-500 dark:text-gray-400">批量检测 HTTP API 端点的可用性、响应时间和状态码</p>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">添加 API 端点</h2>
        <div className="grid grid-cols-12 gap-2">
          <input value={newUrl} onChange={e => setNewUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && add()}
            placeholder="https://api.example.com/health"
            className="col-span-6 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <select value={newMethod} onChange={e => setNewMethod(e.target.value as any)}
            className="col-span-2 px-2 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option>GET</option><option>POST</option><option>HEAD</option>
          </select>
          <input type="number" value={newStatus} onChange={e => setNewStatus(parseInt(e.target.value) || 200)}
            className="col-span-2 px-2 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <button onClick={add}
            className="col-span-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1">
            <Plus className="w-4 h-4" />添加
          </button>
        </div>
        <div className="text-xs text-gray-400">方法 / 期望状态码</div>

        {/* 端点列表 */}
        <div className="space-y-2">
          {endpoints.map(e => (
            <div key={e.id} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
              <span className="px-1.5 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded text-xs font-mono font-medium">{e.method}</span>
              <span className="flex-1 font-mono text-sm text-gray-700 dark:text-gray-300 truncate">{e.url}</span>
              <span className="text-xs text-gray-400">{e.expectedStatus}</span>
              <button onClick={() => remove(e.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button onClick={test} disabled={loading || !endpoints.length}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors">
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
          {loading ? '检测中...' : '开始检测'}
        </button>
      </div>

      {results.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">可用性：</span>
            <span className={`font-bold text-lg ${available === total ? 'text-green-500' : available === 0 ? 'text-red-500' : 'text-orange-500'}`}>
              {available}/{total}
            </span>
            <span className="text-gray-400 text-sm">({Math.round((available/total)*100)}%)</span>
          </div>
          {results.map((r, i) => (
            <div key={i} className={`bg-white dark:bg-gray-800 rounded-xl border-2 p-4 ${
              r.available ? 'border-green-200 dark:border-green-800' : 'border-red-200 dark:border-red-800'
            }`}>
              <div className="flex items-start gap-3">
                {r.available
                  ? <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  : <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">{r.method}</span>
                    <span className="font-mono text-sm text-gray-800 dark:text-gray-200 truncate">{r.url}</span>
                  </div>
                  <div className="flex items-center gap-4 mt-1.5 text-sm">
                    <span className={`font-mono font-bold ${getStatusColor(r.status)}`}>
                      {r.status ?? 'N/A'}
                    </span>
                    {r.latency !== null && (
                      <span className={`font-mono ${
                        r.latency < 200 ? 'text-green-500' : r.latency < 500 ? 'text-yellow-500' : 'text-red-500'
                      }`}>{r.latency}ms</span>
                    )}
                    {r.error && <span className="text-red-500 text-xs">{r.error}</span>}
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
