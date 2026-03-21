import React, { useState, useCallback } from 'react'
import { Zap, RefreshCw } from 'lucide-react'

interface Region {
  id: string
  name: string
  nodes: NodeOption[]
}

interface NodeOption {
  id: string
  name: string
  baseLatency: Record<string, number>
}

interface SimResult {
  sourceRegion: string
  selectedNode: string
  latency: number
  reason: string
  allLatencies: { node: string; latency: number; selected: boolean }[]
}

const REGIONS: Region[] = [
  {
    id: 'cn-east', name: '华东（上海）',
    nodes: [
      { id: 'sh1', name: '上海节点 SH1', baseLatency: { 'cn-east': 8, 'cn-north': 35, 'cn-south': 42, 'hk': 55, 'sea': 120, 'eu': 210, 'us': 230 } },
      { id: 'bj1', name: '北京节点 BJ1', baseLatency: { 'cn-east': 38, 'cn-north': 10, 'cn-south': 60, 'hk': 70, 'sea': 150, 'eu': 185, 'us': 200 } },
      { id: 'gz1', name: '广州节点 GZ1', baseLatency: { 'cn-east': 45, 'cn-north': 62, 'cn-south': 9, 'hk': 20, 'sea': 80, 'eu': 220, 'us': 240 } },
      { id: 'sg1', name: '新加坡 SG1', baseLatency: { 'cn-east': 118, 'cn-north': 148, 'cn-south': 78, 'hk': 35, 'sea': 12, 'eu': 160, 'us': 190 } },
      { id: 'eu1', name: '欧洲 EU1', baseLatency: { 'cn-east': 208, 'cn-north': 185, 'cn-south': 218, 'hk': 195, 'sea': 162, 'eu': 8, 'us': 95 } },
    ]
  }
]

const ALL_NODES = REGIONS[0].nodes

const SOURCE_REGIONS = [
  { id: 'cn-east', label: '华东（上海）' },
  { id: 'cn-north', label: '华北（北京）' },
  { id: 'cn-south', label: '华南（广州）' },
  { id: 'hk', label: '香港/台湾' },
  { id: 'sea', label: '东南亚' },
  { id: 'eu', label: '欧洲' },
  { id: 'us', label: '北美' },
]

type Policy = 'nearest' | 'round-robin' | 'weighted' | 'random'

const WEIGHTS: Record<string, number> = { sh1: 40, bj1: 30, gz1: 20, sg1: 7, eu1: 3 }

export function GslbLatencySim() {
  const [source, setSource] = useState('cn-east')
  const [policy, setPolicy] = useState<Policy>('nearest')
  const [result, setResult] = useState<SimResult | null>(null)
  const [jitter, setJitter] = useState(10)

  const simulate = useCallback(() => {
    const allLatencies = ALL_NODES.map(n => ({
      node: n.name,
      nodeId: n.id,
      latency: n.baseLatency[source] + Math.round((Math.random() - 0.5) * jitter * 2),
    }))

    let selected: typeof allLatencies[0]
    let reason = ''

    if (policy === 'nearest') {
      selected = allLatencies.reduce((a, b) => a.latency < b.latency ? a : b)
      reason = `就近策略：选择延迟最低节点（${selected.latency}ms）`
    } else if (policy === 'round-robin') {
      const idx = Math.floor(Math.random() * allLatencies.length)
      selected = allLatencies[idx]
      reason = `轮询策略：随机选择第 ${idx + 1} 个节点`
    } else if (policy === 'weighted') {
      const total = Object.values(WEIGHTS).reduce((s, w) => s + w, 0)
      let rand = Math.random() * total
      let wi = 0
      for (const item of allLatencies) {
        rand -= WEIGHTS[item.nodeId] || 1
        if (rand <= 0) { wi = allLatencies.indexOf(item); break }
      }
      selected = allLatencies[wi] || allLatencies[0]
      reason = `权重策略：按权重 ${WEIGHTS[selected.nodeId]}% 选中该节点`
    } else {
      const idx = Math.floor(Math.random() * allLatencies.length)
      selected = allLatencies[idx]
      reason = `随机策略：随机选中节点`
    }

    setResult({
      sourceRegion: SOURCE_REGIONS.find(r => r.id === source)?.label || source,
      selectedNode: selected.node,
      latency: selected.latency,
      reason,
      allLatencies: allLatencies.map(l => ({ node: l.node, latency: l.latency, selected: l.node === selected.node }))
    })
  }, [source, policy, jitter])

  const getLatencyColor = (ms: number) =>
    ms < 30 ? 'text-green-500' : ms < 80 ? 'text-yellow-500' : ms < 150 ? 'text-orange-500' : 'text-red-500'

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">GSLB 延迟调度模拟</h1>
      <p className="text-gray-500 dark:text-gray-400">模拟不同调度策略下的节点选择，比较就近/轮询/权重/随机的差异</p>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">客户端来源地区</label>
            <select value={source} onChange={e => setSource(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              {SOURCE_REGIONS.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">调度策略</label>
            <select value={policy} onChange={e => setPolicy(e.target.value as Policy)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="nearest">就近调度（最低延迟）</option>
              <option value="round-robin">轮询调度</option>
              <option value="weighted">权重调度</option>
              <option value="random">随机调度</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">网络抖动 ±{jitter}ms</label>
          <input type="range" min={0} max={50} value={jitter} onChange={e => setJitter(Number(e.target.value))}
            className="w-full accent-indigo-600" />
        </div>
        <button onClick={simulate}
          className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
          <Zap className="w-4 h-4" />模拟调度
        </button>
      </div>

      {result && (
        <div className="space-y-4">
          <div className="bg-indigo-50 dark:bg-indigo-900/10 border-2 border-indigo-200 dark:border-indigo-700 rounded-xl p-4">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{result.sourceRegion} 的请求被调度到：</div>
            <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{result.selectedNode}</div>
            <div className={`text-2xl font-black mt-1 ${getLatencyColor(result.latency)}`}>{result.latency}ms</div>
            <p className="text-xs text-gray-500 mt-2">{result.reason}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">所有节点延迟对比</h3>
            <div className="space-y-2">
              {result.allLatencies.sort((a, b) => a.latency - b.latency).map((item, i) => (
                <div key={i} className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
                  item.selected ? 'bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700' : ''
                }`}>
                  <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">
                    {item.selected && '▶ '}{item.node}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{
                        width: `${Math.min(100, (item.latency / 250) * 100)}%`,
                        backgroundColor: item.selected ? '#6366f1' : '#d1d5db'
                      }} />
                    </div>
                    <span className={`text-sm font-mono font-medium w-16 text-right ${item.selected ? getLatencyColor(item.latency) : 'text-gray-500'}`}>
                      {item.latency}ms
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
