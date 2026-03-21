import React, { useState, useCallback } from 'react'
import { Plus, Trash2 } from 'lucide-react'

interface Node {
  id: string
  name: string
  weight: number
  region: string
  enabled: boolean
}

export function GslbWeightCalc() {
  const [nodes, setNodes] = useState<Node[]>([
    { id: '1', name: '上海节点', weight: 40, region: 'cn-east', enabled: true },
    { id: '2', name: '北京节点', weight: 30, region: 'cn-north', enabled: true },
    { id: '3', name: '广州节点', weight: 20, region: 'cn-south', enabled: true },
    { id: '4', name: '海外节点', weight: 10, region: 'global', enabled: true },
  ])
  const [requests, setRequests] = useState(10000)

  const updateNode = (id: string, field: keyof Node, value: string | number | boolean) =>
    setNodes(prev => prev.map(n => n.id === id ? { ...n, [field]: value } : n))

  const addNode = () => setNodes(prev => [
    ...prev,
    { id: Date.now().toString(), name: `节点 ${prev.length + 1}`, weight: 10, region: '', enabled: true }
  ])

  const removeNode = (id: string) => setNodes(prev => prev.filter(n => n.id !== id))

  const enabledNodes = nodes.filter(n => n.enabled)
  const totalWeight = enabledNodes.reduce((s, n) => s + n.weight, 0)

  const getPercent = (weight: number) => totalWeight > 0 ? (weight / totalWeight * 100).toFixed(1) : '0.0'
  const getRequests = (weight: number) => totalWeight > 0 ? Math.round(weight / totalWeight * requests) : 0

  const COLORS = ['bg-indigo-500', 'bg-blue-500', 'bg-green-500', 'bg-orange-500', 'bg-pink-500', 'bg-purple-500']

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">GSLB 权重分配计算器</h1>
      <p className="text-gray-500 dark:text-gray-400">配置多节点权重，预测流量分配比例和请求数</p>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 shrink-0">模拟总请求数</label>
          <input type="number" value={requests} onChange={e => setRequests(parseInt(e.target.value) || 0)}
            className="w-36 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>

        <div className="space-y-2">
          <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 px-1">
            <span className="col-span-1">启用</span>
            <span className="col-span-4">节点名称</span>
            <span className="col-span-3">地区标识</span>
            <span className="col-span-3">权重</span>
            <span className="col-span-1"></span>
          </div>
          {nodes.map((node, idx) => (
            <div key={node.id} className="grid grid-cols-12 gap-2 items-center">
              <input type="checkbox" checked={node.enabled} onChange={e => updateNode(node.id, 'enabled', e.target.checked)}
                className="col-span-1 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500" />
              <input value={node.name} onChange={e => updateNode(node.id, 'name', e.target.value)}
                className="col-span-4 px-2 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              <input value={node.region} onChange={e => updateNode(node.id, 'region', e.target.value)}
                placeholder="cn-east"
                className="col-span-3 px-2 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              <input type="number" value={node.weight} onChange={e => updateNode(node.id, 'weight', parseInt(e.target.value) || 0)}
                min={0}
                className="col-span-3 px-2 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              <button onClick={() => removeNode(node.id)} disabled={nodes.length === 1}
                className="col-span-1 flex justify-center text-gray-400 hover:text-red-500 disabled:opacity-30 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        <button onClick={addNode}
          className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors">
          <Plus className="w-4 h-4" /> 添加节点
        </button>
      </div>

      {totalWeight > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">流量分配预测</h2>

          {/* 流量条 */}
          <div className="h-8 flex rounded-lg overflow-hidden">
            {enabledNodes.map((node, idx) => (
              <div
                key={node.id}
                className={`${COLORS[idx % COLORS.length]} flex items-center justify-center text-white text-xs font-medium transition-all`}
                style={{ width: `${getPercent(node.weight)}%` }}
                title={`${node.name}: ${getPercent(node.weight)}%`}
              >
                {parseFloat(getPercent(node.weight)) > 8 ? `${getPercent(node.weight)}%` : ''}
              </div>
            ))}
          </div>

          {/* 节点详情 */}
          <div className="space-y-2">
            {enabledNodes.map((node, idx) => (
              <div key={node.id} className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-sm shrink-0 ${COLORS[idx % COLORS.length]}`} />
                <span className="flex-1 text-sm text-gray-800 dark:text-gray-200">{node.name}</span>
                {node.region && <span className="text-xs text-gray-400 font-mono">{node.region}</span>}
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-14 text-right">{getPercent(node.weight)}%</span>
                <span className="text-sm text-indigo-600 dark:text-indigo-400 w-20 text-right font-mono">{getRequests(node.weight).toLocaleString()} 次</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 text-right">权重总和：{totalWeight} · 模拟请求：{requests.toLocaleString()}</p>
        </div>
      )}
    </div>
  )
}
