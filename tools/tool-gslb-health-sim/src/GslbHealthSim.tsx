import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Play, Pause, RotateCcw, Heart, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'

interface HealthNode {
  id: string
  name: string
  endpoint: string
  status: 'up' | 'down' | 'checking'
  latency: number
  successRate: number
  consecutiveFails: number
  checkCount: number
}

interface HealthConfig {
  interval: number
  timeout: number
  threshold: number
  method: 'HTTP' | 'TCP' | 'PING'
}

const INITIAL_NODES: HealthNode[] = [
  { id: '1', name: '节点 A', endpoint: 'http://node-a.example.com/health', status: 'up', latency: 45, successRate: 99, consecutiveFails: 0, checkCount: 0 },
  { id: '2', name: '节点 B', endpoint: 'http://node-b.example.com/health', status: 'up', latency: 78, successRate: 98, consecutiveFails: 0, checkCount: 0 },
  { id: '3', name: '节点 C', endpoint: 'http://node-c.example.com/health', status: 'up', latency: 120, successRate: 95, consecutiveFails: 0, checkCount: 0 },
]

export function GslbHealthSim() {
  const [nodes, setNodes] = useState<HealthNode[]>(INITIAL_NODES)
  const [config, setConfig] = useState<HealthConfig>({ interval: 3, timeout: 2, threshold: 3, method: 'HTTP' })
  const [running, setRunning] = useState(false)
  const [tick, setTick] = useState(0)
  const [log, setLog] = useState<{ time: string; msg: string; type: string }[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const addLog = (msg: string, type = 'info') => {
    const time = new Date().toLocaleTimeString('zh-CN', { hour12: false })
    setLog(prev => [{ time, msg, type }, ...prev].slice(0, 30))
  }

  const runCheck = useCallback(() => {
    setNodes(prev => prev.map(node => {
      if (node.status === 'down' && Math.random() < 0.15) {
        addLog(`${node.name} 健康检查恢复正常`, 'success')
        return { ...node, status: 'up', consecutiveFails: 0, checkCount: node.checkCount + 1 }
      }
      const jitter = (Math.random() - 0.5) * 30
      const newLatency = Math.max(10, Math.round(node.latency + jitter))
      const failChance = node.status === 'down' ? 0 : 0.08
      const failed = Math.random() < failChance
      const newFails = failed ? node.consecutiveFails + 1 : 0
      const goDown = newFails >= config.threshold
      if (goDown && node.status === 'up') {
        addLog(`${node.name} 连续失败 ${newFails} 次，标记为 DOWN`, 'error')
      } else if (failed) {
        addLog(`${node.name} 检查失败 (${newFails}/${config.threshold})`, 'warn')
      }
      return {
        ...node,
        latency: newLatency,
        consecutiveFails: newFails,
        status: goDown ? 'down' : node.status,
        checkCount: node.checkCount + 1,
        successRate: Math.max(0, Math.min(100, node.successRate + (failed ? -0.5 : 0.1)))
      }
    }))
    setTick(t => t + 1)
  }, [config.threshold])

  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(runCheck, config.interval * 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [running, runCheck, config.interval])

  const reset = () => {
    setRunning(false)
    setNodes(INITIAL_NODES)
    setTick(0)
    setLog([])
  }

  const forceDown = (id: string) => {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, status: 'down', consecutiveFails: config.threshold } : n))
    const node = nodes.find(n => n.id === id)
    if (node) addLog(`手动将 ${node.name} 标记为 DOWN`, 'error')
  }

  const forceUp = (id: string) => {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, status: 'up', consecutiveFails: 0 } : n))
    const node = nodes.find(n => n.id === id)
    if (node) addLog(`手动恢复 ${node.name} 为 UP`, 'success')
  }

  const upCount = nodes.filter(n => n.status === 'up').length

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">GSLB 健康检查模拟</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">模拟 GSLB 健康探测，连续失败超过阈值则下线节点</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setRunning(r => !r)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              running ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700' : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}>
            {running ? <><Pause className="w-4 h-4" />暂停</> : <><Play className="w-4 h-4" />开始</>}
          </button>
          <button onClick={reset} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 配置 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          {[
            { label: '检测间隔 (s)', key: 'interval', min: 1, max: 30 },
            { label: '超时 (s)', key: 'timeout', min: 1, max: 10 },
            { label: '失败阈值', key: 'threshold', min: 1, max: 10 },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-xs text-gray-500 mb-1">{f.label}</label>
              <input type="number" min={f.min} max={f.max}
                value={(config as any)[f.key]}
                onChange={e => setConfig(c => ({ ...c, [f.key]: parseInt(e.target.value) || f.min }))}
                className="w-full px-2 py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" />
            </div>
          ))}
          <div>
            <label className="block text-xs text-gray-500 mb-1">检测方式</label>
            <select value={config.method} onChange={e => setConfig(c => ({ ...c, method: e.target.value as any }))}
              className="w-full px-2 py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500">
              <option>HTTP</option><option>TCP</option><option>PING</option>
            </select>
          </div>
        </div>
      </div>

      {/* 状态概览 */}
      <div className="flex items-center gap-3 text-sm">
        <Heart className="w-4 h-4 text-red-500" />
        <span className="text-gray-600 dark:text-gray-400">在线节点: <strong className="text-green-500">{upCount}/{nodes.length}</strong></span>
        <span className="text-gray-400">|</span>
        <span className="text-gray-600 dark:text-gray-400">检测轮次: <strong>{tick}</strong></span>
      </div>

      {/* 节点卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {nodes.map(node => (
          <div key={node.id} className={`rounded-xl border-2 p-4 transition-all duration-300 ${
            node.status === 'up' ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10'
            : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10 opacity-75'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-gray-900 dark:text-gray-100">{node.name}</span>
              {node.status === 'up'
                ? <CheckCircle className="w-4 h-4 text-green-500" />
                : <XCircle className="w-4 h-4 text-red-500" />}
            </div>
            <div className="text-xs text-gray-500 font-mono mb-2 truncate">{node.endpoint}</div>
            <div className="grid grid-cols-2 gap-1 text-xs mb-3">
              <div><span className="text-gray-500">延迟: </span><span className="font-mono font-medium text-gray-700 dark:text-gray-300">{node.latency}ms</span></div>
              <div><span className="text-gray-500">成功率: </span><span className="font-mono font-medium text-green-600">{node.successRate.toFixed(1)}%</span></div>
              <div><span className="text-gray-500">连续失败: </span><span className={`font-mono font-medium ${node.consecutiveFails > 0 ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'}`}>{node.consecutiveFails}</span></div>
              <div><span className="text-gray-500">检测次数: </span><span className="font-mono font-medium text-gray-700 dark:text-gray-300">{node.checkCount}</span></div>
            </div>
            <button onClick={() => node.status === 'up' ? forceDown(node.id) : forceUp(node.id)}
              className="w-full py-1 text-xs font-medium rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              {node.status === 'up' ? '手动下线' : '手动恢复'}
            </button>
          </div>
        ))}
      </div>

      {/* 日志 */}
      {log.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-500">检测日志</div>
          <div className="max-h-40 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
            {log.map((l, i) => (
              <div key={i} className="flex gap-2 px-4 py-1.5">
                <span className="text-xs font-mono text-gray-400 shrink-0">{l.time}</span>
                <span className={`text-xs ${
                  l.type === 'error' ? 'text-red-500' : l.type === 'warn' ? 'text-orange-500' : l.type === 'success' ? 'text-green-500' : 'text-gray-600 dark:text-gray-400'
                }`}>{l.msg}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
