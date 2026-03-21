import React, { useState, useCallback } from 'react'
import { Activity, Plus, Trash2, RefreshCw } from 'lucide-react'

interface LatencyResult {
  target: string
  region: string
  latency: number | null
  status: 'ok' | 'timeout' | 'error'
  ttl?: number
}

interface TestResult {
  target: string
  results: LatencyResult[]
  avg: number | null
  min: number | null
  max: number | null
}

const TEST_REGIONS = [
  { id: 'cn-east', label: '华东' },
  { id: 'cn-north', label: '华北' },
  { id: 'cn-south', label: '华南' },
  { id: 'global', label: '海外' },
]

function getLatencyColor(ms: number | null): string {
  if (ms === null) return 'text-gray-400'
  if (ms < 50) return 'text-green-500'
  if (ms < 150) return 'text-yellow-500'
  if (ms < 300) return 'text-orange-500'
  return 'text-red-500'
}

function getBarColor(ms: number | null): string {
  if (ms === null) return '#e5e7eb'
  if (ms < 50) return '#10b981'
  if (ms < 150) return '#f59e0b'
  if (ms < 300) return '#f97316'
  return '#ef4444'
}

export function ServerLatency() {
  const [targets, setTargets] = useState<string[]>(['example.com', 'github.com'])
  const [newTarget, setNewTarget] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<TestResult[]>([])
  const [error, setError] = useState('')

  const addTarget = () => {
    const t = newTarget.trim().replace(/^https?:\/\//, '').split('/')[0]
    if (!t || targets.includes(t)) return
    setTargets(prev => [...prev, t])
    setNewTarget('')
  }

  const removeTarget = (t: string) => setTargets(prev => prev.filter(x => x !== t))

  const runTest = useCallback(async () => {
    if (!targets.length) return
    setLoading(true)
    setError('')
    setResults([])
    try {
      const res = await fetch('/api/network/server-latency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targets }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || '请求失败')
      setResults(data.results || [])
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [targets])

  const maxLatency = Math.max(...results.flatMap(r => r.results.map(x => x.latency ?? 0)), 1)

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">服务器延迟测试</h1>
      <p className="text-gray-500 dark:text-gray-400">从多个地区测试目标服务器的响应延迟，快速发现网络瓶颈</p>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">测试目标</h2>
        <div className="flex gap-2">
          <input value={newTarget} onChange={e => setNewTarget(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTarget()}
            placeholder="添加域名或 IP，如 example.com"
            className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <button onClick={addTarget}
            className="px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 text-gray-700 dark:text-gray-300 rounded-lg transition-colors">
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {targets.map(t => (
            <span key={t} className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700 rounded-lg text-sm font-mono text-indigo-700 dark:text-indigo-300">
              {t}
              <button onClick={() => removeTarget(t)} className="text-indigo-400 hover:text-red-500 transition-colors">
                <Trash2 className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button onClick={runTest} disabled={loading || !targets.length}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors">
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
          {loading ? '测试中...' : '开始测试'}
        </button>
      </div>

      {results.length > 0 && (
        <div className="space-y-4">
          {results.map(r => (
            <div key={r.target} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <span className="font-mono font-semibold text-gray-900 dark:text-gray-100">{r.target}</span>
                <div className="flex gap-3 text-xs">
                  {r.min !== null && <span className="text-green-500">最低 {r.min}ms</span>}
                  {r.avg !== null && <span className="text-yellow-500">平均 {r.avg}ms</span>}
                  {r.max !== null && <span className="text-red-500">最高 {r.max}ms</span>}
                </div>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {r.results.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-2.5">
                    <span className="text-sm text-gray-600 dark:text-gray-400 w-16 shrink-0">{item.region}</span>
                    <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: item.latency !== null ? `${Math.min(100, (item.latency / maxLatency) * 100)}%` : '0%',
                          backgroundColor: getBarColor(item.latency)
                        }} />
                    </div>
                    <span className={`text-sm font-mono font-medium w-20 text-right ${getLatencyColor(item.latency)}`}>
                      {item.status === 'timeout' ? 'timeout' : item.status === 'error' ? 'error' : `${item.latency}ms`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
