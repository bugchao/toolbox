import React, { useState, useCallback } from 'react'
import { Play, RefreshCw } from 'lucide-react'

type Policy = 'nearest' | 'round-robin' | 'weighted' | 'least-conn' | 'random'

interface GslbNode {
  id: string
  name: string
  region: string
  weight: number
  connections: number
  latency: number
  available: boolean
}

interface SimRound {
  round: number
  results: Record<Policy, string>
}

const NODES: GslbNode[] = [
  { id: 'sh', name: '上海 SH1', region: '华东', weight: 40, connections: 120, latency: 8, available: true },
  { id: 'bj', name: '北京 BJ1', region: '华北', weight: 30, connections: 80, latency: 25, available: true },
  { id: 'gz', name: '广州 GZ1', region: '华南', weight: 20, connections: 200, latency: 15, available: true },
  { id: 'sg', name: '新加坡 SG1', region: '海外', weight: 10, connections: 40, latency: 95, available: true },
]

const POLICIES: { id: Policy; name: string; desc: string }[] = [
  { id: 'nearest', name: '就近调度', desc: '选择延迟最低节点' },
  { id: 'round-robin', name: '轮询', desc: '依次轮流分配' },
  { id: 'weighted', name: '加权轮询', desc: '按权重比例分配' },
  { id: 'least-conn', name: '最少连接', desc: '选择当前连接数最少节点' },
  { id: 'random', name: '随机', desc: '随机选择可用节点' },
]

function simulate(nodes: GslbNode[], policy: Policy, round: number): string {
  const available = nodes.filter(n => n.available)
  if (!available.length) return '无可用节点'
  switch (policy) {
    case 'nearest':
      return available.reduce((a, b) => a.latency < b.latency ? a : b).name
    case 'round-robin':
      return available[round % available.length].name
    case 'weighted': {
      const total = available.reduce((s, n) => s + n.weight, 0)
      let r = (round * 37 + 13) % total
      for (const n of available) { r -= n.weight; if (r < 0) return n.name }
      return available[0].name
    }
    case 'least-conn':
      return available.reduce((a, b) => a.connections < b.connections ? a : b).name
    case 'random':
      return available[Math.floor(Math.abs(Math.sin(round * 7.3)) * available.length)].name
  }
}

export function GslbPolicySim() {
  const [nodes, setNodes] = useState<GslbNode[]>(NODES)
  const [rounds, setRounds] = useState<SimRound[]>([])
  const [simCount, setSimCount] = useState(10)

  const toggleNode = (id: string) =>
    setNodes(prev => prev.map(n => n.id === id ? { ...n, available: !n.available } : n))

  const run = useCallback(() => {
    const result: SimRound[] = []
    for (let i = 0; i < simCount; i++) {
      const r: Record<Policy, string> = {} as any
      for (const p of POLICIES) r[p.id] = simulate(nodes, p.id, i)
      result.push({ round: i + 1, results: r })
    }
    setRounds(result)
  }, [nodes, simCount])

  // 统计各策略的节点分布
  const stats: Record<Policy, Record<string, number>> = {} as any
  for (const p of POLICIES) {
    stats[p.id] = {}
    for (const r of rounds) {
      const node = r.results[p.id]
      stats[p.id][node] = (stats[p.id][node] || 0) + 1
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">GSLB 策略模拟</h1>
      <p className="text-gray-500 dark:text-gray-400">对比就近/轮询/加权/最少连接/随机五种调度策略的节点选择差异</p>

      {/* 节点配置 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">节点状态（点击切换可用/不可用）</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {nodes.map(n => (
            <button key={n.id} onClick={() => toggleNode(n.id)}
              className={`p-3 rounded-lg border-2 text-left transition-all ${
                n.available
                  ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/10'
                  : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30 opacity-50'
              }`}>
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{n.name}</div>
              <div className="text-xs text-gray-500 mt-0.5">W:{n.weight} L:{n.latency}ms C:{n.connections}</div>
              <div className={`text-xs mt-1 font-medium ${n.available ? 'text-green-500' : 'text-gray-400'}`}>
                {n.available ? '● 可用' : '○ 不可用'}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 控制 */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600 dark:text-gray-400">模拟请求数</label>
          <input type="number" min={1} max={50} value={simCount}
            onChange={e => setSimCount(Math.min(50, Math.max(1, parseInt(e.target.value) || 10)))}
            className="w-20 px-2 py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" />
        </div>
        <button onClick={run}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors">
          <Play className="w-4 h-4" />运行模拟
        </button>
        {rounds.length > 0 && (
          <button onClick={() => setRounds([])}
            className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg text-sm transition-colors hover:bg-gray-200">
            <RefreshCw className="w-3.5 h-3.5" />清除
          </button>
        )}
      </div>

      {rounds.length > 0 && (
        <div className="space-y-4">
          {/* 策略分布统计 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">各策略节点分布（{simCount} 次请求）</h2>
            <div className="space-y-3">
              {POLICIES.map(p => (
                <div key={p.id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{p.name}</span>
                    <span className="text-xs text-gray-400">{p.desc}</span>
                  </div>
                  <div className="flex gap-1 h-6">
                    {Object.entries(stats[p.id]).map(([node, count]) => {
                      const pct = Math.round((count / simCount) * 100)
                      const color = NODES.find(n => n.name === node)?.id
                      const colors: Record<string, string> = { sh: '#6366f1', bj: '#3b82f6', gz: '#10b981', sg: '#f59e0b' }
                      return (
                        <div key={node} className="flex items-center justify-center text-white text-xs font-medium rounded transition-all"
                          style={{ width: `${pct}%`, backgroundColor: colors[color || 'sh'] || '#6366f1' }}
                          title={`${node}: ${count}次 (${pct}%)`}>
                          {pct > 10 ? `${pct}%` : ''}
                        </div>
                      )
                    })}
                  </div>
                  <div className="flex gap-3 mt-1 flex-wrap">
                    {Object.entries(stats[p.id]).map(([node, count]) => (
                      <span key={node} className="text-xs text-gray-500">{node}: {count}次</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 逐轮结果 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300">逐请求调度结果</div>
            <div className="overflow-x-auto max-h-64 overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 dark:bg-gray-700/50 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left text-gray-500">#</th>
                    {POLICIES.map(p => <th key={p.id} className="px-3 py-2 text-left text-gray-500 whitespace-nowrap">{p.name}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {rounds.map(r => (
                    <tr key={r.round} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <td className="px-3 py-1.5 text-gray-400">{r.round}</td>
                      {POLICIES.map(p => (
                        <td key={p.id} className="px-3 py-1.5 text-gray-700 dark:text-gray-300 whitespace-nowrap">{r.results[p.id]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
