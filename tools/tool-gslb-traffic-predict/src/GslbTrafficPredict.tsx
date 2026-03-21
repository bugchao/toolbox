import React, { useState, useCallback } from 'react'
import { TrendingUp } from 'lucide-react'

interface NodeConfig {
  id: string
  name: string
  weight: number
  capacity: number
  color: string
}

const COLORS = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ec4899']

let nid = 0
const nextId = () => String(++nid)

export function GslbTrafficPredict() {
  const [nodes, setNodes] = useState<NodeConfig[]>([
    { id: nextId(), name: '上海 SH1', weight: 40, capacity: 10000, color: COLORS[0] },
    { id: nextId(), name: '北京 BJ1', weight: 30, capacity: 8000, color: COLORS[1] },
    { id: nextId(), name: '广州 GZ1', weight: 20, capacity: 6000, color: COLORS[2] },
    { id: nextId(), name: '海外 GL1', weight: 10, capacity: 3000, color: COLORS[3] },
  ])
  const [totalQps, setTotalQps] = useState(5000)
  const [peakMultiplier, setPeakMultiplier] = useState(3)

  const totalWeight = nodes.reduce((s, n) => s + n.weight, 0)

  const predictions = nodes.map(n => {
    const ratio = totalWeight > 0 ? n.weight / totalWeight : 0
    const normalQps = Math.round(totalQps * ratio)
    const peakQps = Math.round(totalQps * peakMultiplier * ratio)
    const utilization = Math.min(100, Math.round((normalQps / n.capacity) * 100))
    const peakUtil = Math.min(100, Math.round((peakQps / n.capacity) * 100))
    const overloaded = peakQps > n.capacity
    return { ...n, ratio, normalQps, peakQps, utilization, peakUtil, overloaded }
  })

  const updateNode = (id: string, field: keyof NodeConfig, value: any) =>
    setNodes(prev => prev.map(n => n.id === id ? { ...n, [field]: value } : n))

  const getUtilColor = (pct: number) =>
    pct > 90 ? '#ef4444' : pct > 70 ? '#f59e0b' : '#10b981'

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">多节点流量预测</h1>
      <p className="text-gray-500 dark:text-gray-400">根据权重分配预测各节点正常/峰值流量，检测容量瓶颈</p>

      {/* 全局配置 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">流量参数</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">总 QPS（正常峰值）</label>
            <input type="number" min={1} value={totalQps} onChange={e => setTotalQps(parseInt(e.target.value) || 1000)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">峰值倍数（如促销/突发）</label>
            <input type="number" min={1} max={20} step={0.5} value={peakMultiplier}
              onChange={e => setPeakMultiplier(parseFloat(e.target.value) || 1)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
        </div>
      </div>

      {/* 节点配置 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300">节点配置</div>
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {nodes.map(n => (
            <div key={n.id} className="px-4 py-3 grid grid-cols-12 gap-2 items-center">
              <div className="col-span-1">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: n.color }} />
              </div>
              <div className="col-span-3">
                <input value={n.name} onChange={e => updateNode(n.id, 'name', e.target.value)}
                  className="w-full px-2 py-1 text-sm rounded border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
              </div>
              <div className="col-span-3 flex items-center gap-1">
                <span className="text-xs text-gray-500">权重</span>
                <input type="number" min={1} max={100} value={n.weight}
                  onChange={e => updateNode(n.id, 'weight', parseInt(e.target.value) || 1)}
                  className="w-full px-2 py-1 text-sm rounded border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
              </div>
              <div className="col-span-4 flex items-center gap-1">
                <span className="text-xs text-gray-500">容量QPS</span>
                <input type="number" min={100} value={n.capacity}
                  onChange={e => updateNode(n.id, 'capacity', parseInt(e.target.value) || 1000)}
                  className="w-full px-2 py-1 text-sm rounded border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
              </div>
              <div className="col-span-1 text-xs text-gray-400 text-right">
                {Math.round((n.weight / totalWeight) * 100)}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 预测结果 */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">流量预测结果</h2>
        {predictions.map(p => (
          <div key={p.id} className={`bg-white dark:bg-gray-800 rounded-xl border-2 p-4 ${
            p.overloaded ? 'border-red-300 dark:border-red-700' : 'border-gray-200 dark:border-gray-700'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                <span className="font-medium text-gray-900 dark:text-gray-100">{p.name}</span>
                {p.overloaded && <span className="text-xs px-1.5 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 rounded font-medium">⚠️ 峰值超载</span>}
              </div>
              <span className="text-xs text-gray-400">权重 {p.weight} ({Math.round(p.ratio * 100)}%)</span>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-1">正常 QPS</div>
                <div className="text-xl font-bold text-gray-900 dark:text-gray-100">{p.normalQps.toLocaleString()}</div>
                <div className="mt-1.5 h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${p.utilization}%`, backgroundColor: getUtilColor(p.utilization) }} />
                </div>
                <div className="text-xs mt-1" style={{ color: getUtilColor(p.utilization) }}>容量利用率 {p.utilization}%</div>
              </div>
              <div className={`rounded-lg p-3 ${
                p.overloaded ? 'bg-red-50 dark:bg-red-900/10' : 'bg-gray-50 dark:bg-gray-700/50'
              }`}>
                <div className="text-xs text-gray-500 mb-1">峰值 QPS (×{peakMultiplier})</div>
                <div className={`text-xl font-bold ${p.overloaded ? 'text-red-500' : 'text-gray-900 dark:text-gray-100'}`}>
                  {p.peakQps.toLocaleString()}
                </div>
                <div className="mt-1.5 h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${Math.min(100, p.peakUtil)}%`, backgroundColor: getUtilColor(p.peakUtil) }} />
                </div>
                <div className="text-xs mt-1" style={{ color: getUtilColor(p.peakUtil) }}>容量利用率 {p.peakUtil}%</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {predictions.some(p => p.overloaded) && (
        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl p-4 text-sm text-red-600 dark:text-red-400">
          ⚠️ 部分节点在峰值场景下将超载，建议提升节点容量或调整权重分配，将更多流量导向高容量节点。
        </div>
      )}
    </div>
  )
}
