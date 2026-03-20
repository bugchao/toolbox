import React, { useState, useCallback } from 'react'

function ipToNum(ip: string): number {
  const parts = ip.trim().split('.')
  if (parts.length !== 4) return NaN
  const n = parts.reduce((acc, p) => (acc << 8) + parseInt(p), 0) >>> 0
  return n
}

function isValidIp(ip: string): boolean {
  const parts = ip.trim().split('.')
  if (parts.length !== 4) return false
  return parts.every(p => {
    const n = parseInt(p)
    return !isNaN(n) && n >= 0 && n <= 255 && String(n) === p
  })
}

interface Pool {
  id: string
  name: string
  start: string
  end: string
  total: number
  used: number
}

export function DhcpUtilization() {
  const [pools, setPools] = useState<Pool[]>([
    { id: '1', name: '主楼', start: '192.168.1.100', end: '192.168.1.200', total: 0, used: 0 }
  ])
  const [results, setResults] = useState<Pool[] | null>(null)
  const [error, setError] = useState('')

  const updatePool = (id: string, field: keyof Pool, value: string | number) =>
    setPools(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p))

  const addPool = () => setPools(prev => [
    ...prev,
    { id: Date.now().toString(), name: `地址池 ${prev.length + 1}`, start: '', end: '', total: 0, used: 0 }
  ])

  const removePool = (id: string) => setPools(prev => prev.filter(p => p.id !== id))

  const calculate = useCallback(() => {
    setError('')
    const results: Pool[] = []
    for (const pool of pools) {
      if (!isValidIp(pool.start) || !isValidIp(pool.end)) {
        setError(`地址池「${pool.name}」IP 格式错误`); return
      }
      const startNum = ipToNum(pool.start)
      const endNum = ipToNum(pool.end)
      if (startNum > endNum) {
        setError(`地址池「${pool.name}」起始 IP 大于结束 IP`); return
      }
      const total = endNum - startNum + 1
      const used = Math.min(pool.used, total)
      results.push({ ...pool, total, used })
    }
    setResults(results)
  }, [pools])

  const totalIps = results?.reduce((s, p) => s + p.total, 0) ?? 0
  const totalUsed = results?.reduce((s, p) => s + p.used, 0) ?? 0
  const globalUtil = totalIps > 0 ? Math.round((totalUsed / totalIps) * 100) : 0

  const getUtilColor = (pct: number) =>
    pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-orange-400' : pct >= 50 ? 'bg-yellow-400' : 'bg-green-500'

  const getUtilTextColor = (pct: number) =>
    pct >= 90 ? 'text-red-600 dark:text-red-400' : pct >= 70 ? 'text-orange-500' : pct >= 50 ? 'text-yellow-500' : 'text-green-600 dark:text-green-400'

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">DHCP 地址利用率分析</h1>
      <p className="text-gray-500 dark:text-gray-400">输入多个地址池的范围和已用数量，分析整体利用率</p>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
        <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 px-1">
          <span className="col-span-3">池名称</span>
          <span className="col-span-3">起始 IP</span>
          <span className="col-span-3">结束 IP</span>
          <span className="col-span-2">已用数量</span>
          <span className="col-span-1"></span>
        </div>
        {pools.map(pool => (
          <div key={pool.id} className="grid grid-cols-12 gap-2 items-center">
            <input value={pool.name} onChange={e => updatePool(pool.id, 'name', e.target.value)}
              className="col-span-3 px-2 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <input value={pool.start} onChange={e => updatePool(pool.id, 'start', e.target.value)}
              placeholder="192.168.1.100"
              className="col-span-3 px-2 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <input value={pool.end} onChange={e => updatePool(pool.id, 'end', e.target.value)}
              placeholder="192.168.1.200"
              className="col-span-3 px-2 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <input type="number" value={pool.used} onChange={e => updatePool(pool.id, 'used', parseInt(e.target.value) || 0)}
              min={0}
              className="col-span-2 px-2 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <button onClick={() => removePool(pool.id)} disabled={pools.length === 1}
              className="col-span-1 text-gray-400 hover:text-red-500 disabled:opacity-30 transition-colors text-center">✕</button>
          </div>
        ))}
        <div className="flex items-center gap-4">
          <button onClick={addPool} className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">+ 添加地址池</button>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
        <button onClick={calculate} className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors">
          分析利用率
        </button>
      </div>

      {results && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-gray-900 dark:text-gray-100">整体利用率</span>
              <span className={`text-2xl font-bold ${getUtilTextColor(globalUtil)}`}>{globalUtil}%</span>
            </div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all ${getUtilColor(globalUtil)}`} style={{ width: `${globalUtil}%` }} />
            </div>
            <p className="text-xs text-gray-500 mt-1">总计 {totalIps} 个 IP，已用 {totalUsed}，剩余 {totalIps - totalUsed}</p>
          </div>

          {results.map(pool => {
            const pct = pool.total > 0 ? Math.round((pool.used / pool.total) * 100) : 0
            return (
              <div key={pool.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-800 dark:text-gray-200">{pool.name}</span>
                  <span className={`font-bold ${getUtilTextColor(pct)}`}>{pct}%</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-1">
                  <div className={`h-full rounded-full ${getUtilColor(pct)}`} style={{ width: `${pct}%` }} />
                </div>
                <p className="text-xs text-gray-500">{pool.start} ~ {pool.end} · 共 {pool.total} 个 · 已用 {pool.used} · 剩余 {pool.total - pool.used}</p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
