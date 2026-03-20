import React, { useState, useCallback } from 'react'
import { Network } from 'lucide-react'

interface Hop {
  hop: number
  ip: string | null
  hostname: string | null
  rtt1: number | null
  rtt2: number | null
  rtt3: number | null
  status: 'success' | 'timeout' | 'error'
}

interface TraceResult {
  target: string
  resolvedIp: string
  hops: Hop[]
  completed: boolean
  totalMs: number
}

export function Traceroute() {
  const [target, setTarget] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<TraceResult | null>(null)
  const [error, setError] = useState('')

  const trace = useCallback(async () => {
    if (!target.trim()) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await fetch('/api/traceroute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: target.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || '请求失败')
      setResult(data)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [target])

  const getRttColor = (rtt: number | null) => {
    if (rtt === null) return 'text-gray-400'
    if (rtt < 10) return 'text-green-500'
    if (rtt < 50) return 'text-yellow-500'
    if (rtt < 150) return 'text-orange-500'
    return 'text-red-500'
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Traceroute 路由追踪</h1>
      <p className="text-gray-500 dark:text-gray-400">追踪数据包从服务器到目标主机的完整路径</p>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
        <div className="flex gap-3">
          <input
            type="text"
            value={target}
            onChange={e => setTarget(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && trace()}
            placeholder="example.com 或 8.8.8.8"
            className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={trace}
            disabled={loading || !target.trim()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Network className="w-4 h-4" />
            {loading ? '追踪中...' : '追踪'}
          </button>
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>

      {loading && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
          <div className="inline-flex items-center gap-3 text-gray-500">
            <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            正在追踪路由，最多需要 30 秒...
          </div>
        </div>
      )}

      {result && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-5 py-3 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {result.target} → {result.resolvedIp}
            </span>
            <span className="text-xs text-gray-500">{result.hops.length} 跳 · {result.totalMs}ms</span>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/30">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 w-12">跳数</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">IP / 主机名</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">RTT 1</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">RTT 2</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">RTT 3</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {result.hops.map(hop => (
                <tr key={hop.hop} className={`${
                  hop.status === 'timeout' ? 'opacity-50' : ''
                } hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors`}>
                  <td className="px-4 py-2.5">
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono font-medium text-gray-600 dark:text-gray-400">
                      {hop.hop}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    {hop.status === 'timeout' ? (
                      <span className="text-gray-400">* * * 请求超时</span>
                    ) : (
                      <div>
                        <span className="font-mono text-gray-900 dark:text-gray-100">{hop.ip}</span>
                        {hop.hostname && hop.hostname !== hop.ip && (
                          <span className="ml-2 text-xs text-gray-500">({hop.hostname})</span>
                        )}
                      </div>
                    )}
                  </td>
                  {[hop.rtt1, hop.rtt2, hop.rtt3].map((rtt, i) => (
                    <td key={i} className={`px-4 py-2.5 text-right font-mono text-xs ${getRttColor(rtt)}`}>
                      {rtt !== null ? `${rtt}ms` : '*'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {result.completed && (
            <div className="px-5 py-3 bg-green-50 dark:bg-green-900/10 border-t border-green-200 dark:border-green-800">
              <span className="text-green-700 dark:text-green-400 text-sm">✓ 路由追踪完成</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
