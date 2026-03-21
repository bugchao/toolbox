import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Play, Pause, RotateCcw, Zap, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'

type NodeStatus = 'healthy' | 'degraded' | 'down'

interface GslbNode {
  id: string
  name: string
  region: string
  weight: number
  status: NodeStatus
  latency: number
  currentTraffic: number
  color: string
}

interface TrafficEvent {
  time: number
  message: string
  type: 'info' | 'warn' | 'error' | 'success'
}

const INITIAL_NODES: GslbNode[] = [
  { id: '1', name: '上海 SH1', region: 'cn-east', weight: 40, status: 'healthy', latency: 12, currentTraffic: 40, color: '#6366f1' },
  { id: '2', name: '北京 BJ1', region: 'cn-north', weight: 30, status: 'healthy', latency: 18, currentTraffic: 30, color: '#3b82f6' },
  { id: '3', name: '广州 GZ1', region: 'cn-south', weight: 20, status: 'healthy', latency: 22, currentTraffic: 20, color: '#10b981' },
  { id: '4', name: '海外 GL1', region: 'global', weight: 10, status: 'healthy', latency: 85, currentTraffic: 10, color: '#f59e0b' },
]

function redistributeTraffic(nodes: GslbNode[]): GslbNode[] {
  const active = nodes.filter(n => n.status !== 'down')
  const totalWeight = active.reduce((s, n) => s + (n.status === 'degraded' ? n.weight * 0.5 : n.weight), 0)
  return nodes.map(n => {
    if (n.status === 'down') return { ...n, currentTraffic: 0 }
    const effWeight = n.status === 'degraded' ? n.weight * 0.5 : n.weight
    return { ...n, currentTraffic: totalWeight > 0 ? Math.round((effWeight / totalWeight) * 100) : 0 }
  })
}

export function GslbFailoverSim() {
  const [nodes, setNodes] = useState<GslbNode[]>(INITIAL_NODES)
  const [events, setEvents] = useState<TrafficEvent[]>([
    { time: 0, message: '模拟启动，所有节点健康', type: 'info' }
  ])
  const [running, setRunning] = useState(false)
  const [tick, setTick] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const eventsRef = useRef(events)
  eventsRef.current = events

  const addEvent = useCallback((message: string, type: TrafficEvent['type']) => {
    setEvents(prev => [{ time: Date.now(), message, type }, ...prev].slice(0, 20))
  }, [])

  const toggleNodeStatus = useCallback((id: string) => {
    setNodes(prev => {
      const updated = prev.map(n => {
        if (n.id !== id) return n
        const next: NodeStatus = n.status === 'healthy' ? 'degraded' : n.status === 'degraded' ? 'down' : 'healthy'
        return { ...n, status: next }
      })
      const node = updated.find(n => n.id === id)!
      const statusLabel = node.status === 'down' ? '❌ 故障' : node.status === 'degraded' ? '⚠️ 降级' : '✅ 恢复'
      addEvent(`${node.name} 状态变更为 ${statusLabel}，流量重新分配`, node.status === 'down' ? 'error' : node.status === 'degraded' ? 'warn' : 'success')
      return redistributeTraffic(updated)
    })
  }, [addEvent])

  const reset = useCallback(() => {
    setRunning(false)
    setNodes(INITIAL_NODES)
    setTick(0)
    setEvents([{ time: 0, message: '已重置，所有节点恢复健康', type: 'info' }])
  }, [])

  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(() => setTick(t => t + 1), 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [running])

  const getStatusIcon = (status: NodeStatus) => {
    if (status === 'healthy') return <CheckCircle className="w-4 h-4 text-green-500" />
    if (status === 'degraded') return <AlertTriangle className="w-4 h-4 text-orange-500" />
    return <XCircle className="w-4 h-4 text-red-500" />
  }

  const getStatusLabel = (status: NodeStatus) =>
    status === 'healthy' ? '健康' : status === 'degraded' ? '降级' : '故障'

  const getStatusBg = (status: NodeStatus) =>
    status === 'healthy' ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/10'
    : status === 'degraded' ? 'border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/10'
    : 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/10 opacity-60'

  const totalTraffic = nodes.reduce((s, n) => s + n.currentTraffic, 0)

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">GSLB 故障切换模拟</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">点击节点状态按钮模拟故障，实时观察流量重新分配</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setRunning(r => !r)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              running ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}>
            {running ? <><Pause className="w-4 h-4" />暂停</> : <><Play className="w-4 h-4" />开始</>}
          </button>
          <button onClick={reset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 transition-colors">
            <RotateCcw className="w-4 h-4" />重置
          </button>
        </div>
      </div>

      {/* 流量分布总览条 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">实时流量分布</span>
          <span className="text-xs text-gray-400">运行时长: {tick}s</span>
        </div>
        <div className="h-8 flex rounded-lg overflow-hidden gap-0.5">
          {nodes.filter(n => n.currentTraffic > 0).map(n => (
            <div key={n.id}
              className="flex items-center justify-center text-white text-xs font-medium transition-all duration-700"
              style={{ width: `${n.currentTraffic}%`, backgroundColor: n.color }}
              title={`${n.name}: ${n.currentTraffic}%`}>
              {n.currentTraffic > 8 ? `${n.currentTraffic}%` : ''}
            </div>
          ))}
          {nodes.every(n => n.status === 'down') && (
            <div className="w-full flex items-center justify-center bg-red-200 dark:bg-red-900/30 text-red-600 text-xs font-medium">所有节点故障！</div>
          )}
        </div>
      </div>

      {/* 节点卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {nodes.map(n => (
          <div key={n.id} className={`rounded-xl border-2 p-4 transition-all duration-500 ${getStatusBg(n.status)}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {getStatusIcon(n.status)}
                <span className="font-medium text-gray-900 dark:text-gray-100">{n.name}</span>
              </div>
              <span className="text-xs text-gray-500">{n.region}</span>
            </div>
            <div className="flex items-center justify-between mb-3">
              <div className="text-center">
                <div className="text-2xl font-bold" style={{ color: n.color }}>{n.currentTraffic}%</div>
                <div className="text-xs text-gray-500">流量占比</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-700 dark:text-gray-300">{n.latency}ms</div>
                <div className="text-xs text-gray-500">延迟</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{getStatusLabel(n.status)}</div>
                <div className="text-xs text-gray-500">状态</div>
              </div>
            </div>
            <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-3">
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${n.currentTraffic}%`, backgroundColor: n.color }} />
            </div>
            <button onClick={() => toggleNodeStatus(n.id)}
              className="w-full py-1.5 text-xs font-medium rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              {n.status === 'healthy' ? '模拟降级' : n.status === 'degraded' ? '模拟故障' : '恢复节点'}
            </button>
          </div>
        ))}
      </div>

      {/* 事件日志 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
          <Zap className="w-4 h-4 text-indigo-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">事件日志</span>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-48 overflow-y-auto">
          {events.map((e, i) => (
            <div key={i} className="flex items-start gap-2 px-4 py-2">
              <span className={`text-xs mt-0.5 shrink-0 ${
                e.type === 'error' ? 'text-red-500' : e.type === 'warn' ? 'text-orange-500' : e.type === 'success' ? 'text-green-500' : 'text-gray-400'
              }`}>●</span>
              <span className="text-sm text-gray-700 dark:text-gray-300">{e.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
