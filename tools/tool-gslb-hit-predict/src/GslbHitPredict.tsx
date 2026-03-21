import React, { useState } from 'react'
import { Target } from 'lucide-react'

interface GeoPool {
  id: string
  region: string
  population: number // 万人
  internetRate: number // %
  targetNode: string
  latency: number
}

const NODES = [
  { id: 'sh1', name: '上海 SH1', color: '#6366f1' },
  { id: 'bj1', name: '北京 BJ1', color: '#3b82f6' },
  { id: 'gz1', name: '广州 GZ1', color: '#10b981' },
  { id: 'sg1', name: '新加坡 SG1', color: '#f59e0b' },
]

const DEFAULT_POOLS: GeoPool[] = [
  { id: '1', region: '华东', population: 23000, internetRate: 78, targetNode: 'sh1', latency: 8 },
  { id: '2', region: '华北', population: 18000, internetRate: 75, targetNode: 'bj1', latency: 10 },
  { id: '3', region: '华南', population: 17000, internetRate: 80, targetNode: 'gz1', latency: 9 },
  { id: '4', region: '西部', population: 38000, internetRate: 55, targetNode: 'sh1', latency: 35 },
  { id: '5', region: '港澳台/海外', population: 800, internetRate: 90, targetNode: 'sg1', latency: 28 },
]

export function GslbHitPredict() {
  const [pools, setPools] = useState<GeoPool[]>(DEFAULT_POOLS)
  const [dau, setDau] = useState(100000) // 日活
  const [peakFactor, setPeakFactor] = useState(5) // 峰值系数（每天8小时峰值，集中在高峰时段）

  // 各地区互联网用户比例
  const totalInternetUsers = pools.reduce((s, p) => s + p.population * (p.internetRate / 100), 0)

  const stats = pools.map(p => {
    const internetUsers = p.population * (p.internetRate / 100)
    const hitRatio = internetUsers / totalInternetUsers
    const dailyHits = Math.round(dau * hitRatio)
    const avgQps = Math.round(dailyHits / 86400)
    const peakQps = Math.round(avgQps * peakFactor)
    const node = NODES.find(n => n.id === p.targetNode)
    return { ...p, internetUsers, hitRatio, dailyHits, avgQps, peakQps, node }
  })

  const updatePool = (id: string, field: keyof GeoPool, value: any) =>
    setPools(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p))

  // 节点汇总
  const nodeSummary = NODES.map(node => {
    const nodeStats = stats.filter(s => s.targetNode === node.id)
    return {
      ...node,
      totalDailyHits: nodeStats.reduce((s, p) => s + p.dailyHits, 0),
      totalPeakQps: nodeStats.reduce((s, p) => s + p.peakQps, 0),
      regions: nodeStats.map(s => s.region),
    }
  }).filter(n => n.regions.length > 0)

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">解析命中预测</h1>
      <p className="text-gray-500 dark:text-gray-400">根据地区人口和互联网渗透率预测各节点的解析命中数和 QPS</p>

      {/* 参数 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">日活用户数 (DAU)</label>
            <input type="number" min={1000} value={dau} onChange={e => setDau(parseInt(e.target.value) || 10000)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">峰值 QPS 系数</label>
            <input type="number" min={1} max={20} step={0.5} value={peakFactor}
              onChange={e => setPeakFactor(parseFloat(e.target.value) || 1)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
        </div>
      </div>

      {/* 地区预测表 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300">地区命中预测</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                {['地区', '目标节点', '命中比例', '日命中数', '平均QPS', '峰值QPS'].map(h => (
                  <th key={h} className="px-4 py-2 text-left text-xs font-medium text-gray-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {stats.map(s => (
                <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="px-4 py-2.5 font-medium text-gray-900 dark:text-gray-100">{s.region}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.node?.color }} />
                      <span className="text-gray-700 dark:text-gray-300">{s.node?.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-indigo-500" style={{ width: `${Math.round(s.hitRatio * 100)}%` }} />
                      </div>
                      <span className="text-gray-600 dark:text-gray-400">{(s.hitRatio * 100).toFixed(1)}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-gray-700 dark:text-gray-300">{s.dailyHits.toLocaleString()}</td>
                  <td className="px-4 py-2.5 font-mono text-gray-700 dark:text-gray-300">{s.avgQps}</td>
                  <td className="px-4 py-2.5 font-mono font-medium text-orange-500">{s.peakQps}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 节点汇总 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {nodeSummary.map(n => (
          <div key={n.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: n.color }} />
              <span className="font-semibold text-gray-900 dark:text-gray-100">{n.name}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><div className="text-xs text-gray-500">日命中</div><div className="font-bold text-gray-900 dark:text-gray-100">{n.totalDailyHits.toLocaleString()}</div></div>
              <div><div className="text-xs text-gray-500">峰值QPS</div><div className="font-bold text-orange-500">{n.totalPeakQps}</div></div>
            </div>
            <div className="mt-2 text-xs text-gray-500">覆盖: {n.regions.join('、')}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
